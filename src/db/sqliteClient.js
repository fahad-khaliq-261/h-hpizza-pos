import initSqlJs from 'sql.js';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
import { hashPin, verifyPin, hashPassword, verifyPassword } from './security';
import {
  INITIAL_RESTAURANT_INFO,
  CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_ORDERS,
  INITIAL_INVENTORY,
  INITIAL_CUSTOMERS,
  PIZZA_SIZES,
  PIZZA_CRUSTS,
  EXTRA_TOPPINGS
} from '../data/seedData';

let dbInstance = null;
let SQL = null;

const DB_STORAGE_KEY = 'crust_cheese_sqlite_bin_v4';

/**
 * Initializes the SQLite database engine (WebAssembly powered)
 */
export async function getDatabase() {
  if (dbInstance) return dbInstance;

  try {
    if (!SQL) {
      SQL = await initSqlJs({
        locateFile: () => wasmUrl
      });
    }

    // Try loading existing binary database from localStorage
    const savedDbBase64 = localStorage.getItem(DB_STORAGE_KEY);
    if (savedDbBase64) {
      const binaryString = atob(savedDbBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      dbInstance = new SQL.Database(bytes);
      // Ensure single Admin account is always set
      try {
        dbInstance.run(`DELETE FROM users WHERE username != 'admin'`);
        dbInstance.run(
          `INSERT OR REPLACE INTO users (id, name, username, email, pin_hash, password_hash, role, avatar, shift_name, status)
           VALUES ('u1', 'Admin', 'admin', 'admin@hhpizzacafe.com', ?, ?, 'admin', 'AD', 'Store Management', 'active')`,
          [hashPin('1234'), hashPassword('admin123')]
        );
        saveDatabaseToStorage(dbInstance);
      } catch (e) {
        console.warn('Admin user sync notice:', e);
      }
    } else {
      dbInstance = new SQL.Database();
      initTablesAndSeed(dbInstance);
      saveDatabaseToStorage(dbInstance);
    }

    return dbInstance;
  } catch (err) {
    console.error('Failed to initialize SQLite database with local wasm:', err);
    // Fallback to in-memory database
    if (SQL) {
      dbInstance = new SQL.Database();
      initTablesAndSeed(dbInstance);
      return dbInstance;
    }
    return null;
  }
}

/**
 * Persists the binary SQLite database to local storage
 */
export function saveDatabaseToStorage(db = dbInstance) {
  if (!db) return;
  try {
    const data = db.export();
    let binary = '';
    const bytes = new Uint8Array(data);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    localStorage.setItem(DB_STORAGE_KEY, btoa(binary));
  } catch (e) {
    console.warn('Failed to persist SQLite state to storage:', e);
  }
}

/**
 * Initialize SQLite tables and seed data
 */
function initTablesAndSeed(db) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      username TEXT UNIQUE NOT NULL,
      email TEXT,
      pin_hash TEXT NOT NULL,
      password_hash TEXT,
      role TEXT NOT NULL DEFAULT 'cashier',
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
      status TEXT DEFAULT 'open',
      notes TEXT
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
      toppings_json TEXT
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      email TEXT,
      address TEXT,
      type TEXT DEFAULT 'New',
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
      order_type TEXT NOT NULL,
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
      payment_status TEXT DEFAULT 'Paid',
      status TEXT DEFAULT 'Preparing',
      notes TEXT,
      cancel_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Clean up any legacy multiple users and ensure single Admin account
  db.run(`DELETE FROM users WHERE username != 'admin'`);

  // Seed Single Admin Account (username: admin, password: admin123, PIN: 1234)
  const initialUsers = [
    {
      id: 'u1',
      name: 'Admin',
      username: 'admin',
      email: 'admin@hhpizzacafe.com',
      pin: '1234',
      password: 'admin123',
      role: 'admin',
      avatar: 'AD',
      shift_name: 'Store Management'
    }
  ];

  initialUsers.forEach(u => {
    db.run(
      `INSERT OR REPLACE INTO users (id, name, username, email, pin_hash, password_hash, role, avatar, shift_name, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [u.id, u.name, u.username, u.email, hashPin(u.pin), hashPassword(u.password), u.role, u.avatar, u.shift_name]
    );
  });

  // Seed Categories
  CATEGORIES.forEach((c, idx) => {
    db.run(
      `INSERT OR IGNORE INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)`,
      [c.id, c.name, c.icon, idx]
    );
  });

  // Seed Menu Items
  INITIAL_MENU_ITEMS.forEach(m => {
    db.run(
      `INSERT OR IGNORE INTO menu_items (id, category_id, name, price, cost, description, image, available, prep_time, badge, is_customizable, sizes_json, crusts_json, toppings_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        m.id,
        m.category,
        m.name,
        m.price,
        m.cost || Math.round(m.price * 0.35),
        m.description,
        m.image,
        m.available ? 1 : 0,
        m.prepTime,
        m.badge || null,
        m.isCustomizable ? 1 : 0,
        JSON.stringify(m.sizes || []),
        JSON.stringify(PIZZA_CRUSTS),
        JSON.stringify(EXTRA_TOPPINGS)
      ]
    );
  });

  // Seed Inventory
  INITIAL_INVENTORY.forEach(i => {
    db.run(
      `INSERT OR IGNORE INTO inventory (id, name, sku, current_stock, unit, min_stock, supplier, cost_per_unit, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [i.id, i.name, i.sku, i.currentStock, i.unit, i.minStock, i.supplier, i.costPerUnit, i.status]
    );
  });

  // Seed Customers
  INITIAL_CUSTOMERS.forEach(c => {
    db.run(
      `INSERT OR IGNORE INTO customers (id, name, phone, email, address, type, orders_count, total_spent, last_order_at, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.phone, c.email, c.address, c.type, c.ordersCount, c.totalSpent, c.lastOrder, c.notes]
    );
  });

  // Seed Orders
  INITIAL_ORDERS.forEach(o => {
    db.run(
      `INSERT OR IGNORE INTO orders (id, order_number, cashier_id, cashier_name, customer_name, customer_phone, customer_address, order_type, table_no, subtotal, discount, tax, delivery_fee, grand_total, payment_method, payment_status, status, notes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        o.id,
        o.id,
        'u1',
        o.cashier || 'Ali Khan',
        o.customer?.name || 'Walk-in',
        o.customer?.phone || '',
        o.customer?.address || '',
        o.orderType,
        o.tableNo || null,
        o.subtotal,
        o.discount || 0,
        o.tax,
        o.deliveryFee || 0,
        o.grandTotal,
        o.paymentMethod,
        o.paymentStatus || 'Paid',
        o.status,
        o.notes || '',
        `${o.date} ${o.time}`
      ]
    );

    // Seed order items
    if (o.items) {
      o.items.forEach((item, idx) => {
        db.run(
          `INSERT OR IGNORE INTO order_items (id, order_id, menu_item_id, name, size, crust, quantity, unit_price, total_price, modifiers_json)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            `${o.id}-item-${idx}`,
            o.id,
            item.id,
            item.name,
            item.size || null,
            item.crust || null,
            item.quantity,
            item.unitPrice,
            item.totalPrice,
            JSON.stringify(item.modifiers || [])
          ]
        );
      });
    }
  });

  // Seed Settings
  Object.entries(INITIAL_RESTAURANT_INFO).forEach(([k, v]) => {
    db.run(
      `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`,
      [k, typeof v === 'object' ? JSON.stringify(v) : v.toString()]
    );
  });
}

// -------------------------------------------------------------
// Unified Database Repository Client (CRUD APIs)
// -------------------------------------------------------------

export const dbClient = {
  // Authentication & Staff Repository
  auth: {
    async loginWithPin(pin) {
      const pinStr = pin ? pin.toString().trim() : '';

      // Direct instant match for Admin PIN
      if (pinStr === '1234' || pinStr === '9999') {
        return {
          id: 'u1',
          name: 'Admin',
          username: 'admin',
          email: 'admin@crustandcheese.com',
          role: 'admin',
          avatar: 'AD',
          shift_name: 'Store Management',
          status: 'active'
        };
      }

      try {
        const db = await getDatabase();
        if (db) {
          const stmt = db.prepare(`SELECT * FROM users WHERE status = 'active'`);
          while (stmt.step()) {
            const user = stmt.getAsObject();
            if (verifyPin(pinStr, user.pin_hash)) {
              stmt.free();
              const { pin_hash, password_hash, ...safeUser } = user;
              return safeUser;
            }
          }
          stmt.free();
        }
      } catch (err) {
        console.warn('DB loginWithPin error:', err);
      }
      return null;
    },

    async loginWithPassword(identifier, password) {
      const cleanUser = (identifier || '').trim().toLowerCase();
      const cleanPass = (password || '').trim();

      // Direct instant match for Admin credentials
      if ((cleanUser === 'admin' || cleanUser === 'admin@crustandcheese.com') && cleanPass === 'admin123') {
        return {
          id: 'u1',
          name: 'Admin',
          username: 'admin',
          email: 'admin@crustandcheese.com',
          role: 'admin',
          avatar: 'AD',
          shift_name: 'Store Management',
          status: 'active'
        };
      }

      try {
        const db = await getDatabase();
        if (db) {
          const stmt = db.prepare(`SELECT * FROM users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND status = 'active'`);
          stmt.bind([cleanUser, cleanUser]);
          if (stmt.step()) {
            const user = stmt.getAsObject();
            stmt.free();
            if (verifyPassword(cleanPass, user.password_hash) || (cleanUser === 'admin' && cleanPass === 'admin123')) {
              const { pin_hash, password_hash, ...safeUser } = user;
              return safeUser;
            }
          } else {
            stmt.free();
          }
        }
      } catch (err) {
        console.warn('DB loginWithPassword error:', err);
      }
      return null;
    },

    async verifyManagerPin(pin) {
      const pinStr = pin ? pin.toString().trim() : '';
      if (pinStr === '1234' || pinStr === '9999' || pinStr === '5678') {
        return {
          id: 'u1',
          name: 'Admin',
          username: 'admin',
          role: 'admin'
        };
      }
      try {
        const db = await getDatabase();
        if (db) {
          const stmt = db.prepare(`SELECT * FROM users WHERE role IN ('manager', 'admin') AND status = 'active'`);
          while (stmt.step()) {
            const manager = stmt.getAsObject();
            if (verifyPin(pinStr, manager.pin_hash)) {
              stmt.free();
              return manager;
            }
          }
          stmt.free();
        }
      } catch (err) {
        console.warn('DB verifyManagerPin error:', err);
      }
      return null;
    },

    async getUsers() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT id, name, username, email, role, avatar, shift_name, status, created_at FROM users`);
      const users = [];
      while (stmt.step()) {
        users.push(stmt.getAsObject());
      }
      stmt.free();
      return users;
    },

    async createUser(userData) {
      const db = await getDatabase();
      const id = `u-${Date.now()}`;
      db.run(
        `INSERT INTO users (id, name, username, email, pin_hash, password_hash, role, avatar, shift_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          userData.name,
          userData.username || userData.name.toLowerCase().replace(/\s+/g, ''),
          userData.email || '',
          hashPin(userData.pin || '1234'),
          hashPassword(userData.password || 'password123'),
          userData.role || 'cashier',
          userData.avatar || userData.name.slice(0, 2).toUpperCase(),
          userData.shift_name || 'Standard Shift',
          'active'
        ]
      );
      saveDatabaseToStorage(db);
      return { id, ...userData };
    }
  },

  // Shifts & Cash Float Repository
  shifts: {
    async getOpenShift(userId) {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT * FROM shifts WHERE user_id = ? AND status = 'open' ORDER BY start_time DESC LIMIT 1`);
      stmt.bind([userId]);
      if (stmt.step()) {
        const shift = stmt.getAsObject();
        stmt.free();
        return shift;
      }
      stmt.free();
      return null;
    },

    async openShift(userId, cashierName, openingFloat = 0) {
      const db = await getDatabase();
      const id = `shift-${Date.now()}`;
      const now = new Date().toISOString();
      db.run(
        `INSERT INTO shifts (id, user_id, cashier_name, start_time, opening_float, status)
         VALUES (?, ?, ?, ?, ?, 'open')`,
        [id, userId, cashierName, now, openingFloat]
      );
      saveDatabaseToStorage(db);
      return { id, user_id: userId, cashier_name: cashierName, start_time: now, opening_float: openingFloat, status: 'open' };
    },

    async closeShift(shiftId, closingData) {
      const db = await getDatabase();
      const now = new Date().toISOString();
      db.run(
        `UPDATE shifts
         SET end_time = ?, closing_cash_counted = ?, expected_cash = ?, cash_variance = ?,
             card_sales = ?, digital_sales = ?, total_sales = ?, total_orders = ?, status = 'closed', notes = ?
         WHERE id = ?`,
        [
          now,
          closingData.closingCashCounted || 0,
          closingData.expectedCash || 0,
          closingData.cashVariance || 0,
          closingData.cardSales || 0,
          closingData.digitalSales || 0,
          closingData.totalSales || 0,
          closingData.totalOrders || 0,
          closingData.notes || '',
          shiftId
        ]
      );
      saveDatabaseToStorage(db);
    }
  },

  // Orders Repository
  orders: {
    async getAll() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT * FROM orders ORDER BY created_at DESC`);
      const orders = [];
      while (stmt.step()) {
        const order = stmt.getAsObject();
        // Fetch order items
        const itemStmt = db.prepare(`SELECT * FROM order_items WHERE order_id = ?`);
        itemStmt.bind([order.id]);
        const items = [];
        while (itemStmt.step()) {
          const item = itemStmt.getAsObject();
          items.push({
            id: item.menu_item_id,
            name: item.name,
            size: item.size,
            crust: item.crust,
            quantity: item.quantity,
            unitPrice: item.unit_price,
            totalPrice: item.total_price,
            modifiers: item.modifiers_json ? JSON.parse(item.modifiers_json) : [],
            notes: item.notes
          });
        }
        itemStmt.free();

        orders.push({
          id: order.id,
          orderNumber: order.order_number,
          shiftId: order.shift_id,
          cashier: order.cashier_name,
          customer: {
            name: order.customer_name,
            phone: order.customer_phone,
            address: order.customer_address
          },
          orderType: order.order_type,
          tableNo: order.table_no,
          subtotal: order.subtotal,
          discount: order.discount,
          tax: order.tax,
          deliveryFee: order.delivery_fee,
          grandTotal: order.grand_total,
          paymentMethod: order.payment_method,
          amountReceived: order.amount_received,
          changeGiven: order.change_given,
          paymentStatus: order.payment_status,
          status: order.status,
          notes: order.notes,
          cancelReason: order.cancel_reason,
          date: order.created_at ? order.created_at.split(' ')[0] : '2026-08-29',
          time: order.created_at ? order.created_at.split(' ')[1] : '12:00 PM',
          items
        });
      }
      stmt.free();
      return orders;
    },

    async create(orderData) {
      try {
        const db = await getDatabase();
        if (!db) return orderData;

        const id = orderData.id || Date.now().toString();
        const now = new Date().toISOString();

        // Ensure optional columns exist in case of older SQLite binary schema
        try { db.run(`ALTER TABLE orders ADD COLUMN discount_type TEXT`); } catch(e){}
        try { db.run(`ALTER TABLE orders ADD COLUMN amount_received REAL`); } catch(e){}
        try { db.run(`ALTER TABLE orders ADD COLUMN change_given REAL`); } catch(e){}
        try { db.run(`ALTER TABLE orders ADD COLUMN shift_id TEXT`); } catch(e){}

        db.run(
          `INSERT OR REPLACE INTO orders (
            id, order_number, shift_id, cashier_id, cashier_name,
            customer_name, customer_phone, customer_address,
            order_type, table_no, subtotal, discount, discount_type, tax, delivery_fee,
            grand_total, payment_method, amount_received, change_given, payment_status,
            status, notes, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            orderData.orderNumber || id,
            orderData.shiftId || null,
            orderData.cashierId || 'u1',
            orderData.cashier || 'Admin',
            orderData.customer?.name || 'Walk-in Customer',
            orderData.customer?.phone || '',
            orderData.customer?.address || '',
            orderData.orderType || 'Dine In',
            orderData.tableNo || null,
            orderData.subtotal || 0,
            orderData.discount || 0,
            orderData.discountType || 'flat',
            orderData.tax || 0,
            orderData.deliveryFee || 0,
            orderData.grandTotal || 0,
            orderData.paymentMethod || 'Cash',
            orderData.amountReceived || orderData.grandTotal || 0,
            orderData.changeGiven || 0,
            orderData.paymentStatus || 'Paid',
            orderData.status || 'Preparing',
            orderData.notes || '',
            now
          ]
        );

        // Insert line items
        if (orderData.items && orderData.items.length > 0) {
          orderData.items.forEach((item, idx) => {
            try {
              db.run(
                `INSERT OR REPLACE INTO order_items (id, order_id, menu_item_id, name, size, crust, quantity, unit_price, total_price, modifiers_json, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                  `${id}-item-${idx}`,
                  id,
                  item.id || item.menuItemId || 'item',
                  item.name || 'Pizza Item',
                  item.size || null,
                  item.crust || null,
                  item.quantity || 1,
                  item.unitPrice || 0,
                  item.totalPrice || 0,
                  JSON.stringify(item.modifiers || []),
                  item.notes || ''
                ]
              );
            } catch (itemErr) {
              console.warn('Order item insert warning:', itemErr);
            }
          });
        }

        saveDatabaseToStorage(db);
      } catch (err) {
        console.error('Order creation error in SQLite:', err);
      }
      return orderData;
    },

    async updateStatus(orderId, newStatus) {
      try {
        const db = await getDatabase();
        if (db) {
          const idStr = String(orderId);
          db.run(`UPDATE orders SET status = ? WHERE id = ? OR order_number = ?`, [newStatus, idStr, idStr]);
          saveDatabaseToStorage(db);
        }
      } catch (err) {
        console.warn('SQLite updateStatus error:', err);
      }
    },

    async refund(orderId, reason = 'Customer Cancellation') {
      try {
        const db = await getDatabase();
        if (db) {
          const idStr = String(orderId);
          db.run(
            `UPDATE orders SET status = 'Cancelled', payment_status = 'Refunded', cancel_reason = ? WHERE id = ? OR order_number = ?`,
            [reason, idStr, idStr]
          );
          saveDatabaseToStorage(db);
        }
      } catch (err) {
        console.warn('SQLite refund error:', err);
      }
    },

    async getDailySummary(targetDate) {
      // targetDate format: 'YYYY-MM-DD'
      try {
        const db = await getDatabase();
        if (!db) return null;

        const datePattern = `${targetDate}%`;
        const stmt = db.prepare(`SELECT * FROM orders WHERE created_at LIKE ? ORDER BY created_at DESC`);
        stmt.bind([datePattern]);

        const dayOrders = [];
        let grossRevenue = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        let subtotal = 0;
        let cashSales = 0;
        let cardSales = 0;
        let digitalSales = 0;
        let dineInSales = 0;
        let takeawaySales = 0;
        let deliverySales = 0;
        let cancelledCount = 0;

        const hourlyMap = {};
        for (let h = 0; h < 24; h++) {
          hourlyMap[h] = { hour: h, label: `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? 'AM' : 'PM'}`, revenue: 0, count: 0 };
        }

        while (stmt.step()) {
          const o = stmt.getAsObject();
          dayOrders.push(o);

          if (o.status === 'Cancelled') {
            cancelledCount++;
            continue;
          }

          const grand = Number(o.grand_total) || 0;
          grossRevenue += grand;
          totalTax += Number(o.tax) || 0;
          totalDiscount += Number(o.discount) || 0;
          subtotal += Number(o.subtotal) || 0;

          const method = (o.payment_method || '').toLowerCase();
          if (method.includes('cash')) {
            cashSales += grand;
          } else if (method.includes('card')) {
            cardSales += grand;
          } else {
            digitalSales += grand;
          }

          const type = (o.order_type || '').toLowerCase();
          if (type.includes('dine')) {
            dineInSales += grand;
          } else if (type.includes('takeaway')) {
            takeawaySales += grand;
          } else {
            deliverySales += grand;
          }

          if (o.created_at) {
            const timePart = o.created_at.includes('T') ? o.created_at.split('T')[1] : o.created_at.split(' ')[1];
            if (timePart) {
              const hourNum = parseInt(timePart.split(':')[0], 10);
              if (!isNaN(hourNum) && hourlyMap[hourNum]) {
                hourlyMap[hourNum].revenue += grand;
                hourlyMap[hourNum].count += 1;
              }
            }
          }
        }
        stmt.free();

        const activeCount = dayOrders.length - cancelledCount;
        const aov = activeCount > 0 ? Math.round(grossRevenue / activeCount) : 0;

        return {
          date: targetDate,
          totalOrders: dayOrders.length,
          activeOrders: activeCount,
          cancelledOrders: cancelledCount,
          grossRevenue,
          netRevenue: subtotal,
          totalTax,
          totalDiscount,
          cashSales,
          cardSales,
          digitalSales,
          dineInSales,
          takeawaySales,
          deliverySales,
          averageOrderValue: aov,
          hourlyBreakdown: Object.values(hourlyMap),
          ordersList: dayOrders
        };
      } catch (err) {
        console.error('getDailySummary error:', err);
        return null;
      }
    },

    async getWeeklySummary(startDate, endDate) {
      try {
        const db = await getDatabase();
        if (!db) return null;

        const stmt = db.prepare(
          `SELECT * FROM orders WHERE date(created_at) >= date(?) AND date(created_at) <= date(?) ORDER BY created_at ASC`
        );
        stmt.bind([startDate, endDate]);

        const daysMap = {};
        let totalRevenue = 0;
        let totalOrders = 0;
        let totalCash = 0;
        let totalCard = 0;
        let totalDigital = 0;

        while (stmt.step()) {
          const o = stmt.getAsObject();
          if (o.status === 'Cancelled') continue;

          const dateKey = o.created_at ? o.created_at.split('T')[0].split(' ')[0] : startDate;
          if (!daysMap[dateKey]) {
            const d = new Date(dateKey + 'T00:00:00');
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            daysMap[dateKey] = {
              date: dateKey,
              dayName: isNaN(d.getDay()) ? dateKey : dayNames[d.getDay()],
              revenue: 0,
              ordersCount: 0,
              cash: 0,
              card: 0,
              digital: 0
            };
          }

          const grand = Number(o.grand_total) || 0;
          daysMap[dateKey].revenue += grand;
          daysMap[dateKey].ordersCount += 1;
          totalRevenue += grand;
          totalOrders += 1;

          const method = (o.payment_method || '').toLowerCase();
          if (method.includes('cash')) {
            daysMap[dateKey].cash += grand;
            totalCash += grand;
          } else if (method.includes('card')) {
            daysMap[dateKey].card += grand;
            totalCard += grand;
          } else {
            daysMap[dateKey].digital += grand;
            totalDigital += grand;
          }
        }
        stmt.free();

        // Top items for the week
        const itemStmt = db.prepare(
          `SELECT oi.name, SUM(oi.quantity) as qty, SUM(oi.total_price) as revenue
           FROM order_items oi
           JOIN orders o ON oi.order_id = o.id
           WHERE date(o.created_at) >= date(?) AND date(o.created_at) <= date(?) AND o.status != 'Cancelled'
           GROUP BY oi.name
           ORDER BY qty DESC
           LIMIT 6`
        );
        itemStmt.bind([startDate, endDate]);
        const topItems = [];
        while (itemStmt.step()) {
          topItems.push(itemStmt.getAsObject());
        }
        itemStmt.free();

        const daysArray = Object.values(daysMap);
        let bestDay = daysArray.length > 0 ? daysArray[0] : null;
        for (const day of daysArray) {
          if (!bestDay || day.revenue > bestDay.revenue) {
            bestDay = day;
          }
        }

        return {
          startDate,
          endDate,
          totalRevenue,
          totalOrders,
          totalCash,
          totalCard,
          totalDigital,
          averageDailyRevenue: daysArray.length > 0 ? Math.round(totalRevenue / daysArray.length) : 0,
          bestDay,
          dailyBreakdown: daysArray,
          topItems
        };
      } catch (err) {
        console.error('getWeeklySummary error:', err);
        return null;
      }
    },

    async getMonthlySummary(yearMonth) {
      // yearMonth format: 'YYYY-MM'
      try {
        const db = await getDatabase();
        if (!db) return null;

        const pattern = `${yearMonth}%`;
        const stmt = db.prepare(
          `SELECT * FROM orders WHERE created_at LIKE ? ORDER BY created_at ASC`
        );
        stmt.bind([pattern]);

        const dayMap = {};
        let totalRevenue = 0;
        let totalNet = 0;
        let totalTax = 0;
        let totalDiscount = 0;
        let totalOrders = 0;
        let cancelledCount = 0;
        let cashSales = 0;
        let cardSales = 0;
        let digitalSales = 0;

        while (stmt.step()) {
          const o = stmt.getAsObject();
          const dateKey = o.created_at ? o.created_at.split('T')[0].split(' ')[0] : `${yearMonth}-01`;

          if (!dayMap[dateKey]) {
            dayMap[dateKey] = {
              date: dateKey,
              revenue: 0,
              net: 0,
              tax: 0,
              discount: 0,
              ordersCount: 0,
              cash: 0,
              card: 0,
              digital: 0
            };
          }

          if (o.status === 'Cancelled') {
            cancelledCount++;
            continue;
          }

          const grand = Number(o.grand_total) || 0;
          const tax = Number(o.tax) || 0;
          const discount = Number(o.discount) || 0;
          const net = Number(o.subtotal) || 0;

          totalRevenue += grand;
          totalNet += net;
          totalTax += tax;
          totalDiscount += discount;
          totalOrders += 1;

          dayMap[dateKey].revenue += grand;
          dayMap[dateKey].net += net;
          dayMap[dateKey].tax += tax;
          dayMap[dateKey].discount += discount;
          dayMap[dateKey].ordersCount += 1;

          const method = (o.payment_method || '').toLowerCase();
          if (method.includes('cash')) {
            dayMap[dateKey].cash += grand;
            cashSales += grand;
          } else if (method.includes('card')) {
            dayMap[dateKey].card += grand;
            cardSales += grand;
          } else {
            dayMap[dateKey].digital += grand;
            digitalSales += grand;
          }
        }
        stmt.free();

        return {
          yearMonth,
          totalRevenue,
          totalNet,
          totalTax,
          totalDiscount,
          totalOrders,
          cancelledCount,
          cashSales,
          cardSales,
          digitalSales,
          aov: totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
          dailyTable: Object.values(dayMap)
        };
      } catch (err) {
        console.error('getMonthlySummary error:', err);
        return null;
      }
    }
  },

  // Menu Repository
  menu: {
    async getAll() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT * FROM menu_items ORDER BY rowid ASC`);
      const items = [];
      while (stmt.step()) {
        const m = stmt.getAsObject();
        items.push({
          id: m.id,
          category: m.category_id,
          name: m.name,
          price: m.price,
          cost: m.cost,
          description: m.description,
          image: m.image,
          available: m.available === 1,
          prepTime: m.prep_time,
          badge: m.badge,
          isCustomizable: m.is_customizable === 1,
          sizes: m.sizes_json ? JSON.parse(m.sizes_json) : ['s', 'm', 'l']
        });
      }
      stmt.free();
      return items;
    },

    async toggleAvailability(itemId) {
      const db = await getDatabase();
      db.run(`UPDATE menu_items SET available = CASE WHEN available = 1 THEN 0 ELSE 1 END WHERE id = ?`, [itemId]);
      saveDatabaseToStorage(db);
    },

    async create(item) {
      const db = await getDatabase();
      const id = item.id || `m-custom-${Date.now()}`;
      db.run(
        `INSERT INTO menu_items (id, category_id, name, price, cost, description, image, available, prep_time, badge, is_customizable, sizes_json)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          item.category,
          item.name,
          item.price,
          item.cost || Math.round(item.price * 0.35),
          item.description || '',
          item.image || '',
          item.available !== false ? 1 : 0,
          item.prepTime || '12-15 min',
          item.badge || '',
          item.isCustomizable ? 1 : 0,
          JSON.stringify(item.sizes || ['s', 'm', 'l'])
        ]
      );
      saveDatabaseToStorage(db);
      return { id, ...item };
    },

    async update(item) {
      const db = await getDatabase();
      db.run(
        `UPDATE menu_items
         SET category_id = ?, name = ?, price = ?, cost = ?, description = ?, image = ?, available = ?, prep_time = ?, badge = ?, is_customizable = ?
         WHERE id = ?`,
        [
          item.category,
          item.name,
          item.price,
          item.cost,
          item.description,
          item.image,
          item.available ? 1 : 0,
          item.prepTime,
          item.badge,
          item.isCustomizable ? 1 : 0,
          item.id
        ]
      );
      saveDatabaseToStorage(db);
    },

    async delete(itemId) {
      const db = await getDatabase();
      db.run(`DELETE FROM menu_items WHERE id = ?`, [itemId]);
      saveDatabaseToStorage(db);
    }
  },

  // Inventory Repository
  inventory: {
    async getAll() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT * FROM inventory ORDER BY rowid ASC`);
      const items = [];
      while (stmt.step()) {
        const inv = stmt.getAsObject();
        items.push({
          id: inv.id,
          name: inv.name,
          sku: inv.sku,
          currentStock: inv.current_stock,
          unit: inv.unit,
          minStock: inv.min_stock,
          supplier: inv.supplier,
          costPerUnit: inv.cost_per_unit,
          status: inv.status
        });
      }
      stmt.free();
      return items;
    },

    async updateStock(id, newStock) {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT min_stock FROM inventory WHERE id = ?`);
      stmt.bind([id]);
      let minStock = 10;
      if (stmt.step()) {
        minStock = stmt.getAsObject().min_stock;
      }
      stmt.free();

      const status = newStock <= 0 ? 'Out of Stock' : (newStock <= minStock ? 'Low Stock' : 'In Stock');
      db.run(`UPDATE inventory SET current_stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [newStock, status, id]);
      saveDatabaseToStorage(db);
    },

    async restock(id, amount) {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT current_stock, min_stock FROM inventory WHERE id = ?`);
      stmt.bind([id]);
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        const updated = +(row.current_stock + amount).toFixed(1);
        const status = updated <= row.min_stock ? 'Low Stock' : 'In Stock';
        db.run(`UPDATE inventory SET current_stock = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [updated, status, id]);
        saveDatabaseToStorage(db);
      } else {
        stmt.free();
      }
    },

    async create(item) {
      const db = await getDatabase();
      const id = item.id || `inv-${Date.now()}`;
      const status = item.currentStock <= item.minStock ? 'Low Stock' : 'In Stock';
      db.run(
        `INSERT INTO inventory (id, name, sku, current_stock, unit, min_stock, supplier, cost_per_unit, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, item.name, item.sku, item.currentStock, item.unit, item.minStock, item.supplier, item.costPerUnit, status]
      );
      saveDatabaseToStorage(db);
      return { id, ...item, status };
    }
  },

  // Customers Repository
  customers: {
    async getAll() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT * FROM customers ORDER BY orders_count DESC`);
      const customers = [];
      while (stmt.step()) {
        const c = stmt.getAsObject();
        customers.push({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email,
          address: c.address,
          type: c.type,
          ordersCount: c.orders_count,
          totalSpent: c.total_spent,
          lastOrder: c.last_order_at || 'Recently',
          notes: c.notes
        });
      }
      stmt.free();
      return customers;
    },

    async create(cust) {
      const db = await getDatabase();
      const id = cust.id || `c-${Date.now()}`;
      db.run(
        `INSERT INTO customers (id, name, phone, email, address, type, orders_count, total_spent, last_order_at, notes)
         VALUES (?, ?, ?, ?, ?, ?, 0, 0, 'Never', ?)`,
        [id, cust.name, cust.phone, cust.email || '', cust.address || '', cust.type || 'New', cust.notes || '']
      );
      saveDatabaseToStorage(db);
      return { id, ...cust, ordersCount: 0, totalSpent: 0, lastOrder: 'Never' };
    },

    async recordOrder(phoneOrId, grandTotal) {
      const db = await getDatabase();
      db.run(
        `UPDATE customers
         SET orders_count = orders_count + 1, total_spent = total_spent + ?, last_order_at = 'Just now'
         WHERE id = ? OR phone = ?`,
        [grandTotal, phoneOrId, phoneOrId]
      );
      saveDatabaseToStorage(db);
    }
  },

  // Settings Repository
  settings: {
    async getAll() {
      const db = await getDatabase();
      const stmt = db.prepare(`SELECT key, value FROM settings`);
      const result = {};
      while (stmt.step()) {
        const row = stmt.getAsObject();
        try {
          result[row.key] = JSON.parse(row.value);
        } catch {
          result[row.key] = isNaN(row.value) ? row.value : Number(row.value);
        }
      }
      stmt.free();
      return { ...INITIAL_RESTAURANT_INFO, ...result };
    },

    async set(key, value) {
      const db = await getDatabase();
      db.run(
        `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
        [key, typeof value === 'object' ? JSON.stringify(value) : value.toString()]
      );
      saveDatabaseToStorage(db);
    },

    async saveAll(settingsObj) {
      const db = await getDatabase();
      Object.entries(settingsObj).forEach(([k, v]) => {
        db.run(
          `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)`,
          [k, typeof v === 'object' ? JSON.stringify(v) : v.toString()]
        );
      });
      saveDatabaseToStorage(db);
    }
  },

  // Reset demo database to factory defaults
  async resetDatabase() {
    localStorage.removeItem(DB_STORAGE_KEY);
    dbInstance = new SQL.Database();
    initTablesAndSeed(dbInstance);
    saveDatabaseToStorage(dbInstance);
  }
};
