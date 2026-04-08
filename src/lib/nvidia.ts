import OpenAI from "openai";

/**
 * NVIDIA NIM client (OpenAI-compatible API).
 * Model: qwen/qwen2.5-7b-instruct
 */
export function createNvidiaClient() {
  return new OpenAI({
    apiKey: process.env.NVIDIA_API_KEY,
    baseURL: "https://integrate.api.nvidia.com/v1",
  });
}

export const NVIDIA_MODEL = "qwen/qwen2.5-7b-instruct";
