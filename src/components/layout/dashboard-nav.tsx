"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: "Dashboard", href: "/dashboard" }
  ];

  // Map path segments to readable names
  const pathMap: Record<string, string> = {
    "new": "New Meeting",
    "meetings": "All Meetings",
    "minutes": "Meeting Minutes",
    "share": "Share Meeting",
    "settings": "Settings",
    "billing": "Billing",
    "analytics": "Analytics",
    "recent": "Recent Meetings",
    "shared": "Shared Meetings",
    "notifications": "Notifications",
  };

  let currentPath = "";
  for (let i = 1; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Skip dynamic segments like [id]
    if (segment.startsWith("[") && segment.endsWith("]")) {
      continue;
    }
    
    const label = pathMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    
    // Don't add href for the last item (current page)
    if (i === segments.length - 1) {
      breadcrumbs.push({ label });
    } else {
      breadcrumbs.push({ label, href: `/dashboard${currentPath}` });
    }
  }

  return breadcrumbs;
}

export function DashboardNav() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}
