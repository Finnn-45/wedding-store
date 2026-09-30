import { Button } from "@/components/ui/Button";

const fieldClasses =
  "w-full border-b border-line bg-transparent py-3 text-base text-ink outline-none transition-colors placeholder:text-stone-soft focus:border-ink";

/**
 * GET form → /account/purchases?email=… . A plain HTML navigation, so
 * purchase lookup needs no client JavaScript and no authentication (accounts
 * arrive with the production auth layer).
 */
export function OrderLookupForm() {
  return (
    <form
      action="/account/purchases"
      method="get"
      className="flex flex-col gap-6"
    >
      <h2 className="text-eyebrow text-stone uppercase">Find your purchases</h2>

      <label className="flex flex-col gap-2" htmlFor="lookup-email">
        <span className="text-body-sm text-stone">
          Email used at checkout *
        </span>
        <input
          id="lookup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={fieldClasses}
        />
      </label>

      <Button type="submit" size="lg">
        Look up my purchases
      </Button>

      <p className="text-body-sm text-stone">
        No password needed — purchases are read by the email you used at
        checkout. Sign-in arrives with the production account layer.
      </p>
    </form>
  );
}
