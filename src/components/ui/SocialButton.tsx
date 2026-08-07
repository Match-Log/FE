import { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

type SocialButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: ReactNode;
  label: string;
  loading?: boolean;
};

export function SocialButton({
  icon,
  label,
  loading = false,
  disabled,
  className,
  type = "button",
  ...props
}: SocialButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-surface text-base font-medium text-foreground transition-[filter] hover:brightness-125 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {loading ? (
        <span
          role="status"
          aria-label="loading"
          className="h-5 w-5 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground"
        />
      ) : (
        <>
          <span className="h-5 w-5 shrink-0">{icon}</span>
          {label}
        </>
      )}
    </button>
  );
}
