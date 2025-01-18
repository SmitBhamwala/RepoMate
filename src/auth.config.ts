import bcrypt from "bcryptjs";

import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "./helpers/user";

export default {
  providers: [
    Credentials({
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);

          // Check if user does not exists or user is registered using other
          // provider like Google (then they will not have password)
          if (!user || !user.password) {
            return null;
          }
          // Comparing both passwords
          const passwordsMatch = await bcrypt.compare(password, user.password);
          if (passwordsMatch) {
            return user;
          }
        }

        return null;
      },
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "consent",
        },
      },
    }),
  ],
} satisfies NextAuthConfig;
