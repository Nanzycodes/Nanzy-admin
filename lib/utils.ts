import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

//images
export const nanzyLogo = "/images/nanzy-logo.jpg";
export { default as contentMiniImg } from "./../public/images/content-image.png";
export { default as sellerMiniImg } from "./../public/images/seller-mini.png";

//icons
export { default as userAvatar } from "./../public/images/user-avatar.svg";
export { default as BoxDiagonalArrow } from "./../public/images/box-diagonal-arrow.svg";
export { default as BoxTrendUp } from "./../public/images/box-trend.svg";
export { default as BoxTealTime } from "./../public/images/teal-box-time.svg";
export { default as TealPackage } from "./../public/images/teal-box-package.svg";

export const periodOptions = [
  { label: "Daily", value: "1d", text: "day" },
  { label: "Weekly", value: "7d", text: "week" },
  { label: "Monthly", value: "30d", text: "month" },
  { label: "Yearly", value: "1y", text: "year" },
];
