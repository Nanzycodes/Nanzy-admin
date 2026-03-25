"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { experiencesApi } from "@/lib/experiences-api";
import { ExperienceDetail } from "@/types/experience";

interface ExperienceDetailModalProps {
  experienceId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExperienceDetailModal({ experienceId, isOpen, onClose }: ExperienceDetailModalProps) {
  const [experience, setExperience] = useState<ExperienceDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!isOpen || experienceId === null) return;
    setLoading(true);
    setExperience(null);
    setActiveImage(0);
    experiencesApi
      .retrieve(experienceId)
      .then((res) => setExperience(res.data.data))
      .finally(() => setLoading(false));
  }, [isOpen, experienceId]);

  if (!isOpen) return null;

  const images = experience?.products.map((p) => p.image).filter(Boolean) as string[] ?? [];
  const firstProduct = experience?.products[0];
  const amenities = firstProduct?.amenity_list ?? [];

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
          <h2 className="text-xl font-semibold text-foreground">Experience detail</h2>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-md bg-[#FFE4E4] hover:bg-[#ffd0d0] transition-colors"
          >
            <X size={16} className="text-[#E53935]" />
          </button>
        </div>

        {loading && <div className="py-16 text-center text-sm text-muted-foreground">Loading...</div>}

        {!loading && experience && (
          <>
            {/* Business name */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-0.5">Business name</p>
              <p className="text-sm font-semibold text-foreground">{experience.business_name}</p>
            </div>

            {/* Image carousel */}
            {images.length > 0 && (
              <div className="mb-4">
                <div className="flex gap-3">
                  <div className="flex-1 rounded-lg bg-[#F5F5F5] h-45 overflow-hidden">
                    <img src={images[activeImage]} alt="" className="w-full h-full object-cover" />
                  </div>
                  {images[1] && (
                    <div className="w-22.5 rounded-lg bg-[#F5F5F5] h-45 overflow-hidden">
                      <img src={images[1]} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                {images.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-3">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-2 h-2 rounded-full transition-colors ${i === activeImage ? "bg-primary" : "bg-[#D9D9D9]"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Info grid row 1 */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-4">
              <InfoCell label="Business name" value={experience.business_name} />
              <InfoCell label="Category" value={experience.experience_type} className="capitalize" />
              <InfoCell label="Date created" value={new Date(experience.created_at).toLocaleDateString("en-GB").replace(/\//g, "-")} />
            </div>

            {/* Info grid row 2 */}
            <div className="grid grid-cols-3 gap-x-4 gap-y-4 mb-5">
              <InfoCell label="Products" value={experience.products.length > 0 ? String(experience.products.length) : "0"} />
              <InfoCell label="Seller" value={experience.creator_name} />
              <InfoCell label="Type" value={experience.experience_type} className="capitalize" />
            </div>

            {firstProduct && (
              <>
                <hr className="border-border mb-5" />

                {/* Description */}
                <div className="mb-5">
                  <p className="text-xs text-muted-foreground mb-1">Description</p>
                  <p className="text-sm text-foreground leading-relaxed">{firstProduct.description}</p>
                </div>

                {/* Amenities */}
                {amenities.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Amenities</p>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((item, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm text-foreground bg-white"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function InfoCell({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className={`text-sm font-medium text-foreground ${className ?? ""}`}>{value}</p>
    </div>
  );
}
