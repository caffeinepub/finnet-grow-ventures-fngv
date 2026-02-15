import { useGetAllProducts } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { LoadingState, EmptyState } from '../components/common/QueryState';
import { ShoppingBag, Package } from 'lucide-react';
import { formatMoney } from '../components/formatters/moneyTime';
import { Badge } from '../components/ui/badge';

export default function CatalogPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: products, isLoading } = useGetAllProducts();

  if (!identity) {
    navigate({ to: '/signin' });
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading catalog..." />;
  }

  const productItems = products?.filter((p) => p.category === 'Product') || [];
  const serviceItems = products?.filter((p) => p.category === 'Service') || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Catalog</h1>
        <p className="text-muted-foreground mt-1">Browse our products and services</p>
      </div>

      {products && products.length === 0 ? (
        <EmptyState message="No products available yet. Check back soon!" icon={<ShoppingBag className="h-12 w-12" />} />
      ) : (
        <>
          {productItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Products</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {productItems.map((product) => (
                  <Card key={product.id.toString()} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="outline">Product</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{formatMoney(product.price)}</span>
                        <Button onClick={() => navigate({ to: `/catalog/${product.id}` })} size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {serviceItems.length > 0 && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Services</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {serviceItems.map((product) => (
                  <Card key={product.id.toString()} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        <Badge variant="secondary">Service</Badge>
                      </div>
                      <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-primary">{formatMoney(product.price)}</span>
                        <Button onClick={() => navigate({ to: `/catalog/${product.id}` })} size="sm">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
