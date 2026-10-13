import { afterEach, describe, expect, it, vi } from "vitest";
import type { TranscriptMessage } from "./transcript";
import { downloadTextTranscript, formatTextTranscript } from "./text-transcript";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe("accessible current-conversation text transcript", () => {
  it("preserves notices, acknowledgements, messages, and transcript choices exactly in order", () => {
    const messages: TranscriptMessage[] = [
      { role: "notice", content: "Research Design Tutor — Before You Begin\r\n- Verify important information.\r\nI Agree — continue\r\nI Disagree — do not continue" },
      { role: "event", content: "I Agree" },
      { role: "tutor", content: "What is the purpose of your research—what do you hope to understand or find out?\n\nWould you like a PDF transcript of this conversation?\nCreate PDF · No thanks" },
      { role: "student", content: "  I want to understand students’ experiences.\t\n\nSecond line.  \n" },
      { role: "event", content: "Download text transcript" },
    ];
    expect(formatTextTranscript(messages)).toBe(
      "Research Design Tutor\nConversation transcript\n\n" +
      "Export information: current conversation only · simulated demo tutor.\n" +
      "The application adds this export information and the message role labels.\n" +
      "Message text below is preserved as supplied.\n\n" +
      `Acknowledgement notice\n${messages[0].content}\n\n` +
      `Conversation event\n${messages[1].content}\n\n` +
      `Tutor · simulated demo response\n${messages[2].content}\n\n` +
      `Student\n${messages[3].content}\n\n` +
      `Conversation event\n${messages[4].content}`,
    );
  });

  it("preserves Unicode, combining accents, emoji, and all existing line endings", () => {
    const content = "café e\u0301 👩🏽‍🔬 Ελληνικά العربية 中文\r\n\n\r\u2028\u2029\t  Last line  ";
    expect(formatTextTranscript([{ role: "student", content }])).toContain(`Student\n${content}`);
    expect(formatTextTranscript([{ role: "student", content }])).toMatch(/Last line  $/);
  });

  it("does not truncate long conversations or mutate their supplied messages", () => {
    const content = "Long explanation — 🧑🏽‍🎓\n".repeat(20_000);
    const messages = Object.freeze([
      Object.freeze({ role: "student" as const, content }),
      Object.freeze({ role: "tutor" as const, content: "Final visible response?" }),
    ]);
    const transcript = formatTextTranscript(messages);
    expect(transcript).toContain(content);
    expect(transcript.endsWith("Tutor · simulated demo response\nFinal visible response?")).toBe(true);
    expect(messages[0].content).toBe(content);
  });

  it("uses only the messages passed for this export", () => {
    const oldConversation: TranscriptMessage[] = [{ role: "student", content: "A prior chat" }];
    formatTextTranscript(oldConversation);
    const current = formatTextTranscript([{ role: "student", content: "This chat only" }]);
    expect(current).toContain("This chat only");
    expect(current).not.toContain("A prior chat");
  });

  it("preserves an empty visible message without inventing its content", () => {
    expect(formatTextTranscript([{ role: "student", content: "" }])).toMatch(/Student\n$/);
  });
});

describe("local browser text download", () => {
  function browser() {
    const anchor = { href: "", download: "", click: vi.fn(), remove: vi.fn() };
    const appendChild = vi.fn();
    const createElement = vi.fn(() => anchor);
    vi.stubGlobal("document", { createElement, body: { appendChild } });
    const createObjectURL = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:local-transcript");
    const revokeObjectURL = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});
    vi.useFakeTimers();
    return { anchor, appendChild, createElement, createObjectURL, revokeObjectURL };
  }

  it("creates a UTF-8 plain-text Blob and downloads the exact formatted transcript", async () => {
    const mocks = browser();
    const messages: TranscriptMessage[] = [{ role: "student", content: "café\n你好 👩🏽‍🔬" }];
    downloadTextTranscript(messages, "current-conversation_123");
    const blob = mocks.createObjectURL.mock.calls[0][0] as Blob;
    expect(blob.type).toBe("text/plain;charset=utf-8");
    expect(await blob.text()).toBe(formatTextTranscript(messages));
    expect(mocks.anchor.href).toBe("blob:local-transcript");
    expect(mocks.anchor.download).toBe("research-design-transcript-current-conversation_123.txt");
    expect(mocks.appendChild).toHaveBeenCalledWith(mocks.anchor);
    expect(mocks.anchor.click).toHaveBeenCalledOnce();
    expect(mocks.anchor.remove).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:local-transcript");
  });

  it("sanitizes a filename label without changing transcript content", () => {
    const mocks = browser();
    downloadTextTranscript([{ role: "student", content: "Unchanged content" }], "../../bad/path?name=<123>");
    expect(mocks.anchor.download).toBe("research-design-transcript-badpathname123.txt");
    vi.runAllTimers();
  });

  it("falls back to a current label when the supplied ID has no filename characters", () => {
    const mocks = browser();
    downloadTextTranscript([{ role: "student", content: "Visible message" }], "../../");
    expect(mocks.anchor.download).toBe("research-design-transcript-current.txt");
    vi.runAllTimers();
  });

  it("rejects an empty download before creating an artifact", () => {
    const mocks = browser();
    expect(() => downloadTextTranscript([], "current")).toThrow("There are no visible messages");
    expect(mocks.createObjectURL).not.toHaveBeenCalled();
  });

  it("propagates a download failure and still releases its temporary resources", () => {
    const mocks = browser();
    mocks.anchor.click.mockImplementation(() => { throw new Error("Download failed"); });
    expect(() => downloadTextTranscript([{ role: "student", content: "Visible message" }], "current"))
      .toThrow("Download failed");
    expect(mocks.anchor.remove).toHaveBeenCalledOnce();
    vi.runAllTimers();
    expect(mocks.revokeObjectURL).toHaveBeenCalledWith("blob:local-transcript");
  });

  it("does not claim browser file generation is available in a server runtime", () => {
    vi.stubGlobal("document", undefined);
    expect(() => downloadTextTranscript([{ role: "student", content: "Visible message" }], "current"))
      .toThrow("available in the browser");
  });
});
