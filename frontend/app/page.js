"use client";

/**
 * Renders the MVault dashboard shell and controls
 * the Add media drawer plus library refresh cycle.
 */

import { useState } from "react";
import Link from "next/link";
import AddMediaForm from "../components/AddMediaForm";
import MediaList from "../components/MediaList";

export default function Home() {
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);

  function openAddPanel() {
    setIsAddPanelOpen(true);
  }

  function closeAddPanel() {
    setIsAddPanelOpen(false);
  }

  function handleMediaAdded() {
    setLibraryVersion((currentVersion) => currentVersion + 1);
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-violet-950 bg-zinc-950">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 text-xl font-black tracking-tight"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-600 text-base text-white shadow-lg shadow-violet-950">
              MV
            </span>

            <span className="text-violet-300">MVault</span>
          </Link>

          <nav className="flex items-center gap-5 text-sm font-medium text-zinc-400">
            <a
              href="#library"
              className="transition hover:text-violet-300"
            >
              Library
            </a>

            <a
              href="#library"
              className="transition hover:text-violet-300"
            >
              Animated
            </a>

            <a
              href="#library"
              className="transition hover:text-violet-300"
            >
              Reading
            </a>

            <a
              href="#library"
              className="transition hover:text-violet-300"
            >
              Live action
            </a>
          </nav>

          <button
            type="button"
            onClick={openAddPanel}
            className="rounded-md bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-500"
          >
            Add title
          </button>
        </div>
      </header>

      <section className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-violet-950/40 to-zinc-950">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
            Personal media tracker
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
            Your collection,{" "}
            <span className="text-violet-400">organized.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-zinc-400">
            Track what you watch and read, remember your progress,
            and keep every favorite in one personal vault.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section id="library">
          <MediaList refreshKey={libraryVersion} />
        </section>
      </div>

      {isAddPanelOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Add media"
        >
          <button
            type="button"
            onClick={closeAddPanel}
            aria-label="Close Add media panel"
            className="absolute inset-0 cursor-default"
          />

          <aside className="relative ml-auto h-full w-full max-w-lg overflow-y-auto border-l border-violet-900 bg-zinc-950 p-6 shadow-2xl shadow-black">
            <AddMediaForm
              onMediaAdded={handleMediaAdded}
              onClose={closeAddPanel}
            />
          </aside>
        </div>
      )}
    </main>
  );
}
