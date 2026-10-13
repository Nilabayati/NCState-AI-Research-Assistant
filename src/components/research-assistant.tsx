"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowDownToLine, ArrowRight, ArrowUp, BookOpen, Check, ChevronRight,
  CircleHelp, FileText, GraduationCap, Lightbulb, MessageSquare, Plus,
  ShieldCheck, Sparkles, X,
} from "lucide-react";
import { FIRST_QUESTION, getDemoReply } from "@/lib/demo-tutor";
import { ACKNOWLEDGEMENT_NOTICE, DECLINED_MESSAGE, TRANSCRIPT_OFFER } from "@/lib/plugin-copy";
import type { TranscriptMessage } from "@/lib/transcript";
import { downloadTextTranscript } from "@/lib/text-transcript";

type Screen = "welcome" | "acknowledgement" | "tutor";
type Message = TranscriptMessage & { id: number; offer?: boolean };
type Modal = "instructions" | "auth" | "new" | "conditions" | null;
const PLUGIN_SOURCE_URL = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/research-design-tutor-plugin.txt`;

function transcriptMessages(current: readonly Message[]): TranscriptMessage[] {
  return current.map(({ role, content, offer }) => ({
    role,
    content: offer ? `${content}\n\n${TRANSCRIPT_OFFER}\nCreate PDF · No thanks` : content,
  }));
}

function Dialog({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement;
    element?.showModal();
    return () => {
      element?.close();
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus();
    };
  }, []);
  return (
    <dialog ref={dialog} className="app-dialog" aria-labelledby="dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <div className="dialog-top"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={20} /></button></div>
      <div className="dialog-body">{children}</div>
    </dialog>
  );
}

function Mark({ small = false }: { small?: boolean }) {
  return <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true"><BookOpen size={small ? 18 : 22} strokeWidth={1.8} /></span>;
}

export default function ResearchAssistant() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [acknowledged, setAcknowledged] = useState(false);
  const [denied, setDenied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [offersDismissed, setOffersDismissed] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState("");
  const [boundaryStatus, setBoundaryStatus] = useState("");
  const [modal, setModal] = useState<Modal>(null);
  const [source, setSource] = useState("");
  const [conversationId, setConversationId] = useState("current");
  const end = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const nextId = useRef(1);
  const conversationGeneration = useRef(0);
  const previousScreen = useRef<Screen>("welcome");

  useEffect(() => {
    if (previousScreen.current !== screen) heading.current?.focus();
    previousScreen.current = screen;
  }, [screen]);

  useEffect(() => {
    if (screen === "tutor") end.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
  }, [messages, screen]);

  useEffect(() => {
    if (modal !== "instructions" || source) return;
    let cancelled = false;
    fetch(PLUGIN_SOURCE_URL)
      .then((response) => { if (!response.ok) throw new Error("Source unavailable"); return response.text(); })
      .then((text) => { if (!cancelled) setSource(text); })
      .catch(() => { if (!cancelled) setSource("The source could not be loaded. The verbatim copy is in docs/research-design-tutor-plugin.txt in this project."); });
    return () => { cancelled = true; };
  }, [modal, source]);

  function message(role: Message["role"], content: string, offer = false): Message {
    return { id: nextId.current++, role, content, offer };
  }

  function begin() {
    if (acknowledged) { setScreen("tutor"); return; }
    if (messages.length === 0) {
      conversationGeneration.current += 1;
      setConversationId(crypto.randomUUID());
      setMessages([message("notice", ACKNOWLEDGEMENT_NOTICE)]);
    }
    setScreen("acknowledgement");
  }

  function agree() {
    setAcknowledged(true);
    setDenied(false);
    setBoundaryStatus("");
    const hasPriorThinking = messages.some((item) => item.role === "student" && !/^(?:i agree|i disagree|create pdf|no thanks|i withdraw my agreement)[.!]?$/i.test(item.content));
    const question = hasPriorThinking
      ? "We can pick up your earlier thinking. What would you like to clarify or confirm about your research purpose?"
      : FIRST_QUESTION;
    setMessages((current) => [...current, message("student", "I Agree"), message("tutor", question, !offersDismissed)]);
    setScreen("tutor");
  }

  function disagree() {
    setDenied(true);
    setAcknowledged(false);
    setMessages((current) => [...current, message("student", "I Disagree"), message("tutor", DECLINED_MESSAGE)]);
  }

  function withdraw() {
    setMessages((current) => [...current, message("student", "I withdraw my agreement"), message("tutor", DECLINED_MESSAGE)]);
    setAcknowledged(false);
    setDenied(true);
    setModal(null);
    setScreen("acknowledgement");
  }

  function reset() {
    conversationGeneration.current += 1;
    setMessages([]);
    setAcknowledged(false);
    setDenied(false);
    setOffersDismissed(false);
    setExporting(false);
    setDraft("");
    setExportStatus("");
    setBoundaryStatus("");
    setModal(null);
    setScreen("welcome");
  }

  function declineOffer(choiceContent = "No thanks") {
    if (!acknowledged || offersDismissed) return;
    setOffersDismissed(true);
    setMessages((current) => [...current, message("student", choiceContent)]);
    setExportStatus("");
    composer.current?.focus();
  }

  async function exportPdf(choiceContent = "Create PDF") {
    if (!acknowledged || exporting) return;
    const generation = conversationGeneration.current;
    const current = [...messages, message("student", choiceContent)];
    setMessages(current);
    setExporting(true);
    setExportStatus("");
    try {
      const { downloadTranscript } = await import("@/lib/transcript");
      await downloadTranscript(transcriptMessages(current), conversationId);
      if (generation === conversationGeneration.current) setExportStatus("PDF downloaded. It contains only this conversation. Pages are images; the PDF is not tamper-proof.");
    } catch {
      if (generation === conversationGeneration.current) setExportStatus("The PDF could not be created. Please try again. No file has been created.");
    } finally { if (generation === conversationGeneration.current) setExporting(false); }
  }

  function exportText() {
    if (!acknowledged) return;
    const current = [...messages, message("student", "Download accessible text transcript")];
    setMessages(current);
    try {
      downloadTextTranscript(transcriptMessages(current), conversationId);
      setExportStatus("Text transcript downloaded. It contains only this conversation, with the original message text.");
    } catch {
      setExportStatus("The text transcript could not be created. Please try again. No file has been created.");
    }
  }

  function send(event?: FormEvent) {
    event?.preventDefault();
    const text = draft.trim();
    if (!text || !acknowledged) return;
    setDraft("");
    if (/^create\s+pdf[.!]?$/i.test(text)) { void exportPdf(text); return; }
    if (/^no\s+thanks[.!]?$/i.test(text)) {
      if (offersDismissed) setMessages((current) => [...current, message("student", text)]);
      else declineOffer(text);
      return;
    }
    const current = [...messages, message("student", text)];
    const input = current.filter((item) => item.role === "student" || item.role === "tutor")
      .filter((item) => !/^(?:i agree|i disagree|create\s+pdf|no\s+thanks)[.!]?$/i.test(item.content) && item.content !== DECLINED_MESSAGE)
      .map((item) => ({ role: item.role === "student" ? "user" as const : "assistant" as const, content: item.content }));
    const reply = getDemoReply(input);
    if (reply.kind === "withdrawal") {
      setMessages([...current, message("tutor", DECLINED_MESSAGE)]);
      setAcknowledged(false);
      setDenied(true);
      setScreen("acknowledgement");
      return;
    }
    if (reply.kind === "respect_boundary") {
      setMessages(current);
      setBoundaryStatus("Tutoring is paused for disrespectful messages. You can continue with a respectful research-design question.");
      return;
    }
    setBoundaryStatus("");
    setExportStatus("");
    setMessages([...current, message("tutor", reply.content, !offersDismissed)]);
  }

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className="sidebar" aria-label="Application navigation">
        <button className="brand" onClick={() => setScreen("welcome")} aria-label="Research Design Assistant home"><Mark /><span>Research Design<span className="brand-subtitle">ASSISTANT</span></span></button>
        <div className="sidebar-section-label">YOUR LEARNING SPACE</div>
        <nav aria-label="Conversation steps">
          <button className={`nav-item ${screen === "welcome" ? "active" : ""}`} onClick={() => setScreen("welcome")} aria-current={screen === "welcome" ? "page" : undefined}><BookOpen size={19} /><span>Welcome</span>{screen === "welcome" && <span className="active-dot" />}</button>
          <button className={`nav-item ${screen === "acknowledgement" ? "active" : ""}`} onClick={() => acknowledged ? setModal("conditions") : begin()} aria-current={screen === "acknowledgement" ? "step" : undefined}><ShieldCheck size={19} /><span>Before you begin</span>{acknowledged && <Check size={15} className="nav-check" />}</button>
          <button className={`nav-item ${screen === "tutor" ? "active" : ""}`} disabled={!acknowledged} onClick={() => setScreen("tutor")} aria-current={screen === "tutor" ? "page" : undefined}><MessageSquare size={19} /><span>Your conversation</span>{!acknowledged && <span className="nav-lock">—</span>}</button>
        </nav>
        <div className="sidebar-separator" />
        <button className="new-conversation" onClick={() => messages.length ? setModal("new") : reset()}><Plus size={18} /> New conversation</button>
        <div className="sidebar-bottom">
          <div className="learning-note"><span className="note-icon"><Lightbulb size={18} /></span><p>Better questions.<br /><strong>More confident thinking.</strong></p></div>
          <button className="source-link" onClick={() => setModal("instructions")}><FileText size={16} /> Original tutor instructions<ArrowRight size={14} /></button>
          <button className="guest-profile" onClick={() => setModal("auth")}><span className="guest-avatar"><GraduationCap size={20} /></span><span>Guest learner<small>Sign-in planned</small></span><ChevronRight size={16} /></button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="breadcrumb"><span className="mobile-brand"><Mark small /></span><span>Research Design Assistant</span><ChevronRight size={14} /><span className="breadcrumb-current">{screen === "welcome" ? "Welcome" : screen === "acknowledgement" ? "Before you begin" : "Conversation"}</span></div>
          <div className="topbar-actions"><span className="demo-badge"><span /> DEMO MODE</span><button className="icon-button mobile-new" aria-label="New conversation" onClick={() => messages.length ? setModal("new") : reset()}><Plus size={20} /></button><button className="icon-button" aria-label="About this demo and sign-in" onClick={() => setModal("auth")}><CircleHelp size={19} /></button></div>
        </header>

        <main id="main-content" className={`main-content ${screen === "tutor" ? "chat-main" : ""}`}>
          {screen === "welcome" && (
            <div className="welcome-page">
              <div className="welcome-kicker"><span className="kicker-rule" /> A SPACE TO THINK, NOT JUST ANSWER</div>
              <section className="welcome-hero" aria-labelledby="welcome-title">
                <div className="hero-copy">
                  <div className="eyebrow">GUIDED LEARNING · YOUR OWN REASONING</div>
                  <h1 id="welcome-title" ref={heading} tabIndex={-1} aria-label="Research Design Tutor">Research<br />Design Tutor<span className="red-period" aria-hidden="true">.</span></h1>
                  <p className="hero-description">An interactive AI tutor that helps university students develop research design skills through guided questioning and critical thinking.</p>
                  <button className="button-primary hero-button" onClick={begin}>Get Started <ArrowRight size={19} /></button>
                  <p className="hero-footnote"><ShieldCheck size={15} /> Acknowledgement required before you begin</p>
                </div>
                <div className="hero-visual" aria-label="An illustration of a thoughtful learning process">
                  <div className="visual-grid" />
                  <span className="visual-ring ring-one" /><span className="visual-ring ring-two" />
                  <div className="floating-label"><span className="small-red-dot" /> THE LEARNING PROCESS</div>
                  <div className="thinking-card"><div className="thinking-card-top"><Mark small /><span>Built around your thinking</span><Sparkles size={17} /></div><div className="thinking-card-body"><p>From a starting idea<br />to a <em>defensible decision.</em></p><div className="thinking-path"><div><span>01</span><strong>Reflect</strong><small>Start with what matters</small></div><div><span>02</span><strong>Explore</strong><small>Consider the possibilities</small></div><div><span>03</span><strong>Reason</strong><small>Explain your own choices</small></div></div></div><div className="thinking-card-footer"><span className="small-red-dot" /> YOUR IDEAS. YOUR DECISIONS.</div></div>
                  <div className="floating-note"><Lightbulb size={21} /><span>Guidance that helps<br /><strong>you make the connection.</strong></span></div>
                </div>
              </section>

              <section className="approach-section" aria-labelledby="approach-title"><div className="section-heading"><h2 id="approach-title">A thoughtful approach to research</h2><span>How we&apos;ll work together</span></div><div className="feature-grid">
                <article className="feature-card"><span className="feature-icon"><MessageSquare size={21} /></span><span className="feature-number">01</span><h3>A conversation, not a checklist</h3><p>Work through one or two focused questions at a time, with room to reflect.</p></article>
                <article className="feature-card"><span className="feature-icon"><Lightbulb size={21} /></span><span className="feature-number">02</span><h3>Guidance, not ready-made answers</h3><p>Build your reasoning. Major research decisions remain yours to make.</p></article>
                <article className="feature-card"><span className="feature-icon"><FileText size={21} /></span><span className="feature-number">03</span><h3>Take your thinking with you</h3><p>Download a PDF of your current conversation to revisit your learning.</p></article>
              </div></section>
              <div className="welcome-demo-note"><span className="demo-note-icon"><Sparkles size={17} /></span><p><strong>You&apos;re exploring a demo.</strong> Responses are locally scripted, not generated by AI. No sign-in or paid AI calls.</p></div>
              <footer className="page-footer"><span>Designed for learning. Grounded in your reasoning.</span><button onClick={() => setModal("instructions")}>Read the tutor instructions <ArrowRight size={14} /></button></footer>
            </div>
          )}

          {screen === "acknowledgement" && (
            <div className="ack-page"><div className="page-step">GETTING STARTED <span>01 / 02</span></div><h1 ref={heading} tabIndex={-1}>Before we begin</h1><p className="page-intro">Please read the educational conditions below before entering the tutor.</p>
              <section className="notice-card" aria-label="Mandatory acknowledgement"><div className="notice-card-header"><ShieldCheck size={23} /><span>EDUCATIONAL CONDITIONS</span></div><div className="notice-copy" data-testid="acknowledgement-notice">{ACKNOWLEDGEMENT_NOTICE}</div><div className="notice-actions"><button className="button-primary" onClick={agree}>I Agree <ArrowRight size={18} /></button><button className="button-secondary" onClick={disagree}>I Disagree</button></div>{denied && <p className="denied-message" role="alert">{DECLINED_MESSAGE}</p>}</section>
              <p className="ack-scope"><ShieldCheck size={16} /> This acknowledgement applies only to this conversation. It is not IRB consent or research participation consent.</p><button className="text-button" onClick={() => setScreen("welcome")}>Back to welcome</button>
            </div>
          )}

          {screen === "tutor" && acknowledged && (
            <div className="tutor-layout"><section className="conversation-column" aria-label="Research design conversation"><div className="conversation-heading"><div><div className="eyebrow">YOUR LEARNING CONVERSATION</div><h1 ref={heading} tabIndex={-1}>Your research, your reasoning.</h1></div><button className="button-secondary export-button" disabled={exporting} onClick={() => void exportPdf()}><ArrowDownToLine size={17} /><span>{exporting ? "Creating PDF…" : "Export PDF"}</span></button></div>
              <div className="chat-demo-banner"><Sparkles size={17} /><p><strong>Demo tutor</strong> · Scripted responses, not AI-generated. Use general, non-identifying descriptions.</p></div>
              <div className="conversation-messages" role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text">
                <div className="conversation-start"><span /> CURRENT CONVERSATION <span /></div>
                <div className="ack-record"><ShieldCheck size={14} /> Educational conditions acknowledged<button onClick={() => setModal("conditions")}>View conditions</button></div>
                {messages.filter((item) => item.role !== "notice" && !["I Agree", "I Disagree"].includes(item.content)).map((item) => (
                  <article className={`message-row ${item.role === "student" ? "student-message" : "tutor-message"}`} key={item.id}>
                    <div className="message-avatar" aria-hidden="true">{item.role === "student" ? "Y" : <BookOpen size={18} />}</div><div className="message-block"><div className="message-label">{item.role === "student" ? "You" : "Research Design Tutor"}{item.role === "tutor" && <span className="message-demo-label">DEMO</span>}</div><div className="message-bubble"><p className="message-content">{item.content}</p>{item.offer && <div className="transcript-offer"><p>{TRANSCRIPT_OFFER}</p><div><button disabled={exporting} onClick={() => void exportPdf()}><FileText size={14} /> Create PDF</button><button disabled={offersDismissed} onClick={() => declineOffer()}>No thanks</button></div></div>}</div></div>
                  </article>
                ))}<div ref={end} />
              </div>
              {boundaryStatus && <p className="status-note" role="status">{boundaryStatus}</p>}
              {exportStatus && <p className="status-note" role="status">{exportStatus}</p>}
              <form className="composer" onSubmit={send}><label className="sr-only" htmlFor="reply">Your message to the demo tutor</label><textarea id="reply" ref={composer} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Share your thinking…" rows={2} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} /><div className="composer-bottom"><span>Enter to send · Shift + Enter for a new line</span><button type="submit" className="send-button" aria-label="Send message" disabled={!draft.trim()}><ArrowUp size={20} /></button></div></form><div className="composer-note"><p>Your conversation stays in this tab&apos;s memory and resets on reload or a new conversation.</p><button className="text-transcript-button" onClick={exportText}>Download accessible text transcript</button></div>
            </section>
              <aside className="conversation-guide" aria-label="Learning guidance"><div className="guide-icon"><Lightbulb size={23} /></div><div className="eyebrow">A LITTLE GUIDANCE</div><h2>Make space<br />for your thinking.</h2><p>You don&apos;t need a polished answer. Start with what you know, and what you&apos;re curious about.</p><div className="guide-divider" /><div className="guide-point"><span>01</span><div><h3>Start with purpose</h3><p>What are you hoping to understand?</p></div></div><div className="guide-point"><span>02</span><div><h3>Explain your reasoning</h3><p>Connect choices to your purpose and evidence.</p></div></div><div className="guide-point"><span>03</span><div><h3>Keep the decisions yours</h3><p>The tutor offers questions and feedback, not a finished plan.</p></div></div><div className="guide-divider" /><button className="source-link" onClick={() => setModal("instructions")}><FileText size={16} /> Tutor instructions<ArrowRight size={14} /></button><button className="withdraw-button" onClick={withdraw}>Withdraw acknowledgement</button></aside>
            </div>
          )}
        </main>
      </div>

      {modal && <Dialog title={modal === "instructions" ? "Original tutor instructions" : modal === "auth" ? "About this demo" : modal === "conditions" ? "Educational conditions" : "Start a new conversation?"} onClose={() => setModal(null)}>
        {modal === "instructions" && <><p className="dialog-intro">The uploaded plugin is preserved verbatim and remains the source of truth for tutoring behavior. This scripted demo demonstrates selected parts of the workflow; it does not implement the full reasoning of an AI tutor.</p><pre className="plugin-source" tabIndex={0} aria-label="Verbatim plugin instructions">{source || "Loading original instructions…"}</pre><a className="button-secondary source-download" href={PLUGIN_SOURCE_URL} download>Download original instructions <ArrowDownToLine size={16} /></a></>}
        {modal === "auth" && <><span className="demo-badge"><span /> DEMO MODE</span><p>This application uses local, scripted tutor responses. No paid AI calls are enabled, and no API key is needed.</p><h3>Sign in with ChatGPT</h3><p>Sign-in is planned and has not been implemented. A disabled authentication adapter is reserved for a future, officially supported integration. ChatGPT account access does not currently connect to this app.</p><p>Conversations and acknowledgement are held only in this tab&apos;s memory. A reload or new conversation clears them. PDF exports are saved to your device. This demo does not provide an institutional confidentiality guarantee.</p><div className="dialog-actions"><button className="button-secondary" onClick={() => setModal("instructions")}>Original tutor instructions <FileText size={16} /></button><button className="button-primary" onClick={() => setModal(null)}>Got it <Check size={16} /></button></div></>}
        {modal === "conditions" && <><div className="notice-copy">{ACKNOWLEDGEMENT_NOTICE}</div><p>This acknowledgement is for educational conditions, not IRB consent or research participation consent.</p><div className="dialog-actions"><button className="button-secondary" onClick={() => setModal(null)}>Close conditions</button><button className="button-secondary" onClick={withdraw}>Withdraw acknowledgement</button></div></>}
        {modal === "new" && <><p>Starting a new conversation clears the current messages and acknowledgement. You&apos;ll need to read and agree to the educational conditions again.</p>{acknowledged && <p>You can cancel and export a PDF first if you want to keep this conversation.</p>}<div className="dialog-actions"><button className="button-secondary" onClick={() => setModal(null)}>Keep this conversation</button><button className="button-primary" onClick={reset}>Start new conversation <ArrowRight size={17} /></button></div></>}
      </Dialog>}
    </div>
  );
}
