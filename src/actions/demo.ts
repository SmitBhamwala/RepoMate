"use server";

import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export default function handleSocialSubmit(provider: "google" | "github") {
  signIn(provider, {
    callbackUrl: DEFAULT_LOGIN_REDIRECT,
  });
}
