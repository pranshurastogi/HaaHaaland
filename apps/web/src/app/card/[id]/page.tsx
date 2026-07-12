import type { Metadata } from "next";
import { CardResult } from "@/components/card-result";
import { getServerCard } from "@/lib/server-card";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const found = await getServerCard(id);
  if (!found)
    return {
      title: "Scout card not found · HaaHaaLand",
      robots: { index: false, follow: false },
    };
  const title = `@${found.card.handle} is ${found.card.primaryArchetypeId} · HaaHaaLand`;
  const description = `${found.card.headline} ${found.card.roast}`.slice(
    0,
    190,
  );
  return {
    title,
    description,
    alternates: { canonical: `/card/${id}` },
    openGraph: {
      title,
      description,
      type: "article",
      images: [
        { url: `/card/${id}/opengraph-image`, width: 1200, height: 630 },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/card/${id}/opengraph-image`],
    },
  };
}

export default async function CardPage({ params }: Props) {
  const { id } = await params;
  const found = await getServerCard(id);
  return (
    <main>
      <header className="nav">
        <a className="brand" href="/">
          <span className="brand-ball">H</span> HaaHaaLand
        </a>
        <a className="button small" href="/">
          Scout yourself
        </a>
      </header>
      <CardResult id={id} initialCard={found?.card ?? null} />
    </main>
  );
}
