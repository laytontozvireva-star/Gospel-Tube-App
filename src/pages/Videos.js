import "./main.css";
import PageShell from "../components/PageShell";

function Videos() {
  const videos = [
    {
      title: "The Power of Prayer",
      speaker: "Pastor John",
      duration: "18:34",
      category: "Sermon",
    },
    {
      title: "Amazing Grace Worship",
      speaker: "Hills Worship",
      duration: "05:12",
      category: "Worship",
    },
    {
      title: "Faith Over Fear",
      speaker: "Pastor Michael",
      duration: "22:11",
      category: "Teaching",
    },
    {
      title: "Walking with Christ",
      speaker: "Pastor David",
      duration: "16:45",
      category: "Bible Study",
    },
    {
      title: "Victory Through Jesus",
      speaker: "Elevation Worship",
      duration: "06:58",
      category: "Music",
    },
    {
      title: "God's Love Never Fails",
      speaker: "Pastor Samuel",
      duration: "25:18",
      category: "Sermon",
    },
  ];

  return (
    <PageShell
      title="Gospel Videos"
      description="Discover inspiring sermons, worship songs, Bible studies, and Christian testimonies."
    >
      <div className="videos-page">
        <section className="videos-header">
          <input
            type="text"
            placeholder="Search videos..."
            className="search-bar"
          />
        </section>

        <section className="video-grid">
          {videos.map((video, index) => (
            <div className="video-card" key={index}>
              <div className="video-thumbnail">Thumbnail</div>

              <div className="video-info">
                <span className="category">{video.category}</span>

                <h3>{video.title}</h3>

                <p>
                  <strong>Speaker:</strong> {video.speaker}
                </p>

                <p>
                  <strong>Duration:</strong> {video.duration}
                </p>

                <button>â–¶ Watch</button>
              </div>
            </div>
          ))}
        </section>
      </div>
    </PageShell>
  );
}

export default Videos;
