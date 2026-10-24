import { useEffect, useState } from "react";
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
import { DayOneChat } from "./day-one-chat";
import { HeroSetup } from "./hero-setup";
import { SignalEvidenceDemo } from "./signal-evidence-demo";
import "../signal.css";

const REPO = "https://github.com/MarvinAmador7/groundray";
const DOCS = `${REPO}/blob/main/docs`;

export function groundrayMeta() {
  const title = "Groundray · a company brain for your coding agents";
  const description =
    "Your coding agent turns the notes and decisions you already have into a company brain, and you approve what goes in. Codex and Claude Code answer from it and show the source behind each answer. Plain files in a Git repo you own.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://groundray.com/" },
    {
      property: "og:image",
      content: "https://groundray.com/images/archive-drawer.webp",
    },
    {
      property: "og:image:alt",
      content:
        "A wall of dark card-catalog drawers with one drawer open and a single index card lit amber.",
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
        src="/images/archive-drawer.webp"
        width="1672"
        height="941"
        alt=""
        fetchPriority="high"
      />
      <div className="signal-hero-wash" />
      <SignalHeader />
      <div className="signal-hero-copy">
        <h1 id="signal-title">
          Stop re‑explaining
          <br />
          your company
          <br />
          <span>to AI.</span>
        </h1>
        <p className="signal-hero-description">
          Your agent turns the notes and decisions you already have into a
          company brain; you approve what goes in. Codex and Claude Code answer
          from it and show the source behind each answer.
        </p>
        <HeroSetup />
        <p className="signal-hero-ownership">
          Free and open source. Plain files you own.
        </p>
      </div>
      <a href="#signal-product" className="signal-scroll">
        <span>See how it works</span>
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
        <h2 id="signal-product-title">
          Ask a question;
          <br />
          <span>get the answer and the note behind it.</span>
        </h2>
        <p>
          Your agent searches the company brain, reads the original note, and
          answers with it attached. Check the source before you act on it.
        </p>
      </div>
      <SignalEvidenceDemo />
    </section>
  );
}

const dayOneQuestions = [
  "How do we cut a release?",
  "Who owns billing?",
  "Why do jobs run on Postgres?",
];

function SignalDayOne() {
  return (
    <section
      className="signal-section signal-dayone"
      id="signal-dayone"
      aria-labelledby="signal-dayone-title"
    >
      <div>
        <h2 id="signal-dayone-title">
          A new hire starts;{" "}
          <span>their agent already knows how you ship.</span>
        </h2>
        <p>
          They add the company brain once.
          <br />
          No week of asking around.
        </p>
        <ul className="signal-dayone-questions" aria-label="Example questions">
          {dayOneQuestions.map((question) => (
            <li key={question}>{question}</li>
          ))}
        </ul>
      </div>
      <DayOneChat />
    </section>
  );
}

const architecture = [
  {
    number: "01",
    title: "Paste the setup prompt",
    sub: "In Codex or Claude Code",
    text: "Your agent installs Groundray for you, with the plugin or the command line.",
    icon: <Terminal aria-hidden="true" />,
  },
  {
    number: "02",
    title: "Pick your company brain",
    sub: "A new one or your team’s",
    text: "Start fresh or connect your team’s Git repo. It’s plain Markdown you control.",
    icon: <GitBranch aria-hidden="true" />,
  },
  {
    number: "03",
    title: "Ask your first question",
    sub: "In the chat you already use",
    text: "Your agent answers from the brain and shows the note behind each answer.",
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
      <p>Add your company brain:</p>
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
        Use your own repo’s URL.{" "}
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
          <h2 id="signal-system-title">
            Install it in your agent;
            <br />
            <span>add your company brain.</span>
          </h2>
        </div>
        <p>
          Groundray is a command-line tool with plugins for Codex and Claude
          Code. The company brain is Markdown in a Git repo. Search runs on your
          machine.
        </p>
      </div>
      <BrainCommand />
      <div className="signal-architecture">
        {architecture.map((item) => (
          <article key={item.number}>
            <div className="signal-architecture-art">
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
        Notes your agent reads go to your AI provider, like anything else it
        reads. Who can read or change the brain is set by your Git host.
      </p>
    </section>
  );
}

const stages = [
  { name: "Capture", text: "Keep the original note." },
  { name: "Propose", text: "Draft the change." },
  { name: "Review", text: "Read the exact change." },
  { name: "Publish", text: "Make it the team’s version." },
  { name: "Sync", text: "Everyone pulls it in." },
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
          <p className="signal-label">ONE SHARED BRAIN FOR ALL</p>
          <h2 id="signal-workflow-title">
            One person learns it;
            <br />
            <span>every agent on the team knows it.</span>
          </h2>
        </div>
        <p>
          Your agent drafts the update with its source attached. A teammate
          reads the exact change and publishes it to the company brain. Everyone
          else syncs and has it. Nothing is published without that step.
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
          <span>Read the change and its source side by side.</span>
        </div>
      </div>
      <ol className="signal-lifecycle">
        {stages.map((stage, index) => (
          <li key={stage.name}>
            <h3>
              {stage.name}
              {index !== stages.length - 1 && <ArrowRight aria-hidden="true" />}
            </h3>
            <p>{stage.text}</p>
          </li>
        ))}
      </ol>
      <a className="signal-text-link" href={`${DOCS}/brain-collaboration.md`}>
        See how updates work <ArrowUpRight aria-hidden="true" />
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
        <h2 id="signal-ownership-title">
          Plain files
          <br />
          your team owns;
          <br />
          <span>not a black box.</span>
        </h2>
        <p>
          The company brain is Markdown in Git: read it, version it, back it
          up, move it. Change agents or models and point the new one at the same
          brain.
        </p>
        <a className="signal-text-link" href={REPO}>
          See the code on GitHub <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div
        className="signal-file-tree"
        aria-label="Illustrative company brain directory"
      >
        <div className="signal-tree-title">
          <GitBranch size={17} aria-hidden="true" /> <code>company-brain</code>{" "}
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
    a: "Yes. Groundray is open source under Apache 2.0. Your company brain lives in a Git repo on whatever host you already use.",
  },
  {
    q: "What do I install?",
    a: "A command-line tool for macOS or Linux, Intel or ARM, with search built in. Codex and Claude Code get a plugin; other agents with terminal access can call the command line directly. No Python or model downloads needed.",
  },
  {
    q: "Does my company brain stay on my machine?",
    a: "The brain is a Git checkout on your machine, and search runs locally. When your agent reads a note, that note goes to your AI provider, like anything else the agent reads. Syncing goes through your Git host.",
  },
  {
    q: "Can an agent change the brain on its own?",
    a: "Not silently. An agent can draft a change; you can read the exact change and its source before anyone publishes it. Who may approve what is your team’s call, and your Git host’s permissions decide who can push.",
  },
  {
    q: "How ready is Groundray?",
    a: "It’s an early open-source release. The command line, the Codex and Claude Code plugins, source lookup, and the draft, review, publish and sync steps work today. Real team handoffs and the review experience are still in pilot.",
  },
];
function SignalQuestions() {
  return (
    <section
      className="signal-section signal-questions"
      aria-labelledby="signal-questions-title"
    >
      <div>
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

const REVEAL = [
  ".signal-section h2",
  ".signal-section h2 ~ p",
  ".signal-section-intro > p",
  ".signal-section-heading > p",
  ".signal-dayone > div > p",
  ".signal-dayone-questions",
  ".signal-change",
  ".signal-lifecycle li",
  ".signal-architecture article",
  ".signal-brain-command",
  ".signal-file-tree",
  ".signal-accordion [data-slot='accordion-item']",
  ".signal-last-call > *",
].join(", ");

// Section parts rise in once, staggered within their section, as each enters.
function useSectionReveal() {
  useEffect(() => {
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    const order = new Map<Element | null, number>();
    for (const element of document.querySelectorAll<HTMLElement>(REVEAL)) {
      const section = element.closest("section");
      const index = order.get(section) ?? 0;
      order.set(section, index + 1);
      element.style.transitionDelay = `${Math.min(index, 6) * 70}ms`;
      element.classList.add("signal-reveal");
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);
}

export default function GroundrayPage() {
  useSectionReveal();
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
            <GitBranch aria-hidden="true" /> Every answer links its source.
          </span>
          <span>
            <Terminal aria-hidden="true" /> Works in Codex and Claude Code.
          </span>
        </div>
        <SignalProduct />
        <SignalDayOne />
        <SignalWorkflow />
        <SignalSystem />
        <SignalOwnership />
        <SignalQuestions />
        <section
          className="signal-last-call"
          aria-labelledby="signal-last-title"
        >
          <h2 id="signal-last-title">
            Start your
            <br />
            <span>company brain.</span>
          </h2>
          <p>
            Copy the setup prompt, paste it into Codex or Claude Code, and point
            it at a Git repo. You own what goes in, and you can take it anywhere.
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
