import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'yellow' | 'red';
  subtitle?: string;
}

const colorClasses = {
  blue: 'bg-blue-500 text-blue-50',
  green: 'bg-green-500 text-green-50',
  yellow: 'bg-yellow-500 text-yellow-50',
  red: 'bg-red-500 text-red-50'
};

const bgColorClasses = {
  blue: 'bg-blue-50 border-blue-200',
  green: 'bg-green-50 border-green-200',
  yellow: 'bg-yellow-50 border-yellow-200',
  red: 'bg-red-50 border-red-200'
};

export default function StatCard({ title, value, icon: Icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`${bgColorClasses[color]} border-l-4 rounded-lg p-3 sm:p-6 shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs sm:text-sm font-medium">{title}</p>
          <p className="text-xl sm:text-3xl font-bold text-gray-800 mt-1">{value}</p>
          {subtitle && (
            <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-2 sm:p-3 rounded-full`}>
          <Icon size={20} className="sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
}