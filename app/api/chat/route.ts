import {
  setDefaultOpenAIKey,
  Runner,
  AgentInputItem,
  user,
  assistant,
} from "@openai/agents";
import { masterTriageAgent } from "@/agents/master-triage/master-triage.agent";
import { conversationManager } from "@/lib/conversation-manager";

export async function POST(request: Request) {
  try {
    const {
      message,
      sessionId = "default",
      history = [],
    } = await request.json();

    if (!message) {
      return new Response("Message is required", { status: 400 });
    }

    // Set OpenAI API key
    setDefaultOpenAIKey(process.env.OPENAI_API_KEY!);

    // Get conversation history (use provided history or load from session)
    const conversationHistory =
      history.length > 0 ? history : conversationManager.getHistory(sessionId);

    // Build the input from history + new message
    const currentInput: AgentInputItem[] = [
      ...conversationHistory,
      user(message),
    ];

    // Create a ReadableStream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create runner instance
          const runner = new Runner();

          // Run the agent with streaming enabled and conversation history
          const agentStream = await runner.run(
            masterTriageAgent,
            currentInput,
            {
              stream: true,
            }
          );

          // Collect the agent's response content as we stream it
          let agentResponseContent = "";

          // Process streaming events for metadata (tools, handoffs, etc.)
          for await (const event of agentStream) {
            // Handle raw model stream events (direct from LLM)
            if (event.type === "raw_model_stream_event") {
              // Stream raw text data - using correct property name
              if (event.data.type === "output_text_delta") {
                const deltaContent = event.data.delta || "";
                agentResponseContent += deltaContent;
                
                const data = JSON.stringify({
                  type: "text_delta",
                  content: deltaContent,
                });
                controller.enqueue(`data: ${data}\n\n`);
              }
            }

            // Handle agent updated events (handoffs between agents)
            else if (event.type === "agent_updated_stream_event") {
              const data = JSON.stringify({
                type: "agent_handoff",
                content: `🔄 Switched to ${event.agent.name}`,
              });
              controller.enqueue(`data: ${data}\n\n`);
            }

            // Handle run item events (tools, messages, etc.)
            else if (event.type === "run_item_stream_event") {
              if (event.item.type === "tool_call_item") {
                const data = JSON.stringify({
                  type: "tool_call",
                  content: `🔧 Using tool...`,
                });
                controller.enqueue(`data: ${data}\n\n`);
              } else if (event.item.type === "tool_call_output_item") {
                const data = JSON.stringify({
                  type: "tool_output",
                  content: `✅ Tool completed`,
                });
                controller.enqueue(`data: ${data}\n\n`);
              } else if (event.item.type === "message_output_item") {
                const data = JSON.stringify({
                  type: "message_complete",
                  content: `💬 Message completed`,
                });
                controller.enqueue(`data: ${data}\n\n`);
              }
            }
          }

          // Create an assistant message with the actual response content we collected
          const agentResponse = assistant(agentResponseContent.trim());
          const historyToSave = [...currentInput, agentResponse];
          
          conversationManager.updateSession(sessionId, historyToSave);

          // Send completion signal with updated history
          const finalData = JSON.stringify({
            type: "final_result",
            content: "Response completed",
            finalOutput: null,
            history: historyToSave,
            sessionId: sessionId,
          });
          controller.enqueue(`data: ${finalData}\n\n`);

          // Signal completion
          controller.enqueue(`data: [DONE]\n\n`);
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);

          // Follow best practices for error handling in streams
          let errorMessage = "An error occurred while processing your request.";

          if (error instanceof Error) {
            // Log the specific error for debugging
            console.error("Error details:", error.message, error.stack);
            errorMessage = `Error: ${error.message}`;
          }

          const errorData = JSON.stringify({
            type: "error",
            content: errorMessage,
          });
          controller.enqueue(`data: ${errorData}\n\n`);

          // Ensure proper cleanup and graceful shutdown
          try {
            controller.enqueue(`data: [DONE]\n\n`);
            controller.close();
          } catch (closeError) {
            console.error("Error closing stream:", closeError);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
