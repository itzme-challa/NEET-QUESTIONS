"use client"
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";


export function SigninButton() {
    return(
        <Button onClick={() => signIn()} variant="outline">Sign in</Button>
    )
}