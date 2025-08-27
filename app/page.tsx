"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown, { Components } from "react-markdown";
interface StreamingMessage {
  id: number;
  content: string;
  type: "user" | "assistant";
  isStreaming?: boolean;
}

const components: Components = {
  p({ children, ...props }) {
    return (
      <p className="text-md  mt-4" {...props}>
        {children}
      </p>
    );
  },
  a({ children, ...props }) {
    return (
      <a className="text-pink-500 hover:underline" {...props}>
        {children}
      </a>
    );
  },
  h2({ children, ...props }) {
    return (
      <h2 className="text-2xl font-bold mt-8" {...props}>
        {children}
      </h2>
    );
  },
  ul({ children, ...props }) {
    return (
      <ul className="list-disc pl-8 mt-4" {...props}>
        {children}
      </ul>
    );
  },
  ol({ children, ...props }) {
    return (
      <ol className="list-decimal pl-8 mt-4" {...props}>
        {children}
      </ol>
    );
  },
};

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<StreamingMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Custom hook for smart auto-scrolling based on user position
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  // Check if user is at bottom of chat
  const isAtBottom = () => {
    if (!messagesContainerRef.current) return true;
    const { scrollTop, scrollHeight, clientHeight } =
      messagesContainerRef.current;
    return Math.abs(scrollHeight - clientHeight - scrollTop) < 5; // 5px threshold
  };

  // Handle scroll events to show/hide scroll-to-bottom button
  const handleScroll = () => {
    const atBottom = isAtBottom();
    setShowScrollButton(!atBottom && messages.length > 0);
  };

  // Auto-scroll effect - only scroll if user is at bottom
  useEffect(() => {
    if (messages.length > 0) {
      // Always scroll for first message or if user is at bottom
      const shouldScroll = messages.length === 1 || isAtBottom();

      if (shouldScroll) {
        // Small delay to ensure DOM is updated
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages]);

  // Auto-scroll during streaming updates - watch content changes
  useEffect(() => {
    const streamingMessage = messages.find((msg) => msg.isStreaming);
    if (streamingMessage && isAtBottom()) {
      // Small delay to let content render, then scroll
      const timeoutId = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timeoutId);
    }
  }, [messages]); // Watch all message changes

  // Auto-scroll when loading state changes
  useEffect(() => {
    if (isLoading && isAtBottom()) {
      scrollToBottom();
    }
  }, [isLoading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!userInput.trim() || isLoading) return;

    const userMessage: StreamingMessage = {
      id: Date.now(),
      content: userInput,
      type: "user",
    };

    const assistantMessage: StreamingMessage = {
      id: Date.now() + 1,
      content: "",
      type: "assistant",
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);
    setUserInput("");
    setIsLoading(true);

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: userInput }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No reader available");
      }

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantMessage.id
                    ? { ...msg, isStreaming: false }
                    : msg
                )
              );
              break;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "text_delta") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? { ...msg, content: msg.content + parsed.content }
                      : msg
                  )
                );
              } else if (parsed.type === "agent_handoff") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: msg.content + "\n" + parsed.content + "\n",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "tool_call") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content:
                            "\n" + msg.content + "\n" + parsed.content + "\n",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "tool_thinking") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content:
                            "\n" + msg.content + "\n" + parsed.content + "\n",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "tool_output") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: "\n" + msg.content + parsed.content + "\n",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "message_complete") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: "\n" + msg.content + parsed.content + "\n",
                        }
                      : msg
                  )
                );
              } else if (parsed.type === "error") {
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessage.id
                      ? {
                          ...msg,
                          content: "❌ " + parsed.content,
                          isStreaming: false,
                        }
                      : msg
                  )
                );
              }
            } catch (parseError) {
              console.error("Error parsing streaming data:", parseError);
            }
          }
        }
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === "AbortError") {
        console.log("Request was aborted");
      } else {
        console.error("Streaming error:", error);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? {
                  ...msg,
                  content: "❌ Error: Unable to get response",
                  isStreaming: false,
                }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }

  function handleStop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }

  return (
    <div className="font-sans max-w-4xl mx-auto min-h-screen p-8">
      <h1 className="text-4xl font-bold text-center mb-8">AI Agent Chat</h1>

      {/* Messages Container */}
      <div className="relative">
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 mb-6 space-y-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 dark:bg-zinc-800"
        >
          {messages.length === 0 ? (
            <p className="text-gray-500 dark:text-slate-800 text-center">
              Start a conversation with your AI agent...
            </p>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.type === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === "user"
                        ? "bg-blue-500 dark:bg-blue-900 rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none dark:text-slate-300 text-white"
                        : "bg-white dark:bg-slate-800 border border-gray-200 rounded-tl-3xl rounded-tr-3xl rounded-bl-none rounded-br-3xl"
                    }`}
                  >
                    <ReactMarkdown components={components}>
                      {message.content}
                    </ReactMarkdown>
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-5 bg-gray-400 ml-1 animate-pulse" />
                    )}
                  </div>
                </div>
              ))}
              {/* Invisible element to scroll to */}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-8 right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2 shadow-lg transition-all"
            aria-label="Scroll to bottom"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.41 8.84L12 13.42l4.59-4.58L18 10.25l-6 6-6-6z" />
            </svg>
          </button>
        )}
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask your AI agent anything..."
          rows={3}
          className="flex-1 border-2 border-gray-300 rounded-md p-3 resize-none focus:border-blue-500 focus:outline-none"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <div className="flex flex-col gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
            disabled={isLoading || !userInput.trim()}
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
          {isLoading && (
            <button
              type="button"
              onClick={handleStop}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
            >
              Stop
            </button>
          )}
        </div>
      </form>

      {/* Status */}
      <div className="text-sm text-gray-500 mt-4 text-center">
        <p>{isLoading ? "AI is thinking..." : "Ready to chat"}</p>
      </div>
    </div>
  );
}
