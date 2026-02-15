import { useState } from 'react';
import { useGetEarningsDashboard, useGetFixedReferralBonusSummary, useGetReferralBonusHistory } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { DollarSign, TrendingUp, Award } from 'lucide-react';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function EarningsPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: earnings, isLoading: earningsLoading } = useGetEarningsDashboard();
  const { data: bonusSummary, isLoading: bonusSummaryLoading } = useGetFixedReferralBonusSummary();
  const { data: bonusHistory, isLoading: bonusHistoryLoading } = useGetReferralBonusHistory();
  const [commissionLevelFilter, setCommissionLevelFilter] = useState<string>('all');
  const [bonusLevelFilter, setBonusLevelFilter] = useState<string>('all');

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (earningsLoading || bonusSummaryLoading || bonusHistoryLoading) {
    return <LoadingState message="Loading earnings..." />;
  }

  const filteredCommissions =
    commissionLevelFilter === 'all'
      ? earnings?.commissionHistory || []
      : earnings?.commissionHistory.filter((c) => c.level.toString() === commissionLevelFilter) || [];

  const filteredBonuses =
    bonusLevelFilter === 'all'
      ? bonusHistory || []
      : bonusHistory?.filter((b) => b.level.toString() === bonusLevelFilter) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          Earnings Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Track your commissions and referral bonuses</p>
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

      <Tabs defaultValue="referral-bonus" className="space-y-4">
        <TabsList>
          <TabsTrigger value="referral-bonus">Referral Bonus</TabsTrigger>
          <TabsTrigger value="commissions">Commissions (Legacy)</TabsTrigger>
        </TabsList>

        <TabsContent value="referral-bonus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Referral Bonus Summary
              </CardTitle>
              <CardDescription>7-level fixed bonus structure for Associate-ID purchases</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Bonuses</p>
                  <p className="text-2xl font-bold">{bonusSummary?.totalBonuses.toString() || '0'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold text-primary">{formatMoney(bonusSummary?.totalAmount || BigInt(0))}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7].map((level) => {
                  const countKey = `level${level}Count` as keyof typeof bonusSummary;
                  const amountKey = `totalLevel${level}Amount` as keyof typeof bonusSummary;
                  const count = bonusSummary?.[countKey] || BigInt(0);
                  const amount = bonusSummary?.[amountKey] || BigInt(0);
                  return (
                    <div key={level} className="rounded-lg border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-muted-foreground">Level {level}</span>
                        <Badge variant="outline" className="text-xs">{count.toString()}</Badge>
                      </div>
                      <p className="text-lg font-semibold">{formatMoney(amount)}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Referral Bonus History</CardTitle>
                  <CardDescription>Detailed list of all referral bonus events</CardDescription>
                </div>
                <Select value={bonusLevelFilter} onValueChange={setBonusLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                    <SelectItem value="6">Level 6</SelectItem>
                    <SelectItem value="7">Level 7</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredBonuses || filteredBonuses.length === 0 ? (
                <EmptyState
                  message={bonusLevelFilter === 'all' ? 'No referral bonuses yet' : `No level ${bonusLevelFilter} bonuses yet`}
                  icon={<Award className="h-12 w-12" />}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Triggered By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBonuses.map((bonus) => (
                      <TableRow key={bonus.id.toString()}>
                        <TableCell>{formatDate(bonus.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant="default">Level {bonus.level.toString()}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-primary">{formatMoney(bonus.amount)}</TableCell>
                        <TableCell className="font-mono text-xs">{bonus.referralBy.toString().slice(0, 12)}...</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Commission History (Legacy)</CardTitle>
                  <CardDescription>Historical percentage-based commissions</CardDescription>
                </div>
                <Select value={commissionLevelFilter} onValueChange={setCommissionLevelFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {!filteredCommissions || filteredCommissions.length === 0 ? (
                <EmptyState
                  message={commissionLevelFilter === 'all' ? 'No commissions yet' : `No level ${commissionLevelFilter} commissions yet`}
                  icon={<DollarSign className="h-12 w-12" />}
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCommissions.map((commission) => (
                      <TableRow key={commission.id.toString()}>
                        <TableCell>{formatDate(commission.timestamp)}</TableCell>
                        <TableCell className="font-medium">#{commission.orderId.toString()}</TableCell>
                        <TableCell>
                          <Badge variant={commission.level === BigInt(1) ? 'default' : 'secondary'}>
                            Level {commission.level.toString()}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold">{formatMoney(commission.amount)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
