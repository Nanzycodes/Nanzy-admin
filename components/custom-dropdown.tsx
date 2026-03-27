"use client";

import { useState, useRef, useEffect } from "react";
import Image, { StaticImageData } from "next/image";
import { cn } from "../lib/utils";
import { LucideIcon } from "lucide-react";

type Option = {
  label: string;
  value: string;
};

type CustomSelectProps = {
  icon?: string | LucideIcon | StaticImageData;
  placeholder?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function CustomDropdown({
  icon,
  placeholder = "Select option",
  options,
  value,
  onChange,
  className = "",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <div ref={dropdownRef} className={cn("relative w-fit", className)}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 p-3 text-xs rounded-[5px] bg-white border border-border hover:bg-muted transition-all"
      >
        {icon &&
          (typeof icon === "string" ||
          (typeof icon === "object" && "src" in icon) ? (
            <Image
              src={icon}
              alt="icon"
              width={16}
              height={16}
              className="object-contain"
            />
          ) : (
            (() => {
              const Icon = icon as LucideIcon;
              return <Icon size={16} className="object-contain" />;
            })()
          ))}
        <span>{selectedLabel || placeholder}</span>
        <svg
          className={`w-4 h-4 transition-transform ${
            open ? "rotate-180" : "rotate-0"
          }`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-[200px] rounded-2xl border border-[#EBEBEB] bg-white shadow-lg p-2 z-[9999]">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left capitalize text-sm px-3 py-2 rounded-md cursor-pointer hover:bg-gray-100",
                value === option.value
                  ? "bg-gray-100 text-[#171717]"
                  : "text-[#A3A3A3]",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
