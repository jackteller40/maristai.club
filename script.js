document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    const target = targetId ? document.querySelector(targetId) : null;

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

const chatbotKnowledge = [
  {
    match: ["meeting", "meetings", "when do you meet", "what time", "where do you meet"],
    answer:
      "The Marist AI Club meets on Wednesdays at 6:30 PM in Dyson Room 101. Meetings are open to students across experience levels.",
  },
  {
    match: ["join", "become a member", "membership", "how do i join"],
    answer:
      "You can join by showing up to a meeting, reaching out through the inquiry page, or contacting the club on Instagram at @marist_ai.",
  },
  {
    match: ["contact", "email", "instagram", "reach out"],
    answer:
      "You can contact the club at artificialintelligence.club@marist.edu or on Instagram at @marist_ai.",
  },
  {
    match: ["leadership", "executive board", "officers", "team"],
    answer:
      "The executive board includes Jack Teller (President), William Shockley (Vice President), Ethan Korkes (Secretary), and Jiwesh Rajbhandari (Treasurer).",
  },
  {
    match: ["president", "who is the president", "club president", "who's the president"],
    answer:
      "Jack Teller is the President of the Marist AI Club.",
  },
  {
    match: ["vice president", "who is the vice president", "who's the vice president"],
    answer:
      "William Shockley is the Vice President of the Marist AI Club.",
  },
  {
    match: ["secretary", "who is the secretary", "who's the secretary"],
    answer:
      "Ethan Korkes is the Secretary of the Marist AI Club.",
  },
  {
    match: ["treasurer", "who is the treasurer", "who's the treasurer"],
    answer:
      "Jiwesh Rajbhandari is the Treasurer of the Marist AI Club.",
  },
  {
    match: ["what is ai", "define ai", "artificial intelligence"],
    answer:
      "Artificial intelligence is a broad field focused on building systems that can perform tasks associated with perception, reasoning, learning, language, or decision-making.",
  },
  {
    match: ["machine learning", "ml"],
    answer:
      "Machine learning is a part of AI where systems learn patterns from data instead of being programmed with explicit rules for every situation.",
  },
  {
    match: ["generative ai", "gen ai", "chatgpt", "llm", "large language model"],
    answer:
      "Generative AI refers to systems that create new content such as text, images, audio, or code. Large language models are one example and are trained to predict and generate language.",
  },
  {
    match: ["prompt engineering", "prompt"],
    answer:
      "Prompt engineering is the practice of structuring instructions and context so an AI system produces more useful, accurate, and relevant outputs.",
  },
  {
    match: ["neural network", "neural networks"],
    answer:
      "A neural network is a layered model inspired by connected neurons. It learns by adjusting weights across many connections to map inputs to outputs.",
  },
  {
    match: ["computer vision", "vision"],
    answer:
      "Computer vision is an AI field focused on helping systems interpret images and video, including tasks like classification, detection, and segmentation.",
  },
  {
    match: ["ethics", "bias", "safety", "responsible ai"],
    answer:
      "AI ethics and safety focus on fairness, transparency, privacy, misuse prevention, and making sure systems behave responsibly in real-world settings.",
  },
  {
    match: ["jobs", "internship", "internships", "career", "careers"],
    answer:
      "The site has a dedicated jobs page with AI, machine learning, and CS-related internships and early-career opportunities that are currently open.",
  },
];

const CHAT_ENDPOINT = "/.netlify/functions/chat";

function createChatbot() {
  const chatbot = document.createElement("aside");
  chatbot.className = "chatbot";
  chatbot.innerHTML = `
    <button class="chatbot-toggle" type="button" aria-expanded="false" aria-controls="chatbot-panel">
      Ask the AI Club Bot
    </button>
    <section class="chatbot-panel" id="chatbot-panel" hidden>
      <div class="chatbot-header">
        <div>
          <p class="chatbot-eyebrow">Marist AI Club</p>
          <h2>AI Club Bot</h2>
        </div>
        <button class="chatbot-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="chatbot-messages" aria-live="polite">
        <div class="chatbot-message bot">
          Hi! I can answer questions about the Marist AI Club, meeting info, leadership, and core AI topics.
        </div>
      </div>
      <div class="chatbot-suggestions">
        <button type="button" data-question="When does the club meet?">When does the club meet?</button>
        <button type="button" data-question="How do I join?">How do I join?</button>
        <button type="button" data-question="What is generative AI?">What is generative AI?</button>
      </div>
      <form class="chatbot-form">
        <input class="chatbot-input" type="text" name="question" placeholder="Ask about AI or the club..." autocomplete="off" />
        <button class="button primary chatbot-submit" type="submit">Send</button>
      </form>
    </section>
  `;

  document.body.appendChild(chatbot);

  const toggle = chatbot.querySelector(".chatbot-toggle");
  const panel = chatbot.querySelector(".chatbot-panel");
  const close = chatbot.querySelector(".chatbot-close");
  const form = chatbot.querySelector(".chatbot-form");
  const input = chatbot.querySelector(".chatbot-input");
  const messages = chatbot.querySelector(".chatbot-messages");
  const submit = chatbot.querySelector(".chatbot-submit");
  const history = [
    {
      role: "assistant",
      content:
        "Hi! I can answer questions about the Marist AI Club, meeting info, leadership, and core AI topics.",
    },
  ];

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    chatbot.classList.toggle("open", open);
    if (open) {
      input.focus();
    }
  }

  function appendMessage(text, type) {
    const node = document.createElement("div");
    node.className = `chatbot-message ${type}`;
    node.textContent = text;
    messages.appendChild(node);
    messages.scrollTop = messages.scrollHeight;
  }

  function getFallbackReply(question) {
    const normalized = question
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    const found = chatbotKnowledge.find((entry) =>
      entry.match.some((term) => normalized.includes(term))
    );

    if (found) {
      return found.answer;
    }

    return "I do not have a specific answer for that yet, but you can contact the club at artificialintelligence.club@marist.edu or ask about meetings, leadership, joining, jobs, or core AI topics like machine learning and generative AI.";
  }

  async function getReply(question) {
    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
          history,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (typeof data.answer === "string" && data.answer.trim()) {
        return data.answer.trim();
      }

      throw new Error("Missing chatbot answer");
    } catch (error) {
      console.error("Chatbot fallback activated:", error);
      return getFallbackReply(question);
    }
  }

  function setBusy(busy) {
    input.disabled = busy;
    submit.disabled = busy;
    submit.textContent = busy ? "Thinking..." : "Send";
  }

  toggle.addEventListener("click", () => setOpen(!chatbot.classList.contains("open")));
  close.addEventListener("click", () => setOpen(false));

  chatbot.querySelectorAll("[data-question]").forEach((button) => {
    button.addEventListener("click", async () => {
      const question = button.getAttribute("data-question");
      if (!question) {
        return;
      }

      setBusy(true);
      appendMessage(question, "user");
      history.push({ role: "user", content: question });
      const reply = await getReply(question);
      appendMessage(reply, "bot");
      history.push({ role: "assistant", content: reply });
      setBusy(false);
      setOpen(true);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const question = input.value.trim();

    if (!question) {
      return;
    }

    setBusy(true);
    appendMessage(question, "user");
    history.push({ role: "user", content: question });
    const reply = await getReply(question);
    appendMessage(reply, "bot");
    history.push({ role: "assistant", content: reply });
    input.value = "";
    setBusy(false);
    setOpen(true);
  });
}

createChatbot();
