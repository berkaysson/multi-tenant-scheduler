import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import ProtectedNavigation from "@/components/navigation/ProtectedNavigation";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="relative flex min-h-screen flex-col bg-background">
        <ProtectedNavigation />
        <main className="flex-1">
          <div className="container py-8">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
};

export default ProtectedLayout;