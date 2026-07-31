import Sidebar from "@/components/sidebar";
import TokenGate from "@/components/token-gate";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate min-h-screen" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      <Sidebar />
      <TokenGate />
      <div className="flex min-h-screen flex-col transition-[padding] duration-300 md:pl-[var(--sidebar-w)]">
        <main className="relative z-10 flex-1 min-w-0">
          <div className="mx-auto w-full px-5 pb-[max(2rem,env(safe-area-inset-bottom,0px))] pt-6 sm:px-7 sm:pb-12 sm:pt-8 md:px-9 md:pt-10 max-w-[min(100%,1200px)] lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
