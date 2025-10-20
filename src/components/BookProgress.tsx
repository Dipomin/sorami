import React from "react";
import { calculateProgress } from "../lib/utils";

interface BookProgressProps {
  current: number;
  total: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

const BookProgress: React.FC<BookProgressProps> = ({
  current,
  total,
  label = "Progression",
  showPercentage = true,
  className = "",
}) => {
  const percentage = calculateProgress(current, total);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>{label}</span>
        <span>
          {current} / {total}
          {showPercentage && ` (${percentage}%)`}
        </span>
      </div>
      <div className="bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default BookProgress;
