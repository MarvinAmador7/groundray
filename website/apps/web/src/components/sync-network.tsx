import { useState } from "react";
import { ArrowRight, GitBranch, RefreshCw, UserRound } from "lucide-react";
import { Button } from "@website/ui/components/button";
import "../sync-network.css";

type Phase = 0 | 1 | 2;
const coworkers = ["You", "Coworker 1", "Coworker 2"];
const connections = [
  "M450 0 V18 C450 56 150 38 150 88",
  "M450 0 V88",
  "M450 0 V18 C450 56 750 38 750 88",
];

export function SyncNetwork() {
  const [phases, setPhases] = useState<Phase[]>([0, 0, 0]);
  function advance(index: number) {
    setPhases((current) =>
      current.map((phase, i) =>
        i === index ? (Math.min(phase + 1, 2) as Phase) : phase,
      ),
    );
  }

  return (
    <div className="sync-network-view">
      <div className="sync-network-heading">
        <h3>
          One company brain.
          <br />
          <em>Everyone brings it with them.</em>
        </h3>
        <p>
          Publish a shared version. Each coworker chooses when to sync their
          copy and rebuild its search index.
        </p>
      </div>
      <figure
        className="sync-network"
        aria-label="A shared company brain connects to three independently synced coworker installations"
      >
        <div className="sync-network-root">
          <GitBranch size={26} strokeWidth={1.4} aria-hidden="true" />
          <div>
            <strong>Company brain</strong>
            <span>Published version B</span>
          </div>
          <span className="sync-network-published">B</span>
        </div>
        <svg
          className="sync-network-edges"
          viewBox="0 0 900 90"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          {connections.map((path, index) => (
            <path
              key={path}
              d={path}
              className={"sync-edge sync-edge-" + phases[index]}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
        <ol className="sync-network-coworkers">
          {coworkers.map((name, index) => {
            const phase = phases[index];
            const target = index === 0 ? "your installation" : name;
            return (
              <li key={name} className={"sync-coworker sync-coworker-" + phase}>
                <div className="sync-coworker-avatar" aria-hidden="true">
                  <UserRound size={26} strokeWidth={1.3} />
                </div>
                <h4>{name}</h4>
                <div
                  className="sync-coworker-snapshot"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <dl>
                    <div>
                      <dt>Brain</dt>
                      <dd>{phase === 0 ? "A" : "B"}</dd>
                    </div>
                    <div>
                      <dt>Index</dt>
                      <dd>{phase === 2 ? "B" : "A"}</dd>
                    </div>
                  </dl>
                  <p>
                    {phase === 0
                      ? "Earlier version"
                      : phase === 1
                        ? "Reindex needed"
                        : "Ready to search"}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="sync-coworker-action"
                  disabled={phase === 2}
                  aria-label={
                    phase === 0
                      ? "Sync " + target
                      : phase === 1
                        ? "Reindex " + target
                        : (index === 0 ? "Your installation" : name) +
                          " is up to date"
                  }
                  onClick={() => advance(index)}
                >
                  {phase === 0
                    ? "Sync"
                    : phase === 1
                      ? "Reindex"
                      : "Up to date"}
                </Button>
              </li>
            );
          })}
        </ol>
        <figcaption>
          <span>
            Try syncing one coworker. The others stay on their own versions.
          </span>
          <button
            type="button"
            onClick={() => setPhases([0, 0, 0])}
            aria-label="Reset coworker sync example"
          >
            <RefreshCw size={13} aria-hidden="true" />
            Reset
          </button>
        </figcaption>
      </figure>
      <div className="sync-network-note">
        <p>
          Sync validates a fast-forward update. Search requires a matching
          index. A and B illustrate saved commits; no commands run here.
        </p>
        <a href="https://github.com/MarvinAmador7/groundray/blob/main/docs/cli.md">
          Sync and indexing docs <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
