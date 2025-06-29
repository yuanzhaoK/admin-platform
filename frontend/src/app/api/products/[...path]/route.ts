import { apolloClient, handleGraphQLError } from "@/lib/graphql/client";
import {
  DELETE_PRODUCT,
  DUPLICATE_PRODUCT,
  GET_PRODUCT,
  type ProductUpdateInput,
  UPDATE_PRODUCT,
} from "@/lib/graphql/queries/product";
import { NextRequest, NextResponse } from "next/server";

// CORS 头配置
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.path[0];

    if (!productId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "缺少产品ID",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    console.log("🔍 GraphQL查询单个产品:", productId);

    const { data, error } = await apolloClient.query({
      query: GET_PRODUCT,
      variables: { id: productId },
      fetchPolicy: "cache-first",
    });

    if (error) {
      const errorResponse = handleGraphQLError(error);
      return new NextResponse(JSON.stringify(errorResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    if (!data.product) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "产品不存在",
        }),
        {
          status: 404,
          headers: corsHeaders,
        },
      );
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data.product,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品API GET错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "获取产品失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const action = resolvedParams.path[1]; // 例如: duplicate
    const productId = resolvedParams.path[0];

    if (!productId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "缺少产品ID",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    // 处理产品复制操作
    if (action === "duplicate") {
      console.log("📋 GraphQL复制产品:", productId);

      const { data, errors } = await apolloClient.mutate({
        mutation: DUPLICATE_PRODUCT,
        variables: { id: productId },
      });

      if (errors) {
        const errorResponse = handleGraphQLError({ graphQLErrors: errors });
        return new NextResponse(JSON.stringify(errorResponse), {
          status: 400,
          headers: corsHeaders,
        });
      }

      return new NextResponse(
        JSON.stringify({
          success: true,
          data: data.duplicateProduct,
          message: "产品复制成功",
        }),
        {
          status: 201,
          headers: corsHeaders,
        },
      );
    }

    // 未知操作
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "不支持的操作",
      }),
      {
        status: 400,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品API POST错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "操作失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.path[0];

    if (!productId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "缺少产品ID",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    const body: ProductUpdateInput = await request.json();

    console.log("✏️ GraphQL更新产品 (动态路径):", { id: productId, ...body });

    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_PRODUCT,
      variables: { id: productId, input: body },
    });

    if (errors) {
      const errorResponse = handleGraphQLError({ graphQLErrors: errors });
      return new NextResponse(JSON.stringify(errorResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data.updateProduct,
        message: "产品更新成功",
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品API PUT错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "更新产品失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  try {
    const resolvedParams = await params;
    const productId = resolvedParams.path[0];

    if (!productId) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "缺少产品ID",
        }),
        {
          status: 400,
          headers: corsHeaders,
        },
      );
    }

    console.log("🗑️ GraphQL删除产品 (动态路径):", productId);

    const { data, errors } = await apolloClient.mutate({
      mutation: DELETE_PRODUCT,
      variables: { id: productId },
    });

    if (errors) {
      const errorResponse = handleGraphQLError({ graphQLErrors: errors });
      return new NextResponse(JSON.stringify(errorResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data.deleteProduct,
        message: "产品删除成功",
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品API DELETE错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "删除产品失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  // PATCH请求复用PUT逻辑
  return PUT(request, { params });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
