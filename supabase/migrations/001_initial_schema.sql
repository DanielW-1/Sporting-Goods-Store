-- =============================================================
-- Sports Goods Store — Complete Database Schema
-- Single deployment file
-- Run once in Supabase SQL Editor
-- =============================================================
 
 
-- =============================================================
-- EXTENSIONS
-- =============================================================
 
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 
 
-- =============================================================
-- SECTION 1: CORE TABLES
-- =============================================================
 
CREATE TABLE suppliers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  phone        TEXT,
  email        TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive'))
);
 
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON suppliers FOR ALL USING (true) WITH CHECK (true);
 
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
  salary          NUMERIC(10,2),
  hire_date       DATE,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);
 
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profiles FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id         UUID REFERENCES suppliers(id),
  name                TEXT NOT NULL,
  brand               TEXT,
  description         TEXT,
  category            TEXT NOT NULL,
  subcategory         TEXT,
  price               NUMERIC(10,2) NOT NULL,
  size                TEXT,
  color               TEXT,
  stock_quantity      INTEGER NOT NULL DEFAULT 0,
  low_stock_threshold INTEGER DEFAULT 10,
  is_active           BOOLEAN DEFAULT true,
  release_date        DATE DEFAULT CURRENT_DATE,
  image_url           TEXT,
  created_at          TIMESTAMPTZ DEFAULT now()
);
 
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
 
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
CREATE TABLE sponsored_products (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL REFERENCES sponsors(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE
);
 
ALTER TABLE sponsored_products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON sponsored_products FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE stock (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id         UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  supplier_id        UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity_available INTEGER NOT NULL DEFAULT 0 CHECK (quantity_available >= 0),
  reorder_level      INTEGER NOT NULL DEFAULT 10,
  reorder_quantity   INTEGER NOT NULL DEFAULT 50,
  warehouse_location TEXT,
  stock_status       TEXT NOT NULL DEFAULT 'in_stock'
                       CHECK (stock_status IN ('in_stock','low_stock','out_of_stock')),
  batch_number       TEXT,
  expiry_date        DATE,
  last_updated       TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);
 
ALTER TABLE stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON stock FOR ALL USING (true) WITH CHECK (true);
 
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
  shipping_address       TEXT,
  notes                  TEXT
);
 
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON orders FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE order_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id            UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id          UUID REFERENCES products(id),
  quantity            INTEGER NOT NULL,
  price_at_purchase   NUMERIC(10,2) NOT NULL,
  discount_applied    NUMERIC(5,2) DEFAULT 0,
  refund_status       TEXT DEFAULT 'none'
                        CHECK (refund_status IN ('none','requested','refunded','replaced')),
  refund_requested_at TIMESTAMPTZ,
  refund_processed_at TIMESTAMPTZ
);
 
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON order_items FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  rating      INTEGER NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comment     TEXT,
  review_date TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id, customer_id)
);
 
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON reviews FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE rewards_log (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id           UUID REFERENCES profiles(id),
  order_id              UUID REFERENCES orders(id),
  points_earned         INTEGER DEFAULT 0,
  discount_points_earned INTEGER DEFAULT 0,
  points_used           INTEGER DEFAULT 0,
  transaction_date      TIMESTAMPTZ DEFAULT now()
);
 
ALTER TABLE rewards_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON rewards_log FOR ALL USING (true) WITH CHECK (true);
 
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
CREATE TABLE staff_attendance (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id  UUID REFERENCES profiles(id),
  clock_in  TIMESTAMPTZ NOT NULL,
  clock_out TIMESTAMPTZ,
  date      DATE DEFAULT CURRENT_DATE
);
 
ALTER TABLE staff_attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON staff_attendance FOR ALL USING (true) WITH CHECK (true);
 
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
CREATE TABLE driver_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  latitude    NUMERIC(10,7) NOT NULL,
  longitude   NUMERIC(10,7) NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);
 
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON driver_locations FOR ALL USING (true) WITH CHECK (true);
 
-- -------------------------
CREATE TABLE profits (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month         DATE NOT NULL UNIQUE,
  stock_cost    NUMERIC(12,2) DEFAULT 0,
  stock_revenue NUMERIC(12,2) DEFAULT 0,
  stock_loss    NUMERIC(12,2) DEFAULT 0,
  gross_profit  NUMERIC(12,2) GENERATED ALWAYS AS (stock_revenue - stock_cost) STORED,
  net_profit    NUMERIC(12,2) GENERATED ALWAYS AS (stock_revenue - stock_cost - stock_loss) STORED
);
 
ALTER TABLE profits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON profits FOR ALL USING (true) WITH CHECK (true);
 
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
 
 
-- =============================================================
-- SECTION 2: PERFORMANCE INDEXES
-- =============================================================
 
CREATE INDEX idx_products_category     ON products(category);
CREATE INDEX idx_products_brand        ON products(brand);
CREATE INDEX idx_products_is_active    ON products(is_active);
CREATE INDEX idx_products_price        ON products(price);
CREATE INDEX idx_orders_customer       ON orders(customer_id);
CREATE INDEX idx_orders_status         ON orders(status);
CREATE INDEX idx_order_items_order     ON order_items(order_id);
CREATE INDEX idx_order_items_product   ON order_items(product_id);
CREATE INDEX idx_cart_items_user       ON cart_items(user_id);
CREATE INDEX idx_reviews_product       ON reviews(product_id);
CREATE INDEX idx_reviews_customer      ON reviews(customer_id);
CREATE INDEX idx_stock_product         ON stock(product_id);
CREATE INDEX idx_stock_status          ON stock(stock_status);
CREATE INDEX idx_discounts_product     ON discounts(product_id);
CREATE INDEX idx_discounts_dates       ON discounts(start_date, end_date);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_driver_locations_driver ON driver_locations(driver_id);
CREATE INDEX idx_staff_attendance_staff  ON staff_attendance(staff_id);
CREATE INDEX idx_staff_attendance_date   ON staff_attendance(date);
 
 
-- =============================================================
-- SECTION 3: FUNCTIONS & TRIGGERS
-- =============================================================
 
-- 1. handle_new_user — auto-create profile on registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name',  ''),
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
 
-- -------------------------
-- 2. update_stock_after_order — decrement stock on order placement
CREATE OR REPLACE FUNCTION update_stock_after_order(p_order_id UUID)
RETURNS VOID AS $$
DECLARE
  item RECORD;
BEGIN
  FOR item IN
    SELECT product_id, quantity FROM order_items WHERE order_id = p_order_id
  LOOP
    IF (SELECT stock_quantity FROM products WHERE id = item.product_id) < item.quantity THEN
      RAISE EXCEPTION 'Insufficient stock for product %', item.product_id;
    END IF;
    UPDATE products
      SET stock_quantity = stock_quantity - item.quantity
    WHERE id = item.product_id;
    UPDATE stock
      SET quantity_available = quantity_available - item.quantity
    WHERE product_id = item.product_id
      AND quantity_available >= item.quantity;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 
-- -------------------------
-- 3. calculate_points — award reward and discount points after payment
CREATE OR REPLACE FUNCTION calculate_points(
  p_order_id    UUID,
  p_customer_id UUID,
  p_amount_paid NUMERIC
)
RETURNS VOID AS $$
DECLARE
  v_reward_rate         INTEGER;
  v_discount_rate       INTEGER;
  v_reward_points       INTEGER;
  v_discount_points     INTEGER;
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
 
  INSERT INTO rewards_log (customer_id, order_id, points_earned, discount_points_earned)
  VALUES (p_customer_id, p_order_id, v_reward_points, v_discount_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
 
-- -------------------------
-- 4. fn_update_stock_status — auto-set stock_status on stock table changes
CREATE OR REPLACE FUNCTION fn_update_stock_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.quantity_available = 0 THEN
    NEW.stock_status := 'out_of_stock';
  ELSIF NEW.quantity_available <= NEW.reorder_level THEN
    NEW.stock_status := 'low_stock';
  ELSE
    NEW.stock_status := 'in_stock';
  END IF;
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_update_stock_status
  BEFORE INSERT OR UPDATE ON stock
  FOR EACH ROW EXECUTE FUNCTION fn_update_stock_status();
 
-- -------------------------
-- 5. fn_sync_product_stock — keep products.stock_quantity in sync with stock table
CREATE OR REPLACE FUNCTION fn_sync_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
    SET stock_quantity = NEW.quantity_available
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_sync_product_stock
  AFTER INSERT OR UPDATE OF quantity_available ON stock
  FOR EACH ROW EXECUTE FUNCTION fn_sync_product_stock();
 
-- -------------------------
-- 6. fn_block_cancel_after_shipment — prevent cancellation after shipping
CREATE OR REPLACE FUNCTION fn_block_cancel_after_shipment()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'cancelled'
    AND OLD.status IN ('shipped','delivered') THEN
    RAISE EXCEPTION
      'Cannot cancel order %. It has already been %.', OLD.id, OLD.status;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_block_cancel_after_shipment
  BEFORE UPDATE OF status ON orders
  FOR EACH ROW EXECUTE FUNCTION fn_block_cancel_after_shipment();
 
-- -------------------------
-- 7. fn_block_duplicate_refund — prevent refunding the same item twice
CREATE OR REPLACE FUNCTION fn_block_duplicate_refund()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.refund_status IN ('requested','refunded','replaced')
    AND OLD.refund_status IN ('refunded','replaced') THEN
    RAISE EXCEPTION 'Item % has already been refunded or replaced.', OLD.id;
  END IF;
  IF NEW.refund_status = 'requested' AND OLD.refund_status = 'none' THEN
    NEW.refund_requested_at := now();
  END IF;
  IF NEW.refund_status IN ('refunded','replaced') THEN
    NEW.refund_processed_at := now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_block_duplicate_refund
  BEFORE UPDATE OF refund_status ON order_items
  FOR EACH ROW EXECUTE FUNCTION fn_block_duplicate_refund();
 
-- -------------------------
-- 8. fn_enforce_refund_window — block refunds outside the policy window
CREATE OR REPLACE FUNCTION fn_enforce_refund_window()
RETURNS TRIGGER AS $$
DECLARE
  v_order_date   TIMESTAMPTZ;
  v_window_days  INTEGER;
  v_order_status TEXT;
BEGIN
  IF NEW.refund_status = 'requested' AND OLD.refund_status = 'none' THEN
    SELECT o.order_date, o.status
      INTO v_order_date, v_order_status
    FROM orders o WHERE o.id = NEW.order_id;
 
    IF v_order_status != 'delivered' THEN
      RAISE EXCEPTION 'Cannot request refund — order has not been delivered yet.';
    END IF;
 
    SELECT COALESCE(value::INTEGER, 30)
      INTO v_window_days
    FROM store_policies WHERE key = 'refund_window_days';
 
    IF now() > v_order_date + (v_window_days || ' days')::INTERVAL THEN
      RAISE EXCEPTION 'Refund window of % days has expired for this item.', v_window_days;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_enforce_refund_window
  BEFORE UPDATE OF refund_status ON order_items
  FOR EACH ROW EXECUTE FUNCTION fn_enforce_refund_window();
 
-- -------------------------
-- 9. fn_update_monthly_profit — auto-update profits table after each paid order
CREATE OR REPLACE FUNCTION fn_update_monthly_profit()
RETURNS TRIGGER AS $$
DECLARE
  v_month DATE;
BEGIN
  v_month := DATE_TRUNC('month', NEW.order_date)::DATE;
  INSERT INTO profits (month, stock_revenue)
  VALUES (v_month, NEW.total_amount)
  ON CONFLICT (month)
  DO UPDATE SET stock_revenue = profits.stock_revenue + EXCLUDED.stock_revenue;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
 
CREATE OR REPLACE TRIGGER trg_update_monthly_profit
  AFTER INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.payment_status = 'paid')
  EXECUTE FUNCTION fn_update_monthly_profit();
 
 
-- =============================================================
-- SECTION 4: VIEWS
-- =============================================================
 
CREATE OR REPLACE VIEW vw_product_catalog AS
SELECT
  p.id                                                        AS product_id,
  p.name,
  p.brand,
  p.category,
  p.subcategory,
  p.description,
  p.price,
  p.size,
  p.color,
  p.stock_quantity,
  p.is_active,
  p.release_date,
  p.image_url,
  p.low_stock_threshold,
  d.percentage                                                AS discount_percentage,
  d.end_date                                                  AS discount_ends,
  ROUND(p.price * (1 - COALESCE(d.percentage,0)/100), 2)    AS final_price,
  ROUND(AVG(r.rating)::NUMERIC, 2)                           AS avg_rating,
  COUNT(r.id)                                                 AS review_count,
  s.company_name                                              AS supplier_name,
  COALESCE(st.quantity_available, p.stock_quantity)          AS quantity_available,
  COALESCE(st.stock_status,
    CASE
      WHEN p.stock_quantity = 0                      THEN 'out_of_stock'
      WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
      ELSE 'in_stock'
    END)                                                      AS stock_status,
  st.warehouse_location,
  st.reorder_level
FROM products p
LEFT JOIN discounts  d  ON d.product_id = p.id
                        AND d.start_date <= CURRENT_DATE
                        AND d.end_date   >= CURRENT_DATE
LEFT JOIN reviews    r  ON r.product_id  = p.id
LEFT JOIN suppliers  s  ON s.id          = p.supplier_id
LEFT JOIN stock      st ON st.product_id = p.id
GROUP BY p.id, d.percentage, d.end_date, s.company_name,
         st.quantity_available, st.stock_status,
         st.warehouse_location, st.reorder_level;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_active_sponsored AS
SELECT
  p.id            AS product_id,
  p.name,
  p.brand,
  p.price,
  p.category,
  p.image_url,
  p.stock_quantity,
  sp.company_name AS sponsor_name,
  sp.end_date     AS sponsorship_ends,
  ROUND(AVG(r.rating)::NUMERIC, 2) AS avg_rating
FROM products        p
JOIN sponsored_products spd ON spd.product_id = p.id
JOIN sponsors           sp  ON sp.id          = spd.sponsor_id
LEFT JOIN reviews       r   ON r.product_id   = p.id
WHERE sp.is_active   = true
  AND sp.start_date <= CURRENT_DATE
  AND sp.end_date   >= CURRENT_DATE
  AND p.is_active    = true
  AND p.stock_quantity > 0
GROUP BY p.id, sp.company_name, sp.end_date
ORDER BY sp.end_date ASC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_customer_dashboard AS
SELECT
  pr.id                                                       AS customer_id,
  pr.first_name || ' ' || pr.last_name                      AS full_name,
  pr.email,
  pr.phone,
  pr.address,
  pr.reward_points,
  pr.discount_points,
  pr.created_at                                               AS join_date,
  COUNT(DISTINCT o.id)                                        AS total_orders,
  COALESCE(SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid'), 0) AS total_spent,
  MAX(o.order_date)                                           AS last_order_date
FROM profiles pr
LEFT JOIN orders o ON o.customer_id = pr.id
WHERE pr.role = 'customer'
GROUP BY pr.id;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_order_tracking AS
SELECT
  o.id                                                        AS order_id,
  o.tracking_number,
  o.status                                                    AS order_status,
  o.order_date,
  o.expected_delivery_date,
  o.shipping_address,
  o.payment_method,
  o.payment_status,
  o.total_amount,
  o.customer_id,
  pr.first_name || ' ' || pr.last_name                      AS customer_name,
  pr.email                                                    AS customer_email,
  dr.first_name || ' ' || dr.last_name                      AS driver_name,
  dr.phone                                                    AS driver_phone,
  COUNT(oi.id)                                                AS total_items
FROM orders      o
JOIN profiles    pr ON pr.id      = o.customer_id
LEFT JOIN profiles dr ON dr.id   = o.driver_id
LEFT JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, pr.first_name, pr.last_name, pr.email,
         dr.first_name, dr.last_name, dr.phone;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_low_stock_alerts AS
SELECT
  p.id                                                        AS product_id,
  p.name                                                      AS product_name,
  p.brand,
  p.category,
  p.stock_quantity,
  p.low_stock_threshold,
  COALESCE(st.quantity_available, p.stock_quantity)          AS quantity_available,
  COALESCE(st.stock_status,
    CASE
      WHEN p.stock_quantity = 0                      THEN 'out_of_stock'
      WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
      ELSE 'in_stock'
    END)                                                      AS stock_status,
  st.reorder_level,
  st.reorder_quantity,
  st.warehouse_location,
  s.company_name  AS supplier_name,
  s.email         AS supplier_email,
  s.phone         AS supplier_phone
FROM products    p
LEFT JOIN stock     st ON st.product_id = p.id
LEFT JOIN suppliers s  ON s.id = COALESCE(st.supplier_id, p.supplier_id)
WHERE p.is_active = true
  AND (
    p.stock_quantity <= p.low_stock_threshold
    OR COALESCE(st.stock_status,'') IN ('low_stock','out_of_stock')
  )
ORDER BY p.stock_quantity ASC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_manager_analytics AS
SELECT
  DATE_TRUNC('month', o.order_date)                          AS month,
  COUNT(DISTINCT o.id)                                        AS total_transactions,
  COUNT(DISTINCT o.customer_id)                               AS unique_customers,
  SUM(o.total_amount) FILTER (WHERE o.payment_status = 'paid')     AS total_revenue,
  AVG(o.total_amount) FILTER (WHERE o.payment_status = 'paid')     AS avg_order_value,
  SUM(o.total_amount) FILTER (WHERE o.payment_status = 'refunded') AS total_refunded
FROM orders o
GROUP BY DATE_TRUNC('month', o.order_date)
ORDER BY month DESC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_refund_eligible_items AS
SELECT
  oi.id                                                       AS order_item_id,
  oi.order_id,
  oi.product_id,
  p.name                                                      AS product_name,
  oi.quantity,
  oi.price_at_purchase,
  oi.refund_status,
  o.status                                                    AS order_status,
  o.order_date,
  o.customer_id,
  pr.first_name || ' ' || pr.last_name                      AS customer_name,
  (o.order_date + (
    COALESCE((SELECT value::INT FROM store_policies WHERE key = 'refund_window_days'), 30)
    || ' days')::INTERVAL)::DATE                             AS refund_deadline,
  CASE
    WHEN oi.refund_status != 'none'  THEN false
    WHEN o.status != 'delivered'     THEN false
    WHEN now() > o.order_date + (
      COALESCE((SELECT value::INT FROM store_policies WHERE key = 'refund_window_days'), 30)
      || ' days')::INTERVAL          THEN false
    ELSE true
  END                                                         AS is_eligible
FROM order_items oi
JOIN orders   o  ON o.id  = oi.order_id
JOIN products p  ON p.id  = oi.product_id
JOIN profiles pr ON pr.id = o.customer_id;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_staff_attendance AS
SELECT
  sa.id,
  sa.staff_id,
  pr.first_name || ' ' || pr.last_name                      AS staff_name,
  pr.role,
  sa.date                                                     AS shift_date,
  sa.clock_in,
  sa.clock_out,
  CASE
    WHEN sa.clock_out IS NOT NULL
    THEN ROUND(EXTRACT(EPOCH FROM (sa.clock_out - sa.clock_in)) / 3600, 2)
    ELSE NULL
  END                                                         AS hours_worked
FROM staff_attendance sa
JOIN profiles pr ON pr.id = sa.staff_id
ORDER BY sa.date DESC, sa.clock_in DESC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_salary_report AS
SELECT
  pr.id                                                       AS staff_id,
  pr.first_name || ' ' || pr.last_name                      AS full_name,
  pr.role,
  pr.salary,
  pr.hire_date,
  pr.is_active,
  ROUND(AVG(
    CASE WHEN sa.clock_out IS NOT NULL
    THEN EXTRACT(EPOCH FROM (sa.clock_out - sa.clock_in)) / 3600
    END
  )::NUMERIC, 2)                                              AS avg_hours_per_shift
FROM profiles pr
LEFT JOIN staff_attendance sa ON sa.staff_id = pr.id
WHERE pr.role != 'customer'
GROUP BY pr.id
ORDER BY pr.role, pr.first_name;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_top_products AS
SELECT
  p.id            AS product_id,
  p.name,
  p.category,
  p.brand,
  p.price,
  p.image_url,
  p.release_date,
  p.stock_quantity,
  COUNT(oi.id)                           AS total_sales,
  ROUND(AVG(r.rating)::NUMERIC, 2)      AS avg_rating,
  CASE
    WHEN p.stock_quantity = 0                      THEN 'out_of_stock'
    WHEN p.stock_quantity <= p.low_stock_threshold THEN 'low_stock'
    ELSE 'in_stock'
  END                                    AS stock_status
FROM products    p
LEFT JOIN order_items oi ON oi.product_id = p.id
LEFT JOIN reviews      r  ON r.product_id  = p.id
WHERE p.is_active = true
GROUP BY p.id
ORDER BY total_sales DESC, avg_rating DESC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_support_dashboard AS
SELECT
  t.id                                                        AS ticket_id,
  t.subject,
  t.status,
  t.created_at,
  t.updated_at,
  c.first_name || ' ' || c.last_name                        AS customer_name,
  c.email                                                     AS customer_email,
  s.first_name || ' ' || s.last_name                        AS assigned_staff,
  ROUND(
    EXTRACT(EPOCH FROM (COALESCE(t.updated_at, now()) - t.created_at)) / 3600,
  1)                                                          AS hours_open
FROM support_tickets t
JOIN profiles c ON c.id = t.customer_id
LEFT JOIN profiles s ON s.id = t.assigned_to
ORDER BY t.created_at DESC;
 
-- -------------------------
CREATE OR REPLACE VIEW vw_recommendation_inputs AS
SELECT
  o.customer_id,
  p.id            AS product_id,
  p.name          AS product_name,
  p.category,
  p.brand,
  p.release_date,
  COUNT(oi.id)                                               AS times_purchased,
  ROUND(AVG(r.rating)::NUMERIC, 2)                          AS customer_rating,
  SUM(COUNT(oi.id)) OVER (PARTITION BY p.id)                AS global_purchase_count,
  RANK() OVER (
    PARTITION BY o.customer_id
    ORDER BY COUNT(oi.id) DESC
  )                                                          AS purchase_rank
FROM orders      o
JOIN order_items oi ON oi.order_id   = o.id
JOIN products    p  ON p.id          = oi.product_id
LEFT JOIN reviews r ON r.product_id  = p.id
                   AND r.customer_id = o.customer_id
WHERE o.status = 'delivered'
GROUP BY o.customer_id, p.id, p.name, p.category, p.brand, p.release_date;
 
 
-- =============================================================
-- SECTION 5: SEED DATA
-- =============================================================
 
INSERT INTO store_policies (key, value) VALUES
  ('refund_window_days',          '30'),
  ('reward_points_per_dollar',    '1'),
  ('discount_points_per_dollar',  '2'),
  ('discount_points_value_cents', '1'),
  ('reward_points_value_cents',   '1'),
  ('min_order_for_free_shipping', '100'),
  ('shipping_fee_cents',          '999'),
  ('max_cart_quantity_per_item',  '10'),
  ('review_requires_purchase',    'true'),
  ('points_expiry_days',          '365')
ON CONFLICT (key) DO NOTHING;
