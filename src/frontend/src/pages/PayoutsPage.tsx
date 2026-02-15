import { useState } from 'react';
import { useGetEarningsDashboard, useGetMyPayoutRequests, useRequestPayout } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { Wallet, DollarSign } from 'lucide-react';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';

export default function PayoutsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: earnings, isLoading: earningsLoading } = useGetEarningsDashboard();
  const { data: payouts, isLoading: payoutsLoading } = useGetMyPayoutRequests();
  const requestPayout = useRequestPayout();
  const [amount, setAmount] = useState('');

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (earningsLoading || payoutsLoading) {
    return <LoadingState message="Loading payouts..." />;
  }

  const availableBalance = earnings?.balance || BigInt(0);
  const availableBalanceValue = Number(availableBalance) / 100;

  const handleRequestPayout = async () => {
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amountInCents = BigInt(Math.floor(amountNum * 100));
    if (amountInCents > availableBalance) {
      toast.error('Insufficient balance');
      return;
    }

    try {
      await requestPayout.mutateAsync(amountInCents);
      toast.success('Payout request submitted successfully!');
      setAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to request payout');
    }
  };

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Payouts</h1>
        <p className="text-muted-foreground mt-1">Request withdrawals and track payout status</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Available Balance</CardTitle>
            <CardDescription>Amount ready to withdraw</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary mb-6">{formatMoney(availableBalance)}</div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Withdrawal Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max={availableBalanceValue}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">Maximum: {formatMoney(availableBalance)}</p>
              </div>
              <Button onClick={handleRequestPayout} disabled={requestPayout.isPending || availableBalance === BigInt(0)} className="w-full">
                {requestPayout.isPending ? 'Requesting...' : 'Request Payout'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
            <CardDescription>Your financial overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Total Earned</span>
              <span className="font-semibold">{formatMoney(earnings?.totalEarned || BigInt(0))}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-muted-foreground">Total Withdrawn</span>
              <span className="font-semibold">{formatMoney(earnings?.totalWithdrawn || BigInt(0))}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">Available Balance</span>
              <span className="font-semibold text-primary">{formatMoney(availableBalance)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>All your withdrawal requests and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {!payouts || payouts.length === 0 ? (
            <EmptyState message="No payout requests yet. Request a withdrawal to get started!" icon={<Wallet className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Request Date</TableHead>
                  <TableHead>Processed Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payouts.map((payout) => (
                  <TableRow key={payout.id.toString()}>
                    <TableCell className="font-medium">#{payout.id.toString()}</TableCell>
                    <TableCell className="font-semibold">{formatMoney(payout.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(payout.status)}>{payout.status}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(payout.requestDate)}</TableCell>
                    <TableCell>{payout.processedDate ? formatDate(payout.processedDate) : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
