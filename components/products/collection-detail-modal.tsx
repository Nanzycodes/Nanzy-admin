"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { collectionsApi } from "@/lib/collections-api";
import { ContentItem, ContentType, CONTENT_TYPE_LABELS } from "@/types/collection";

interface CollectionDetailModalProps {
  item: { id: string | number; content_type: ContentType } | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CollectionDetailModal({ item, isOpen, onClose }: CollectionDetailModalProps) {
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !item) return;
    setLoading(true);
    setContent(null);
    collectionsApi
      .retrieve(item.content_type, item.id)
      .then((res) => setContent(res.data.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [isOpen, item]);

  if (!isOpen) return null;

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
          <h2 className="text-xl font-semibold text-foreground">Collection detail</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-[#FFE4E4] hover:bg-[#ffd0d0] transition-colors"
          >
            <X size={16} className="text-[#E53935]" />
          </button>
        </div>

        {loading && <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>}

        {!loading && content && content.content_type === "article" && (
          <>
            {/* Thumbnail */}
            {content.thumbnail && (
              <div className="mb-4 rounded-lg overflow-hidden h-45 bg-[#F5F5F5]">
                <img src={content.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-0.5">Title</p>
              <p className="text-sm font-semibold text-foreground">{content.title}</p>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-5">
              <InfoCell label="Author" value={content.author_name} />
              <InfoCell label="Type" value={CONTENT_TYPE_LABELS[content.content_type]} />
              <InfoCell label="Views" value={String(content.view_count)} />
              <InfoCell label="Date created" value={new Date(content.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")} />
            </div>

            <hr className="border-border mb-5" />

            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-1">Summary</p>
              <p className="text-sm text-foreground leading-relaxed">{content.summary}</p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Article content</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{content.article_content}</p>
            </div>
          </>
        )}

        {!loading && content && content.content_type === "livestream" && (
          <>
            {/* Creator */}
            <div className="flex items-center gap-3 mb-5">
              {content.creator_image && (
                <img src={content.creator_image} alt="" className="w-10 h-10 rounded-full object-cover" />
              )}
              <div>
                <p className="text-sm font-semibold text-foreground">{content.creator_name}</p>
                <p className="text-xs text-muted-foreground">{content.creator_email}</p>
              </div>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-0.5">Livestream name</p>
              <p className="text-sm font-semibold text-foreground">{content.name}</p>
            </div>

            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-5">
              <InfoCell label="Status" value={content.is_active ? "Live" : "Ended"} />
              <InfoCell label="Bidding" value={content.has_bidding ? "Yes" : "No"} />
              <InfoCell label="Participants" value={String(content.active_participants_count)} />
              <InfoCell label="Started" value={new Date(content.started_at).toLocaleDateString("en-GB").replace(/\//g, "-")} />
              {content.ended_at && (
                <InfoCell label="Ended" value={new Date(content.ended_at).toLocaleDateString("en-GB").replace(/\//g, "-")} />
              )}
              <InfoCell label="Products" value={String(content.products.length)} />
            </div>

            {content.products.length > 0 && (
              <>
                <hr className="border-border mb-4" />
                <p className="text-xs text-muted-foreground mb-3">Products in livestream</p>
                <div className="flex flex-col gap-3">
                  {content.products.map((lp) => (
                    <div key={lp.id} className="flex items-center gap-3 p-3 rounded-lg border border-border">
                      {lp.product_details.image && (
                        <img src={lp.product_details.image} alt="" className="w-12 h-12 rounded-md object-cover shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{lp.product_details.title}</p>
                        <p className="text-xs text-muted-foreground">Starting bid: ₦{lp.starting_bid_price}</p>
                        {lp.highest_bid_amount && (
                          <p className="text-xs text-green-600">Highest bid: ₦{lp.highest_bid_amount} — {lp.highest_bidder}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}

        {!loading && content && content.content_type !== "article" && content.content_type !== "livestream" && (
          <>
            {/* Video player */}
            {content.video ? (
              <div className="mb-4 rounded-lg overflow-hidden bg-black">
                <video src={content.video} controls className="w-full max-h-64 object-contain" />
              </div>
            ) : content.thumbnail ? (
              <div className="mb-4 rounded-lg overflow-hidden h-45 bg-[#F5F5F5]">
                <img src={content.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>
            ) : null}

            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
              <InfoCell label="ID" value={`#${content.id}`} />
              <InfoCell label="Type" value={CONTENT_TYPE_LABELS[content.content_type]} />
              <InfoCell label="Views" value={String(content.view_count)} />
            </div>
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-5">
              <InfoCell label="Likes" value={String(content.like_count)} />
              <InfoCell label="Comments" value={String(content.comment_count)} />
              <InfoCell label="Shares" value={String(content.share_count)} />
            </div>

            <hr className="border-border mb-5" />

            <div className="mb-5">
              <p className="text-xs text-muted-foreground mb-1">Caption</p>
              <p className="text-sm text-foreground leading-relaxed">{content.caption}</p>
            </div>

            {content.tags && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {content.tags.split(",").map((t, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-md border border-border text-sm text-foreground bg-white">
                      {t.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {!loading && !content && (
          <p className="py-8 text-center text-sm text-muted-foreground">No details available.</p>
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
