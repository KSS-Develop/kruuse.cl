import { supabase } from '@lib/config'

export default async function TestServerPage() {
  // Fetch products server-side
  const { data: products, error: productsError } = await supabase
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
  
  // Fetch regions server-side
  const { data: regions, error: regionsError } = await supabase
    .from('regions')
    .select('*, countries(*)')

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Kruuse.cl - Server Test Page</h1>
      
      {productsError && <div className="text-red-500 mb-4">Products Error: {productsError.message}</div>}
      {regionsError && <div className="text-red-500 mb-4">Regions Error: {regionsError.message}</div>}
      
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Regions ({regions?.length || 0})</h2>
        <div className="grid gap-4">
          {regions?.map(region => (
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
        <h2 className="text-2xl font-semibold mb-4">Products ({products?.length || 0})</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products?.map(product => (
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