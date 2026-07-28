import "./main.css";
import PageShell from "../components/PageShell";

function About() {
  return (
    <PageShell
      title="About Gospel Tube"
      description="Sharing the Good News through inspiring videos, worship music, Bible teachings, and Christian testimonies."
    >
      <div className="about-page">
        <section className="mission">
          <h2>Our Mission</h2>

          <p>
            Gospel Tube exists to spread the Gospel of Jesus Christ by making
            Christian content available to everyone. Our goal is to encourage,
            inspire, and strengthen believers through faith-filled videos that
            can be watched anytime and anywhere.
          </p>
        </section>

        <section className="values">
          <h2>What We Offer</h2>

          <div className="value-container">
            <div className="value-card">
              <span>🎤</span>
              <h3>Worship Music</h3>
              <p>Enjoy uplifting praise and worship from talented Christian artists.</p>
            </div>

            <div className="value-card">
              <span>📖</span>
              <h3>Bible Teachings</h3>
              <p>Learn God's Word through inspiring Bible studies and teachings.</p>
            </div>

            <div className="value-card">
              <span>🙏</span>
              <h3>Sermons</h3>
              <p>Watch sermons that encourage spiritual growth and faith.</p>
            </div>

            <div className="value-card">
              <span>❤️</span>
              <h3>Testimonies</h3>
              <p>Hear powerful stories of God's love and transformation.</p>
            </div>
          </div>
        </section>

        <section className="scripture">
          <h2>Our Foundation</h2>

          <blockquote>
            "Go into all the world and preach the gospel to every creature."
          </blockquote>

          <h3>Mark 16:15</h3>
        </section>

        <section className="contact">
          <h2>Contact Us</h2>

          <p><strong>Email:</strong> info@gospeltube.com</p>
          <p><strong>Phone:</strong> +263 77 123 4567</p>
          <p><strong>Location:</strong> Harare, Zimbabwe</p>
        </section>
      </div>
    </PageShell>
  );
}

export default About;
