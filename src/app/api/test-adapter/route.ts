import { NextResponse } from 'next/server'
import { sdk } from '@lib/config'

export async function GET() {
  try {
    const tests = []
    
    // Test 1: Fetch collections (usando el genérico)
    try {
      const collections = await sdk.client.fetch('/store/collections', { method: 'GET' })
      tests.push({ 
        test: 'Collections', 
        success: true, 
        count: collections.collections?.length || 0 
      })
    } catch (error: any) {
      tests.push({ test: 'Collections', success: false, error: error.message })
    }
    
    // Test 2: Fetch product categories (usando el genérico)
    try {
      const categories = await sdk.client.fetch('/store/product-categories', { method: 'GET' })
      tests.push({ 
        test: 'Product Categories', 
        success: true, 
        count: categories.product_categories?.length || 0 
      })
    } catch (error: any) {
      tests.push({ test: 'Product Categories', success: false, error: error.message })
    }
    
    // Test 3: Fetch products (usando handler especial)
    try {
      const products = await sdk.client.fetch('/store/products', { method: 'GET' })
      tests.push({ 
        test: 'Products (special)', 
        success: true, 
        count: products.products?.length || 0 
      })
    } catch (error: any) {
      tests.push({ test: 'Products', success: false, error: error.message })
    }
    
    // Test 4: Fetch regions (usando handler especial)
    try {
      const regions = await sdk.client.fetch('/store/regions', { method: 'GET' })
      tests.push({ 
        test: 'Regions (special)', 
        success: true, 
        count: regions.regions?.length || 0 
      })
    } catch (error: any) {
      tests.push({ test: 'Regions', success: false, error: error.message })
    }
    
    const allSuccess = tests.every(t => t.success)
    
    return NextResponse.json({
      success: allSuccess,
      adapter: 'Generic Supabase Adapter',
      tests,
      summary: {
        total: tests.length,
        passed: tests.filter(t => t.success).length,
        failed: tests.filter(t => !t.success).length
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}