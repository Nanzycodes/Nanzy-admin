"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { LoaderCircle, RefreshCw, Search } from "lucide-react";

type DemoPost = {
  id: number;
  title: string;
  body: string;
};

const POSTS_URL = "https://jsonplaceholder.typicode.com/posts?_limit=5";

function isDemoPost(value: unknown): value is DemoPost {
  if (typeof value !== "object" || value === null) return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post.id === "number" &&
    typeof post.title === "string" &&
    typeof post.body === "string"
  );
}

export default function PublicApiDemo() {
  const [posts, setPosts] = useState<DemoPost[]>([]);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(POSTS_URL, { signal });
      if (!response.ok) {
        throw new Error(`Public API returned HTTP ${response.status}`);
      }
      const data: unknown = await response.json();
      if (!Array.isArray(data) || !data.every(isDemoPost)) {
        throw new Error("Public API returned an unexpected response.");
      }
      setPosts(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Could not load public API data.");
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedQuery(query.trim().toLowerCase());
  }

  const visiblePosts = posts.filter((post) =>
    `${post.title} ${post.body}`.toLowerCase().includes(appliedQuery),
  );

  return (
    <section className="mt-6 rounded-xl border border-border bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Free public API · no key required
          </p>
          <h2 className="mt-1 text-lg font-semibold text-foreground">
            Live integration demo
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Reads sample posts from JSONPlaceholder. This external service is
            read-only for this demo; marketplace data is not sent.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadPosts()}
          disabled={loading}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm hover:bg-muted disabled:opacity-60"
        >
          {loading ? (
            <LoaderCircle size={15} className="animate-spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          Refresh API data
        </button>
      </div>

      <form onSubmit={handleSearch} className="mt-4 flex max-w-lg gap-2">
        <label className="relative flex-1">
          <span className="sr-only">Filter sample posts</span>
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter fetched posts"
            className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-1 focus:ring-ring"
          />
        </label>
        <button
          type="submit"
          className="h-9 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
        >
          Apply
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          Could not load public API data: {error}
          <button
            type="button"
            onClick={() => void loadPosts()}
            className="ml-2 font-medium underline"
          >
            Try again
          </button>
        </div>
      )}

      {loading && (
        <p className="mt-4 text-sm text-muted-foreground" role="status">
          Loading sample posts…
        </p>
      )}

      {!loading && !error && visiblePosts.length === 0 && (
        <p className="mt-4 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
          {posts.length === 0
            ? "The API returned no posts."
            : "No posts match this filter. Try another search."}
        </p>
      )}

      {!loading && !error && visiblePosts.length > 0 && (
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {visiblePosts.map((post) => (
            <li key={post.id} className="rounded-md border border-border p-3">
              <p className="text-xs text-muted-foreground">Post #{post.id}</p>
              <h3 className="mt-1 font-medium capitalize text-foreground">
                {post.title}
              </h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                {post.body}
              </p>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-4 text-xs text-muted-foreground">
        Endpoint: {POSTS_URL}
      </p>
    </section>
  );
}
