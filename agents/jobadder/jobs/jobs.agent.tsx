import { Agent } from "@openai/agents";

import { jobadderInstructions } from "./jobs.instructions";
import { getJobByIdTool, getJobsTool } from "@/agents/tools";

export const jobadderJobsAgent = Agent.create({
  name: "Jobadder Jobs Agent",
  instructions: jobadderInstructions,
  tools: [getJobsTool, getJobByIdTool],
  handoffDescription: `
    - This agent has access to Jobadder and can get the open jobs from Jobadder using the getJobsTool.
    - If the user asks about a specific job, you can use the getJobByIdTool to get the job details but you must 
    as for the job id.
    - A Job ID must be provided in the response.
    `,
});
