"use client";

import React from "react";
import Image from "next/image";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import { Control, useController } from "react-hook-form";

type InputTypes = "text" | "email" | "number" | "password";

type Props = {
  name: string;
  control?: Control<any>;
  type?: InputTypes;
  placeholder?: string;
  // btnType?: "button" | "submit";
  startIcon?: string | React.ReactNode;
  endIcon?: React.ReactNode;
  disabled?: boolean;
  // onclick?: () => void;
  // children?: React.ReactNode;
  // ispending?: boolean;
  // onfocus?: () => void;
  // onblur?: () => void;

  classname?: string;
  rules?: object;
  onChangeOverride?: (value: string, defaultOnChange: (e: any) => void) => void;
  haserrorState?: boolean;
};

export default function InputWrapper({
  name,
  control,
  type = "text",
  placeholder,
  startIcon,
  endIcon,
  disabled,
  classname,
  rules,
  onChangeOverride,
}: Props) {
  const {
    field: { onChange, value, ref },
    fieldState: { error },
  } = useController({ name, control, rules });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onChangeOverride) {
      onChangeOverride(e.target.value, onChange);
    } else {
      onChange(e);
    }
  };

  return (
    <div className={`flex flex-col w-full ${classname ?? ""}`}>
      <InputGroup className="h-auto py-1.5">
        {startIcon && <InputGroupAddon>{startIcon}</InputGroupAddon>}

        <InputGroupInput
          id={name}
          type={type}
          value={value ?? ""}
          onChange={handleChange}
          ref={ref}
          disabled={disabled}
          placeholder={placeholder}
          className={`${error ? "border-red-500 focus-visible:ring-red-500" : ""}`}
        />

        {endIcon && (
          <InputGroupAddon align="inline-end">{endIcon}</InputGroupAddon>
        )}
      </InputGroup>

      {error && (
        <p className="text-[#FB3748] text-xs mt-1.5 ml-1 transition-all duration-200">
          {error.message}
        </p>
      )}
    </div>
  );
}
