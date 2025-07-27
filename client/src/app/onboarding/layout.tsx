'use client';
import Breadcrumbs from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import InboxIcon from '@/components/atoms/InboxIcon';
import AppLogo from '@/components/atoms/Logo';
import OnboardingSvg from '@/components/atoms/onboarding';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeToggle';
import ToastContainer from '@/components/toast/toast';
import { MeshProvider } from '@meshsdk/react';
import { usePathname } from 'next/navigation';
import '../app.css';

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const signUp = pathname.includes('sign-up');

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
          <div className="flex min-h-screen">
            <div className="flex min-h-screen w-full p-2">
              <div className="flex h-full flex-1 flex-col items-center">
                <div className="flex w-full justify-between p-2 lg:p-6">
                  <AppLogo />
                  <div>
                    {signUp ? (
                      <Button
                        variant="outline"
                        size="md"
                        rounded="full"
                        className="flex w-full gap-2 lg:gap-4"
                      >
                        <span className="text-primary-base font-bold">
                          Sign In
                        </span>
                        <InboxIcon />
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="md"
                        rounded="full"
                        className="flex w-full gap-2 lg:gap-4"
                      >
                        <span className="text-primary-base font-bold">
                          Create account
                        </span>
                        <InboxIcon />
                      </Button>
                    )}
                  </div>
                </div>
                <Breadcrumbs />
                <MeshProvider>{children}</MeshProvider>
                <ToastContainer />
                <div className="bottom-0 w-full">
                  <Footer />
                </div>
              </div>

              {/* svg thing */}
              <div className="bg-muted hidden min-h-[1024px] flex-1 rounded-lg pt-24 pb-2 pl-24 lg:block">
                <div className="relative h-[932px] min-w-[797px] rounded-lg bg-[url(/images/onboarding.png)]">
                  <div className="absolute top-19 flex w-full flex-col items-center">
                    <div className="flex max-w-[458px] flex-col gap-4">
                      <Title className="text-nowrap" level="4">
                        Cardano Ambassador Tools
                      </Title>
                      <Paragraph size="base">
                        Onboard, collaborate, and contribute to the ecosystem
                        through a streamlined, token-based platform.
                      </Paragraph>
                    </div>
                  </div>
                  <OnboardingSvg className="absolute -right-1 -bottom-0" />
                </div>
              </div>
            </div>
          </div>{' '}
        </ThemeProvider>
      </body>
    </html>
  );
}
