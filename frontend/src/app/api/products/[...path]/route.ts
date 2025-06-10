import { NextRequest, NextResponse } from 'next/server';

const DENO_PROXY_URL = 'http://127.0.0.1:8091';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'POST');
}

export async function PUT(
  request: NextRequest, 
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  return proxyRequest(request, resolvedParams.path, 'PATCH');
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}

async function proxyRequest(request: NextRequest, pathParts: string[], method: string) {
  try {
    const path = pathParts.join('/');
    const url = new URL(request.url);
    const searchParams = url.searchParams.toString();
    
    // 对于具体的产品ID操作，直接代理到PocketBase collections API
    const fullUrl = `${DENO_PROXY_URL}/api/collections/products/records/${path}${searchParams ? `?${searchParams}` : ''}`;
    
    console.log(`🔄 Proxying ${method} request to: ${fullUrl}`);
    
    const headers: HeadersInit = {};
    
    // Copy relevant headers from the original request
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    let body: string | FormData | undefined;
    
    if (method !== 'GET' && method !== 'DELETE') {
      try {
        if (contentType?.includes('application/json')) {
          body = await request.text();
        } else if (contentType?.includes('multipart/form-data')) {
          body = await request.formData();
        } else {
          body = await request.text();
        }
      } catch (error) {
        console.warn('Failed to read request body:', error);
      }
    }

    const response = await fetch(fullUrl, {
      method,
      headers,
      body,
    });

    const responseBody = await response.text();
    
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Content-Type': 'application/json; charset=utf-8'
    };

    if (response.ok) {
      // 处理成功响应 - 转换PocketBase格式为前端期望格式
      try {
        const data = JSON.parse(responseBody);
        const apiResponse = {
          success: true,
          data: data
        };
        return new NextResponse(JSON.stringify(apiResponse), {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (parseError) {
        // 如果解析失败，返回原始响应
        return new NextResponse(responseBody, {
          status: response.status,
          headers: responseHeaders,
        });
      }
    } else {
      // 处理错误响应
      try {
        const errorData = JSON.parse(responseBody);
        const apiResponse = {
          success: false,
          error: errorData.message || 'Request failed',
          data: errorData.data || {}
        };
        return new NextResponse(JSON.stringify(apiResponse), {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (parseError) {
        // 如果解析失败，返回通用错误
        const apiResponse = {
          success: false,
          error: 'Request failed'
        };
        return new NextResponse(JSON.stringify(apiResponse), {
          status: response.status,
          headers: responseHeaders,
        });
      }
    }
  } catch (error) {
    console.error('Products API proxy error:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Products API request failed', 
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