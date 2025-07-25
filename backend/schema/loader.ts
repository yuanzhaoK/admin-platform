/**
 * GraphQL Schema 加载器
 * 负责加载和合并所有 .graphql 文件
 */

import { dirname, fromFileUrl, join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { buildSchema } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";

// 使用 fromFileUrl 来正确处理所有平台的文件URL
const __dirname = dirname(fromFileUrl(import.meta.url));

/**
 * 读取 GraphQL 文件内容
 */
function readGraphQLFile(relativePath: string): string {
  const fullPath = join(__dirname, relativePath);
  try {
    let content = Deno.readTextFileSync(fullPath);
    
    // 如果是 TypeScript 文件，提取其中的 GraphQL schema 字符串
    if (relativePath.endsWith('.ts')) {
      // 匹配 export const mobileTypeDefs = `...` 中的内容
      const match = content.match(/export\s+const\s+mobileTypeDefs\s*=\s*`([^`]*)`/);
      if (match && match[1]) {
        content = match[1];
      }
    }
    
    return content;
  } catch (error) {
    console.warn(`Warning: Could not read GraphQL file: ${fullPath}`, error);
    return '';
  }
}


/**
 * 加载所有 GraphQL schema 文件
 */
export function loadSchema(): string {
  const schemas: string[] = [];

  // 基础 schema
  schemas.push(readGraphQLFile('base.graphql'));

  // 通用 schemas
  schemas.push(readGraphQLFile('common/auth.graphql'));

  // 管理后台 schemas - 只加载实际存在的文件
  schemas.push(readGraphQLFile('admin/user.graphql'));
  schemas.push(readGraphQLFile('admin/product.graphql'));
  schemas.push(readGraphQLFile('admin/category.graphql'));
  schemas.push(readGraphQLFile('admin/brand.graphql'));
  schemas.push(readGraphQLFile('admin/product-type.graphql'));
  schemas.push(readGraphQLFile('admin/order.graphql'));
  schemas.push(readGraphQLFile('admin/refund.graphql'));
  schemas.push(readGraphQLFile('admin/setting.graphql'));
  schemas.push(readGraphQLFile('admin/advertisement.graphql'));
  schemas.push(readGraphQLFile('admin/coupon.graphql'));
  schemas.push(readGraphQLFile('admin/member.graphql'));
  schemas.push(readGraphQLFile('admin/points.graphql'));
  schemas.push(readGraphQLFile('admin/recommendation.graphql'));
  schemas.push(readGraphQLFile('admin/trending.graphql'));
  
  // 移动端 schemas
  schemas.push(readGraphQLFile('mobile/home.graphql')); // 先加载基础类型
  schemas.push(readGraphQLFile('mobile/app.graphql'));  // 再加载应用类型
  
  // 订阅 schemas
  schemas.push(readGraphQLFile('subscriptions.graphql'));

  // 过滤空内容并合并
  const combinedSchema = schemas
    .filter(schema => schema.trim().length > 0)
    .join('\n\n');

  if (!combinedSchema.trim()) {
    throw new Error('No GraphQL schema files found or all files are empty');
  }

  return combinedSchema;
}

/**
 * 构建 GraphQL Schema 对象
 */
export function buildGraphQLSchema() {
  const schemaString = loadSchema();
  
  try {
    return buildSchema(schemaString);
  } catch (error) {
    console.error('Error building GraphQL schema:', error);
    console.error('Schema content preview:');
    console.error(schemaString.substring(0, 500) + '...');
    throw error;
  }
}

/**
 * 验证 Schema 语法
 */
export function validateSchema(): boolean {
  try {
    buildGraphQLSchema();
    console.log('✅ GraphQL Schema validation passed');
    return true;
  } catch (error) {
    console.error('❌ GraphQL Schema validation failed:', error);
    return false;
  }
}

/**
 * 获取类型定义字符串 (用于兼容现有代码)
 */
export function getTypeDefs(): string {
  return loadSchema();
}

// 导出用于向后兼容的类型定义
export const typeDefs = getTypeDefs();
