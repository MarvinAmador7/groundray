import { ChevronRight, FileText } from "lucide-react";
import { useGraphPlayback } from "../hooks/use-graph-playback";
import { ChatText, Message, ToolCall } from "./signal-evidence-demo";

const TIMES = [0, 1100, 2300, 3300, 4400, 5300, 6200, 7100];
const DURATION = 12000;

// A new hire's first session, played once when it scrolls into view.
export function DayOneChat() {
  const playback = useGraphPlayback(TIMES, DURATION);
  const staticView = playback.reducedMotion === true;
  const stage = staticView ? TIMES.length - 1 : playback.stage;
  const active = playback.active && !staticView;
  const stream = { active: active || playback.complete, instant: staticView };
  const pause = () => playback.pause();

  return (
    <figure
      className="signal-session signal-dayone-chat"
      ref={playback.figureRef}
      aria-label="Illustrative first session for a new hire"
      data-autoplay={!staticView}
      data-active={active || playback.complete}
    >
      <div className="signal-agent-transcript">
        <Message user>
          <ChatText
            text="Add our company brain: github.com/your-team/company-brain"
            {...stream}
            typing={false}
          />
        </Message>
        {stage >= 1 && (
          <div className="signal-agent-tools">
            <ToolCall
              name="brain add"
              command="groundray brain add https://github.com/your-team/company-brain.git"
              result="Company brain installed"
              output="company-brain installed and selected."
              done={stage >= 2}
              onInspect={pause}
            />
          </div>
        )}
        {stage >= 3 && (
          <Message user>
            <ChatText text="How do we cut a release?" {...stream} typing={false} />
          </Message>
        )}
        {stage >= 4 && (
          <div className="signal-agent-tools">
            <ToolCall
              name="search query"
              command={'groundray search query "release" --json'}
              result="Release notes found"
              output={
                "Procedure: cut-a-release.md\nDecision: tag-driven-releases.md\nPerson: maya-chen.md (release owner)"
              }
              done={stage >= 5}
              onInspect={pause}
            />
            {stage >= 5 && (
              <ToolCall
                name="get"
                command="groundray get procedures/cut-a-release.md --json"
                result="Procedure read"
                output="Cut a release: merge with CI green, bump the version, push a vX.Y.Z tag."
                done={stage >= 6}
                onInspect={pause}
              />
            )}
            {stage >= 6 && (
              <ToolCall
                name="get"
                command="groundray get people/maya-chen.md --json"
                result="Release owner found"
                output="Maya Chen: release owner, Platform team. Approves releases; announce in #releases before tagging."
                done={stage >= 7}
                onInspect={pause}
              />
            )}
          </div>
        )}
        {stage >= 7 && (
          <Message>
            <div className="signal-session-answer">
              <ChatText text="Here’s the team’s release procedure:" {...stream} />
              <ol className="signal-dayone-steps">
                <li>Merge to main with CI green.</li>
                <li>Bump the version in pyproject.toml.</li>
                <li>Push a vX.Y.Z tag. The release workflow builds and publishes.</li>
              </ol>
              <p className="signal-dayone-note">Before you push the tag, tell:</p>
              <div className="signal-dayone-person">
                <span className="signal-dayone-initials" aria-hidden="true">
                  MC
                </span>
                <span>
                  <strong>Maya Chen</strong>
                  Release owner, Platform team. She approves releases in
                  #releases.
                </span>
              </div>
              <span className="signal-dayone-source">
                <FileText aria-hidden="true" /> <code>cut-a-release.md</code>
                <ChevronRight aria-hidden="true" />
              </span>
              <span className="signal-dayone-source">
                <FileText aria-hidden="true" />{" "}
                <code>tag-driven-releases.md</code>
                <ChevronRight aria-hidden="true" />
              </span>
              <span className="signal-dayone-source">
                <FileText aria-hidden="true" /> <code>maya-chen.md</code>
                <ChevronRight aria-hidden="true" />
              </span>
            </div>
          </Message>
        )}
      </div>
    </figure>
  );
}
