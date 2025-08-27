import { AgentInputItem } from "@openai/agents";

/**
 * Conversation Manager for maintaining agent memory/history
 *
 * This utility helps manage conversation state across multiple agent runs,
 * providing the agent with memory of previous interactions.
 */

interface ConversationSession {
  id: string;
  history: AgentInputItem[];
  createdAt: Date;
  lastUpdated: Date;
}

class ConversationManager {
  private sessions = new Map<string, ConversationSession>();

  /**
   * Create a new conversation session
   */
  createSession(sessionId: string): ConversationSession {
    const session: ConversationSession = {
      id: sessionId,
      history: [],
      createdAt: new Date(),
      lastUpdated: new Date(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  /**
   * Get existing session or create new one
   */
  getOrCreateSession(sessionId: string): ConversationSession {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      return existing;
    }
    return this.createSession(sessionId);
  }

  /**
   * Update session history after agent run
   */
  updateSession(sessionId: string, newHistory: AgentInputItem[]): void {
    console.log(`💾 ConversationManager.updateSession(${sessionId}): Saving ${newHistory.length} items`);
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history = newHistory;
      session.lastUpdated = new Date();
      console.log(`💾 Session updated successfully. Total items: ${session.history.length}`);
    } else {
      console.log(`❌ Session ${sessionId} not found! Creating new session...`);
      this.createSession(sessionId);
      const newSession = this.sessions.get(sessionId);
      if (newSession) {
        newSession.history = newHistory;
        newSession.lastUpdated = new Date();
        console.log(`💾 New session created and updated with ${newHistory.length} items`);
      }
    }
  }

  /**
   * Get conversation history for a session
   */
  getHistory(sessionId: string): AgentInputItem[] {
    const session = this.sessions.get(sessionId);
    const history = session?.history || [];
    console.log(`🔍 ConversationManager.getHistory(${sessionId}): Found ${history.length} items`);
    console.log(`🔍 Session exists: ${!!session}, Available sessions: ${Array.from(this.sessions.keys())}`);
    return history;
  }

  /**
   * Clear conversation history for a session
   */
  clearSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.history = [];
      session.lastUpdated = new Date();
    }
  }

  /**
   * Delete a session entirely
   */
  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getSessions(): ConversationSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Clean up old sessions (older than specified hours)
   */
  cleanupOldSessions(hoursOld: number = 24): void {
    const cutoffTime = new Date(Date.now() - hoursOld * 60 * 60 * 1000);

    for (const [sessionId, session] of this.sessions) {
      if (session.lastUpdated < cutoffTime) {
        this.sessions.delete(sessionId);
      }
    }
  }
}

// Export singleton instance for in-memory storage
// For production, you'd want to persist this to a database
export const conversationManager = new ConversationManager();

// Export types for use in other files
export type { ConversationSession };
