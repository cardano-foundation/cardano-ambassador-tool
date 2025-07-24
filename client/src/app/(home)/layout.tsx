import React from "react";
import ToastContainer from "@/components/toast/toast";
import { ThemeProvider } from "@/components/ThemeToggle";
import SideNav from "@/components/Navigation/SideNav";
import Footer from "@/components/Footer";

export default function HomeLayout({
  children,
}:Readonly<{
  children: React.ReactNode;
}>) {

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
            <SideNav />
            <div className="flex-1 min-h-screen ">
              {" "}
              {children}
              <ToastContainer />
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
