// src/pages/user-levels/UserLevels.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import UserLevelsList from './UserLevelsList';
import UserLevelForm from './UserLevelForm';
import UserLevelDetail from './UserLevelDetail';

const UserLevels: React.FC = () => {
  return (
    <Routes>
      {/* List view */}
      <Route index element={<UserLevelsList />} />
      
      {/* Create new user level */}
      <Route path="create" element={<UserLevelForm mode="create" />} />
      
      {/* Edit user level */}
      <Route path="edit/:id" element={<UserLevelForm mode="edit" />} />
      
      {/* View user level details */}
      <Route path=":id" element={<UserLevelDetail />} />
      
      {/* Catch all - redirect to list */}
      <Route path="*" element={<Navigate to="/user-levels" replace />} />
    </Routes>
  );
};

export default UserLevels;