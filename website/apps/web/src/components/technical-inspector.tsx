import { ArrowRight, FileText } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@website/ui/components/tabs";
import { ComputerFlow } from "./computer-flow";
import "../technical-inspector.css";
import { CollaborationNetwork } from "./collaboration-network";
import { SyncNetwork } from "./sync-network";

const views = [
  { id: "overview", label: "Files & tools" },
  { id: "provenance", label: "Provenance" },
  { id: "collaboration", label: "Collaboration" },
  { id: "sync", label: "Publish & sync" },
] as const;
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
          A source behind the claim.
          <br />
          <em>A history behind the file.</em>
        </h3>
        <dl className="system-facts">
          <div>
            <dt>Identity & origin</dt>
            <dd>
              A stable ID, producer, method, and timestamps preserve an item’s
              origin, even when its file moves.
            </dd>
          </div>
          <div>
            <dt>Evidence & version</dt>
            <dd>
              Original records stay attached. Citations identify the source
              location and exact saved Git commit.
            </dd>
          </div>
          <div>
            <dt>State & review</dt>
            <dd>
              Draft status, confidence, and human verification carry different
              meanings. A material edit invalidates prior verification.
            </dd>
          </div>
        </dl>
        <p className="system-boundary">
          Publishing does not mark a claim verified or approved by the business.
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
  return (
    <Tabs defaultValue="overview" className="technical-explorer">
      <TabsList
        className="technical-view-tabs"
        aria-label="Explore how Groundray works"
      >
        {views.map(({ id, label }) => (
          <TabsTrigger key={id} value={id}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value="overview" className="technical-view-panel">
        <ComputerFlow />
        <div className="technical-overview-note">
          <p>
            Search runs locally. Retrieved evidence enters your AI tool’s
            context under your provider’s settings.
          </p>
          <a href={`${docs}/cli.md`}>
            Read the technical docs <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </TabsContent>
      <TabsContent value="provenance" className="technical-view-panel">
        <ProvenanceView />
      </TabsContent>
      <TabsContent value="collaboration" className="technical-view-panel">
        <CollaborationNetwork />
      </TabsContent>
      <TabsContent value="sync" className="technical-view-panel">
        <SyncNetwork />
      </TabsContent>
    </Tabs>
  );
}
