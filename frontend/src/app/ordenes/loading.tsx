export default function OrdenesLoading() {
  return (
    <section aria-label="Cargando órdenes" aria-busy="true">
      <div className="mb-6 space-y-2">
        <div className="h-9 w-40 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-stone-200" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="h-5 w-36 rounded bg-stone-200" />
            <div className="mt-4 h-4 w-64 max-w-full rounded bg-stone-200" />
            <div className="mt-5 h-4 w-48 rounded bg-stone-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
