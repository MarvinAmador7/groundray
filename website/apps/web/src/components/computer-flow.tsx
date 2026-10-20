import {
  ArrowDown,
  ArrowRight,
  Check,
  GitBranch,
  FolderOpen,
  Laptop,
  Monitor,
} from "lucide-react";
import "../computer-flow.css";

function FlowArrow() {
  return (
    <div className="computer-flow-arrow" aria-hidden="true">
      <span />
      <ArrowRight size={19} />
      <ArrowDown size={19} />
    </div>
  );
}

export function ComputerFlow() {
  return (
    <figure
      className="computer-flow"
      aria-label="Illustrated flow from company files through the Groundray CLI to Codex or Claude Code"
    >
      <div className="computer-flow-objects">
        <div className="computer-flow-station">
          <div className="computer-flow-mobile-image" aria-hidden="true">
            <FolderOpen size={34} strokeWidth={1.2} />
          </div>
          <div className="brain-folder" aria-hidden="true">
            <div className="brain-paper brain-paper-back">
              <span>sources/</span>
              <i />
              <i />
              <i />
            </div>
            <div className="brain-paper brain-paper-front">
              <span>onboarding.md</span>
              <strong>
                Customer
                <br />
                onboarding
              </strong>
              <i />
              <i />
              <span className="brain-paper-reference">↳ brief.md.txt</span>
            </div>
            <div className="brain-folder-tab" />
            <div className="brain-folder-cover">
              <GitBranch size={22} strokeWidth={1.3} />
              <span>company-brain</span>
            </div>
          </div>
          <div className="computer-flow-caption">
            <h3>Your company brain</h3>
            <p>Markdown, sources, and Git history.</p>
          </div>
        </div>
        <FlowArrow />
        <div className="computer-flow-station">
          <div className="computer-flow-mobile-image" aria-hidden="true">
            <Laptop size={36} strokeWidth={1.2} />
          </div>
          <div className="cli-laptop">
            <div className="cli-laptop-lid">
              <div className="device-camera" />
              <div className="cli-laptop-screen">
                <div className="device-window-bar">
                  <span className="device-window-dots">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>Terminal</span>
                </div>
                <div className="cli-screen-content">
                  <p>
                    <span>$</span> groundray search query
                    <br />
                    <span className="cli-command-indent">
                      "onboarding" --brain team
                    </span>
                  </p>
                  <div className="cli-screen-result">
                    <Check size={13} aria-hidden="true" />
                    <span>procedures/onboarding.md</span>
                  </div>
                  <p className="cli-screen-source">
                    source → brief.md.txt
                    <br />
                    version → saved Git commit
                  </p>
                  <span className="cli-screen-cursor" aria-hidden="true">
                    ▌
                  </span>
                </div>
              </div>
            </div>
            <div className="cli-laptop-base">
              <span />
            </div>
          </div>
          <div className="computer-flow-caption">
            <h3>Groundray CLI</h3>
            <p>Search, inspect, and manage changes.</p>
          </div>
        </div>
        <FlowArrow />
        <div className="computer-flow-station">
          <div className="computer-flow-mobile-image" aria-hidden="true">
            <Monitor size={34} strokeWidth={1.2} />
          </div>
          <div className="agent-monitor">
            <div className="agent-monitor-frame">
              <div className="device-camera" />
              <div className="agent-monitor-screen">
                <div className="agent-window-label">Codex · Claude Code</div>
                <div className="agent-screen-content">
                  <p className="agent-screen-prompt">
                    <span>›</span> How do we onboard a customer?
                  </p>
                  <p className="agent-screen-answer">
                    Confirm scope before
                    <br />
                    the delivery handoff.<span> [1]</span>
                  </p>
                  <div className="agent-screen-citation">
                    <span>[1]</span> onboarding.md
                  </div>
                  <p className="agent-screen-command">Groundray plugin</p>
                </div>
              </div>
            </div>
            <div className="agent-monitor-neck" />
            <div className="agent-monitor-foot" />
          </div>
          <div className="computer-flow-caption">
            <h3>Your AI agent</h3>
            <p>Answers with the evidence attached.</p>
          </div>
        </div>
      </div>
    </figure>
  );
}
