import { useMutation, useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, MessageCircle, SendHorizonal, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAiChatStore } from "@/shared/hooks/useAiChatStore";
import { aiService } from "@/services/aiService";
import { productService } from "@/services/productService";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

const quickSuggestions = [
  "Tôi cần đồng hồ dưới 5 triệu",
  "Tôi thích đồng hồ dây kim loại",
  "Tôi cần đồng hồ chống nước tốt",
  "Tôi muốn đồng hồ đi làm",
  "Tôi muốn quà tặng cho nam",
  "Tôi thích máy cơ",
];

export const AiAssistantWidget = () => {
  const [input, setInput] = useState("");
  const { isOpen, toggle, messages, pushMessage, status, setStatus, clearHistory } = useAiChatStore();
  const [activeRecommendationIds, setActiveRecommendationIds] = useState<string[]>([]);

  const recommendationQuery = useQuery({
    queryKey: ["ai-recommendations", activeRecommendationIds.join(",")],
    queryFn: () => productService.getByIds(activeRecommendationIds),
    enabled: activeRecommendationIds.length > 0,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => aiService.reply(text),
    onSuccess: (reply) => {
      pushMessage(reply);
      setStatus(reply.handledBy === "STAFF" ? "ESCALATED_TO_STAFF" : "AI_HANDLED");
      setActiveRecommendationIds(reply.recommendedProductIds ?? []);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Không thể kết nối AI lúc này.";
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
    },
  });

  const lastMessage = useMemo(() => messages[messages.length - 1], [messages]);

  useEffect(() => {
    if (lastMessage?.recommendedProductIds?.length) {
      setActiveRecommendationIds(lastMessage.recommendedProductIds);
    }
  }, [lastMessage]);

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
        aria-label="Mở tư vấn AI"
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
            <Card className="overflow-hidden">
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
                <div className="flex flex-wrap gap-2">
                  {quickSuggestions.slice(0, 3).map((item) => (
                    <button
                      key={item}
                      type="button"
                      className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-luxury-gold hover:text-luxury-gold"
                      onClick={() => handleSend(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 p-4">
                <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
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
                  <div className="space-y-2 rounded-xl border border-border/60 bg-background/60 p-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-luxury-gold">
                      Gợi ý sản phẩm
                    </p>
                    {recommendationQuery.data.map((product) => (
                      <Link
                        to={`/product/${product.slug}`}
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
                      disabled={escalateMutation.isPending}
                    >
                      Chuyển cho nhân viên hỗ trợ
                    </Button>
                    <Button variant="ghost" className="text-xs" onClick={clearHistory}>
                      Xóa lịch sử
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
