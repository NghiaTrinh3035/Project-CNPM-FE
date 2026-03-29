import { Loader2 } from "lucide-react";

export const LoadingState = ({ text = "Đang tải dữ liệu..." }: { text?: string }) => (
  <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-muted-foreground">
    <Loader2 className="h-5 w-5 animate-spin text-luxury-gold" />
    <p className="text-sm">{text}</p>
  </div>
);
