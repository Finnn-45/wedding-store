"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

/** Signs the current user out. The server re-checks the role on every load. */
export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch {
          // Even if the network call fails, the server guard will re-check.
        } finally {
          router.push("/admin/login");
          router.refresh();
        }
      }}
    >
      {busy ? "Signing out…" : "Sign out"}
    </Button>
  );
}