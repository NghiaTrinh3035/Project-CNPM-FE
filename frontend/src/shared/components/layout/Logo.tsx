import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/constants/routes";
import { cn } from "@/shared/lib/cn";

export const Logo = ({ className }: { className?: string }) => (
  <Link to={ROUTES.home} className={cn("inline-flex items-center gap-2", className)}>
    <span className="rounded-md border border-luxury-gold/40 bg-luxury-gold/10 px-2 py-1 font-display text-sm tracking-[0.25em] text-luxury-gold">
      CLX
    </span>
    <span className="font-display text-xl font-semibold tracking-wide text-foreground">ChronoLux</span>
  </Link>
);
