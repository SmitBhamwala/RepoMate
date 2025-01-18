"use client";

import * as z from "zod";

import { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams, useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema } from "@/schemas";
import { Input } from "@/components/ui/input";
import { CardWrapper } from "@/components/auth/card-wrapper";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/form-error";
import { FormSuccess } from "@/components/form-success";
import loginUser from "@/actions/login";

export default function LoginForm() {
  const router = useRouter();
  const [success, setSuccess] = useState<string | undefined>("");
  const [error, setError] = useState<string | undefined>("");
  const [isPending, startTranition] = useTransition();
  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function FormErrorState() {
    const searchParams = useSearchParams();

    const urlError =
      searchParams.get("error") === "OAuthAccountNotLinked"
        ? "Email already in use with a different provider!!"
        : "";

    return <FormError message={error || urlError} />;
  }

  function onSubmitHandler(values: z.infer<typeof LoginSchema>) {
    router.push("/auth/login");
    setError("");
    setSuccess("");
    startTranition(() => {
      loginUser(values).then((data) => {
        setError(data?.error);
        // setSuccess(data?.success);
      });
    });
  }

  return (
    <CardWrapper
      headerLabel="Welcome back"
      backButtonLabel="Don't have an account?"
      backButtonHref="/auth/register"
      showSocial
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmitHandler)}
          className="space-y-6"
        >
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="name@example.com"
                      type="email"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="*****"
                      type="password"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Suspense fallback={<p>.</p>}>
            <FormErrorState />
          </Suspense>
          <FormSuccess message={success} />
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Logging in..." : "Login"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
