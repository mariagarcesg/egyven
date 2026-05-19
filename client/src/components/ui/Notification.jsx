import React from 'react';

const Notification = ({ message, type = 'success', onClose }) => {
  if (!message) return null;

  const bgClass = type === 'success' ? 'bg-green-600' : 'bg-red-600';

  return (
    <div className="fixed top-6 right-6 z-[9999]">
      <div className={`${bgClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[220px]`}> 
        <div className="flex-1 text-sm font-medium">{message}</div>
        <button onClick={onClose} className="opacity-90 hover:opacity-100">✕</button>
      </div>
    </div>
  );
};

export default Notification;
