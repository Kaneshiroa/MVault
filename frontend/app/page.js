"use client";

/**
 * Renders the MVault dashboard shell and controls
 * authentication, the Add media drawer, category navigation,
 * and the library refresh cycle.
 */

import { useState } from "react";
import Link from "next/link";
import AccountMenu from "../components/AccountMenu";
import AddMediaForm from "../components/AddMediaForm";
import AuthGate from "../components/AuthGate";
import MediaList from "../components/MediaList";

export default function Home() {
  const [libraryVersion, setLibraryVersion] = useState(0);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");

  function openAddPanel() {
    setIsAddPanelOpen(true);
  }

  function closeAddPanel() {
    setIsAddPanelOpen(false);
  }

  function handleMediaAdded() {
    setLibraryVersion((currentVersion) => currentVersion + 1);
  }

  function resetCategoryFilter() {
    setSelectedCategory("all");
  }

  function selectCategory(category) {
    setSelectedCategory(category);

    const librarySection = document.getElementById("library");

    if (librarySection) {
      librarySection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <AuthGate>
      <main className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="border-b border-zinc-800 bg-ultramarine-950">
          <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center gap-x-4 gap-y-4 px-6 py-4 md:grid-cols-[1fr_auto_1fr] md:gap-y-0">
            <Link
              href="/"
              onClick={resetCategoryFilter}
              className="flex items-center gap-3 text-xl font-black tracking-tight"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-800 text-base text-white">
                MV
              </span>

              <span className="text-violet-300">MVault</span>
            </Link>

            <nav
              aria-label="Library categories"
              className="col-span-2 row-start-2 flex items-center justify-self-center gap-5 text-sm font-bold md:col-span-1 md:col-start-2 md:row-start-1"
            >
              <button
                type="button"
                onClick={() => selectCategory("animated")}
                className={
                  selectedCategory === "animated"
                    ? "text-violet-300"
                    : "text-zinc-300 transition hover:text-violet-300"
                }
              >
                Animated
              </button>

              <button
                type="button"
                onClick={() => selectCategory("reading")}
                className={
                  selectedCategory === "reading"
                    ? "text-violet-300"
                    : "text-zinc-300 transition hover:text-violet-300"
                }
              >
                Reading
              </button>

              <button
                type="button"
                onClick={() => selectCategory("live_action")}
                className={
                  selectedCategory === "live_action"
                    ? "text-violet-300"
                    : "text-zinc-300 transition hover:text-violet-300"
                }
              >
                Live action
              </button>
            </nav>

            <div className="flex items-center justify-self-end gap-3 md:col-start-3 md:row-start-1">
              <button
                type="button"
                onClick={openAddPanel}
                className="rounded-md bg-violet-800 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                Add title
              </button>

              <AccountMenu />
            </div>
          </div>
        </header>

        <section className="border-b border-zinc-800 bg-gradient-to-r from-zinc-950 via-violet-950/40 to-zinc-950">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">
              Media tracker
            </p>

            <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
              One place for{" "}
              <span className="text-violet-400">every title.</span>
            </h1>

            <p className="mt-4 max-w-2xl text-zinc-400">
              Track what you watch and read, remember your progress, and keep
              every favorite in one personal vault.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-6 py-10">
          <section id="library">
            <MediaList
              refreshKey={libraryVersion}
              selectedCategory={selectedCategory}
              onSelectedCategoryChange={setSelectedCategory}
              onAddTitleClick={openAddPanel}
            />
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
              className="absolute inset-0 z-0 cursor-default"
            />

            <aside className="relative z-10 ml-auto h-full w-full max-w-lg overflow-y-auto border-l border-violet-900 bg-zinc-950 p-6 shadow-2xl shadow-black">
              <AddMediaForm
                onMediaAdded={handleMediaAdded}
                onClose={closeAddPanel}
              />
            </aside>
          </div>
        )}
      </main>
    </AuthGate>
  );
}