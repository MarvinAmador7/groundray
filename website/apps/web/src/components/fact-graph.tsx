import { useEffect, useId, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  FileText,
  GitBranch,
  MessageSquare,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type NodeId =
  | "delivery"
  | "commercial"
  | "v1"
  | "v2"
  | "teammate"
  | "answer"
  | "procedure";
type FactNode = {
  label: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  detail: string;
  record: string;
  context: string;
};
const nodes: Record<NodeId, FactNode> = {
  delivery: {
    label: "Original evidence",
    title: "Delivery checklist",
    summary: "Delivery signs off before launch.",
    icon: FileText,
    detail:
      "The original checklist establishes a condition: the delivery owner must approve a customer launch. This is the supporting record behind the first version of the rule.",
    record: "sources/delivery-checklist.md",
    context: "Produces the first version of the launch rule.",
  },
  commercial: {
    label: "New evidence",
    title: "Commercial review",
    summary: "Customer terms need approval, too.",
    icon: FileText,
    detail:
      "A later commercial review adds another condition: approve the customer’s terms before confirming launch. This new evidence supports a proposed update; it does not silently replace the earlier rule.",
    record: "sources/commercial-review.md",
    context: "Adds evidence for a reviewed update to v2.",
  },
  v1: {
    label: "Earlier fact · v1",
    title: "Delivery approval required.",
    summary: "The earlier reasoning stays visible.",
    icon: GitBranch,
    detail:
      "Version 1 records the delivery approval requirement, scoped to customer launches and linked to its original checklist. Its history remains inspectable when the rule changes.",
    record: "decisions/launch-approval.md · v1",
    context: "Supported by the delivery checklist. Precedes v2.",
  },
  v2: {
    label: "Current fact · v2",
    title: "Delivery + commercial approval required.",
    summary: "One rule. Both supporting records.",
    icon: Check,
    detail:
      "The reviewed update includes both conditions. Version 2 keeps the original delivery evidence, adds the commercial review, and carries the change forward through explicit publication.",
    record: "decisions/launch-approval.md · v2",
    context:
      "Evolved from v1. Used in team guidance, AI answers, and procedures.",
  },
  teammate: {
    label: "Teammate",
    title: "Customer reply",
    summary: "Know what can be promised.",
    icon: Users,
    detail:
      "A teammate preparing a customer response can inspect the current rule and both supporting records before making a commitment. The answer carries its context into the next conversation.",
    record: "A customer response, grounded in v2",
    context: "Consumes the current rule and its supporting evidence.",
  },
  answer: {
    label: "AI tool",
    title: "A grounded answer",
    summary: "Explain the launch conditions.",
    icon: MessageSquare,
    detail:
      "An AI tool can retrieve the saved rule and its sources to explain the launch conditions. Its answer can point back to the company evidence and show which approvals still need a decision.",
    record: "An AI answer with inspectable references",
    context:
      "Consumes the current saved version; company approval remains a human decision.",
  },
  procedure: {
    label: "Procedure",
    title: "Launch playbook",
    summary: "Turn the learning into guidance.",
    icon: BookOpen,
    detail:
      "A team can propose a playbook update that reflects both approval requirements. Referencing the same rule makes the reasoning reusable; the procedure still needs its own explicit review and publication.",
    record: "procedures/customer-launch.md",
    context: "Reuses the rule in a separately reviewed procedure.",
  },
};
const edges: { from: NodeId; to: NodeId; evolution?: boolean }[] = [
  { from: "delivery", to: "v1" },
  { from: "v1", to: "v2", evolution: true },
  { from: "commercial", to: "v2" },
  { from: "delivery", to: "v2" },
  { from: "v2", to: "teammate" },
  { from: "v2", to: "answer" },
  { from: "v2", to: "procedure" },
];
type GraphLayout = { width: number; height: number; paths: string[] };

function trace(selected: NodeId) {
  const upstream = new Set<NodeId>([selected]);
  const downstream = new Set<NodeId>([selected]);
  for (let i = 0; i < Object.keys(nodes).length; i++) {
    for (const edge of edges) {
      if (upstream.has(edge.to)) upstream.add(edge.from);
      if (downstream.has(edge.from)) downstream.add(edge.to);
    }
  }
  return new Set([...upstream, ...downstream]);
}

export function FactGraph() {
  const [selected, setSelected] = useState<NodeId>("v2");
  const [layout, setLayout] = useState<GraphLayout | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const markerId = useId().replace(/:/g, "");
  const related = trace(selected);
  const current = nodes[selected];

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    let frame = 0;
    function measure() {
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      const vertical = window.matchMedia("(max-width: 900px)").matches;
      const paths = edges.map((edge) => {
        const from = element!
          .querySelector<HTMLElement>(`[data-fact-node="${edge.from}"]`)!
          .getBoundingClientRect();
        const to = element!
          .querySelector<HTMLElement>(`[data-fact-node="${edge.to}"]`)!
          .getBoundingClientRect();
        if (vertical && edge.to === "v2" && edge.from !== "v1") {
          const left = edge.from === "delivery";
          const x1 = from.left + from.width / 2 - bounds.left;
          const y1 = from.bottom - bounds.top + 2;
          const x2 = (left ? to.left - 5 : to.right + 5) - bounds.left;
          const y2 = to.top + to.height / 2 - bounds.top;
          const lane = left ? 8 : bounds.width - 8;
          return `M ${x1} ${y1} C ${lane} ${y1 + 30}, ${lane} ${y2}, ${x2} ${y2}`;
        }
        if (vertical || edge.evolution) {
          const x1 = from.left + from.width / 2 - bounds.left;
          const y1 = from.bottom - bounds.top + 2;
          const x2 = to.left + to.width / 2 - bounds.left;
          const y2 = to.top - bounds.top - 5;
          const bend = (y2 - y1) * 0.5;
          return `M ${x1} ${y1} C ${x1} ${y1 + bend}, ${x2} ${y2 - bend}, ${x2} ${y2}`;
        }
        const x1 = from.right - bounds.left + 2;
        const y1 = from.top + from.height / 2 - bounds.top;
        const x2 = to.left - bounds.left - 5;
        const y2 = to.top + to.height / 2 - bounds.top;
        const bend = (x2 - x1) * 0.52;
        return `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`;
      });
      const next = { width: bounds.width, height: bounds.height, paths };
      setLayout((previous) =>
        JSON.stringify(previous) === JSON.stringify(next) ? previous : next,
      );
    }
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    });
    observer.observe(element);
    element
      .querySelectorAll("[data-fact-node]")
      .forEach((node) => observer.observe(node));
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  function node(id: NodeId) {
    const item = nodes[id];
    const Icon = item.icon;
    return (
      <button
        key={id}
        type="button"
        className={`fact-node fact-node--${id}`}
        data-fact-node={id}
        data-related={related.has(id)}
        aria-pressed={selected === id}
        aria-controls={`${markerId}-detail`}
        onClick={() => setSelected(id)}
      >
        <span className="fact-node-label">
          <Icon size={14} aria-hidden="true" />
          {item.label}
        </span>
        <strong>{item.title}</strong>
        <span className="fact-node-summary">{item.summary}</span>
      </button>
    );
  }

  return (
    <div className="fact-graph">
      <div className="fact-graph-toolbar">
        <span>
          <span className="status-dot" />
          The life of a launch rule
        </span>
        <span>Fictional example · select a node to explore</span>
      </div>
      <div
        className="fact-map"
        ref={root}
        role="group"
        aria-label="A graph showing evidence producing a fact, a reviewed version evolving it, and people and tools reusing it"
      >
        {layout && (
          <svg
            className="fact-connections"
            width={layout.width}
            height={layout.height}
            viewBox={`0 0 ${layout.width} ${layout.height}`}
            aria-hidden="true"
          >
            <defs>
              <marker
                id={`${markerId}-arrow`}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
              >
                <path
                  d="M 0 0 L 7 3.5 L 0 7"
                  fill="none"
                  stroke="#6b814c"
                  strokeWidth="1"
                />
              </marker>
              <marker
                id={`${markerId}-muted`}
                markerWidth="7"
                markerHeight="7"
                refX="6"
                refY="3.5"
                orient="auto"
              >
                <path
                  d="M 0 0 L 7 3.5 L 0 7"
                  fill="none"
                  stroke="#adb89b"
                  strokeWidth="1"
                />
              </marker>
            </defs>
            {edges.map((edge, index) => {
              const active = related.has(edge.from) && related.has(edge.to);
              return (
                <path
                  key={`${edge.from}-${edge.to}`}
                  d={layout.paths[index]}
                  data-active={active}
                  data-evolution={!!edge.evolution}
                  markerEnd={`url(#${markerId}-${active ? "arrow" : "muted"})`}
                />
              );
            })}
          </svg>
        )}
        <div className="fact-stage fact-stage--sources">
          <div className="fact-stage-heading">
            <span>01 / PRODUCED</span>
            <p>Rooted in records.</p>
          </div>
          <div className="fact-source-nodes">
            {node("delivery")}
            {node("commercial")}
          </div>
        </div>
        <div className="fact-stage fact-stage--knowledge">
          <div className="fact-stage-heading">
            <span>02 / EVOLVED</span>
            <p>Changed with context.</p>
          </div>
          <div className="fact-version-nodes">
            {node("v1")}
            <span className="fact-review-bridge">
              <GitBranch size={12} aria-hidden="true" />
              Review & publish
            </span>
            {node("v2")}
          </div>
        </div>
        <div className="fact-stage fact-stage--consumers">
          <div className="fact-stage-heading">
            <span>03 / CONSUMED</span>
            <p>Ready to be used.</p>
          </div>
          <div className="fact-consumer-nodes">
            {node("teammate")}
            {node("answer")}
            {node("procedure")}
          </div>
        </div>
      </div>
      <div
        className="fact-inspector"
        id={`${markerId}-detail`}
        role="region"
        aria-label="Selected graph node"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="fact-inspector-title">
          <span className="eyebrow">{current.label}</span>
          <h3>{current.title}</h3>
          <span className="fact-inspector-record">
            <current.icon size={13} aria-hidden="true" />
            {current.record}
          </span>
        </div>
        <div className="fact-inspector-body">
          <p>{current.detail}</p>
          <span>{current.context}</span>
        </div>
      </div>
      <div className="fact-graph-note">
        <span>Evidence → reviewed knowledge → shared context.</span>
        <span>Updates and publication are explicit.</span>
      </div>
    </div>
  );
}
