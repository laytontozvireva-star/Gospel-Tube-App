import PageShell from "../components/PageShell";

const likedVideos = [
  { title: "Walking in the Power of the Holy Spirit", meta: "Liked today • 48:21" },
  { title: "The Power of Prayer", meta: "Liked yesterday • 18:34" },
  { title: "Faith Over Fear", meta: "Liked this week • 22:11" },
];

function LikedVideos() {
  return (
    <PageShell
      title="Liked Videos"
      description="Revisit the sermons and worship videos you saved."
    >
      <section className="page-list">
        {likedVideos.map((video) => (
          <article className="history-row" key={video.title}>
            <div>
              <h2>{video.title}</h2>
              <p>{video.meta}</p>
            </div>
            <button>Open</button>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default LikedVideos;
