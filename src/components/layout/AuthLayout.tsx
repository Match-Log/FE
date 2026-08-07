import { ReactNode } from "react";

type AuthLayoutProps = {
  children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-6 pb-16 pt-16">
      <div className="w-full max-w-[420px]">{children}</div>
    </div>
  );
}
