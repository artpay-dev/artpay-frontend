import { useRef } from "react";
import { useCopyToClipboard } from "../hooks/useCopyToClipboard.ts";
import type { CopyableField as CopyableFieldType } from "../types.ts";

interface CopyableFieldProps {
  field: CopyableFieldType;
  className?: string;
}

const CopyableField = ({ field, className = "" }: CopyableFieldProps) => {
  const textRef = useRef<HTMLSpanElement>(null);
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopy = () => {
    copyToClipboard(field.value, `${field.label} copiato`);
  };

  return (
    <li className={`leading-5 ${className}`}>
      <span>
        {field.label}:<br />
        <strong ref={textRef} className="text-base">
          {field.value}
        </strong>
      </span>
      <button
        onClick={handleCopy}
        className="text-primary underline font-normal cursor-pointer block">
        {field.copyText}
      </button>
      {field.warning && (
        <p className="text-[#D49B38] mt-2">
          {field.warning}
        </p>
      )}
    </li>
  );
};

export default CopyableField;