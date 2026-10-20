import { useEffect, useRef, type ReactNode } from "react";
import {
  Check,
  ChevronRight,
  FileText,
  Leaf,
  LoaderCircle,
  Pause,
  Play,
  RefreshCw,
  Terminal,
} from "lucide-react";
import { useGraphPlayback } from "../hooks/use-graph-playback";
import "../brain-chat-demo.css";

const examples = {
  teammate: {
    question:
      "I’m new here. How do we onboard a customer, and what should I watch out for?",
    keywords: "customer onboarding",
    answer:
      "Start with the discovery brief, confirm scope, then hand off to delivery. Confirm scope before you promise a launch date—the last kickoff exposed that gap.",
    followup: "Keep that lesson in our brain so the next teammate sees it too.",
  },
  project: {
    question:
      "Before we plan Lumen’s launch: what did we learn last time, and what constraints should we carry forward?",
    keywords: "Lumen launch scope approval",
    answer:
      "The smaller scope protected delivery. Lumen’s kickoff note also sets a specific condition: scope must be approved before we commit to a launch date.",
    followup:
      "Lumen’s launch depends on scope approval. This could matter in future decisions—should I save it as a business fact with the kickoff note as its source?",
  },
  tool: {
    question:
      "We’re starting in a new AI tool. What did we decide about launch dates, and what’s the evidence?",
    keywords: "launch date commitment",
    answer:
      "Confirm scope before committing to a launch date. Your company’s kickoff note records that condition. The same record is available here through Groundray, even in a new AI tool.",
    followup:
      "Turn that lesson into a draft procedure in our company brain. Keep the source attached.",
  },
} as const;
const standardTimeline = [
  ["question", 0],
  ["intro", 900],
  ["sync", 1800],
  ["initial-index", 3000],
  ["search", 4200],
  ["source", 5400],
  ["answer", 6800],
  ["followup", 10500],
  ["plan", 11800],
  ["preview", 13200],
  ["save-confirmation", 16800],
  ["save", 18000],
  ["draft-index", 19500],
  ["saved", 20800],
  ["review-request", 23000],
  ["proposal-plan", 24200],
  ["proposal", 25500],
  ["review", 27000],
  ["review-source", 28500],
  ["review-summary", 30000],
  ["publish-confirmation", 34000],
  ["publish", 35400],
  ["published", 37000],
] as const;
type Step = (typeof standardTimeline)[number][0] | "suggestion-confirmation";
const projectTimeline: readonly (readonly [Step, number])[] =
  standardTimeline.flatMap(([name, time]) =>
    name === "followup"
      ? ([
          [name, time],
          ["suggestion-confirmation", 14500],
        ] as [Step, number][])
      : [[name, time >= 11800 ? time + 4000 : time]],
  );
const standardTimes = standardTimeline.map(([, time]) => time);
const projectTimes = projectTimeline.map(([, time]) => time);
const syncCommand = "groundray brain sync mosaic-studio --json";
const indexCommand = "groundray search index mosaic-studio --json";
const launchLesson = {
  type: "procedure",
  title: "Launch handoff",
  description: "Confirm scope before launch commitments.",
  bodyFile: "./launch-handoff.md",
  sourcePath: "references/captures/kickoff.md.txt",
  sourceLabel: "Original kickoff note",
  quote: "Confirm scope before committing to a launch date.",
  body: "Confirm scope before sharing a launch date.",
  proposal: "launch-handoff",
  review:
    "The draft matches the kickoff note: confirm scope before sharing a launch date. The proposal adds the procedure and keeps its source attached.",
};
const lumenFact = {
  type: "concept",
  title: "Lumen launch constraint",
  description:
    "Scope approval is required before committing to Lumen’s launch date.",
  bodyFile: "./lumen-launch-constraint.md",
  sourcePath: "references/captures/lumen-kickoff.md.txt",
  sourceLabel: "Original Lumen kickoff note",
  quote: "Lumen: confirm scope approval before committing to a launch date.",
  body: "Lumen’s launch date depends on scope approval.",
  proposal: "lumen-launch-constraint",
  review:
    "The fact matches Lumen’s kickoff note: scope approval is required before committing to a launch date. The proposal keeps that source and its Lumen-specific scope.",
};

type ToolProps = {
  label: string;
  result: string;
  command: string;
  done: boolean;
  inspect: (details: HTMLDetailsElement) => void;
};
function ToolCall({ label, result, command, done, inspect }: ToolProps) {
  return (
    <li className="brain-chat-tool brain-chat-message">
      <details
        onToggle={(event) => {
          if (event.currentTarget.open) inspect(event.currentTarget);
        }}
      >
        <summary>
          {done ? (
            <Check size={14} aria-hidden="true" />
          ) : (
            <LoaderCircle
              className="brain-chat-spinner"
              size={14}
              aria-hidden="true"
            />
          )}
          <span>
            <code>{command.split(" ").slice(0, 3).join(" ")}</code>
            <small>{done ? result : label}</small>
          </span>
          <ChevronRight size={12} aria-hidden="true" />
        </summary>
        <code>{command}</code>
      </details>
    </li>
  );
}

function UserMessage({ children }: { children: ReactNode }) {
  return (
    <li className="brain-chat-user brain-chat-message">
      <span className="sr-only">You: </span>
      <p>{children}</p>
    </li>
  );
}
function AgentMessage({ children }: { children: ReactNode }) {
  return (
    <li className="brain-chat-agent brain-chat-message">
      <span className="brain-chat-speaker">
        <Leaf size={14} aria-hidden="true" />
        Agent
      </span>
      {children}
    </li>
  );
}

export function BrainChatDemo({
  scenario,
}: {
  scenario: keyof typeof examples;
}) {
  const example = examples[scenario];
  const proactive = scenario === "project";
  const knowledge = proactive ? lumenFact : launchLesson;
  const timeline = proactive ? projectTimeline : standardTimeline;
  const times = proactive ? projectTimes : standardTimes;
  const duration = proactive ? 44000 : 40000;
  const sourceCommand = `groundray source get ${knowledge.sourcePath} --brain mosaic-studio --json`;
  const planCommand = `groundray knowledge create --brain mosaic-studio --type ${knowledge.type} --title "${knowledge.title}" --description "${knowledge.description}" --actor openai/codex --method agent-generated --body-file ${knowledge.bodyFile} --sources-file ./sources.json --confidence medium --confidence-basis "Based on the cited kickoff note; awaiting review." --json`;
  const proposalCommand = `groundray brain propose ${knowledge.proposal} --brain mosaic-studio --json`;
  // These variables stand for the full commits returned by the illustrated proposal/review.
  const reviewCommand = `groundray brain review ${knowledge.proposal} --brain mosaic-studio --commit "$PROPOSAL_COMMIT" --json`;
  const reviewSourceCommand = `groundray brain review-source ${knowledge.proposal} ${knowledge.sourcePath} --brain mosaic-studio --commit "$PROPOSAL_COMMIT" --json`;
  const publishCommand = `groundray brain accept ${knowledge.proposal} --brain mosaic-studio --commit "$PROPOSAL_COMMIT" --base "$BASE_COMMIT" --json`;
  const {
    stage,
    playing,
    complete,
    active,
    reducedMotion,
    figureRef,
    replay,
    toggle,
    pause,
  } = useGraphPlayback(times, duration);
  const threadRef = useRef<HTMLDivElement>(null);
  const reached = (step: Step) => {
    const index = timeline.findIndex(([name]) => name === step);
    return index >= 0 && stage >= index;
  };

  useEffect(() => {
    const thread = threadRef.current;
    if (thread)
      thread.scrollTo({
        top: stage === 0 ? 0 : thread.scrollHeight,
        behavior: reducedMotion ? "instant" : "smooth",
      });
  }, [stage, reducedMotion]);

  function inspect(details: HTMLDetailsElement) {
    pause();
    requestAnimationFrame(() => {
      const thread = threadRef.current;
      if (!thread || !details.isConnected) return;
      const bounds = details.getBoundingClientRect();
      const viewport = thread.getBoundingClientRect();
      const delta =
        bounds.height > thread.clientHeight - 32
          ? bounds.top - viewport.top - 16
          : Math.max(0, bounds.bottom - viewport.bottom + 16);
      if (delta)
        thread.scrollBy({
          top: delta,
          behavior: reducedMotion ? "instant" : "smooth",
        });
    });
  }

  return (
    <figure
      ref={figureRef}
      className="brain-chat"
      data-stage={stage}
      data-step={timeline[stage][0]}
      data-playing={active}
      aria-label="Animated fictional conversation showing an AI agent consulting and updating a company brain through the Groundray CLI"
    >
      <div
        ref={threadRef}
        className="brain-chat-thread"
        tabIndex={0}
        role="region"
        aria-label="Example conversation. Scroll to read earlier messages."
        onWheel={pause}
        onTouchStart={pause}
      >
        <ol className="brain-chat-messages" aria-label="Fictional conversation">
          <UserMessage>
            {example.question} Use the latest shared notes.
          </UserMessage>
          {reached("intro") ? (
            <AgentMessage>
              <p>
                I’ll sync the latest published knowledge and refresh local
                search before checking the original records.
              </p>
            </AgentMessage>
          ) : null}
          {reached("sync") ? (
            <ToolCall
              label="Syncing recent published records…"
              result="Latest published knowledge synced locally"
              command={syncCommand}
              done={reached("initial-index")}
              inspect={inspect}
            />
          ) : null}
          {reached("initial-index") ? (
            <ToolCall
              label="Refreshing search for the synced version…"
              result="Local search matches the synced knowledge"
              command={indexCommand}
              done={reached("search")}
              inspect={inspect}
            />
          ) : null}
          {reached("search") ? (
            <ToolCall
              label="Searching company knowledge…"
              result="Found the procedure and launch decision"
              command={`groundray search query "${example.keywords}" --brain mosaic-studio --json`}
              done={reached("source")}
              inspect={inspect}
            />
          ) : null}
          {reached("source") ? (
            <ToolCall
              label={`Reading ${knowledge.sourceLabel.toLowerCase()}…`}
              result={`${knowledge.sourceLabel} retrieved`}
              command={sourceCommand}
              done={reached("answer")}
              inspect={inspect}
            />
          ) : null}
          {reached("answer") ? (
            <AgentMessage>
              <p>{example.answer}</p>
              <details
                className="brain-chat-citation"
                onToggle={(event) => {
                  if (event.currentTarget.open) inspect(event.currentTarget);
                }}
              >
                <summary>
                  <FileText size={12} aria-hidden="true" />
                  {knowledge.sourceLabel}
                  <ChevronRight size={12} aria-hidden="true" />
                </summary>
                <blockquote>
                  “{knowledge.quote}”
                  <cite>
                    Fictional Mosaic Studio record ·{" "}
                    {knowledge.sourcePath.split("/").at(-1)}
                  </cite>
                </blockquote>
              </details>
            </AgentMessage>
          ) : null}
          {reached("followup") ? (
            proactive ? (
              <AgentMessage>
                <p>{example.followup}</p>
              </AgentMessage>
            ) : (
              <UserMessage>{example.followup}</UserMessage>
            )
          ) : null}
          {proactive && reached("suggestion-confirmation") ? (
            <UserMessage>Yes—show me the draft first.</UserMessage>
          ) : null}
          {reached("plan") ? (
            <ToolCall
              label="Preparing a validated draft preview…"
              result="Draft preview ready · no files changed"
              command={planCommand}
              done={reached("preview")}
              inspect={inspect}
            />
          ) : null}
          {reached("preview") ? (
            <AgentMessage>
              <p>
                Here’s the draft I’d save. The original note stays attached.
              </p>
              <div className="brain-chat-draft">
                <div>
                  <FileText size={13} aria-hidden="true" />
                  <strong>{knowledge.title}</strong>
                  <span>{proactive ? "Draft · Business fact" : "Draft"}</span>
                </div>
                <p>{knowledge.body}</p>
                <small>
                  Source: {knowledge.sourceLabel.toLowerCase()} ·
                  agent-generated
                </small>
              </div>
              <p>Save this draft locally?</p>
            </AgentMessage>
          ) : null}
          {reached("save-confirmation") ? (
            <UserMessage>Yes, save that draft.</UserMessage>
          ) : null}
          {reached("save") ? (
            <ToolCall
              label="Saving the confirmed draft…"
              result="Draft saved locally with its source"
              command={`${planCommand} --apply`}
              done={reached("draft-index")}
              inspect={inspect}
            />
          ) : null}
          {reached("draft-index") ? (
            <ToolCall
              label="Rebuilding the local search index…"
              result="Local search index is current"
              command={indexCommand}
              done={reached("saved")}
              inspect={inspect}
            />
          ) : null}
          {reached("saved") ? (
            <AgentMessage>
              <p>
                Saved as a local draft with its source attached. It’s searchable
                and ready for review.
              </p>
            </AgentMessage>
          ) : null}
          {reached("review-request") ? (
            <UserMessage>
              Share this draft as a proposal and review it against the original
              note.
            </UserMessage>
          ) : null}
          {reached("proposal-plan") ? (
            <ToolCall
              label="Checking the proposal against shared main…"
              result="Proposal preview validated · main unchanged"
              command={proposalCommand}
              done={reached("proposal")}
              inspect={inspect}
            />
          ) : null}
          {reached("proposal") ? (
            <ToolCall
              label="Sharing the draft on a proposal ref…"
              result="Proposal shared for review · main unchanged"
              command={`${proposalCommand} --apply`}
              done={reached("review")}
              inspect={inspect}
            />
          ) : null}
          {reached("review") ? (
            <ToolCall
              label="Inspecting the exact proposal and its patch…"
              result="Exact proposal inspected against its base"
              command={reviewCommand}
              done={reached("review-source")}
              inspect={inspect}
            />
          ) : null}
          {reached("review-source") ? (
            <ToolCall
              label="Reading the source at the proposal’s commit…"
              result="Original note checked at the same proposal commit"
              command={reviewSourceCommand}
              done={reached("review-summary")}
              inspect={inspect}
            />
          ) : null}
          {reached("review-summary") ? (
            <AgentMessage>
              <p>{knowledge.review}</p>
              <p>Publish this reviewed proposal to the team?</p>
            </AgentMessage>
          ) : null}
          {reached("publish-confirmation") ? (
            <UserMessage>Yes, publish that reviewed proposal.</UserMessage>
          ) : null}
          {reached("publish") ? (
            <ToolCall
              label="Publishing the exact reviewed proposal…"
              result="Reviewed proposal published to the shared brain"
              command={publishCommand}
              done={reached("published")}
              inspect={inspect}
            />
          ) : null}
          {reached("published") ? (
            <AgentMessage>
              <p>
                Published the reviewed proposal with its source and history.
                Teammates can sync it into their own copies when they’re ready.
              </p>
            </AgentMessage>
          ) : null}
        </ol>
      </div>
      <figcaption className="brain-chat-footer">
        <p>
          <Terminal size={12} aria-hidden="true" />
          Fictional example · no commands run
        </p>
        <div>
          <button
            type="button"
            aria-label={
              playing ? "Pause chat animation" : "Play chat animation"
            }
            aria-pressed={playing}
            onClick={toggle}
          >
            {playing ? (
              <Pause size={13} aria-hidden="true" />
            ) : (
              <Play size={13} aria-hidden="true" />
            )}
            {playing ? "Pause" : "Play"}
          </button>
          <button
            type="button"
            aria-label="Replay chat animation"
            onClick={replay}
          >
            <RefreshCw size={13} aria-hidden="true" />
            Replay
          </button>
        </div>
        <span className="sr-only" role="status">
          {complete
            ? "Example complete. The agent synced recent published knowledge, consulted its sources, saved a confirmed draft, reviewed the proposal and its source, and published after a separate confirmation. Teammates still sync explicitly. Scroll up to read the conversation."
            : ""}
        </span>
      </figcaption>
    </figure>
  );
}
