const CLUB_KNOWLEDGE = [
  {
    topic: "club-overview",
    keywords: ["club", "marist ai club", "what is the club", "about the club", "overview"],
    content:
      "Marist AI Club is a student organization centered on artificial intelligence, machine learning, generative AI, robotics, prompt design, and the broader social impact of emerging technologies. The club is designed to be approachable for students across different levels of experience.",
  },
  {
    topic: "meetings",
    keywords: ["meeting", "meetings", "meet", "when", "where", "time", "room", "dyson"],
    content:
      "The Marist AI Club meets on Wednesdays at 6:30 PM in Dyson Room 101. Meetings are open to students across experience levels and often include discussion, demos, ideas, and collaborative learning.",
  },
  {
    topic: "joining",
    keywords: ["join", "membership", "member", "become a member", "sign up"],
    content:
      "Students can get involved by attending a meeting, reaching out through the inquiry page, emailing the club, or messaging the club on Instagram. The club is open to students who are curious about AI, even if they are just getting started.",
  },
  {
    topic: "contact",
    keywords: ["contact", "email", "instagram", "reach out", "message"],
    content:
      "The club can be contacted at artificialintelligence.club@marist.edu. The club Instagram is @marist_ai.",
  },
  {
    topic: "leadership",
    keywords: ["leadership", "executive", "team", "officers", "president", "vice president", "secretary", "treasurer"],
    content:
      "The executive board includes Jack Teller (President), William Shockley (Vice President), Ethan Korkes (Secretary), and Jiwesh Rajbhandari (Treasurer).",
  },
  {
    topic: "jack",
    keywords: ["jack", "jack teller", "president"],
    content:
      "Jack Teller is the President of the Marist AI Club. He is a Data Science and Applied Math major and a sophomore. His interests on the site focus on predictive modeling, data-driven decision-making, and club growth.",
  },
  {
    topic: "william",
    keywords: ["william", "shockley", "vice president"],
    content:
      "William Shockley is the Vice President of the club. He is a Data Science and Applied Math major and a sophomore. His interests on the site center on machine learning systems and analytics applications.",
  },
  {
    topic: "ethan",
    keywords: ["ethan", "korkes", "secretary"],
    content:
      "Ethan Korkes is the Secretary of the club. He is a Cybersecurity major and a sophomore. His interests on the site emphasize AI security, trustworthy systems, and responsible use.",
  },
  {
    topic: "jiwesh",
    keywords: ["jiwesh", "rajbhandari", "treasurer"],
    content:
      "Jiwesh Rajbhandari is the Treasurer of the club. He is a Data Science and Finance major and a sophomore. His interests on the site include AI in finance, forecasting, and decision support.",
  },
  {
    topic: "website-pages",
    keywords: ["website", "pages", "site", "leadership page", "gallery", "inquiry", "jobs"],
    content:
      "The website includes pages for leadership, gallery, inquiry, and jobs in addition to the homepage.",
  },
  {
    topic: "jobs",
    keywords: ["jobs", "career", "internship", "internships", "entry level", "new grad"],
    content:
      "The site includes a jobs page focused on AI, machine learning, software, robotics, and related internships or entry-level opportunities that are currently open.",
  },
  {
    topic: "ai-basics",
    keywords: ["what is ai", "artificial intelligence", "ai"],
    content:
      "Artificial intelligence is a broad field focused on creating systems that can perform tasks associated with reasoning, language, learning, perception, or decision-making.",
  },
  {
    topic: "machine-learning",
    keywords: ["machine learning", "ml"],
    content:
      "Machine learning is a branch of AI in which systems learn patterns from data and use those patterns to make predictions or decisions.",
  },
  {
    topic: "generative-ai",
    keywords: ["generative ai", "gen ai", "llm", "large language model", "chatgpt"],
    content:
      "Generative AI refers to systems that create new content such as text, code, images, or audio. Large language models are one example and generate language based on learned patterns.",
  },
  {
    topic: "prompt-engineering",
    keywords: ["prompt", "prompt engineering"],
    content:
      "Prompt engineering is the practice of structuring instructions, examples, and context so AI systems produce more relevant and useful outputs.",
  },
  {
    topic: "neural-networks",
    keywords: ["neural network", "neural networks"],
    content:
      "A neural network is a layered mathematical model inspired by connected neurons. It learns by adjusting weights between nodes to map inputs to outputs.",
  },
  {
    topic: "computer-vision",
    keywords: ["computer vision", "vision"],
    content:
      "Computer vision is a field of AI that helps systems interpret and reason about images or video, including tasks like classification, object detection, and segmentation.",
  },
  {
    topic: "ethics",
    keywords: ["ethics", "bias", "safety", "responsible ai", "fairness"],
    content:
      "AI ethics and safety focus on fairness, transparency, privacy, misuse prevention, reliability, and making sure AI systems are deployed responsibly.",
  },
];

const SYSTEM_PROMPT = `
You are the Marist AI Club website chatbot.

Your goals:
- Answer questions about the Marist AI Club and beginner-to-intermediate AI topics.
- Be accurate, concise, helpful, and student-friendly.
- Prefer the provided club knowledge over assumptions.
- If something is unknown, say so clearly.
- Do not invent schedules, events, policies, or job details beyond the provided context.
- If the user asks about a topic outside the club or basic AI scope, gently redirect back to club and AI topics.

Answer style:
- Keep answers short to medium length.
- Use plain language.
- When answering club questions, be direct and specific.
`;

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.content === "string" && typeof item.role === "string")
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content.trim(),
    }));
}

function getRelevantKnowledge(message) {
  const normalized = message.toLowerCase();

  const matched = CLUB_KNOWLEDGE.filter((entry) =>
    entry.keywords.some((keyword) => normalized.includes(keyword))
  );

  if (matched.length > 0) {
    return matched.slice(0, 6);
  }

  return CLUB_KNOWLEDGE.filter((entry) =>
    ["club-overview", "meetings", "contact"].includes(entry.topic)
  );
}

function getDeterministicReply(message) {
  const normalized = message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const directReplies = [
    {
      keys: ["when do you meet", "what time do you meet", "where do you meet", "meeting time"],
      answer:
        "The Marist AI Club meets on Wednesdays at 6:30 PM in Dyson Room 101.",
    },
    {
      keys: ["how do i join", "how can i join", "join the club"],
      answer:
        "You can join by attending a meeting, emailing artificialintelligence.club@marist.edu, or messaging @marist_ai on Instagram.",
    },
    {
      keys: ["what is your email", "club email", "contact email"],
      answer:
        "The club email is artificialintelligence.club@marist.edu.",
    },
    {
      keys: ["instagram", "insta"],
      answer:
        "The club Instagram is @marist_ai.",
    },
    {
      keys: ["who is president", "who is the president", "club president", "whos the president"],
      answer:
        "Jack Teller is the President of the Marist AI Club.",
    },
    {
      keys: ["who is vice president", "who is the vice president", "vice president", "whos the vice president"],
      answer:
        "William Shockley is the Vice President of the Marist AI Club.",
    },
    {
      keys: ["who is secretary", "who is the secretary", "secretary", "whos the secretary"],
      answer:
        "Ethan Korkes is the Secretary of the Marist AI Club.",
    },
    {
      keys: ["who is treasurer", "who is the treasurer", "treasurer", "whos the treasurer"],
      answer:
        "Jiwesh Rajbhandari is the Treasurer of the Marist AI Club.",
    },
  ];

  const found = directReplies.find((entry) =>
    entry.keys.some((key) => normalized.includes(key))
  );

  return found ? found.answer : null;
}

export default async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return jsonResponse({ error: "Missing OPENAI_API_KEY" }, 500);
  }

  try {
    const parsed = await request.json();
    const message = typeof parsed.message === "string" ? parsed.message.trim() : "";
    const history = normalizeHistory(parsed.history);

    if (!message) {
      return jsonResponse({ error: "Message is required" }, 400);
    }

    const deterministicReply = getDeterministicReply(message);
    if (deterministicReply) {
      return jsonResponse({ answer: deterministicReply });
    }

    const relevantKnowledge = getRelevantKnowledge(message);
    const knowledgeBlock = relevantKnowledge
      .map((entry) => `- ${entry.content}`)
      .join("\n");

    const conversationText = history
      .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.content}`)
      .join("\n");

    const userPrompt = `
Relevant knowledge:
${knowledgeBlock}

Conversation so far:
${conversationText || "No previous conversation."}

Latest user question:
${message}
    `.trim();

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        max_tokens: 260,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return jsonResponse({ error: "OpenAI request failed", details: errorText }, response.status);
    }

    const data = await response.json();
    const answer =
      typeof data?.choices?.[0]?.message?.content === "string"
        ? data.choices[0].message.content.trim()
        : "";

    if (!answer) {
      return jsonResponse({ error: "No answer returned from model" }, 502);
    }

    return jsonResponse({ answer });
  } catch (error) {
    return jsonResponse(
      {
        error: "Unexpected server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
};
