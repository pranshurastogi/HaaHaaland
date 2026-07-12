export const metadata = {
  title: "Privacy · HaaHaaLand",
  description: "How HaaHaaLand handles public-web research, cards, and email.",
};
export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <a className="brand" href="/">
        <span className="brand-ball">H</span> HaaHaaLand
      </a>
      <h1>Privacy, without the press-conference fog.</h1>
      <p>
        HaaHaaLand researches publicly discoverable web information. It does not
        access private posts, direct messages, hidden analytics, or private
        account data.
      </p>
      <h2>What we use</h2>
      <ul>
        <li>
          Public profile and indexed web signals needed to make a scout report.
        </li>
        <li>Optional public post excerpts you paste.</li>
        <li>
          Email only when you choose to save a result and manage referral
          credit.
        </li>
      </ul>
      <h2>What happens next</h2>
      <p>
        Research may be cached temporarily to reduce latency and provider cost.
        Sensitive traits are intentionally filtered out. Generated results are
        entertainment, and public card pages are shareable by design.
      </p>
      <h2>Deletion</h2>
      <p>
        You may request deletion of a result by emailing the project operator
        with the opaque card ID shown in its footer. Operators can follow the
        documented deletion procedure in <code>docs/SECURITY.md</code>. Do not
        send private post content.
      </p>
      <p>
        HaaHaaLand does not claim regulatory certification or formal GDPR
        compliance.
      </p>
      <a className="button" href="/">
        Back to the scouting ground
      </a>
    </main>
  );
}
