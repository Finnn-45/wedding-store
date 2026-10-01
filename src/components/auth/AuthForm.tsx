"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { Button } from "@/components/ui/Button";

const field =
  "w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink";
const label = "text-body-sm text-stone";

type Mode = "login" | "signup";

/**
 * Customer sign-in / sign-up.
 *
 * Note what this form CANNOT do: there is no role field, anywhere. A new
 * account is a `profiles` row created by a database trigger, always with
 * role = 'customer'. Admin promotion is a manual, trusted operation
 * (see supabase/migrations/0001_init.sql).
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured()) {
    return (
      <div className="border border-line bg-shell p-8 lg:p-10">
        <p className="font-serif text-title">Accounts are not enabled yet.</p>
        <p className="mt-4 text-body text-stone">
          This build has no Supabase credentials configured, so sign-in is
          unavailable. You can still{" "}
          <Link
            href="/account/purchases"
            className="text-ink underline decoration-line underline-offset-4"
          >
            look up your purchases by email
          </Link>
          .
        </p>
      </div>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName, whatsapp } },
        });
        if (signUpError) throw signUpError;
        setNotice(
          "Account created. If email confirmation is enabled, check your inbox, then sign in.",
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push(next);
        router.refresh();
      }
    } catch (authError) {
      // Supabase messages are safe to show, but keep them generic.
      setError(
        authError instanceof Error ? authError.message : "Sign in failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7">
      {mode === "signup" ? (
        <>
          <label className="flex flex-col gap-2">
            <span className={label}>Full name</span>
            <input
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              className={field}
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className={label}>WhatsApp</span>
            <input
              name="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(event) => setWhatsapp(event.target.value)}
              autoComplete="tel"
              placeholder="+628123456789"
              className={field}
            />
          </label>
        </>
      ) : null}

      <label className="flex flex-col gap-2">
        <span className={label}>Email</span>
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
        <span className={label}>Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={field}
        />
      </label>

      {error ? (
        <p role="alert" className="border border-line px-4 py-3 text-body-sm">
          {error}
        </p>
      ) : null}
      {notice ? (
        <p className="border border-line bg-shell px-4 py-3 text-body-sm text-stone">
          {notice}
        </p>
      ) : null}

      <div>
        <Button type="submit" size="lg" disabled={busy}>
          {busy
            ? "Working…"
            : mode === "signup"
              ? "Create account"
              : "Sign in"}
        </Button>
      </div>
    </form>
  );
}