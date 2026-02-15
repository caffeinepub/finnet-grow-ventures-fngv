import { useState } from 'react';
import { useGetEarningsDashboard } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { DollarSign, TrendingUp } from 'lucide-react';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

export default function EarningsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: earnings, isLoading } = useGetEarningsDashboard();
  const [levelFilter, setLevelFilter] = useState<string>('all');

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading earnings..." />;
  }

  const filteredCommissions =
    levelFilter === 'all'
      ? earnings?.commissionHistory || []
      : earnings?.commissionHistory.filter((c) => c.level.toString() === levelFilter) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Earnings</h1>
        <p className="text-muted-foreground mt-1">Track your commissions and balance</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatMoney(earnings?.balance || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(earnings?.totalEarned || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">All-time earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatMoney(earnings?.totalWithdrawn || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully paid out</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Commission History</CardTitle>
              <CardDescription>All your earned commissions</CardDescription>
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1 Only</SelectItem>
                <SelectItem value="2">Level 2 Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {!filteredCommissions || filteredCommissions.length === 0 ? (
            <EmptyState message="No commissions yet. Start building your network to earn!" icon={<DollarSign className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Commission ID</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommissions.map((commission) => (
                  <TableRow key={commission.id.toString()}>
                    <TableCell className="font-medium">#{commission.id.toString()}</TableCell>
                    <TableCell>#{commission.orderId.toString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Level {commission.level.toString()}</Badge>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{formatMoney(commission.amount)}</TableCell>
                    <TableCell>{formatDate(commission.timestamp)}</TableCell>
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
