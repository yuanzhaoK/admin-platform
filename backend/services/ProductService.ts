// 产品服务 - 业务逻辑层
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// 产品数据验证Schema
export const ProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "产品名称不能为空").max(100, "产品名称不能超过100个字符"),
  description: z.string().max(500, "产品描述不能超过500个字符").optional(),
  price: z.number().min(0, "价格不能为负数").optional(),
  category: z.string().max(50, "分类名称不能超过50个字符").optional(),
  status: z.enum(["active", "inactive", "draft"]).default("draft"),
  tags: z.array(z.string()).optional(),
  config: z.record(z.any()).optional(),
  sku: z.string().max(50, "SKU不能超过50个字符").optional(),
  stock: z.number().min(0, "库存不能为负数").optional(),
  weight: z.number().min(0, "重量不能为负数").optional(),
  dimensions: z.object({
    length: z.number().min(0).optional(),
    width: z.number().min(0).optional(),
    height: z.number().min(0).optional(),
  }).optional(),
  images: z.array(z.string()).optional(),
  meta_data: z.record(z.any()).optional(),
  created: z.string().optional(),
  updated: z.string().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// 产品创建请求Schema
export const CreateProductSchema = ProductSchema.omit({ 
  id: true, 
  created: true, 
  updated: true 
});

// 产品更新请求Schema
export const UpdateProductSchema = ProductSchema.partial().omit({ 
  id: true, 
  created: true, 
  updated: true 
});

// 产品查询参数Schema
export const ProductQuerySchema = z.object({
  page: z.number().min(1).default(1),
  perPage: z.number().min(1).max(100).default(20),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(["name", "price", "created", "updated"]).default("created"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export class ProductService {
  private static instance: ProductService;
  
  private constructor() {}
  
  public static getInstance(): ProductService {
    if (!ProductService.instance) {
      ProductService.instance = new ProductService();
    }
    return ProductService.instance;
  }

  /**
   * 验证产品数据
   */
  public validateProduct(data: unknown, schema = ProductSchema): Product {
    const result = schema.safeParse(data);
    if (!result.success) {
      throw new Error(`数据验证失败: ${result.error.issues.map((i: any) => i.message).join(", ")}`);
    }
    return result.data;
  }

  /**
   * 验证产品创建数据
   */
  public validateCreateProduct(data: unknown): Omit<Product, 'id' | 'created' | 'updated'> {
    const result = CreateProductSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`数据验证失败: ${result.error.issues.map((i: any) => i.message).join(", ")}`);
    }
    return result.data;
  }

  /**
   * 验证产品更新数据
   */
  public validateUpdateProduct(data: unknown): Partial<Omit<Product, 'id' | 'created' | 'updated'>> {
    const result = UpdateProductSchema.safeParse(data);
    if (!result.success) {
      throw new Error(`数据验证失败: ${result.error.issues.map((i: any) => i.message).join(", ")}`);
    }
    return result.data;
  }

  /**
   * 验证查询参数
   */
  public validateQuery(data: unknown): ProductQuery {
    const result = ProductQuerySchema.safeParse(data);
    if (!result.success) {
      throw new Error(`查询参数验证失败: ${result.error.issues.map((i: any) => i.message).join(", ")}`);
    }
    return result.data;
  }

  /**
   * 生成唯一SKU
   */
  public generateSKU(name: string, category?: string): string {
    const timestamp = Date.now().toString(36);
    const prefix = category ? category.substring(0, 3).toUpperCase() : "PRD";
    const nameCode = name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, "");
    return `${prefix}-${nameCode}-${timestamp}`;
  }

  /**
   * 格式化产品数据用于创建
   */
  public formatForCreate(data: Partial<Product>): Omit<Product, 'id'> {
    const now = new Date().toISOString();
    
    return {
      ...data,
      name: data.name || "",
      status: data.status || "draft",
      sku: data.sku || this.generateSKU(data.name || "", data.category),
      tags: data.tags || [],
      config: data.config || {},
      meta_data: data.meta_data || {},
      created: now,
      updated: now,
    } as Omit<Product, 'id'>;
  }

  /**
   * 格式化产品数据用于更新
   */
  public formatForUpdate(data: Partial<Product>): Partial<Product> {
    return {
      ...data,
      updated: new Date().toISOString(),
    };
  }

  /**
   * 检查产品名称是否重复
   */
  public async checkNameDuplicate(name: string, excludeId?: string): Promise<boolean> {
    // 这里需要与数据库交互，暂时返回false
    // 在实际应用中，这里应该查询数据库
    return false;
  }

  /**
   * 检查SKU是否重复
   */
  public async checkSKUDuplicate(sku: string, excludeId?: string): Promise<boolean> {
    // 这里需要与数据库交互，暂时返回false
    // 在实际应用中，这里应该查询数据库
    return false;
  }

  /**
   * 计算产品统计信息
   */
  public calculateStats(products: Product[]): {
    total: number;
    active: number;
    inactive: number;
    draft: number;
    categories: Record<string, number>;
    avgPrice: number;
    totalStock: number;
  } {
    const stats = {
      total: products.length,
      active: 0,
      inactive: 0,
      draft: 0,
      categories: {} as Record<string, number>,
      avgPrice: 0,
      totalStock: 0,
    };

    let totalPrice = 0;
    let priceCount = 0;

    for (const product of products) {
      // 状态统计
      const status = product.status as keyof typeof stats;
      if (typeof stats[status] === 'number') {
        (stats[status] as number)++;
      }

      // 分类统计
      if (product.category) {
        stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
      }

      // 价格统计
      if (product.price && product.price > 0) {
        totalPrice += product.price;
        priceCount++;
      }

      // 库存统计
      if (product.stock) {
        stats.totalStock += product.stock;
      }
    }

    stats.avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;

    return stats;
  }

  /**
   * 搜索和过滤产品
   */
  public filterProducts(products: Product[], query: ProductQuery): Product[] {
    let filtered = [...products];

    // 状态过滤
    if (query.status) {
      filtered = filtered.filter(p => p.status === query.status);
    }

    // 分类过滤
    if (query.category) {
      filtered = filtered.filter(p => p.category === query.category);
    }

    // 搜索过滤
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower) ||
        p.tags?.some((tag: string) => tag.toLowerCase().includes(searchLower))
      );
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (query.sortBy) {
        case "name":
          aValue = a.name;
          bValue = b.name;
          break;
        case "price":
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case "created":
          aValue = new Date(a.created || 0);
          bValue = new Date(b.created || 0);
          break;
        case "updated":
          aValue = new Date(a.updated || 0);
          bValue = new Date(b.updated || 0);
          break;
        default:
          aValue = a.created || "";
          bValue = b.created || "";
      }

      if (query.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }

  /**
   * 分页处理
   */
  public paginateProducts(products: Product[], query: ProductQuery): {
    items: Product[];
    page: number;
    perPage: number;
    totalPages: number;
    totalItems: number;
  } {
    const startIndex = (query.page - 1) * query.perPage;
    const endIndex = startIndex + query.perPage;
    const items = products.slice(startIndex, endIndex);

    return {
      items,
      page: query.page,
      perPage: query.perPage,
      totalPages: Math.ceil(products.length / query.perPage),
      totalItems: products.length,
    };
  }

  /**
   * 导出产品数据
   */
  public exportProducts(products: Product[], format: "json" | "csv" = "json"): string {
    if (format === "csv") {
      const headers = ["ID", "名称", "描述", "价格", "分类", "状态", "SKU", "库存", "创建时间"];
      const rows = products.map(p => [
        p.id || "",
        p.name,
        p.description || "",
        p.price?.toString() || "",
        p.category || "",
        p.status,
        p.sku || "",
        p.stock?.toString() || "",
        p.created || "",
      ]);
      
      return [headers, ...rows].map(row => row.join(",")).join("\n");
    }

    return JSON.stringify(products, null, 2);
  }

  /**
   * 批量操作
   */
  public async batchUpdateStatus(productIds: string[], status: Product["status"]): Promise<void> {
    // 这里应该与数据库交互进行批量更新
    console.log(`批量更新产品状态: ${productIds.length} 个产品 -> ${status}`);
  }

  /**
   * 批量删除
   */
  public async batchDelete(productIds: string[]): Promise<void> {
    // 这里应该与数据库交互进行批量删除
    console.log(`批量删除产品: ${productIds.length} 个产品`);
  }
} 