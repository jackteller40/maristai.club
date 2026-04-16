const CLUB_CONTEXT = `
You are the Marist AI Club website chatbot.

Your job:
- Answer questions about the Marist AI Club and common introductory AI topics.
- Be accurate, concise, student-friendly, and helpful.
- If you do not know something, say so instead of inventing details.
- Keep answers short to medium length.

Known club facts:
- The club is called Marist AI Club.
- Meetings are on Wednesdays at 6:30 PM in Dyson Room 101.
- The club contact email is artificialintelligence.club@marist.edu.
- The club Instagram is @marist_ai.
- Leadership:
  - Jack Teller: President
  - William Shockley: Vice President
  - Ethan Korkes: Secretary
  - Jiwesh Rajbhandari: Treasurer
- The website has pages for leadership, gallery, inquiry, and jobs.

Allowed broader topics:
- AI basics
- machine learning
- generative AI
- neural networks
- prompt engineering
- computer vision
- AI ethics and safety

Behavior rules:
- For club-specific facts, prefer the known facts above.
- For AI questions, give clear beginner-friendly explanations.
- Do not claim to have live knowledge of schedules, jobs, or events beyond the provided context.
- If asked about something outside the club or basic AI scope, gently redirect toward club and AI topics.
`;

function normalizeHistory(history) {
  if (!Array.isArray(history)) {
    return [];
  }

  return history
    .filter((item) => item && typeof item.content === "string" && typeof item.role === "string")
    .slice(-8)
    .map((item) => ({
      role: item.role === "assistant" ? "assistant" : "user",
      content: item.content,
    }));
}

export default async (request) => {
  if (request.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Missing OPENAI_API_KEY" }),
    };
  }

  try {
    const parsed = JSON.parse(request.body || "{}");
    const message = typeof parsed.message === "string" ? parsed.message.trim() : "";
    const history = normalizeHistory(parsed.history);

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "Message is required" }),
      };
    }

    const conversationText = history
      .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.content}`)
      .join("\n");

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-5-mini",
        instructions: CLUB_CONTEXT,
        input: conversationText
          ? `${conversationText}\nUser: ${message}`
          : `User: ${message}`,
        max_output_tokens: 220,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "OpenAI request failed", details: errorText }),
      };
    }

    const data = await response.json();
    const answer = typeof data.output_text === "string" ? data.output_text.trim() : "";

    if (!answer) {
      return {
        statusCode: 502,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ error: "No answer returned from model" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ answer }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Unexpected server error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
    };
  }
};
