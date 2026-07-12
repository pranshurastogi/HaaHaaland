import { CardResult } from "@/components/card-result";
export default async function CardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
      <CardResult id={id} />
    </main>
  );
}
