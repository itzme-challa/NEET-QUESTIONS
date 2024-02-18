import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google"
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import db from "@/db";

export const { auth, handlers } = NextAuth({
  //adapter: DrizzleAdapter(db),
  providers: [GitHub, Google({
    authorization: {
      params: {
        prompt: "consent",
        access_type: "offline",
        response_type: "code"
      }
    }
  })],
  // callbacks: {
  //   async session({ session, user }) {
  //     if (session?.user) {
  //       session.user.id = user.id;
  //     }
  //     return session;
  //   }
  // }
});
