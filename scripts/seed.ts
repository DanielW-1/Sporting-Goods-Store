/**
 * Seed script for Sports Goods Store
 * Run with: npx tsx scripts/seed.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey  = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function createUser(email: string, password: string, meta: Record<string, string>, role: string) {
  // Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: meta,
  })

  if (error) {
    if (error.message.includes('already been registered')) {
      console.log(`  User ${email} already exists, skipping`)
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single()
      return (existing as any)?.id
    }
    throw error
  }

  const userId = data.user!.id

  // Update profile with full details + role
  await supabase
    .from('profiles')
    .update({
      first_name: meta.first_name,
      last_name: meta.last_name,
      role,
      phone: meta.phone ?? null,
    })
    .eq('id', userId)

  return userId
}

async function main() {
  console.log('🌱 Seeding database...\n')

  // -------------------------
  // 1. Users
  // -------------------------
  console.log('Creating users...')

  const adminId = await createUser(
    'admin@sportsstore.com', 'Admin@123!',
    { first_name: 'Admin', last_name: 'User' }, 'admin'
  )

  const managerId = await createUser(
    'manager@sportsstore.com', 'Manager@123!',
    { first_name: 'Sarah', last_name: 'Mitchell' }, 'manager'
  )

  const staffId = await createUser(
    'staff@sportsstore.com', 'Staff@123!',
    { first_name: 'Tom', last_name: 'Harris' }, 'staff'
  )

  const invStaffId = await createUser(
    'inventory@sportsstore.com', 'Inventory@123!',
    { first_name: 'Jake', last_name: 'Rivera' }, 'inventory_staff'
  )

  const supportId = await createUser(
    'support@sportsstore.com', 'Support@123!',
    { first_name: 'Amy', last_name: 'Chen' }, 'support_staff'
  )

  const driverId = await createUser(
    'driver@sportsstore.com', 'Driver@123!',
    { first_name: 'Mike', last_name: 'Johnson' }, 'driver'
  )

  const customer1Id = await createUser(
    'customer1@example.com', 'Customer@123!',
    { first_name: 'Alice', last_name: 'Walker' }, 'customer'
  )

  const customer2Id = await createUser(
    'customer2@example.com', 'Customer@123!',
    { first_name: 'Bob', last_name: 'Smith' }, 'customer'
  )

  console.log('  ✓ Users created\n')

  // -------------------------
  // 2. Suppliers
  // -------------------------
  console.log('Creating suppliers...')

  const { data: supplier1 } = await supabase
    .from('suppliers')
    .insert({ company_name: 'Nike Distribution Co.', phone: '+1-800-555-0101', email: 'orders@nikedist.example.com', status: 'active' })
    .select()
    .single()

  const { data: supplier2 } = await supabase
    .from('suppliers')
    .insert({ company_name: 'Adidas Wholesale Ltd.', phone: '+1-800-555-0202', email: 'supply@adidaswholesale.example.com', status: 'active' })
    .select()
    .single()

  console.log('  ✓ Suppliers created\n')

  // -------------------------
  // 3. Products (20+)
  // -------------------------
  console.log('Creating products...')

  const productsData = [
    // Footwear
    { name: 'Nike Air Max 270', brand: 'Nike', category: 'Footwear', subcategory: 'Running Shoes', price: 149.99, stock_quantity: 50, supplier_id: (supplier1 as any).id, color: 'Black/White', size: '10', description: 'Lightweight running shoe with Max Air cushioning.' },
    { name: 'Adidas Ultraboost 23', brand: 'Adidas', category: 'Footwear', subcategory: 'Running Shoes', price: 179.99, stock_quantity: 40, supplier_id: (supplier2 as any).id, color: 'Core Black', size: '10', description: 'Energy-returning running shoe.' },
    { name: 'Under Armour HOVR Phantom', brand: 'Under Armour', category: 'Footwear', subcategory: 'Training Shoes', price: 129.99, stock_quantity: 30, color: 'White/Grey', size: '11', description: 'Zero-gravity feel connected running shoe.' },
    { name: 'New Balance 990v5', brand: 'New Balance', category: 'Footwear', subcategory: 'Running Shoes', price: 174.99, stock_quantity: 25, color: 'Grey', size: '10.5', description: 'Made in USA premium running shoe.' },
    { name: 'Nike Metcon 8', brand: 'Nike', category: 'Footwear', subcategory: 'Training Shoes', price: 129.99, stock_quantity: 35, supplier_id: (supplier1 as any).id, color: 'Blue/White', size: '11', description: 'Stable and versatile training shoe.' },
    // Apparel
    { name: 'Nike Dri-FIT T-Shirt', brand: 'Nike', category: 'Apparel', subcategory: 'T-Shirts', price: 34.99, stock_quantity: 100, supplier_id: (supplier1 as any).id, color: 'White', size: 'M', description: 'Moisture-wicking performance tee.' },
    { name: 'Adidas Tiro 23 Track Pants', brand: 'Adidas', category: 'Apparel', subcategory: 'Pants', price: 54.99, stock_quantity: 80, supplier_id: (supplier2 as any).id, color: 'Black', size: 'L', description: 'Classic soccer-inspired track pants.' },
    { name: 'Under Armour HeatGear Compression Shorts', brand: 'Under Armour', category: 'Apparel', subcategory: 'Shorts', price: 29.99, stock_quantity: 60, color: 'Black', size: 'M', description: 'Ultra-tight compression shorts for intense workouts.' },
    { name: 'Nike Pro Sports Bra', brand: 'Nike', category: 'Apparel', subcategory: 'Sports Bras', price: 39.99, stock_quantity: 70, supplier_id: (supplier1 as any).id, color: 'Pink', size: 'S', description: 'Medium-support sports bra with Dri-FIT.' },
    { name: 'Adidas Squad 21 Jersey', brand: 'Adidas', category: 'Apparel', subcategory: 'Jerseys', price: 44.99, stock_quantity: 55, supplier_id: (supplier2 as any).id, color: 'Red/White', size: 'L', description: 'Replica soccer jersey.' },
    // Equipment
    { name: 'Wilson Federer Tennis Racket', brand: 'Wilson', category: 'Equipment', subcategory: 'Tennis', price: 89.99, stock_quantity: 20, description: 'Powerful all-round performance racket.' },
    { name: 'Spalding NBA Official Basketball', brand: 'Spalding', category: 'Equipment', subcategory: 'Basketball', price: 49.99, stock_quantity: 30, color: 'Orange', description: 'Official NBA game ball.' },
    { name: 'Callaway Strata Golf Set', brand: 'Callaway', category: 'Equipment', subcategory: 'Golf', price: 299.99, stock_quantity: 10, description: '12-piece complete golf set for beginners.' },
    { name: 'Bowflex SelectTech Dumbbells', brand: 'Bowflex', category: 'Equipment', subcategory: 'Fitness', price: 249.99, stock_quantity: 15, description: 'Adjustable dumbbells 5–52.5 lbs.' },
    { name: 'Speedo Fastskin LZR Swimsuit', brand: 'Speedo', category: 'Equipment', subcategory: 'Swimming', price: 199.99, stock_quantity: 12, color: 'Navy', size: 'M', description: 'Competition swimsuit with Fastskin technology.' },
    // Accessories
    { name: 'Garmin Forerunner 255 GPS Watch', brand: 'Garmin', category: 'Accessories', subcategory: 'Smartwatches', price: 349.99, stock_quantity: 18, color: 'Black', description: 'Advanced running GPS watch.' },
    { name: 'Nike Elite Basketball Socks', brand: 'Nike', category: 'Accessories', subcategory: 'Socks', price: 19.99, stock_quantity: 150, supplier_id: (supplier1 as any).id, color: 'White', size: 'L', description: 'Cushioned high-performance socks.' },
    { name: 'Adidas Backpack Tiro', brand: 'Adidas', category: 'Accessories', subcategory: 'Bags', price: 49.99, stock_quantity: 40, supplier_id: (supplier2 as any).id, color: 'Black/White', description: 'Spacious sports backpack.' },
    { name: 'Foam Roller Pro', brand: 'TriggerPoint', category: 'Accessories', subcategory: 'Recovery', price: 39.99, stock_quantity: 45, color: 'Black', description: 'Deep-tissue foam roller for muscle recovery.' },
    { name: 'Resistance Bands Set', brand: 'Perform Better', category: 'Accessories', subcategory: 'Fitness', price: 24.99, stock_quantity: 60, description: 'Set of 5 resistance bands in various tensions.' },
    { name: 'Nike Swoosh Headband', brand: 'Nike', category: 'Accessories', subcategory: 'Headwear', price: 14.99, stock_quantity: 200, supplier_id: (supplier1 as any).id, color: 'Various', description: 'Moisture-wicking sports headband.' },
  ]

  const { data: products, error: prodErr } = await supabase
    .from('products')
    .insert(productsData)
    .select()

  if (prodErr) {
    console.error('  ✗ Error creating products:', prodErr.message)
  } else {
    console.log(`  ✓ ${(products ?? []).length} products created\n`)
  }

  const productList = products ?? []

  // -------------------------
  // 4. Supplier-product links
  // -------------------------
  if (productList.length > 0) {
    const nikeProducts  = productList.filter((p: any) => p.brand === 'Nike').slice(0, 3)
    const adidasProducts = productList.filter((p: any) => p.brand === 'Adidas').slice(0, 3)

    const supplierLinks = [
      ...nikeProducts.map((p: any) => ({ supplier_id: (supplier1 as any).id, product_id: p.id, quantity: 100, cost: parseFloat((p.price * 0.6).toFixed(2)) })),
      ...adidasProducts.map((p: any) => ({ supplier_id: (supplier2 as any).id, product_id: p.id, quantity: 80, cost: parseFloat((p.price * 0.55).toFixed(2)) })),
    ]
    await supabase.from('supplier_products').insert(supplierLinks)
  }

  // -------------------------
  // 5. Sponsors
  // -------------------------
  console.log('Creating sponsors...')

  const { data: sponsor } = await supabase
    .from('sponsors')
    .insert({ company_name: 'SportsTech Corp', start_date: '2026-01-01', end_date: '2026-12-31', is_active: true })
    .select()
    .single()

  if (sponsor && productList.length >= 3) {
    const sponsoredProductIds = productList.slice(0, 3).map((p: any) => p.id)
    await supabase.from('sponsored_products').insert(
      sponsoredProductIds.map((pid: string) => ({ sponsor_id: (sponsor as any).id, product_id: pid }))
    )
  }
  console.log('  ✓ Sponsor created\n')

  // -------------------------
  // 6. Discounts
  // -------------------------
  if (productList.length >= 5) {
    await supabase.from('discounts').insert([
      { product_id: productList[0].id, percentage: 15, start_date: '2026-04-01', end_date: '2026-04-30' },
      { product_id: productList[5].id, percentage: 20, start_date: '2026-04-01', end_date: '2026-06-30' },
    ])
  }

  // -------------------------
  // 7. Sample orders
  // -------------------------
  console.log('Creating sample orders...')

  if (productList.length >= 4 && customer1Id && customer2Id) {
    // Order 1 — delivered
    const { data: order1 } = await supabase
      .from('orders')
      .insert({
        customer_id: customer1Id,
        driver_id: driverId,
        status: 'delivered',
        payment_method: 'credit_card',
        payment_status: 'paid',
        total_amount: 184.98,
        shipping_address: '123 Main St, Springfield',
        tracking_number: 'TRK-SEED-001',
        expected_delivery_date: '2026-04-10',
      })
      .select()
      .single()

    if (order1) {
      await supabase.from('order_items').insert([
        { order_id: (order1 as any).id, product_id: productList[0].id, quantity: 1, price_at_purchase: 149.99 },
        { order_id: (order1 as any).id, product_id: productList[5].id, quantity: 1, price_at_purchase: 34.99 },
      ])
    }

    // Order 2 — processing
    const { data: order2 } = await supabase
      .from('orders')
      .insert({
        customer_id: customer2Id,
        status: 'processing',
        payment_method: 'debit_card',
        payment_status: 'paid',
        total_amount: 179.99,
        shipping_address: '456 Oak Ave, Portland',
        tracking_number: 'TRK-SEED-002',
      })
      .select()
      .single()

    if (order2) {
      await supabase.from('order_items').insert([
        { order_id: (order2 as any).id, product_id: productList[1].id, quantity: 1, price_at_purchase: 179.99 },
      ])
    }

    // Order 3 — pending (cash on delivery)
    const { data: order3 } = await supabase
      .from('orders')
      .insert({
        customer_id: customer1Id,
        status: 'pending',
        payment_method: 'cash_on_delivery',
        payment_status: 'pending',
        total_amount: 69.98,
        shipping_address: '123 Main St, Springfield',
        tracking_number: 'TRK-SEED-003',
      })
      .select()
      .single()

    if (order3) {
      await supabase.from('order_items').insert([
        { order_id: (order3 as any).id, product_id: productList[6].id, quantity: 1, price_at_purchase: 54.99 },
        { order_id: (order3 as any).id, product_id: productList[16].id, quantity: 1, price_at_purchase: 19.99 },
      ])
    }

    console.log('  ✓ Sample orders created\n')

    // -------------------------
    // 8. Reviews (customer1 reviews product they bought)
    // -------------------------
    console.log('Creating reviews...')
    await supabase.from('reviews').insert([
      { product_id: productList[0].id, customer_id: customer1Id, rating: 5, comment: 'Amazing shoes, very comfortable!' },
      { product_id: productList[5].id, customer_id: customer1Id, rating: 4, comment: 'Great shirt, good quality material.' },
    ])
    console.log('  ✓ Reviews created\n')
  }

  // -------------------------
  // 9. Verify store policies
  // -------------------------
  const { data: existingPolicies } = await supabase.from('store_policies').select('key')
  const existingKeys = (existingPolicies ?? []).map((p: any) => p.key)
  const defaults = [
    { key: 'refund_window_days', value: '30' },
    { key: 'reward_points_per_dollar', value: '1' },
    { key: 'discount_points_per_dollar', value: '2' },
    { key: 'discount_points_value_cents', value: '1' },
    { key: 'reward_points_value_cents', value: '1' },
  ]
  const missing = defaults.filter(d => !existingKeys.includes(d.key))
  if (missing.length > 0) {
    await supabase.from('store_policies').insert(missing)
  }
  console.log('  ✓ Store policies verified\n')

  console.log('✅ Seeding complete!\n')
  console.log('Test accounts:')
  console.log('  admin@sportsstore.com  / Admin@123!     (admin)')
  console.log('  manager@sportsstore.com/ Manager@123!   (manager)')
  console.log('  staff@sportsstore.com  / Staff@123!     (staff)')
  console.log('  inventory@sportsstore.com / Inventory@123! (inventory_staff)')
  console.log('  support@sportsstore.com / Support@123!  (support_staff)')
  console.log('  driver@sportsstore.com / Driver@123!    (driver)')
  console.log('  customer1@example.com  / Customer@123!  (customer)')
  console.log('  customer2@example.com  / Customer@123!  (customer)')
}

main().catch(err => {
  console.error('Seed failed:', err)
  process.exit(1)
})
