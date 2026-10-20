import { useEffect, useRef } from "react";
import {
  ArrowRight,
  GitBranch,
  Pause,
  Play,
  RefreshCw,
  Laptop,
} from "lucide-react";
import "../sync-network.css";
import { useGraphPlayback } from "../hooks/use-graph-playback";

const coworkers = ["Your laptop", "Maya’s laptop", "Sam’s laptop"];
const connections = [
  "M450 0 V18 C450 56 150 38 150 88",
  "M450 0 V88",
  "M450 0 V18 C450 56 750 38 750 88",
];
const times = [0, 1000, 2200, 3600, 4600, 6000, 7000, 8400, 9400];
const duration = 11200;
const captions = [
  "A reviewed update is ready. Local copies still have version A.",
  "A reviewed update is published as version B.",
  "You choose to sync the new version.",
  "Your local search index is rebuilt.",
  "Maya syncs the published version to her laptop.",
  "Maya rebuilds her local search index.",
  "Sam syncs when he’s ready.",
  "Sam rebuilds his local search index.",
  "Everyone can now search the same published version.",
];
type Phase = "waiting" | "syncing" | "indexing" | "ready";
function phaseAt(stage: number, index: number): Phase {
  const start = 2 + index * 2;
  return stage >= start + 2
    ? "ready"
    : stage === start + 1
      ? "indexing"
      : stage === start
        ? "syncing"
        : "waiting";
}

export function SyncNetwork() {
  const {
    stage,
    playing,
    complete,
    active,
    reducedMotion,
    figureRef,
    replay,
    toggle,
  } = useGraphPlayback(times, duration);
  const svgRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const phases = coworkers.map((_, index) => phaseAt(stage, index));
  const traveling = phases.indexOf("syncing");
  const published = stage > 0;

  useEffect(() => {
    if (traveling >= 0 && !reducedMotion) motionRef.current?.beginElement();
  }, [traveling, reducedMotion]);

  useEffect(() => {
    if (active) svgRef.current?.unpauseAnimations();
    else svgRef.current?.pauseAnimations();
  }, [active]);

  return (
    <div className="sync-network-view">
      <div className="sync-network-heading">
        <h3>
          Publish once.
          <br />
          <em>Pick it up when you’re ready.</em>
        </h3>
        <p>
          Publish the reviewed knowledge to your shared repository. Each
          teammate explicitly syncs and reindexes their own local copy.
        </p>
      </div>
      <figure
        ref={figureRef}
        className="sync-network"
        data-playing={active}
        data-stage={stage}
        aria-label="Animated example of publishing a company brain and coworkers syncing it in sequence"
        aria-describedby="sync-demo-description"
      >
        <div
          className={
            "sync-network-root" + (stage === 1 ? " sync-root-publishing" : "")
          }
        >
          <GitBranch size={26} strokeWidth={1.4} aria-hidden="true" />
          <div>
            <strong>Shared repository</strong>
            <span>Published version {published ? "B" : "A"}</span>
          </div>
          <span className="sync-network-published" key={published ? "B" : "A"}>
            {published ? "B" : "A"}
          </span>
        </div>
        <svg
          ref={svgRef}
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
          {traveling >= 0 && !reducedMotion ? (
            <circle key={traveling} className="sync-version-packet" r="5">
              <animateMotion
                ref={motionRef}
                path={connections[traveling]}
                dur="1.4s"
                fill="freeze"
                begin="indefinite"
              />
            </circle>
          ) : null}
        </svg>
        <ol className="sync-network-coworkers">
          {coworkers.map((name, index) => {
            const phase = phases[index];
            return (
              <li key={name} className={"sync-coworker sync-coworker-" + phase}>
                <div className="sync-coworker-avatar" aria-hidden="true">
                  <Laptop size={26} strokeWidth={1.3} />
                </div>
                <h4>{name}</h4>
                <div className="sync-coworker-snapshot">
                  <dl>
                    <div>
                      <dt>Local brain</dt>
                      <dd>
                        {phase === "waiting" || phase === "syncing" ? "A" : "B"}
                      </dd>
                    </div>
                    <div>
                      <dt>Search index</dt>
                      <dd>{phase === "ready" ? "B" : "A"}</dd>
                    </div>
                  </dl>
                  <p>
                    {phase === "waiting"
                      ? "Version A"
                      : phase === "syncing"
                        ? "Syncing…"
                        : phase === "indexing"
                          ? "Rebuilding index…"
                          : "Ready to search"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
        <figcaption>
          <p className="sync-sequence-caption">{captions[stage]}</p>
          <div className="sync-playback-controls">
            <button
              type="button"
              aria-label={
                playing ? "Pause sync animation" : "Play sync animation"
              }
              aria-pressed={playing}
              onClick={toggle}
            >
              {playing ? (
                <Pause size={13} aria-hidden="true" />
              ) : (
                <Play size={13} aria-hidden="true" />
              )}
              {playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay sync animation"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Replay
            </button>
          </div>
          <span className="sr-only" role="status">
            {complete
              ? "Example complete. All coworkers have version B and a matching search index."
              : ""}
          </span>
        </figcaption>
      </figure>
      <div className="sync-network-note">
        <p id="sync-demo-description">
          Animated illustration only. Real sync is explicit, and search requires
          a matching index. No commands run here.
        </p>
        <a href="https://github.com/MarvinAmador7/groundray/blob/main/docs/cli.md">
          Sync and indexing docs <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
