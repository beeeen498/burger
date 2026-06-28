// app/menu/[slug]/page.tsx

import ItemDetailPage from "@/components/menu/ItemDetailPage/ItemDetailPage";

// ── Thin route entry point ──────────────────────────
// Next.js gives us the dynamic [slug] segment via params.
// In recent Next.js versions, params is a Promise — we await it
// before passing the slug down to the real component.
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <ItemDetailPage slug={slug} />;
}