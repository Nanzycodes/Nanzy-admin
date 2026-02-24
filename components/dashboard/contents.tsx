import React from "react";
import Image from "next/image";
import { contentMiniImg } from "@/lib/utils";

const Contents = () => {
  const overviewRow = Array(4).fill(0);

  return (
    <div className="w-full h-[-webkit-fill-available] flex flex-col gap-6 py-6.5">
      {overviewRow.map((_, i) => (
        <div key={i} className="w-full">
          <ContentItem />
        </div>
      ))}
    </div>
  );
};

export default Contents;

export const ContentItem = ({ classname }: { classname?: string }) => {
  return (
    <div
      className={`w-full flex justify-between items-center ${classname} pb-2.5 `}
    >
      <div className="flex items-center gap-2.5 sm:gap-4.5">
        <Image src={contentMiniImg} alt="home-alt" />
        <div className="min-w-0">
          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">
            The best hand made Denims
          </h3>
          <p className="text-[#9E9E9E] text-xs truncate">
            The best handmade Denims you can find in Lagos
          </p>
        </div>
      </div>

      <span className=" text-sm ">Posted by Olamade</span>
    </div>
  );
};
