import fetch from "node-fetch";
import { GROQ_API_KEY } from "../config.js";

export async function askGroq(history){

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      "Authorization":`Bearer ${GROQ_API_KEY}`
    },
    body:JSON.stringify({
      model:"llama3-70b-8192",
      messages:history
    })
  });

  const json = await res.json();
  return json.choices?.[0]?.message?.content || "ИИ недоступен.";
}
