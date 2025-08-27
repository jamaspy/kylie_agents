"use server";

import { setDefaultOpenAIKey, AgentInputItem, user } from "@openai/agents";
import { run } from "@openai/agents";
import { masterTriageAgent } from "./master-triage/master-triage.agent";

export async function runAgent({
  userInput,
  history = [],
}: {
  userInput: string;
  history?: AgentInputItem[];
}) {
  setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

  // Build input from history + new message
  const input: AgentInputItem[] = [...history, user(userInput)];

  const result = await run(masterTriageAgent, input);
  console.log("Result", result.finalOutput);
  console.log("Updated History", result.history);

  return {
    finalOutput: result.finalOutput,
    history: result.history,
  };
}
