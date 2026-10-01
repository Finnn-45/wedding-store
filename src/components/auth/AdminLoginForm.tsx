"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/Button";

const field =
  "w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink";

/**
 * Admin sign-in.
 *
 * The form authenticates a user and nothing more. Whether that user is an
 * admin is decided by `profiles.role` on the server, so signing in with a
 * customer account simply lands them on /account instead of /admin.
 *
 * There is deliberately no "register" path here: admin accounts are
 * provisioned manually (see the migration), never self-registered.
 */
export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/admin";
  const configError = searchParams.get("error") === "not-configured";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="border border-line bg-shell p-8">
        <p className="font-serif text-title">Admin is not configured.</p>
        <p className="mt-3 text-body-sm text-stone">
          Add the Supabase credentials to <code>.env.local</code> to enable the
          admin area. Without them no admin route can be reached at all.
        </p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      router.push(next);
      router.refresh();
    } catch (authError) {
      setError(
        authError instanceof Error ? authError.message : "Sign in failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      <label className="flex flex-col gap-2">
        <span className="text-body-sm text-stone">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={field}
        />
      </label>
      <label className="flex flex-col gap-2">
        <span className="text-body-sm text-stone">Password</span>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={field}
        />
      </label>

      {configError ? (
        <p role="alert" className="border border-line px-4 py-3 text-body-sm">
          The admin area is disabled because Supabase is not configured.
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="border border-line px-4 py-3 text-body-sm">
          {error}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </div>
    </form>
  );
}