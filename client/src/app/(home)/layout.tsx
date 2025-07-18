"use client";
import { ThemeProvider } from "@/components/ThemeToggle";
import "../app.css";
import SideNav from "@/components/Navigation/SideNav";
import Footer from "@/components/Footer";

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleNavigationClick = () => {};

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
            <SideNav onItemClick={handleNavigationClick} />
            <div className="flex-1 min-h-screen ">
              {" "}
              {children}
              <div className="sticky bottom-0">
                <Footer />
              </div>
            </div>
          </div>{" "}
        </ThemeProvider>
      </body>
    </html>
  );
}
