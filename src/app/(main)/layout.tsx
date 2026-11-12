import BottomNav from '@/components/common/BottomNav';
import MyPlayerSync from '@/components/common/MyPlayerSync';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#05060B] relative">
      <MyPlayerSync />
      <main className="pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}
