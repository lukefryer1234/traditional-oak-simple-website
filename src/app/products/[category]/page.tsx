// src/app/products/[category]/page.tsx
'use client';

import { PublicRoute } from '@/components/auth/public-route';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';
import { ProductService, Product } from '@/services/domain/product-service'; // Import ProductService and Product
import Link from 'next/link'; // Import Link for navigation

export default function CategoryPage() {
  const params = useParams();
  const category = params.category as string;

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Format category name for display
  const categoryName = category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  useEffect(() => {
    if (category) {
      console.log(`[CategoryPage] Fetching products for category: ${category}`);
      setIsLoading(true);
      ProductService.getProducts(category)
        .then(fetchedProducts => {
          console.log(`[CategoryPage] Successfully fetched products for ${category}:`, fetchedProducts);
          setProducts(fetchedProducts);
          setError(null);
        })
        .catch(err => {
          console.error(`[CategoryPage] Error fetching products for category ${category}:`, err);
          setError(err.message || 'Failed to fetch products.');
          setProducts([]);
        })
        .finally(() => {
          console.log(`[CategoryPage] Finished fetching attempt for ${category}. Setting isLoading to false.`);
          setIsLoading(false);
        });
    } else {
      console.log("[CategoryPage] Category parameter is not yet available.");
      setIsLoading(false); // Ensure loading is false if category is not set
    }
  }, [category]);
  
  return (
    <PublicRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{categoryName}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Browse Our {categoryName}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && <p>Loading products...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!isLoading && !error && products.length === 0 && (
              <p>No products found in this category.</p>
            )}
            {!isLoading && !error && products.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(product => (
                  <Card key={product.id}>
                    <CardHeader>
                      <CardTitle>{product.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{product.description}</p>
                      <p className="font-semibold mt-2">£{product.price.toFixed(2)}</p>
                      {/* Assuming a configure link structure, adjust if different */}
                      <Link href={`/products/${category}/${product.id}/configure`} className="text-blue-500 hover:underline mt-2 block">
                        Configure
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  );
}
