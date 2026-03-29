import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "@/shared/lib/cn";

export const Avatar = ({ className, ...props }: AvatarPrimitive.AvatarProps) => (
  <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
);

export const AvatarImage = ({ className, ...props }: AvatarPrimitive.AvatarImageProps) => (
  <AvatarPrimitive.Image className={cn("aspect-square h-full w-full", className)} {...props} />
);

export const AvatarFallback = ({ className, ...props }: AvatarPrimitive.AvatarFallbackProps) => (
  <AvatarPrimitive.Fallback className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted text-xs font-medium", className)} {...props} />
);
