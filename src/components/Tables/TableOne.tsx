'use client';
import React, { useState, useEffect } from 'react';
import DataGrid from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

const columns = [
  { key: 'id', name: 'ID' },
  { key: 'name', name: 'Name' },
  { key: 'email', name: 'Email' },
  { key: 'role', name: 'Role' }
];

const UserGrid: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <div>
      <h1>User List</h1>
      <DataGrid
        columns={columns}
        rows={users}
        style={{ height: 400 }}
      />
    </div>
  );
};

export default UserGrid;