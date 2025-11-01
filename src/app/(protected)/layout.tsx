import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import ProtectedNavigation from "@/components/navigation/ProtectedNavigation";

const ProtectedLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <div className="min-h-screen flex flex-col">
        <ProtectedNavigation />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    </SessionProvider>
  );
};

export default ProtectedLayout;
