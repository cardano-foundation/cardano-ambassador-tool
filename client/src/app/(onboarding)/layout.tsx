'use client';
import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import InboxIcon from '@/components/atoms/InboxIcon';
import LinkButton from '@/components/atoms/LinkButton';
import AppLogo from '@/components/atoms/Logo';
import OnboardingSvg from '@/components/atoms/onboarding';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Footer from '@/components/Footer';
import ToastContainer from '@/components/toast/toast';
import { useApp } from '@/context/AppContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

function OnboardingContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useApp();
  const pathname = usePathname();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex h-screen overflow-hidden">
        <div className="flex h-full w-full p-2">
          <div className="flex flex-1 flex-col items-center overflow-y-auto p-2">
            <div className="flex w-full flex-shrink-0 justify-between p-2 lg:p-6">
              <Link href="/">
                <AppLogo />
              </Link>
              {/* <div>
                {signUp ? (
                  <LinkButton
                    href="/login"
                    variant="outline"
                    size="md"
                    rounded="full"
                    className="flex w-full gap-2 lg:gap-4"
                  >
                    <span className="text-primary-base font-bold">Sign In</span>
                    <InboxIcon />
                  </LinkButton>
                ) : (
                  <LinkButton
                    href="/sign-up"
                    variant="outline"
                    size="md"
                    rounded="full"
                    className="flex w-full gap-2 lg:gap-4"
                  >
                    <span className="text-primary-base font-bold">
                      Create account
                    </span>
                    <InboxIcon />
                  </LinkButton>
                )}
              </div>*/}
            </div>
            <div className="flex w-full flex-1 flex-col items-center justify-center">
              {children}
            </div>
            <ToastContainer />
            <div className="w-full flex-shrink-0">
              <Footer />
            </div>
          </div>

          {/* svg thing */}
          <div className="bg-muted hidden h-screen flex-1 overflow-hidden rounded-lg pt-24 pb-2 pl-24 lg:block">
            <div className="h-full min-w-[797px] rounded-lg">
              <div className="relative h-[932px] rounded-lg bg-[url(/images/onboarding.png)] bg-cover bg-no-repeat">
                <div className="absolute top-19 flex w-full flex-col items-center">
                  <div className="flex max-w-[458px] flex-col gap-4 text-white">
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
        </div>
      </div>{' '}
    </>
  );
}

export default function DefaultLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <OnboardingContent>{children}</OnboardingContent>;
}
