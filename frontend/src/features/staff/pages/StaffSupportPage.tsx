import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { discussionService } from "@/services/discussionService";
import { supportService } from "@/services/supportService";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";

export const StaffSupportPage = () => {
  const queryClient = useQueryClient();
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});

  const ticketsQuery = useQuery({
    queryKey: ["staff-support-tickets"],
    queryFn: supportService.listTickets,
  });

  const discussionsQuery = useQuery({
    queryKey: ["staff-support-discussions"],
    queryFn: discussionService.listAll,
  });

  const ticketMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "OPEN" | "IN_PROGRESS" | "RESOLVED" }) =>
      supportService.updateTicketStatus(id, status),
    onSuccess: () => {
      toast.success("Đã cập nhật ticket.");
      queryClient.invalidateQueries({ queryKey: ["staff-support-tickets"] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: ({
      productId,
      parentId,
      content,
    }: {
      productId: string;
      parentId: string;
      content: string;
    }) =>
      discussionService.create({
        productId,
        parentId,
        content,
        userId: "u-staff-001",
        aiHandled: false,
      }),
    onSuccess: () => {
      toast.success("Đã gửi phản hồi.");
      queryClient.invalidateQueries({ queryKey: ["staff-support-discussions"] });
    },
  });

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Ticket hỗ trợ khách hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ticketsQuery.data?.map((ticket) => (
            <div key={ticket.id} className="rounded-xl border border-border/60 p-4">
              <p className="font-medium">{ticket.title}</p>
              <p className="text-xs text-muted-foreground">
                Kênh: {ticket.channel} - {new Date(ticket.createdAt).toLocaleString("vi-VN")}
              </p>
              <div className="mt-3">
                <Select
                  defaultValue={ticket.status}
                  onChange={(event) =>
                    ticketMutation.mutate({
                      id: ticket.id,
                      status: event.target.value as "OPEN" | "IN_PROGRESS" | "RESOLVED",
                    })
                  }
                >
                  <option value="OPEN">OPEN</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                </Select>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Thảo luận cần phản hồi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {discussionsQuery.data?.map((comment) => (
            <div key={comment.id} className="rounded-xl border border-border/60 p-4">
              <p className="text-sm">{comment.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Product: {comment.productId} - {comment.aiHandled ? "AI handled" : "Need staff"}
              </p>
              <div className="mt-2 space-y-2">
                <Input
                  value={replyMap[comment.id] ?? ""}
                  onChange={(event) =>
                    setReplyMap((prev) => ({ ...prev, [comment.id]: event.target.value }))
                  }
                  placeholder="Trả lời khách hàng..."
                />
                <Button
                  size="sm"
                  onClick={() =>
                    replyMutation.mutate({
                      parentId: comment.id,
                      productId: comment.productId,
                      content: replyMap[comment.id] ?? "",
                    })
                  }
                >
                  Gửi phản hồi
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
