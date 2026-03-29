import { cn } from "@/shared/lib/cn";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export const Switch = ({ checked, onCheckedChange }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      "relative inline-flex h-6 w-11 items-center rounded-full transition",
      checked ? "bg-luxury-gold" : "bg-muted",
    )}
  >
    <span
      className={cn(
        "inline-block h-5 w-5 transform rounded-full bg-white transition",
        checked ? "translate-x-5" : "translate-x-1",
      )}
    />
  </button>
);
