import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  GitBranch,
  Pause,
  Play,
  RefreshCw,
  UserRound,
} from "lucide-react";
import "../sync-network.css";

const coworkers = ["You", "Coworker 1", "Coworker 2"];
const connections = [
  "M450 0 V18 C450 56 150 38 150 88",
  "M450 0 V88",
  "M450 0 V18 C450 56 750 38 750 88",
];
const times = [0, 1000, 2200, 3600, 4600, 6000, 7000, 8400, 9400];
const duration = 11200;
const captions = [
  "Everyone is working from version A.",
  "A reviewed update is published as version B.",
  "You choose to sync the new version.",
  "Your local search index is rebuilt.",
  "Coworker 1 syncs next. Your copy is ready.",
  "Coworker 1 rebuilds their index.",
  "Coworker 2 syncs when they’re ready.",
  "Coworker 2 rebuilds their index.",
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
  const [stage, setStage] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [complete, setComplete] = useState(false);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState<boolean | null>(null);
  const figureRef = useRef<HTMLElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const elapsedRef = useRef(0);
  const stageRef = useRef(0);
  const active =
    playing && visible && pageVisible && !complete && reducedMotion !== null;
  const phases = coworkers.map((_, index) => phaseAt(stage, index));
  const traveling = phases.indexOf("syncing");
  const published = stage > 0;

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    function updatePreference() {
      setReducedMotion(preference.matches);
      if (preference.matches) {
        elapsedRef.current = duration;
        stageRef.current = 8;
        setStage(8);
        setComplete(true);
        setPlaying(false);
      }
    }
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.45),
      { threshold: 0.45 },
    );
    if (figureRef.current) observer.observe(figureRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(!document.hidden);
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () =>
      document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (!active) return;
    let request = 0;
    let previous: number | null = null;
    function tick(now: number) {
      if (previous !== null) elapsedRef.current += now - previous;
      previous = now;
      if (elapsedRef.current >= duration) {
        stageRef.current = 8;
        setStage(8);
        setComplete(true);
        setPlaying(false);
        return;
      }
      let next = 0;
      for (let i = 1; i < times.length; i++)
        if (elapsedRef.current >= times[i]) next = i;
      if (next !== stageRef.current) {
        stageRef.current = next;
        setStage(next);
      }
      request = requestAnimationFrame(tick);
    }
    request = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(request);
  }, [active]);

  useEffect(() => {
    if (traveling >= 0 && !reducedMotion) motionRef.current?.beginElement();
  }, [traveling, reducedMotion]);

  useEffect(() => {
    if (active) svgRef.current?.unpauseAnimations();
    else svgRef.current?.pauseAnimations();
  }, [active]);

  function replay() {
    elapsedRef.current = 0;
    stageRef.current = 0;
    setStage(0);
    setComplete(false);
    setPlaying(true);
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
          Publish a shared version. Coworkers explicitly sync their copies and
          rebuild their local search indexes.
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
            <strong>Company brain</strong>
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
                  <UserRound size={26} strokeWidth={1.3} />
                </div>
                <h4>{name}</h4>
                <div className="sync-coworker-snapshot">
                  <dl>
                    <div>
                      <dt>Brain</dt>
                      <dd>
                        {phase === "waiting" || phase === "syncing" ? "A" : "B"}
                      </dd>
                    </div>
                    <div>
                      <dt>Index</dt>
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
              onClick={() =>
                complete ? replay() : setPlaying((value) => !value)
              }
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
