"use client";

import React from "react";
import Image from "next/image";
import { contentMiniImg } from "@/lib/utils";

interface ContentsProps {
  data?: any[] | null;
}

const Contents = ({ data }: ContentsProps) => {
  // Only map if data exists, otherwise show empty state or null
  if (!data) return null;

  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {data.map((item: any, i: number) => (
        <ContentItem
          key={item.id || i}
          title={item?.title}
          subtitle={`${item?.views_count ?? 0} views · ${item?.content_type ?? ""}`}
          poster={item?.owner_name}
          image={null}
        />
      ))}
    </div>
  );
};

export default Contents;

export const ContentItem = ({
  title,
  subtitle,
  poster,
  image,
  classname,
}: {
  title?: string;
  subtitle?: string;
  poster?: string;
  image?: string | null;
  classname?: string;
}) => {
  return (
    <div className={`w-full flex justify-between items-center pb-2.5 ${classname}`}>
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <Image src={contentMiniImg} alt="content" width={40} height={40} className="object-cover" />
          )}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">{title}</h3>
          <p className="text-[#9E9E9E] text-xs truncate">{subtitle}</p>
        </div>
      </div>
      <span className="text-sm shrink-0">Posted by {poster}</span>
    </div>
  );
};