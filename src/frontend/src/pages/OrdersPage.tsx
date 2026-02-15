import { useGetOrderHistory, useGetProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { Package } from 'lucide-react';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import type { Order } from '../backend';

function OrderRow({ order }: { order: Order }) {
  const navigate = useNavigate();
  const { data: product } = useGetProduct(order.productId);

  const statusVariant = order.status === 'DELIVERED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'secondary';

  return (
    <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => navigate({ to: `/orders/${order.id}` })}>
      <TableCell className="font-medium">#{order.id.toString()}</TableCell>
      <TableCell>{product?.name || 'Loading...'}</TableCell>
      <TableCell>{order.quantity.toString()}</TableCell>
      <TableCell>{formatMoney(order.totalAmount)}</TableCell>
      <TableCell>
        <Badge variant={statusVariant}>{order.status}</Badge>
      </TableCell>
      <TableCell>{formatDate(order.orderDate)}</TableCell>
      <TableCell>
        <Button variant="ghost" size="sm">
          View
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function OrdersPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useGetOrderHistory();

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading orders..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">View your order history</p>
        </div>
        <Button onClick={() => navigate({ to: '/catalog' })}>Browse Catalog</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>All your purchases and their status</CardDescription>
        </CardHeader>
        <CardContent>
          {!orders || orders.length === 0 ? (
            <EmptyState message="No orders yet. Browse the catalog to make your first purchase!" icon={<Package className="h-12 w-12" />} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <OrderRow key={order.id.toString()} order={order} />
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
