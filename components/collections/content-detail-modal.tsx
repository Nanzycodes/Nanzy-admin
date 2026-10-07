"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import apiClient from "@/lib/apiclient";
import { ContentType, CONTENT_TYPE_LABELS } from "@/types/collection";

interface ContentDetailModalProps {
  contentType: ContentType;
  contentId: string | number;
  onClose: () => void;
}

/** Extract display fields from a raw API content item */
function parseContent(item: Record<string, unknown>, contentType: ContentType) {
  let title = "—";
  let creator = "—";
  let caption = "";
  let description = "";
  let images: string[] = [];

  if (contentType === "article") {
    title = (item.title as string) || "—";
    creator = (item.author_name as string) || "—";
    caption = (item.summary as string) || "";
    description = (item.article_content as string) || "";
    if (item.thumbnail) images.push(String(item.thumbnail));
  } else if (contentType === "livestream") {
    title = (item.name as string) || "—";
    creator = (item.creator_name as string) || "—";
    if (Array.isArray(item.products)) {
      images = item.products
        .map((p) => {
          const product = p as Record<string, unknown>;
          return typeof product.product_details === "object" && product.product_details !== null
            ? String((product.product_details as Record<string, unknown>).image ?? "")
            : "";
        })
        .filter(Boolean);
    }
    if (images.length === 0 && item.creator_image) {
      images.push(String(item.creator_image));
    }
    if (Array.isArray(item.products) && item.products.length > 0) {
      description = item.products
        .map((p) => {
          const product = p as Record<string, unknown>;
          const productDetails = typeof product.product_details === "object" && product.product_details !== null
            ? (product.product_details as Record<string, unknown>)
            : {};
          const price = product.starting_bid_price ?? 0;
          return `${String(productDetails.title ?? "Product")} — ₦${Number(price ?? 0).toLocaleString()}`;
        })
        .join("\n");
    }
  } else {
    title = (item.caption as string) || "—";
    creator = (item.creator_name as string) || "—";
    caption = (item.tags as string) || "";
    if (item.thumbnail) images.push(String(item.thumbnail));
  }

  return { title, creator, caption, description, images, raw: item };
}

export default function ContentDetailModal({
  contentType,
  contentId,
  onClose,
}: ContentDetailModalProps) {
  const [raw, setRaw] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgIndex, setImgIndex] = useState(0);
  const [flagging, setFlagging] = useState(false);

  useEffect(() => {
    async function fetchDetail() {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.get(`/admin/content/${contentType}/${contentId}/`);
        // Response: { success, message, data: {...} }
        setRaw(res.data?.data ?? res.data);
      } catch {
        setError("Failed to load content details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [contentType, contentId]);

  async function handleFlag() {
    if (!raw) return;
    setFlagging(true);
    try {
      await apiClient.patch(`/admin/content/${contentType}/${contentId}/flag/`);
      setRaw((prev) => (prev ? { ...prev, status: "flagged" } : prev));
    } catch {
      // flag endpoint may not yet be live
    } finally {
      setFlagging(false);
    }
  }

  const parsed = raw ? parseContent(raw, contentType) : null;
  const { title, creator, caption, description, images } = parsed ?? {
    title: "—", creator: "—", caption: "", description: "", images: [],
  };

  const status = typeof raw?.status === "string" ? raw.status : null;
  const isFlagged = status?.toLowerCase() === "flagged";
  const isVideo = contentType === "video" || contentType === "influencer_content";
  const videoUrl = isVideo ? (typeof raw?.video === "string" ? raw.video : null) : null;

  const dateStr = (() => {
    if (!raw) return "—";
    const createdAt = raw.created_at;
    if (typeof createdAt !== "string" && !(createdAt instanceof Date)) return "—";
    try { return format(new Date(createdAt), "dd-MM-yyyy"); }
    catch { return typeof createdAt === "string" ? createdAt : "—"; }
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Content details</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-400 hover:text-red-500 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-500 text-center py-10">{error}</p>
          ) : raw ? (
            <div className="space-y-5">
              {/* Title */}
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">Title</p>
                <p className="text-sm font-medium text-foreground">{title}</p>
              </div>

              {/* Media — image carousel or video */}
              {videoUrl && images.length === 0 ? (
                <video
                  src={videoUrl}
                  controls
                  className="w-full rounded-lg"
                  style={{ maxHeight: 260 }}
                />
              ) : images.length > 0 ? (
                <div>
                  <div className="flex gap-2 overflow-hidden rounded-lg">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className={`shrink-0 rounded-lg overflow-hidden transition-all duration-300 cursor-pointer ${
                          i === imgIndex ? "w-[68%] opacity-100" : "w-[28%] opacity-55"
                        }`}
                        style={{ aspectRatio: "4/3" }}
                        onClick={() => setImgIndex(i)}
                      >
                        <Image
                          src={src}
                          alt={`media-${i}`}
                          width={800}
                          height={600}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <div className="flex justify-center gap-1.5 mt-2">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setImgIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            i === imgIndex ? "bg-primary" : "bg-[#E0E0E0]"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Detail grid */}
              <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Content type</p>
                  <p className="text-sm font-medium text-foreground">
                    {CONTENT_TYPE_LABELS[contentType] ?? contentType}
                  </p>
                </div>

                {caption && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Caption</p>
                    <p className="text-sm font-medium text-foreground truncate">{caption}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Sellers</p>
                  <p className="text-sm font-medium text-foreground">{creator}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Status</p>
                  <p className="text-sm font-medium text-foreground capitalize">
                    {status ?? "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">Submission date</p>
                  <p className="text-sm font-medium text-foreground">{dateStr}</p>
                </div>
              </div>

              {/* Description / products */}
              {description && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {contentType === "livestream" ? "Products" : "Product description"}
                  </p>
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                    {description}
                  </p>
                </div>
              )}

              {/* Flag button */}
              <button
                onClick={handleFlag}
                disabled={flagging || isFlagged}
                className="w-full mt-2 h-11 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {flagging ? (
                  <Loader2 size={14} className="animate-spin mx-auto" />
                ) : isFlagged ? (
                  "Flagged"
                ) : (
                  "Flag"
                )}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
