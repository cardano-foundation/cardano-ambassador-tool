// components/Breadcrumbs.tsx
"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { breadcrumbRoutes } from "@/lib/BreadcrumbRoutes";

export default function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const paths = segments.map((_, i) => {
    return "/" + segments.slice(0, i + 1).join("/");
  });

  const crumbs = paths
    .map((path) => ({
      href: path,
      label: breadcrumbRoutes[path],
    }))
    .filter((crumb) => crumb.label);

  return (
    <nav className="text-sm w-full my-4 ">
      <ol className="flex space-x-1">
        <li className="flex items-center">
          <Link
            href="/"
            className="hover:underline text-primary-base font-semibold"
          >
            Home
          </Link>
          {crumbs.length > 0 && (
            <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
          )}
        </li>

        {crumbs.map((crumb, idx) => (
          <li key={idx} className="flex items-center">
            {idx < crumbs.length - 1 ? (
              <>
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
                <ChevronRight className="w-4 h-4 mx-1 text-muted-foreground" />
              </>
            ) : (
              <span className="text-muted-foreground">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
