import { createClient } from '@/lib/supabase/server'
import { handleApiError, ApiError } from '@/lib/api/errors'
import { requireAuth } from '@/lib/auth/requireRole'

export async function GET() {
  try {
    const profile = await requireAuth()
    const supabase = await createClient()

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0]

    // 1. Purchase history — categories and brands
    const { data: purchased } = await supabase
      .from('order_items')
      .select('product_id, products(category, brand), orders!inner(customer_id, status)')
      .eq('orders.customer_id', profile.id)
      .eq('orders.status', 'delivered')

    const purchasedProductIds = new Set<string>()
    const preferredCategories = new Set<string>()
    const preferredBrands = new Set<string>()

    ;(purchased ?? []).forEach((item: any) => {
      purchasedProductIds.add(item.product_id)
      if (item.products?.category) preferredCategories.add(item.products.category)
      if (item.products?.brand) preferredBrands.add(item.products.brand)
    })

    // 2. Highly-rated products (4-5 stars by this user)
    const { data: highRated } = await supabase
      .from('reviews')
      .select('product_id, products(category, brand)')
      .eq('customer_id', profile.id)
      .gte('rating', 4)

    ;(highRated ?? []).forEach((r: any) => {
      if (r.products?.category) preferredCategories.add(r.products.category)
      if (r.products?.brand) preferredBrands.add(r.products.brand)
    })

    const recommendations: Array<{ product: any; reason: string }> = []
    const seen = new Set<string>()

    const addProduct = (product: any, reason: string) => {
      if (!seen.has(product.id) && !purchasedProductIds.has(product.id)) {
        seen.add(product.id)
        recommendations.push({ ...product, reason })
      }
    }

    // 3. Same category/brand as purchase history
    if (preferredCategories.size > 0 || preferredBrands.size > 0) {
      const cats = Array.from(preferredCategories)
      const brands = Array.from(preferredBrands)

      const { data: similar } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .or(
          [
            cats.length > 0 ? `category.in.(${cats.map(c => `"${c}"`).join(',')})` : null,
            brands.length > 0 ? `brand.in.(${brands.map(b => `"${b}"`).join(',')})` : null,
          ]
            .filter(Boolean)
            .join(',')
        )
        .limit(12)

      ;(similar ?? []).forEach((p: any) => addProduct(p, 'Based on your purchase history'))
    }

    // 4. Popular products (most ordered in last 30 days)
    const { data: popularItems } = await supabase
      .from('order_items')
      .select('product_id, products(*), orders!inner(order_date)')
      .gte('orders.order_date', thirtyDaysAgo.toISOString())
      .limit(50)

    const countMap: Record<string, { product: any; count: number }> = {}
    ;(popularItems ?? []).forEach((item: any) => {
      if (item.products) {
        const pid = item.product_id
        countMap[pid] = countMap[pid]
          ? { product: item.products, count: countMap[pid].count + 1 }
          : { product: item.products, count: 1 }
      }
    })

    Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .forEach(({ product }) => {
        if (product.is_active) addProduct(product, 'Popular right now')
      })

    // 5. New releases (last 30 days)
    const { data: newReleases } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .gte('release_date', thirtyDaysAgoStr)
      .order('release_date', { ascending: false })
      .limit(6)

    ;(newReleases ?? []).forEach((p: any) => addProduct(p, 'New release'))

    return Response.json(recommendations.slice(0, 12))
  } catch (error) {
    return handleApiError(error)
  }
}
