import { useEffect, useRef } from "react";
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
      "Before we plan the next launch: what did we learn last time, and why did we keep the scope small?",
    keywords: "launch scope decision",
    answer:
      "The smaller scope protected delivery. The kickoff note records why: scope was still changing when the launch date was discussed. Confirm scope before carrying a date into the next plan.",
    followup:
      "Capture that as a reusable launch-handoff procedure, with the original note.",
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
const times = [
  0, 900, 1800, 3000, 4500, 8000, 9500, 11000, 14500, 15700, 17500, 19000,
];
const duration = 21500;
const sourceCommand =
  "groundray source get references/captures/kickoff.md.txt --brain mosaic-studio --json";
const planCommand =
  'groundray knowledge create --brain mosaic-studio --type procedure --title "Launch handoff" --description "Confirm scope before launch commitments." --actor openai/codex --method agent-generated --body-file ./launch-handoff.md --sources-file ./sources.json --confidence medium --confidence-basis "Based on the cited kickoff note; awaiting review." --json';

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

export function BrainChatDemo({
  scenario,
}: {
  scenario: keyof typeof examples;
}) {
  const example = examples[scenario];
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
      data-playing={active}
      aria-label="Animated fictional conversation showing an AI agent consulting and updating a company brain through the Groundray CLI"
    >
      <div className="brain-chat-header">
        <div>
          <Leaf size={18} strokeWidth={1.4} aria-hidden="true" />
          <span>
            Mosaic Studio<small>Your AI + Groundray</small>
          </span>
        </div>
        <span className="brain-chat-demo-label">Animated example</span>
      </div>
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
          <li className="brain-chat-user brain-chat-message">
            <span className="sr-only">You: </span>
            <p>{example.question}</p>
          </li>
          {stage >= 1 ? (
            <li className="brain-chat-agent brain-chat-message">
              <span className="brain-chat-speaker">
                <Leaf size={14} aria-hidden="true" />
                Agent
              </span>
              <p>I’ll check the company brain and the original records.</p>
            </li>
          ) : null}
          {stage >= 2 ? (
            <ToolCall
              label="Searching company knowledge…"
              result="Found the procedure and launch decision"
              command={`groundray search query "${example.keywords}" --brain mosaic-studio --json`}
              done={stage >= 3}
              inspect={inspect}
            />
          ) : null}
          {stage >= 3 ? (
            <ToolCall
              label="Reading the original kickoff note…"
              result="Original kickoff note retrieved"
              command={sourceCommand}
              done={stage >= 4}
              inspect={inspect}
            />
          ) : null}
          {stage >= 4 ? (
            <li className="brain-chat-agent brain-chat-message">
              <span className="brain-chat-speaker">
                <Leaf size={14} aria-hidden="true" />
                Agent
              </span>
              <p>{example.answer}</p>
              <details
                className="brain-chat-citation"
                onToggle={(event) => {
                  if (event.currentTarget.open) inspect(event.currentTarget);
                }}
              >
                <summary>
                  <FileText size={12} aria-hidden="true" />
                  Original kickoff note
                  <ChevronRight size={12} aria-hidden="true" />
                </summary>
                <blockquote>
                  “Confirm scope before committing to a launch date.”
                  <cite>Fictional Mosaic Studio record · kickoff.md.txt</cite>
                </blockquote>
              </details>
            </li>
          ) : null}
          {stage >= 5 ? (
            <li className="brain-chat-user brain-chat-message">
              <span className="sr-only">You: </span>
              <p>{example.followup}</p>
            </li>
          ) : null}
          {stage >= 6 ? (
            <ToolCall
              label="Preparing a validated draft preview…"
              result="Draft preview ready · no files changed"
              command={planCommand}
              done={stage >= 7}
              inspect={inspect}
            />
          ) : null}
          {stage >= 7 ? (
            <li className="brain-chat-agent brain-chat-message">
              <span className="brain-chat-speaker">
                <Leaf size={14} aria-hidden="true" />
                Agent
              </span>
              <p>
                Here’s the draft I’d save. The original note stays attached.
              </p>
              <div className="brain-chat-draft">
                <div>
                  <FileText size={13} aria-hidden="true" />
                  <strong>Launch handoff</strong>
                  <span>Draft</span>
                </div>
                <p>Confirm scope before sharing a launch date.</p>
                <small>Source: original kickoff note · agent-generated</small>
              </div>
              <p>Save this draft locally?</p>
            </li>
          ) : null}
          {stage >= 8 ? (
            <li className="brain-chat-user brain-chat-message">
              <span className="sr-only">You: </span>
              <p>Yes, save that draft.</p>
            </li>
          ) : null}
          {stage >= 9 ? (
            <ToolCall
              label="Saving the confirmed draft…"
              result="Draft saved locally with its source"
              command={`${planCommand} --apply`}
              done={stage >= 10}
              inspect={inspect}
            />
          ) : null}
          {stage >= 10 ? (
            <ToolCall
              label="Rebuilding the local search index…"
              result="Local search index is current"
              command="groundray search index mosaic-studio --json"
              done={stage >= 11}
              inspect={inspect}
            />
          ) : null}
          {stage >= 11 ? (
            <li className="brain-chat-agent brain-chat-message">
              <span className="brain-chat-speaker">
                <Leaf size={14} aria-hidden="true" />
                Agent
              </span>
              <p>
                Saved as a local draft, with the original note attached. It’s
                searchable and ready for review. It hasn’t been published to the
                team.
              </p>
            </li>
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
            ? "Example complete. The agent consulted company evidence, previewed a draft, and saved it locally after confirmation. Scroll up to read the conversation."
            : ""}
        </span>
      </figcaption>
    </figure>
  );
}
