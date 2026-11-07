"use client";

import { useEffect } from "react";

interface ProductosErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

export default function ProductosError({
  error,
  retry,
}: ProductosErrorProps) {
  useEffect(() => {
    console.error("Error al cargar el catálogo de productos.", error);
  }, [error]);

  return (
    <section
      role="alert"
      className="rounded-2xl border border-rose-200 bg-white p-6"
    >
      <h1 className="text-xl font-bold text-stone-900">
        No se pudieron cargar los productos
      </h1>
      <p className="mt-2 text-stone-600">
        Ocurrió un problema al consultar el catálogo. Inténtalo de nuevo.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
      >
        Reintentar
      </button>
    </section>
  );
}
