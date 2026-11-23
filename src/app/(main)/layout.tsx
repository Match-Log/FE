import MyPlayerSync from '@/components/common/MyPlayerSync';
import NotificationProvider from '@/components/common/NotificationProvider';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#05060B] relative">
      <MyPlayerSync />
      <NotificationProvider />
      <main>{children}</main>
    </div>
  );
}
