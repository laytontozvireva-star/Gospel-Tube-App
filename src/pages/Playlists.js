import PageShell from "../components/PageShell";

const playlists = [
  { title: "Morning Devotions", count: "12 videos" },
  { title: "Faith Builders", count: "8 videos" },
  { title: "Worship Nights", count: "15 videos" },
  { title: "Prayer & Intercession", count: "9 videos" },
];

function Playlists() {
  return (
    <PageShell
      title="Playlists"
      description="Organized video collections for devotion, worship, and teaching."
    >
      <section className="page-grid">
        {playlists.map((playlist) => (
          <article className="page-card" key={playlist.title}>
            <h2>{playlist.title}</h2>
            <p>{playlist.count}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default Playlists;
