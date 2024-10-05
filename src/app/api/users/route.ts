import { NextResponse } from 'next/server';

// 이 함수는 실제로는 데이터베이스에서 사용자 데이터를 가져와야 합니다.
// 여기서는 예시를 위해 하드코딩된 데이터를 사용합니다.
const getUsers = async () => {
  return [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'User' },
    { id: 5, name: 'Charlie Davis', email: 'charlie@example.com', role: 'User' },
    { id: 6, name: 'Diana Evans', email: 'diana@example.com', role: 'User' },
    { id: 7, name: 'Ethan Foster', email: 'ethan@example.com', role: 'User' },
    { id: 8, name: 'Fiona Green', email: 'fiona@example.com', role: 'User' },
    { id: 9, name: 'George Harris', email: 'george@example.com', role: 'User' },
    { id: 10, name: 'Hannah Jackson', email: 'hannah@example.com', role: 'User' },
    { id: 11, name: 'Ian King', email: 'ian@example.com', role: 'User' },
    { id: 12, name: 'Julia Lee', email: 'julia@example.com', role: 'User' },
    // 더 많은 사용자 데이터...
  ];
};

export async function GET() {
  try {
    const users = await getUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}