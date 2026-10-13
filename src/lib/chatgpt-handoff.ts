/** Official ChatGPT entry point. This is a link, not an inference endpoint. */
export const CHATGPT_URL = "https://chatgpt.com/";

/**
 * Accept only a direct, trusted HTTPS link to a configured ChatGPT custom tutor.
 * Invalid or unavailable configuration safely falls back during static builds.
 * Do not add prompts, conversation state, credentials, or profile data to URLs.
 */
export function getChatGptTutorUrl(configured?: string): string {
  if (!configured) return CHATGPT_URL;
  const candidate = configured.trim();

  // Reject URL-parser repairs of malformed control characters or backslashes.
  if (!/^https:\/\//i.test(candidate) || /[\s\\\u0000-\u001f\u007f]/.test(candidate)) {
    return CHATGPT_URL;
  }

  try {
    const url = new URL(candidate);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "chatgpt.com" ||
      url.port !== "" ||
      url.username !== "" ||
      url.password !== "" ||
      url.search !== "" ||
      url.hash !== "" ||
      !/^\/g\/g-[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*\/?$/.test(url.pathname)
    ) {
      return CHATGPT_URL;
    }
    return url.toString();
  } catch {
    return CHATGPT_URL;
  }
}

/**
 * Prepare only the owner's complete, trusted original instruction document.
 * This function does not accept website acknowledgement, student messages,
 * profiles, or credentials. The source is preserved verbatim, not summarized
 * or filtered, and agreement must be established again inside ChatGPT.
 */
export function formatChatGptSession(source: string): string {
  if (source.trim().length === 0) {
    throw new Error("The original tutor instructions are unavailable or empty.");
  }

  return (
    "Start a Research Design Tutor conversation using the complete original instructions below as the source of truth. " +
    "Display their exact mandatory acknowledgement notice first, without tutoring or intake questions, and wait for my explicit agreement in this ChatGPT conversation. " +
    "No acknowledgement from the website carries over.\n\n" +
    "Original Research Design Tutor instructions (verbatim):\n\n" +
    source
  );
}
