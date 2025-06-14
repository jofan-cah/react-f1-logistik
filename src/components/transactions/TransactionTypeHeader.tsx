import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TransactionTypeHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  iconBgColor: string;
  iconColor: string;
  guidelines?: {
    title: string;
    items: string[];
    bgColor: string;
    borderColor: string;
    textColor: string;
    titleColor: string;
  };
}

const TransactionTypeHeader: React.FC<TransactionTypeHeaderProps> = ({
  icon: Icon,
  title,
  subtitle,
  iconBgColor,
  iconColor,
  guidelines
}) => {
  return (
    <>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className={`p-2 ${iconBgColor} rounded-lg`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {subtitle}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      {guidelines && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className={`${guidelines.bgColor} border ${guidelines.borderColor} rounded-lg p-4`}>
            <div className="flex items-start">
              <Icon className={`h-5 w-5 ${iconColor} mt-0.5 mr-3`} />
              <div>
                <h3 className={`text-sm font-medium ${guidelines.titleColor}`}>{guidelines.title}</h3>
                <div className={`mt-1 text-sm ${guidelines.textColor}`}>
                  <ul className="list-disc list-inside space-y-1">
                    {guidelines.items.map((item, index) => (
                      <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TransactionTypeHeader;