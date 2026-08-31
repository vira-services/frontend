import Image from "next/image";
import Link from "next/link";
import { FaDiscord } from "react-icons/fa6";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Vira"
            width={28}
            height={28}
            className="size-7 rounded-lg object-cover"
          />
          <span className="text-lg font-bold text-white">Vira</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/50">
          <a
            href="https://discord.gg/ygzm9eEn7G"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-white"
          >
            Discord
          </a>
          <Link href="/auth?mode=login" className="transition-colors hover:text-white">
            Login
          </Link>
          <Link href="/auth?mode=register" className="transition-colors hover:text-white">
            Sign Up
          </Link>
          <Link href="/dashboard" className="transition-colors hover:text-white">
            Dashboard
          </Link>
        </div>
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-[#8B5CF6]/60 to-transparent" />
        <p className="text-xs text-white/25">
          &copy; {new Date().getFullYear()} Vira. All rights reserved.
        </p>
      </div>
      <div className="mt-8 flex justify-center">
        <a
          href="https://discord.gg/ygzm9eEn7G"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/90 hover:text-white transition-colors duration-500"
        >
          <FaDiscord className="h-5 w-5" />
        </a>
      </div>
    </footer>
  );
}
