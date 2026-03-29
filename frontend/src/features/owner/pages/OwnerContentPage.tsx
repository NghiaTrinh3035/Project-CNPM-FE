import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { adminService } from "@/services/adminService";
import type { StaticPageContent } from "@/shared/types/domain";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Select } from "@/shared/ui/select";
import { Textarea } from "@/shared/ui/textarea";

export const OwnerContentPage = () => {
  const queryClient = useQueryClient();
  const pagesQuery = useQuery({
    queryKey: ["owner-static-pages"],
    queryFn: adminService.listStaticPages,
  });
  const [selectedId, setSelectedId] = useState<StaticPageContent["id"]>("about");
  const [content, setContent] = useState("");

  const selectedPage = pagesQuery.data?.find((page) => page.id === selectedId);

  useEffect(() => {
    if (selectedPage) {
      setContent(selectedPage.content);
    }
  }, [selectedPage]);

  const updateMutation = useMutation({
    mutationFn: (payload: StaticPageContent) => adminService.updateStaticPage(payload),
    onSuccess: () => {
      toast.success("Đã cập nhật nội dung trang.");
      queryClient.invalidateQueries({ queryKey: ["owner-static-pages"] });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý nội dung tĩnh</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedId} onChange={(event) => setSelectedId(event.target.value as StaticPageContent["id"])}>
          <option value="about">About</option>
          <option value="terms">Terms</option>
          <option value="privacy">Privacy</option>
          <option value="return-policy">Return / Warranty</option>
        </Select>
        <Textarea
          className="min-h-[280px]"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <Button
          variant="luxury"
          onClick={() =>
            selectedPage &&
            updateMutation.mutate({
              ...selectedPage,
              content,
            })
          }
        >
          Lưu nội dung
        </Button>
      </CardContent>
    </Card>
  );
};
