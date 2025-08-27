import {
  setDefaultOpenAIKey,
  Runner,
  AgentInputItem,
  user,
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

    console.log("📖 Loaded conversation history LENGTH:", conversationHistory.length);
    console.log("📖 Loaded conversation history DETAILS:", JSON.stringify(conversationHistory.map((item: AgentInputItem) => ({
      type: item.type,
      role: (item as { role?: string }).role || 'n/a',
      contentPreview: typeof (item as { content?: unknown }).content === 'string' 
        ? ((item as { content: string }).content).substring(0, 200) + '...' 
        : '[complex content]'
    })), null, 2));
    
    console.log("💬 New user message:", message);
    console.log("🔍 Session ID:", sessionId);

    // Build the input from history + new message
    const currentInput: AgentInputItem[] = [
      ...conversationHistory,
      user(message),
    ];

    console.log("🎯 Complete input being sent to agent:", JSON.stringify(currentInput.map((item: AgentInputItem) => ({
      type: item.type,
      role: (item as { role?: string }).role || 'n/a',
      contentPreview: typeof (item as { content?: unknown }).content === 'string' 
        ? ((item as { content: string }).content).substring(0, 100) + '...' 
        : '[complex content]'
    })), null, 2));

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

          // Process streaming events for metadata (tools, handoffs, etc.)
          for await (const event of agentStream) {
            // Handle raw model stream events (direct from LLM)
            if (event.type === "raw_model_stream_event") {
              // Stream raw text data - using correct property name
              if (event.data.type === "output_text_delta") {
                const deltaContent = event.data.delta || "";
                
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

          // After streaming completes, run the agent again (non-streaming) to get proper result.history
          // This ensures we capture the complete conversation context including handoff states
          console.log("🔍 Running non-streaming to capture proper history...");
          console.log("🔍 Input to non-streaming run:", JSON.stringify(currentInput.map((item: AgentInputItem) => ({
            type: item.type,
            role: (item as { role?: string }).role || 'n/a',
            contentPreview: typeof (item as { content?: unknown }).content === 'string' 
              ? ((item as { content: string }).content).substring(0, 100) + '...' 
              : '[complex content]'
          })), null, 2));
          
          const result = await runner.run(masterTriageAgent, currentInput, {
            stream: false,
          });

          console.log("📊 Result from non-streaming run:");
          console.log("📊 result.output:", typeof result.output, result.output ? "exists" : "null");
          console.log("📊 result.history.length:", result.history.length);
          
          // Use the proper result.history from the SDK (includes all agent outputs and context)
          const historyToSave = result.history;
          
          console.log("📚 Conversation history being saved:", JSON.stringify(historyToSave.map((item: AgentInputItem) => ({
            type: item.type,
            role: (item as { role?: string }).role || 'n/a',
            contentPreview: typeof (item as { content?: unknown }).content === 'string' 
              ? ((item as { content: string }).content).substring(0, 100) + '...' 
              : '[complex content]'
          })), null, 2));
          
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
