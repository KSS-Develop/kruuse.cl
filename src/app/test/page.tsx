'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@lib/config'

export default function TestPage() {
  const [products, setProducts] = useState<any[]>([])
  const [regions, setRegions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select(`
            *,
            variants:product_variants(
              *,
              prices(*)
            )
          `)
          .eq('status', 'published')
          .limit(6)
        
        if (productsError) throw productsError
        setProducts(productsData || [])

        // Fetch regions
        const { data: regionsData, error: regionsError } = await supabase
          .from('regions')
          .select('*, countries(*)')
        
        if (regionsError) throw regionsError
        setRegions(regionsData || [])

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Kruuse.cl - Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regions ({regions.length})</h2>
        <div className="grid gap-4">
          {regions.map(region => (
            <div key={region.id} className="border p-4 rounded">
              <h3 className="font-semibold">{region.name}</h3>
              <p>Currency: {region.currency_code}</p>
              <p>Tax Rate: {region.tax_rate}%</p>
              <p>Countries: {region.countries?.map((c: any) => c.name).join(', ')}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Products ({products.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <div key={product.id} className="border p-4 rounded">
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-sm text-gray-600 mb-2">{product.description}</p>
              <div>
                {product.variants?.map((variant: any) => (
                  <div key={variant.id} className="mt-2">
                    <p>SKU: {variant.sku}</p>
                    <p>Stock: {variant.inventory_quantity}</p>
                    {variant.prices?.map((price: any) => (
                      <p key={price.id}>
                        {price.currency_code}: {price.amount}
                      </p>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}