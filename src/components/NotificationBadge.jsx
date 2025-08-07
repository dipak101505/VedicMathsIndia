import React from 'react';
import { IoMdNotifications } from 'react-icons/io';

const NotificationBadge = ({ count, onClick }) => {
  return (
    <div 
      className="notification-badge-container" 
      onClick={onClick}
      style={{
        position: 'relative',
        display: 'inline-block',
        cursor: 'pointer',
        marginRight: '8px'
      }}
    >
      <IoMdNotifications 
        size={24} 
        color="#4a5568"
        style={{
          transition: 'color 0.2s ease',
        }}
        className="notification-icon"
      />
      
      {count > 0 && (
        <div 
          className="notification-badge"
          style={{
            position: 'absolute',
            top: '-5px',
            right: '-5px',
            backgroundColor: '#ffa600',
            color: 'white',
            borderRadius: '50%',
            width: '18px',
            height: '18px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: '11px',
            fontWeight: 'bold',
            boxShadow: '0 0 0 2px white'
          }}
        >
          {count > 9 ? '9+' : count}
        </div>
      )}
    </div>
  );
};

export default NotificationBadge; 