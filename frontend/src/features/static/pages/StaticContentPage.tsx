import { useQuery } from "@tanstack/react-query";

import { contentService } from "@/services/contentService";
import type { StaticPageContent } from "@/shared/types/domain";
import { ErrorState } from "@/shared/components/states/ErrorState";
import { LoadingState } from "@/shared/components/states/LoadingState";

export const StaticContentPage = ({ pageId }: { pageId: StaticPageContent["id"] }) => {
  const query = useQuery({
    queryKey: ["static-page", pageId],
    queryFn: () => contentService.getPage(pageId),
  });

  if (query.isLoading) {
    return <LoadingState text="Đang tải nội dung..." />;
  }

  if (query.isError || !query.data) {
    return <ErrorState message="Không thể tải nội dung trang này." />;
  }

  return (
    <section className="mx-auto max-w-4xl space-y-4 px-4 py-12 md:px-6">
      <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">ChronoLux Policy</p>
      <h1 className="font-display text-4xl">{query.data.title}</h1>
      <div className="rounded-2xl border border-border/60 bg-card/40 p-6">
        <div className="whitespace-pre-line leading-7 text-muted-foreground">{query.data.content}</div>
      </div>
    </section>
  );
};
