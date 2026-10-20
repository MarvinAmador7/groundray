import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  GitBranch,
  Menu,
} from "lucide-react";
import { Button } from "@website/ui/components/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@website/ui/components/accordion";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@website/ui/components/sheet";
import type { Route } from "./+types/_index";
import { TechnicalOverview } from "../components/technical-overview";
import { HeroSetup } from "../components/hero-setup";
import {
  ContinuityExplorer,
  PortableBrain,
  WorkflowVisual,
} from "../components/value-visuals";

const REPO = "https://github.com/MarvinAmador7/groundray";
const DOCS = `${REPO}/blob/main/docs`;

export function meta({}: Route.MetaArgs) {
  const title = "Groundray — Stop starting over.";
  const description =
    "A shared brain for your team and AI. Carry what your company learns forward with the evidence behind it. Yours to keep. Yours to move.";
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://groundray.com/" },
    {
      property: "og:image",
      content: "https://groundray.com/images/courtyard.webp",
    },
    {
      property: "og:image:alt",
      content: "A fig tree in a weathered planter, in a sunlit courtyard.",
    },
    { name: "twitter:card", content: "summary_large_image" },
  ];
}

function Ray({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="35"
      height="35"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M3 34h25M9 28l20-8M15 18 29 4M8 18l2-8" />
      </g>
    </svg>
  );
}
function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Groundray home">
      <Ray />
      <span>groundray</span>
    </a>
  );
}
const links = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: `${REPO}#get-started`, label: "Get started" },
];
function Header() {
  return (
    <header className="site-header">
      <Brand />
      <nav className="desktop-nav" aria-label="Main navigation">
        {links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger
          render={
            <Button
              className="mobile-menu"
              variant="ghost"
              size="icon"
              aria-label="Open navigation"
            />
          }
        >
          <Menu />
        </SheetTrigger>
        <SheetContent className="mobile-sheet">
          <SheetHeader>
            <SheetTitle>groundray</SheetTitle>
            <SheetDescription>A little more continuity.</SheetDescription>
          </SheetHeader>
          <nav aria-label="Mobile navigation">
            {links.map((link) => (
              <SheetClose key={link.href} render={<a href={link.href} />}>
                {link.label}
                <ArrowUpRight />
              </SheetClose>
            ))}
            <a href={REPO}>
              View on GitHub
              <GitBranch />
            </a>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
}
function Hero() {
  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <img
        className="hero-image"
        src="/images/courtyard.webp"
        width="1672"
        height="941"
        alt=""
        fetchPriority="high"
      />
      <div className="hero-shade" />
      <Header />
      <div className="hero-content">
        <h1 id="hero-title">
          <span>Stop</span>
          <span>starting</span>
          <em>over.</em>
        </h1>
        <p className="hero-description">
          A shared brain for your team and AI.
          <br className="desktop-break" /> Carry what your company learns
          <br className="desktop-break" /> forward with the evidence behind it.
        </p>
        <HeroSetup />
        <p className="ownership">
          <strong>Yours to keep. Yours to move.</strong>
          <span>Knowledge in files you control.</span>
        </p>
      </div>
      <a href="#product" className="scroll-cue" aria-label="Explore Groundray">
        <ArrowDown aria-hidden="true" />
      </a>
    </section>
  );
}
function Product() {
  return (
    <section
      className="product section-padding"
      id="product"
      aria-labelledby="product-title"
    >
      <div className="section-topline">
        <span className="eyebrow">A COMPANY THAT REMEMBERS</span>
        <span className="tiny-label">Keep the knowledge. Keep moving.</span>
      </div>
      <div className="product-intro">
        <h2 id="product-title">
          Your next chapter.
          <br />
          <em>All your experience.</em>
        </h2>
        <p>
          Good work shouldn’t disappear into a chat history. Groundray gives
          your team and its AI a shared place for what you know, why you believe
          it, and what needs to happen next.
        </p>
      </div>
      <ContinuityExplorer />
    </section>
  );
}
const steps = [
  {
    number: "01",
    title: "Give your knowledge a home.",
    description:
      "Connect an existing company brain, or create your first one. Keep decisions, procedures, definitions, and source records in Markdown and Git.",
    detail: "Your repository. Your starting point.",
  },
  {
    number: "02",
    title: "Ask. Then look closer.",
    description:
      "Ask through your AI tool. Follow the answer back to its evidence, check the scope, and see what’s missing or still needs a decision.",
    detail: "Answer → evidence → guidance.",
  },
  {
    number: "03",
    title: "Make the next version better.",
    description:
      "Propose a correction or capture a new record. Review the exact change, explicitly publish the accepted version, and sync it with your team.",
    detail: "A deliberate update. A shared history.",
  },
];
function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="how section-padding"
      aria-labelledby="how-title"
    >
      <div className="how-heading">
        <span className="eyebrow">HOW IT WORKS</span>
        <h2 id="how-title">
          A place to begin.
          <br />
          <em>A way to build on it.</em>
        </h2>
      </div>
      <div className="workflow-heading-note">
        <span className="eyebrow">FROM KNOWING TO MOVING FORWARD</span>
        <p>A useful brain grows through deliberate steps.</p>
      </div>
      <div className="steps">
        {steps.map((step) => (
          <article className="step" key={step.number}>
            <WorkflowVisual step={step.number} />
            <span className="step-number">{step.number}</span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <span className="step-detail">{step.detail}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
const OWNERSHIP_COMMAND =
  'groundray search query "launch decisions" --brain team --json';
function Ownership() {
  return (
    <section
      id="ownership"
      className="ownership-section section-padding"
      aria-labelledby="ownership-title"
    >
      <div className="ownership-copy">
        <span className="eyebrow">BUILT TO BELONG TO YOU</span>
        <h2 id="ownership-title">
          Tools change.
          <br />
          <em>Your knowledge stays.</em>
        </h2>
        <p>
          Ordinary files. Versioned in Git. A company brain you can inspect,
          back up, and move without starting from a blank page.
        </p>
        <div className="ownership-facts">
          <span>
            <FileText size={16} />
            Markdown you can read
          </span>
          <span>
            <GitBranch size={16} />
            History you can inspect
          </span>
          <span>
            <ArrowUpRight size={16} />A repository you control
          </span>
        </div>
        <a className="text-link" href={REPO}>
          Explore the open-source project <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <PortableBrain
        command={OWNERSHIP_COMMAND}
        copyControl={
          <CopyButton
            text={OWNERSHIP_COMMAND}
            label="Copy shared Groundray command"
          />
        }
      />
    </section>
  );
}
function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setFailed(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      setFailed(true);
    }
  }
  return (
    <div className="copy-control">
      <Button
        className="copy-button"
        variant="ghost"
        size="icon"
        aria-label={copied ? "Copied" : label}
        onClick={copy}
      >
        {copied ? <Check size={17} /> : <Copy size={17} />}
      </Button>
      <span className={failed ? "copy-error" : "sr-only"} role="status">
        {failed
          ? "Select and copy the command manually."
          : copied
            ? "Copied to clipboard."
            : ""}
      </span>
    </div>
  );
}
const questions = [
  {
    question: "What is a company brain?",
    answer:
      "A separate Git repository containing your company’s decisions, procedures, definitions, and original records. Groundray helps you organize, search, inspect, and deliberately update that knowledge. The underlying knowledge stays in ordinary Markdown files.",
  },
  {
    question: "Does Groundray replace my AI tool?",
    answer:
      "Groundray works with Codex and Claude Code through installable plugins. Your AI tool reasons over the company evidence it retrieves. You can also use Groundray directly from the terminal. The shared brain stays separate from any one conversation or host.",
  },
  {
    question: "What runs locally, and what reaches my AI provider?",
    answer:
      "Groundray’s keyword search runs locally and its search indexes can be rebuilt. When you ask through Codex or Claude Code, retrieved evidence enters that tool’s model context under your chosen provider’s settings. Repository access uses your Git host’s existing permissions.",
  },
  {
    question: "Will it automatically change our company knowledge?",
    answer:
      "Publishing and syncing are explicit. Groundray supports capturing sources, proposing updates, and reviewing exact changes before sharing an accepted version. It does not infer company approval from an AI recommendation or quietly publish what an agent learns.",
  },
  {
    question: "How ready is it for my team?",
    answer:
      "Groundray is an early open-source release. The Codex and Claude Code plugins, standalone CLI, source retrieval, and proposal/review/publish/sync workflows are implemented. Real employee handoffs and the human evidence-review experience are still pilot work.",
  },
];
function Questions() {
  return (
    <section className="faq section-padding" aria-labelledby="faq-title">
      <div>
        <span className="eyebrow">A FEW GOOD QUESTIONS</span>
        <h2 id="faq-title">
          Before you
          <br />
          <em>put down roots.</em>
        </h2>
      </div>
      <Accordion className="faq-accordion">
        {questions.map((item, index) => (
          <AccordionItem key={item.question} value={`question-${index}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
function Footer() {
  return (
    <footer className="site-footer section-padding">
      <div className="footer-main">
        <Brand />
        <p>
          Keep what you learn.
          <br />
          Carry it forward.
        </p>
        <a className="footer-back" href="#top">
          Back to top <ArrowUpRight aria-hidden="true" />
        </a>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getUTCFullYear()} Groundray</span>
        <nav aria-label="Footer">
          <a href={REPO}>
            GitHub <GitBranch size={14} aria-hidden="true" />
          </a>
          <a href={`${DOCS}/cli.md`}>Documentation</a>
          <a href={`${REPO}/releases`}>Releases</a>
          <a href={`${REPO}/blob/main/LICENSE`}>Apache 2.0</a>
        </nav>
        <span>A company brain. Your ground to grow.</span>
      </div>
    </footer>
  );
}
export default function Home() {
  return (
    <>
      <a href="#product" className="skip-link">
        Skip to main content
      </a>
      <main>
        <Hero />
        <Product />
        <TechnicalOverview />
        <HowItWorks />
        <Ownership />
        <Questions />
      </main>
      <Footer />
    </>
  );
}
