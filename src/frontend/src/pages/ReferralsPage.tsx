import { useGetDirectReferrals, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { Users, Copy, Check } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { buildReferralLink, copyToClipboard } from '../utils/referrals';
import { useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { Principal } from '@dfinity/principal';

function ReferralRow({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  
  return (
    <TableRow>
      <TableCell className="font-medium">{profile?.name || 'Loading...'}</TableCell>
      <TableCell>{profile?.email || '-'}</TableCell>
      <TableCell>{profile?.status || '-'}</TableCell>
    </TableRow>
  );
}

export default function ReferralsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: referrals, isLoading: referralsLoading } = useGetDirectReferrals();
  const [copied, setCopied] = useState(false);

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (profileLoading || referralsLoading) {
    return <LoadingState message="Loading referrals..." />;
  }

  const handleCopyLink = async () => {
    if (!profile) return;
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

  const handleCopyCode = async () => {
    if (!profile) return;
    const success = await copyToClipboard(profile.referralCode);
    if (success) {
      toast.success('Referral code copied!');
    } else {
      toast.error('Failed to copy code');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Referrals</h1>
        <p className="text-muted-foreground mt-1">Manage your referral network and invite new associates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Referral Information</CardTitle>
          <CardDescription>Share your referral code or link to invite new associates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Referral Code</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-md px-4 py-2 font-mono font-semibold">
                {profile?.referralCode}
              </div>
              <Button onClick={handleCopyCode} variant="outline" size="icon">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Referral Link</p>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-md px-4 py-2 text-sm font-mono break-all">
                {profile && buildReferralLink(profile.referralCode)}
              </div>
              <Button onClick={handleCopyLink} variant="outline" size="icon">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Direct Referrals (Level 1)</CardTitle>
              <CardDescription>Associates who joined using your referral code</CardDescription>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{referrals?.length || 0}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!referrals || referrals.length === 0 ? (
            <EmptyState message="No direct referrals yet. Share your referral link to get started!" icon={<Users className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((principal) => (
                  <ReferralRow key={principal.toString()} principal={principal} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
