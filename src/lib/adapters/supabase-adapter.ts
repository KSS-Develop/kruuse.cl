import { supabase } from '@lib/config'
import { HttpTypes } from "@medusajs/types"

// Route to Supabase table mapping
const ROUTE_TABLE_MAP: Record<string, string> = {
  'products': 'products',
  'product-categories': 'product_categories',
  'collections': 'collections',
  'regions': 'regions',
  'carts': 'carts',
  'customers': 'customers',
  'orders': 'orders',
  'line-items': 'line_items',
  'shipping-options': 'shipping_options',
  'payment-sessions': 'payment_sessions',
  'addresses': 'addresses',
  'price-lists': 'price_lists',
  'discounts': 'discounts',
  'gift-cards': 'gift_cards',
  'return-reasons': 'return_reasons',
  'shipping-profiles': 'shipping_profiles',
  'tax-rates': 'tax_rates',
  'currencies': 'currencies',
  'sales-channels': 'sales_channels',
}

// Routes that need special handling
const SPECIAL_HANDLERS = ['products', 'regions', 'carts']

// Adapter to translate Medusa SDK calls to Supabase queries
export class SupabaseAdapter {
  async fetch<T>(path: string, options: any): Promise<T> {
    const { method = 'GET', query = {}, headers = {} } = options
    
    // Remove the /store prefix
    const cleanPath = path.replace('/store/', '')
    const [resource, id] = cleanPath.split('/')
    
    try {
      // Handle special cases that need custom logic
      if (SPECIAL_HANDLERS.includes(resource)) {
        if (resource === 'products') {
          return id ? this.fetchProduct(id) as any : this.fetchProducts(query) as any
        } else if (resource === 'regions') {
          return id ? this.fetchRegion(id) as any : this.fetchRegions(query) as any
        } else if (resource === 'carts') {
          return this.handleCarts(cleanPath, method, options) as any
        }
      }
      
      // Generic handler for simple resources
      const tableName = ROUTE_TABLE_MAP[resource]
      if (tableName) {
        if (method === 'GET') {
          return this.genericFetch(tableName, resource, id, query) as any
        } else if (method === 'POST') {
          return this.genericCreate(tableName, resource, options.body) as any
        } else if (method === 'PUT' || method === 'PATCH') {
          return this.genericUpdate(tableName, resource, id, options.body) as any
        } else if (method === 'DELETE') {
          return this.genericDelete(tableName, resource, id) as any
        }
      }
      
      throw new Error(`Unsupported path: ${path}`)
    } catch (error) {
      console.error('SupabaseAdapter error:', error)
      throw error
    }
  }
  
  // Generic fetch method for simple resources
  private async genericFetch(tableName: string, resource: string, id?: string, query?: any) {
    if (id) {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return { [resource.replace(/-/g, '_')]: data }
    } else {
      const { limit = 20, offset = 0 } = query || {}
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(offset, offset + limit - 1)
      
      if (error) throw error
      const pluralResource = resource.endsWith('y') 
        ? resource.slice(0, -1) + 'ies' 
        : resource + (resource.endsWith('s') ? '' : 's')
      
      return { 
        [pluralResource.replace(/-/g, '_')]: data || [],
        count: count || 0 
      }
    }
  }
  
  // Generic create method
  private async genericCreate(tableName: string, resource: string, body: any) {
    const { data, error } = await supabase
      .from(tableName)
      .insert(body)
      .select()
      .single()
    
    if (error) throw error
    return { [resource.replace(/-/g, '_')]: data }
  }
  
  // Generic update method
  private async genericUpdate(tableName: string, resource: string, id: string, body: any) {
    const { data, error } = await supabase
      .from(tableName)
      .update(body)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { [resource.replace(/-/g, '_')]: data }
  }
  
  // Generic delete method
  private async genericDelete(tableName: string, resource: string, id: string) {
    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  }
  
  private async fetchProducts(query: any) {
    const { limit = 12, offset = 0, region_id } = query
    
    const { data: products, error, count } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          *,
          prices(*)
        )
      `, { count: 'exact' })
      .eq('status', 'published')
      .range(offset, offset + limit - 1)
    
    if (error) throw error
    
    // Transform to Medusa format
    const transformedProducts = products?.map(product => ({
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        calculated_price: {
          calculated_amount: variant.prices?.[0]?.amount || 0,
          original_amount: variant.prices?.[0]?.amount || 0,
          currency_code: variant.prices?.[0]?.currency_code || 'USD',
          calculated_price: {
            money_amount_id: variant.prices?.[0]?.id,
            amount: variant.prices?.[0]?.amount || 0,
          },
          original_price: {
            money_amount_id: variant.prices?.[0]?.id,
            amount: variant.prices?.[0]?.amount || 0,
          },
        },
        inventory_quantity: variant.inventory_quantity || 0,
      })),
    }))
    
    return {
      products: transformedProducts || [],
      count: count || 0,
    }
  }
  
  private async fetchProduct(id: string) {
    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        variants:product_variants(
          *,
          prices(*)
        ),
        options:product_options(
          *,
          values:product_option_values(*)
        )
      `)
      .or(`id.eq.${id},handle.eq.${id}`)
      .eq('status', 'published')
      .single()
    
    if (error) throw error
    
    // Transform to Medusa format
    const transformedProduct = {
      ...product,
      variants: product.variants.map((variant: any) => ({
        ...variant,
        calculated_price: {
          calculated_amount: variant.prices?.[0]?.amount || 0,
          original_amount: variant.prices?.[0]?.amount || 0,
          currency_code: variant.prices?.[0]?.currency_code || 'USD',
        },
      })),
    }
    
    return { product: transformedProduct }
  }
  
  private async fetchRegions(query: any) {
    const { data: regions, error } = await supabase
      .from('regions')
      .select(`
        *,
        countries(*)
      `)
    
    if (error) throw error
    
    // Transform to Medusa format with proper country mapping
    const transformedRegions = regions?.map(region => ({
      ...region,
      payment_providers: [],
      fulfillment_providers: [],
      countries: region.countries || [],
    }))
    
    return { regions: transformedRegions || [] }
  }
  
  private async fetchRegion(id: string) {
    const { data: region, error } = await supabase
      .from('regions')
      .select(`
        *,
        countries(*)
      `)
      .eq('id', id)
      .single()
    
    if (error) throw error
    
    // Transform to Medusa format
    const transformedRegion = {
      ...region,
      payment_providers: [],
      fulfillment_providers: [],
      countries: region.countries || [],
    }
    
    return { region: transformedRegion }
  }
  
  // Note: Collections and categories are now handled by genericFetch
  
  private async handleCarts(path: string, method: string, options: any) {
    if (method === 'POST' && path === 'carts') {
      const { data: cart, error } = await supabase
        .from('carts')
        .insert({
          region_id: options.body?.region_id,
        })
        .select()
        .single()
      
      if (error) throw error
      
      return { cart }
    }
    
    // Handle other cart operations
    return { cart: null }
  }
}

// Create a client interface that mimics Medusa SDK
export const supabaseClient = {
  client: new SupabaseAdapter()
}