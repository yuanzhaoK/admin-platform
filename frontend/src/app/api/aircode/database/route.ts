import { NextResponse } from 'next/server';

interface DatabaseTable {
  name: string;
  records: Record<string, unknown>[];
  columns: { name: string; type: string }[];
}

// 模拟数据库表
const mockTables: DatabaseTable[] = [
  {
    name: 'users',
    records: [
      { id: '1', name: 'Alice', email: 'alice@example.com', createdAt: '2024-01-01T00:00:00Z' },
      { id: '2', name: 'Bob', email: 'bob@example.com', createdAt: '2024-01-01T00:00:00Z' },
      { id: '3', name: 'Charlie', email: 'charlie@example.com', createdAt: '2024-01-01T00:00:00Z' }
    ],
    columns: [
      { name: 'id', type: 'string' },
      { name: 'name', type: 'string' },
      { name: 'email', type: 'string' },
      { name: 'createdAt', type: 'date' }
    ]
  },
  {
    name: 'posts',
    records: [
      { id: '1', title: 'Hello World', content: 'This is my first post', authorId: '1', published: true },
      { id: '2', title: 'AirCode Tutorial', content: 'How to use AirCode effectively', authorId: '2', published: true },
      { id: '3', title: 'Draft Post', content: 'This is a draft', authorId: '1', published: false }
    ],
    columns: [
      { name: 'id', type: 'string' },
      { name: 'title', type: 'string' },
      { name: 'content', type: 'text' },
      { name: 'authorId', type: 'string' },
      { name: 'published', type: 'boolean' }
    ]
  }
];

// GET - 获取数据库表信息
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      tables: mockTables.map(table => ({
        name: table.name,
        recordCount: table.records.length,
        columns: table.columns,
        lastUpdated: new Date().toISOString()
      }))
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch database tables' },
      { status: 500 }
    );
  }
} 