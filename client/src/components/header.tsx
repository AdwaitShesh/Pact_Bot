"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { UserButton } from "./shared/user-button";

const navItems: { name: string; href: string }[] = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Privacy Policy", href: "/privacy" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky px-4 top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="flex-1">
          <Link href={"/"} className="flex items-center space-x-2">
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent hover:opacity-90 transition-opacity">
              PactBot
            </span>
          </Link>
        </div>
        
        <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center space-x-7 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "transition-colors hover:text-foreground/80 relative",
                "after:content-[''] after:absolute after:w-full after:h-0.5 after:bg-foreground after:left-0 after:-bottom-1",
                "after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300",
                pathname === item.href
                  ? "text-foreground after:scale-x-100"
                  : "text-foreground/60 after:scale-x-0"
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex-1 flex justify-end">
          <UserButton />
        </div>
      </div>
    </header>
  );
}
