'use client';
import { shortenString } from '@/utils';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export default function Breadcrumbs() {
  const paths = usePathname();
  const pathNames = paths.split('/').filter((path) => path);

  return (
    <nav className="my-4 w-full text-sm">
      <ol className="text-primary-base flex space-x-1 font-semibold">
        <Link
          href="/"
          className="hover:text-primary-300 text-primary-base font-semibold hover:underline"
        >
          Home
        </Link>
        {pathNames.length > 0 && (
          <ChevronRight className="text-muted-foreground mx-1 h-5 w-4" />
        )}

        {pathNames.map((link, index) => {
          if (link == 'manage') {
            return;
          }
          if (link == 'my') {
            return;
          }

          let href = `/${pathNames.slice(0, index + 1).join('/')}`;

          if (link == 'ambassadors') {
            href = `/`;
          }
          const itemLink = true
            ? link[0].toUpperCase() + link.slice(1, link.length)
            : link;
          return (
            <React.Fragment key={index}>
              <li className="">
                {pathNames.length !== index + 1 ? (
                  <Link
                    className="hover:text-primary-300 text-primary-base hover:underline"
                    href={href}
                  >
                    {itemLink}
                  </Link>
                ) : (
                  <span>
                    {itemLink.length > 20
                      ? shortenString(itemLink, 12)
                      : itemLink}
                  </span>
                )}
              </li>
              {pathNames.length !== index + 1 && (
                <ChevronRight className="text-muted-foreground mx-1 h-5 w-4" />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
