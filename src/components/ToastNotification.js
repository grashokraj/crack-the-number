import React, { useEffect } from "react";

/*
  Toast Notification Component
  Auto-dismisses after 3 seconds
  Types: 'info' (default), 'success', 'error', 'warning'
*/

export function ToastNotification({ message, type = 'info', onDismiss, id }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 3000);

    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '🎉';
      case 'error':
        return '⚠️';
      case 'warning':
        return '💡';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div className={`toast ${type}`}>
      <span>{getIcon()}</span>
      <span style={{ flex: 1, fontWeight: 500 }}>{message}</span>
    </div>
  );
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastNotification
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

// Toast utility function to be used globally
let toastId = 0;
export const createToastManager = (addToastFn) => {
  return {
    showToast: (message, type = 'info') => {
      const id = toastId++;
      addToastFn({
        id,
        message,
        type,
      });
      return id;
    },
  };
};
