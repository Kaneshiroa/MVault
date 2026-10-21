"use client";

/**
 * Displays a personal dashboard summary using the media
 * items already loaded in the user's library.
 */

function formatText(value) {
  return value.replace("_", " ");
}

export default function LibrarySidebar({ mediaItems }) {
  let plannedCount = 0;
  let inProgressCount = 0;
  let completedCount = 0;

  const inProgressItems = [];
  const ratedItems = [];

  for (const item of mediaItems) {
    if (item.status === "planned") {
      plannedCount += 1;
    }

    if (item.status === "in_progress") {
      inProgressCount += 1;
      inProgressItems.push(item);
    }

    if (item.status === "completed") {
      completedCount += 1;
    }

    if (item.rating !== null) {
      ratedItems.push(item);
    }
  }

  ratedItems.sort((firstItem, secondItem) => {
    return secondItem.rating - firstItem.rating;
  });

  return (
    <aside className="h-fit space-y-5 xl:sticky xl:top-6">
      <section className="rounded-xl border border-violet-950 bg-zinc-900 p-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Your dashboard
        </p>

        <h3 className="mt-2 text-xl font-bold">Library overview</h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-2xl font-bold text-violet-300">
              {mediaItems.length}
            </p>
            <p className="mt-1 text-xs text-zinc-400">Total titles</p>
          </div>

          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-2xl font-bold text-violet-300">
              {inProgressCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400">In progress</p>
          </div>

          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-2xl font-bold text-zinc-200">
              {plannedCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400">Planned</p>
          </div>

          <div className="rounded-lg bg-zinc-800 p-3">
            <p className="text-2xl font-bold text-zinc-200">
              {completedCount}
            </p>
            <p className="mt-1 text-xs text-zinc-400">Completed</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-lg font-bold">Continue tracking</h3>

        {inProgressItems.length === 0 && (
          <p className="mt-3 text-sm text-zinc-400">
            Nothing is currently in progress.
          </p>
        )}

        <div className="mt-3 grid gap-3">
          {inProgressItems.slice(0, 3).map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
            >
              <p className="font-medium text-zinc-100">{item.title}</p>

              <p className="mt-1 text-sm text-zinc-400">
                {item.progress}

                {item.total_units !== null && (
                  <> / {item.total_units}</>
                )}

                {" · "}
                {formatText(item.format)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <h3 className="text-lg font-bold">Top rated</h3>

        {ratedItems.length === 0 && (
          <p className="mt-3 text-sm text-zinc-400">
            Rate titles to see your favorites here.
          </p>
        )}

        <div className="mt-3 grid gap-3">
          {ratedItems.slice(0, 3).map((item, index) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet-950 text-xs font-bold text-violet-300">
                  {index + 1}
                </span>

                <div className="min-w-0">
                  <p className="truncate font-medium text-zinc-100">
                    {item.title}
                  </p>

                  <p className="text-sm text-zinc-400">
                    {formatText(item.format)}
                  </p>
                </div>
              </div>

              <span className="shrink-0 text-sm font-semibold text-violet-300">
                {item.rating} / 10
              </span>
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}