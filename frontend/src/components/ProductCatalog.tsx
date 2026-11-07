"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Producto } from "@/lib/types";
import { useStore } from "@/components/StoreProvider";

interface ProductCatalogProps {
  products: Producto[];
  authenticated: boolean;
  pendingProductId?: string;
}

export default function ProductCatalog({
  products,
  authenticated,
  pendingProductId,
}: ProductCatalogProps) {
  const router = useRouter();
  const { addToCart, ready } = useStore();
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const handledPendingProduct = useRef(false);

  useEffect(() => {
    if (!ready || !pendingProductId || handledPendingProduct.current) {
      return;
    }

    handledPendingProduct.current = true;
    const product = products.find(
      (item) => item.id === Number(pendingProductId)
    );

    if (product && authenticated) {
      addToCart(product);
    }
    router.replace("/productos");
  }, [
    addToCart,
    authenticated,
    pendingProductId,
    products,
    ready,
    router,
  ]);

  function handleAdd(product: Producto) {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      const returnTo = `/productos?addToCart=${product.id}`;
      router.push(`/login?returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

    addToCart(product);
    setAddedProductId(product.id);
  }

  return (
    <section aria-labelledby="products-heading">
      <div className="mb-6">
        <h1
          id="products-heading"
          className="text-3xl font-extrabold text-stone-500"
        >
          Productos
        </h1>
        <p className="mt-2 text-stone-600">
          Explora el catálogo y añade tus productos al carrito.
        </p>
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600">
          No hay productos disponibles por el momento.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.id}
              className="flex flex-col justify-between rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-semibold text-stone-900">
                  {product.name}
                </h2>
                <p className="mt-3 text-2xl font-bold text-indigo-700">
                  ${Number(product.price).toFixed(2)}
                </p>
                 <p className="mt-3 text-sm font-bold text-gray-500">
                  Stock: {Number(product.stock)}
                </p>
              </div>
              <button
                type="button"
                disabled={!ready}
                onClick={() => handleAdd(product)}
                className="mt-6 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60"
              >
                {addedProductId === product.id
                  ? "Añadido al carrito"
                  : "Añadir al carrito"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
