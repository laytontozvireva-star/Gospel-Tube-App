import PageShell from "../components/PageShell";

const exploreItems = [
  {
    title: "Trending Sermons",
    description: "Catch the latest messages drawing believers closer to the Word.",
  },
  {
    title: "Worship Sessions",
    description: "Browse praise and worship moments that help set the atmosphere.",
  },
  {
    title: "Bible Teachings",
    description: "Dig into practical teaching for daily Christian growth.",
  },
  {
    title: "Testimonies",
    description: "Hear real stories of faith, healing, and transformation.",
  },
];

function Explore() {
  return (
    <PageShell
      title="Explore Gospel Tube"
      description="Find sermons, worship, teachings, and testimonies that match what you want to watch next."
    >
      <section className="page-grid">
        {exploreItems.map((item) => (
          <article className="page-card" key={item.title}>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default Explore;
