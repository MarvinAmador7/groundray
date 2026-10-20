import {
  ArrowDown,
  ArrowRight,
  Check,
  FileText,
  GitBranch,
  Leaf,
  MessageSquare,
  Terminal,
  Users,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@website/ui/components/tabs";
import { useState, type ReactNode } from "react";
import { BrainChatDemo } from "./brain-chat-demo";

const scenarios = [
  {
    id: "teammate",
    number: "01",
    title: "A new teammate.",
    icon: Users,
    heading: "Day one. With a head start.",
    description:
      "Give them the reasoning, not another scavenger hunt. Decisions, definitions, and procedures have somewhere to live.",
    outcome: "The process. The exceptions. The reason why.",
    benefit: "Less retelling. More getting started.",
  },
  {
    id: "project",
    number: "02",
    title: "A new project.",
    icon: GitBranch,
    heading: "A fresh start. Not a blank page.",
    description:
      "Bring earlier decisions and their original records into the next project. Keep the lessons that are easy to leave behind.",
    outcome: "The decision. The tradeoffs. The original brief.",
    benefit: "Build on the lesson. Keep the context.",
  },
  {
    id: "tool",
    number: "03",
    title: "A new AI tool.",
    icon: Terminal,
    heading: "A different tool. The same ground.",
    description:
      "Connect your brain to Codex or Claude Code, or work from the terminal. Your company context stays in a repository you control.",
    outcome: "Your decisions. Your procedures. Your sources.",
    benefit: "Choose your tool. Bring your knowledge.",
  },
] as const;

function DocumentLines() {
  return (
    <div className="document-lines" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </div>
  );
}

export function ContinuityExplorer() {
  const [selected, setSelected] = useState("teammate");
  return (
    <Tabs
      value={selected}
      onValueChange={(value) => setSelected(String(value))}
      className="continuity-explorer"
    >
      <TabsList
        className="scenario-tabs"
        aria-label="Explore what a company brain makes possible"
      >
        {scenarios.map((scenario) => (
          <TabsTrigger key={scenario.id} value={scenario.id}>
            <span aria-hidden="true">{scenario.number}</span>
            <scenario.icon size={17} aria-hidden="true" />
            {scenario.title}
            <ArrowRight size={16} aria-hidden="true" />
          </TabsTrigger>
        ))}
      </TabsList>
      {scenarios.map((scenario) => (
        <TabsContent
          key={scenario.id}
          value={scenario.id}
          className="scenario-panel"
        >
          <BrainChatDemo scenario={scenario.id} />
          <div className="scenario-caption">
            <div>
              <span className="eyebrow">{scenario.benefit}</span>
              <h3>{scenario.heading}</h3>
            </div>
            <p>{scenario.description}</p>
          </div>
          <p className="scenario-outcome">
            <span className="status-dot" />
            {scenario.outcome}
          </p>
        </TabsContent>
      ))}
    </Tabs>
  );
}

export function WorkflowVisual({ step }: { step: string }) {
  if (step === "01")
    return (
      <div
        className="workflow-art workflow-home"
        aria-label="Connect decisions, procedures, and sources to a company brain"
      >
        <div className="mini-document document-a">
          <FileText size={14} />
          <span>Decisions</span>
          <DocumentLines />
        </div>
        <div className="mini-document document-b">
          <FileText size={14} />
          <span>Procedures</span>
          <DocumentLines />
        </div>
        <div className="mini-document document-c">
          <FileText size={14} />
          <span>Sources</span>
          <DocumentLines />
        </div>
        <div className="mini-brain">
          <Leaf size={17} aria-hidden="true" />
          <span>Company brain</span>
          <span className="status-dot" />
        </div>
      </div>
    );
  if (step === "02")
    return (
      <div
        className="workflow-art workflow-ask"
        aria-label="A question connects to an answer with source references"
      >
        <div className="mini-question">
          <MessageSquare size={13} aria-hidden="true" />
          What did we decide?
        </div>
        <div className="mini-answer">
          <span className="eyebrow">ANSWER, WITH CONTEXT</span>
          <p>
            Here’s the decision.
            <br />
            <em>And what it rests on.</em>
          </p>
          <div>
            <span>
              <FileText size={12} />
              Decision
            </span>
            <span>
              <FileText size={12} />
              Original brief
            </span>
          </div>
        </div>
        <span className="workflow-art-note">Illustrative answer</span>
      </div>
    );
  return (
    <div
      className="workflow-art workflow-review"
      aria-label="Propose an update, review it, then explicitly publish"
    >
      <div className="review-document">
        <div>
          <GitBranch size={13} aria-hidden="true" />
          <span>Proposed update</span>
          <span className="draft-tag">Draft</span>
        </div>
        <p>
          <span>+</span> Capture the new reasoning.
        </p>
        <p>
          <span>+</span> Keep the supporting record.
        </p>
      </div>
      <div className="review-path">
        <span>Draft</span>
        <ArrowRight size={13} />
        <span>Review</span>
        <ArrowRight size={13} />
        <span className="publish-label">Publish</span>
      </div>
      <span className="workflow-art-note">
        Explicit review. Explicit publication.
      </span>
    </div>
  );
}

export function PortableBrain({
  command,
  copyControl,
}: {
  command: string;
  copyControl: ReactNode;
}) {
  return (
    <div className="portability-visual">
      <div className="portable-orbit">
        <span className="orbit-label">OWN THE CONTEXT. CHOOSE THE TOOL.</span>
        <div className="portable-folio">
          <div className="folio-page page-one">
            <FileText size={17} />
            <span>Original records</span>
          </div>
          <div className="folio-page page-two">
            <GitBranch size={17} />
            <span>Decisions & history</span>
          </div>
          <div className="folio-front">
            <span className="folio-tab">YOURS</span>
            <Leaf size={30} strokeWidth={1.1} aria-hidden="true" />
            <h3>
              Your company.
              <br />
              <em>In your keeping.</em>
            </h3>
            <span className="folio-format">MARKDOWN + GIT</span>
          </div>
        </div>
        <div className="orbit-badge">
          <ArrowDown size={15} aria-hidden="true" />
          <span>Same knowledge. Different doorway.</span>
        </div>
      </div>
      <ul
        className="portable-tools"
        aria-label="Use your company brain with these tools"
      >
        <li>
          <img
            src="/images/tools/codex.png"
            width="48"
            height="48"
            alt=""
            loading="lazy"
          />
          <span>Codex</span>
        </li>
        <li>
          <img
            src="/images/tools/claude-code.png"
            width="48"
            height="48"
            alt=""
            loading="lazy"
          />
          <span>Claude Code</span>
        </li>
        <li>
          <span className="portable-terminal-mark" aria-hidden="true">
            <Terminal size={27} strokeWidth={1.4} />
          </span>
          <span>Terminal</span>
        </li>
      </ul>
      <div className="portable-command">
        <div>
          <code>{command}</code>
          {copyControl}
        </div>
        <p>One CLI. The same company knowledge.</p>
      </div>
    </div>
  );
}
