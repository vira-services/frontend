const COLORS = {
  success: 0x22c55e,
  info: 0x6366f1,
  warning: 0xf59e0b,
  danger: 0xef4444,
} as const;

type EmbedField = { name: string; value: string; inline?: boolean };

export async function logToDiscord({
  title,
  description,
  color = "info",
  fields,
}: {
  title: string;
  description?: string;
  color?: keyof typeof COLORS;
  fields?: EmbedField[];
}) {
  const webhookUrl = process.env.DISCORD_LOG_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title,
            description,
            color: COLORS[color],
            fields: fields?.map((f) => ({ ...f, value: String(f.value).slice(0, 1024) || "—" })),
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });
  } catch (err) {
    console.error("Failed to send Discord log:", err);
  }
}
