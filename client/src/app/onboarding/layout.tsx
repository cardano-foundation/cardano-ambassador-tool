"use client";
import { ThemeProvider } from "@/components/ThemeToggle";
import "../app.css";
import Footer from "@/components/Footer";
import OnboardingSvg from "@/components/atoms/onboarding";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import AppLogo from "@/components/atoms/Logo";
import Button from "@/components/atoms/Button";
import ToastContainer from "@/components/toast/toast";

export default function DefaultLayout({
  children,
}: Readonly<{
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
            <div className="flex min-h-screen w-full p-2">
              <div className=" flex-1 items-center h-full flex flex-col">
                <div className="flex lg:p-6 p-2  justify-between w-full">
                  <AppLogo />
                  <div>
                    <Button
                      variant="outline"
                      size="md"
                      rounded="full"
                      className="w-full"
                    >
                      <span className="font-bold text-primary-base">
                        Create account
                      </span>
                    </Button>
                  </div>
                </div>
                {children}
                <ToastContainer />
                <div className=" bottom-0 w-full">
                  <Footer />
                </div>
              </div>

              {/* svg thing */}
              <div className="bg-muted flex-1 rounded-lg min-h-[1024px] pl-24 pt-24 pb-2 hidden lg:block">
                <div className="bg-[url(/images/onboarding.png)] relative rounded-lg min-w-[797px] h-[932px]">
                  <div className="top-19 absolute flex w-full flex-col items-center ">
                    <div className="gap-4 flex flex-col max-w-[458px] ">
                      <Title className="text-nowrap" level="4">
                        Cardano Ambassador Tools
                      </Title>
                      <Paragraph className="">
                        Onboard, collaborate, and contribute to the ecosystem
                        through a streamlined, token-based platform.
                      </Paragraph>
                    </div>
                  </div>
                  <OnboardingSvg className="absolute -bottom-0 -right-1" />
                </div>
              </div>
            </div>
          </div>{" "}
        </ThemeProvider>
      </body>
    </html>
  );
}
