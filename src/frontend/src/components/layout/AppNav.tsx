import { Link, useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Menu, User, LogOut, LayoutDashboard, Users, Network, ShoppingBag, Package, DollarSign, Wallet, Shield } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { useState } from 'react';

export default function AppNav() {
  const { identity, clear, loginStatus } = useInternetIdentity();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = !!identity;
  const disabled = loginStatus === 'logging-in';

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    navigate({ to: '/signin' });
  };

  const navLinks = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/referrals', label: 'Referrals', icon: Users },
        { to: '/network', label: 'Network', icon: Network },
        { to: '/catalog', label: 'Catalog', icon: ShoppingBag },
        { to: '/orders', label: 'Orders', icon: Package },
        { to: '/earnings', label: 'Earnings', icon: DollarSign },
        { to: '/payouts', label: 'Payouts', icon: Wallet },
      ]
    : [];

  const adminLinks = isAdmin
    ? [
        { to: '/admin/catalog', label: 'Manage Catalog', icon: Shield },
        { to: '/admin/payouts', label: 'Manage Payouts', icon: Shield },
      ]
    : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/assets/generated/fngv-logo.dim_512x512.png" alt="FNGV" className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                {link.label}
              </Link>
            ))}
            {adminLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                activeProps={{ className: 'text-primary font-semibold' }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="cursor-pointer">
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} disabled={disabled} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Mobile Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-64">
                    <nav className="flex flex-col gap-4 mt-8">
                      {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link
                            key={link.to}
                            to={link.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                            activeProps={{ className: 'text-primary font-semibold' }}
                          >
                            <Icon className="h-4 w-4" />
                            {link.label}
                          </Link>
                        );
                      })}
                      {adminLinks.length > 0 && (
                        <>
                          <div className="border-t border-border my-2" />
                          {adminLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                              <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                                activeProps={{ className: 'text-primary font-semibold' }}
                              >
                                <Icon className="h-4 w-4" />
                                {link.label}
                              </Link>
                            );
                          })}
                        </>
                      )}
                      <div className="border-t border-border my-2" />
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                      >
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                      <button
                        onClick={() => {
                          setMobileMenuOpen(false);
                          handleLogout();
                        }}
                        disabled={disabled}
                        className="flex items-center gap-3 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
