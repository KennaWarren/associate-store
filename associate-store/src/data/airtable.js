const AIRTABLE_TOKEN   = "pataeDZaj5AE4CQzG.2d7eab083442345f69d75bbdb3a35bb0c742c42a2b675bc91ee6e0e2e050b7d2";
const AIRTABLE_BASE_ID = "app9AoQVdrFHNYj5p";

const BASE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

const headers = {
  "Authorization": `Bearer ${AIRTABLE_TOKEN}`,
  "Content-Type":  "application/json",
};

async function fetchAll(table) {
  let records = [];
  let offset  = null;
  do {
    const url  = offset ? `${BASE_URL}/${table}?offset=${offset}` : `${BASE_URL}/${table}`;
    const res  = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error?.message || "Airtable fetch failed");
    records = records.concat(data.records || []);
    offset  = data.offset || null;
  } while (offset);
  return records;
}

async function createRecord(table, fields) {
  const res  = await fetch(`${BASE_URL}/${table}`, {
    method: "POST", headers,
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Airtable create failed");
  return data;
}

async function updateRecord(table, recordId, fields) {
  const res  = await fetch(`${BASE_URL}/${table}/${recordId}`, {
    method: "PATCH", headers,
    body: JSON.stringify({ fields }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Airtable update failed");
  return data;
}

async function deleteRecord(table, recordId) {
  const res  = await fetch(`${BASE_URL}/${table}/${recordId}`, { method: "DELETE", headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message || "Airtable delete failed");
  return data;
}

export async function fetchOrders() {
  const records = await fetchAll("Orders");
  return records.map(r => ({
    _recordId:     r.id,
    id:            r.fields.OrderId       || "",
    date:          r.fields.Date          || new Date().toISOString(),
    name:          r.fields.Name          || "",
    email:         r.fields.Email         || "",
    department:    r.fields.Department    || "",
    paymentMethod: r.fields.PaymentMethod || "",
    notes:         r.fields.Notes         || "",
    items:         JSON.parse(r.fields.Items || "[]"),
    subtotal:      r.fields.Subtotal      || 0,
    discount:      r.fields.Discount      || 0,
    couponCode:    r.fields.CouponCode    || null,
    total:         r.fields.Total         || 0,
    status:        r.fields.Status        || "pending",
    paid:          r.fields.Paid          || false,
  }));
}

export async function createOrder(order) {
  return createRecord("Orders", {
    OrderId:       order.id,
    Date:          order.date,
    Name:          order.name,
    Email:         order.email,
    Department:    order.department,
    PaymentMethod: order.paymentMethod,
    Notes:         order.notes || "",
    Items:         JSON.stringify(order.items),
    Subtotal:      order.subtotal,
    Discount:      order.discount || 0,
    CouponCode:    order.couponCode || "",
    Total:         order.total,
    Status:        order.status,
    Paid:          order.paid,
  });
}

export async function updateOrder(recordId, changes) {
  const fields = {};
  if (changes.status !== undefined) fields.Status = changes.status;
  if (changes.paid   !== undefined) fields.Paid   = changes.paid;
  if (changes.notes  !== undefined) fields.Notes  = changes.notes;
  return updateRecord("Orders", recordId, fields);
}

export async function deleteOrder(recordId) {
  return deleteRecord("Orders", recordId);
}

export async function fetchProducts() {
  const records = await fetchAll("Products");
  return records.map(r => ({
    _recordId:     r.id,
    id:            r.fields.ProductId    || r.id,
    name:          r.fields.Name         || "",
    description:   r.fields.Description  || "",
    price:         r.fields.Price        || 0,
    cost:          r.fields.Cost         || 0,
    category:      r.fields.Category     || "Other",
    variants:      JSON.parse(r.fields.Variants      || "{}"),
    image:         r.fields.Image        || "",
    variantImages: JSON.parse(r.fields.VariantImages || "{}"),
  }));
}

export async function createProduct(product) {
  return createRecord("Products", {
    ProductId:     String(product.id),
    Name:          product.name,
    Description:   product.description   || "",
    Price:         product.price,
    Cost:          product.cost          || 0,
    Category:      product.category      || "Other",
    Variants:      JSON.stringify(product.variants      || {}),
    Image:         product.image         || "",
    VariantImages: JSON.stringify(product.variantImages || {}),
  });
}

export async function updateProduct(recordId, changes) {
  const fields = {};
  if (changes.name          !== undefined) fields.Name          = changes.name;
  if (changes.description   !== undefined) fields.Description   = changes.description;
  if (changes.price         !== undefined) fields.Price         = changes.price;
  if (changes.cost          !== undefined) fields.Cost          = changes.cost;
  if (changes.category      !== undefined) fields.Category      = changes.category;
  if (changes.variants      !== undefined) fields.Variants      = JSON.stringify(changes.variants);
  if (changes.image         !== undefined) fields.Image         = changes.image;
  if (changes.variantImages !== undefined) fields.VariantImages = JSON.stringify(changes.variantImages);
  return updateRecord("Products", recordId, fields);
}

export async function deleteProduct(recordId) {
  return deleteRecord("Products", recordId);
}
