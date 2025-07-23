import { supabase } from '@lib/config'
import { HttpTypes } from "@medusajs/types"

// Adapter to translate Medusa SDK calls to Supabase queries
export class SupabaseAdapter {
  async fetch<T>(path: string, options: any): Promise<T> {
    const { method = 'GET', query = {}, headers = {} } = options
    
    // Remove the /store prefix
    const cleanPath = path.replace('/store/', '')
    
    try {
      if (cleanPath === 'products') {
        return this.fetchProducts(query) as any
      } else if (cleanPath === 'regions') {
        return this.fetchRegions(query) as any
      } else if (cleanPath.startsWith('regions/')) {
        const id = cleanPath.split('/')[1]
        return this.fetchRegion(id) as any
      } else if (cleanPath === 'collections') {
        return this.fetchCollections(query) as any
      } else if (cleanPath.startsWith('products/')) {
        const id = cleanPath.split('/')[1]
        return this.fetchProduct(id) as any
      } else if (cleanPath.startsWith('carts')) {
        return this.handleCarts(cleanPath, method, options) as any
      }
      
      throw new Error(`Unsupported path: ${path}`)
    } catch (error) {
      console.error('SupabaseAdapter error:', error)
      throw error
    }
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
  
  private async fetchCollections(query: any) {
    const { data: collections, error } = await supabase
      .from('collections')
      .select('*')
    
    if (error) throw error
    
    return { collections: collections || [] }
  }
  
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