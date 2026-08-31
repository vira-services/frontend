import { db } from "@/db";
import {
  configsTable,
  backgroundsTable,
  audiosTable,
  linksTable,
  widgetsTable,
  badgesTable,
  usersTable,
} from "@/db/schemas";
import { getSession } from "@/lib/auth";
import { handleServerErrors, ViraError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { configSchema } from "@/lib/validation/zod";
export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) throw new ViraError("Unauthorized", 401);
    const body = await req.json();
    const parsed = configSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }
    const { backgrounds, audios, links, badges, widgets, ...configData } =
      parsed.data;
    if (Object.keys(configData).length > 0) {
      const cleanedConfigData = Object.fromEntries(
        Object.entries(configData).filter(([, value]) => value !== undefined),
      );
      const premiumFields = [
        "meta_title",
        "meta_description",
        "meta_color",
      ] as const;
      const touchesPremiumField = premiumFields.some(
        (field) => cleanedConfigData[field] !== undefined,
      );
      if (touchesPremiumField) {
        const [user] = await db
          .select({
            premium: usersTable.premium,
          })
          .from(usersTable)
          .where(eq(usersTable.id, session.userId));
        if (!user?.premium) {
          throw new ViraError(
            "Premium subscription required to edit meta fields",
            403,
          );
        }
      }
      await db
        .update(configsTable)
        .set({ ...cleanedConfigData, updated_at: new Date() })
        .where(eq(configsTable.userId, session.userId));
    }
    if (backgrounds && backgrounds.length > 0) {
      for (const bg of backgrounds) {
        await db
          .update(backgroundsTable)
          .set({ position: bg.position })
          .where(eq(backgroundsTable.id, bg.id));
      }
    }
    if (audios && audios.length > 0) {
      for (const audio of audios) {
        await db
          .update(audiosTable)
          .set({ position: audio.position })
          .where(eq(audiosTable.id, audio.id));
      }
    }
    if (links && links.length > 0) {
      for (const link of links) {
        await db
          .update(linksTable)
          .set({ position: link.position, enabled: link.enabled })
          .where(eq(linksTable.id, link.id));
      }
    }
    if (badges && badges.length > 0) {
      for (const badge of badges) {
        await db
          .update(badgesTable)
          .set({
            position: badge.position,
            icon_color: badge.icon_color,
            enabled: badge.enabled,
          })
          .where(eq(badgesTable.id, badge.id));
      }
    }
    if (widgets && widgets.length > 0) {
      for (const widget of widgets) {
        await db
          .update(widgetsTable)
          .set({ position: widget.position })
          .where(eq(widgetsTable.id, widget.id));
      }
    }
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleServerErrors(error);
  }
}
