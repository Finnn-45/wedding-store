import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { Container } from "@/components/ui/Container";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { getSession } from "@/lib/auth/guards";

/**
 * Every admin route reads the session cookie (this layout + each page's
 * requireAdmin), so none of them can be statically prerendered. Opt the whole
 * /admin segment out of static generation; without this, `next build` aborts
 * with "Dynamic server usage: couldn't be rendered statically because it used
 * `cookies`".
 */
export const dynamic = "force-dynamic";

/**
 * Admin shell.
 *
 * NOTE ON THE GUARD: this layout deliberately does NOT call requireAdmin(),
 * because /admin/login lives under /admin and would then redirect to itself
 * in a loop. Instead:
 *
 *   - the layout only DECORATES: the sidebar and header render for a session
 *     that is actually an admin, and nothing else renders chrome
 *   - every admin PAGE calls requireAdmin() itself, which is where the real
 *     check happens — authenticated + profile exists + role === "admin"
 *   - every admin WRITE (server action) calls requireAdmin() again, closest
 *     to the data
 *
 * So hiding the sidebar is presentation; authorization is enforced per page
 * and per action, where it cannot be bypassed by rendering the UI differently.
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session.isAdmin) {
    // The login page (and any not-yet-authorised visit) renders bare. Pages
    // that require access redirect before this matters.
    return <>{children}</>;
  }

  return (
    <div className="border-b border-line bg-shell">
      <Container className="py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-6">
            <Eyebrow>Admin</Eyebrow>
            <p className="text-body-sm text-stone">
              {session.user.email ?? "Signed in"}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16">
          <div>
            <AdminNav />
          </div>
          <div className="min-w-0">{children}</div>
        </div>
      </Container>
    </div>
  );
}