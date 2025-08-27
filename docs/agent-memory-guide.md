# Agent Memory & Conversation History Guide

This guide shows how to implement and use agent memory/knowledge of previous interactions using the OpenAI Agents SDK.

## Overview

The agent memory system allows your agents to maintain context across multiple interactions by storing and retrieving conversation history. This enables more natural, continuous conversations where the agent remembers previous context.

## How It Works

1. **Conversation History**: Each interaction is stored as `AgentInputItem[]` array
2. **Session Management**: Conversations are organized by session IDs  
3. **Automatic Updates**: History is automatically updated after each agent run
4. **Memory Persistence**: History can be stored in-memory, database, or client-side

## API Usage

### Basic Chat with Memory

```typescript
// POST /api/chat
{
  "message": "Hello, I'm working on a React project",
  "sessionId": "user-123" // optional, defaults to "default"
}

// Response includes updated history
{
  "type": "final_result",
  "content": "Response completed",
  "finalOutput": "Hello! I'd be happy to help with your React project...",
  "history": [...], // Updated conversation history
  "sessionId": "user-123"
}
```

### Advanced Usage with Explicit History

```typescript
// You can also pass history explicitly if managing client-side
{
  "message": "What was my previous question?",
  "sessionId": "user-123",
  "history": [...] // Explicit history array
}
```

## Client-Side Implementation

### React Hook Example

```typescript
import { useState, useCallback } from 'react';
import { AgentInputItem } from '@openai/agents';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function useAgentChat(sessionId: string = 'default') {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<AgentInputItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (message: string) => {
    setIsLoading(true);
    
    // Add user message to UI
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sessionId,
          history, // Send current history
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let assistantMessage = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text_delta') {
                assistantMessage += data.content;
                
                // Update the assistant message in real-time
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastMessage = newMessages[newMessages.length - 1];
                  
                  if (lastMessage?.role === 'assistant') {
                    lastMessage.content = assistantMessage;
                  } else {
                    newMessages.push({
                      role: 'assistant',
                      content: assistantMessage,
                      timestamp: new Date()
                    });
                  }
                  
                  return newMessages;
                });
              } else if (data.type === 'final_result') {
                // Update conversation history for next turn
                setHistory(data.history || []);
              }
            } catch (error) {
              console.error('Error parsing stream data:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to UI
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, history]);

  const clearConversation = useCallback(async () => {
    try {
      await fetch(`/api/conversation?sessionId=${sessionId}`, {
        method: 'DELETE',
      });
      
      setMessages([]);
      setHistory([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
    }
  }, [sessionId]);

  return {
    messages,
    sendMessage,
    clearConversation,
    isLoading,
  };
}
```

### Using the Hook in a Component

```typescript
import { useAgentChat } from './hooks/useAgentChat';

export default function ChatInterface() {
  const { messages, sendMessage, clearConversation, isLoading } = useAgentChat('user-123');
  
  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="content">{message.content}</div>
            <div className="timestamp">{message.timestamp.toLocaleTimeString()}</div>
          </div>
        ))}
      </div>
      
      <form onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem('message') as HTMLInputElement;
        if (input.value.trim()) {
          sendMessage(input.value);
          input.value = '';
        }
      }}>
        <input 
          name="message" 
          placeholder="Type your message..." 
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      
      <button onClick={clearConversation}>Clear Conversation</button>
    </div>
  );
}
```

## Conversation Management API

### Get Conversation History
```typescript
// GET /api/conversation?sessionId=user-123
{
  "sessionId": "user-123",
  "history": [...],
  "sessionInfo": {
    "createdAt": "2024-01-01T00:00:00Z",
    "lastUpdated": "2024-01-01T00:05:00Z",
    "messageCount": 10
  }
}
```

### Clear Conversation
```typescript
// DELETE /api/conversation?sessionId=user-123
{
  "message": "Conversation history cleared",
  "sessionId": "user-123"
}
```

### Clean Up Old Sessions
```typescript
// PUT /api/conversation?sessionId=any&action=cleanup-old
{
  "hoursOld": 24
}
```

## Server-Side Usage (Non-Streaming)

```typescript
import { runAgent } from '@/agents/run';

// Simple usage with history
const result = await runAgent({
  userInput: "What did we discuss about React?",
  history: previousConversationHistory
});

console.log('Agent Response:', result.finalOutput);
console.log('Updated History:', result.history);

// Save the updated history for next interaction
await saveHistoryToDatabase(sessionId, result.history);
```

## Best Practices

1. **Session Management**: Use meaningful session IDs (user IDs, conversation IDs)
2. **History Limits**: Consider truncating very long conversations to manage context limits
3. **Persistence**: For production, store history in a database rather than in-memory
4. **Privacy**: Ensure proper data handling and user consent for conversation storage
5. **Cleanup**: Regularly clean up old conversations to manage storage

## Memory Strategies

### Context Window Management
```typescript
function truncateHistory(history: AgentInputItem[], maxTokens: number = 4000): AgentInputItem[] {
  // Simple truncation - keep recent messages
  // You might want more sophisticated strategies like:
  // - Summarizing old context
  // - Keeping important messages
  // - Sliding window approach
  
  if (history.length <= 10) return history;
  
  return history.slice(-10); // Keep last 10 interactions
}
```

### Persistent Storage
```typescript
// Database storage example (using your preferred DB)
class DatabaseConversationManager {
  async getHistory(sessionId: string): Promise<AgentInputItem[]> {
    const session = await db.conversation.findFirst({
      where: { sessionId },
    });
    return session?.history || [];
  }
  
  async updateHistory(sessionId: string, history: AgentInputItem[]): Promise<void> {
    await db.conversation.upsert({
      where: { sessionId },
      update: { history, lastUpdated: new Date() },
      create: { sessionId, history, createdAt: new Date() },
    });
  }
}
```

This system gives your agents persistent memory across conversations, enabling more natural and contextual interactions!