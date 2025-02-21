import { ProtectedLayout } from "@/components/dashboard/protected-layout";
import DashboardLayout from "@/components/dashboard/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedLayout>
      <DashboardLayout>
        <main className="flex-1 overflow-x-hidden bg-background text-foreground overflow-y-auto p-6">
          {children}
        </main>
      </DashboardLayout>
    </ProtectedLayout>
  );
}
