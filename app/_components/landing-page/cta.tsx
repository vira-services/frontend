"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Marquee } from "@/components/ui/marquee";
import { getUsers } from "@/lib/api/data/users/getUsers";
import { IconArrowRight } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  url: string;
  config: {
    avatar_url: string | null;
  } | null;
}

export default function CTA() {
  const [users, setUsers] = useState<User[]>([]);
  const [userCount, setUserCount] = useState(0);

  function FormatUsers(count: number) {
    return count.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  useEffect(() => {
    let cancelled = false;

    getUsers()
      .then(({ count, users }) => {
        if (cancelled) return;
        setUsers(users ?? []);
        setUserCount(count ?? 0);
      })
      .catch((err) => {
        console.error("Failed to load users:", err);
        if (cancelled) return;
        setUsers([]);
        setUserCount(0);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="w-full py-4 mx-auto bg-gradient-to-t from-white/[0.01] via-background to-background flex items-center justify-center">
      <div className="w-full max-w-xl mx-auto">
        <Card className="w-full">
          <CardContent className="flex items-center flex-col gap-2 py-4">
            <h1 className="text-lg font-bold">
              Ready to Create your{" "}
              <span className="text-[#8B5CF6]">vira</span>?
            </h1>
            <p className="text-base text-muted-foreground">
              Get Started and Join{" "}
              <span className="font-bold text-white">
                {FormatUsers(userCount)}
              </span>{" "}
              other users
            </p>
            <div className="relative w-full overflow-hidden">
              <Marquee pauseOnHover className="[--duration:60s]">
                {(users ?? []).map((user, i) => (
                  <Link
                    key={`${user.username}-${i}`}
                    href={user.url}
                    className="hover:bg-zinc-900/60 rounded-lg transition-all px-2 py-1.5 flex items-center gap-2 flex-shrink-0 mx-1"
                  >
                    <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/10 flex-shrink-0">
                      <Image
                        src={user.config?.avatar_url || "/default-avatar.png"}
                        alt={user.username}
                        fill
                        className="object-cover relative"
                      />
                    </div>
                    <p className="text-white/80 text-sm font-semibold truncate max-w-[100px]">
                      {user.username}
                    </p>
                  </Link>
                ))}
              </Marquee>
            </div>
            <div className="flex items-center gap-2 py-4 w-full max-w-sm">
              <InputGroup className="flex-1 py-4.5 px-1">
                <InputGroupInput
                  pattern="^\S+$"
                  className="ml-0 !pl-0 text-white placeholder:text-white"
                  placeholder="username"
                  onKeyDown={(e) => e.key === " " && e.preventDefault()}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData
                      .getData("text")
                      .replace(/\s/g, "");
                    document.execCommand("insertText", false, pasted);
                  }}
                />
                <InputGroupAddon>
                  <span>vira.wtf/</span>
                </InputGroupAddon>
              </InputGroup>
              <Button className="shrink-0 gap-1.5 rounded-full bg-white text-sm font-semibold text-zinc-900 hover:bg-white/90 text-center py-4.5 px-4 transition-transform hover:scale-[1.03]">
                <Link href="/auth?mode=register">
                  Get Started <IconArrowRight size={15} />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
