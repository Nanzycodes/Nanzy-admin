"use client";

import Link from "next/link";
import { useState } from "react";
import AuthLayout, { InnerContainer } from "@/components/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import adminAuthApi from "@/lib/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");
    setError("");

    try {
      const result = await adminAuthApi.forgotPassword({ email });
      if (result.success) setMessage(result.message);
      else setError(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <InnerContainer>
        <h1 className="mb-2 font-mono text-[32px] font-bold">Reset password</h1>
        <p className="mb-5 text-sm text-[#616161]">
          We&apos;ll email you a secure password reset link.
        </p>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Input
            type="email"
            required
            autoComplete="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
        {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        <Link href="/sign-in" className="mt-5 block text-sm text-primary">
          Back to sign in
        </Link>
      </InnerContainer>
    </AuthLayout>
  );
}
