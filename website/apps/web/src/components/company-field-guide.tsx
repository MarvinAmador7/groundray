import { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileText,
  MessageSquare,
  Users,
} from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@website/ui/components/tabs";
import { Button } from "@website/ui/components/button";

type ChapterId = "learned" | "changed" | "shared";
const chapters: {
  id: ChapterId;
  number: string;
  label: string;
  note: string;
  caption: string;
  description: string;
}[] = [
  {
    id: "learned",
    number: "01",
    label: "Here’s what we learned.",
    note: "A lesson worth keeping",
    caption: "The story behind the rule.",
    description:
      "Capture the original record and the lesson it supports. Keep enough context for someone else to understand why it matters.",
  },
  {
    id: "changed",
    number: "02",
    label: "Here’s what changed.",
    note: "A little wiser than before",
    caption: "A better entry. The same story.",
    description:
      "Propose the correction, review it, and publish the accepted version. The earlier reasoning stays there for the next person to inspect.",
  },
  {
    id: "shared",
    number: "03",
    label: "Here’s what you need.",
    note: "A head start for someone else",
    caption: "They can begin where you left off.",
    description:
      "Bring the current lesson and its supporting records into a teammate’s next question or an AI conversation. Carry the understanding forward.",
  },
];

function BotanicalSketch() {
  return (
    <svg
      className="guide-botanical"
      viewBox="0 0 130 160"
      fill="none"
      aria-hidden="true"
    >
      <g
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M37 151C64 111 82 64 88 10M59 111C26 109 18 88 20 75c24 1 41 13 39 36ZM73 79C49 76 40 59 42 46c22 2 34 14 31 33ZM84 47C65 43 61 28 64 17c18 4 23 15 20 30ZM65 99c4-28 23-42 44-40-5 25-20 39-44 40ZM79 61c6-21 20-29 36-26-5 18-18 28-36 26Z" />
        <path
          d="m22 78 33 27M44 49l25 25m-3-53 16 22m-13 52 35-30M82 58l29-19"
          opacity=".55"
        />
      </g>
    </svg>
  );
}
function Rule({ updated = true }: { updated?: boolean }) {
  return (
    <h3 className="guide-lesson">
      Check with delivery
      {updated && (
        <>
          <br />
          <em>and commercial</em>
        </>
      )}
      <br />
      before promising
      <br className="guide-lesson-break" /> a launch.
    </h3>
  );
}
function SourceNote({ commercial = false }: { commercial?: boolean }) {
  return (
    <div
      className={`guide-source-note ${commercial ? "guide-source-note--new" : ""}`}
    >
      <span className="guide-tape" aria-hidden="true" />
      <div>
        <FileText size={13} aria-hidden="true" />
        <span>
          {commercial ? "Commercial review" : "Delivery handoff note"}
        </span>
      </div>
      <blockquote>
        {commercial
          ? "“Customer terms need approval before we confirm a launch, too.”"
          : "“We communicated a launch date before delivery had signed off.”"}
      </blockquote>
      <span className="guide-note-footer">
        {commercial
          ? "A new record. One more thing to check."
          : "The original record behind the lesson."}
      </span>
    </div>
  );
}
function OriginalRecord({ commercial = false }: { commercial?: boolean }) {
  return (
    <details className="guide-record-details">
      <summary>
        <FileText size={12} aria-hidden="true" />
        {commercial ? "Read the new record" : "Read the original record"}
      </summary>
      <div>
        <span className="eyebrow">FICTIONAL SOURCE RECORD</span>
        <p>
          {commercial
            ? "Commercial review: customer terms must be approved by the commercial owner before a launch commitment is made. Add this condition to the existing delivery check."
            : "Delivery handoff note: a launch date was communicated to the customer before the delivery owner confirmed readiness. Future launch commitments need delivery approval first."}
        </p>
        <code>
          {commercial
            ? "sources/commercial-review.md"
            : "sources/delivery-handoff.md"}
        </code>
      </div>
    </details>
  );
}
function EarlierEntry() {
  return (
    <details className="guide-record-details">
      <summary>
        <BookOpen size={12} aria-hidden="true" />
        Revisit the earlier entry
      </summary>
      <div>
        <span className="eyebrow">FIRST SAVED VERSION</span>
        <p>Check with delivery before promising a launch.</p>
        <span>
          The delivery check still applies. The reviewed update adds commercial
          approval and keeps both supporting records.
        </span>
      </div>
    </details>
  );
}
export function CompanyFieldGuide() {
  const [chapter, setChapter] = useState<ChapterId>("learned");
  const [reader, setReader] = useState<"teammate" | "ai">("teammate");
  const book = useRef<HTMLDivElement>(null);
  function turnPage(id: ChapterId) {
    setChapter(id);
    requestAnimationFrame(() => {
      book.current?.focus({ preventScroll: true });
      book.current?.scrollIntoView({
        block: "start",
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      });
    });
  }
  const index = chapters.findIndex((item) => item.id === chapter);
  const selected = chapters[index]!;
  return (
    <Tabs
      className="company-field-guide"
      value={chapter}
      onValueChange={(value) => setChapter(value as ChapterId)}
    >
      <TabsList
        className="guide-chapters"
        aria-label="Explore the company field guide"
      >
        {chapters.map((item) => (
          <TabsTrigger key={item.id} value={item.id}>
            <span aria-hidden="true">{item.number}</span>
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
      <div
        className="guide-desk"
        ref={book}
        tabIndex={-1}
        role="group"
        aria-label={`Company field guide: ${selected.label}`}
      >
        <div className="guide-desk-caption">
          <span>
            <BookOpen size={13} aria-hidden="true" />
            THE COMPANY FIELD GUIDE
          </span>
          <span>One lesson · a fictional company example</span>
        </div>
        {chapters.map((item) => (
          <TabsContent key={item.id} value={item.id} className="guide-chapter">
            <div className={`guide-spread guide-spread--${item.id}`}>
              <div className="guide-page guide-left-page">
                <div className="guide-running-head">
                  <span>NOTES FROM THE FIELD</span>
                  <span>Customer launches</span>
                </div>
                {item.id === "learned" && (
                  <>
                    <div className="guide-source-intro">
                      <span className="guide-hand-note">
                        Start with what happened.
                      </span>
                      <BotanicalSketch />
                    </div>
                    <SourceNote />
                    <div className="guide-pencil-note">
                      Leave the reason
                      <br />
                      <em>in the margin.</em>
                    </div>
                    <OriginalRecord />
                  </>
                )}
                {item.id === "changed" && (
                  <>
                    <div className="guide-earlier-slip">
                      <span>THE ENTRY WE STARTED WITH</span>
                      <p>Check with delivery before promising a launch.</p>
                      <span className="guide-pencil-addition">
                        Keep this check. Add one more.
                      </span>
                    </div>
                    <SourceNote commercial />
                    <OriginalRecord commercial />
                  </>
                )}
                {item.id === "shared" && (
                  <>
                    <div className="guide-shared-entry">
                      <span className="eyebrow">
                        THE LESSON WE CARRY FORWARD
                      </span>
                      <Rule />
                      <span className="guide-reviewed-stamp">
                        <Check size={12} aria-hidden="true" />
                        Reviewed update · both records kept
                      </span>
                    </div>
                    <EarlierEntry />
                    <div className="guide-evidence-receipt">
                      <FileText size={13} aria-hidden="true" />
                      <span>
                        Delivery handoff note
                        <br />+ Commercial review
                      </span>
                      <span>
                        2<br />
                        <small>records</small>
                      </span>
                    </div>
                  </>
                )}
                <span className="guide-page-number">
                  FIELD NOTES / {item.number}
                </span>
              </div>
              <div className="guide-binding" aria-hidden="true" />
              <div className="guide-page guide-right-page">
                <div className="guide-running-head">
                  <span>ENTRY 017</span>
                  <span>{item.note}</span>
                </div>
                {item.id === "learned" && (
                  <>
                    <span className="guide-entry-category">
                      A LESSON FOR NEXT TIME
                    </span>
                    <Rule updated={false} />
                    <p className="guide-entry-body">
                      Before we give a customer a date, confirm that the
                      delivery owner is ready to commit.
                    </p>
                    <span className="guide-reviewed-stamp">
                      <BookOpen size={12} aria-hidden="true" />
                      First saved entry · original note attached
                    </span>
                    <div className="guide-bottom-thought">
                      <span className="guide-thought-rule" />
                      <p>
                        Someone else should be able
                        <br />
                        to see <em>why we do it this way.</em>
                      </p>
                    </div>
                  </>
                )}
                {item.id === "changed" && (
                  <>
                    <span className="guide-entry-category">
                      THE REVIEWED UPDATE
                    </span>
                    <Rule />
                    <p className="guide-entry-body">
                      Delivery readiness and approved customer terms both
                      matter. The updated lesson now includes the two checks.
                    </p>
                    <span className="guide-reviewed-stamp">
                      <Check size={12} aria-hidden="true" />
                      Reviewed update · earlier entry preserved
                    </span>
                    <EarlierEntry />
                  </>
                )}
                {item.id === "shared" && (
                  <>
                    <span className="guide-entry-category">
                      A NEW CONVERSATION. A HEAD START.
                    </span>
                    <h3 className="guide-handoff-title">
                      “Good thing
                      <br />
                      <em>
                        someone wrote
                        <br />
                        that down.”
                      </em>
                    </h3>
                    <div
                      className="guide-reader-switch"
                      role="group"
                      aria-label="Choose who uses the field guide"
                    >
                      <Button
                        variant="ghost"
                        className="guide-reader"
                        aria-pressed={reader === "teammate"}
                        onClick={() => setReader("teammate")}
                      >
                        <Users size={13} aria-hidden="true" />A new teammate
                      </Button>
                      <Button
                        variant="ghost"
                        className="guide-reader"
                        aria-pressed={reader === "ai"}
                        onClick={() => setReader("ai")}
                      >
                        <MessageSquare size={13} aria-hidden="true" />
                        An AI conversation
                      </Button>
                    </div>
                    <div
                      className="guide-reader-example"
                      role="region"
                      aria-label="Field guide in use"
                      aria-live="polite"
                      aria-atomic="true"
                    >
                      <span>
                        {reader === "teammate"
                          ? "A TEAMMATE PREPARING A CUSTOMER REPLY"
                          : "AN ILLUSTRATIVE AI ANSWER"}
                      </span>
                      <p>
                        {reader === "teammate"
                          ? "“Before I confirm the launch, let’s check delivery readiness and commercial approval.”"
                          : "“Confirm both delivery and commercial approval. The current guide keeps the two supporting records.”"}
                      </p>
                      <div>
                        <FileText size={12} aria-hidden="true" />
                        Same lesson. Both original records.
                      </div>
                    </div>
                  </>
                )}
                <span className="guide-page-number">
                  COMPANY KNOWLEDGE / {item.number}
                </span>
              </div>
            </div>
          </TabsContent>
        ))}
        <div className="guide-book-footer">
          <span>The record. The reviewed lesson. The next person.</span>
          <span>Your knowledge, carried forward.</span>
        </div>
      </div>
      <div className="guide-caption">
        <div>
          <span className="eyebrow">{selected.label}</span>
          <h3>{selected.caption}</h3>
        </div>
        <p>{selected.description}</p>
        <div className="guide-pagination">
          <Button
            variant="ghost"
            className="guide-page-control"
            aria-label="Previous field guide chapter"
            disabled={index === 0}
            onClick={() => turnPage(chapters[index - 1]!.id)}
          >
            <ArrowLeft size={17} aria-hidden="true" />
          </Button>
          <span aria-live="polite">
            {index + 1} / {chapters.length}
          </span>
          <Button
            variant="ghost"
            className="guide-page-control"
            aria-label="Next field guide chapter"
            disabled={index === chapters.length - 1}
            onClick={() => turnPage(chapters[index + 1]!.id)}
          >
            <ArrowRight size={17} aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Tabs>
  );
}
