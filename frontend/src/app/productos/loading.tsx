export default function ProductosLoading() {
  return (
    <section aria-label="Cargando productos" aria-busy="true">
      <div className="mb-6 space-y-2">
        <div className="h-9 w-48 animate-pulse rounded bg-stone-200" />
        <div className="h-5 w-80 max-w-full animate-pulse rounded bg-stone-200" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-40 animate-pulse rounded-2xl border border-stone-200 bg-white p-5"
          >
            <div className="h-5 w-3/4 rounded bg-stone-200" />
            <div className="mt-4 h-7 w-1/2 rounded bg-stone-200" />
            <div className="mt-7 h-10 rounded-lg bg-stone-200" />
          </div>
        ))}
      </div>
    </section>
  );
}
