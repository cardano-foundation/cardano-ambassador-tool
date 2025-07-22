import { ThemeProvider } from "@/components/ThemeToggle";
import "./app.css";
import SideNav from "@/components/Navigation/SideNav";
import TopNavBar from "@/components/Navigation/TopNavBar";
import Footer from "@/components/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body>
        <ThemeProvider>
          <div className="min-h-screen flex">
            {/* Side Navigation - Left side */}
            <SideNav />

            {/* Main Content Area - Right side */}
            <div className="flex-1 flex flex-col">
              {/* Top Navigation Bar - with Home breadcrumb */}
              <TopNavBar />

              {/* Page Content */}
              <main className="flex-1">{children}</main>

              {/* Footer */}
              <Footer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
