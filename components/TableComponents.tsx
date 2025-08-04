import React from "react";

export const TableHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = "" }) => (
  <th
    className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
  >
    {children}
  </th>
);

export const TableCell: React.FC<{
  children: React.ReactNode;
  className?: string;
  title?: string;
}> = ({ children, className = "", title }) => (
  <td
    className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}
    title={title}
  >
    {children}
  </td>
);