export default function ServicesLoading() {
  return (
    <main
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
      aria-busy="true"
    >
      <span className="sr-only" role="status">
        Loading services...
      </span>

      <div className="animate-pulse">
        <div className="h-9 w-56 rounded bg-secondary" />
        <div className="mt-3 h-5 w-80 max-w-full rounded bg-secondary" />
      </div>

      <div
        className="mt-8 animate-pulse rounded-xl border border-border bg-card p-6"
        aria-hidden="true"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="h-10 rounded-md bg-secondary" />
          <div className="h-10 rounded-md bg-secondary" />
          <div className="h-10 rounded-md bg-secondary" />
          <div className="h-10 rounded-md bg-secondary" />
        </div>
        <div className="mt-4 h-10 w-32 rounded-md bg-secondary" />
      </div>

      <div className="mt-8 grid auto-rows-fr grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-border bg-card"
            aria-hidden="true"
          >
            <div className="h-44 bg-secondary" />
            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="h-6 w-3/4 rounded bg-secondary" />
              <div className="h-5 w-24 rounded-full bg-secondary" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-full rounded bg-secondary" />
                <div className="h-4 w-5/6 rounded bg-secondary" />
                <div className="h-4 w-2/3 rounded bg-secondary" />
              </div>
              <div className="h-9 w-full rounded-md bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
