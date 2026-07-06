import "./main.css";

function Home() {
  const videos = [
    {
      title: "The Power of Prayer",
      author: "Pastor John",
    },
    {
      title: "Amazing Grace Worship",
      author: "Hills Worship",
    },
    {
      title: "Faith Over Fear",
      author: "Pastor Michael",
    },
  ];

  return (
    <div className="home">

      {/* Hero Section */}
      <section className="hero">
        <h1>Welcome to Gospel Tube</h1>

        <p>
          Watch inspiring sermons, worship songs, Bible teachings,
          and Christian testimonies that strengthen your faith.
        </p>

        <button className="hero-btn">Explore Videos</button>
      </section>

      {/* Categories */}
      <section className="categories">

        <h2>Popular Categories</h2>

        <div className="category-container">

          <div className="category-card">
            <span>🎤</span>
            <h3>Worship Music</h3>
          </div>

          <div className="category-card">
            <span>📖</span>
            <h3>Bible Teachings</h3>
          </div>

          <div className="category-card">
            <span>🙏</span>
            <h3>Sermons</h3>
          </div>

          <div className="category-card">
            <span>❤️</span>
            <h3>Testimonies</h3>
          </div>

        </div>

      </section>

      {/* Featured Videos */}
      <section className="featured">

        <h2>Featured Videos</h2>

        <div className="video-container">

          {videos.map((video, index) => (
            <div className="video-card" key={index}>

              <div className="thumbnail">
                Thumbnail
              </div>

              <h3>{video.title}</h3>

              <p>{video.author}</p>

              <button>Watch Now</button>

            </div>
          ))}

        </div>

      </section>

      {/* Bible Verse */}
      <section className="verse">

        <h2>Daily Bible Verse</h2>

        <p className="quote">
          "For God so loved the world that He gave His one and only Son,
          that whoever believes in Him shall not perish but have eternal life."
        </p>

        <h3>John 3:16</h3>

      </section>

      {/* CTA */}
      <section className="cta">

        <h2>Join Our Community</h2>

        <p>
          Stay connected with inspiring Christian videos,
          worship music and Bible teachings.
        </p>

        <div className="buttons">
          <button>Subscribe</button>
          <button className="secondary">Learn More</button>
        </div>

      </section>

    </div>
  );
}

export default Home;