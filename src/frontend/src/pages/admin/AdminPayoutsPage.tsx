import { useGetAllPayoutRequests, useProcessPayoutRequest, useIsCallerAdmin, useGetUserProfile } from '../../hooks/useQueries';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { LoadingState, EmptyState } from '../../components/common/QueryState';
import { Shield, Check, X } from 'lucide-react';
import { formatMoney, formatDate } from '../../components/formatters/moneyTime';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import type { PayoutRequest } from '../../backend';
import AccessDeniedPage from '../AccessDeniedPage';

function PayoutRow({ payout, onProcess }: { payout: PayoutRequest; onProcess: (id: bigint, approved: boolean) => void }) {
  const { data: profile } = useGetUserProfile(payout.associate);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'PENDING':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <TableRow>
      <TableCell className="font-medium">#{payout.id.toString()}</TableCell>
      <TableCell>{profile?.name || 'Loading...'}</TableCell>
      <TableCell className="font-semibold">{formatMoney(payout.amount)}</TableCell>
      <TableCell>
        <Badge variant={getStatusVariant(payout.status)}>{payout.status}</Badge>
      </TableCell>
      <TableCell>{formatDate(payout.requestDate)}</TableCell>
      <TableCell>{payout.processedDate ? formatDate(payout.processedDate) : '-'}</TableCell>
      <TableCell>
        {payout.status === 'PENDING' && (
          <div className="flex gap-2">
            <Button variant="default" size="sm" onClick={() => onProcess(payout.id, true)}>
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button variant="destructive" size="sm" onClick={() => onProcess(payout.id, false)}>
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}

export default function AdminPayoutsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: payouts, isLoading: payoutsLoading } = useGetAllPayoutRequests();
  const processPayoutRequest = useProcessPayoutRequest();

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (adminLoading || payoutsLoading) {
    return <LoadingState message="Loading admin panel..." />;
  }

  if (!isAdmin) {
    return <AccessDeniedPage />;
  }

  const handleProcess = async (requestId: bigint, approved: boolean) => {
    try {
      await processPayoutRequest.mutateAsync({ requestId, approved });
      toast.success(`Payout request ${approved ? 'approved' : 'rejected'} successfully!`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to process payout request');
    }
  };

  const pendingPayouts = payouts?.filter((p) => p.status === 'PENDING') || [];
  const processedPayouts = payouts?.filter((p) => p.status !== 'PENDING') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          Admin: Payout Management
        </h1>
        <p className="text-muted-foreground mt-1">Review and process withdrawal requests</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pending Requests</CardTitle>
          <CardDescription>Withdrawal requests awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length === 0 ? (
            <EmptyState message="No pending payout requests" icon={<Shield className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Associate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingPayouts.map((payout) => (
                  <PayoutRow key={payout.id.toString()} payout={payout} onProcess={handleProcess} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Processed Requests</CardTitle>
          <CardDescription>Previously approved or rejected requests</CardDescription>
        </CardHeader>
        <CardContent>
          {processedPayouts.length === 0 ? (
            <EmptyState message="No processed payout requests yet" />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Associate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Processed Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {processedPayouts.map((payout) => (
                  <PayoutRow key={payout.id.toString()} payout={payout} onProcess={handleProcess} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
