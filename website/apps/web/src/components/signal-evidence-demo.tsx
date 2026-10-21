import { useEffect, useRef, useState, type ReactNode } from "react";
import {
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
  0, 1600, 3200, 4500, 5800, 7400, 9200, 11300, 17400, 22000, 23800, 25800,
];
const DURATION = 31000;

// Only the visible layer streams. Assistive technology gets the complete text
// once, without a live region announcing every character.
function StreamText({
  text,
  active,
  instant,
  speed = 2,
}: {
  text: string;
  active: boolean;
  instant: boolean;
  speed?: number;
}) {
  const [length, setLength] = useState(0);
  const progress = useRef(0);
  useEffect(() => {
    if (instant || !active || progress.current >= text.length) return;
    const timer = setInterval(() => {
      progress.current = Math.min(text.length, progress.current + speed);
      setLength(progress.current);
      if (progress.current >= text.length) clearInterval(timer);
    }, 28);
    return () => clearInterval(timer);
  }, [text, active, instant, speed]);
  return (
    <span className="signal-stream">
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {instant ? text : text.slice(0, length)}
        {active && !instant && length < text.length && (
          <span className="signal-stream-caret" />
        )}
      </span>
    </span>
  );
}

function Message({
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
      <span className="signal-session-speaker" aria-hidden="true">
        {user ? ">" : "✦"}
      </span>
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
function ToolCall({
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
        <span className="signal-tool-name">{name}</span>
        <span className="signal-tool-result">{done ? result : "Running…"}</span>
        <ChevronRight className="signal-tool-chevron" aria-hidden="true" />
      </summary>
      <div className="signal-tool-detail">
        <span>CLI COMMAND</span>
        <pre>{command}</pre>
        <span>
          {done ? "ILLUSTRATED RESULT" : "AWAITING ILLUSTRATED RESULT"}
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
  function pauseForInspection(target: EventTarget) {
    if (
      target instanceof HTMLElement &&
      target.closest("button, a, summary") &&
      !target.closest("[data-signal-playback]")
    )
      playback.pause();
  }
  const stream = { active, instant: staticView };
  const pause = () => playback.pause();

  return (
    <figure
      className="signal-demo-frame signal-session"
      ref={playback.figureRef}
      aria-label="Animated fictional agent session"
      data-stage={playback.stage}
      data-autoplay={!staticView}
      data-active={active}
      onFocusCapture={(event) => pauseForInspection(event.target)}
      onPointerDownCapture={(event) => pauseForInspection(event.target)}
    >
      <div className="signal-agent-window">
        <div
          className="signal-agent-thread"
          ref={thread}
          role="region"
          aria-label="Illustrative agent conversation"
          tabIndex={0}
          onFocus={pause}
          onTouchStart={pause}
          onWheel={pause}
        >
          <div ref={content} key={run} className="signal-agent-transcript">
            <Message user>
              <StreamText
                text="What can we promise Lumen about launch?"
                {...stream}
                speed={1}
              />
            </Message>
            {stage >= 1 && (
              <Message>
                <StreamText
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
                <span>ORIGINAL KICKOFF NOTE</span>
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
                  <StreamText
                    text="Confirm scope approval before giving Lumen a launch date. The kickoff note states that condition."
                    {...stream}
                  />
                  <button type="button" onClick={inspectSource}>
                    <FileText aria-hidden="true" />
                    [1] kickoff.md.txt
                    <ChevronRight aria-hidden="true" />
                  </button>
                </div>
              </Message>
            )}
            {stage >= 8 && (
              <Message>
                <StreamText
                  text="This condition could matter next time. Should I preview it as a business fact, with the kickoff note attached?"
                  {...stream}
                />
              </Message>
            )}
            {stage >= 9 && (
              <Message user>
                <StreamText
                  text="Yes. Show me the draft first."
                  {...stream}
                  speed={1}
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
                  <span>DRAFT PREVIEW / NOT SAVED OR PUBLISHED</span>
                  <strong>Lumen launch constraint</strong>
                  <p>
                    Scope approval is required before committing to a launch
                    date.
                  </p>
                  <small>Source: original kickoff note</small>
                </div>
                <Message>
                  <StreamText
                    text="Here’s the draft preview. It hasn’t been saved or published."
                    {...stream}
                  />
                </Message>
              </>
            )}
          </div>
        </div>
        <div className="signal-session-disclaimer">
          Fictional example. No commands or model calls run.
        </div>
      </div>
      <figcaption className="signal-demo-playback" data-signal-playback>
        <span>
          {playback.reducedMotion
            ? "Static example"
            : playback.complete
              ? "End of example"
              : "Agent walkthrough"}
        </span>
        {!playback.reducedMotion && (
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
        )}
      </figcaption>
    </figure>
  );
}
