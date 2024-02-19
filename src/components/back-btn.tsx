"use client";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

export function BackBtn() {
  const router = useRouter();
  const pathname = usePathname()
  console.log(pathname)
  return pathname === "/" ? null : <Button variant="outline" size="icon" onClick={() => router.back()}><ChevronLeft className="h-[1.2rem] w-[1.2rem]"/></Button>;
}
