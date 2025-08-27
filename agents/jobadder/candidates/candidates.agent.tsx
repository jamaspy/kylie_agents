import { Agent } from "@openai/agents";
import { candidateInstructions } from "./candidates.instructions";
import {
  getCandidateApplicationsTool,
  getCandidateByIdTool,
  getCandidatesTool,
} from "@/agents/tools";

export const jobadderCandidatesAgent = Agent.create({
  name: "Jobadder Candidates Agent",
  instructions: candidateInstructions,
  tools: [
    getCandidatesTool,
    getCandidateByIdTool,
    getCandidateApplicationsTool,
  ],
  handoffDescription:
    "This agent is called if the user requests any information or actions about Candidates in the system",
});
