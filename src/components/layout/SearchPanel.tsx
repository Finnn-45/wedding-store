"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CloseIcon, SearchIcon } from "@/components/ui/icons";
import { Container } from "@/components/ui/Container";

/**
 * Minimal search: a native <dialog> (built-in focus handling + Escape key)
 * that hands the query to the shop page as a URL parameter.
 */
export function SearchPanel() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const reset = () => setQuery("");
    dialog.addEventListener("close", reset);
    return () => dialog.removeEventListener("close", reset);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        aria-label="Search templates"
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-xs px-2 py-2 text-stone transition-colors duration-300 ease-editorial hover:text-ink"
      >
        <SearchIcon />
        <span className="hidden text-eyebrow uppercase lg:inline">Search</span>
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Search templates"
        className="fixed inset-x-0 top-0 m-0 w-full max-w-none border-0 border-b border-line bg-ivory p-0 backdrop:bg-ink/25"
      >
        <Container className="py-8 lg:py-10">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = query.trim();
              dialogRef.current?.close();
              router.push(
                trimmed ? `/shop?q=${encodeURIComponent(trimmed)}` : "/shop",
              );
            }}
            className="flex items-center gap-4 border-b border-ink/25 pb-4"
          >
            <label htmlFor="site-search" className="sr-only">
              Search templates
            </label>
            <SearchIcon className="shrink-0 text-stone" />
            <input
              id="site-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search templates…"
              autoComplete="off"
              className="w-full bg-transparent font-serif text-title text-ink outline-none placeholder:text-stone-soft"
            />
            <button
              type="submit"
              className="shrink-0 text-eyebrow uppercase text-stone transition-colors duration-300 hover:text-ink"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close search"
              className="rounded-xs p-2 text-stone transition-colors duration-300 hover:text-ink"
            >
              <CloseIcon />
            </button>
          </form>
        </Container>
      </dialog>
    </>
  );
}
