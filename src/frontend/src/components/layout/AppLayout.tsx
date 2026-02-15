import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import AppNav from './AppNav';
import { SiCoffeescript } from 'react-icons/si';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { identity } = useInternetIdentity();
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
      {identity && (
        <footer className="border-t border-border bg-card mt-auto">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
            <p>
              © {currentYear} FINNET GROW VENTURES. All rights reserved.
            </p>
            <p className="mt-2 flex items-center justify-center gap-1">
              Built with <SiCoffeescript className="text-primary" size={16} /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      )}
    </div>
  );
}
