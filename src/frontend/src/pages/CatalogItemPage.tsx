import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, usePlaceOrder } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LoadingState, ErrorState } from '../components/common/QueryState';
import { formatMoney, formatDate } from '../components/formatters/moneyTime';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';

export default function CatalogItemPage() {
  const { productId } = useParams({ from: '/catalog/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(BigInt(productId));
  const placeOrder = usePlaceOrder();
  const [quantity, setQuantity] = useState(1);

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading product..." />;
  }

  if (!product) {
    return <ErrorState message="Product not found" />;
  }

  const total = product.price * BigInt(quantity);

  const handlePlaceOrder = async () => {
    if (quantity < 1) {
      toast.error('Quantity must be at least 1');
      return;
    }

    try {
      const order = await placeOrder.mutateAsync({ productId: product.id, quantity: BigInt(quantity) });
      toast.success('Order placed successfully!');
      navigate({ to: `/orders/${order.id}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to place order');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/catalog' })} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Catalog
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{product.name}</CardTitle>
              <CardDescription className="mt-2">Added on {formatDate(product.createdAt)}</CardDescription>
            </div>
            <Badge variant={product.category === 'Product' ? 'outline' : 'secondary'}>{product.category}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-muted-foreground">Price per unit</span>
              <span className="text-3xl font-bold text-primary">{formatMoney(product.price)}</span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                />
              </div>

              <div className="bg-muted rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Total</span>
                  <span className="text-2xl font-bold text-primary">{formatMoney(total)}</span>
                </div>
              </div>

              <Button onClick={handlePlaceOrder} disabled={placeOrder.isPending} className="w-full" size="lg">
                {placeOrder.isPending ? 'Placing Order...' : 'Place Order'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
