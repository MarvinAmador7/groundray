import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  FileText,
  GitBranch,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@website/ui/components/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@website/ui/components/accordion";
import { HeroSetup } from "../components/hero-setup";
import "../signal.css";

const REPO = "https://github.com/MarvinAmador7/groundray";
const DOCS = `${REPO}/blob/main/docs`;

export function meta() {
  return [
    { title: "Groundray / A memory of your own" },
    {
      name: "description",
      content:
        "A shared brain for your team and AI. Markdown, Git, original evidence. Knowledge you own and carry forward.",
    },
    { name: "robots", content: "noindex, follow" },
  ];
}

function Wordmark() {
  return (
    <a className="signal-brand" href="#signal-top" aria-label="Groundray home">
      <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
        <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="square">
          <path d="M3 34h25M9 28l20-8M15 18 29 4M8 18l2-8" />
        </g>
      </svg>
      <span>groundray</span>
    </a>
  );
}

function SignalHeader() {
  return (
    <header className="signal-header">
      <Wordmark />
      <nav aria-label="Main navigation">
        <a href="#signal-product">Product</a>
        <a href="#signal-system">How it works</a>
        <a href={`${DOCS}/cli.md`}>
          Docs <ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
      <a className="signal-github" href={REPO}>
        GitHub <ArrowUpRight aria-hidden="true" />
      </a>
    </header>
  );
}

function SignalHero() {
  return (
    <section
      id="signal-top"
      className="signal-hero"
      aria-labelledby="signal-title"
    >
      <img
        className="signal-hero-art"
        src="/images/signal-archive.webp"
        width="1672"
        height="941"
        alt=""
        fetchPriority="high"
      />
      <div className="signal-hero-wash" />
      <SignalHeader />
      <div className="signal-hero-copy">
        <p className="signal-label">
          <span className="signal-dot" /> A SHARED BRAIN FOR YOUR TEAM + AI
        </p>
        <h1 id="signal-title">
          Stop
          <br />
          starting
          <br />
          <span>over.</span>
        </h1>
        <p className="signal-hero-description">
          Carry what your company learns forward
          <br className="signal-desktop-break" /> with the evidence behind it.
        </p>
        <HeroSetup />
        <p className="signal-hero-ownership">Yours to keep. Yours to move.</p>
      </div>
      <a href="#signal-product" className="signal-scroll">
        <span>THERE’S MORE TO REMEMBER</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}

function EvidenceDemo() {
  const [mode, setMode] = useState("ask");
  const [draft, setDraft] = useState(false);
  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(String(value))}
      className="signal-demo"
    >
      <div className="signal-demo-top">
        <span>
          <span className="signal-dot" /> mosaic-studio
        </span>
        <span>FICTIONAL EXAMPLE</span>
      </div>
      <TabsList
        aria-label="Explore company knowledge"
        className="signal-demo-tabs"
      >
        <TabsTrigger value="ask">
          01 <span>Ask</span>
        </TabsTrigger>
        <TabsTrigger value="trace">
          02 <span>Trace</span>
        </TabsTrigger>
        <TabsTrigger value="remember">
          03 <span>Remember</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ask" className="signal-demo-panel">
        <div className="signal-query">
          <span className="signal-label">YOU</span>
          <p>What can we promise Lumen about launch?</p>
        </div>
        <div className="signal-command">
          <Terminal size={15} aria-hidden="true" />
          <code>groundray search query "Lumen launch"</code>
          <Check size={14} aria-label="Illustrated search complete" />
        </div>
        <div className="signal-answer">
          <span className="signal-label">YOUR AGENT, WITH COMPANY CONTEXT</span>
          <h3>
            A date comes
            <br />
            after scope approval.
          </h3>
          <p>
            Lumen’s kickoff note makes approval a condition of launch. Confirm
            scope before sharing a date.
          </p>
          <button
            type="button"
            onClick={() => setMode("trace")}
            className="signal-text-link"
          >
            Read the original note <ArrowUpRight aria-hidden="true" />
          </button>
        </div>
        <div className="signal-demo-footnote">
          Illustrative answer. No commands or model calls run.
        </div>
      </TabsContent>
      <TabsContent value="trace" className="signal-demo-panel">
        <div className="signal-source-path">
          <FileText size={16} aria-hidden="true" />
          <span>references/captures/kickoff.md.txt</span>
        </div>
        <div className="signal-original">
          <span className="signal-label">ORIGINAL RECORD / LUMEN KICKOFF</span>
          <blockquote>
            “Lumen: confirm scope approval before committing to a launch date.”
          </blockquote>
          <p>
            The original stays attached to the knowledge derived from it. Check
            the source, its scope, and the saved version behind the answer.
          </p>
        </div>
        <dl className="signal-source-facts">
          <div>
            <dt>Source</dt>
            <dd>Original kickoff note</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Lumen launch</dd>
          </div>
          <div>
            <dt>Approval</dt>
            <dd>Still required</dd>
          </div>
        </dl>
        <div className="signal-demo-footnote">
          Fictional source. Provenance is inspectable evidence, not a guarantee
          of truth.
        </div>
      </TabsContent>
      <TabsContent value="remember" className="signal-demo-panel">
        <div className="signal-query">
          <span className="signal-label">YOUR AGENT</span>
          <p>
            This could matter next time. Save it as a business fact, with the
            kickoff note attached?
          </p>
        </div>
        <div className="signal-remember">
          <span className="signal-label">KNOWLEDGE, WITH INTENT</span>
          <h3>
            A useful thought.
            <br />A lasting record.
          </h3>
          <p>
            Your agent can suggest what to keep. You decide what becomes a
            draft, what needs review, and what gets published.
          </p>
          <button
            className="signal-text-link"
            type="button"
            onClick={() => setDraft((value) => !value)}
            aria-expanded={draft}
            aria-controls="signal-draft"
          >
            {draft ? "Hide draft preview" : "Show draft preview"}
            <ChevronRight aria-hidden="true" />
          </button>
          {draft && (
            <div id="signal-draft" className="signal-draft">
              <span>DRAFT / NOT PUBLISHED</span>
              <strong>Lumen launch constraint</strong>
              <p>
                Scope approval is required before committing to a launch date.
              </p>
              <small>Source: original kickoff note</small>
            </div>
          )}
        </div>
        <div className="signal-demo-footnote">
          Interactive illustration. No knowledge is saved or published.
        </div>
      </TabsContent>
    </Tabs>
  );
}

function SignalProduct() {
  return (
    <section
      className="signal-section signal-product"
      id="signal-product"
      aria-labelledby="signal-product-title"
    >
      <div className="signal-section-intro">
        <p className="signal-label">CONTEXT, NOT ANOTHER CLEAN SLATE</p>
        <h2 id="signal-product-title">
          The conversation ends.
          <br />
          <span>The knowledge stays.</span>
        </h2>
        <p>
          Your decisions shouldn’t disappear into chat history. Give your team
          and its AI a shared place for what you know, why you believe it, and
          what comes next.
        </p>
        <a
          className="signal-text-link"
          href={`${DOCS}/groundray-product-goal.md`}
        >
          Meet your company brain <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <EvidenceDemo />
    </section>
  );
}

const architecture = [
  {
    number: "01",
    title: "Your repository",
    sub: "Markdown + original records",
    text: "Decisions, procedures, definitions, and the sources behind them. In a separate Git repository you control.",
    icon: <GitBranch aria-hidden="true" />,
  },
  {
    number: "02",
    title: "Groundray",
    sub: "Local CLI + keyword search",
    text: "Search the brain, read the originals, and prepare changes through a deliberate, validated workflow.",
    icon: <Terminal aria-hidden="true" />,
  },
  {
    number: "03",
    title: "Your AI agent",
    sub: "Plugins or terminal access",
    text: "Your agent reasons with the evidence. Carry the same company context into the tool you choose next.",
    icon: (
      <span className="signal-agent-glyph" aria-hidden="true">
        {["openai", "claude", "gemini"].map((agent) => (
          <span
            key={agent}
            style={{ maskImage: `url(/images/tools/${agent}-mark.svg)` }}
          />
        ))}
      </span>
    ),
  },
];
function SignalSystem() {
  return (
    <section
      className="signal-section signal-system"
      id="signal-system"
      aria-labelledby="signal-system-title"
    >
      <div className="signal-section-heading">
        <div>
          <p className="signal-label">UNDER THE HOOD</p>
          <h2 id="signal-system-title">
            Plain files.
            <br />
            <span>A complete workflow.</span>
          </h2>
        </div>
        <p>
          Groundray is a local CLI and agent workflow over Git-backed company
          knowledge. Your files stay in your repository. The search index is
          local and rebuildable.
        </p>
      </div>
      <div className="signal-architecture">
        {architecture.map((item) => (
          <article key={item.number}>
            <div className="signal-architecture-art">
              <span>{item.number}</span>
              {item.icon}
              {item.number !== "03" && (
                <ArrowRight className="signal-flow-arrow" aria-hidden="true" />
              )}
            </div>
            <h3>{item.title}</h3>
            <span className="signal-label">{item.sub}</span>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
      <p className="signal-provider-note">
        Retrieved evidence enters your AI tool’s model context under your
        provider’s settings. Repository access uses your Git host’s permissions.
      </p>
    </section>
  );
}

const stages = [
  { name: "Capture", text: "Keep the original record." },
  { name: "Propose", text: "Draft a scoped change." },
  { name: "Review", text: "Inspect the exact candidate." },
  { name: "Publish", text: "Share the reviewed version." },
  { name: "Sync", text: "Bring each local brain current." },
];
function SignalWorkflow() {
  return (
    <section
      className="signal-section signal-workflow"
      id="signal-workflow"
      aria-labelledby="signal-workflow-title"
    >
      <div className="signal-section-heading">
        <div>
          <p className="signal-label">A SHARED BRAIN. A SHARED HISTORY.</p>
          <h2 id="signal-workflow-title">
            Your team learns.
            <br />
            <span>Your brain evolves.</span>
          </h2>
        </div>
        <p>
          Capture new evidence. Propose a correction. Review the exact change
          before publishing it, then explicitly sync it on another installation.
        </p>
      </div>
      <div className="signal-change">
        <div className="signal-change-header">
          <span>
            <GitBranch aria-hidden="true" /> proposal / launch-handoff
          </span>
          <span>ILLUSTRATIVE CHANGE</span>
        </div>
        <div className="signal-diff">
          <div className="signal-diff-old">
            <span>−</span>
            <p>Share a launch date after kickoff.</p>
          </div>
          <div className="signal-diff-new">
            <span>+</span>
            <p>Confirm scope approval before sharing a launch date.</p>
          </div>
        </div>
        <div className="signal-change-source">
          <FileText size={14} aria-hidden="true" />
          <span>Original kickoff note attached</span>
          <span>Review the proposal and its source together.</span>
        </div>
      </div>
      <ol className="signal-lifecycle">
        {stages.map((stage, index) => (
          <li key={stage.name}>
            <span className="signal-lifecycle-number">0{index + 1}</span>
            <h3>
              {stage.name}
              {index !== stages.length - 1 && <ArrowRight aria-hidden="true" />}
            </h3>
            <p>{stage.text}</p>
          </li>
        ))}
      </ol>
      <a className="signal-text-link" href={`${DOCS}/brain-collaboration.md`}>
        Read the collaboration workflow <ArrowUpRight aria-hidden="true" />
      </a>
    </section>
  );
}

function SignalOwnership() {
  return (
    <section
      className="signal-section signal-ownership"
      aria-labelledby="signal-ownership-title"
    >
      <div>
        <p className="signal-label">BUILT TO BELONG TO YOU</p>
        <h2 id="signal-ownership-title">
          Your files.
          <br />
          Your history.
          <br />
          <span>Your way forward.</span>
        </h2>
        <p>
          Tools change. Your company shouldn’t have to start again. Keep the
          knowledge in ordinary Markdown and Git, separate from any one agent or
          conversation.
        </p>
        <a className="signal-text-link" href={REPO}>
          Explore the open-source project <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div
        className="signal-file-tree"
        aria-label="Illustrative company brain directory"
      >
        <div className="signal-tree-title">
          <GitBranch size={17} aria-hidden="true" /> company-brain{" "}
          <span>yours</span>
        </div>
        <pre>{`knowledge/\n├── decisions/\n│   └── launch-scope.md\n├── procedures/\n│   └── customer-onboarding.md\n├── definitions/\n│   └── gross-margin.md\n└── references/\n    └── captures/\n        └── kickoff.md.txt`}</pre>
        <p>
          <Check aria-hidden="true" /> Read it. Version it. Back it up. Move it.
        </p>
      </div>
    </section>
  );
}

const questions = [
  {
    q: "What do I actually install?",
    a: "A native CLI for macOS or Linux, Intel or ARM. The package includes local keyword search. Codex and Claude Code have installable plugins; other agents can invoke the standalone CLI with terminal access. No separate Python, QMD, or model download is required for a new native setup.",
  },
  {
    q: "Does my company knowledge stay local?",
    a: "Brains are Git repository checkouts on your machine. Keyword search runs locally. If an AI agent retrieves evidence, that evidence enters the agent’s model context under your chosen provider’s settings. Git synchronization uses your repository host.",
  },
  {
    q: "Can an agent silently publish changes?",
    a: "Groundray’s workflow makes publishing and syncing explicit. An agent can propose a draft; the exact candidate and its sources can be reviewed before publication. Business approval is a company decision. Access enforcement comes from your Git host’s permissions and rules.",
  },
  {
    q: "How ready is Groundray?",
    a: "Groundray is an early open-source release. The CLI, Codex and Claude Code plugins, source retrieval, and proposal/review/publish/sync workflows are implemented. Real employee handoffs and the human evidence-review experience remain pilot work.",
  },
];
function SignalQuestions() {
  return (
    <section
      className="signal-section signal-questions"
      aria-labelledby="signal-questions-title"
    >
      <div>
        <p className="signal-label">A FEW DETAILS</p>
        <h2 id="signal-questions-title">
          Before you
          <br />
          <span>make it yours.</span>
        </h2>
      </div>
      <Accordion className="signal-accordion">
        {questions.map((item, index) => (
          <AccordionItem key={item.q} value={`signal-question-${index}`}>
            <AccordionTrigger>{item.q}</AccordionTrigger>
            <AccordionContent>{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}

export default function Signal() {
  return (
    <div className="signal">
      <a className="signal-skip" href="#signal-product">
        Skip to main content
      </a>
      <main>
        <SignalHero />
        <div className="signal-principles">
          <span>
            <FileText aria-hidden="true" /> Knowledge in files you control.
          </span>
          <span>
            <GitBranch aria-hidden="true" /> Evidence with a history.
          </span>
          <span>
            <Terminal aria-hidden="true" /> Context for the agent you choose.
          </span>
        </div>
        <SignalProduct />
        <SignalSystem />
        <SignalWorkflow />
        <SignalOwnership />
        <SignalQuestions />
        <section
          className="signal-last-call"
          aria-labelledby="signal-last-title"
        >
          <p className="signal-label">MAKE THE NEXT CONVERSATION COUNT</p>
          <h2 id="signal-last-title">
            Keep what
            <br />
            you <span>learn.</span>
          </h2>
          <a href="#signal-top">
            Build your company brain <ArrowUpRight aria-hidden="true" />
          </a>
        </section>
      </main>
      <footer className="signal-footer">
        <Wordmark />
        <span>© {new Date().getUTCFullYear()} Groundray</span>
        <nav aria-label="Footer">
          <a href={`${DOCS}/cli.md`}>Documentation</a>
          <a href={REPO}>GitHub</a>
          <a href={`${REPO}/blob/main/LICENSE`}>Apache 2.0</a>
        </nav>
      </footer>
    </div>
  );
}
