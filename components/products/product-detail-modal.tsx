"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { productsApi } from "@/lib/products-api";
import { ProductDetail } from "@/types/product";

interface ProductDetailModalProps {
  productId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({ productId, isOpen, onClose }: ProductDetailModalProps) {
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!isOpen || productId === null) return;
    setLoading(true);
    setProduct(null);
    productsApi
      .retrieve(productId)
      .then((res) => setProduct(res.data.data))
      .finally(() => setLoading(false));
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const images = product?.image ? [product.image] : [];
  const tags = product?.tag_list ?? [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <h2 className="text-xl font-semibold text-foreground">Product detail</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-[#FFE4E4] hover:bg-[#ffd0d0] transition-colors"
          >
            <X size={16} className="text-[#E53935]" />
          </button>
        </div>

        {loading && (
          <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>
        )}

        {!loading && product && (
          <>
            {/* Product name */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-0.5">Product name</p>
              <p className="text-sm font-semibold text-foreground">{product.title}</p>
            </div>

            {/* Image carousel */}
            <div className="mb-4">
              <div className="flex gap-3">
                <div className="flex-1 rounded-lg bg-[#F5F5F5] h-45 overflow-hidden">
                  {images[activeImage] ? (
                    <img
                      src={images[activeImage]}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      No image
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="w-22.5 rounded-lg bg-[#F5F5F5] h-45 overflow-hidden">
                    <img
                      src={images[1]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
              {images.length > 1 && (
                <div className="flex justify-center gap-1.5 mt-3">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        i === activeImage ? "bg-primary" : "bg-[#D9D9D9]"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Info grid row 1 */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
              <InfoCell label="Seller" value={product.creator_name} />
              <InfoCell label="Price" value={`₦${product.price}`} />
              <InfoCell label="Date created" value={new Date(product.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")} />
            </div>

            {/* Info grid row 2 */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-5">
              <InfoCell label="Inventory" value={String(product.inventory)} />
              <InfoCell label="Variants" value={product.variants.length > 0 ? String(product.variants.length) : "—"} />
              <InfoCell label="Discount" value={product.discount ? `${product.discount}%` : "—"} />
            </div>

            <hr className="border-border mb-5" />

            {/* Description */}
            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-1">Product description</p>
              <p className="text-sm text-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground bg-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
