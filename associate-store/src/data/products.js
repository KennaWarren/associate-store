export const products = [
  {
    id: 1,
    name: "Apron",
    description: "This Port Authority® Canvas Full-Length Two-Pocket Apron A815 is made from durable 8.5-ounce, 100% cotton canvas for long-lasting use. The contrast 100% cotton webbing neck and waist ties provide a comfortable fit, while the antique brass metal grommets and neck adjuster add a touch of style. With two patch pockets featuring antique brass metal rivets, this apron offers functionality and convenience.  Rogers & Hollands | Ashcroft & Oak logo in top center location.",
    price: 34.00,
    category: "Apparel",
    image: null,
    variants: {
      color: ["Black", "Grey", "Navy", "Brown",],
    },
  },
  {
    id: 2,
    name: "Back Pack",
    description: "Efficiently tackle your professional ambitions with the sleek and durable Back Pack. Designed with a 750D poly twill and 600D poly exterior, this pack features a checkpoint-friendly padded laptop compartment, a padded tablet/e-reader sleeve, and a large main compartment for all your essentials. With a breathable padded back panel and adjustable ergonomic shoulder straps, comfort is ensured while you stay organized with the deluxe organization panel and dual side mesh beverage pockets. With a capacity of 1,750 cu.in./28.7L and a weight of only 2 lbs./0.9kg, this pack is the perfect companion for any business or academic pursuit. Fits most 17 laptops. Overall dimensions: 18.75 h x 12.75 w x 9nd.  Logo embroidered top center.",
    price: 85.00,
    category: "Apparel",
    image: null,
    variants: {
      size: ["S", "M", "L", "XL", "2XL"],
      color: ["White", "Navy", "Charcoal"],
    },
  },
  {
    id: 3,
    name: "Fleece",
    description: "Stay warm and comfortable all year round with our Campus Microfleece Jacket. Made with 100% polyester microfleece and an anti-pill finish, it's soft to the touch and durable. The reverse coil zipper and triple-needle coverstitch add a touch of style, while the side pockets and self-fabric gusset at cuffs provide functionality. Perfect for showcasing your brand on the go.",
    price: 40.00,
    category: "Apparel",
    image: null,
    variants: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      gender: ["Male", "Female"],

    },
  },
  {
    id: 4,
    name: "Hoodie",
    description: "Upgrade your gym and athleisure wear with our port-Tek® Tech Fleece Hooded Sweatshirt. The anti-pill and snag-resistant material offers a matte finish and superior breathability with a touch of athletic style. Stay comfortable and stylish moisture-wicking technology.  Embroidered logo on left breast.",
    price: 55.00,
    category: "Apparel",
    image: null,
    variants: {
      size: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL"],
      color: ["Black", "Red", "Grey"],
      gender: ["Male", "Female"],
    },
  },
  {
    id: 5,
    name: "Snapback Cap",
    description: "Structured snapback with embroidered logo patch. One size fits most.",
    price: 28.00,
    category: "Accessories",
    image: null,
    variants: {
      color: ["Black", "Navy", "White"],
    },
  },
  {
    id: 6,
    name: "Beanie",
    description: "Ribbed knit beanie with woven logo label. One size fits most.",
    price: 20.00,
    category: "Accessories",
    image: null,
    variants: {
      color: ["Black", "Grey", "Navy"],
    },
  },
  {
    id: 7,
    name: "Insulated Tumbler 20oz",
    description: "Double-wall stainless tumbler keeps drinks hot or cold for hours.",
    price: 32.00,
    category: "Drinkware",
    image: null,
    variants: {
      color: ["Black", "Silver", "Navy"],
    },
  },
  {
    id: 8,
    name: "Ceramic Mug",
    description: "Classic 15oz ceramic mug with full-color logo wrap.",
    price: 16.00,
    category: "Drinkware",
    image: null,
    variants: {},
  },
  {
    id: 9,
    name: "Water Bottle 32oz",
    description: "BPA-free Tritan bottle with flip-top lid and carry loop.",
    price: 24.00,
    category: "Drinkware",
    image: null,
    variants: {
      color: ["Clear", "Black", "Blue"],
    },
  },
  {
    id: 10,
    name: "Laptop Backpack",
    description: "Padded 15\" laptop sleeve, multiple pockets, and embroidered logo.",
    price: 72.00,
    category: "Bags",
    image: null,
    variants: {
      color: ["Black", "Grey"],
    },
  },
  {
    id: 11,
    name: "Tote Bag",
    description: "Heavy canvas tote with screen-printed logo. Great for everything.",
    price: 18.00,
    category: "Bags",
    image: null,
    variants: {
      color: ["Natural", "Black", "Navy"],
    },
  },
  {
    id: 12,
    name: "Notebook & Pen Set",
    description: "Hardcover dot-grid notebook with matching ballpoint pen, logo embossed.",
    price: 26.00,
    category: "Office",
    image: null,
    variants: {},
  },
  {
    id: 13,
    name: "Mouse Pad",
    description: "Extra-large desk mat with full-bleed logo design. Non-slip base.",
    price: 19.00,
    category: "Office",
    image: null,
    variants: {},
  },
  {
    id: 14,
    name: "Sticker Pack",
    description: "Set of 5 die-cut vinyl stickers. Weatherproof and dishwasher safe.",
    price: 8.00,
    category: "Accessories",
    image: null,
    variants: {},
  },
  {
    id: 15,
    name: "Lanyard",
    description: "Dye-sublimated full-color lanyard with detachable clip and badge holder.",
    price: 10.00,
    category: "Accessories",
    image: null,
    variants: {
      color: ["Black", "Navy", "Red"],
    },
  },
];

export const categories = ["All", ...new Set(products.map(p => p.category))];

export const paymentMethods = [
  { id: "venmo",   label: "Venmo",                    handle: "@YourCompany-Store", link: "https://venmo.com/YourCompany-Store" },
  { id: "paypal",  label: "PayPal",                   handle: "paypal.me/YourCompanyStore", link: "https://paypal.me/YourCompanyStore" },
  { id: "zelle",   label: "Zelle",                    handle: "store@yourcompany.com", link: null },
  { id: "payroll", label: "Payroll Deduction",        handle: "Submit HR form #47", link: null },
];
