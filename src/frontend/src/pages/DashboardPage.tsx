import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useGetDirectReferrals, useGetEarningsDashboard, useGetOrderHistory } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, ErrorState } from '../components/common/QueryState';
import { Users, DollarSign, Package, Copy, Check } from 'lucide-react';
import { formatMoney } from '../components/formatters/moneyTime';
import { buildReferralLink, copyToClipboard } from '../utils/referrals';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: referrals, isLoading: referralsLoading } = useGetDirectReferrals();
  const { data: earnings, isLoading: earningsLoading } = useGetEarningsDashboard();
  const { data: orders, isLoading: ordersLoading } = useGetOrderHistory();
  const [copied, setCopied] = useState(false);

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (profileLoading || referralsLoading || earningsLoading || ordersLoading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (!profile) {
    return <ErrorState message="Profile not found" />;
  }

  const handleCopyReferralLink = async () => {
    const link = buildReferralLink(profile.referralCode);
    const success = await copyToClipboard(link);
    if (success) {
      setCopied(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {profile.name}!</h1>
        <p className="text-muted-foreground mt-1">Here's an overview of your FNGV business.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{referrals?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active associates in your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(earnings?.balance || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Products and services purchased</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Link</CardTitle>
          <CardDescription>Share this link to invite new associates to join your network</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1 bg-muted rounded-md px-4 py-2 text-sm font-mono break-all">
              {buildReferralLink(profile.referralCode)}
            </div>
            <Button onClick={handleCopyReferralLink} variant="outline" size="icon">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Your referral code: <span className="font-semibold">{profile.referralCode}</span></p>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button onClick={() => navigate({ to: '/catalog' })} className="w-full" variant="outline">
              Browse Catalog
            </Button>
            <Button onClick={() => navigate({ to: '/referrals' })} className="w-full" variant="outline">
              View Referrals
            </Button>
            <Button onClick={() => navigate({ to: '/earnings' })} className="w-full" variant="outline">
              View Earnings
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Earned</span>
              <span className="font-semibold">{formatMoney(earnings?.totalEarned || BigInt(0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Withdrawn</span>
              <span className="font-semibold">{formatMoney(earnings?.totalWithdrawn || BigInt(0))}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Available Balance</span>
              <span className="font-semibold text-primary">{formatMoney(earnings?.balance || BigInt(0))}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
