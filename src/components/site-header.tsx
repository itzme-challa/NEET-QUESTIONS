import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { AvatarMenu } from "./avatar-menu";
import { SigninButton } from "./signin-button";
import { BackBtn } from "./back-btn";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 container grid grid-cols-[auto_1fr] h-14 max-w-screen-2xl items-center ">
        <div className="flex justify-end gap-3">
          <BackBtn />
          <Link href="/" className="text-xl font-bold">
            <Image
              className="h-10 w-auto"
              src="/logo.png"
              alt="NeetPrep Logo"
              height={192}
              width={52}
              style={{ objectFit: "cover" }}
            />
          </Link>
        </div>
        <div className="flex justify-end gap-3">
          <ModeToggle></ModeToggle>
          {session ? <AvatarMenu {...session}></AvatarMenu> : <SigninButton />}
        </div>
      </div>
    </header>
  );
}
