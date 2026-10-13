import { describe, expect, it } from "vitest";
import {
  paginateTranscript,
  wrapTranscriptText,
  type TranscriptMessage,
} from "./transcript";

const measure = (text: string) => Array.from(text).length;

describe("transcript text wrapping", () => {
  it("preserves every original character, blank line, bullet and smart punctuation", () => {
    const content = "What is your research—what do you hope to find out?\r\n\r\n- A ‘quoted’ point\n  Two spaces\tand a tab\n";
    const wrapped = wrapTranscriptText(content, 18, measure);
    expect(wrapped.map((line) => line.source).join("")).toBe(content);
    expect(wrapped.every((line) => !/[\r\n]/u.test(line.text))).toBe(true);
    expect(wrapped.some((line) => line.text === "")).toBe(true);
  });

  it("wraps long words and keeps combining accents and emoji together", () => {
    const content = "a".repeat(120) + " café e\u0301 👩🏽‍🔬";
    const wrapped = wrapTranscriptText(content, 12, measure);
    expect(wrapped.length).toBeGreaterThan(10);
    expect(wrapped.map((line) => line.source).join("")).toBe(content);
    expect(wrapped.every((line) => !line.source.startsWith("\u0301"))).toBe(true);
    expect(wrapped.some((line) => line.source.includes("👩🏽‍🔬"))).toBe(true);
  });

  it("allows an oversized grapheme without hanging or losing it", () => {
    const wrapped = wrapTranscriptText("👩🏽‍🔬x", 1, () => 100);
    expect(wrapped.map((line) => line.source)).toEqual(["👩🏽‍🔬", "x"]);
  });

  it("preserves an empty visible message", () => {
    expect(wrapTranscriptText("", 20, measure)).toEqual([{ text: "", source: "" }]);
  });

  it("rejects a width that cannot support wrapping", () => {
    expect(() => wrapTranscriptText("text", 0, measure)).toThrow();
  });
});

describe("current conversation pagination", () => {
  const smallPage = {
    contentTop: 10,
    contentBottom: 90,
    lineHeight: 10,
    labelHeight: 10,
    messageGap: 5,
    maxTextWidth: 20,
  };

  it("includes supplied notices, choices and tutor/student content exactly in order", () => {
    const messages: TranscriptMessage[] = [
      { role: "notice", content: "Research Design Tutor — Before You Begin\n- Verify important information." },
      { role: "event", content: "I Agree" },
      { role: "tutor", content: "What is the purpose of your research—what do you hope to understand or find out?\n\nWould you like a PDF transcript of this conversation?\nCreate PDF · No thanks" },
      { role: "student", content: "I want to understand students’ experiences.\nSecond line." },
    ];
    const pages = paginateTranscript(messages, measure, smallPage);
    const contentRows = pages.flatMap((page) => page.rows).filter((row) => row.kind === "content");
    expect(pages.length).toBeGreaterThan(1);
    messages.forEach((message, index) => {
      expect(contentRows.filter((row) => row.messageIndex === index).map((row) => row.source).join(""))
        .toBe(message.content);
    });
    const indexes = contentRows.map((row) => row.messageIndex);
    expect(indexes).toEqual([...indexes].sort((a, b) => a - b));
    expect(pages.every((page) => page.rows.every((row) => row.y >= 10 && row.y + 10 <= 90))).toBe(true);
  });

  it("keeps labels with content and labels continuation pages without duplicating messages", () => {
    const message: TranscriptMessage = { role: "student", content: "word ".repeat(100) };
    const pages = paginateTranscript([message], measure, smallPage);
    expect(pages.length).toBeGreaterThan(2);
    expect(pages.every((page) => page.rows[0].kind === "label")).toBe(true);
    expect(pages.every((page) => page.rows.some((row) => row.kind === "content"))).toBe(true);
    expect(pages[1].rows[0].text).toBe("Student (continued)");
    expect(pages.flatMap((page) => page.rows).filter((row) => row.kind === "content").map((row) => row.source).join(""))
      .toBe(message.content);
  });

  it("does not create empty trailing pages", () => {
    const pages = paginateTranscript([{ role: "event", content: "A\nB\nC\nD\nE\nF\nG" }], measure, smallPage);
    expect(pages).toHaveLength(1);
  });

  it("rejects pages too small for both a label and content", () => {
    expect(() => paginateTranscript([], measure, { contentTop: 0, contentBottom: 1 })).toThrow();
  });
});
