export default async function ChallengePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <main className="challenge-page">
      <div className="tape">CHALLENGE ACCEPTED</div>
      <h1>Your mate put their timeline on the line.</h1>
      <p>
        Code <strong>{code}</strong>. There is only one dignified response: get
        scouted and beat their Aura score.
      </p>
      <a className="button" href={`/?ref=${code}`}>
        Scout My Timeline
      </a>
    </main>
  );
}
