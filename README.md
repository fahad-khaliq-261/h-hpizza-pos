# H&H Pizza Cafe — Commercial Desktop POS System

A high-performance, offline-first Desktop Point of Sale (POS) application built for **H&H Pizza Cafe**. Engineered using Electron, React, and Tailwind CSS to streamline high-speed counter billing, multi-variant order customization, and real-time restaurant analytics.

---

## 🚀 Key Features

### 1. High-Speed Counter Billing
* **Multi-Channel Dispatch:** Dedicated modes for **Dine-In**, **Takeaway**, and **Delivery**.
* **Table & Customer Management:** Fast table assignment and customer profile linking.
* **Keyboard Hotkeys:** Rapid navigation shortcuts (including `Ctrl + N` for new billing sessions).
* **Automated Calculations:** Instant computation of line items, discounts, taxes, and final totals.

### 2. Dynamic Menu & Customization Engine
* **Full Product Hierarchy:**
  * **Pizzas:** Special Pizzas, Regular Pizzas, Chef's Special Crusts.
  * **Fast Food & Mains:** Burgers, Wraps, Paratha Rolls, Sandwiches, and Pastas.
  * **Sides & Starters:** French Fries, Loaded Fries, and Appetizers.
* **Multi-Tier Variant Pricing:** Dynamically resolves prices based on size (Small, Medium, Large, XL) and portions (Half / Full).
* **Context-Aware Customizer:** Dynamic item modifier modal for crust selection, optional toppings, and kitchen instructions without static hardcoded options.

### 3. Executive Dashboard & Live Analytics
* **Real-Time KPIs:** Live tracking of Total Revenue, Order Volume, Active Customers, and Average Order Value (AOV).
* **Sales Velocity Curves:** Visual hourly revenue breakdown across Daily, Weekly, and Monthly cycles.
* **Top Selling Products:** Dynamic aggregation of best-performing menu items by volume and revenue.
* **Channel Distribution:** Visual breakdown of sales ratios across Dine-In, Takeaway, and Delivery orders.
* **Shift Reconciliation:** Cash drawer tracking and end-of-shift audit registers.

---

## 🛠 Tech Stack

* **Desktop Environment:** Electron, Node.js
* **Frontend Framework:** React, Tailwind CSS
* **Icons & UI:** Lucide React Icons
* **Packaging & Distribution:** `electron-builder`

---

## 📂 Project Structure

```text
├── src/
│   ├── components/         # Reusable UI elements (Modals, Tabs, Buttons)
│   ├── modules/
│   │   ├── billing/        # POS counter, cart, and variant selector
│   │   └── dashboard/      # Analytics, KPI metrics, and charts
│   ├── data/               # Menu schemas, pricing matrices, and categories
│   ├── hooks/              # Custom React state hooks
│   └── main.js             # Electron main process & window configuration
├── package.json
└── tailwind.config.js
