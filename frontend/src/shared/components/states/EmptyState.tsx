import { Inbox } from "lucide-react";

import { Button } from "@/shared/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="rounded-2xl border border-dashed border-border p-8 text-center">
    <Inbox className="mx-auto h-8 w-8 text-luxury-gold" />
    <h3 className="mt-3 text-lg font-semibold">{title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    {actionLabel && onAction ? (
      <Button className="mt-4" variant="outline" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null}
  </div>
);
