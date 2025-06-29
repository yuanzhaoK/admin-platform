import { apolloClient, handleGraphQLError } from "@/lib/graphql/client";
import { GET_PRODUCT_STATS } from "@/lib/graphql/queries/product";
import { NextResponse } from "next/server";

// CORS 头配置
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Requested-With",
  "Content-Type": "application/json; charset=utf-8",
};

export async function GET() {
  try {
    console.log("📊 GraphQL查询产品统计数据...");

    // 执行GraphQL查询获取产品统计信息
    const { data, error } = await apolloClient.query({
      query: GET_PRODUCT_STATS,
      fetchPolicy: "no-cache", // 统计数据不使用缓存，确保获取最新数据
    });

    if (error) {
      const errorResponse = handleGraphQLError(error);
      return new NextResponse(JSON.stringify(errorResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    console.log("✅ 产品统计数据获取成功:", data.productStats);

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data.productStats,
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品统计API错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "获取产品统计失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type, Authorization, X-Requested-With",
      "Access-Control-Max-Age": "86400",
    },
  });
}
