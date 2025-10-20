import React from "react";
import { translateStatus, getStatusColor } from "../lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className = "",
}) => {
  return (
    <span
      className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
        status
      )} ${className}`}
    >
      {translateStatus(status)}
    </span>
  );
};

export default StatusBadge;
