import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 8, text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2 className={`w-${size} h-${size} text-nepali-blue animate-spin mb-2`} />
      <p className="text-gray-600 text-sm">{text}</p>
    </div>
  );
};

export default LoadingSpinner;