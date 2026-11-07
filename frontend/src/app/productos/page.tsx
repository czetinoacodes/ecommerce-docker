import { cookies } from "next/headers";
import { Suspense } from "react";
import ProductCatalog from "@/components/ProductCatalog";
import { getProductos } from "@/lib/api";
import { sleep } from "@/lib/types";


interface ProductosPageProps {
  searchParams: Promise<{ addToCart?: string }>;
}

export default function ProductosPage({
  searchParams,
}: ProductosPageProps) {
  return (
    <Suspense
      fallback={
        <p className="rounded-xl border border-stone-200 bg-white p-6 text-stone-600">
          Cargando productos...
        </p>
      }
    >
      <ProductList searchParams={searchParams} />
      
    </Suspense>
    
  );
}

async function ProductList({ searchParams }: ProductosPageProps) {
  const [productos, cookieStore, params] = await Promise.all([
    getProductos(),
    cookies(),
    searchParams,
  ]);

  return (
    <ProductCatalog
      products={productos}
      authenticated={Boolean(cookieStore.get("token")?.value)}
      pendingProductId={params.addToCart}
    />
  );
}
