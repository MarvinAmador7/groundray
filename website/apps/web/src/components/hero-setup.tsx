import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";

const SETUP_PROMPT = `Help me set up Groundray using the official guide: https://github.com/MarvinAmador7/groundray#get-started

Check my platform and existing installation. Use the Codex or Claude Code plugin when applicable; otherwise use the standalone CLI with terminal access. Follow the linked CLI documentation for commands.

Ask whether to connect an existing company brain or create a new local one. Preserve existing configuration, brains, and QMD indexes; ask before replacing anything. Keep new knowledge as local drafts. Do not publish or invite anyone.

Index the selected brain, verify it with a search, and report its full saved commit and index status. Show me how to ask my first question with evidence.`;

const AGENTS = [
  { name: "Codex", mark: "openai", access: "plugin or CLI" },
  { name: "Claude Code", mark: "claude", access: "plugin or CLI" },
  { name: "Cursor", mark: "cursor", access: "via CLI" },
  { name: "Gemini CLI", mark: "gemini", access: "via CLI" },
  { name: "OpenCode", mark: "opencode", access: "via CLI" },
];

export function HeroSetup() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const prompt = useRef<HTMLTextAreaElement>(null);
  const preview = useRef<HTMLButtonElement>(null);
  const copy = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLButtonElement | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  function showPrompt(manualCopy = false) {
    returnFocus.current = manualCopy ? copy.current : preview.current;
    dialog.current?.showModal();
    if (manualCopy) {
      prompt.current?.focus();
      prompt.current?.select();
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(SETUP_PROMPT);
      setCopied(true);
      setFailed(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      setCopied(false);
      setFailed(true);
      if (!dialog.current?.open) showPrompt(true);
      else {
        prompt.current?.focus();
        prompt.current?.select();
      }
    }
  }

  return (
    <div className="hero-setup">
      <div className="hero-setup-control">
        <button ref={copy} type="button" className="hero-setup-copy" onClick={copyPrompt}>
          <span>{copied ? "Copied. Ready to paste." : "Copy setup prompt"}</span>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
        </button>
      </div>
      <div className="hero-agents">
        <span>Paste into</span>
        <ul aria-label="Agents that can use Groundray">
          {AGENTS.map((agent) => (
            <li key={agent.name} title={`${agent.name} — ${agent.access}`}>
              <span
                className="hero-agent-mark"
                role="img"
                aria-label={`${agent.name} (${agent.access})`}
                style={{ maskImage: `url(/images/tools/${agent.mark}-mark.svg)` }}
              />
            </li>
          ))}
        </ul>
        <button
          ref={preview}
          type="button"
          className="hero-setup-preview"
          aria-label="Preview setup prompt"
          aria-haspopup="dialog"
          onClick={() => { setFailed(false); showPrompt(); }}
        >
          Preview
        </button>
      </div>
      <span role="status" className="sr-only">
        {copied ? "Setup prompt copied. Paste it into your AI agent." : ""}
      </span>
      <dialog
        ref={dialog}
        className="setup-dialog"
        aria-labelledby="setup-dialog-title"
        aria-describedby="setup-dialog-description"
        onClose={() => returnFocus.current?.focus()}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not([disabled]), textarea",
          );
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
      >
        <div className="setup-dialog-body">
          <button type="button" className="setup-dialog-close" aria-label="Close prompt preview"
            onClick={() => dialog.current?.close()} autoFocus>
            <X aria-hidden="true" />
          </button>
          <h2 id="setup-dialog-title">Set up Groundray.</h2>
          <p id="setup-dialog-description">Copy this into an agent with terminal access.</p>
          <label htmlFor="setup-prompt" className="sr-only">Setup prompt</label>
          <textarea ref={prompt} id="setup-prompt" readOnly value={SETUP_PROMPT}
            spellCheck={false} onFocus={(event) => event.currentTarget.select()} />
          <div className="setup-dialog-footer">
            <p>Codex &amp; Claude Code plugins.<br />Other agents use the CLI.</p>
            <button type="button" onClick={copyPrompt}>
              {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
              {copied ? "Copied" : "Copy prompt"}
            </button>
          </div>
          <p role="status" className="setup-dialog-error">
            {failed ? "Copy is unavailable. The prompt is selected; copy it manually." : ""}
          </p>
        </div>
      </dialog>
    </div>
  );
}
