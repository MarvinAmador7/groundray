import { TechnicalInspector } from "./technical-inspector";
import "../technical-overview.css";

export function TechnicalOverview() {
  return (
    <section
      id="under-the-hood"
      className="technical section-padding"
      aria-labelledby="technical-title"
    >
      <div className="technical-intro">
        <h2 id="technical-title">
          Markdown + Git.
          <br />
          <em>Context for your AI.</em>
        </h2>
        <p>
          Keep your company knowledge in a repository you control. Groundray
          connects those files to your AI, with sources, reviewed changes, and
          explicit sync.
        </p>
      </div>
      <TechnicalInspector />
    </section>
  );
}
