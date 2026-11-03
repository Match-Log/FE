export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#05060B] text-white">
      {children}
    </div>
  );
}
