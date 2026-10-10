import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { CohereClientV2 } from "cohere-ai";

import config from "../config/config.js"

export const groqModel = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
});

export const geminiModel = new ChatGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    model: "gemini-3.8-flash",
});
export const cohereModel = new CohereClientV2({
    token: config.COHERE_API_KEY,
});

// export const cohereModel = new CohereClientV2({
//     apiKey: config.COHERE_API_KEY,
//     model: "command-a-plus-05-2026",
// });