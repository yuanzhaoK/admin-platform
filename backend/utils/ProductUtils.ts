// 产品工具类 - 通用工具函数
import { Product } from "../services/ProductService.ts";

export class ProductUtils {
  /**
   * 格式化价格显示
   */
  public static formatPrice(price: number, currency = '¥'): string {
    return `${currency}${price.toFixed(2)}`;
  }

  /**
   * 格式化产品状态显示
   */
  public static formatStatus(status: Product['status']): string {
    const statusMap = {
      active: '活跃',
      inactive: '停用',
      draft: '草稿',
    };
    return statusMap[status] || status;
  }

  /**
   * 生成产品摘要
   */
  public static generateSummary(product: Product): string {
    const parts = [];
    
    if (product.category) {
      parts.push(`分类: ${product.category}`);
    }
    
    if (product.price) {
      parts.push(`价格: ${this.formatPrice(product.price)}`);
    }
    
    if (product.stock !== undefined) {
      parts.push(`库存: ${product.stock}`);
    }
    
    if (product.tags && product.tags.length > 0) {
      parts.push(`标签: ${product.tags.slice(0, 3).join(', ')}`);
    }
    
    return parts.join(' | ');
  }

  /**
   * 验证SKU格式
   */
  public static isValidSKU(sku: string): boolean {
    // SKU格式: 3个字母-3个字母-数字/字母组合
    const skuPattern = /^[A-Z]{3}-[A-Z]{3}-[A-Z0-9]+$/;
    return skuPattern.test(sku);
  }

  /**
   * 清理和标准化产品名称
   */
  public static sanitizeProductName(name: string): string {
    return name
      .trim()
      .replace(/\s+/g, ' ') // 替换多个空格为单个空格
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // 只保留字母、数字、空格、中文和连字符
      .substring(0, 100); // 限制长度
  }

  /**
   * 验证产品图片URL
   */
  public static isValidImageUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      return allowedExtensions.some(ext => 
        urlObj.pathname.toLowerCase().endsWith(ext)
      );
    } catch {
      return false;
    }
  }

  /**
   * 生成产品搜索关键词
   */
  public static generateSearchKeywords(product: Product): string[] {
    const keywords = [];
    
    // 产品名称分词
    if (product.name) {
      keywords.push(...product.name.split(/\s+/));
    }
    
    // 描述分词
    if (product.description) {
      keywords.push(...product.description.split(/\s+/).slice(0, 10));
    }
    
    // 分类
    if (product.category) {
      keywords.push(product.category);
    }
    
    // 标签
    if (product.tags) {
      keywords.push(...product.tags);
    }
    
    // SKU
    if (product.sku) {
      keywords.push(product.sku);
    }
    
    // 去重并过滤空值
    return [...new Set(keywords)]
      .filter(keyword => keyword && keyword.length >= 2)
      .map(keyword => keyword.toLowerCase());
  }

  /**
   * 计算产品评分（基于各种因素）
   */
  public static calculateProductScore(product: Product): number {
    let score = 0;
    
    // 基础信息完整性 (40分)
    if (product.name) score += 10;
    if (product.description && product.description.length >= 10) score += 10;
    if (product.price && product.price > 0) score += 10;
    if (product.category) score += 10;
    
    // 库存状态 (20分)
    if (product.stock !== undefined) {
      if (product.stock > 0) score += 20;
      else if (product.stock === 0) score += 10; // 至少有库存记录
    }
    
    // 额外信息 (20分)
    if (product.tags && product.tags.length > 0) score += 5;
    if (product.sku) score += 5;
    if (product.images && product.images.length > 0) score += 5;
    if (product.dimensions) score += 5;
    
    // 状态 (20分)
    if (product.status === 'active') score += 20;
    else if (product.status === 'inactive') score += 10;
    else if (product.status === 'draft') score += 5;
    
    return Math.min(score, 100); // 最高100分
  }

  /**
   * 生成产品建议（基于当前数据）
   */
  public static generateSuggestions(product: Product): string[] {
    const suggestions = [];
    
    if (!product.description || product.description.length < 10) {
      suggestions.push('建议添加详细的产品描述');
    }
    
    if (!product.price || product.price <= 0) {
      suggestions.push('请设置合理的产品价格');
    }
    
    if (!product.category) {
      suggestions.push('建议为产品分配分类');
    }
    
    if (!product.tags || product.tags.length === 0) {
      suggestions.push('添加标签有助于产品搜索和分类');
    }
    
    if (!product.sku) {
      suggestions.push('建议设置唯一的SKU编码');
    }
    
    if (product.stock === undefined) {
      suggestions.push('建议设置库存数量');
    }
    
    if (!product.images || product.images.length === 0) {
      suggestions.push('添加产品图片能提升展示效果');
    }
    
    if (product.status === 'draft') {
      suggestions.push('完善信息后可将状态改为"活跃"');
    }
    
    return suggestions;
  }

  /**
   * 比较两个产品的相似度
   */
  public static calculateSimilarity(product1: Product, product2: Product): number {
    let similarity = 0;
    let factors = 0;
    
    // 名称相似度
    if (product1.name && product2.name) {
      const nameSim = this.stringSimilarity(product1.name, product2.name);
      similarity += nameSim * 0.3;
      factors += 0.3;
    }
    
    // 分类相似度
    if (product1.category && product2.category) {
      similarity += (product1.category === product2.category ? 1 : 0) * 0.2;
      factors += 0.2;
    }
    
    // 价格相似度
    if (product1.price && product2.price) {
      const priceDiff = Math.abs(product1.price - product2.price);
      const avgPrice = (product1.price + product2.price) / 2;
      const priceSim = Math.max(0, 1 - priceDiff / avgPrice);
      similarity += priceSim * 0.2;
      factors += 0.2;
    }
    
    // 标签相似度
    if (product1.tags && product2.tags) {
      const tagSim = this.arrayIntersection(product1.tags, product2.tags).length / 
                     Math.max(product1.tags.length, product2.tags.length);
      similarity += tagSim * 0.3;
      factors += 0.3;
    }
    
    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * 字符串相似度计算（简化版）
   */
  private static stringSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * 计算编辑距离
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * 数组交集
   */
  private static arrayIntersection<T>(arr1: T[], arr2: T[]): T[] {
    return arr1.filter(item => arr2.includes(item));
  }

  /**
   * 生成产品缩略图数据
   */
  public static generateProductThumbnail(product: Product): {
    id: string;
    name: string;
    status: string;
    price?: string;
    image?: string;
  } {
    return {
      id: product.id || '',
      name: product.name,
      status: this.formatStatus(product.status),
      price: product.price ? this.formatPrice(product.price) : undefined,
      image: product.images?.[0],
    };
  }

  /**
   * 批量操作结果统计
   */
  public static summarizeBatchOperation(
    total: number, 
    success: number, 
    errors: string[]
  ): {
    total: number;
    success: number;
    failed: number;
    successRate: number;
    errors: string[];
  } {
    const failed = total - success;
    const successRate = total > 0 ? (success / total) * 100 : 0;
    
    return {
      total,
      success,
      failed,
      successRate: Math.round(successRate * 100) / 100,
      errors,
    };
  }
} 