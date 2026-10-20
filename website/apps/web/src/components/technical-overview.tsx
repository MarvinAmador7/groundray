import { ArrowUpRight } from "lucide-react";
import { ComputerFlow } from "./computer-flow";
import { TechnicalInspector } from "./technical-inspector";
import "../technical-overview.css";

export function TechnicalOverview() {
  return (
    <section
      id="under-the-hood"
      className="technical section-padding"
      aria-labelledby="technical-title"
    >
      <div className="technical-intro">
        <h2 id="technical-title">
          Markdown + Git.
          <br />
          <em>Context for your AI.</em>
        </h2>
        <div className="technical-definition">
          <p>
            Groundray connects your company’s Markdown and Git history to Codex
            and Claude Code—with source trails, reviewed changes, and explicit
            sync.
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
        <ComputerFlow />
        <TechnicalInspector />
      </div>
      <p className="technical-footnote">
        Search runs locally. Retrieved evidence enters your AI tool’s model
        context under your provider’s settings.
      </p>
    </section>
  );
}
