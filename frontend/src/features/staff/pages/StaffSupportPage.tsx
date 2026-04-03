import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Clock3, MessageSquareText } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { chatSupportService, type SupportDiscussion } from "@/services/chatSupportService";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";

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

const DiscussionCard = ({
  discussion,
  draftReply,
  onChangeReply,
  onSendReply,
  onCloseSupport,
  sending,
  closing,
}: {
  discussion: SupportDiscussion;
  draftReply: string;
  onChangeReply: (value: string) => void;
  onSendReply: () => void;
  onCloseSupport: () => void;
  sending: boolean;
  closing: boolean;
}) => {
  const isClosed = Boolean(discussion.endDate);

  return (
    <Card className="border-border/60 bg-card/80">
      <CardHeader className="space-y-3 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base">{discussion.customerName || "Customer"}</CardTitle>
            <p className="text-xs text-muted-foreground">ID: {discussion.customerId}</p>
          </div>
          <Badge variant={isClosed ? "outline" : "warning"}>
            {isClosed ? "Đã đóng" : "Đang hỗ trợ"}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            Bắt đầu: {formatDateTime(discussion.startDate)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            Kết thúc: {isClosed ? formatDateTime(discussion.endDate) : "--"}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="max-h-52 overflow-y-auto rounded-lg border border-border/60 bg-background/40 p-3 text-sm whitespace-pre-line">
          {discussion.contentLog}
        </div>

        {isClosed ? (
          <div className="rounded-lg border border-border/60 bg-background/30 p-3 text-sm text-muted-foreground">
            Phiên hỗ trợ đã đóng. Không thể gửi thêm tin nhắn.
          </div>
        ) : (
          <div className="space-y-2">
            <Input
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
              <Button size="sm" onClick={onSendReply} disabled={sending || closing}>
                {sending ? "Đang gửi..." : "Gửi phản hồi"}
              </Button>
              <Button size="sm" variant="outline" onClick={onCloseSupport} disabled={closing || sending}>
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

  const discussionsQuery = useQuery({
    queryKey: ["staff-support-discussions"],
    queryFn: chatSupportService.listAll,
    refetchInterval: 1500,
  });

  const replyMutation = useMutation({
    mutationFn: ({
      discussionId,
      content,
    }: {
      discussionId: string;
      content: string;
    }) => chatSupportService.reply(discussionId, content),
    onSuccess: (_, variables) => {
      toast.success("Đã gửi phản hồi.");
      setReplyMap((prev) => ({ ...prev, [variables.discussionId]: "" }));
      queryClient.invalidateQueries({ queryKey: ["staff-support-discussions"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể gửi phản hồi.");
    },
  });

  const closeMutation = useMutation({
    mutationFn: (discussionId: string) => chatSupportService.close(discussionId),
    onSuccess: () => {
      toast.success("Đã đóng phiên hỗ trợ.");
      queryClient.invalidateQueries({ queryKey: ["staff-support-discussions"] });
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Không thể đóng hỗ trợ.");
    },
  });

  const discussions = discussionsQuery.data ?? [];
  const openDiscussions = useMemo(() => discussions.filter((item) => !item.endDate), [discussions]);
  const closedDiscussions = useMemo(() => discussions.filter((item) => Boolean(item.endDate)), [discussions]);

  const handleReply = (discussionId: string) => {
    const content = (replyMap[discussionId] ?? "").trim();
    if (!content) {
      toast.error("Nội dung phản hồi không được để trống.");
      return;
    }
    replyMutation.mutate({ discussionId, content });
  };

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquareText className="h-5 w-5 text-luxury-gold" />
              Hỗ trợ khách hàng
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {discussionsQuery.isLoading ? <p className="text-sm text-muted-foreground">Đang tải dữ liệu...</p> : null}
          {discussionsQuery.isError ? (
            <p className="text-sm text-red-500">{(discussionsQuery.error as Error).message}</p>
          ) : null}

          {!discussionsQuery.isLoading && !discussionsQuery.isError && discussions.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có phiên hỗ trợ nào.</p>
          ) : null}

          {openDiscussions.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold">Phiên đang hỗ trợ</p>
              {openDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  draftReply={replyMap[discussion.id] ?? ""}
                  onChangeReply={(value) => setReplyMap((prev) => ({ ...prev, [discussion.id]: value }))}
                  onSendReply={() => handleReply(discussion.id)}
                  onCloseSupport={() => closeMutation.mutate(discussion.id)}
                  sending={
                    replyMutation.isPending && replyMutation.variables?.discussionId === discussion.id
                  }
                  closing={closeMutation.isPending && closeMutation.variables === discussion.id}
                />
              ))}
            </section>
          ) : null}

          {closedDiscussions.length > 0 ? (
            <section className="space-y-3">
              <p className="text-sm font-semibold">Phiên đã đóng</p>
              {closedDiscussions.map((discussion) => (
                <DiscussionCard
                  key={discussion.id}
                  discussion={discussion}
                  draftReply={replyMap[discussion.id] ?? ""}
                  onChangeReply={(value) => setReplyMap((prev) => ({ ...prev, [discussion.id]: value }))}
                  onSendReply={() => {}}
                  onCloseSupport={() => {}}
                  sending={false}
                  closing={false}
                />
              ))}
            </section>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};
