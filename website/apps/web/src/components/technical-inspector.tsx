import { useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import { Button } from "@website/ui/components/button";
import "../technical-inspector.css";
import { CollaborationNetwork } from "./collaboration-network";
import { SyncNetwork } from "./sync-network";

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
            <CollaborationNetwork />
          ) : (
            <SyncNetwork />
          )}
        </div>
      </div>
    </>
  );
}
