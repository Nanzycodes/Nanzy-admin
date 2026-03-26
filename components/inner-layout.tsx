import React from "react";

const InnerLayout = ({
  children,
  sectionHeader,
  sectionSubheader,
}: {
  children: React.ReactNode;
  sectionHeader: string;
  sectionSubheader?: string;
}) => {
  return (
    <div className="flex flex-col gap-y-7 max-w-6xl">
      <div className="flex flex-col gap-y-1">
        <h1 className="font-mono text-[28px] font-bold">{sectionHeader}</h1>
        {sectionSubheader && (
          <p className="font-normal text-base leading-[140%] tracking-[-0.01em] text-[#616161]">
            {sectionSubheader}
          </p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
};

export default InnerLayout;
