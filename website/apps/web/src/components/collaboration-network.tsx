import { useEffect, useRef } from "react";
import {
  ArrowRight,
  Check,
  FileSearch,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useGraphPlayback } from "../hooks/use-graph-playback";
import "../sync-network.css";
import "../collaboration-network.css";

const times = [0, 1000, 2400, 3800, 5600, 7000, 8400, 9800];
const duration = 11600;
const paths = [
  "M450 0 C450 58 150 28 150 100",
  "M180 130 H420",
  "M480 130 H720",
  "M750 100 C750 28 450 58 450 0",
];
const captions = [
  "The team shares published version A.",
  "A contributor drafts B with its supporting sources. A stays published.",
  "The contributor shares B as a proposal, separate from main.",
  "A reviewer inspects the patch and original records at the exact B commit.",
  "The same candidate B moves forward for publication.",
  "The publisher checks B against the reviewed base A.",
  "The publisher explicitly publishes the reviewed B commit.",
  "B is now published. Each coworker still chooses when to sync.",
];
const roles = [
  {
    name: "Contributor",
    icon: GitPullRequest,
    action: "Draft + sources",
    start: 1,
    done: 3,
  },
  {
    name: "Reviewer",
    icon: FileSearch,
    action: "Patch + originals",
    start: 3,
    done: 5,
  },
  {
    name: "Publisher",
    icon: GitCommitHorizontal,
    action: "Exact commit + base",
    start: 5,
    done: 7,
  },
];

export function CollaborationNetwork() {
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
  const traveling = stage === 2 ? 1 : stage === 4 ? 2 : stage === 6 ? 3 : -1;
  const published = stage === 7;

  useEffect(() => {
    if (traveling >= 0 && !reducedMotion) motionRef.current?.beginElement();
  }, [traveling, reducedMotion]);

  useEffect(() => {
    if (active) svgRef.current?.unpauseAnimations();
    else svgRef.current?.pauseAnimations();
  }, [active]);

  return (
    <div className="collaboration-network-view">
      <div className="sync-network-heading">
        <h3>
          One shared brain.
          <br />
          <em>Every change has a path.</em>
        </h3>
        <p>
          Draft a proposal. Inspect its sources. Publish the exact reviewed
          version.
        </p>
      </div>
      <figure
        ref={figureRef}
        className="collaboration-network"
        data-stage={stage}
        data-playing={active}
        aria-label="Animated example of a proposal moving through contributor, reviewer, and publisher to the company brain"
        aria-describedby="collaboration-demo-description"
      >
        <div
          className={
            "sync-network-root" + (published ? " collaboration-published" : "")
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
        <div className="collaboration-graph">
          <svg
            ref={svgRef}
            viewBox="0 0 900 240"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
          >
            {paths.map((path, index) => (
              <path
                key={path}
                d={path}
                vectorEffect="non-scaling-stroke"
                className={
                  "collaboration-edge" +
                  (stage >= [1, 2, 4, 6][index]
                    ? " collaboration-edge-reached"
                    : "")
                }
              />
            ))}
            {traveling >= 0 && !reducedMotion ? (
              <circle key={traveling} className="collaboration-packet" r="5">
                <animateMotion
                  ref={motionRef}
                  path={paths[traveling]}
                  dur="1.4s"
                  fill="freeze"
                  begin="indefinite"
                />
              </circle>
            ) : null}
          </svg>
          <ol className="collaboration-people">
            {roles.map(({ name, icon: Icon, action, start, done }) => {
              const reached = stage >= start;
              const finished = stage >= done;
              return (
                <li
                  key={name}
                  className={
                    "collaboration-person" +
                    (reached ? " is-reached" : "") +
                    (reached && !finished ? " is-working" : "")
                  }
                >
                  <div className="collaboration-avatar">
                    <Icon size={25} strokeWidth={1.3} aria-hidden="true" />
                  </div>
                  <h4>{name}</h4>
                  <p>{action}</p>
                  <span
                    className="collaboration-candidate"
                    aria-label={
                      reached ? "Candidate B" : "Waiting for candidate"
                    }
                  >
                    {reached ? (
                      <>
                        B{" "}
                        {finished ? (
                          <Check size={12} aria-hidden="true" />
                        ) : null}
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
        <figcaption>
          <p className="sync-sequence-caption">{captions[stage]}</p>
          <div className="sync-playback-controls">
            <button
              type="button"
              aria-label={
                playing
                  ? "Pause collaboration animation"
                  : "Play collaboration animation"
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
              aria-label="Replay collaboration animation"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Replay
            </button>
          </div>
          <span className="sr-only" role="status">
            {complete
              ? "Example complete. The same candidate B was reviewed and published. Coworker copies await explicit sync."
              : ""}
          </span>
        </figcaption>
      </figure>
      <div className="sync-network-note">
        <p id="collaboration-demo-description">
          Illustrative workflow roles; Git-host permissions still apply. A moved
          proposal or changed base blocks checked publication. Publication does
          not record business approval or sync local copies.
        </p>
        <a href="https://github.com/MarvinAmador7/groundray/blob/main/docs/brain-collaboration.md">
          Collaboration docs <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
