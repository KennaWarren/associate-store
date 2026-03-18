// Maps category and product names to simple colored placeholder visuals
export const categoryColors = {
  Apparel:     { bg: "#1a1a2e", accent: "#A22325" },
  Accessories: { bg: "#1a2e1a", accent: "#2d7a2d" },
  Drinkware:   { bg: "#1a1e2e", accent: "#2d4a8a" },
  Bags:        { bg: "#2e1a1a", accent: "#8a4a2d" },
  Office:      { bg: "#1e1a2e", accent: "#5a2d8a" },
};

export const categoryEmoji = {
  Apparel:     "👕",
  Accessories: "🧢",
  Drinkware:   "☕",
  Bags:        "🎒",
  Office:      "📓",
};

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
