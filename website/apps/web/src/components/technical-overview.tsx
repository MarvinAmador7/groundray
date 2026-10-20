import { useState } from "react";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  FileText,
  GitBranch,
  Terminal,
} from "lucide-react";
import { Button } from "@website/ui/components/button";
import "../technical-overview.css";

const paths = {
  answer: {
    label: "Ask a question",
    repositoryNote: "Decisions, procedures, definitions, and original records.",
    command: 'groundray search query "customer onboarding" --brain team --json',
    prompt:
      "Use $groundray:groundray. How do we onboard a customer? Show the evidence.",
    steps: [
      [
        "Find",
        "The plugin uses the CLI to search the selected company brain locally.",
      ],
      [
        "Inspect",
        "Your AI reads the relevant knowledge and supporting source records.",
      ],
      [
        "Answer",
        "Your AI answers with citations, the reasoning, and any gaps that need a decision.",
      ],
    ],
    note: "Search runs on your machine. Retrieved evidence enters your AI tool’s model context under your provider’s settings.",
  },
  change: {
    label: "Share an update",
    repositoryNote:
      "Draft changes and their sources, preserved in Git history.",
    command:
      "groundray brain propose onboarding-update --brain team --apply --json",
    prompt:
      "Use $groundray:groundray. Propose an update to our onboarding procedure. Show me the plan first.",
    steps: [
      [
        "Draft",
        "Preview a correction or new record, then explicitly save the proposed change.",
      ],
      [
        "Review",
        "Inspect the exact proposal and its original evidence before accepting it.",
      ],
      [
        "Share",
        "Explicitly publish the accepted version. Teammates sync and rebuild their local index.",
      ],
    ],
    note: "Changes, publishing, and syncing are explicit. Repository access uses your Git host’s existing permissions.",
  },
} as const;

export function TechnicalOverview() {
  const [mode, setMode] = useState<keyof typeof paths>("answer");
  const path = paths[mode];

  return (
    <section
      id="under-the-hood"
      className="technical section-padding"
      aria-labelledby="technical-title"
    >
      <div className="technical-topline">
        <span className="eyebrow">THE SHORT, TECHNICAL VERSION</span>
        <span className="technical-build-label">
          <span /> OPEN SOURCE · LOCAL CLI · AI PLUGIN
        </span>
      </div>

      <div className="technical-intro">
        <h2 id="technical-title">
          Markdown + Git.
          <br />
          <em>Context for your AI.</em>
        </h2>
        <div className="technical-definition">
          <p>
            Groundray is an open-source CLI and plugin for Codex and Claude
            Code. It keeps company knowledge in a Git repository and gives your
            AI a workflow to find evidence, answer questions, and propose
            changes.
          </p>
          <a
            className="text-link"
            href="https://github.com/MarvinAmador7/groundray/blob/main/docs/cli.md"
          >
            Read the technical docs <ArrowUpRight aria-hidden="true" />
          </a>
        </div>
      </div>

      <div className="technical-system">
        <div className="technical-toolbar">
          <span className="technical-diagram-label">
            THREE PARTS. ONE WORKFLOW.
          </span>
          <div
            className="technical-modes"
            role="group"
            aria-label="Explore Groundray workflows"
          >
            {(Object.keys(paths) as (keyof typeof paths)[]).map((id) => (
              <Button
                key={id}
                variant="ghost"
                aria-pressed={mode === id}
                aria-controls="technical-path"
                onClick={() => setMode(id)}
              >
                {paths[id].label}
              </Button>
            ))}
          </div>
        </div>

        <div className="technical-architecture">
          <article className="technical-node technical-repository">
            <div className="technical-node-label">
              <span>01 / STORAGE</span>
              <GitBranch size={17} aria-hidden="true" />
            </div>
            <h3>Your company brain</h3>
            <p>A separate Git repository you control.</p>
            <div
              className="technical-file-tree"
              aria-label="Illustrative company brain folder structure"
            >
              <div>
                <GitBranch size={14} aria-hidden="true" />
                <strong>company-brain/</strong>
              </div>
              <pre>
                {
                  "└─ knowledge/\n   ├─ decisions/\n   ├─ procedures/\n   └─ references/"
                }
              </pre>
              <span>EXAMPLE STRUCTURE · MARKDOWN + SOURCES</span>
            </div>
          </article>

          <div className="technical-connector" aria-hidden="true">
            <span />
            <ArrowRight size={20} />
            <ArrowDown size={20} />
          </div>

          <article className="technical-node technical-engine">
            <div className="technical-node-label">
              <span>02 / ACCESS</span>
              <Terminal size={17} aria-hidden="true" />
            </div>
            <h3>Groundray</h3>
            <p>The native CLI and agent workflow.</p>
            <div className="technical-engine-functions">
              <span>
                <span>01</span> Local keyword search
              </span>
              <span>
                <span>02</span> Original-source retrieval
              </span>
              <span>
                <span>03</span> Validated, plan-first updates
              </span>
            </div>
            <div className="technical-runtime">
              macOS + Linux <span>Intel / ARM</span>
            </div>
          </article>

          <div className="technical-connector" aria-hidden="true">
            <span />
            <ArrowRight size={20} />
            <ArrowDown size={20} />
          </div>

          <article className="technical-node technical-host">
            <div className="technical-node-label">
              <span>03 / INTERFACE</span>
              <FileText size={17} aria-hidden="true" />
            </div>
            <h3>Your AI tool</h3>
            <p>The plugin connects the workflow to your agent.</p>
            <div className="technical-host-list">
              <span>Codex</span>
              <span>Claude Code</span>
            </div>
            <p className="technical-host-detail">
              Your AI interprets the evidence.
              <br />
              Groundray supplies the tools to inspect it.
            </p>
            <a href="#get-started">
              You can also use the CLI directly{" "}
              <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          </article>
        </div>

        <div
          id="technical-path"
          className="technical-path"
          role="region"
          aria-label={path.label}
        >
          <div className="technical-path-heading">
            <span className="technical-diagram-label">
              {mode === "answer"
                ? "FROM A QUESTION TO A GROUNDED ANSWER"
                : "FROM A DRAFT TO A SHARED VERSION"}
            </span>
            <span>ILLUSTRATIVE WORKFLOW</span>
          </div>
          <ol className="technical-path-steps">
            {path.steps.map(([title, description], index) => (
              <li key={title}>
                <span className="technical-step-number">0{index + 1}</span>
                <div>
                  <h4>{title}</h4>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
          <details className="technical-command">
            <summary>
              See the prompt and CLI example <span aria-hidden="true">+</span>
            </summary>
            <div className="technical-examples">
              <div>
                <span>CODEX PROMPT</span>
                <p>{path.prompt}</p>
              </div>
              <div>
                <span>
                  {mode === "answer"
                    ? "CLI SEARCH EXAMPLE"
                    : "CLI PROPOSAL EXAMPLE · WRITES A REMOTE REF"}
                </span>
                <pre>
                  <code>{path.command}</code>
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>

      <div className="technical-footnote">
        <span className="technical-footnote-mark" aria-hidden="true">
          ↳
        </span>
        <p>{path.note}</p>
      </div>
    </section>
  );
}
