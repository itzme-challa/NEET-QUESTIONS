import Link from "next/link";
import { auth } from "@/lib/auth";

import { cn } from "@/lib/utils";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { AvatarMenu } from "./avatar-menu";
import { SigninButton } from "./signin-button";

export async function SiteHeader() {
  const session = await auth();
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container grid grid-cols-[auto_1fr] h-14 max-w-screen-2xl items-center ">
        <div>
          <Link href="/" className="text-xl font-bold">
            NeetPrep
          </Link>
        </div>
        <div className="flex justify-end gap-3">
          <ModeToggle></ModeToggle>
          {session ? (
            <AvatarMenu {...session}></AvatarMenu>
          ) : (
            <SigninButton/>
          )}
        </div>
      </div>
    </header>
  );
}
