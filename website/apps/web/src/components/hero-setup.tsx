import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

const SETUP_PROMPT = `Help me set up Groundray, a Git-backed company brain for my team and AI.

Read the official setup instructions at https://github.com/MarvinAmador7/groundray#readme and the CLI guide at https://github.com/MarvinAmador7/groundray/blob/main/docs/cli.md before running commands.

Check my operating system, architecture, and existing Groundray installation first. Use the documented Codex or Claude Code plugin if that is the agent I am using; for other agents with terminal access, use the standalone Groundray CLI and its documented workflow. Preserve existing configuration, brains, and QMD indexes. If a change would replace them, explain it and ask first.

Ask whether I want to connect an existing brain or create a new local one, and collect its repository URL or name. Guide me through local setup, then index the selected brain and verify it with a search. Keep new knowledge as local drafts; do not publish or invite anyone during setup.

Finish by showing which brain is selected, its full saved commit, its index status, and how I can ask my first question with evidence.`;

const AGENTS = [
  { name: "Codex", image: "codex.png", access: "plugin or CLI" },
  { name: "Claude Code", image: "claude-code.png", access: "plugin or CLI" },
  { name: "Cursor", image: "cursor.svg", access: "via CLI" },
  { name: "Gemini CLI", image: "gemini-cli.png", access: "via CLI" },
  { name: "OpenCode", image: "opencode.svg", access: "via CLI" },
];

export function HeroSetup() {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const details = useRef<HTMLDetailsElement>(null);
  const prompt = useRef<HTMLTextAreaElement>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

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
      if (details.current) details.current.open = true;
      prompt.current?.focus();
      prompt.current?.select();
    }
  }

  return (
    <div className="hero-setup">
      <button type="button" className="pill hero-cta" onClick={copyPrompt}>
        {copied ? "Setup prompt copied" : "Copy setup prompt"}
        {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
      </button>
      <div className="hero-agents">
        <ul aria-label="Agents that can use Groundray">
          {AGENTS.map((agent) => (
            <li key={agent.name} title={`${agent.name} — ${agent.access}`}>
              <img
                src={`/images/tools/${agent.image}`}
                width="25"
                height="25"
                alt={`${agent.name} (${agent.access})`}
              />
            </li>
          ))}
        </ul>
        <span>Paste into your agent.</span>
      </div>
      <details ref={details} className="hero-prompt">
        <summary>View setup prompt</summary>
        <label htmlFor="setup-prompt">One prompt. Any agent with terminal access.</label>
        <textarea
          ref={prompt}
          id="setup-prompt"
          readOnly
          value={SETUP_PROMPT}
          spellCheck={false}
          onFocus={(event) => event.currentTarget.select()}
        />
        <p>Codex &amp; Claude Code plugins. Other agents use the CLI.</p>
      </details>
      <span role="status" className={failed ? "hero-copy-status" : "sr-only"}>
        {failed
          ? "Copy is unavailable. The prompt is selected; copy it manually."
          : copied
            ? "Copied. Paste the setup prompt into your AI agent."
            : ""}
      </span>
    </div>
  );
}
