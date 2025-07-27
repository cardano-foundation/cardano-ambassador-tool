import React from 'react';
import ThemeToggle from './ThemeToggle';

const Footer = () => {
    return (
      <div className="p-8 flex justify-between text-muted-foreground">
        <span className="items-center flex">© 2025 Ambassador Explorer</span>
        <div className="flex gap-6 items-center">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Get help</span>
          <ThemeToggle />
        </div>
      </div>
    );
};

export default Footer;
