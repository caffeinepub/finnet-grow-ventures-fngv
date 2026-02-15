import { useGetDownlineStructure, useGetUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { Network, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { Principal } from '@dfinity/principal';

function NetworkMemberRow({ principal, level }: { principal: Principal; level: number }) {
  const { data: profile } = useGetUserProfile(principal);
  
  return (
    <TableRow>
      <TableCell className="font-medium">{profile?.name || 'Loading...'}</TableCell>
      <TableCell>{profile?.email || '-'}</TableCell>
      <TableCell>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Level {level}</span>
      </TableCell>
      <TableCell>{profile?.status || '-'}</TableCell>
    </TableRow>
  );
}

export default function NetworkPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: downline, isLoading } = useGetDownlineStructure();

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading network..." />;
  }

  const totalMembers = Number(downline?.level1Count || BigInt(0)) + Number(downline?.level2Count || BigInt(0));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Network</h1>
        <p className="text-muted-foreground mt-1">View your complete downline structure</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Network</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMembers}</div>
            <p className="text-xs text-muted-foreground mt-1">Associates in your network</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level 1</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(downline?.level1Count || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Direct referrals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level 2</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(downline?.level2Count || BigInt(0))}</div>
            <p className="text-xs text-muted-foreground mt-1">Second-level referrals</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Network Members</CardTitle>
          <CardDescription>All associates in your downline (Level 1 and Level 2)</CardDescription>
        </CardHeader>
        <CardContent>
          {totalMembers === 0 ? (
            <EmptyState message="Your network is empty. Start referring associates to build your team!" icon={<Network className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {downline?.level1.map((principal) => (
                  <NetworkMemberRow key={principal.toString()} principal={principal} level={1} />
                ))}
                {downline?.level2.map((principal) => (
                  <NetworkMemberRow key={principal.toString()} principal={principal} level={2} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
