import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999]">
      <div className={`px-6 py-3 rounded-md shadow-lg ${getBackgroundColor()} text-white transition-all duration-300 ease-in-out`}>
        {message}
      </div>
    </div>
  );
};

export default Toast;
