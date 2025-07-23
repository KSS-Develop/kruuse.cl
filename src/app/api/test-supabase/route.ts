import { NextResponse } from 'next/server'
import { supabase } from '@lib/config'

export async function GET() {
  try {
    // Test products query
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(3)
    
    if (productsError) {
      return NextResponse.json({ error: productsError.message }, { status: 500 })
    }
    
    // Test regions query
    const { data: regions, error: regionsError } = await supabase
      .from('regions')
      .select('*, countries(*)')
    
    if (regionsError) {
      return NextResponse.json({ error: regionsError.message }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      products: products?.length || 0,
      regions: regions?.length || 0,
      data: {
        products,
        regions
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}