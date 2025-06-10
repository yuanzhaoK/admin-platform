import { NextRequest, NextResponse } from 'next/server';

const POCKETBASE_URL = 'http://127.0.0.1:8091';

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
    const url = `${POCKETBASE_URL}/${path}`;
    
    // Get search params from original request
    const searchParams = request.nextUrl.searchParams.toString();
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;
    
    // 记录认证相关请求
    if (path.includes('auth-with-password')) {
      console.log('🔐 Proxying auth request:', {
        method,
        path,
        url: fullUrl,
      });
    }
    
    const headers: HeadersInit = {};
    
    // Copy relevant headers from the original request, excluding encoding headers
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // 排除可能导致编码问题的请求头
    // 不包含 accept-encoding 以避免压缩问题

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

    // 记录认证请求的响应状态
    if (path.includes('auth-with-password')) {
      console.log('🔐 Auth response status:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });
    }

    // 获取响应内容
    const responseBody = await response.text();
    
    // 构建响应头，排除可能导致解码问题的头部
    const responseHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    };

    // 复制响应头，但排除编码相关的头部
    for (const [key, value] of response.headers.entries()) {
      const lowerKey = key.toLowerCase();
      // 排除可能导致内容解码问题的头部
      if (!['content-encoding', 'transfer-encoding'].includes(lowerKey)) {
        responseHeaders[key] = value;
      }
    }

    // 确保Content-Type正确设置
    if (response.headers.get('content-type')?.includes('application/json')) {
      responseHeaders['Content-Type'] = 'application/json; charset=utf-8';
    }
    
    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Proxy request failed', details: error instanceof Error ? error.message : 'Unknown error' }),
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