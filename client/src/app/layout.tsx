"use client";
import { ThemeProvider } from "@/components/ThemeToggle";
import "./globals.css";
import SideNav from "@/components/Navigation/SideNav";
import { usePathname } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleNavigationClick = () => {};

  const pathname = usePathname();
  const hideNavRoutes = ["/onboarding"];
  const showNav = !hideNavRoutes.includes(pathname);


  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                // Prevent flash of incorrect theme
                try {
                  const theme = localStorage.getItem('theme');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'light') {
                    document.documentElement.classList.add('light');
                  } else {
                    // System preference
                    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch {}
              `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="min-h-screen flex">
            {showNav && <SideNav onItemClick={handleNavigationClick} />}
            <div className="flex-1"> {children}</div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
