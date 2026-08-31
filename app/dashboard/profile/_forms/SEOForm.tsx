import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Config } from "@/lib/types/profile";
import { IconWorldFilled } from "@tabler/icons-react";
import DiscordEmbed from "../_components/Embed";
import { useSaveBar } from "@/lib/stores/save-bar";
import { useState } from "react";
import { ColorPicker } from "../_components/ColorPicker";
import Silk from "@/components/profile/backgrounds/Silk";
import { FaArrowRight, FaGem } from "react-icons/fa6";
import { Button } from "@/components/ui/button";

export default function SEOForm({
  config,
  user,
}: {
  config: Config;
  user: {
    id: string;
    username: string;
    uid: number;
    premium: boolean;
  };
}) {
  const { update } = useSaveBar();
  const [metaImage, setMetaImage] = useState<string | null>(
    config.meta_image ?? null,
  );

  return (
    <>
      {user.premium ? (
        <Card>
          <CardHeader className="flex flex-row gap-1 items-center text-muted-foreground">
            <IconWorldFilled size={20} />
            <Label className="text-base">Metadata</Label>
          </CardHeader>
          <div className="flex flex-col gap-4 px-5 mb-4">
            <div className="flex flex-col gap-2">
              <Label className="text-sm">Title</Label>
              <Input
                value={config.meta_title || ""}
                onChange={(e) => update({ meta_title: e.target.value })}
                placeholder="Username"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="text-sm">Description</Label>
              <Textarea
                value={config.meta_description || ""}
                onChange={(e) => update({ meta_description: e.target.value })}
                className="rounded-lg border-white/10 focus-visible:border-white/50 focus-visible:ring-0 h-14 resize-none"
              />
            </div>
            <div className="flex flex-col gap-3">
              <Label className="text-sm">Color</Label>
              <ColorPicker
                type="hex"
                color={config.meta_color || "#00000"}
                onChange={(e) => update({ meta_color: e })}
              />
            </div>
            <DiscordEmbed
              sitemap={"vira.wtf"}
              sitemap_url={null}
              author={null}
              author_url={null}
              title={config.meta_title || "{user.name}"}
              description={config.meta_description || ""}
              timestamp={false}
              color={config.meta_color || "#00000"}
              image_size={config.meta_size || "Large"}
              image={metaImage || `/api/og/${user.username}`}
              onImageChange={setMetaImage}
              config={config}
              user={user}
            />
          </div>
        </Card>
      ) : (
        <div className="relative h-14 px-4 py-2 flex items-center justify-between bg-gradient-to-r from-primary/90 via-primary to-black rounded-xl overflow-hidden">
          <div className="absolute inset-0 z-0 rounded-xl overflow-hidden brightness-[0.10]">
            <Silk speed={3} scale={1} color="#ffffff" />
          </div>
          <div className="absolute inset-0 z-10 rounded-xl border border-primary/30 pointer-events-none" />

          <p className="flex flex-row gap-3 relative z-20 items-center">
            <FaGem /> Upgrade to premium to unlock SEO
          </p>

          <Button className="relative z-20 flex items-center gap-2">
            Upgrade Now <FaArrowRight />
          </Button>
        </div>
      )}
    </>
  );
}
