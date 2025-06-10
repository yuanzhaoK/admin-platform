import { NextRequest, NextResponse } from 'next/server';

interface RouteParams {
  params: Promise<{
    functionName: string;
  }>;
}

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const params = await context.params;
  return handleFunctionCall(request, params.functionName, 'GET');
}

export async function POST(
  request: NextRequest,
  context: RouteParams
) {
  const params = await context.params;
  return handleFunctionCall(request, params.functionName, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  const params = await context.params;
  return handleFunctionCall(request, params.functionName, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  const params = await context.params;
  return handleFunctionCall(request, params.functionName, 'DELETE');
}

async function handleFunctionCall(
  request: NextRequest,
  functionName: string,
  method: string
) {
  try {
    // 获取查询参数
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    // 获取请求体参数（如果是POST/PUT）
    let bodyParams = {};
    if (method === 'POST' || method === 'PUT') {
      try {
        const contentType = request.headers.get('content-type');
        if (contentType?.includes('application/json')) {
          bodyParams = await request.json();
        } else if (contentType?.includes('application/x-www-form-urlencoded')) {
          const formData = await request.formData();
          bodyParams = Object.fromEntries(formData.entries());
        }
      } catch {
        // 忽略JSON解析错误，使用空对象
      }
    }

    // 合并参数
    const params = {
      ...queryParams,
      ...bodyParams,
      _method: method,
      _headers: Object.fromEntries(request.headers.entries())
    };

    // 调用函数执行API
    const functionResponse = await fetch(`${request.nextUrl.origin}/api/functions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        functionName,
        params
      })
    });

    const result = await functionResponse.json();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: functionResponse.status }
      );
    }

    // 返回函数执行结果
    return NextResponse.json(result.result, {
      headers: {
        'X-Function-Name': functionName,
        'X-Execution-Time': result.timestamp,
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Function call failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
} 