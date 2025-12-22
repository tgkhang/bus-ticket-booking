import React from "react";

interface ChartPlaceholderProps {
  label: string;
}

export default function ChartPlaceholder({ label }: ChartPlaceholderProps) {
  return (
    <div className="flex-1 flex items-center justify-center text-gray-400 h-full">
      {label} Placeholder
    </div>
  );
}
