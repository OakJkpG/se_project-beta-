import React from 'react';

const NotificationBar = ({ notification }) => {
  if (!notification.show) return null;

  return (
    <div className={`notification ${notification.type}`}>
      {notification.message}
    </div>
  );
};

export default NotificationBar;