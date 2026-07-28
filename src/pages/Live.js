import PageShell from "../components/PageShell";

function Live() {
  return (
    <PageShell
      title="Live"
      description="Join live worship and preaching events as they happen."
    >
      <section className="page-grid">
        <article className="page-card">
          <h2>Live Worship Service</h2>
          <p>Now streaming with praise, prayer, and ministry.</p>
        </article>
        <article className="page-card">
          <h2>Prayer Line</h2>
          <p>Connect with believers for live prayer and encouragement.</p>
        </article>
      </section>
    </PageShell>
  );
}

export default Live;
