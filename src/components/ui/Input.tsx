import { InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ error, className, id, ...props }: InputProps) {
  return (
    <div className="w-full">
      <input
        id={id}
        className={cn(
          "h-[52px] w-full rounded-xl border bg-surface pl-4 text-base text-foreground placeholder:text-muted focus:outline-none",
          error ? "border-error" : "border-transparent focus:border-accent",
          className
        )}
        {...props}
      />
      {error && <p className="mt-2 text-xs text-error">{error}</p>}
    </div>
  );
}
