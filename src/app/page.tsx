export default function Home() {
  return (
    <main style={{ padding: "4rem" }}>
      {Array.from({ length: 40 }, (_, i) => (
        <p key={i} style={{ fontSize: 40, margin: "2rem 0" }}>
          Scroll probe line {i + 1}
        </p>
      ))}
    </main>
  );
}
