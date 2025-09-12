'use client';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { ReactNode } from 'react';

type TBreadCrumbProps = {
  homeElement: ReactNode;
  separator: ReactNode;
  containerClasses?: string;
  listClasses?: string;
  activeClasses?: string;
  capitalizeLinks?: boolean;
};

export default function Breadcrumbs() {
  const paths = usePathname();
  const pathNames = paths.split('/').filter((path) => path);

  return (
    <nav className="my-4 w-full text-sm">
      <ol className="flex space-x-1">
        <Link
          href="/"
          className="text-primary-base font-semibold hover:underline"
        >
          Home
        </Link>
        {pathNames.length > 0 && (
          <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
        )}

        {pathNames.map((link, index) => {
          console.log({ pathNames });
          if (link == 'manage') {
            return;
          }
          if (link == 'dashboard') {
            return;
          }

          let href = `/${pathNames.slice(0, index + 1).join('/')}`;

          if (link == 'ambassadors') {
             href = `/`;
          }

          // let itemClasses =
          //   paths === href ? `${listClasses} ${activeClasses}` : listClasses;
          let itemLink = true
            ? link[0].toUpperCase() + link.slice(1, link.length)
            : link;
          return (
            <React.Fragment key={index}>
              <li className="">
                <Link href={href}>{itemLink}</Link>
              </li>
              {pathNames.length !== index + 1 && (
                <ChevronRight className="text-muted-foreground mx-1 h-4 w-4" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
