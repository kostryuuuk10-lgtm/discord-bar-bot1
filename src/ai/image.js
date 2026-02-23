const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
const { HF_API_KEY } = require("../config/env");

async function generate(prompt){
  const res = await fetch(
    "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    }
  );

  return Buffer.from(await res.arrayBuffer());
}

module.exports = { generate };
