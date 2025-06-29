import { apolloClient, handleGraphQLError } from "@/lib/graphql/client";
import {
  CREATE_PRODUCT,
  DELETE_PRODUCT,
  GET_PRODUCT,
  GET_PRODUCTS,
  type ProductInput,
  type ProductQuery,
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

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // 获取单个产品
    const id = searchParams.get("id");
    if (id) {
      const { data, error } = await apolloClient.query({
        query: GET_PRODUCT,
        variables: { id },
        fetchPolicy: "cache-first",
      });

      if (error) {
        const errorResponse = handleGraphQLError(error);
        return new NextResponse(JSON.stringify(errorResponse), {
          status: 400,
          headers: corsHeaders,
        });
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
    }

    // 构建查询参数
    const query: ProductQuery = {
      page: parseInt(searchParams.get("page") || "1"),
      perPage: parseInt(searchParams.get("perPage") || "30"),
    };

    // 处理可选参数
    const status = searchParams.get("status");
    if (status) query.status = status as "active" | "inactive" | "draft";

    const categoryId = searchParams.get("category_id");
    if (categoryId) query.category_id = categoryId;

    const brandId = searchParams.get("brand_id");
    if (brandId) query.brand_id = brandId;

    const productTypeId = searchParams.get("product_type_id");
    if (productTypeId) query.product_type_id = productTypeId;

    const search = searchParams.get("search");
    if (search) query.search = search;

    const sortBy = searchParams.get("sortBy");
    if (sortBy) query.sortBy = sortBy;

    const sortOrder = searchParams.get("sortOrder");
    if (sortOrder) query.sortOrder = sortOrder as "asc" | "desc";

    const priceMin = searchParams.get("priceMin");
    if (priceMin) query.priceMin = parseFloat(priceMin);

    const priceMax = searchParams.get("priceMax");
    if (priceMax) query.priceMax = parseFloat(priceMax);

    const stockMin = searchParams.get("stockMin");
    if (stockMin) query.stockMin = parseInt(stockMin);

    const stockMax = searchParams.get("stockMax");
    if (stockMax) query.stockMax = parseInt(stockMax);

    const tags = searchParams.get("tags");
    if (tags) query.tags = tags.split(",");

    const isFeatured = searchParams.get("is_featured");
    if (isFeatured) query.is_featured = isFeatured === "true";

    const isNew = searchParams.get("is_new");
    if (isNew) query.is_new = isNew === "true";

    const isHot = searchParams.get("is_hot");
    if (isHot) query.is_hot = isHot === "true";

    const isPublished = searchParams.get("is_published");
    if (isPublished) query.is_published = isPublished === "true";

    const reviewStatus = searchParams.get("review_status");
    if (reviewStatus) {
      query.review_status = reviewStatus as "pending" | "approved" | "rejected";
    }

    console.log("🔍 GraphQL查询产品列表:", query);

    // 执行GraphQL查询
    const { data, error } = await apolloClient.query({
      query: GET_PRODUCTS,
      variables: { query },
      fetchPolicy: "cache-first",
    });

    if (error) {
      const errorResponse = handleGraphQLError(error);
      return new NextResponse(JSON.stringify(errorResponse), {
        status: 400,
        headers: corsHeaders,
      });
    }

    return new NextResponse(
      JSON.stringify({
        success: true,
        data: data.products.items,
        pagination: data.products.pagination,
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

export async function POST(request: NextRequest) {
  try {
    const body: ProductInput = await request.json();

    console.log("📝 GraphQL创建产品:", body);

    const { data, errors } = await apolloClient.mutate({
      mutation: CREATE_PRODUCT,
      variables: { input: body },
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
        data: data.createProduct,
        message: "产品创建成功",
      }),
      {
        status: 201,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error("产品API POST错误:", error);
    return new NextResponse(
      JSON.stringify({
        success: false,
        error: "创建产品失败",
        details: error instanceof Error ? error.message : "未知错误",
      }),
      {
        status: 500,
        headers: corsHeaders,
      },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
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

    console.log("✏️ GraphQL更新产品:", { id, ...body });

    const { data, errors } = await apolloClient.mutate({
      mutation: UPDATE_PRODUCT,
      variables: { id, input: body },
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

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
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

    console.log("🗑️ GraphQL删除产品:", id);

    const { data, errors } = await apolloClient.mutate({
      mutation: DELETE_PRODUCT,
      variables: { id },
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

export async function PATCH(request: NextRequest) {
  // PATCH请求复用PUT逻辑
  return PUT(request);
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
