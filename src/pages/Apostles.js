import PageShell from "../components/PageShell";

const apostles = [
  { name: "Apostle Ezekiel Guti", role: "Senior Apostle", note: "Teaching faith, prayer, and spiritual growth." },
  { name: "Apostle Paul", role: "Missionary Apostle", note: "Known for doctrine, courage, and church planting." },
  { name: "Apostle Peter", role: "Church Leader", note: "A bold voice for faith and leadership." },
  { name: "Apostle John", role: "Beloved Apostle", note: "A message centered on love and truth." },
];

function Apostles() {
  return (
    <PageShell
      title="Apostles"
      description="Browse featured apostles and their latest teachings."
    >
      <section className="page-grid">
        {apostles.map((apostle) => (
          <article className="page-card" key={apostle.name}>
            <h2>{apostle.name}</h2>
            <p><strong>{apostle.role}</strong></p>
            <p>{apostle.note}</p>
          </article>
        ))}
      </section>
    </PageShell>
  );
}

export default Apostles;
