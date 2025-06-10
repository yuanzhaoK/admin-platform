import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 检查PocketBase连接
    const pbResponse = await fetch('http://localhost:8090/api/health', {
      method: 'GET',
    }).catch(() => null);

    const pbStatus = pbResponse?.ok ? 'healthy' : 'unhealthy';

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        frontend: 'healthy',
        pocketbase: pbStatus,
      },
      version: '1.0.0'
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { status: 500 }
    );
  }
} 