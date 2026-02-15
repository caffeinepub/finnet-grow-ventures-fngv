import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import AppLayout from './components/layout/AppLayout';
import SignInPage from './pages/SignInPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import ReferralsPage from './pages/ReferralsPage';
import NetworkPage from './pages/NetworkPage';
import CatalogPage from './pages/CatalogPage';
import CatalogItemPage from './pages/CatalogItemPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import EarningsPage from './pages/EarningsPage';
import PayoutsPage from './pages/PayoutsPage';
import AdminCatalogPage from './pages/admin/AdminCatalogPage';
import AdminPayoutsPage from './pages/admin/AdminPayoutsPage';
import NotFoundPage from './pages/NotFoundPage';
import ProfileSetupModal from './components/profile/ProfileSetupModal';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from 'next-themes';

function RootLayout() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  
  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout>
        <Outlet />
      </AppLayout>
      {showProfileSetup && <ProfileSetupModal />}
      <Toaster />
    </>
  );
}

function IndexComponent() {
  const { identity } = useInternetIdentity();
  return identity ? <DashboardPage /> : <SignInPage />;
}

const rootRoute = createRootRoute({
  component: RootLayout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/signin',
  component: SignInPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/profile',
  component: ProfilePage,
});

const referralsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/referrals',
  component: ReferralsPage,
});

const networkRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/network',
  component: NetworkPage,
});

const catalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog',
  component: CatalogPage,
});

const catalogItemRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/catalog/$productId',
  component: CatalogItemPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const orderDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders/$orderId',
  component: OrderDetailPage,
});

const earningsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/earnings',
  component: EarningsPage,
});

const payoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/payouts',
  component: PayoutsPage,
});

const adminCatalogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/catalog',
  component: AdminCatalogPage,
});

const adminPayoutsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/payouts',
  component: AdminPayoutsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  signInRoute,
  dashboardRoute,
  profileRoute,
  referralsRoute,
  networkRoute,
  catalogRoute,
  catalogItemRoute,
  ordersRoute,
  orderDetailRoute,
  earningsRoute,
  payoutsRoute,
  adminCatalogRoute,
  adminPayoutsRoute,
]);

const router = createRouter({ routeTree, defaultNotFoundComponent: NotFoundPage });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
