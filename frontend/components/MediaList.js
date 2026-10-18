"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function MediaList({ refreshKey }) {
  const [mediaItems, setMediaItems] = useState([]);
  const [message, setMessage] = useState("Loading library...");

  useEffect(() => {
    async function loadMedia() {
      try {
        const response = await fetch(`${API_URL}/media/`);

        if (!response.ok) {
          throw new Error("Could not load your library.");
        }

        const data = await response.json();

        setMediaItems(data);
        setMessage("");
      } catch (error) {
        setMessage(error.message);
      }
    }

    loadMedia();
  }, [refreshKey]);

  return (
    <section className="mt-10">
      <h2 className="text-2xl font-semibold">Your library</h2>

      {message && <p className="mt-4 text-zinc-400">{message}</p>}

      {!message && mediaItems.length === 0 && (
        <p className="mt-4 text-zinc-400">
          Your library is empty. Add your first title above.
        </p>
      )}

      <div className="mt-4 grid gap-3">
        {mediaItems.map((item) => (
          <article
            key={item.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900 p-5"
          >
            <h3 className="text-lg font-semibold">{item.title}</h3>

            <p className="mt-1 text-sm text-zinc-400">
              {item.category.replace("_", " ")} ·{" "}
              {item.format.replace("_", " ")} ·{" "}
              {item.status.replace("_", " ")}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}