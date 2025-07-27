"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  Home, 
  FileText, 
  Share2, 
  Settings, 
  CreditCard,
  BarChart3,
  Plus,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "New Meeting",
    href: "/dashboard/new",
    icon: Plus,
    variant: "primary" as const,
  },
  {
    title: "All Meetings",
    href: "/dashboard/meetings",
    icon: Folder,
  },
  {
    title: "Recent",
    href: "/dashboard/recent",
    icon: FileText,
  },
  {
    title: "Shared",
    href: "/dashboard/shared",
    icon: Share2,
  },
];

const bottomNavigationItems = [
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
    badge: "Pro",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow pt-5 bg-background border-r overflow-y-auto">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0 px-6">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">EM</span>
            </div>
            <span className="font-semibold text-xl">Easy Minutes</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 flex flex-col mt-8">
          <nav className="flex-1 px-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : item.variant === "primary"
                      ? "bg-primary/10 text-primary hover:bg-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0",
                      isActive && "text-primary-foreground",
                      item.variant === "primary" && !isActive && "text-primary"
                    )}
                  />
                  {item.title}
                  {item.variant === "primary" && (
                    <Badge variant="secondary" className="ml-auto">
                      ⚡
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          <Separator className="mx-4" />

          {/* Usage Stats */}
          <div className="px-4 py-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Monthly Usage</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Transcriptions</span>
                  <span>2/5</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Storage</span>
                  <span>15/100 MB</span>
                </div>
                <div className="w-full bg-background rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "15%" }}></div>
                </div>
              </div>
              <Button size="sm" variant="outline" className="w-full mt-3" asChild>
                <Link href="/dashboard/billing">
                  Upgrade Plan
                </Link>
              </Button>
            </div>
          </div>

          <Separator className="mx-4" />

          {/* Bottom Navigation */}
          <nav className="px-4 py-4 space-y-2">
            {bottomNavigationItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "mr-3 h-4 w-4 flex-shrink-0",
                      isActive && "text-primary-foreground"
                    )}
                  />
                  {item.title}
                  {item.badge && (
                    <Badge variant="secondary" className="ml-auto">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </div>
  );
}
