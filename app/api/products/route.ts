import { type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireRole } from '@/lib/auth/requireRole'
import { createProductSchema } from '@/lib/validations/products'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = request.nextUrl

    const search    = searchParams.get('search') ?? ''
    const brand     = searchParams.get('brand')
    const category  = searchParams.get('category')
    const minPrice  = searchParams.get('min_price')
    const maxPrice  = searchParams.get('max_price')
    const sortBy    = searchParams.get('sort_by') ?? 'newest'
    const page      = parseInt(searchParams.get('page') ?? '1', 10)
    const limit     = parseInt(searchParams.get('limit') ?? '20', 10)
    const offset    = (page - 1) * limit

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)

    if (search) query = query.ilike('name', `%${search}%`)
    if (brand)  query = query.ilike('brand', `%${brand}%`)
    if (category) query = query.eq('category', category)
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))

    switch (sortBy) {
      case 'price_asc':  query = query.order('price', { ascending: true }); break
      case 'price_desc': query = query.order('price', { ascending: false }); break
      case 'name':       query = query.order('name', { ascending: true }); break
      case 'newest':
      default:           query = query.order('created_at', { ascending: false }); break
    }

    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw new ApiError(400, error.message)

    return Response.json({
      products: data,
      total: count,
      page,
      limit,
      message: (!data || data.length === 0) ? 'No products match your search criteria' : undefined,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireRole(['staff', 'inventory_staff', 'manager', 'admin'])

    const body = await request.json()
    const result = createProductSchema.safeParse(body)
    if (!result.success) throw new ApiError(400, result.error?.issues?.[0]?.message ?? 'Invalid request body')

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('products')
      .insert(result.data)
      .select()
      .single()

    if (error) throw new ApiError(400, error.message)

    return Response.json(data, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
