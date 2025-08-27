import { conversationManager } from "@/lib/conversation-manager";
import { NextRequest } from "next/server";

// GET: Retrieve conversation history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    const history = conversationManager.getHistory(sessionId);
    const session = conversationManager.getOrCreateSession(sessionId);

    return Response.json({
      sessionId,
      history,
      sessionInfo: {
        createdAt: session.createdAt,
        lastUpdated: session.lastUpdated,
        messageCount: history.length,
      },
    });
  } catch (error) {
    console.error("Error retrieving conversation:", error);
    return Response.json(
      { error: "Failed to retrieve conversation" },
      { status: 500 }
    );
  }
}

// DELETE: Clear conversation history
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    conversationManager.clearSession(sessionId);

    return Response.json({
      message: "Conversation history cleared",
      sessionId,
    });
  } catch (error) {
    console.error("Error clearing conversation:", error);
    return Response.json(
      { error: "Failed to clear conversation" },
      { status: 500 }
    );
  }
}

// PUT: Update conversation metadata or settings
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");
    const action = searchParams.get("action");

    if (!sessionId) {
      return Response.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (action === "cleanup-old") {
      const { hoursOld = 24 } = await request.json();
      conversationManager.cleanupOldSessions(hoursOld);

      return Response.json({
        message: `Cleaned up sessions older than ${hoursOld} hours`,
      });
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error updating conversation:", error);
    return Response.json(
      { error: "Failed to update conversation" },
      { status: 500 }
    );
  }
}
