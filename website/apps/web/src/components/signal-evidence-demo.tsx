import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bot,
  Check,
  ChevronRight,
  FileText,
  LoaderCircle,
  Pause,
  Play,
  RotateCcw,
} from "lucide-react";
import { useGraphPlayback } from "../hooks/use-graph-playback";

const TIMES = [
  0, 1000, 2700, 3500, 4300, 5100, 6000, 7000, 9400, 11400, 12200, 13400,
];
const DURATION = 16500;

// Agent replies show a typing indicator, then fade in word by word; the
// reader's own messages arrive whole, like a sent chat message. Assistive
// technology gets the complete text once, without a live region.
export function ChatText({
  text,
  active,
  instant,
  typing = true,
}: {
  text: string;
  active: boolean;
  instant: boolean;
  typing?: boolean;
}) {
  const [ready, setReady] = useState(!typing);
  const waited = useRef(0);
  useEffect(() => {
    if (ready || instant || !active) return;
    const timer = setInterval(() => {
      waited.current += 50;
      if (waited.current >= 700) setReady(true);
    }, 50);
    return () => clearInterval(timer);
  }, [ready, instant, active]);
  if (instant || !typing) return <span className="signal-stream">{text}</span>;
  return (
    <span className="signal-stream">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {ready ? (
          text.split(" ").map((word, index) => (
            <Fragment key={index}>
              <span
                className="signal-word"
                style={{ animationDelay: `${index * 32}ms` }}
              >
                {word}
              </span>{" "}
            </Fragment>
          ))
        ) : (
          <span className="signal-typing">
            <i />
            <i />
            <i />
          </span>
        )}
      </span>
    </span>
  );
}

export function Message({
  user = false,
  children,
}: {
  user?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={`signal-session-message ${user ? "signal-session-user" : "signal-session-agent"}`}
    >
      {!user && (
        <span className="signal-session-avatar" aria-hidden="true">
          <Bot />
        </span>
      )}
      <div>
        <span className="sr-only">{user ? "You: " : "Agent: "}</span>
        {children}
      </div>
    </div>
  );
}

type ToolProps = {
  name: string;
  command: string;
  result: string;
  output: string;
  done: boolean;
  onInspect: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  sourceRef?: React.Ref<HTMLDetailsElement>;
};
export function ToolCall({
  name,
  command,
  result,
  output,
  done,
  onInspect,
  open,
  onOpenChange,
  sourceRef,
}: ToolProps) {
  return (
    <details
      className="signal-agent-tool"
      ref={sourceRef}
      open={open}
      onToggle={(event) => {
        const expanded = event.currentTarget.open;
        onOpenChange?.(expanded);
        if (expanded) onInspect();
      }}
    >
      <summary>
        {done ? (
          <Check className="signal-tool-check" aria-hidden="true" />
        ) : (
          <LoaderCircle className="signal-searching" aria-hidden="true" />
        )}
        <code className="signal-tool-name">{name}</code>
        <span className="signal-tool-result">{done ? result : "Running…"}</span>
        <ChevronRight className="signal-tool-chevron" aria-hidden="true" />
      </summary>
      <div className="signal-tool-detail">
        <span>Command</span>
        <pre>{command}</pre>
        <span>
          {done ? "Result" : "Waiting for result"}
        </span>
        {done && <pre className="signal-tool-output">{output}</pre>}
      </div>
    </details>
  );
}

export function SignalEvidenceDemo() {
  const playback = useGraphPlayback(TIMES, DURATION);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [run, setRun] = useState(0);
  const thread = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const source = useRef<HTMLDetailsElement>(null);
  const staticView = playback.reducedMotion === true;
  const stage = staticView ? TIMES.length - 1 : playback.stage;
  const active = playback.active && !staticView;

  useEffect(() => {
    const pane = thread.current;
    if (!pane) return;
    pane.scrollTo({
      top: pane.scrollHeight,
      behavior: staticView ? "instant" : "smooth",
    });
  }, [stage, staticView, run]);
  useEffect(() => {
    if (!active || !content.current) return;
    const observer = new ResizeObserver(() => {
      const pane = thread.current;
      pane?.scrollTo({ top: pane.scrollHeight, behavior: "smooth" });
    });
    observer.observe(content.current);
    return () => observer.disconnect();
  }, [active]);

  function inspectSource() {
    playback.pause();
    setSourceOpen(true);
    requestAnimationFrame(() => {
      const pane = thread.current;
      if (pane && source.current)
        pane.scrollTo({
          top: source.current.offsetTop - 15,
          behavior: playback.reducedMotion ? "instant" : "smooth",
        });
    });
  }
  function replay() {
    setSourceOpen(false);
    setRun((value) => value + 1);
    playback.replay();
  }
  // Pause for a tap or keyboard focus on a control, never for a finger that is
  // only scrolling the page across the chat.
  function pauseForInspection(target: EventTarget) {
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, summary") &&
      !target.closest("[data-signal-playback]")
    )
      playback.pause();
  }
  function pauseForKeyboardFocus(target: EventTarget) {
    if (target instanceof HTMLElement && target.matches(":focus-visible"))
      pauseForInspection(target);
  }
  const stream = { active: active || playback.complete, instant: staticView };
  const pause = () => playback.pause();

  return (
    <figure
      className="signal-demo-frame signal-session"
      ref={playback.figureRef}
      aria-label="Animated fictional agent session"
      data-stage={playback.stage}
      data-autoplay={!staticView}
      data-active={active || playback.complete}
      onFocusCapture={(event) => pauseForKeyboardFocus(event.target)}
      onClickCapture={(event) => pauseForInspection(event.target)}
    >
      <div
        className="signal-agent-thread"
        ref={thread}
        role="region"
        aria-label="Illustrative agent conversation"
        tabIndex={0}
        onFocus={(event) => {
          if (
            event.target === event.currentTarget &&
            event.target.matches(":focus-visible")
          )
            pause();
        }}
        onWheel={pause}
      >
        <div ref={content} key={run} className="signal-agent-transcript">
          <Message user>
            <ChatText
              text="What can we promise Lumen about launch?"
              {...stream}
              typing={false}
            />
          </Message>
          {stage >= 1 && (
            <Message>
              <ChatText
                text="I’ll sync the company brain, then check the launch decision and its original source."
                {...stream}
              />
            </Message>
          )}
          {stage >= 2 && (
            <div className="signal-agent-tools">
              <ToolCall
                name="brain sync"
                command="groundray brain sync mosaic-studio --json"
                result="Local brain current"
                output="The selected saved brain version is up to date."
                done={stage >= 3}
                onInspect={pause}
              />
              {stage >= 3 && (
                <ToolCall
                  name="search index"
                  command="groundray search index mosaic-studio --json"
                  result="Local index current"
                  output="Local keyword index is current for the selected brain version."
                  done={stage >= 4}
                  onInspect={pause}
                />
              )}
              {stage >= 4 && (
                <ToolCall
                  name="search query"
                  command={
                    'groundray search query "Lumen launch" --brain mosaic-studio --json'
                  }
                  result="Launch evidence found"
                  output={
                    "Launch scope decision\nOriginal kickoff note\nScope: Lumen launch"
                  }
                  done={stage >= 5}
                  onInspect={pause}
                />
              )}
              {stage >= 5 && (
                <ToolCall
                  name="source get"
                  command="groundray source get references/captures/kickoff.md.txt --brain mosaic-studio --json"
                  result="Original note read"
                  output={
                    "Lumen: confirm scope approval before committing to a launch date."
                  }
                  done={stage >= 6}
                  onInspect={pause}
                  open={sourceOpen}
                  onOpenChange={setSourceOpen}
                  sourceRef={source}
                />
              )}
            </div>
          )}
          {stage >= 6 && (
            <div className="signal-session-source">
              <span>Original kickoff note</span>
              <blockquote>
                “Lumen: confirm scope approval before committing to a launch
                date.”
              </blockquote>
            </div>
          )}
          {stage >= 7 && (
            <Message>
              <div className="signal-session-answer">
                <strong>A date comes after scope approval.</strong>
                <ChatText
                  text="Confirm scope approval before giving Lumen a launch date. The kickoff note states that condition."
                  {...stream}
                />
                <button type="button" onClick={inspectSource}>
                  <FileText aria-hidden="true" />
                  <code>kickoff.md.txt</code>
                  <ChevronRight aria-hidden="true" />
                </button>
              </div>
            </Message>
          )}
          {stage >= 8 && (
            <Message>
              <ChatText
                text="This condition could matter next time. Should I preview it as a business fact, with the kickoff note attached?"
                {...stream}
              />
            </Message>
          )}
          {stage >= 9 && (
            <Message user>
              <ChatText
                text="Yes. Show me the draft first."
                {...stream}
                typing={false}
              />
            </Message>
          )}
          {stage >= 10 && (
            <div className="signal-agent-tools">
              <ToolCall
                name="knowledge create · plan"
                command={
                  'groundray knowledge create --brain mosaic-studio --type concept --title "Lumen launch constraint" --description "Scope approval is required before committing to a launch date." --actor openai/codex --method agent-generated --body-file ./lumen-constraint.md --sources-file ./sources.json --confidence medium --confidence-basis "Derived from the cited kickoff note; awaiting review." --json'
                }
                result="Draft preview ready"
                output="Plan only. No --apply: no knowledge has been saved or published."
                done={stage >= 11}
                onInspect={pause}
              />
            </div>
          )}
          {stage >= 11 && (
            <>
              <div className="signal-draft">
                <span>Draft preview, not saved or published</span>
                <strong>Lumen launch constraint</strong>
                <p>
                  Scope approval is required before committing to a launch
                  date.
                </p>
                <small>Source: original kickoff note</small>
              </div>
              <Message>
                <ChatText
                  text="Here’s the draft preview. It hasn’t been saved or published."
                  {...stream}
                />
              </Message>
            </>
          )}
        </div>
      </div>
      {!playback.reducedMotion && (
        <figcaption className="signal-demo-playback" data-signal-playback>
          <div>
            <button
              type="button"
              onClick={() => (playback.complete ? replay() : playback.toggle())}
              aria-label={
                playback.complete
                  ? "Play walkthrough"
                  : playback.playing
                    ? "Pause walkthrough"
                    : "Resume walkthrough"
              }
            >
              {playback.playing ? (
                <Pause aria-hidden="true" />
              ) : (
                <Play aria-hidden="true" />
              )}
              {playback.playing ? "Pause" : "Play"}
            </button>
            <button
              type="button"
              onClick={replay}
              aria-label="Replay walkthrough"
            >
              <RotateCcw aria-hidden="true" />
              Replay
            </button>
          </div>
        </figcaption>
      )}
    </figure>
  );
}
