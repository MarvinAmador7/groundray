import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  GitBranch,
  GitCommitHorizontal,
  GitPullRequest,
  FileText,
  Monitor,
  RefreshCw,
} from "lucide-react";
import { Button } from "@website/ui/components/button";
import "../technical-inspector.css";

const views = [
  { id: "provenance", label: "Provenance" },
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

function ProvenanceView() {
  return (
    <div className="system-detail-grid">
      <div className="system-example provenance-example">
        <div className="system-example-top">
          <span>
            <FileText size={14} aria-hidden="true" /> procedures/onboarding.md
          </span>
          <span className="system-draft">draft</span>
        </div>
        <pre aria-label="Illustrative knowledge metadata excerpt">
          <code>
            {
              "type: procedure\nstatus: draft\ngenerated:\n  method: agent-generated\nsources:\n  - resource: references/captures/brief.md.txt\nconfidence:\n  level: medium"
            }
          </code>
        </pre>
        <div className="system-source-link">
          <span aria-hidden="true">↳</span>
          <div>
            <strong>Original record attached</strong>
            <p>references/captures/brief.md.txt</p>
          </div>
        </div>
        <span className="system-example-caption">
          Illustrative metadata excerpt
        </span>
      </div>
      <div className="system-explanation">
        <h3>
          What you know.
          <br />
          <em>Why you believe it.</em>
        </h3>
        <dl className="system-facts">
          <div>
            <dt>Identity & origin</dt>
            <dd>
              A stable item ID, producer, method, and timestamps record where
              the current content came from—even if its file moves.
            </dd>
          </div>
          <div>
            <dt>Evidence & version</dt>
            <dd>
              Sources link knowledge to original records. Citations identify the
              company brain, item, source location, and exact saved commit.
            </dd>
          </div>
          <div>
            <dt>State & review</dt>
            <dd>
              Draft, stable, and deprecated states distinguish intended use.
              Confidence, verification events, and review dates carry separate
              meaning.
            </dd>
          </div>
        </dl>
        <p className="system-boundary">
          A material edit invalidates prior verification. Publishing does not
          mark a claim verified or approved by the business.
        </p>
        <a className="system-doc-link" href={`${docs}/schema.md`}>
          Inspect the knowledge format{" "}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function CollaborationView() {
  const roles = [
    {
      icon: GitBranch,
      name: "Contributor",
      action: "Draft & propose",
      description:
        "Save a scoped change with its sources. Publish a new proposal ref without advancing shared main.",
    },
    {
      icon: GitPullRequest,
      name: "Reviewer",
      action: "Inspect the exact candidate",
      description:
        "Read the patch and original records at a pinned proposal commit. The installed brain stays unchanged.",
    },
    {
      icon: GitCommitHorizontal,
      name: "Publisher",
      action: "Accept the reviewed version",
      description:
        "Explicitly publish the exact candidate against the reviewed base, subject to Git-host permissions and rules.",
    },
  ];
  return (
    <div className="system-collaboration">
      <div className="system-detail-heading">
        <div>
          <h3>
            One shared brain.
            <br />
            <em>A deliberate path to change it.</em>
          </h3>
        </div>
        <p>
          Contributors, reviewers, and publishers are workflow responsibilities.
          Your Git host controls repository access; your company decides who can
          approve business decisions.
        </p>
      </div>
      <ol className="system-roles">
        {roles.map(({ icon: Icon, name, action, description }) => (
          <li key={name}>
            <div className="system-role-label">
              <span>{name}</span>
              <Icon size={19} aria-hidden="true" />
            </div>
            <h4>{action}</h4>
            <p>{description}</p>
          </li>
        ))}
      </ol>
      <div className="system-review-versions">
        <span>
          <GitBranch size={15} aria-hidden="true" /> Published base{" "}
          <strong>A</strong>
        </span>
        <ArrowRight size={17} aria-hidden="true" />
        <span>
          Proposal <strong>B</strong>
        </span>
        <ArrowRight size={17} aria-hidden="true" />
        <span>
          Review <strong>B</strong>
        </span>
        <ArrowRight size={17} aria-hidden="true" />
        <span className="system-reviewed-version">
          Publish the same <strong>B</strong>
        </span>
      </div>
      <div className="system-collaboration-footer">
        <p>
          Changed base or moved proposal? The checked publication is refused.
          Existing branch rules remain in force.
        </p>
        <a className="system-doc-link" href={`${docs}/brain-collaboration.md`}>
          Read the collaboration contract{" "}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

function SyncView() {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const installed = step === 0 ? "A" : "B";
  const indexed = step === 2 ? "B" : "A";
  return (
    <div className="system-detail-grid system-sync-grid">
      <div className="system-sync-example">
        <div className="system-remote">
          <span className="technical-diagram-label">
            <GitBranch size={14} aria-hidden="true" /> Shared Git remote
          </span>
          <div>
            <strong>Published version</strong>
            <span className="system-version">B</span>
          </div>
          <p>Publication advances the shared ref.</p>
        </div>
        <div className="system-sync-arrow">
          <ArrowDown size={19} aria-hidden="true" />
          <span>Explicit sync on each installation</span>
        </div>
        <div
          className="system-installation"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="system-example-top">
            <span>
              <Monitor size={15} aria-hidden="true" /> One teammate’s machine
            </span>
          </div>
          <div className="system-pins">
            <div>
              <span>Installed brain</span>
              <strong>{installed}</strong>
            </div>
            <div>
              <span>Search index</span>
              <strong>{indexed}</strong>
            </div>
          </div>
          <p
            className={`system-sync-state ${step === 1 ? "system-needs-index" : ""}`}
          >
            {step === 0
              ? "Reading the earlier published version"
              : step === 1
                ? "New brain installed · reindex required"
                : "Versions match · ready to search"}
          </p>
        </div>
        <div className="system-sync-controls">
          <Button
            variant="ghost"
            disabled={step !== 0}
            onClick={() => setStep(1)}
          >
            1. Sync this installation
          </Button>
          <Button
            variant="ghost"
            disabled={step !== 1}
            onClick={() => setStep(2)}
          >
            2. Rebuild its index
          </Button>
          <button
            type="button"
            className="system-reset"
            onClick={() => setStep(0)}
            aria-label="Reset sync example"
          >
            <RefreshCw size={14} aria-hidden="true" />
          </button>
        </div>
        <span className="system-example-caption">
          Interactive example · no commands run
        </span>
      </div>
      <div className="system-explanation">
        <h3>
          Publish once.
          <br />
          <em>Sync deliberately.</em>
        </h3>
        <dl className="system-facts">
          <div>
            <dt>Install a known version</dt>
            <dd>
              Each brain has its own identity, repository, installed commit, and
              local search index. Company scopes stay separate.
            </dd>
          </div>
          <div>
            <dt>Validate before advancing</dt>
            <dd>
              Sync checks identity, clean state, and the candidate bundle. It
              accepts fast-forward history and refuses divergence or invalid
              content.
            </dd>
          </div>
          <div>
            <dt>Search the matching snapshot</dt>
            <dd>
              After a change, rebuild the index for that saved commit. Groundray
              refuses to search with a mismatched index.
            </dd>
          </div>
        </dl>
        <p className="system-boundary">
          Publishing doesn’t sync the publisher or other teammates. There is no
          background merge; prior versions remain in Git history.
        </p>
        <a className="system-doc-link" href={`${docs}/cli.md`}>
          Read the sync and indexing contract{" "}
          <ArrowRight size={14} aria-hidden="true" />
        </a>
      </div>
    </div>
  );
}

export function TechnicalInspector() {
  const [view, setView] = useState<View>("provenance");
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
          aria-label={`${views.find((v) => v.id === view)?.label} details`}
        >
          {view === "provenance" ? (
            <ProvenanceView />
          ) : view === "collaboration" ? (
            <CollaborationView />
          ) : (
            <SyncView />
          )}
        </div>
      </div>
    </>
  );
}
