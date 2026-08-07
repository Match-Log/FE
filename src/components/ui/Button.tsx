import { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function Button({
  loading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "flex h-[52px] w-full items-center justify-center rounded-xl border border-border bg-surface text-base font-bold text-foreground transition-[filter] hover:brightness-125 disabled:pointer-events-none disabled:opacity-50",
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
        children
      )}
    </button>
  );
}
