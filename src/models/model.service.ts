import { ChatGroq } from "@langchain/groq";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatCohere } from "@langchain/cohere";

import config from "../config/config.js"

export const groqModel = new ChatGroq({
    apiKey: config.GROQ_API_KEY,
    model: "openai/gpt-oss-20b",
});

export const geminiModel = new ChatGoogleGenerativeAI({
    apiKey: config.GEMINI_API_KEY,
    model: "gemini-2.5-flash",
});

export const cohereModel = new ChatCohere({
    apiKey: config.COHERE_API_KEY,
    model: "command-a-plus-05-2026",
});