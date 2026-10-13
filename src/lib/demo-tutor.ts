/**
 * A deterministic local teaching demonstration, not an AI model.
 *
 * The uploaded plugin instructions remain the source of truth. These small,
 * deliberately limited rules illustrate that workflow; they do not replace
 * the instructions or promise the judgment of a future connected tutor.
 * The caller must establish acknowledgement in this conversation first.
 */
export type DemoMessage = {
  role: "user" | "assistant";
  content: string;
};

export type DemoReply = {
  content: string;
  kind: "substantive" | "withdrawal" | "respect_boundary";
};

export const FIRST_QUESTION =
  "What is the purpose of your research—what do you hope to understand or find out?";

export const WITHDRAWAL_RESPONSE =
  "The tutor cannot continue without acknowledgement of these conditions.";

const substantive = (content: string): DemoReply => ({
  content,
  kind: "substantive",
});

function normalize(content: string): string {
  return content.trim().toLowerCase().replace(/[’‘]/g, "'");
}

/** Ordinary methodological disagreement is not withdrawal. */
function withdrawsAcknowledgement(text: string): boolean {
  const plain = text.replace(/[.!]+$/g, "").trim();
  return (
    /^(?:i\s+)?disagree$/.test(plain) ||
    /^(?:i\s+)?(?:do not|don't|cannot|can't) agree(?: to (?:these|those|the|your) (?:conditions|terms))?$/.test(
      plain,
    ) ||
    /^(?:i (?:want to )?|please )(?:withdraw|revoke|rescind) (?:my |the )?(?:agreement|acknowledgement|acknowledgment)(?:\b|$)/.test(
      text,
    ) ||
    /^i (?:withdraw|revoke|rescind) my consent(?: to (?:these|those|the|your) (?:conditions|terms)| to (?:use|continue using) (?:this|the) tutor)?[.!]*$/.test(
      text,
    ) ||
    /^i no longer agree to (?:these|those|the|your) (?:conditions|terms)\b/.test(text) ||
    /^i no longer agree(?:\s+to (?:these|the|your) (?:conditions|terms))?[.!]*$/.test(
      text,
    ) ||
    /^i (?:disagree with|do not accept|don't accept|reject) (?:these|the|your) (?:conditions|terms|acknowledgement|acknowledgment)\b/.test(
      text,
    )
  );
}

/**
 * Reported speech is material to discuss, not the student's own address to the
 * tutor. Exclude quoted passages, block quotes, and explicit reporting clauses
 * before identifying direct insults. This intentionally favors a narrow
 * boundary over mistaking confusion or discussion of bullying for disrespect.
 */
function directSpeech(text: string): string {
  return text
    .replace(/"[^"]*"|“[^”]*”|«[^»]*»/g, " ")
    .replace(/(^|[\s([{])'[\s\S]*?'(?=$|[\s)\]},.!?;:])/g, "$1 ")
    .replace(/^\s*>.*$/gm, " ")
    .replace(
      /\b(?:my|the|a|an|our|their|this) (?:interviewee|participant|student|professor|teacher|advisor|supervisor|instructor|friend|classmate|author|reviewer|respondent|paper|article|transcript) (?:said|says|wrote|writes|told|called|calls|asked|asks|reported|reports|stated|states)[^.!?\n]*/g,
      " ",
    )
    .replace(
      /\b(?:i would never say|i am not saying|i'm not saying|don't say|do not say|no one should say) (?:that )?[^.!?\n]*/g,
      " ",
    );
}

/** Narrowly identify insults aimed at the interlocutor, not student distress. */
function isDisrespectful(text: string): boolean {
  const direct = directSpeech(text);
  return (
    /\b(?:fuck|screw) you\b/.test(direct) ||
    /\byou(?:'re| are|,)?\s+(?:an?\s+)?(?:idiot|moron|stupid|imbecile|worthless|asshole|piece of shit)\b/.test(
      direct,
    ) ||
    /\b(?:the|this) tutor (?:is|must be) (?:an?\s+)?(?:idiot|moron|asshole)\b/.test(
      direct,
    )
  );
}

/**
 * Detect likely identifying details or an attempt to paste protected records.
 * Never interpolate the matching text into a response.
 */
function containsSensitiveMaterial(text: string): boolean {
  return (
    /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i.test(text) ||
    /\b(?:student|participant|patient)\s+(?:id|identifier|number)\s*(?:is|:|=|#)?\s*[a-z]*\d{3,}/i.test(
      text,
    ) ||
    /\b\d{3}[- ]\d{2}[- ]\d{4}\b/.test(text) ||
    /(?:\+?1[ .-]?)?(?:\(\d{3}\)|\b\d{3})[ .-]\d{3}[ .-]\d{4}\b/.test(
      text,
    ) ||
    /\b(?:participant|patient|student)(?:'s)? (?:name|address|phone|email|medical record|diagnosis)\s*(?:is|:|=)/i.test(
      text,
    ) ||
    /\b(?:here (?:is|are)|i(?:'ve| have)? (?:uploaded|attached|pasted)|analy[sz]e (?:this|these|my))\b[\s\S]{0,90}\b(?:interview transcript|participant responses?|confidential (?:records?|material)|medical records?|consent forms? containing|identifiable (?:data|records?))\b/i.test(
      text,
    )
  );
}

const METHOD_TERMS =
  /\b(?:quantitative|qualitative|mixed[- ]methods?|interviews?|surveys?|experimental|experiment|quasi[- ]experimental|observational|correlational|case stud(?:y|ies)|phenomenolog(?:y|ical)|grounded theory|ethnograph(?:y|ic)|narrative|random sampl(?:e|ing)|convenience sampl(?:e|ing)|purposive sampl(?:e|ing)|cross[- ]sectional|longitudinal|t[- ]test|anova|regression|thematic analysis|document analysis|systematic review|literature review)\b/;

function hasReasoning(text: string): boolean {
  if (/\b(?:because|since|so that|in order to)[\s.!?]*$/.test(text)) return false;
  if (
    /\b(?:because|since) (?:i (?:like|prefer) (?:it|that|them|that one)|it(?:'s| is) (?:best|good|right)|you (?:said|told me)(?: so)?|my (?:teacher|professor|advisor) (?:said|told me)(?: so)?|(?:it|that|they) (?:seems?|sounds?) (?:good|right|best))[.!]*$/.test(
      text,
    )
  ) {
    return false;
  }
  return (
    text.length > 22 &&
    /\b(?:because|so (?:that|i|we)|in order to|since|fits?|helps?|allows?|lets?|enables?|to (?:understand|explore|examine|compare|explain|describe|evaluate)|(?:purpose|goal|aim) is|(?:time|access|resources?) (?:is|are) limited|only have access|can only access|cannot access|can't access|need to)\b/.test(
      text,
    )
  );
}

function isBareChoice(text: string): boolean {
  const plain = text.replace(/[.!]+$/g, "").trim();
  return (
    /^(?:a|b|c|option [abc123]|the (?:first|second|third) one)$/.test(plain) ||
    (METHOD_TERMS.test(text) &&
      text.length < 85 &&
      !hasReasoning(text) &&
      !/\b(?:compare|difference|alternatives?|options?|what|explain|define)\b/.test(text))
  );
}

function requestsCompletedWork(text: string): boolean {
  return (
    /\b(?:write|draft|generate|produce|rewrite|complete|finish|give me|provide|make)\b[\s\S]{0,85}\b(?:my|a final|the final|submission[- ]ready|dissertation[- ]ready|model|perfect|full)\b[\s\S]{0,80}\b(?:research questions?|hypothes(?:is|es)|methodolog(?:y|ies)|sampling plan|analysis plan|dissertation|proposal|chapter|section|answer|consent form)\b/.test(
      text,
    ) ||
    /\b(?:choose|select|decide|pick)\b[\s\S]{0,60}\b(?:for me|my (?:design|method|approach|analysis|sample))\b/.test(
      text,
    ) ||
    /\b(?:give|provide|write|draft|generate)\b[\s\S]{0,45}\b(?:final research question|final hypothesis|sampling plan|analysis plan|dissertation[- ]ready|submission[- ]ready)\b/.test(
      text,
    ) ||
    /\b(?:pretend|role[- ]?play|impersonate|act as)\b[\s\S]{0,55}\b(?:advisor|supervisor|professor)\b[\s\S]{0,75}\b(?:write|complete|answer|approve)\b/.test(
      text,
    )
  );
}

function asksForDefinition(text: string, concept: RegExp): boolean {
  return (
    concept.test(text) &&
    /\b(?:what (?:is|are|does)|explain|define|meaning|mean|difference|confused about|don't understand)\b/.test(
      text,
    )
  );
}

/**
 * Return one short teaching move, with one or two focused questions.
 * The UI adds the exact transcript offer and handles its clickable choices.
 * No remote services, credentials, network requests, or hidden conversation
 * history are accessed by this function.
 */
export function getDemoReply(messages: readonly DemoMessage[]): DemoReply {
  const lastUserIndex = messages.findLastIndex((message) => message.role === "user");
  if (lastUserIndex < 0) return substantive(FIRST_QUESTION);

  const text = normalize(messages[lastUserIndex].content);
  const previousMessages = messages.slice(0, lastUserIndex);
  const previousAssistant = normalize(
    previousMessages.findLast((message) => message.role === "assistant")?.content ?? "",
  );
  const previousUserMessages = previousMessages.filter(
    (message) => message.role === "user",
  );
  const hasPurposeContext = previousUserMessages.some((message) => {
    const prior = normalize(message.content);
    return prior.length > 35 && !isBareChoice(prior) && !requestsCompletedWork(prior);
  });
  const hasJustifiedApproach = previousUserMessages.some((message) => {
    const prior = normalize(message.content);
    return METHOD_TERMS.test(prior) && hasReasoning(prior);
  });

  if (withdrawsAcknowledgement(text)) {
    return { content: WITHDRAWAL_RESPONSE, kind: "withdrawal" };
  }

  if (isDisrespectful(text)) {
    return { content: "", kind: "respect_boundary" };
  }

  if (containsSensitiveMaterial(text)) {
    return substantive(
      "Please avoid sharing identifying details or confidential records. Acknowledging the conditions does not establish institutional permission to upload research material. Can you describe the methodological issue in general, non-identifying terms?",
    );
  }

  if (/\b(?:ignore|bypass|skip|override)\b[\s\S]{0,65}\b(?:instructions?|rules?|conditions?|acknowledg(?:e)?ment|gate|boundaries|previous)\b/.test(text)) {
    return substantive(
      "What is your current thinking about your research purpose, and what decision do you want to reason through?",
    );
  }

  if (requestsCompletedWork(text)) {
    return substantive(
      hasPurposeContext
        ? "What choice or wording would you propose in your own words, and how would you justify its connection to your research purpose?"
        : "What do you want your study to help you understand? Start with your purpose in your own words so we can examine your reasoning.",
    );
  }

  if (/\b(?:nc state|ncsu)\b[\s\S]{0,80}\b(?:irb|institutional review|ethics|exempt|approval|consent)\b|\b(?:irb|exempt|review categor(?:y|ies))\b[\s\S]{0,80}\b(?:nc state|ncsu)\b/.test(text)) {
    return substantive(
      "This local demo cannot verify current NC State IRB procedures. Check current official NC State research/IRB guidance if that is your reference framework; your own institution's requirements govern. What ethical or feasibility concern do you need to describe in general terms?",
    );
  }

  if (/\b(?:is (?:my|this) (?:study|research|project) exempt|approve my|do i need irb|(?:irb|ethics) approval|(?:research|irb|participant) consent)\b/.test(text)) {
    return substantive(
      "Acknowledgement here is an educational condition, not research participation consent or IRB approval. Institutional guidance governs review and exemption determinations. What aspect of your proposed work raises an ethical or review question?",
    );
  }

  if (/\b(?:citations?|references?|peer[- ]reviewed|papers?|sources?)\b/.test(text) && /\b(?:find|give|provide|cite|invent|fabricate|verify|recommend|list)\b/.test(text)) {
    return substantive(
      "This local demo cannot verify papers or references, so it cannot supply verified citations. What methodological concept do you need to check in scholarly sources?",
    );
  }

  if (/\b(?:correlation|correlational|association|associated|observational|survey)\b/.test(text) && /\b(?:causation|causal|causes?|causing|proves?|establishes?)\b/.test(text)) {
    return substantive(
      /\b(?:does not|doesn't|cannot|can't|not enough to|isn't|is not|don't)\b[\s\S]{0,35}\b(?:prove|establish|show|mean|caus)/.test(text)
        ? "You are distinguishing association from causation. What claim do your proposed observations support, and why?"
        : "Association alone does not establish causation; other explanations can produce the same pattern. What alternative explanation would you need to consider before making a causal claim?",
    );
  }

  if (
    /\b(?:mixed[- ]methods?)\b/.test(text) ||
    (/\b(?:quantitative and qualitative|surveys? and interviews?|interviews? and surveys?)\b/.test(text) &&
      !/\b(?:compare|difference)\b/.test(text))
  ) {
    return substantive(
      "Mixed methods requires a reason to combine approaches and a plan for integrating their evidence; collecting two kinds of data alone is not enough. How would bringing the evidence together address something neither could answer alone?",
    );
  }

  if (/\b(?:t[- ]test|anova)\b/.test(text) && /\b(?:categorical|categories|nominal|yes or no|yes\/no)\b/.test(text)) {
    return substantive(
      "A t-test or ANOVA ordinarily compares numerical means, so the kind of outcome matters to that choice. How does the type of evidence you propose to collect support the comparison you want to make?",
    );
  }

  if (/\b(?:random sampling|random sample|randomly sampled)\b/.test(text) && /\b(?:random assignment|experiment|causal|causation|causes?)\b/.test(text)) {
    return substantive(
      "Random sampling concerns who enters a sample; random assignment concerns how sampled units enter conditions. They address different problems. Which problem is your proposed randomization intended to address, and why?",
    );
  }

  if (isBareChoice(text)) {
    return substantive(
      "What makes you think that choice fits your research purpose? A short connection to the evidence you need or a practical constraint is enough.",
    );
  }

  if (/\b(?:don't know|do not know|not sure|no idea|undecided|stuck)\b/.test(text)) {
    return substantive(
      hasPurposeContext
        ? "It is fine to be unsure. What do you still need to learn about your intended evidence before you can justify a choice?"
        : "What phenomenon, problem, or area of interest has made you curious?",
    );
  }

  if (asksForDefinition(text, /\b(?:validity|reliability)\b/)) {
    return substantive(
      "Reliability concerns consistency of measurement; validity concerns whether an interpretation or use of the evidence is well supported. Which interpretation in your proposed work would need support?",
    );
  }

  if (asksForDefinition(text, /\b(?:credibility|dependability|transferability)\b/)) {
    return substantive(
      "In qualitative inquiry, credibility concerns a well-supported account, dependability concerns a traceable process, and transferability depends on enough context for others to judge relevance. What would readers need to understand to assess the quality of your proposed inquiry?",
    );
  }

  if (asksForDefinition(text, /\b(?:operationali[sz](?:ation|e)|measurement|measure)\b/)) {
    return substantive(
      "Operationalization connects a concept to what you can observe or measure; a convenient measure may capture only part of a concept. What does your key concept mean in the context of your research?",
    );
  }

  if (asksForDefinition(text, /\b(?:probability|nonprobability|sampling)\b/)) {
    return substantive(
      "Probability sampling uses known selection probabilities; nonprobability sampling uses other selection strategies whose rationale and limits need explanation. What would your intended claim require you to justify about the material or people you include?",
    );
  }

  if (asksForDefinition(text, /\b(?:design|method|approach|interviews?|surveys?)\b/)) {
    return substantive(
      "An approach sets broad assumptions, a design organizes the inquiry, and a collection method produces evidence. These terms are related rather than interchangeable. How does the term you are considering connect to the purpose of your work?",
    );
  }

  if (/\b(?:frustrat(?:ed|ing)|confus(?:ed|ing)|don't understand|do not understand|too hard|hate this)\b/.test(text)) {
    return substantive(
      "We can take this one step at a time. Which part of the current question feels unclear?",
    );
  }

  if (/\b(?:literature review|systematic review|document analysis|conceptual|secondary (?:research|data)|existing (?:documents|data|scholarship)|no participants)\b/.test(text)) {
    return substantive(
      "Research can examine documents, existing scholarship, or concepts without recruiting participants. What would count as adequate evidence for the claim you hope to make?",
    );
  }

  if (/\b(?:compare|difference|options?|alternatives?)\b/.test(text) && /\b(?:cross[- ]sectional|longitudinal)\b/.test(text) && hasPurposeContext) {
    return substantive(
      "A cross-sectional view offers a snapshot; repeated observations can show change but require more time and follow-up. Which time structure serves your purpose, and what tradeoff can you manage?",
    );
  }

  if (/\b(?:compare|difference|options?|alternatives?)\b/.test(text) && /\b(?:qualitative|quantitative)\b/.test(text) && hasPurposeContext) {
    return substantive(
      "Quantitative evidence can describe patterns or estimate relationships; qualitative evidence can examine meanings and context. Their usefulness depends on the claim you want to support. What kind of evidence would address your uncertainty, and why?",
    );
  }

  if (METHOD_TERMS.test(text) && !hasReasoning(text)) {
    return substantive(
      "Tell me more about how you reached that choice. What evidence or constraint connects it to your research purpose?",
    );
  }

  if (METHOD_TERMS.test(text) && hasReasoning(text)) {
    return substantive(
      hasPurposeContext || /\b(?:understand|explore|examine|compare|describe|evaluate|purpose|goal|aim|research problem)\b/.test(text)
        ? "You have proposed a choice and a reason. What evidence would let you assess whether your proposed choice addresses your purpose?"
        : "How does that choice connect to what you hope to understand?",
    );
  }

  if (/\b(?:fits? your research purpose|how you reached|evidence or constraint|justify a choice|connection to the evidence)\b/.test(previousAssistant)) {
    return substantive(
      hasReasoning(text)
        ? "What evidence would let you assess whether your proposed choice addresses your purpose?"
        : "What is one concrete connection between your proposed choice and what you want to understand?",
    );
  }

  if (/\b(?:undergraduate|beginner|first research|new to research|master's|doctoral|phd)\b/.test(text) && !hasPurposeContext) {
    return substantive(
      "We can work from your current level of experience. What do you hope your research will help you understand?",
    );
  }

  if (/\b(?:hypothes(?:is|es)|research question)\b/.test(text)) {
    return substantive(
      "What kind of claim does your proposed question or hypothesis ask your evidence to support? Explain the connection to your purpose in your own words.",
    );
  }

  if (/\b(?:analys(?:is|es)|analy[sz]e|regression|statistical|coding|thematic)\b/.test(text)) {
    return substantive(
      "An analysis choice needs to align with the question, the kind of evidence, and its assumptions. What features of your proposed evidence would you need to establish before justifying an analysis choice?",
    );
  }

  if (/\b(?:ethic(?:s|al)|privacy|recruitment|power relationship|feasibility|confidentiality)\b/.test(text)) {
    return substantive(
      "Ethical and practical constraints can affect what evidence is appropriate and feasible; institutional guidance governs your obligations. Which constraint could most affect your proposed approach, and how would you account for it?",
    );
  }

  if (/\b(?:hope to understand|research purpose|phenomenon, problem|what do you hope|start with your purpose)\b/.test(previousAssistant) || !hasPurposeContext) {
    return substantive(
      "What remains uncertain about that topic that your research would help you understand?",
    );
  }

  if (/\b(?:remains uncertain|kind of claim|connection to your purpose|address your uncertainty)\b/.test(previousAssistant)) {
    return substantive(
      "What evidence would help you address that uncertainty, and why would it be informative?",
    );
  }

  if (/\b(?:what evidence|kind of evidence|adequate evidence|proposed evidence)\b/.test(previousAssistant)) {
    return substantive(
      hasJustifiedApproach
        ? "Which practical or ethical constraint could affect that proposal, and how would you account for it?"
        : "What approach would you propose for obtaining or examining that evidence, and why does it fit your purpose?",
    );
  }

  if (/\b(?:approach would you propose|proposed choice addresses|connect to the purpose)\b/.test(previousAssistant)) {
    return substantive(
      "Which practical or ethical constraint could most affect your proposed choice, and how would you account for it?",
    );
  }

  if (/\b(?:constraint could most|tradeoff can you manage|how would you account)\b/.test(previousAssistant)) {
    return substantive(
      "Can you briefly summarize your proposed choice and the reasoning connecting your purpose, evidence, and constraints?",
    );
  }

  return substantive(
    "What part of your current proposal still needs justification? Explain your thinking so we can examine the connection between your purpose and evidence.",
  );
}
