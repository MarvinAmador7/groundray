import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  FileText,
  GitBranch,
  Terminal,
} from "lucide-react";
import { TechnicalInspector } from "./technical-inspector";
import "../technical-overview.css";

export function TechnicalOverview() {
  return (
    <section
      id="under-the-hood"
      className="technical section-padding"
      aria-labelledby="technical-title"
    >
      <div className="technical-topline">
        <span className="eyebrow">THE SYSTEM UNDER THE STORY</span>
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
            Groundray is a Git-backed knowledge system for teams and their AI.
            Its CLI and Codex / Claude Code plugins connect company knowledge to
            the sources, authorship, and history behind it.
          </p>
          <p>
            Capture evidence, draft a change, review the exact proposal, and
            publish a version your teammates can explicitly sync.
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
          <span className="technical-diagram-label">
            FILES → TOOLS → CONTEXT
          </span>
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
              <p className="technical-metadata-note">
                Identity · provenance · lifecycle · history
              </p>
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
              <span>
                <span>04</span> Exact-commit proposal review
              </span>
              <span>
                <span>05</span> Explicit publication and sync
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

        <TechnicalInspector />
      </div>

      <div className="technical-footnote">
        <span className="technical-footnote-mark" aria-hidden="true">
          ↳
        </span>
        <p>
          Search and per-brain indexes run locally; indexes are rebuildable.
          Retrieved evidence enters your AI tool’s model context under your
          provider’s settings. Knowledge stays in your Git repository.
        </p>
      </div>
    </section>
  );
}
