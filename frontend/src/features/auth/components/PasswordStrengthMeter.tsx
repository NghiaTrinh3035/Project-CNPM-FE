import { cn } from "@/shared/lib/cn";

const scorePassword = (value: string | undefined | null) => {
  const v = typeof value === "string" ? value : "";
  let score = 0;
  if (v.length >= 8) score += 1;
  if (/[A-Z]/.test(v)) score += 1;
  if (/[0-9]/.test(v)) score += 1;
  if (/[^A-Za-z0-9]/.test(v)) score += 1;
  return score;
};

export const PasswordStrengthMeter = ({ password }: { password?: string | null }) => {
  const score = scorePassword(password);
  const labels = ["Rất yếu", "Yếu", "Trung bình", "Mạnh", "Rất mạnh"];

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-4 gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={cn(
              "h-1.5 rounded-full bg-muted",
              score > index && score <= 2 && "bg-amber-500",
              score > index && score >= 3 && "bg-emerald-500",
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Độ mạnh mật khẩu: {labels[score]}</p>
    </div>
  );
};
