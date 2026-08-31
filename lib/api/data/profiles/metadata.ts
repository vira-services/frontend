import { db } from "@/db";
import { configsTable, usersTable } from "@/db/schemas";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import type { Metadata } from "next";

const ENTITY_MAP: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&nbsp;": " ",
};

function stripHtml(html: string): string {
  return html
    .replace(/<(p|hr|br)[^>]*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;|&apos;|&nbsp;/g,
      (match) => ENTITY_MAP[match] ?? match,
    )
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ url: string }>;
}): Promise<Metadata> {
  const { url } = await params;
  const [user] = await db
    .select({
      id: usersTable.id,
      url: usersTable.url,
      username: usersTable.username,
      config: {
        avatar_url: configsTable.avatar_url,
        description: configsTable.description,
        meta_title: configsTable.meta_title,
        meta_description: configsTable.meta_description,
        meta_color: configsTable.meta_color,
        meta_size: configsTable.meta_size,
        meta_image: configsTable.meta_image,
        location: configsTable.location,
        display_name: configsTable.display_name,
      },
    })
    .from(usersTable)
    .innerJoin(configsTable, eq(configsTable.userId, usersTable.id))
    .where(eq(usersTable.url, url));

  if (!user) {
    console.log("No user found for URL:", url);
    return {
      title: "Not Found | vira.wtf",
      description: "Profile not found",
    };
  }

  const strippedDescription = stripHtml(user.config.description ?? "");

  const variables: Record<string, string> = {
    "user.id": String(user.id),
    "user.name": user.username,
    description: strippedDescription,
    location: user.config.location ?? "",
    display_name: user.config.display_name ?? "",
  };

  const resolve = (text: string | null): string => {
    if (!text) return "";
    const stripped = stripHtml(text);
    return stripped.replace(
      /\{(\w+(?:\.\w+)?)\}/g,
      (_, key) => variables[key] ?? `{${key}}`,
    );
  };

  const title = user.config.meta_title
    ? resolve(user.config.meta_title)
    : user.username;
  const description = user.config.meta_description
    ? resolve(user.config.meta_description)
    : strippedDescription;

  const headersList = await headers();
  const host = headersList.get("host") ?? "vira.wtf";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;
  const ogImageUrl = user.config.meta_image || `${baseUrl}/api/og/${url}`;

  const isLarge = user.config.meta_size === "Large";
  const imageWidth = isLarge ? 1200 : 600;
  const imageHeight = isLarge ? 630 : 315;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      url: `${baseUrl}/${url}`,
      images: [
        {
          url: ogImageUrl,
          width: imageWidth,
          height: imageHeight,
          alt: `${user.username}'s profile image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}
