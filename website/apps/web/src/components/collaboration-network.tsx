import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  FileText,
  MessageSquare,
  Pause,
  Play,
  RefreshCw,
} from "lucide-react";
import { useGraphPlayback } from "../hooks/use-graph-playback";
import "../sync-network.css";
import "../collaboration-network.css";

const times = [0, 1000, 2300, 3700, 5400, 6800, 8200, 9600];
const duration = 12000;
const captions = [
  "Maya turns a delivery experience into a draft lesson.",
  "Her first draft includes the original kickoff note.",
  "Sam reads the draft and checks it against that note.",
  "Sam spots a missing condition and asks Maya to correct it.",
  "That feedback goes back to the author.",
  "Maya revises the lesson, keeping the source attached.",
  "Sam inspects the revised proposal and its evidence.",
  "The revised proposal is ready for publication. Nothing has been published yet.",
];
const widePaths = [
  "M130 140 H252",
  "M648 140 H770",
  "M800 110 C800 5 100 5 100 110",
];
const narrowPaths = [
  "M288 48 C350 48 360 130 450 190",
  "M450 190 C540 130 550 48 612 48",
  "M675 25 C675 -3 225 -3 225 25",
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
  const [narrow, setNarrow] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const motionRef = useRef<SVGAnimateMotionElement>(null);
  const traveling =
    stage === 1 || stage === 5
      ? 0
      : stage === 2 || stage === 6
        ? 1
        : stage === 4
          ? 2
          : -1;
  const revised = stage >= 5;
  const reviewed = stage === 7;
  const paths = narrow ? narrowPaths : widePaths;

  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => setNarrow(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (traveling >= 0 && !reducedMotion) motionRef.current?.beginElement();
  }, [traveling, reducedMotion, narrow]);
  useEffect(() => {
    if (active) svgRef.current?.unpauseAnimations();
    else svgRef.current?.pauseAnimations();
  }, [active]);

  return (
    <div className="collaboration-network-view">
      <div className="sync-network-heading">
        <h3>
          Different perspectives.
          <br />
          <em>Better company knowledge.</em>
        </h3>
        <p>
          One teammate writes. Another checks the evidence. Feedback improves
          the draft before it’s published.
        </p>
      </div>
      <figure
        ref={figureRef}
        className="collaboration-network"
        data-stage={stage}
        data-playing={active}
        aria-label="Illustrative collaboration: Maya drafts a lesson, Sam requests a correction, and Maya revises it for review"
        aria-describedby="collaboration-demo-description"
      >
        <div className="collaboration-workspace">
          <svg
            ref={svgRef}
            viewBox={narrow ? "0 0 900 480" : "0 0 900 340"}
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
                  (stage >= [1, 2, 4][index] ? " is-used" : "")
                }
              />
            ))}
            {traveling >= 0 && !reducedMotion ? (
              <circle
                key={`${stage}-${narrow}`}
                className="collaboration-packet"
                r="5"
              >
                <animateMotion
                  ref={motionRef}
                  path={paths[traveling]}
                  dur="1.3s"
                  fill="freeze"
                  begin="indefinite"
                />
              </circle>
            ) : null}
          </svg>
          <div
            className={
              "collaboration-teammate collaboration-author" +
              (stage === 0 || stage === 1 || stage === 5 ? " is-working" : "")
            }
          >
            <span className="collaboration-avatar" aria-hidden="true">
              M
            </span>
            <h4>
              Maya <span>Delivery</span>
            </h4>
            <p>{revised ? "Revises the lesson" : "Writes the first draft"}</p>
          </div>
          <div
            className={
              "collaboration-teammate collaboration-reviewer" +
              (stage === 2 || stage === 3 || stage === 6 ? " is-working" : "")
            }
          >
            <span className="collaboration-avatar" aria-hidden="true">
              S
            </span>
            <h4>
              Sam <span>Sales</span>
            </h4>
            <p>{reviewed ? "Checks the revision" : "Checks the source"}</p>
          </div>
          <div
            className={
              "collaboration-feedback" + (stage >= 3 ? " is-visible" : "")
            }
            aria-hidden={stage < 3}
          >
            <MessageSquare size={13} aria-hidden="true" />
            <p>
              {reviewed
                ? "That matches the note. Ready to publish."
                : "We need to confirm scope first."}
            </p>
          </div>
          <article
            className={"collaboration-draft" + (revised ? " is-revised" : "")}
            aria-label="Example draft lesson"
          >
            <div className="collaboration-draft-top">
              <span>
                <FileText size={13} aria-hidden="true" /> Launch handoff
              </span>
              <span>{reviewed ? "Reviewed draft" : "Draft"}</span>
            </div>
            <p className="collaboration-lesson">
              {stage === 0
                ? "What should we carry into the next launch?"
                : revised
                  ? "Confirm scope before sharing a launch date."
                  : "Share a launch date with every quote."}
            </p>
            <div className="collaboration-source">
              <span>Original kickoff note</span>
              <blockquote>
                “Confirm scope before committing to a launch date.”
              </blockquote>
            </div>
            <div className="collaboration-draft-status">
              {reviewed ? (
                <>
                  <Check size={13} aria-hidden="true" /> Revised proposal ready
                  to publish
                </>
              ) : revised ? (
                "Updated after Sam’s feedback"
              ) : (
                "Maya’s proposal · not published"
              )}
            </div>
          </article>
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
              ? "Example complete. Maya revised the lesson after Sam’s source check. The revised proposal is ready for publication; it has not been published or synced."
              : ""}
          </span>
        </figcaption>
      </figure>
      <div className="sync-network-note">
        <p id="collaboration-demo-description">
          Fictional example. Each revision is a new proposal; review pins its
          exact commit. Publication is a separate, explicit step under your Git
          host’s permissions.
        </p>
        <a href="https://github.com/MarvinAmador7/groundray/blob/main/docs/brain-collaboration.md">
          Collaboration docs <ArrowRight size={13} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
