import { Agent, fileSearchTool, webSearchTool } from "@openai/agents";
import { masterTriageInstructions } from "./master-triage.instructions";
import { jobadderJobsAgent } from "../jobadder/jobs";
import { jobadderCandidatesAgent } from "../jobadder/candidates";
import { linkedinPostWriterAgent } from "../linkedin-post-writer";

// SHORT AGENT
export const masterTriageAgent = Agent.create({
  name: "Master Triage",
  instructions: masterTriageInstructions,
  tools: [
    webSearchTool(),
    fileSearchTool("vs_688f0bc960fc81918455a4f6e9924e60"),
  ],
  handoffs: [
    jobadderJobsAgent,
    jobadderCandidatesAgent,
    linkedinPostWriterAgent,
  ],
});

// LOGGING
masterTriageAgent.on("agent_start", (agent) => {
  console.log("Triage Agent started", agent);
});

masterTriageAgent.on("agent_handoff", (handoff) => {
  console.log("Triage Agent Handoff", handoff);
});

masterTriageAgent.on("agent_end", (agent) => {
  console.log("Triage Agent ended", agent);
});
