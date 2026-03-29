import { cn } from "@/shared/lib/cn";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
}

export const SectionHeading = ({ eyebrow, title, description, className }: SectionHeadingProps) => (
  <div className={cn("space-y-3", className)}>
    {eyebrow ? <p className="text-xs uppercase tracking-[0.25em] text-luxury-gold">{eyebrow}</p> : null}
    <h2 className="font-display text-3xl md:text-4xl">{title}</h2>
    {description ? <p className="max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p> : null}
  </div>
);
