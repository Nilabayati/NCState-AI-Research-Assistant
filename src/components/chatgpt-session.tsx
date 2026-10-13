"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { ArrowDownToLine, ArrowUpRight, BookOpen, Check, ClipboardCopy, FileText, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";
import { formatChatGptSession, getChatGptTutorUrl } from "@/lib/chatgpt-handoff";

export default function ChatGptSession({ sourceUrl, headingRef }: {
  sourceUrl: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
}) {
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [copyStatus, setCopyStatus] = useState("");
  const [copied, setCopied] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const manualCopy = useRef<HTMLTextAreaElement>(null);
  const tutorUrl = getChatGptTutorUrl(process.env.NEXT_PUBLIC_CHATGPT_TUTOR_URL);
  const sessionPrompt = source ? formatChatGptSession(source) : "";

  useEffect(() => {
    const controller = new AbortController();
    fetch(sourceUrl, { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error("Source unavailable"); return response.text(); })
      .then((text) => {
        if (controller.signal.aborted) return;
        formatChatGptSession(text);
        setSource(text);
        setLoading(false);
      })
      .catch(() => {
        if (!controller.signal.aborted) { setLoadError(true); setLoading(false); }
      });
    return () => controller.abort();
  }, [sourceUrl, attempt]);

  async function copyInstructions() {
    if (!sessionPrompt) return;
    setCopyStatus("");
    setCopied(false);
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(sessionPrompt);
      setCopied(true);
      setCopyStatus("Complete tutor instructions copied. Open a new ChatGPT conversation and paste them as your first message.");
    } catch {
      setCopyStatus("Copy was not allowed by your browser. Expand the full session instructions below and copy them manually, or download the original instructions.");
    }
  }

  return (
    <div className="live-page">
      <div className="page-step">REAL TUTORING IN CHATGPT <span>02 / 02</span></div>
      <h1 ref={headingRef} tabIndex={-1}>Start your research tutoring session</h1>
      <p className="live-intro">Use your own ChatGPT account for a responsive research-design conversation guided by the complete original tutor instructions.</p>
      <div className="live-location-note"><MessageSquare size={19} /><p><strong>The real conversation takes place in ChatGPT.</strong> This website helps you start it. It does not sign you in to ChatGPT, use your subscription through an API, or display ChatGPT replies here.</p></div>

      <div className="live-step-grid">
        <section className="live-step-card" aria-labelledby="copy-step-title">
          <div className="live-step-header"><span className="live-step-number">01</span><ClipboardCopy size={22} /></div>
          <h2 id="copy-step-title">Copy the complete tutor instructions</h2>
          <p>Take the original instructional approach, acknowledgement notice, reasoning-first activities, and transcript requirements into your new conversation. The original text is preserved in full.</p>
          <button className="button-primary" disabled={loading || loadError || !source} onClick={() => void copyInstructions()}>{copied ? <Check size={17} /> : <ClipboardCopy size={17} />}{loading ? "Loading tutor instructions…" : "Copy complete tutor instructions"}</button>
          {loadError && <div className="live-load-error" role="alert"><p>The original tutor instructions could not be loaded. Try again before starting the session.</p><button className="button-secondary" onClick={() => { setLoading(true); setLoadError(false); setAttempt((value) => value + 1); }}><RefreshCw size={15} /> Reload tutor instructions</button></div>}
          {copyStatus && <p className="live-copy-status" role="status">{copyStatus}</p>}
        </section>
        <section className="live-step-card" aria-labelledby="open-step-title">
          <div className="live-step-header"><span className="live-step-number">02</span><ArrowUpRight size={22} /></div>
          <h2 id="open-step-title">Open ChatGPT and start a new chat</h2>
          <p>Sign in there with your own account. Paste the copied instructions as the first message. Read the tutor&apos;s notice, explicitly agree in that conversation, then discuss your research purpose.</p>
          <a className="button-primary" href={tutorUrl} target="_blank" rel="noopener noreferrer">Open ChatGPT <ArrowUpRight size={18} /><span className="sr-only"> (opens in a new tab)</span></a>
          <p className="live-step-footnote">ChatGPT availability, features, and usage limits depend on the student&apos;s account. This website makes no paid AI API calls.</p>
        </section>
      </div>

      <div className="live-boundaries">
        <section><ShieldCheck size={21} /><div><h2>A fresh conversation needs fresh agreement</h2><p>Your agreement on this website does not carry into ChatGPT. The original tutor instructions require the exact notice and your explicit agreement there before tutoring begins. It is an educational acknowledgement, not IRB approval or research participation consent.</p></div></section>
        <section><FileText size={21} /><div><h2>Request your transcript inside ChatGPT</h2><p>Use the tutor&apos;s “Create PDF” offer in your ChatGPT conversation. File generation depends on that host&apos;s capabilities. This website cannot read, retrieve, or export conversations that take place in ChatGPT. A PDF is not tamper-proof.</p></div></section>
      </div>

      {source && <details className="live-manual-copy"><summary><BookOpen size={17} /> Full session instructions and manual copy</summary><p>The opening paragraph starts the session; the entire original plugin follows it unchanged. No website agreement, student answers, or previous conversation is included.</p><label htmlFor="live-session-instructions">Complete ChatGPT session instructions</label><textarea id="live-session-instructions" ref={manualCopy} readOnly value={sessionPrompt} rows={10} /><div className="live-manual-actions"><button className="button-secondary" onClick={() => { manualCopy.current?.focus(); manualCopy.current?.select(); }}>Select all instructions</button><a className="button-secondary" href={sourceUrl} download><ArrowDownToLine size={16} /> Download original instructions</a></div></details>}
    </div>
  );
}
