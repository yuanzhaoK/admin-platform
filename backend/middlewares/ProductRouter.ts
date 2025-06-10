// 产品路由处理器
import { ProductController } from "./ProductController.ts";

export class ProductRouter {
  private controller: ProductController;

  constructor() {
    this.controller = new ProductController();
  }

  /**
   * 处理产品相关的路由请求
   */
  public async handleRequest(request: Request, pathParts: string[]): Promise<Response> {
    const method = request.method.toLowerCase();
    const [resource, id, action] = pathParts;

    try {
      // GET /api/products - 获取产品列表
      if (method === 'get' && resource === 'products' && !id) {
        const result = await this.controller.getProducts(request);
        return this.createResponse(result);
      }

      // GET /api/products/:id - 获取单个产品
      if (method === 'get' && resource === 'products' && id && !action) {
        const result = await this.controller.getProduct(id);
        return this.createResponse(result);
      }

      // POST /api/products - 创建产品
      if (method === 'post' && resource === 'products' && !id) {
        const result = await this.controller.createProduct(request);
        return this.createResponse(result);
      }

      // PUT /api/products/:id - 更新产品
      if (method === 'put' && resource === 'products' && id && !action) {
        const result = await this.controller.updateProduct(id, request);
        return this.createResponse(result);
      }

      // DELETE /api/products/:id - 删除产品
      if (method === 'delete' && resource === 'products' && id && !action) {
        const result = await this.controller.deleteProduct(id);
        return this.createResponse(result);
      }

      // GET /api/products/stats - 获取产品统计
      if (method === 'get' && resource === 'products' && id === 'stats') {
        const result = await this.controller.getProductStats();
        return this.createResponse(result);
      }

      // GET /api/products/export - 导出产品
      if (method === 'get' && resource === 'products' && id === 'export') {
        return await this.controller.exportProducts(request);
      }

      // POST /api/products/batch/status - 批量更新状态
      if (method === 'post' && resource === 'products' && id === 'batch' && action === 'status') {
        const result = await this.controller.batchUpdateStatus(request);
        return this.createResponse(result);
      }

      // DELETE /api/products/batch - 批量删除
      if (method === 'delete' && resource === 'products' && id === 'batch') {
        const result = await this.controller.batchDelete(request);
        return this.createResponse(result);
      }

      // 404 - 路由不存在
      return this.createResponse({
        success: false,
        error: '路由不存在',
      }, 404);

    } catch (error) {
      console.error('路由处理错误:', error);
      return this.createResponse({
        success: false,
        error: error instanceof Error ? error.message : '服务器内部错误',
      }, 500);
    }
  }

  /**
   * 创建标准化的响应
   */
  private createResponse(data: any, status = 200): Response {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    });

    return new Response(JSON.stringify(data, null, 2), {
      status,
      headers,
    });
  }

  /**
   * 处理CORS预检请求
   */
  public handleOptions(): Response {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
} 