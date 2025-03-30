import React from 'react';

const ProfileHeader = ({ user, role }) => (
  <div className="profile-header">
    <img
      src={user.profile_image || `/${role}_default.jpg`}
      alt="Profile"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = `/${role}_default.jpg`;
      }}
    />
    <h2>{user.name}</h2>
    <div className={`account-badge ${role}`}>{role}</div>
  </div>
);

export default ProfileHeader;