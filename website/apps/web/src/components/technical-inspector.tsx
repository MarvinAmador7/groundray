import { useState, type ReactNode } from "react";
import {
  ArrowDown,
  ArrowRight,
  Check,
  GitBranch,
  RefreshCw,
} from "lucide-react";
import { Button } from "@website/ui/components/button";
import "../technical-inspector.css";

const views = [
  { id: "collaboration", label: "Collaboration" },
  { id: "sync", label: "Publish & sync" },
] as const;
type View = (typeof views)[number]["id"];
const lifecycle = [
  "Capture & draft",
  "Propose",
  "Review",
  "Publish",
  "Sync",
  "Reindex",
];
const docs = "https://github.com/MarvinAmador7/groundray/blob/main/docs";

function Person({ light = false }: { light?: boolean }) {
  return (
    <svg
      className="team-person"
      viewBox="0 0 86 106"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M15 103V69c0-14 8-23 21-23 12 0 20 7 23 19l7 14 17 3"
        fill={light ? "#c6d5b2" : "#829b64"}
      />
      <path
        d="M38 46v-9m-14 66V76m25-9 12 20 20 3"
        stroke="#303f25"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M24 26c0-12 7-20 18-20 12 0 20 8 20 20v9c0 10-7 17-17 17S24 43 24 33v-7Z"
        fill="#d8ceb2"
      />
      <path
        d={
          light
            ? "M22 29C15 11 27 1 42 2c17 0 25 13 21 26l-7-12-25 3-9 10Z"
            : "M23 30c-8-15 1-29 18-29 13 0 22 8 22 22l-13-9-18 8-9 8Z"
        }
        fill="#3b4930"
      />
      <path
        d="M57 29h4m-9 12h5"
        stroke="#796b50"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M6 104h78"
        stroke="#738762"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
function Workstation({
  title,
  children,
  light = false,
}: {
  title: string;
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <div className={"team-workstation" + (light ? " team-light" : "")}>
      <div className="agent-monitor team-device">
        <div className="agent-monitor-frame">
          <div className="device-camera" />
          <div className="agent-monitor-screen">
            <div className="team-window-title">{title}</div>
            <div className="team-window-content">{children}</div>
          </div>
        </div>
        <div className="agent-monitor-neck" />
        <div className="agent-monitor-foot" />
      </div>
      <Person light={light} />
    </div>
  );
}
function Connector() {
  return (
    <div className="team-connector" aria-hidden="true">
      <span />
      <ArrowRight size={19} />
      <ArrowDown size={19} />
    </div>
  );
}
function CollaborationView() {
  return (
    <div className="team-view">
      <div className="team-heading">
        <h3>
          One shared brain.
          <br />
          <em>Built together.</em>
        </h3>
        <p>
          Propose a change, inspect its sources, and publish the exact reviewed
          version.
        </p>
      </div>
      <figure
        className="team-collaboration"
        aria-label="A contributor proposes B, a reviewer inspects B, and a publisher publishes the same B"
      >
        <div className="team-collaboration-flow">
          <div className="team-station">
            <Workstation title="Contributor · proposal B">
              <span className="team-file-name">onboarding.md</span>
              <p className="team-diff-removed">− Handoff after discovery.</p>
              <p className="team-diff-added">+ Confirm scope first.</p>
              <div className="team-screen-rule" />
              <p className="team-screen-source">↳ original brief attached</p>
              <span className="team-commit">
                proposal <strong>B</strong>
              </span>
            </Workstation>
            <div className="team-caption">
              <h4>Propose</h4>
              <p>
                A sourced change on its own ref.
                <br />
                Published main stays at A.
              </p>
            </div>
          </div>
          <Connector />
          <div className="team-station">
            <Workstation title="Reviewer · exact commit B" light>
              <span className="team-file-name">Review the candidate</span>
              <div className="team-review-line">
                <Check size={13} aria-hidden="true" /> Read the change
              </div>
              <div className="team-review-line">
                <Check size={13} aria-hidden="true" /> Inspect original sources
              </div>
              <div className="team-screen-rule" />
              <span className="team-commit">
                review <strong>B</strong>
              </span>
            </Workstation>
            <div className="team-caption">
              <h4>Review</h4>
              <p>
                Inspect the proposal and originals
                <br />
                at the same saved commit.
              </p>
            </div>
          </div>
          <Connector />
          <div className="team-station">
            <Workstation title="Publisher · shared main">
              <div className="team-publish-symbol">
                <GitBranch size={25} strokeWidth={1.3} aria-hidden="true" />
                <span>A</span>
                <ArrowRight size={18} aria-hidden="true" />
                <strong>B</strong>
              </div>
              <p className="team-screen-source">
                Publish the reviewed candidate.
              </p>
              <div className="team-screen-rule" />
              <span className="team-commit">
                published <strong>B</strong>
              </span>
            </Workstation>
            <div className="team-caption">
              <h4>Publish</h4>
              <p>
                Advance main to the reviewed B.
                <br />
                Keep the earlier history.
              </p>
            </div>
          </div>
        </div>
        <figcaption>
          Illustrated workflow. A and B represent saved Git commits.
        </figcaption>
      </figure>
      <div className="team-note">
        <p>
          Git-host permissions and branch rules control publication. Company
          approval remains a separate decision.
        </p>
        <a href={docs + "/brain-collaboration.md"}>
          Collaboration docs <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
function SyncView() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const installed = step === 0 ? "A" : "B",
    indexed = step === 2 ? "B" : "A";
  return (
    <div className="team-view">
      <div className="team-heading">
        <h3>
          A shared version.
          <br />
          <em>On your own machine.</em>
        </h3>
        <p>
          Publishing makes a version available. Each teammate explicitly syncs,
          then rebuilds their local search index.
        </p>
      </div>
      <figure
        className="team-sync"
        aria-label="Published B is available to two installations. Sync and reindex update only the first installation."
      >
        <div className="team-shared-repository">
          <div className="team-repo-tab" />
          <div className="team-repo-body">
            <GitBranch size={24} strokeWidth={1.3} aria-hidden="true" />
            <div>
              <strong>Company brain</strong>
              <span>Published version B</span>
            </div>
            <span className="team-repo-version">B</span>
          </div>
        </div>
        <div className="team-sync-branches" aria-hidden="true">
          <span />
          <ArrowDown size={18} />
          <ArrowDown size={18} />
        </div>
        <div className="team-sync-machines">
          <div className="team-station">
            <Workstation title="Your installation · Groundray">
              <div
                className="team-version-pins"
                aria-live="polite"
                aria-atomic="true"
              >
                <div>
                  <span>Brain</span>
                  <strong>{installed}</strong>
                </div>
                <div>
                  <span>Index</span>
                  <strong>{indexed}</strong>
                </div>
                <p>
                  {step === 0
                    ? "Earlier version installed"
                    : step === 1
                      ? "Reindex required"
                      : "Matching versions · search ready"}
                </p>
              </div>
              <p className="team-sync-command">
                {step === 0
                  ? "$ groundray brain sync team"
                  : "$ groundray search index team"}
              </p>
            </Workstation>
            <div className="team-caption">
              <h4>Your machine</h4>
              <p>
                {step === 0
                  ? "Read A until you choose to sync."
                  : step === 1
                    ? "Brain B is installed. The index is still A."
                    : "Brain B and index B are ready."}
              </p>
            </div>
            <div className="team-sync-controls">
              <Button
                variant="ghost"
                disabled={step !== 0}
                onClick={() => setStep(1)}
              >
                1. Sync
              </Button>
              <Button
                variant="ghost"
                disabled={step !== 1}
                onClick={() => setStep(2)}
              >
                2. Reindex
              </Button>
              <button
                className="team-reset"
                type="button"
                aria-label="Reset sync example"
                onClick={() => setStep(0)}
              >
                <RefreshCw size={14} aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="team-station">
            <Workstation title="Another teammate · their installation" light>
              <div className="team-version-pins">
                <div>
                  <span>Brain</span>
                  <strong>A</strong>
                </div>
                <div>
                  <span>Index</span>
                  <strong>A</strong>
                </div>
                <p>Still using saved version A</p>
              </div>
              <p className="team-sync-command">No background update.</p>
            </Workstation>
            <div className="team-caption">
              <h4>Their machine</h4>
              <p>Stays at A until they explicitly sync.</p>
            </div>
          </div>
        </div>
        <figcaption>
          Interactive illustration. No commands run; only your illustrated
          installation changes.
        </figcaption>
      </figure>
      <div className="team-note">
        <p>
          Sync validates a fast-forward update. Search refuses a mismatched
          index; Git retains earlier versions.
        </p>
        <a href={docs + "/cli.md"}>
          Sync and indexing docs <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}
export function TechnicalInspector() {
  const [view, setView] = useState<View>("collaboration");
  return (
    <>
      <div className="system-lifecycle">
        <ol aria-label="Knowledge lifecycle">
          {lifecycle.map((label, i) => (
            <li key={label}>
              <span>{label}</span>
              {i < lifecycle.length - 1 ? (
                <ArrowRight size={14} aria-hidden="true" />
              ) : null}
            </li>
          ))}
        </ol>
      </div>
      <div className="system-inspector">
        <div className="system-inspector-toolbar">
          <div
            className="technical-modes"
            role="group"
            aria-label="Explore the knowledge system"
          >
            {views.map(({ id, label }) => (
              <Button
                key={id}
                variant="ghost"
                aria-pressed={view === id}
                aria-controls="system-detail"
                onClick={() => setView(id)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div
          id="system-detail"
          role="region"
          aria-label={
            (view === "collaboration" ? "Collaboration" : "Publish & sync") +
            " details"
          }
        >
          {view === "collaboration" ? <CollaborationView /> : <SyncView />}
        </div>
      </div>
    </>
  );
}
