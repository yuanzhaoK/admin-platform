import { NextRequest, NextResponse } from 'next/server';

const DENO_PROXY_URL = 'http://127.0.0.1:8091';

export async function GET(request: NextRequest) {
  try {
    // 获取所有产品数据
    const headers: HeadersInit = {};
    
    // Copy authorization header from the original request
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(`${DENO_PROXY_URL}/api/collections/products/records`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      return new NextResponse(
        JSON.stringify({ 
          success: false, 
          error: 'Failed to fetch products' 
        }),
        {
          status: response.status,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    const data = await response.json();
    const products = data.items || [];

    // 计算统计信息
    const stats = {
      total: products.length,
      active: products.filter((p: any) => p.status === 'active').length,
      inactive: products.filter((p: any) => p.status === 'inactive').length,
      draft: products.filter((p: any) => p.status === 'draft').length,
      categories: products.reduce((acc: Record<string, number>, p: any) => {
        if (p.category) {
          acc[p.category] = (acc[p.category] || 0) + 1;
        }
        return acc;
      }, {}),
      avgPrice: products.length > 0 
        ? products.reduce((sum: number, p: any) => sum + (p.price || 0), 0) / products.length 
        : 0,
      totalStock: products.reduce((sum: number, p: any) => sum + (p.stock || 0), 0)
    };

    return new NextResponse(
      JSON.stringify({ 
        success: true, 
        data: stats 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',  
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      }
    );
  } catch (error) {
    console.error('Products stats API error:', error);
    return new NextResponse(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
} 