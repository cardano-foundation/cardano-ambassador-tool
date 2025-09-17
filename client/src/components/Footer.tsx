import ThemeToggle from './ThemeToggle';

const Footer = () => {
  return (
    <>
      {/* Mobile Layout - Centered with icons */}
      <div className="text-muted-foreground block flex w-full max-w-full flex-col items-center justify-center gap-6 p-6 md:hidden">
        <span className="text-center text-sm font-medium">
          © 2025 Ambassador Explorer
        </span>

        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Privacy</span>
          </div>

          <div className="hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Terms</span>
          </div>

          <div className="hover:text-foreground flex cursor-pointer items-center gap-2 transition-colors">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Get help</span>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Original horizontal layout */}
      <div className="text-muted-foreground hidden w-full max-w-full justify-between p-8 md:flex">
        <span className="flex items-center">© 2025 Ambassador Explorer</span>
        <div className="flex items-center gap-6">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Get help</span>
          <ThemeToggle />
        </div>
      </div>
    </>
  );
};

export default Footer;
