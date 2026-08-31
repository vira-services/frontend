"use client";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  IconUpload,
  IconPencil,
  IconTrash,
  IconLoader2,
} from "@tabler/icons-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

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

export default function DiscordEmbed({
  className,
  title,
  sitemap,
  sitemap_url,
  author,
  author_url,
  description,
  timestamp,
  color,
  image_size,
  image,
  onImageChange,
  // file,
  // this is used for vars
  user,
  config,
}: {
  title: string | null;
  sitemap: string | null;
  sitemap_url: string | null;
  author: string | null;
  author_url: string | null;
  description: string | null;
  timestamp: boolean;
  color: string;
  className?: string;
  image_size: "Large" | "Small";
  image: string;
  onImageChange?: (url: string | null) => void;
  // file?: {
  //   id: string;
  //   name: string;
  //   size: number;
  //   uploadAt: string | Date;
  // } | null;
  user: {
    id: string;
    username: string;
    uid: number;
  };
  config: {
    description: string | null;
    location: string | null;
    display_name: string | null;
  };
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const variables: Record<string, string> = {
    "user.id": user?.id ?? "123456",
    "user.name": user?.username ?? "rose",
    description: stripHtml(
      config?.description ?? "Check out my vira.wtf profile!",
    ),
    location: config?.location ?? "",
    display_name: config?.display_name ?? "",
    // "file.id": file?.id ?? "abc123",
    // "file.name": file?.name ?? "screenshot.png",
    // "file.size": formatBytes(file?.size ?? 1200000),
    // "file.uploadAt": file?.uploadAt
    //   ? new Date(file.uploadAt).toLocaleString()
    //   : new Date().toLocaleString(),
  };

  const resolve = (text: string | null): string | null => {
    if (!text) return text;
    const stripped = stripHtml(text);
    return stripped.replace(
      /\{(\w+(?:\.\w+)?)\}/g,
      (_, key) => variables[key] ?? `{${key}}`,
    );
  };

  const resolvedImage = image ?? "";
  const isSmallImage = image_size === "Small";
  const isLargeImage = image_size === "Large";
  const isR2Image = resolvedImage.startsWith("https://r2.vira.wtf");

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload/og", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const url = await res.text();
      onImageChange?.(url);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(true);
    try {
      const res = await fetch("/api/upload/og", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      onImageChange?.(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const busy = isUploading || isDeleting;

  return (
    <div
      className={cn(
        className,
        "h-full w-full border-l-8 bg-[#313338] rounded-lg",
      )}
      style={{ borderColor: color }}
    >
      <div className="flex flex-col gap-1 px-6 py-4 h-full">
        <span className="font-medium text-white wrap-break-word text-sm">
          {resolve(sitemap)}
        </span>
        {/*<div className="flex flex-col gap-1">
          <span className="font-medium text-white wrap-break-word text-sm">
            {resolve(sitemap)}
          </span>
          <span className="font-medium text-white wrap-break-word text-sm">
            {resolve(author)}
          </span>
        </div>*/}
        <div
          className={cn("flex", isSmallImage ? "flex-row gap-4" : "flex-col")}
        >
          <div className="flex-1">
            {title ? (
              <h1 className="text-blue-400 text-lg font-semibold">
                {resolve(title)}
              </h1>
            ) : (
              <></>
            )}
            {description ? (
              <p className="text-sm leading-relaxed mb-3 whitespace-pre-wrap wrap-break-word text-foreground">
                {resolve(description)}
              </p>
            ) : (
              <></>
            )}
          </div>
          {isSmallImage && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="group relative shrink-0 w-20 h-20 rounded overflow-hidden self-start cursor-pointer"
            >
              <Image
                alt="Embed thumbnail"
                width={80}
                height={80}
                src={resolvedImage}
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/60 transition-colors">
                {isUploading ? (
                  <IconLoader2 size={18} className="text-white animate-spin" />
                ) : (
                  <IconUpload
                    size={18}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            </button>
          )}
        </div>
        {isLargeImage && (
          <div className="relative mt-2 w-full aspect-[400/160] rounded overflow-hidden shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={busy}
              className="group absolute inset-0 w-full h-full cursor-pointer"
            >
              <Image
                alt="Embed image"
                src={resolvedImage}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-black/0 group-hover:bg-black/60 transition-colors">
                {isUploading ? (
                  <IconLoader2 size={24} className="text-white animate-spin" />
                ) : (
                  <>
                    <IconUpload
                      size={24}
                      className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="text-xs font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      Upload image
                    </span>
                  </>
                )}
              </div>
              {isR2Image && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size={"icon-sm"}
                    variant={"outline"}
                    onClick={handleDelete}
                  >
                    {isDeleting ? (
                      <IconLoader2 size={14} className="animate-spin" />
                    ) : (
                      <IconTrash size={14} />
                    )}
                  </Button>
                </div>
              )}
            </button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        {timestamp && (
          <p className="text-xs text-white/70 leading-relaxed py-2 whitespace-pre-wrap wrap-break-word">
            {new Date().toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}
