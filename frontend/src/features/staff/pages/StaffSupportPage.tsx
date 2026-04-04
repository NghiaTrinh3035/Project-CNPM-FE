import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, MessageSquareText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  chatSupportService,
  type SupportChat,
  type SupportChatStatus,
} from "@/services/chatSupportService";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

const formatDateTime = (value?: string | null) => {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const ChatCard = ({
  chat,
  draftReply,
  onChangeReply,
  onSendReply,
  onCloseSupport,
  sending,
  closing,
}: {
  chat: SupportChat;
  draftReply: string;
  onChangeReply: (value: string) => void;
  onSendReply: () => void;
  onCloseSupport: () => void;
  sending: boolean;
  closing: boolean;
}) => {
  const isClosed = Boolean(chat.endDate);

  return (
    <Card className="border-border/60 bg-card/90">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg font-semibold">{chat.customerName || "Customer"}</CardTitle>
            <p className="text-sm text-muted-foreground">ID: {chat.customerId}</p>
          </div>
          <Badge className="text-sm" variant={isClosed ? "outline" : "warning"}>
            {isClosed ? "Đã đóng" : "Đang hỗ trợ"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            Bắt đầu: {formatDateTime(chat.startDate)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock3 className="h-4 w-4" />
            Kết thúc: {isClosed ? formatDateTime(chat.endDate) : "--"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60 bg-background/40 p-4 text-base leading-relaxed whitespace-pre-line">
          {chat.contentLog || "Chưa có nội dung trao đổi."}
        </div>

        {isClosed ? (
          <div className="rounded-lg border border-border/60 bg-background/30 p-4 text-base text-muted-foreground">
            Phiên hỗ trợ đã đóng. Không thể gửi thêm tin nhắn.
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              className="h-11 text-base"
              value={draftReply}
              onChange={(event) => onChangeReply(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  onSendReply();
                }
              }}
              placeholder="Trả lời khách hàng..."
            />
            <div className="flex gap-2">
              <Button size="sm" className="text-sm" onClick={onSendReply} disabled={sending || closing}>
                {sending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
              <Button size="sm" className="text-sm" variant="outline" onClick={onCloseSupport} disabled={closing || sending}>
                {closing ? "Đang đóng..." : "Đóng hỗ trợ"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const StaffSupportPage = () => {
  const queryClient = useQueryClient();
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [viewMode, setViewMode] = useState<SupportChatStatus>("OPEN");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const chatsQuery = useQuery({
    queryKey: ["staff-support-chats", viewMode, page, pageSize],
    queryFn: () =>
      chatSupportService.listAll({
        page,
        pageSize,
        status: viewMode,
      }),
    refetchInterval: 1500,
  });

  useEffect(() => {
    const serverTotalPages = Math.max(1, chatsQuery.data?.totalPages ?? 1);
    if (page > serverTotalPages) {
      setPage(serverTotalPages);
    }
  }, [chatsQuery.data?.totalPages, page]);

  const replyMutation = useMutation({
    mutationFn: ({
      chatId,
      content,
    }: {
      chatId: string;
      content: string;
    }) => chatSupportService.reply(chatId, content),
    onSuccess: (_, variables) => {
      toast.success("Đã gửi phản hồi.");
      setReplyMap((prev) => ({ ...prev, [variables.chatId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["staff-support-chats"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể gửi phản hồi.");
    },
  });

  const closeMutation = useMutation({
    mutationFn: (chatId: string) => chatSupportService.close(chatId),
    onSuccess: () => {
      toast.success("Đã đóng phiên hỗ trợ.");
      queryClient.invalidateQueries({ queryKey: ["staff-support-chats"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể đóng hỗ trợ.");
    },
  });

  const chats = chatsQuery.data?.items ?? [];
  const totalItems = chatsQuery.data?.total ?? 0;
  const totalPages = Math.max(1, chatsQuery.data?.totalPages ?? 1);
  const currentPage = chatsQuery.data?.page ?? page;

  const handleReply = (chatId: string) => {
    const content = (replyMap[chatId] ?? "").trim();
    if (!content) {
      toast.error("Nội dung phản hồi không được để trống.");
      return;
    }
    replyMutation.mutate({ chatId, content });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold">
              <MessageSquareText className="h-6 w-6 text-luxury-gold" />
              Hỗ trợ khách hàng
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Select
              className="w-48 text-base"
              value={viewMode}
              onChange={(event) => {
                setViewMode(event.target.value as SupportChatStatus);
                setPage(1);
              }}
            >
              <option value="OPEN">Phiên đang hỗ trợ</option>
              <option value="CLOSED">Phiên đã đóng</option>
              <option value="ALL">Tất cả phiên</option>
            </Select>

            <Select
              className="w-28 text-base"
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="4">4 / trang</option>
              <option value="6">6 / trang</option>
              <option value="10">10 / trang</option>
            </Select>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {chatsQuery.isLoading ? <p className="text-base text-muted-foreground">Đang tải dữ liệu...</p> : null}
          {chatsQuery.isError ? <p className="text-base text-red-500">{(chatsQuery.error as Error).message}</p> : null}

          {!chatsQuery.isLoading && !chatsQuery.isError && totalItems === 0 ? (
            <p className="text-base text-muted-foreground">Chưa có phiên hỗ trợ nào.</p>
          ) : null}

          {chats.map((chat) => (
            <ChatCard
              key={chat.id}
              chat={chat}
              draftReply={replyMap[chat.id] ?? ""}
              onChangeReply={(value) => setReplyMap((prev) => ({ ...prev, [chat.id]: value }))}
              onSendReply={() => handleReply(chat.id)}
              onCloseSupport={() => closeMutation.mutate(chat.id)}
              sending={replyMutation.isPending && replyMutation.variables?.chatId === chat.id}
              closing={closeMutation.isPending && closeMutation.variables === chat.id}
            />
          ))}

          {!chatsQuery.isLoading && !chatsQuery.isError && totalItems > 0 ? (
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="text-base text-muted-foreground">
                Trang {currentPage} / {totalPages} - Tổng {totalItems} phiên
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" disabled={currentPage <= 1 || chatsQuery.isFetching} onClick={() => setPage((prev) => prev - 1)}>
                  Trước
                </Button>
                <Button
                  variant="outline"
                  disabled={currentPage >= totalPages || chatsQuery.isFetching}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  Sau
                </Button>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
