import { ProductDetail } from "@/types/product";

const STORAGE_PREFIX = "pearly_demo_products";

const SAMPLE_PRODUCTS: ProductDetail[] = [
  {
    id: 101,
    creator_id: "demo-seller-1",
    creator_name: "Mina Studio",
    title: "Everyday linen tote",
    description: "A durable, reusable tote sewn from natural linen.",
    image: null,
    price: "28000.00",
    discounted_price: "28000.00",
    inventory: 24,
    tags: "handmade, linen, accessories",
    tag_list: ["handmade", "linen", "accessories"],
    discount: "0",
    ar_link: null,
    weight: null,
    height: null,
    width: null,
    length: null,
    variants: [],
    created_at: "2026-09-12T10:00:00.000Z",
    updated_at: "2026-09-12T10:00:00.000Z",
  },
  {
    id: 102,
    creator_id: "demo-seller-2",
    creator_name: "Clay & Co.",
    title: "Speckled stoneware mug",
    description: "A wheel-thrown stoneware mug with a food-safe glaze.",
    image: null,
    price: "34000.00",
    discounted_price: "34000.00",
    inventory: 12,
    tags: "ceramics, handmade, kitchen",
    tag_list: ["ceramics", "handmade", "kitchen"],
    discount: "0",
    ar_link: null,
    weight: null,
    height: null,
    width: null,
    length: null,
    variants: [],
    created_at: "2026-09-10T10:00:00.000Z",
    updated_at: "2026-09-10T10:00:00.000Z",
  },
  {
    id: 103,
    creator_id: "demo-seller-3",
    creator_name: "Sunday Goods",
    title: "Botanical soy candle",
    description: "A small-batch soy candle with a gentle botanical scent.",
    image: null,
    price: "22000.00",
    discounted_price: "22000.00",
    inventory: 0,
    tags: "home, candle, small-batch",
    tag_list: ["home", "candle", "small-batch"],
    discount: "0",
    ar_link: null,
    weight: null,
    height: null,
    width: null,
    length: null,
    variants: [],
    created_at: "2026-09-08T10:00:00.000Z",
    updated_at: "2026-09-08T10:00:00.000Z",
  },
];

function storageKey(mode: "sample" | "empty"): string {
  return `${STORAGE_PREFIX}_${mode}`;
}

function isProductList(value: unknown): value is ProductDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (product) =>
        typeof product === "object" &&
        product !== null &&
        typeof product.id === "number" &&
        typeof product.title === "string" &&
        typeof product.price === "string" &&
        typeof product.inventory === "number",
    )
  );
}

export function getDemoProducts(mode: "sample" | "empty"): ProductDetail[] {
  const serialized = window.localStorage.getItem(storageKey(mode));
  if (serialized === null) {
    return mode === "sample" ? SAMPLE_PRODUCTS : [];
  }

  const products: unknown = JSON.parse(serialized);
  if (!isProductList(products)) {
    throw new Error("Saved demo products are invalid. Reset browser demo data to continue.");
  }
  if (mode === "empty") return products;
  const samplePrices = new Map(SAMPLE_PRODUCTS.map((product) => [product.id, Number(product.price)]));
  return products.map((product) => {
    const samplePrice = samplePrices.get(product.id);
    if (samplePrice === undefined || Number(product.price) >= 1000) return product;
    const oldPrice = Number(product.price);
    const oldDiscountedPrice = Number(product.discounted_price);
    return {
      ...product,
      price: (oldPrice * 1000).toFixed(2),
      discounted_price: (oldDiscountedPrice * 1000).toFixed(2),
    };
  });
}

export function saveDemoProducts(
  mode: "sample" | "empty",
  products: ProductDetail[],
): void {
  window.localStorage.setItem(storageKey(mode), JSON.stringify(products));
}

export function toProductList(product: ProductDetail) {
  return {
    id: product.id,
    creator_name: product.creator_name,
    title: product.title,
    description: product.description,
    image: product.image,
    price: product.price,
    discounted_price: product.discounted_price,
    inventory: product.inventory,
    discount: product.discount,
    weight: product.weight,
    height: product.height,
    length: product.length,
    width: product.width,
    variant_count: String(product.variants.length),
    created_at: product.created_at,
  };
}
