import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetOrderHistory, useGetProduct } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, ErrorState } from '../components/common/QueryState';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Badge } from '../components/ui/badge';
import { ArrowLeft } from 'lucide-react';

export default function OrderDetailPage() {
  const { orderId } = useParams({ from: '/orders/$orderId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: orders, isLoading: ordersLoading } = useGetOrderHistory();

  const order = orders?.find((o) => o.id.toString() === orderId);
  const { data: product, isLoading: productLoading } = useGetProduct(order?.productId || null);

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (ordersLoading || productLoading) {
    return <LoadingState message="Loading order details..." />;
  }

  if (!order) {
    return <ErrorState message="Order not found" />;
  }

  const statusVariant = order.status === 'DELIVERED' ? 'default' : order.status === 'CANCELLED' ? 'destructive' : 'secondary';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/orders' })} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Orders
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{order.id.toString()}</CardTitle>
              <CardDescription className="mt-2">Placed on {formatDate(order.orderDate)}</CardDescription>
            </div>
            <Badge variant={statusVariant} className="text-sm">
              {order.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Product Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Name</p>
                <p className="font-medium">{product?.name || 'Loading...'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium">{product?.category || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unit Price</p>
                <p className="font-medium">{product ? formatMoney(product.price) : '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Quantity</p>
                <p className="font-medium">{order.quantity.toString()}</p>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="font-semibold">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatMoney(order.totalAmount)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span className="text-primary">{formatMoney(order.totalAmount)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
