-- Crust & Cheese Pizza Café SQLite Production Schema

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  pin_hash TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'cashier', -- 'admin', 'manager', 'cashier'
  avatar TEXT,
  shift_name TEXT,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shifts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  opening_float REAL NOT NULL DEFAULT 0,
  closing_cash_counted REAL,
  expected_cash REAL DEFAULT 0,
  cash_variance REAL DEFAULT 0,
  card_sales REAL DEFAULT 0,
  digital_sales REAL DEFAULT 0,
  total_sales REAL DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL,
  name TEXT NOT NULL,
  price REAL NOT NULL,
  cost REAL DEFAULT 0,
  description TEXT,
  image TEXT,
  available INTEGER DEFAULT 1,
  prep_time TEXT,
  badge TEXT,
  is_customizable INTEGER DEFAULT 0,
  sizes_json TEXT,
  crusts_json TEXT,
  toppings_json TEXT,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE IF NOT EXISTS inventory (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  current_stock REAL NOT NULL,
  unit TEXT NOT NULL,
  min_stock REAL NOT NULL,
  supplier TEXT,
  cost_per_unit REAL DEFAULT 0,
  status TEXT DEFAULT 'In Stock',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_logs (
  id TEXT PRIMARY KEY,
  inventory_id TEXT NOT NULL,
  ingredient_name TEXT NOT NULL,
  change_qty REAL NOT NULL,
  remaining_stock REAL NOT NULL,
  reason TEXT NOT NULL,
  order_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventory_id) REFERENCES inventory(id)
);

CREATE TABLE IF NOT EXISTS customers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  address TEXT,
  type TEXT DEFAULT 'New', -- 'VIP', 'Regular', 'New'
  orders_count INTEGER DEFAULT 0,
  total_spent REAL DEFAULT 0,
  last_order_at TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  order_number TEXT NOT NULL,
  shift_id TEXT,
  cashier_id TEXT NOT NULL,
  cashier_name TEXT NOT NULL,
  customer_id TEXT,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  order_type TEXT NOT NULL, -- 'Dine In', 'Takeaway', 'Delivery'
  table_no TEXT,
  subtotal REAL NOT NULL,
  discount REAL DEFAULT 0,
  discount_type TEXT,
  tax REAL NOT NULL,
  delivery_fee REAL DEFAULT 0,
  grand_total REAL NOT NULL,
  payment_method TEXT NOT NULL,
  amount_received REAL,
  change_given REAL,
  payment_status TEXT DEFAULT 'Paid', -- 'Paid', 'Refunded', 'Pending'
  status TEXT DEFAULT 'Preparing', -- 'Preparing', 'Ready', 'Completed', 'Cancelled'
  notes TEXT,
  cancel_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_id) REFERENCES shifts(id),
  FOREIGN KEY (cashier_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,
  name TEXT NOT NULL,
  size TEXT,
  crust TEXT,
  quantity INTEGER NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  modifiers_json TEXT,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id)
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
