import { AlertTriangle } from "lucide-react";

import { Button } from "@/shared/ui/button";

export const ErrorState = ({ message, onRetry }: { message: string; onRetry?: () => void }) => (
  <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
    <AlertTriangle className="mx-auto h-7 w-7 text-red-500" />
    <h3 className="mt-2 font-semibold text-red-500">Đã xảy ra lỗi</h3>
    <p className="mt-1 text-sm text-muted-foreground">{message}</p>
    {onRetry ? (
      <Button variant="outline" onClick={onRetry} className="mt-4">
        Thử lại
      </Button>
    ) : null}
  </div>
);
