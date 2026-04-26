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
    // Running — indices 0–4 (0 and 1 used in sample orders)
    { name: 'Nike Air Max 270', brand: 'Nike', category: 'Running', subcategory: 'Running Shoes', price: 149.99, stock_quantity: 50, supplier_id: (supplier1 as any).id, color: 'Black/White', size: '10', description: 'Lightweight running shoe with Max Air cushioning.', image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop' },
    { name: 'Adidas Ultraboost 23', brand: 'Adidas', category: 'Running', subcategory: 'Running Shoes', price: 179.99, stock_quantity: 40, supplier_id: (supplier2 as any).id, color: 'Core Black', size: '10', description: 'Energy-returning Boost foam running shoe.', image_url: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=400&fit=crop' },
    { name: 'New Balance 990v5', brand: 'New Balance', category: 'Running', subcategory: 'Running Shoes', price: 174.99, stock_quantity: 25, color: 'Grey', size: '10.5', description: 'Made in USA premium running shoe.', image_url: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=400&fit=crop' },
    { name: 'Garmin Forerunner 255 GPS Watch', brand: 'Garmin', category: 'Running', subcategory: 'GPS Watches', price: 349.99, stock_quantity: 18, color: 'Black', description: 'Advanced running GPS watch with recovery insights.', image_url: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=400&h=400&fit=crop' },
    { name: 'Nike Dri-FIT Running Shorts', brand: 'Nike', category: 'Running', subcategory: 'Shorts', price: 39.99, stock_quantity: 75, supplier_id: (supplier1 as any).id, color: 'Black', size: 'M', description: 'Lightweight 5-inch running shorts with brief liner.', image_url: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=400&h=400&fit=crop' },

    // Fitness — index 5 used in sample order + review
    { name: 'Nike Dri-FIT Training T-Shirt', brand: 'Nike', category: 'Fitness', subcategory: 'T-Shirts', price: 34.99, stock_quantity: 100, supplier_id: (supplier1 as any).id, color: 'White', size: 'M', description: 'Moisture-wicking performance tee.', image_url: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop' },
    // Football — index 6 used in sample order
    { name: 'Adidas Tiro 23 Track Pants', brand: 'Adidas', category: 'Football', subcategory: 'Track Pants', price: 54.99, stock_quantity: 80, supplier_id: (supplier2 as any).id, color: 'Black', size: 'L', description: 'Classic soccer-inspired track pants.', image_url: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop' },
    { name: 'Under Armour HeatGear Compression Shorts', brand: 'Under Armour', category: 'Fitness', subcategory: 'Compression', price: 29.99, stock_quantity: 60, color: 'Black', size: 'M', description: 'Ultra-tight compression shorts for intense workouts.', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=400&fit=crop' },
    { name: 'Nike Pro Sports Bra', brand: 'Nike', category: 'Fitness', subcategory: 'Sports Bras', price: 39.99, stock_quantity: 70, supplier_id: (supplier1 as any).id, color: 'Pink', size: 'S', description: 'Medium-support sports bra with Dri-FIT fabric.', image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=400&fit=crop' },
    { name: 'Adidas Squad 21 Football Jersey', brand: 'Adidas', category: 'Football', subcategory: 'Jerseys', price: 44.99, stock_quantity: 55, supplier_id: (supplier2 as any).id, color: 'Red/White', size: 'L', description: 'Breathable replica soccer jersey.', image_url: 'https://images.unsplash.com/photo-1614632537197-38a17061c2bd?w=400&h=400&fit=crop' },
    { name: 'Wilson Federer Tennis Racket', brand: 'Wilson', category: 'Tennis', subcategory: 'Rackets', price: 89.99, stock_quantity: 20, description: 'Powerful all-round performance racket.', image_url: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop' },
    { name: 'Spalding NBA Official Basketball', brand: 'Spalding', category: 'Basketball', subcategory: 'Balls', price: 49.99, stock_quantity: 30, color: 'Orange', description: 'Official NBA indoor game ball.', image_url: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop' },
    { name: 'Bowflex SelectTech Dumbbells', brand: 'Bowflex', category: 'Fitness', subcategory: 'Weights', price: 249.99, stock_quantity: 15, description: 'Adjustable dumbbells 5–52.5 lbs per hand.', image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop' },
    { name: 'Nike Metcon 8', brand: 'Nike', category: 'Fitness', subcategory: 'Training Shoes', price: 129.99, stock_quantity: 35, supplier_id: (supplier1 as any).id, color: 'Blue/White', size: '11', description: 'Stable and versatile cross-training shoe.', image_url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=400&fit=crop' },
    { name: 'Under Armour HOVR Phantom', brand: 'Under Armour', category: 'Fitness', subcategory: 'Training Shoes', price: 129.99, stock_quantity: 30, color: 'White/Grey', size: '11', description: 'Zero-gravity feel connected training shoe.', image_url: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=400&h=400&fit=crop' },
    { name: 'Foam Roller Pro', brand: 'TriggerPoint', category: 'Fitness', subcategory: 'Recovery', price: 39.99, stock_quantity: 45, color: 'Black', description: 'Deep-tissue foam roller for muscle recovery.', image_url: 'https://images.unsplash.com/photo-1517963879433-6ad2a56b560d?w=400&h=400&fit=crop' },
    // Basketball — index 16 used in sample order
    { name: 'Nike Elite Basketball Socks', brand: 'Nike', category: 'Basketball', subcategory: 'Accessories', price: 19.99, stock_quantity: 150, supplier_id: (supplier1 as any).id, color: 'White', size: 'L', description: 'Cushioned high-performance basketball socks.', image_url: 'https://images.unsplash.com/photo-1574623452334-1e0ac2b3ccb4?w=400&h=400&fit=crop' },
    { name: 'Adidas Backpack Tiro', brand: 'Adidas', category: 'Hiking', subcategory: 'Backpacks', price: 49.99, stock_quantity: 40, supplier_id: (supplier2 as any).id, color: 'Black/White', description: 'Spacious 30L sports backpack.', image_url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=400&fit=crop' },
    { name: 'Resistance Bands Set', brand: 'Perform Better', category: 'Fitness', subcategory: 'Resistance', price: 24.99, stock_quantity: 60, description: 'Set of 5 resistance bands in various tensions.', image_url: 'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=400&h=400&fit=crop' },
    { name: 'Nike Swoosh Headband', brand: 'Nike', category: 'Fitness', subcategory: 'Accessories', price: 14.99, stock_quantity: 200, supplier_id: (supplier1 as any).id, color: 'Various', description: 'Moisture-wicking sports headband.', image_url: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&h=400&fit=crop' },
    { name: 'Speedo Fastskin LZR Swimsuit', brand: 'Speedo', category: 'Fitness', subcategory: 'Swimming', price: 199.99, stock_quantity: 12, color: 'Navy', size: 'M', description: 'Competition swimsuit with Fastskin technology.', image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=400&h=400&fit=crop' },

    // Football
    { name: 'Nike Phantom GT2 Football Boots', brand: 'Nike', category: 'Football', subcategory: 'Boots', price: 189.99, stock_quantity: 22, supplier_id: (supplier1 as any).id, color: 'Black/Volt', size: '10', description: 'Precision passing football boot with textured upper.', image_url: 'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=400&h=400&fit=crop' },
    { name: 'Adidas Predator Edge Football Boots', brand: 'Adidas', category: 'Football', subcategory: 'Boots', price: 229.99, stock_quantity: 15, supplier_id: (supplier2 as any).id, color: 'Core Black', size: '10', description: 'Total control football boot with Demonskin zones.', image_url: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop' },
    { name: 'Nike Strike Match Football', brand: 'Nike', category: 'Football', subcategory: 'Balls', price: 34.99, stock_quantity: 60, color: 'White/Black', description: 'Durable high-visibility match football.', image_url: 'https://images.unsplash.com/photo-1589487391730-58f20eb2c308?w=400&h=400&fit=crop' },
    { name: 'Adidas UCL Pro Match Ball', brand: 'Adidas', category: 'Football', subcategory: 'Balls', price: 159.99, stock_quantity: 10, color: 'White', description: 'UEFA Champions League official match ball.', image_url: 'https://images.unsplash.com/photo-1555697305-da93e5f7ea73?w=400&h=400&fit=crop' },
    { name: 'Nike Goalkeeper Gloves', brand: 'Nike', category: 'Football', subcategory: 'Gloves', price: 49.99, stock_quantity: 35, supplier_id: (supplier1 as any).id, color: 'Green/Black', size: '10', description: 'Match-ready goalkeeper gloves with grip palm.', image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&h=400&fit=crop' },

    // Tennis
    { name: 'Babolat Pure Drive Tennis Racket', brand: 'Babolat', category: 'Tennis', subcategory: 'Rackets', price: 219.99, stock_quantity: 12, description: 'Tour-level power racket used by top pros.', image_url: 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=400&h=400&fit=crop' },
    { name: 'Wilson US Open Tennis Balls', brand: 'Wilson', category: 'Tennis', subcategory: 'Balls', price: 14.99, stock_quantity: 150, color: 'Yellow', description: 'Official US Open extra-duty tennis balls, pack of 3.', image_url: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400&h=400&fit=crop' },
    { name: 'Nike Court Lite Tennis Shoes', brand: 'Nike', category: 'Tennis', subcategory: 'Shoes', price: 79.99, stock_quantity: 30, supplier_id: (supplier1 as any).id, color: 'White/Blue', size: '10', description: 'Durable cushioned shoes for all court surfaces.', image_url: 'https://images.unsplash.com/photo-1526888935184-a82d2a4b7e67?w=400&h=400&fit=crop' },
    { name: 'Head Tennis Bag Pro', brand: 'Head', category: 'Tennis', subcategory: 'Bags', price: 69.99, stock_quantity: 20, color: 'Black/Orange', description: 'Holds 9 rackets with separate shoe compartment.', image_url: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=400&h=400&fit=crop' },

    // Basketball
    { name: 'Nike Giannis Immortality 2', brand: 'Nike', category: 'Basketball', subcategory: 'Shoes', price: 89.99, stock_quantity: 25, supplier_id: (supplier1 as any).id, color: 'White/Green', size: '11', description: 'Responsive cushioned basketball performance shoe.', image_url: 'https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=400&h=400&fit=crop' },
    { name: 'Nike Dri-FIT Basketball Jersey', brand: 'Nike', category: 'Basketball', subcategory: 'Jerseys', price: 74.99, stock_quantity: 40, supplier_id: (supplier1 as any).id, color: 'Red', size: 'XL', description: 'NBA-style performance game jersey.', image_url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=400&fit=crop' },
    { name: 'Adidas NBA Swingman Shorts', brand: 'Adidas', category: 'Basketball', subcategory: 'Shorts', price: 44.99, stock_quantity: 55, supplier_id: (supplier2 as any).id, color: 'Black', size: 'L', description: 'Authentic NBA Swingman basketball shorts.', image_url: 'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=400&h=400&fit=crop' },

    // Cycling
    { name: 'Giro Syntax MIPS Cycling Helmet', brand: 'Giro', category: 'Cycling', subcategory: 'Helmets', price: 129.99, stock_quantity: 20, color: 'Matte Black', description: 'Aerodynamic road cycling helmet with MIPS protection.', image_url: 'https://images.unsplash.com/photo-1557803175-b1f5f00c3f49?w=400&h=400&fit=crop' },
    { name: 'Castelli Aero Race Cycling Jersey', brand: 'Castelli', category: 'Cycling', subcategory: 'Jerseys', price: 99.99, stock_quantity: 25, color: 'Black/Red', size: 'M', description: 'Ultra-aero fit road cycling jersey with back pockets.', image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop' },
    { name: 'Shimano SPD-SL Road Cycling Shoes', brand: 'Shimano', category: 'Cycling', subcategory: 'Shoes', price: 149.99, stock_quantity: 15, color: 'White', size: '43', description: 'Carbon-reinforced sole road cycling shoes.', image_url: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=400&h=400&fit=crop' },
    { name: 'Garmin Edge 540 Cycling Computer', brand: 'Garmin', category: 'Cycling', subcategory: 'Electronics', price: 349.99, stock_quantity: 10, description: 'Advanced GPS cycling computer with ClimbPro navigation.', image_url: 'https://images.unsplash.com/photo-1623278934659-6a60c6df4b99?w=400&h=400&fit=crop' },
    { name: 'Pearl Izumi Cycling Bib Shorts', brand: 'Pearl Izumi', category: 'Cycling', subcategory: 'Shorts', price: 119.99, stock_quantity: 18, color: 'Black', size: 'M', description: 'High-performance 3D chamois road cycling bib shorts.', image_url: 'https://images.unsplash.com/photo-1544191696-102dbdaeeaa0?w=400&h=400&fit=crop' },

    // Hiking
    { name: 'Salomon X Ultra 4 GTX Hiking Boots', brand: 'Salomon', category: 'Hiking', subcategory: 'Boots', price: 169.99, stock_quantity: 22, color: 'Olive Green', size: '10', description: 'Waterproof trail hiking boot with Contagrip sole.', image_url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop' },
    { name: 'Osprey Atmos 65 Backpack', brand: 'Osprey', category: 'Hiking', subcategory: 'Backpacks', price: 259.99, stock_quantity: 12, color: 'Abyss Grey', description: '65L anti-gravity ventilated hiking backpack.', image_url: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=400&fit=crop' },
    { name: 'Columbia Titanium Softshell Jacket', brand: 'Columbia', category: 'Hiking', subcategory: 'Jackets', price: 179.99, stock_quantity: 18, color: 'Deep Blue', size: 'L', description: 'Windproof stretch softshell hiking jacket.', image_url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=400&fit=crop' },
    { name: 'Black Diamond Trail Trekking Poles', brand: 'Black Diamond', category: 'Hiking', subcategory: 'Poles', price: 79.99, stock_quantity: 30, color: 'Silver', description: 'Lightweight adjustable aluminum trekking poles, pair.', image_url: 'https://images.unsplash.com/photo-1524222928538-455da765b0e4?w=400&h=400&fit=crop' },

    // Yoga
    { name: 'Manduka PRO Yoga Mat', brand: 'Manduka', category: 'Yoga', subcategory: 'Mats', price: 119.99, stock_quantity: 35, color: 'Midnight', description: '6mm ultra-dense yoga mat with lifetime guarantee.', image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop' },
    { name: 'Lululemon Align Leggings', brand: 'Lululemon', category: 'Yoga', subcategory: 'Leggings', price: 98.00, stock_quantity: 50, color: 'Black', size: 'M', description: 'Ultra-soft Nulu fabric 25-inch yoga leggings.', image_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop' },
    { name: 'Nike Yoga Dri-FIT Tank Top', brand: 'Nike', category: 'Yoga', subcategory: 'Tops', price: 44.99, stock_quantity: 65, supplier_id: (supplier1 as any).id, color: 'White', size: 'S', description: 'Lightweight Dri-FIT tank for yoga and pilates.', image_url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=400&h=400&fit=crop' },
    { name: 'Gaiam Yoga Blocks Set', brand: 'Gaiam', category: 'Yoga', subcategory: 'Accessories', price: 19.99, stock_quantity: 80, color: 'Purple', description: 'Set of 2 foam yoga blocks for support and balance.', image_url: 'https://images.unsplash.com/photo-1593164842264-854604db2260?w=400&h=400&fit=crop' },
    { name: 'Alo Yoga Warrior Crop Top', brand: 'Alo', category: 'Yoga', subcategory: 'Tops', price: 52.00, stock_quantity: 45, color: 'Lavender', size: 'S', description: 'Ribbed crop top with open back, perfect for hot yoga.', image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=400&h=400&fit=crop' },
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
