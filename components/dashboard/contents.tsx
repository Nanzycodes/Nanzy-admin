"use client";

import React from "react";

type TopContent = {
  id?: string | number;
  title?: string;
  views_count?: number;
  content_type?: string;
  owner_name?: string;
};

interface ContentsProps {
  data?: TopContent[] | null;
}

const Contents = ({ data }: ContentsProps) => {
  if (!data) return null;
  if (data.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No content yet. Sample content appears when sample data is enabled.
      </p>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6 py-4">
      {data.map((item, i) => (
        <ContentItem
          key={item.id || i}
          title={item?.title}
          subtitle={`${item?.views_count ?? 0} views · ${item?.content_type ?? ""}`}
          poster={item?.owner_name}
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
  classname,
}: {
  title?: TopContent["title"];
  subtitle?: string;
  poster?: TopContent["owner_name"];
  classname?: string;
}) => {
  return (
    <div className={`w-full flex justify-between items-center pb-2.5 ${classname}`}>
      <div className="flex items-center gap-2.5 sm:gap-4">
        {/* <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center">
          {image ? (
            <img src={image} alt={title} className="w-full h-full object-cover" />
          ) : (
            <Image src={contentMiniImg} alt="content" width={40} height={40} className="object-cover" />
          )}
        </div> */}
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">{title}</h3>
          <p className="text-[#9E9E9E] text-xs truncate">{subtitle}</p>
        </div>
      </div>
      <span className="text-sm shrink-0">Posted by {poster}</span>
    </div>
  );
};