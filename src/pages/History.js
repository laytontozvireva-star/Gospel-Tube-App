import PageShell from "../components/PageShell";

const historyItems = [
  {
    title: "The Power of Prayer",
    meta: "Watched yesterday • 18:34",
  },
  {
    title: "Faith Over Fear",
    meta: "Watched 2 days ago • 22:11",
  },
  {
    title: "Walking with Christ",
    meta: "Watched last week • 16:45",
  },
];

function History() {
  return (
    <PageShell
      title="Watch History"
      description="Pick up where you left off and revisit sermons you want to hear again."
    >
      <section className="page-list">
        {historyItems.map((item) => (
          <article className="history-row" key={item.title}>
            <div>
              <h2>{item.title}</h2>
              <p>{item.meta}</p>
            </div>
            <button>Watch Again</button>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default History;
