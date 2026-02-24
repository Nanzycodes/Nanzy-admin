import React from "react";

const InnerLayout = ({
  children,
  sectionHeader,
}: {
  children: React.ReactNode;
  sectionHeader: string;
}) => {
  return (
    <div className="flex flex-col gap-y-7 max-w-6xl">
      <h1 className="font-mono text-[28px] font-bold">{sectionHeader}</h1>
      <div>{children}</div>
    </div>
  );
};

export default InnerLayout;
