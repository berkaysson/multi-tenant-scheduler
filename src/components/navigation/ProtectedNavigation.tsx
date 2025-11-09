"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { UserRole } from "@prisma/client";
import { Menu, Building2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/navigation/UserNav";

const ProtectedNavigation = () => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role as UserRole | undefined;

  const navItems = [
    { name: "Organizations", href: "/organizations" },
    { name: "My Appointments", href: "/appointments" },
    ...(userRole === UserRole.MANAGER || userRole === UserRole.ADMIN
      ? [{ name: "My Organization", href: "/manager/organization" }]
      : []),
  ];

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        "text-sm font-medium transition-colors hover:text-primary",
        pathname === href ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {children}
    </Link>
  );

  const MobileNavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <SheetClose asChild>
      <Link
        href={href}
        className={cn(
          "block select-none rounded-md p-3 text-base font-medium leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
          pathname === href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
        )}
      >
        {children}
      </Link>
    </SheetClose>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Mobile Nav Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <div className="flex-grow">
                  <Link href="/organizations" className="flex items-center space-x-2">
                    <Building2 className="h-6 w-6" />
                    <span className="font-bold">App Name</span>
                  </Link>
                  <Separator className="my-4" />
                  <div className="flex flex-col space-y-2">
                    {navItems.map((item) => (
                      <MobileNavLink key={item.name} href={item.href}>
                        {item.name}
                      </MobileNavLink>
                    ))}
                  </div>
                </div>
                <div className="mt-auto">
                  <SheetClose asChild>
                    <Button asChild className="w-full">
                      <Link href="/organizations/create">Create Organization</Link>
                    </Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop Nav */}
          <Link href="/organizations" className="hidden items-center space-x-2 md:flex">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">App Name</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.name} href={item.href}>
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block">
            <Button asChild>
              <Link href="/organizations/create">Create Organization</Link>
            </Button>
          </div>
          <UserNav />
        </div>
      </div>
    </header>
  );
};

export default ProtectedNavigation;