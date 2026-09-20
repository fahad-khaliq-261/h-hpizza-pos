export const INITIAL_RESTAURANT_INFO = {
  name: "H&H Pizza Cafe",
  tagline: "Fresh & Flavourful Every Time",
  branch: "Main Branch",
  phone: "",
  email: "",
  ntn: "",
  currency: "Rs.",
  currencyCode: "PKR",
  taxRate: 0,
  serviceChargeRate: 0,
  deliveryFee: 0,
  receiptFooter: "Thank you for dining at H&H Pizza Cafe!",
  wifiPassword: ""
};

export const CASHIERS = [
  { id: "u1", name: "Admin", role: "Store Administrator", pin: "1234", avatar: "AD", shift: "Store Management", status: "Online" }
];

export const CATEGORIES = [
  { id: "all", name: "All Items", icon: "LayoutGrid" },
  { id: "special-pizza", name: "Special Pizza", icon: "Pizza" },
  { id: "regular-pizza", name: "Regular Pizza", icon: "Pizza" },
  { id: "chefs-pizza", name: "Chef's Special Pizza", icon: "ChefHat" },
  { id: "burgers", name: "Burgers", icon: "Sandwich" },
  { id: "wraps", name: "Wraps", icon: "Sandwich" },
  { id: "pratha-roll", name: "Pratha Roll", icon: "Sandwich" },
  { id: "sandwich", name: "Sandwich", icon: "Sandwich" },
  { id: "pasta", name: "Pasta", icon: "Soup" },
  { id: "fries", name: "French Fries", icon: "Flame" },
  { id: "appetizers", name: "Appetizers", icon: "Flame" }
];

export const PIZZA_SIZES = [
  { id: "s", name: "Small", priceMultiplier: 1.0, defaultFor: false },
  { id: "m", name: "Medium", priceMultiplier: 1.0, defaultFor: true },
  { id: "l", name: "Large", priceMultiplier: 1.0, defaultFor: false },
  { id: "xl", name: "XL", priceMultiplier: 1.0, defaultFor: false }
];

export const PIZZA_CRUSTS = [
  { id: "regular", name: "Regular Crust", extraPrice: 0 },
  { id: "thin", name: "Thin Crust", extraPrice: 0 }
];

export const EXTRA_TOPPINGS = [];

export const INITIAL_MENU_ITEMS = [
  // ── SPECIAL PIZZA FLAVOURS ──────────────────────────────────────────────
  { id: "sp-1", name: "H&H Special Pizza", category: "special-pizza", price: 1200, image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=600&q=80", description: "Our signature house special pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 700, m: 1200, l: 1600, xl: 2000 } },
  { id: "sp-2", name: "Creamy Pizza", category: "special-pizza", price: 1200, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", description: "Rich and creamy flavour pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 700, m: 1200, l: 1600, xl: 2000 } },
  { id: "sp-3", name: "Extreme Pizza", category: "special-pizza", price: 1200, image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80", description: "Loaded extreme flavour pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 700, m: 1200, l: 1600, xl: 2000 } },
  { id: "sp-4", name: "Afgani Pizza", category: "special-pizza", price: 1200, image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=600&q=80", description: "Afghan inspired special pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 700, m: 1200, l: 1600, xl: 2000 } },
  { id: "sp-5", name: "Supreme Pizza", category: "special-pizza", price: 1200, image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80", description: "Supreme loaded special pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 700, m: 1200, l: 1600, xl: 2000 } },

  // ── REGULAR PIZZA FLAVOURS ──────────────────────────────────────────────
  { id: "rp-1", name: "Chicken Tikka", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80", description: "Classic chicken tikka pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },
  { id: "rp-2", name: "Chicken Fajita", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?auto=format&fit=crop&w=600&q=80", description: "Spicy fajita chicken pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },
  { id: "rp-3", name: "Tandoori Pizza", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80", description: "Desi tandoori flavoured pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },
  { id: "rp-4", name: "Chicken Cheese", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143?auto=format&fit=crop&w=600&q=80", description: "Chicken and cheese classic pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },
  { id: "rp-5", name: "Vegi Lover", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?auto=format&fit=crop&w=600&q=80", description: "Loaded fresh vegetables pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },
  { id: "rp-6", name: "Cheese Lovers", category: "regular-pizza", price: 1000, image: "https://images.unsplash.com/photo-1548369937-47519962c11a?auto=format&fit=crop&w=600&q=80", description: "Extra cheese loaded pizza.", available: true, isCustomizable: true, sizes: ["s","m","l","xl"], sizePrices: { s: 650, m: 1000, l: 1299, xl: 1750 } },

  // ── CHEF'S SPECIAL PIZZA ────────────────────────────────────────────────
  { id: "cs-1", name: "Crown Crust", category: "chefs-pizza", price: 1300, image: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=600&q=80", description: "Chef's signature crown crust pizza.", available: true, isCustomizable: true, sizes: ["m","l"], sizePrices: { m: 1300, l: 1800 } },
  { id: "cs-2", name: "Kabbab Crust", category: "chefs-pizza", price: 1300, image: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?auto=format&fit=crop&w=600&q=80", description: "Kabbab stuffed crust special pizza.", available: true, isCustomizable: true, sizes: ["m","l"], sizePrices: { m: 1300, l: 1800 } },
  { id: "cs-3", name: "Cheese Crust", category: "chefs-pizza", price: 1300, image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80", description: "Cheesy stuffed crust special pizza.", available: true, isCustomizable: true, sizes: ["m","l"], sizePrices: { m: 1300, l: 1800 } },
  { id: "cs-4", name: "Chicken Crust", category: "chefs-pizza", price: 1300, image: "https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=600&q=80", description: "Chicken stuffed crust special pizza.", available: true, isCustomizable: true, sizes: ["m","l"], sizePrices: { m: 1300, l: 1800 } },

  // ── BURGERS ─────────────────────────────────────────────────────────────
  { id: "br-1", name: "Chicken Patty Burger", category: "burgers", price: 320, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", description: "Juicy chicken patty burger.", available: true, isCustomizable: false },
  { id: "br-2", name: "Chicken Chapli Burger", category: "burgers", price: 300, image: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", description: "Desi chapli kabab style chicken burger.", available: true, isCustomizable: false },
  { id: "br-3", name: "Zinger Burger", category: "burgers", price: 390, image: "https://images.unsplash.com/photo-1621188988909-fbef0a54d3b3?auto=format&fit=crop&w=600&q=80", description: "Crispy fried zinger chicken burger.", available: true, isCustomizable: false },
  { id: "br-4", name: "Double Decker", category: "burgers", price: 700, image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?auto=format&fit=crop&w=600&q=80", description: "Double stacked decker burger.", available: true, isCustomizable: false },
  { id: "br-5", name: "Tower Burger", category: "burgers", price: 700, image: "https://images.unsplash.com/photo-1596956470007-2bf6095e7e16?auto=format&fit=crop&w=600&q=80", description: "Tall stacked tower burger.", available: true, isCustomizable: false },
  { id: "br-6", name: "Emperor Burger", category: "burgers", price: 800, image: "https://images.unsplash.com/photo-1607013251379-e6eecfffe234?auto=format&fit=crop&w=600&q=80", description: "The premium emperor burger.", available: true, isCustomizable: false },
  { id: "br-7", name: "Special Grill Burger", category: "burgers", price: 600, image: "https://images.unsplash.com/photo-1640363539862-8cb77680b7f6?auto=format&fit=crop&w=600&q=80", description: "Grilled special burger.", available: true, isCustomizable: false },

  // ── WRAPS ────────────────────────────────────────────────────────────────
  { id: "wr-1", name: "Grill Wrap", category: "wraps", price: 600, image: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80", description: "Grilled chicken wrap.", available: true, isCustomizable: false },
  { id: "wr-2", name: "Fillet Wrap", category: "wraps", price: 600, image: "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=600&q=80", description: "Crispy fillet wrap.", available: true, isCustomizable: false },
  { id: "wr-3", name: "Behari Wrap", category: "wraps", price: 600, image: "https://images.unsplash.com/photo-1614777735417-4bf4a1af8688?auto=format&fit=crop&w=600&q=80", description: "Behari kabab wrap.", available: true, isCustomizable: false },

  // ── PRATHA ROLL ──────────────────────────────────────────────────────────
  { id: "pr-1", name: "Tikka Pratha Roll", category: "pratha-roll", price: 400, image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=80", description: "Tikka chicken pratha roll.", available: true, isCustomizable: false },
  { id: "pr-2", name: "Creamy Pratha Roll", category: "pratha-roll", price: 400, image: "https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=600&q=80", description: "Creamy chicken pratha roll.", available: true, isCustomizable: false },
  { id: "pr-3", name: "Zinger Pratha Roll", category: "pratha-roll", price: 400, image: "https://images.unsplash.com/photo-1619895862022-09114b41f16f?auto=format&fit=crop&w=600&q=80", description: "Zinger pratha roll.", available: true, isCustomizable: false },
  { id: "pr-4", name: "Chicken Cheese Pratha Roll", category: "pratha-roll", price: 450, image: "https://images.unsplash.com/photo-1604909052434-d7aeba023b12?auto=format&fit=crop&w=600&q=80", description: "Chicken cheese pratha roll.", available: true, isCustomizable: false },
  { id: "pr-5", name: "Pizza Pratha Roll", category: "pratha-roll", price: 500, image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80", description: "Pizza flavoured pratha roll.", available: true, isCustomizable: false },

  // ── SANDWICH ─────────────────────────────────────────────────────────────
  { id: "sw-1", name: "Tikka Staker Sandwich", category: "sandwich", price: 650, image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80", description: "Tikka stacked sandwich.", available: true, isCustomizable: false },
  { id: "sw-2", name: "Crispy Staker Sandwich", category: "sandwich", price: 700, image: "https://images.unsplash.com/photo-1521390188984-f461c9563c6e?auto=format&fit=crop&w=600&q=80", description: "Crispy stacked sandwich.", available: true, isCustomizable: false },
  { id: "sw-3", name: "Grill Sandwich", category: "sandwich", price: 650, image: "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=600&q=80", description: "Grilled sandwich.", available: true, isCustomizable: false },
  { id: "sw-4", name: "Chicken Sandwich", category: "sandwich", price: 600, image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=600&q=80", description: "Classic chicken sandwich.", available: true, isCustomizable: false },

  // ── PASTA ────────────────────────────────────────────────────────────────
  { id: "pa-1", name: "Creamy Pasta (Half)", category: "pasta", price: 450, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80", description: "Creamy pasta - half portion.", available: true, isCustomizable: false },
  { id: "pa-2", name: "Creamy Pasta (Full)", category: "pasta", price: 800, image: "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80", description: "Creamy pasta - full portion.", available: true, isCustomizable: false },
  { id: "pa-3", name: "Crunchy Pasta (Half)", category: "pasta", price: 450, image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80", description: "Crunchy pasta - half portion.", available: true, isCustomizable: false },
  { id: "pa-4", name: "Crunchy Pasta (Full)", category: "pasta", price: 800, image: "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80", description: "Crunchy pasta - full portion.", available: true, isCustomizable: false },

  // ── FRENCH FRIES ─────────────────────────────────────────────────────────
  { id: "fr-1", name: "Plain French Fries (Half)", category: "fries", price: 200, image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80", description: "Classic plain fries - half.", available: true, isCustomizable: false },
  { id: "fr-2", name: "Plain French Fries (Full)", category: "fries", price: 400, image: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?auto=format&fit=crop&w=600&q=80", description: "Classic plain fries - full.", available: true, isCustomizable: false },
  { id: "fr-3", name: "Masala Fries (Half)", category: "fries", price: 250, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", description: "Spicy masala fries - half.", available: true, isCustomizable: false },
  { id: "fr-4", name: "Masala Fries (Full)", category: "fries", price: 400, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", description: "Spicy masala fries - full.", available: true, isCustomizable: false },
  { id: "fr-5", name: "Mayo Fries (Full)", category: "fries", price: 450, image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=600&q=80", description: "Fries with mayo sauce.", available: true, isCustomizable: false },
  { id: "fr-6", name: "Loaded Fries", category: "fries", price: 650, image: "https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80", description: "Loaded fries with toppings.", available: true, isCustomizable: false },
  { id: "fr-7", name: "Crispy Loaded Fries", category: "fries", price: 700, image: "https://images.unsplash.com/photo-1576107232684-1279f0a70e00?auto=format&fit=crop&w=600&q=80", description: "Extra crispy loaded fries.", available: true, isCustomizable: false },

  // ── APPETIZERS ───────────────────────────────────────────────────────────
  { id: "ap-1", name: "Nuggets (Half)", category: "appetizers", price: 350, image: "https://images.unsplash.com/photo-1562802378-063ec186a863?auto=format&fit=crop&w=600&q=80", description: "Crispy nuggets - half portion.", available: true, isCustomizable: false },
  { id: "ap-2", name: "Nuggets (Full)", category: "appetizers", price: 700, image: "https://images.unsplash.com/photo-1562802378-063ec186a863?auto=format&fit=crop&w=600&q=80", description: "Crispy nuggets - full portion.", available: true, isCustomizable: false },
  { id: "ap-3", name: "Crispy Wings (Half)", category: "appetizers", price: 350, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", description: "Crispy chicken wings - half.", available: true, isCustomizable: false },
  { id: "ap-4", name: "Crispy Wings (Full)", category: "appetizers", price: 700, image: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", description: "Crispy chicken wings - full.", available: true, isCustomizable: false },
  { id: "ap-5", name: "Oven Baked Wings (Half)", category: "appetizers", price: 350, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80", description: "Oven baked wings - half.", available: true, isCustomizable: false },
  { id: "ap-6", name: "Oven Baked Wings (Full)", category: "appetizers", price: 700, image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=600&q=80", description: "Oven baked wings - full.", available: true, isCustomizable: false },
  { id: "ap-7", name: "Hot Shot (Half)", category: "appetizers", price: 350, image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80", description: "Hot shot bites - half.", available: true, isCustomizable: false },
  { id: "ap-8", name: "Hot Shot (Full)", category: "appetizers", price: 700, image: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=600&q=80", description: "Hot shot bites - full.", available: true, isCustomizable: false }
];

const getRelativeDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
};

export const INITIAL_ORDERS = [];

export const INITIAL_INVENTORY = [
  { id: "inv-1", name: "Mozzarella Cheese (Whole Milk)", sku: "ING-CHZ-01", currentStock: 48.5, unit: "kg", minStock: 25.0, supplier: "Valley Dairy Fresh", costPerUnit: 1450, status: "In Stock" },
  { id: "inv-2", name: "Pizza Dough Master Mix", sku: "ING-DGH-02", currentStock: 82.0, unit: "kg", minStock: 30.0, supplier: "Gold Medal Mills", costPerUnit: 220, status: "In Stock" },
  { id: "inv-3", name: "Beef Pepperoni Slices", sku: "ING-PEP-03", currentStock: 8.2, unit: "kg", minStock: 12.0, supplier: "Prime Halal Meats", costPerUnit: 2800, status: "Low Stock" },
  { id: "inv-4", name: "Marinated Chicken Chunks", sku: "ING-CHK-04", currentStock: 34.0, unit: "kg", minStock: 20.0, supplier: "Al-Falah Poultry", costPerUnit: 850, status: "In Stock" },
  { id: "inv-5", name: "San Marzano Herb Tomato Sauce", sku: "ING-SAU-05", currentStock: 42.0, unit: "liters", minStock: 15.0, supplier: "Napoli Imports", costPerUnit: 620, status: "In Stock" },
  { id: "inv-6", name: "Fresh Button Mushrooms", sku: "ING-MSH-06", currentStock: 5.5, unit: "kg", minStock: 10.0, supplier: "Greenfield Farms", costPerUnit: 750, status: "Low Stock" },
  { id: "inv-7", name: "Red Onions (Peeled & Sliced)", sku: "ING-ONN-07", currentStock: 28.0, unit: "kg", minStock: 15.0, supplier: "AgriDirect", costPerUnit: 160, status: "In Stock" },
  { id: "inv-8", name: "Green & Red Bell Peppers", sku: "ING-PEP-08", currentStock: 18.5, unit: "kg", minStock: 12.0, supplier: "Greenfield Farms", costPerUnit: 340, status: "In Stock" },
  { id: "inv-9", name: "Black Sliced Olives (Canned)", sku: "ING-OLV-09", currentStock: 14.0, unit: "cans", minStock: 8.0, supplier: "Mediterranean Foods", costPerUnit: 580, status: "In Stock" },
  { id: "inv-10", name: "Pickled Jalapeno Slices", sku: "ING-JAL-10", currentStock: 11.5, unit: "jars", minStock: 6.0, supplier: "Fiesta Seasonings", costPerUnit: 490, status: "In Stock" },
  { id: "inv-11", name: "Heavy Cooking Cream (Alfredo)", sku: "ING-CRM-11", currentStock: 22.0, unit: "liters", minStock: 10.0, supplier: "Valley Dairy Fresh", costPerUnit: 920, status: "In Stock" },
  { id: "inv-12", name: "Brioche Burger Buns", sku: "ING-BUN-12", currentStock: 64, unit: "pieces", minStock: 40, supplier: "Artisan Bakery", costPerUnit: 65, status: "In Stock" },
  { id: "inv-13", name: "Smash Beef Patties (Seasoned)", sku: "ING-PAT-13", currentStock: 45, unit: "pieces", minStock: 30, supplier: "Prime Halal Meats", costPerUnit: 240, status: "In Stock" },
  { id: "inv-14", name: "Chicken Wings (Jumbo Cut)", sku: "ING-WNG-14", currentStock: 3.2, unit: "kg", minStock: 15.0, supplier: "Al-Falah Poultry", costPerUnit: 780, status: "Out of Stock" },
  { id: "inv-15", name: "Coca-Cola Cans (330ml pack)", sku: "ING-COK-15", currentStock: 120, unit: "cans", minStock: 50, supplier: "Beverage Distributors", costPerUnit: 75, status: "In Stock" },
  { id: "inv-16", name: "Belgian Dark Chocolate (70%)", sku: "ING-CHO-16", currentStock: 9.0, unit: "kg", minStock: 5.0, supplier: "Gourmet Chocolatiers", costPerUnit: 3200, status: "In Stock" }
];

export const INITIAL_CUSTOMERS = [];

export const SALES_CHART_DATA_7D = [
  { day: "Mon", fullDay: "Monday", sales: 182000, orders: 134 },
  { day: "Tue", fullDay: "Tuesday", sales: 195500, orders: 142 },
  { day: "Wed", fullDay: "Wednesday", sales: 210300, orders: 156 },
  { day: "Thu", fullDay: "Thursday", sales: 198700, orders: 148 },
  { day: "Fri", fullDay: "Friday", sales: 235600, orders: 172 },
  { day: "Sat", fullDay: "Saturday", sales: 268900, orders: 198 },
  { day: "Sun", fullDay: "Sunday (Today)", sales: 248650, orders: 184 }
];

export const SALES_CHART_DATA_30D = [
  { day: "Week 1", sales: 1340000, orders: 980 },
  { day: "Week 2", sales: 1480000, orders: 1090 },
  { day: "Week 3", sales: 1520000, orders: 1120 },
  { day: "Week 4", sales: 1680000, orders: 1240 }
];

export const SALES_CHART_DATA_YEAR = [
  { day: "Jan", sales: 4800000, orders: 3500 },
  { day: "Feb", sales: 5100000, orders: 3750 },
  { day: "Mar", sales: 5400000, orders: 3980 },
  { day: "Apr", sales: 5200000, orders: 3820 },
  { day: "May", sales: 5900000, orders: 4300 },
  { day: "Jun", sales: 6300000, orders: 4600 },
  { day: "Jul", sales: 6700000, orders: 4900 },
  { day: "Aug", sales: 7100000, orders: 5150 }
];

export const POPULAR_ITEMS_DATA = [
  { name: "Pepperoni Passion Pizza", count: 86, category: "Pizza", revenue: 159100 },
  { name: "Chicken Fajita Supreme", count: 74, category: "Pizza", revenue: 129500 },
  { name: "Margherita Classic Pizza", count: 68, category: "Pizza", revenue: 98600 },
  { name: "Cheesy Garlic Bread", count: 54, category: "Sides", revenue: 28080 },
  { name: "Spicy Buffalo Wings", count: 47, category: "Sides", revenue: 36660 },
  { name: "Classic Smash Burger", count: 42, category: "Burgers", revenue: 41160 },
  { name: "Molten Lava Cake", count: 39, category: "Desserts", revenue: 25350 }
];

export const ORDER_TYPE_DISTRIBUTION = [
  { type: "Dine In", percentage: 35, count: 64, color: "#C5301A" },
  { type: "Takeaway", percentage: 28, count: 52, color: "#E65100" },
  { type: "Delivery", percentage: 37, count: 68, color: "#D97706" }
];

export const TABLES_LIST = [
  { id: "t1", name: "Table 01", capacity: "2 Persons", status: "Occupied" },
  { id: "t2", name: "Table 02", capacity: "4 Persons", status: "Occupied" },
  { id: "t3", name: "Table 03", capacity: "4 Persons", status: "Available" },
  { id: "t4", name: "Table 04", capacity: "6 Persons", status: "Occupied" },
  { id: "t5", name: "Table 05", capacity: "2 Persons", status: "Available" },
  { id: "t6", name: "Table 06", capacity: "8 Persons (Family)", status: "Available" },
  { id: "t7", name: "Outdoor 01", capacity: "4 Persons", status: "Available" },
  { id: "t8", name: "Outdoor 02", capacity: "4 Persons", status: "Available" }
];
