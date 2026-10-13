import type { TranscriptMessage } from "./transcript";

const EXPORT_INFORMATION =
  "Research Design Tutor\nConversation transcript\n\n" +
  "Export information: current conversation only · simulated demo tutor.\n" +
  "The application adds this export information and the message role labels.\n" +
  "Message text below is preserved as supplied.\n\n";

const ROLE_LABELS: Record<TranscriptMessage["role"], string> = {
  tutor: "Tutor · simulated demo response",
  student: "Student",
  notice: "Acknowledgement notice",
  event: "Conversation event",
};

/**
 * Accessible text companion to the image-rendered PDF. The conversation owner
 * supplies its visible messages; this helper cannot retrieve other history.
 * Content is never trimmed, normalized, summarized, rewritten, or truncated.
 */
export function formatTextTranscript(
  messages: readonly TranscriptMessage[],
): string {
  return (
    EXPORT_INFORMATION +
    messages.map((message) => `${ROLE_LABELS[message.role]}\n${message.content}`).join("\n\n")
  );
}

/** Download a UTF-8 plain-text file locally, without storage or network calls. */
export function downloadTextTranscript(
  messages: readonly TranscriptMessage[],
  conversationId: string,
): void {
  if (typeof document === "undefined") {
    throw new Error("Text transcript export is available in the browser.");
  }
  if (messages.length === 0) {
    throw new Error("There are no visible messages to export.");
  }
  if (typeof URL.createObjectURL !== "function") {
    throw new Error("This browser cannot create a text transcript download.");
  }

  const blob = new Blob([formatTextTranscript(messages)], {
    type: "text/plain;charset=utf-8",
  });
  const anchor = document.createElement("a");
  const url = URL.createObjectURL(blob);
  const safeId = conversationId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "current";

  try {
    anchor.href = url;
    anchor.download = `research-design-transcript-${safeId}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
  } finally {
    anchor.remove();
    // Allow the browser to begin consuming the download before releasing it.
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}
