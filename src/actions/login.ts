"use server";

import * as z from "zod";
import { AuthError } from "next-auth";

import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";
import { getUserByEmail } from "@/helpers/user";

export default async function loginUser(values: z.infer<typeof LoginSchema>) {
  const validatedFields = LoginSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid fields!!" };
  }

  const { email, password } = validatedFields.data;

  const existingUser = await getUserByEmail(email);

  if (!existingUser) {
    return { error: "Email does not exist. Please register!!" };
  }

  // Email registered using Github or Google
  if (!existingUser.password) {
    return { error: "Email already in use with a different provider!!" };
  }

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid Credentials!!" };
        default:
          return { error: "Something went wrong!!" };
      }
    }

    throw error;
  }
}
