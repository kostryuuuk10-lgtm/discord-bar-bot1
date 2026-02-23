const OpenAI = require("openai");
const { GROQ_API_KEY } = require("../config/env");

const openai = new OpenAI({
  apiKey: GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

async function ask(messages){
  const res = await openai.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages
  });
  return res.choices[0].message.content;
}

module.exports = { ask };
