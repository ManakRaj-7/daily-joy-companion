import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {!hideNav && <Navbar />}
      <main className={hideNav ? '' : 'pt-16'}>
        {children}
      </main>
    </div>
  );
}
