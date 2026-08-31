"use client";
import { Label } from "@/components/ui/label";
import RichTextEditor from "../_components/RichTextEditor";
import {
  IconUser,
  IconMapPin,
  IconAspectRatioFilled,
  IconTextRecognition,
} from "@tabler/icons-react";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { BsLayoutSplit } from "react-icons/bs";
import { RxBox } from "react-icons/rx";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import AvatarBannerUploader from "../_components/AvatarBannerUploader";
import BackgroundAudioManager from "../_components/BackgroundAudioManagers";
import { Config } from "@/lib/types/profile";
import { useSaveBar, configAtom } from "@/lib/stores/save-bar";
import { useAtom } from "jotai";

export default function ProfileForm({
  premium,
  config,
}: {
  premium: boolean;
  config: Partial<Config>;
}) {
  const [local, setLocal] = useState(config);
  const { update } = useSaveBar();
  const [, setConfig] = useAtom(configAtom);
  const uploadFields = new Set(["avatar_url", "banner_url"]);

  const handleChange = (patch: Partial<Config>) => {
    setLocal((prev) => ({ ...prev, ...patch }));
    const nonUploadPatch = Object.fromEntries(
      Object.entries(patch).filter(([key]) => !uploadFields.has(key)),
    );
    if (Object.keys(nonUploadPatch).length > 0) {
      update(patch);
    } else {
      setConfig((prev) => ({ ...prev, ...patch }));
    }
  };

  const animations = [
    { icon: BsLayoutSplit, name: "Split" },
    { icon: RxBox, name: "Normal" },
  ];

  return (
    <>
      <AvatarBannerUploader
        avatar={{
          value: local.avatar_url ?? null,
          decoration: local.avatar_decoration,
          onDecorationChange: (decoration) =>
            handleChange({ avatar_decoration: decoration ?? "" }),
          onShapeChange: (shape) => handleChange({ avatar_shape: shape }),
          onChange: (url) => handleChange({ avatar_url: url ?? "" }),
          shape: local.avatar_shape,
        }}
        banner={{
          value: local.banner_url ?? null,
          onChange: (url) => handleChange({ banner_url: url ?? "" }),
        }}
      />
      <Separator />
      <BackgroundAudioManager
        backgrounds={local.backgrounds ?? null}
        premium={premium}
        onReorder={(backgrounds) => handleChange({ backgrounds })}
        onAudioReorder={(audios) => handleChange({ audios })}
        audios={local.audios ?? null}
        config={{
          background_mute: local.background_mute ?? false,
          background_shuffle: local.background_shuffle ?? false,
        }}
      />
      <Separator />
      <div className="flex flex-col gap-2">
        <Label className="text-[16px]">Description</Label>
        <RichTextEditor
          value={local.description ?? ""}
          onChange={(html) => handleChange({ description: html })}
        />
        <Separator className="mt-4" />
        <div className="grid grid-rows-2 md:grid-rows-1 grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label className="text-[16px]">Display Name</Label>
            <InputGroup className="py-4.5 px-1">
              <InputGroupAddon>
                <IconUser size={16} />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white"
                value={local.display_name ?? ""}
                onChange={(e) => handleChange({ display_name: e.target.value })}
              />
            </InputGroup>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-[16px]">Location</Label>
            <InputGroup className="py-4.5 px-1">
              <InputGroupAddon>
                <IconMapPin size={16} />
              </InputGroupAddon>
              <InputGroupInput
                className="ml-0 !pl-2 text-white"
                value={local.location ?? ""}
                onChange={(e) => handleChange({ location: e.target.value })}
              />
            </InputGroup>
          </div>
        </div>
        <Separator className="my-4" />
        <Card>
          <CardHeader className="flex flex-row gap-1 items-center justify-between text-muted-foreground">
            <div className="flex flex-row items-center gap-1">
              <IconAspectRatioFilled size={20} />
              <Label className="text-base">Entry Screen</Label>
            </div>
            <Switch
              checked={local.entry_enabled}
              onCheckedChange={(v) => handleChange({ entry_enabled: v })}
            />
          </CardHeader>
          {local.entry_enabled && (
            <CardContent className="grid grid-cols-1 grid-rows-2 md:grid-cols-2 md:grid-rows-1 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Text</Label>
                <InputGroup>
                  <InputGroupInput
                    onChange={(e) =>
                      handleChange({ entry_text: e.target.value })
                    }
                    value={local.entry_text ?? ""}
                    placeholder="enter"
                  />
                  <InputGroupAddon>
                    <IconTextRecognition />
                  </InputGroupAddon>
                </InputGroup>
              </div>
              <div className="flex flex-col gap-2">
                <Label>Animation</Label>
                <Select
                  onValueChange={(e) =>
                    handleChange({ entry_animation: e as "Normal" | "Split" })
                  }
                  value={local.entry_animation}
                >
                  <SelectTrigger className="!py-0 !h-8 w-full !rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectGroup>
                      {animations.map(({ icon: Icon, name }) => (
                        <SelectItem key={name} value={name}>
                          <div className="flex items-center gap-2">
                            <Icon size={14} />
                            <span>{name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
}
