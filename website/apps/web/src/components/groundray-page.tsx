import { useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  GitBranch,
  Terminal,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@website/ui/components/accordion";
import { HeroSetup } from "./hero-setup";
import { SignalEvidenceDemo } from "./signal-evidence-demo";
import "../signal.css";

const REPO = "https://github.com/MarvinAmador7/groundray";
const DOCS = `${REPO}/blob/main/docs`;

export function groundrayMeta() {
  const title = "Groundray: shared memory for your team’s AI agents";
  const description =
    "Groundray keeps your team’s decisions, procedures and definitions in a Git repo you own, so Codex and Claude Code answer from them and point to the source behind each answer. Open source.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://groundray.com/" },
    {
      property: "og:image",
      content: "https://groundray.com/images/signal-landscape.webp",
    },
    {
      property: "og:image:alt",
      content:
        "A dark architectural archive landscape rendered in amber dithered light.",
    },
    { name: "twitter:card", content: "summary_large_image" },
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
        src="/images/signal-landscape.webp"
        width="1672"
        height="941"
        alt=""
        fetchPriority="high"
      />
      <div className="signal-hero-wash" />
      <SignalHeader />
      <div className="signal-hero-copy">
        <p className="signal-label">
          <span className="signal-dot" /> A SHARED MEMORY FOR YOUR TEAM’S AI
        </p>
        <h1 id="signal-title">
          Stop re‑explaining
          <br />
          your company
          <br />
          <span>to AI.</span>
        </h1>
        <p className="signal-hero-description">
          Groundray gives Codex and Claude Code your team’s decisions and
          procedures, with the original note behind each answer, stored as
          Markdown in a repo you own.
        </p>
        <HeroSetup />
        <p className="signal-hero-ownership">
          Free and open source. Your files stay in your repo.
        </p>
      </div>
      <a href="#signal-product" className="signal-scroll">
        <span>SEE HOW IT WORKS</span>
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
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
        <p className="signal-label">ANSWERS WITH SOURCES</p>
        <h2 id="signal-product-title">
          Ask a question.
          <br />
          <span>Get the answer and the note it came from.</span>
        </h2>
        <p>
          Ask your agent what you can promise a customer. It reads the original
          kickoff note and answers with it attached, so you can check before you
          repeat it.
        </p>
        <a
          className="signal-text-link"
          href={`${DOCS}/groundray-product-goal.md`}
        >
          Read the product overview <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <SignalEvidenceDemo />
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
const ADD_BRAIN_COMMAND =
  "groundray brain add https://github.com/your-team/company-brain.git";

function BrainCommand() {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle",
  );

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(ADD_BRAIN_COMMAND);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    }
  }

  return (
    <div className="signal-brain-command">
      <p>Point Groundray at your team’s repo. Its knowledge comes to your machine.</p>
      <div className="signal-brain-command-line">
        <span aria-hidden="true">$</span>
        <code>
          groundray brain add{" "}
          <span>https://github.com/your-team/company-brain.git</span>
        </code>
        <button
          type="button"
          onClick={copyCommand}
          aria-label={
            copyStatus === "copied"
              ? "Copied brain add command"
              : "Copy brain add command"
          }
        >
          {copyStatus === "copied" ? (
            <Check aria-hidden="true" />
          ) : (
            <Copy aria-hidden="true" />
          )}
          <span>{copyStatus === "copied" ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <p className="signal-brain-command-note">
        Replace the example URL with your existing brain repository.{" "}
        <a href={`${DOCS}/cli.md`}>
          CLI guide <ArrowUpRight aria-hidden="true" />
        </a>
      </p>
      <span
        role="status"
        className={copyStatus === "error" ? "signal-command-error" : "sr-only"}
      >
        {copyStatus === "copied"
          ? "Command copied."
          : copyStatus === "error"
            ? "Copy is unavailable. Select the command to copy it manually."
            : ""}
      </span>
    </div>
  );
}

function SignalSystem() {
  return (
    <section
      className="signal-section signal-system"
      id="signal-system"
      aria-labelledby="signal-system-title"
    >
      <div className="signal-section-heading">
        <div>
          <p className="signal-label">HOW IT WORKS</p>
          <h2 id="signal-system-title">
            Install it in your agent.
            <br />
            <span>Point it at your repo.</span>
          </h2>
        </div>
        <p>
          Groundray is a command-line tool with plugins for Codex and Claude
          Code. Your knowledge stays as Markdown in Git, and search runs on your
          machine.
        </p>
      </div>
      <BrainCommand />
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
          <p className="signal-label">TEAM UPDATES</p>
          <h2 id="signal-workflow-title">
            When one person fixes something,
            <br />
            <span>everyone’s AI gets the fix.</span>
          </h2>
        </div>
        <p>
          Your agent drafts the change with its source attached. A teammate
          reviews the exact wording and publishes it, and everyone else syncs.
          Publishing is always a separate, explicit step.
        </p>
      </div>
      <div className="signal-change">
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
        <p className="signal-label">NO LOCK-IN</p>
        <h2 id="signal-ownership-title">
          Switch AI tools
          <br />
          without losing
          <br />
          <span>what your team knows.</span>
        </h2>
        <p>
          It’s Markdown in Git: read it, version it, back it up, move it. When
          you change agents or models, point the new one at the same repo.
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
    q: "Is it free?",
    a: "Yes. Groundray is open source under the Apache 2.0 license. Your brain is a Git repository on whatever host you already use.",
  },
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
          Questions
          <br />
          <span>before you install.</span>
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

export default function GroundrayPage() {
  return (
    <div className="signal">
      <a className="signal-skip" href="#signal-product">
        Skip to main content
      </a>
      <main>
        <SignalHero />
        <div className="signal-principles">
          <span>
            <FileText aria-hidden="true" /> Plain Markdown in your Git repo.
          </span>
          <span>
            <GitBranch aria-hidden="true" /> Every answer cites its source.
          </span>
          <span>
            <Terminal aria-hidden="true" /> Works in Codex and Claude Code.
          </span>
        </div>
        <SignalProduct />
        <SignalWorkflow />
        <SignalSystem />
        <SignalOwnership />
        <SignalQuestions />
        <section
          className="signal-last-call"
          aria-labelledby="signal-last-title"
        >
          <p className="signal-label">OPEN SOURCE · APACHE 2.0</p>
          <h2 id="signal-last-title">
            Try it in
            <br />
            <span>your agent.</span>
          </h2>
          <p>
            Copy the setup prompt, paste it into Codex or Claude Code, and point
            it at your team’s repo.
          </p>
          <a href="#signal-top">
            Get the setup prompt <ArrowUp aria-hidden="true" />
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
