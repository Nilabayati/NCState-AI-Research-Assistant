/**
 * Exports only the messages supplied by the current conversation owner.
 * Pages are rasterized to make casual text editing difficult. This is not an
 * integrity guarantee: the resulting PDF can still be altered.
 */
export type TranscriptMessage = {
  role: "tutor" | "student" | "notice" | "event";
  content: string;
};

export type WrappedTranscriptLine = {
  /** Text to draw; line endings are represented by layout, not glyphs. */
  text: string;
  /** The untouched source fragment, including its original line ending. */
  source: string;
};

export type TranscriptRow = {
  kind: "label" | "content";
  text: string;
  y: number;
  messageIndex: number;
  source?: string;
};

export type TranscriptPage = { rows: TranscriptRow[] };

export type TranscriptLayout = {
  contentTop: number;
  contentBottom: number;
  maxTextWidth: number;
  lineHeight: number;
  labelHeight: number;
  messageGap: number;
};

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const MARGIN = 64;
const BODY_FONT = '18px Arial, "Helvetica Neue", sans-serif';
const DEFAULT_LAYOUT: TranscriptLayout = {
  contentTop: 166,
  contentBottom: 1020,
  maxTextWidth: PAGE_WIDTH - MARGIN * 2,
  lineHeight: 27,
  labelHeight: 24,
  messageGap: 23,
};

const ROLE_LABELS: Record<TranscriptMessage["role"], string> = {
  tutor: "Tutor · simulated demo response",
  student: "Student",
  notice: "Acknowledgement notice",
  event: "Conversation event",
};

type MeasureText = (text: string) => number;

function displayText(text: string): string {
  // A tab is drawn as spacing while the original tab remains in `source`.
  return text.replace(/\t/g, "    ");
}

function graphemes(text: string): string[] {
  // Keep combining accents and emoji together where the runtime supports it.
  if (typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), ({ segment }) => segment);
  }
  return Array.from(text);
}

/**
 * Wrap text without dropping, rewriting, or inventing source characters.
 * Joining every returned `source` fragment recreates the input exactly.
 */
export function wrapTranscriptText(
  content: string,
  maxWidth: number,
  measureText: MeasureText,
): WrappedTranscriptLine[] {
  if (!Number.isFinite(maxWidth) || maxWidth <= 0) {
    throw new Error("Transcript text width must be positive.");
  }

  const lines: WrappedTranscriptLine[] = [];
  const logicalLines = content.split(/(\r\n|\n|\r|\u2028|\u2029)/u);

  for (let index = 0; index < logicalLines.length; index += 2) {
    const logicalLine = logicalLines[index];
    const ending = logicalLines[index + 1] ?? "";
    const characters = graphemes(logicalLine);
    const wrapped: WrappedTranscriptLine[] = [];
    let offset = 0;

    while (offset < characters.length) {
      let low = 1;
      let high = characters.length - offset;
      let fitting = 1;

      // Find the largest prefix that fits, allowing one oversized grapheme so
      // unusually long tokens can never stall pagination.
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const candidate = displayText(characters.slice(offset, offset + middle).join(""));
        if (measureText(candidate) <= maxWidth) {
          fitting = middle;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }

      if (offset + fitting < characters.length) {
        // Keep a whitespace break in its source fragment rather than trimming
        // it away. Long words fall back to a grapheme boundary.
        for (let cursor = fitting - 1; cursor > 0; cursor -= 1) {
          if (/\s/u.test(characters[offset + cursor])) {
            fitting = cursor + 1;
            break;
          }
        }
      }

      const source = characters.slice(offset, offset + fitting).join("");
      wrapped.push({ text: displayText(source), source });
      offset += fitting;
    }

    if (wrapped.length === 0) wrapped.push({ text: "", source: "" });
    wrapped[wrapped.length - 1].source += ending;
    lines.push(...wrapped);
  }

  return lines;
}

/** Pure pagination helper. The browser passes actual canvas font metrics. */
export function paginateTranscript(
  messages: readonly TranscriptMessage[],
  measureText: MeasureText = (text) => Array.from(text).length * 9,
  overrides: Partial<TranscriptLayout> = {},
): TranscriptPage[] {
  const layout = { ...DEFAULT_LAYOUT, ...overrides };
  if (
    !Number.isFinite(layout.contentTop) ||
    !Number.isFinite(layout.contentBottom) ||
    !Number.isFinite(layout.lineHeight) ||
    !Number.isFinite(layout.labelHeight) ||
    !Number.isFinite(layout.messageGap) ||
    layout.lineHeight <= 0 ||
    layout.labelHeight <= 0 ||
    layout.messageGap < 0 ||
    layout.contentBottom - layout.contentTop < layout.labelHeight + layout.lineHeight
  ) {
    throw new Error("Transcript page must have room for a label and a line of text.");
  }

  const pages: TranscriptPage[] = [{ rows: [] }];
  let y = layout.contentTop;
  const currentPage = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push({ rows: [] });
    y = layout.contentTop;
  };

  messages.forEach((message, messageIndex) => {
    const lines = wrapTranscriptText(message.content, layout.maxTextWidth, measureText);
    if (y + layout.labelHeight + layout.lineHeight > layout.contentBottom) newPage();

    const addLabel = (continued: boolean) => {
      currentPage().rows.push({
        kind: "label",
        text: ROLE_LABELS[message.role] + (continued ? " (continued)" : ""),
        y,
        messageIndex,
      });
      y += layout.labelHeight;
    };

    addLabel(false);
    lines.forEach((line) => {
      if (y + layout.lineHeight > layout.contentBottom) {
        newPage();
        addLabel(true);
      }
      currentPage().rows.push({ kind: "content", ...line, y, messageIndex });
      y += layout.lineHeight;
    });
    y += layout.messageGap;
  });

  return pages;
}

/**
 * Create and download an image-rendered PDF of the supplied current messages.
 * It deliberately has no storage, history lookup, network call, or AI call.
 * Errors propagate to the caller so the UI never claims a failed file exists.
 */
export async function downloadTranscript(
  messages: readonly TranscriptMessage[],
  conversationId: string,
): Promise<void> {
  if (typeof document === "undefined") {
    throw new Error("PDF transcript export is available in the browser.");
  }
  if (messages.length === 0) {
    throw new Error("There are no visible messages to export.");
  }

  await document.fonts?.ready;
  const { jsPDF } = await import("jspdf");
  const canvas = document.createElement("canvas");
  const scale = 2;
  canvas.width = PAGE_WIDTH * scale;
  canvas.height = PAGE_HEIGHT * scale;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot render the PDF transcript.");
  context.scale(scale, scale);
  context.font = BODY_FONT;
  const pages = paginateTranscript(messages, (text) => context.measureText(text).width);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
  pdf.setProperties({
    title: "Research Design Tutor · Conversation transcript",
    subject: "Current conversation · simulated demo tutor",
    creator: "Research Design Assistant",
  });

  pages.forEach((page, pageIndex) => {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, PAGE_WIDTH, PAGE_HEIGHT);
    context.textBaseline = "top";
    context.fillStyle = "#c8102e";
    context.fillRect(MARGIN, 44, 36, 4);
    context.fillStyle = "#202124";
    context.font = 'bold 22px Arial, "Helvetica Neue", sans-serif';
    context.fillText("Research Design Tutor", MARGIN, 66);
    context.font = '16px Arial, "Helvetica Neue", sans-serif';
    context.fillText("Conversation transcript", MARGIN, 96);
    context.fillStyle = "#55585e";
    context.font = '12px Arial, "Helvetica Neue", sans-serif';
    context.fillText("Export information: current conversation only · simulated demo tutor", MARGIN, 128);

    page.rows.forEach((row) => {
      if (row.kind === "label") {
        context.font = 'bold 13px Arial, "Helvetica Neue", sans-serif';
        context.fillStyle = "#a31229";
      } else {
        context.font = BODY_FONT;
        context.fillStyle = "#202124";
      }
      context.fillText(row.text, MARGIN, row.y);
    });

    context.strokeStyle = "#dddddf";
    context.beginPath();
    context.moveTo(MARGIN, 1050);
    context.lineTo(PAGE_WIDTH - MARGIN, 1050);
    context.stroke();
    context.fillStyle = "#55585e";
    context.font = '11px Arial, "Helvetica Neue", sans-serif';
    context.fillText("Export information: image-rendered pages; this PDF can still be altered.", MARGIN, 1064);
    context.textAlign = "right";
    context.fillText(`Page ${pageIndex + 1} of ${pages.length}`, PAGE_WIDTH - MARGIN, 1084);
    context.textAlign = "left";

    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297, undefined, "FAST");
  });

  // Use the ID only as a filename label; do not add invisible state to messages.
  const safeId = conversationId.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 48) || "current";
  await pdf.save(`research-design-transcript-${safeId}.pdf`, { returnPromise: true });
}
