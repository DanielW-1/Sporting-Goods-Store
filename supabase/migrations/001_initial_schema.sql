-- =============================================================
-- 001_initial_schema.sql
-- Sports Goods Store — initial database schema
-- =============================================================

-- -------------------------
-- Enable extensions
-- -------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -------------------------
-- SUPPLIERS (referenced by products)
-- -------------------------
CREATE TABLE suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive'))
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON suppliers FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- PROFILES (extends auth.users)
-- -------------------------
CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  email           TEXT UNIQUE NOT NULL,
  phone           TEXT,
  address         TEXT,
  gender          TEXT,
  date_of_birth   DATE,
  role            TEXT NOT NULL DEFAULT 'customer'
                    CHECK (role IN ('customer','staff','inventory_staff','support_staff','driver','manager','admin')),
  reward_points   INTEGER DEFAULT 0,
  discount_points INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- PRODUCTS
-- -------------------------
CREATE TABLE products (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id    UUID REFERENCES suppliers(id),
  name           TEXT NOT NULL,
  brand          TEXT,
  description    TEXT,
  category       TEXT NOT NULL,
  subcategory    TEXT,
  price          NUMERIC(10,2) NOT NULL,
  size           TEXT,
  color          TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_active      BOOLEAN DEFAULT true,
  release_date   DATE DEFAULT CURRENT_DATE,
  image_url      TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- DISCOUNTS
-- -------------------------
CREATE TABLE discounts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  percentage NUMERIC(5,2) NOT NULL,
  start_date DATE NOT NULL,
  end_date   DATE NOT NULL,
  category   TEXT,
  created_by UUID REFERENCES profiles(id)
);

ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON discounts FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- SUPPLIER_PRODUCTS
-- -------------------------
CREATE TABLE supplier_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  product_id  UUID REFERENCES products(id),
  supply_date DATE,
  quantity    INTEGER,
  cost        NUMERIC(10,2),
  status      TEXT DEFAULT 'active'
);

ALTER TABLE supplier_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON supplier_products FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- SPONSORS
-- -------------------------
CREATE TABLE sponsors (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_active    BOOLEAN DEFAULT true
);

ALTER TABLE sponsors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sponsors FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- SPONSORED_PRODUCTS
-- -------------------------
CREATE TABLE sponsored_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
);

ALTER TABLE sponsored_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sponsored_products FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- CART_ITEMS
-- -------------------------
CREATE TABLE cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity   INTEGER NOT NULL DEFAULT 1,
  added_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON cart_items FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- ORDERS
-- -------------------------
CREATE TABLE orders (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id            UUID REFERENCES profiles(id),
  driver_id              UUID REFERENCES profiles(id),
  order_date             TIMESTAMPTZ DEFAULT now(),
  status                 TEXT NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
  expected_delivery_date DATE,
  tracking_number        TEXT UNIQUE,
  payment_method         TEXT NOT NULL
                           CHECK (payment_method IN ('credit_card','debit_card','cash_on_delivery')),
  payment_status         TEXT DEFAULT 'pending'
                           CHECK (payment_status IN ('pending','paid','refunded')),
  total_amount           NUMERIC(10,2) NOT NULL,
  shipping_address       TEXT
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- ORDER_ITEMS
-- -------------------------
CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id),
  quantity          INTEGER NOT NULL,
  price_at_purchase NUMERIC(10,2) NOT NULL,
  refund_status     TEXT DEFAULT 'none'
                      CHECK (refund_status IN ('none','requested','refunded','replaced'))
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- REVIEWS
-- -------------------------
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating      INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment     TEXT,
  review_date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, customer_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- REWARDS_LOG
-- -------------------------
CREATE TABLE rewards_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id      UUID REFERENCES profiles(id),
  order_id         UUID REFERENCES orders(id),
  points_earned    INTEGER DEFAULT 0,
  points_used      INTEGER DEFAULT 0,
  transaction_date TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rewards_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON rewards_log FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- SUPPORT_TICKETS
-- -------------------------
CREATE TABLE support_tickets (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  subject     TEXT NOT NULL,
  status      TEXT DEFAULT 'open'
                CHECK (status IN ('open','in_progress','resolved','closed')),
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON support_tickets FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- CHAT_MESSAGES
-- -------------------------
CREATE TABLE chat_messages (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id  UUID REFERENCES profiles(id),
  message    TEXT NOT NULL,
  is_bot     BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- STAFF_ATTENDANCE
-- -------------------------
CREATE TABLE staff_attendance (
  id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID REFERENCES profiles(id),
  clock_in TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  date     DATE DEFAULT CURRENT_DATE
);

ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON staff_attendance FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- STAFF_SCHEDULES
-- -------------------------
CREATE TABLE staff_schedules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id    UUID REFERENCES profiles(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time  TIME NOT NULL,
  end_time    TIME NOT NULL
);

ALTER TABLE staff_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON staff_schedules FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- STORE_POLICIES
-- -------------------------
CREATE TABLE store_policies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key        TEXT UNIQUE NOT NULL,
  value      TEXT NOT NULL,
  updated_by UUID REFERENCES profiles(id),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE store_policies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON store_policies FOR ALL USING (true) WITH CHECK (true);

-- -------------------------
-- Seed default store policies
-- -------------------------
INSERT INTO store_policies (key, value) VALUES
  ('refund_window_days',          '30'),
  ('reward_points_per_dollar',    '1'),
  ('discount_points_per_dollar',  '2'),
  ('discount_points_value_cents', '1'),
  ('reward_points_value_cents',   '1');

-- =====================================================================
-- TRIGGERS & FUNCTIONS
-- =====================================================================

-- 1. handle_new_user — auto-create profiles row on auth.users INSERT
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email,
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 2. update_stock_after_order — decrement stock for each order item
CREATE OR REPLACE FUNCTION update_stock_after_order(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    -- Check sufficient stock
    IF (SELECT stock_quantity FROM products WHERE id = item.product_id) < item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item.product_id;
    END IF;
    UPDATE products
    SET stock_quantity = stock_quantity - item.quantity
    WHERE id = item.product_id;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. calculate_points — award reward + discount points after order completion
CREATE OR REPLACE FUNCTION calculate_points(p_order_id UUID, p_customer_id UUID, p_amount_paid NUMERIC)
RETURNS VOID AS $$
DECLARE
  v_reward_rate    INTEGER;
  v_discount_rate  INTEGER;
  v_reward_points  INTEGER;
  v_discount_points INTEGER;
BEGIN
  SELECT COALESCE(value::INTEGER, 1) INTO v_reward_rate
  FROM store_policies WHERE key = 'reward_points_per_dollar';

  SELECT COALESCE(value::INTEGER, 2) INTO v_discount_rate
  FROM store_policies WHERE key = 'discount_points_per_dollar';

  v_reward_points   := FLOOR(p_amount_paid * v_reward_rate);
  v_discount_points := FLOOR(p_amount_paid * v_discount_rate);

  UPDATE profiles
  SET reward_points   = reward_points   + v_reward_points,
      discount_points = discount_points + v_discount_points
  WHERE id = p_customer_id;

  INSERT INTO rewards_log (customer_id, order_id, points_earned)
  VALUES (p_customer_id, p_order_id, v_reward_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
