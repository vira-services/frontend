import Sidebar from "@/components/sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dash-stage relative isolate min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Sidebar />
      <div className="flex min-h-screen flex-col transition-[padding] duration-300 md:pl-[calc(var(--sidebar-w)+var(--sidebar-inset)*2)]">
        <main className="relative z-10 flex-1 min-w-0">
          <div className="mx-auto w-full px-4 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-4 sm:px-6 sm:pb-10 sm:pt-6 md:px-8 md:pt-8 max-w-[min(100%,1180px)] lg:px-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
