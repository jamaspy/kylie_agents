import { Agent, webSearchTool } from "@openai/agents";
import { linkedinPostWriterInstructions } from "./linked-in-post-writer.instructions";

export const linkedinPostWriterAgent = new Agent({
  name: "Linkedin Post Writer",
  tools: [webSearchTool()],
  handoffDescription:
    "This agent has access to the web and can search the web for information. It is used to write linkedin posts in the correct tone of voice and style",
  instructions: linkedinPostWriterInstructions,
});
