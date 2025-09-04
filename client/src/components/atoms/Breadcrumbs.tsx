'use client';
import { breadcrumbRoutes } from '@/lib/BreadcrumbRoutes';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface BreadcrumbItem {
  href: string;
  label: string;
}

export default function Breadcrumbs() {
  const pathname = usePathname();
  const [dynamicCrumbs, setDynamicCrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    const generateCrumbs = async () => {
      // Check if this is an ambassador profile page
      const ambassadorMatch = pathname.match(/^\/ambassador\/(.+)$/);

      if (ambassadorMatch) {
        const ambassadorId = ambassadorMatch[1];

        try {
          // Fetch ambassador data to get the name
          const response = await fetch(`/api/ambassadors/${ambassadorId}`);
          if (response.ok) {
            const ambassadorData = await response.json();
            setDynamicCrumbs([
              {
                href: pathname,
                label: ambassadorData.name,
              },
            ]);
            return;
          }
        } catch (error) {
          console.error(
            'Failed to fetch ambassador data for breadcrumb:',
            error,
          );
        }

        // Fallback if API call fails
        setDynamicCrumbs([
          {
            href: pathname,
            label: 'Ambassador Profile',
          },
        ]);
        return;
      }

      // Generate standard breadcrumbs for other pages
      const segments = pathname.split('/').filter(Boolean);
      const paths = segments.map((_, i) => {
        return '/' + segments.slice(0, i + 1).join('/');
      });

      const crumbs = paths
        .map((path) => ({
          href: path,
          label: breadcrumbRoutes[path],
        }))
        .filter((crumb) => crumb.label);

      setDynamicCrumbs(crumbs);
    };

    generateCrumbs();
  }, [pathname]);

  return (
    <nav className="my-4 w-full text-sm">
      <ol className="flex space-x-1">
        <li className="flex items-center">
          <Link
            href="/"
            className="text-primary-base font-semibold hover:underline"
          >
            Home
          </Link>
          {dynamicCrumbs.length > 0 && (
            <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
          )}
        </li>
        {dynamicCrumbs.map((crumb, idx) => (
          <li key={idx} className="flex items-center">
            {idx < dynamicCrumbs.length - 1 ? (
              <>
                <Link href={crumb.href} className="hover:underline">
                  {crumb.label}
                </Link>
                <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
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
