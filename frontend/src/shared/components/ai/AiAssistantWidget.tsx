import type { AiChatMessage } from "@/services/adapters/aiAdapter";
import { chatApi, type ChatHistoryMessageResponse } from "@/services/api/chatApi";
import { aiService } from "@/services/aiService";
import { productService } from "@/services/productService";
import { useAuthStore } from "@/shared/hooks/useAuthStore";
import { useAiChatStore } from "@/shared/hooks/useAiChatStore";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, SendHorizonal, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";

const mapHistoryMessage = (message: ChatHistoryMessageResponse): AiChatMessage => ({
  id: message.id,
  role: message.role === "user" ? "user" : "assistant",
  content: message.content,
  createdAt: message.createdAt,
  handledBy: message.handledBy === "STAFF" ? "STAFF" : "AI",
});

export const AiAssistantWidget = () => {
  const [input, setInput] = useState("");
  const [activeRecommendationIds, setActiveRecommendationIds] = useState<string[]>([]);
  const syncedSupportLinesRef = useRef<Set<string>>(new Set());
  const supportSyncInitializedRef = useRef(false);
  const hadActiveSupportRef = useRef(false);
  const previousUserIdRef = useRef<string | null>(null);
  const messagesViewportRef = useRef<HTMLDivElement | null>(null);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCustomer = isAuthenticated && user?.role === "CUSTOMER";

  const {
    isOpen,
    toggle,
    messages,
    pushMessage,
    setMessages,
    resetConversation,
    status,
    setStatus,
  } = useAiChatStore();

  useEffect(() => {
    const currentUserId = isAuthenticated ? (user?.id ?? null) : null;
    if (previousUserIdRef.current === currentUserId) {
      return;
    }

    previousUserIdRef.current = currentUserId;
    resetConversation();
    setActiveRecommendationIds([]);
    syncedSupportLinesRef.current.clear();
    supportSyncInitializedRef.current = false;
    hadActiveSupportRef.current = false;
  }, [isAuthenticated, user?.id, resetConversation]);

  const historyQuery = useQuery({
    queryKey: ["chat-history", user?.id],
    queryFn: chatApi.history,
    enabled: isOpen && isCustomer,
    refetchOnWindowFocus: false,
  });

  const recommendationQuery = useQuery({
    queryKey: ["ai-recommendations", activeRecommendationIds.join(",")],
    queryFn: () => productService.getByIds(activeRecommendationIds),
    enabled: activeRecommendationIds.length > 0,
  });

  const activeSupportQuery = useQuery({
    queryKey: ["my-active-support", user?.id],
    queryFn: chatApi.myActiveSupport,
    enabled: isOpen && isCustomer,
    refetchInterval: isOpen && isCustomer ? 1500 : false,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => aiService.reply(text),
    onSuccess: (reply) => {
      pushMessage(reply);
      setStatus(reply.handledBy === "STAFF" ? "ESCALATED_TO_STAFF" : "AI_HANDLED");
      setActiveRecommendationIds(reply.recommendedProductIds ?? []);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Khong the ket noi AI luc nay.";
      pushMessage({
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content: message,
        createdAt: new Date().toISOString(),
        handledBy: "AI",
      });
    },
  });

  const escalateMutation = useMutation({
    mutationFn: () => aiService.escalateToStaff(),
    onSuccess: (reply) => {
      pushMessage(reply);
      setStatus("ESCALATED_TO_STAFF");
      hadActiveSupportRef.current = true;
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Không thể chuyển cho nhân viên hỗ trợ.";
      pushMessage({
        id: `assistant-escalate-error-${Date.now()}`,
        role: "assistant",
        content: message,
        createdAt: new Date().toISOString(),
        handledBy: "AI",
      });
    },
  });

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);

  useEffect(() => {
    if (!historyQuery.data || !isOpen || !isCustomer) {
      return;
    }
    const mapped = historyQuery.data.map(mapHistoryMessage);
    setMessages(mapped);
    setActiveRecommendationIds([]);
    syncedSupportLinesRef.current.clear();
    supportSyncInitializedRef.current = false;
  }, [historyQuery.data, isCustomer, isOpen, setMessages]);

  useEffect(() => {
    if (lastMessage?.recommendedProductIds?.length) {
      setActiveRecommendationIds(lastMessage.recommendedProductIds);
    }
  }, [lastMessage]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const viewport = messagesViewportRef.current;
    if (!viewport) {
      return;
    }
    requestAnimationFrame(() => {
      viewport.scrollTop = viewport.scrollHeight;
    });
  }, [isOpen, messages.length]);

  useEffect(() => {
    if (!isCustomer || !isOpen) {
      return;
    }

    const activeSupport = activeSupportQuery.data;
    if (!activeSupport) {
      if (hadActiveSupportRef.current) {
        hadActiveSupportRef.current = false;
        syncedSupportLinesRef.current.clear();
        supportSyncInitializedRef.current = false;
        setStatus("AI_HANDLED");
        pushMessage({
          id: `assistant-support-closed-${Date.now()}`,
          role: "assistant",
          content: "Phiên hỗ trợ đã được đóng. Bạn có thể tiếp tục chat với AI.",
          createdAt: new Date().toISOString(),
          handledBy: "AI",
        });
      }
      return;
    }

    hadActiveSupportRef.current = true;
    setStatus("ESCALATED_TO_STAFF");

    const lines = activeSupport.contentLog
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (!supportSyncInitializedRef.current) {
      for (const line of lines) {
        syncedSupportLinesRef.current.add(line);
      }
      supportSyncInitializedRef.current = true;
      return;
    }

    for (const line of lines) {
      if (syncedSupportLinesRef.current.has(line)) {
        continue;
      }
      syncedSupportLinesRef.current.add(line);

      if (!line.startsWith("Staff (")) {
        continue;
      }
      const separatorIndex = line.indexOf(":");
      const content = separatorIndex >= 0 ? line.slice(separatorIndex + 1).trim() : line;
      pushMessage({
        id: `assistant-staff-live-${Date.now()}-${syncedSupportLinesRef.current.size}`,
        role: "assistant",
        content,
        createdAt: new Date().toISOString(),
        handledBy: "STAFF",
      });
    }
  }, [activeSupportQuery.data, isCustomer, isOpen, pushMessage, setStatus]);

  const handleSend = (text: string) => {
    if (!text.trim()) {
      return;
    }

    pushMessage({
      id: `user-${Date.now()}`,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      handledBy: status === "ESCALATED_TO_STAFF" ? "STAFF" : "AI",
    });

    sendMutation.mutate(text);
    setInput("");
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-luxury-gold text-black shadow-premium transition hover:scale-105"
        aria-label="Mo tu van AI"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            className="fixed bottom-24 right-4 z-50 w-[min(420px,calc(100vw-2rem))]"
          >
            <Card className="flex h-[min(80vh,680px)] flex-col overflow-hidden">
              <CardHeader className="space-y-3 border-b border-border/60 bg-card/90">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Bot className="h-4 w-4 text-luxury-gold" />
                    ChronoLux AI Assistant
                  </CardTitle>
                  <Badge variant={status === "ESCALATED_TO_STAFF" ? "warning" : "success"}>
                    {status === "ESCALATED_TO_STAFF" ? "Escalated to staff" : "AI handled"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="flex min-h-0 flex-1 flex-col gap-4 p-4">
                <div ref={messagesViewportRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex items-start gap-2",
                        message.role === "user" ? "justify-end" : "justify-start",
                      )}
                    >
                      {message.role !== "user" ? (
                        <div className="mt-1 rounded-full bg-luxury-gold/20 p-1 text-luxury-gold">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      ) : null}
                      <p
                        className={cn(
                          "max-w-[82%] rounded-2xl px-3 py-2 text-sm",
                          message.role === "user"
                            ? "bg-luxury-gold text-black"
                            : "bg-accent text-accent-foreground",
                        )}
                      >
                        {message.content}
                      </p>
                      {message.role === "user" ? (
                        <div className="mt-1 rounded-full bg-accent p-1 text-muted-foreground">
                          <UserRound className="h-3.5 w-3.5" />
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {recommendationQuery.data && recommendationQuery.data.length > 0 ? (
                  <div className="max-h-32 space-y-2 overflow-y-auto rounded-xl border border-border/60 bg-background/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold">
                      Goi y san pham
                    </p>
                    {recommendationQuery.data.map((product) => (
                      <Link
                        to={`/products/${product.id}`}
                        key={product.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2 text-sm hover:border-luxury-gold"
                      >
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground">{product.brand}</span>
                      </Link>
                    ))}
                  </div>
                ) : null}

                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleSend(input);
                        }
                      }}
                      placeholder="Nhập nhu cầu của bạn..."
                    />
                    <Button size="icon" onClick={() => handleSend(input)} disabled={sendMutation.isPending}>
                      <SendHorizonal className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => escalateMutation.mutate()}
                      disabled={escalateMutation.isPending || status === "ESCALATED_TO_STAFF"}
                    >
                      Chuyển cho nhân viên hỗ trợ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        ) : null}
      </AnimatePresence>
    </>
  );
};
