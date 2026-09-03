import { db } from "@/db";
import { auditLogsTable, giftsTable } from "@/db/schemas";
import { requireAdmin } from "@/lib/admin";
import { handleServerErrors, ViraError } from "@/lib/error";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { logToDiscord } from "@/lib/api/utils/discordLog";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const adminId = await requireAdmin();
    const { id } = await params;

    const [gift] = await db
      .select({ id: giftsTable.id, code: giftsTable.code })
      .from(giftsTable)
      .where(eq(giftsTable.id, id));
    if (!gift) throw new ViraError("Gift not found", 404);

    await db
      .update(giftsTable)
      .set({ status: "revoked" })
      .where(eq(giftsTable.id, id));

    await db.insert(auditLogsTable).values({
      action: "gift_revoke",
      performedBy: adminId,
    });

    void logToDiscord({
      title: "⚙️ Admin: gift revoked",
      color: "warning",
      fields: [
        { name: "Code", value: gift.code, inline: true },
        { name: "By", value: adminId, inline: true },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleServerErrors(error);
  }
}
