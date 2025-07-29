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
    
    console.log(`✅ 成功加载schema: ${relativePath}, 长度: ${content.length}`);
    return content;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.warn(`⚠️  无法读取GraphQL文件: ${fullPath}`, errorMessage);
    return '';
  }
}

/**
 * 加载所有 GraphQL schema 文件
 */
export function loadSchema(): string {
  const schemas: string[] = [];

  // 基础 schema - 使用会员模块的完整基础定义
  console.log('📂 加载基础schema...');
  schemas.push(readGraphQLFile('member/base.graphql'));

  // 通用 schemas
  console.log('📂 加载通用schema...');
  schemas.push(readGraphQLFile('common/base.graphql'));

  // 会员模块 schemas - 按依赖关系顺序加载
  console.log('📂 加载会员模块schema...');
  const memberSchemas = [
    'member/level.graphql',    // 会员等级 (Member类型依赖)
    'member/points.graphql',   // 积分系统 (Member类型依赖)
    'member/tags.graphql',     // 会员标签 (Member类型依赖)
    'member/address.graphql',  // 地址管理 (独立模块)
    'member/member.graphql',   // 会员核心 (依赖以上所有模块)
  ];
  
  for (const schema of memberSchemas) {
    const content = readGraphQLFile(schema);
    if (content) {
      schemas.push(content);
    }
  }

  // 管理后台 schemas - 只加载实际存在的文件
  // 注意: admin/points.graphql 已被会员模块的 member/points.graphql 替代，避免重复定义
  console.log('📂 加载管理后台schema...');
  const adminSchemas = [
    'admin/user.graphql',
    'admin/product.graphql', 
    'admin/category.graphql',
    'admin/brand.graphql',
    'admin/product-type.graphql',
    'admin/order.graphql',
    'admin/refund.graphql',
    'admin/setting.graphql',
    'admin/advertisement.graphql',
    'admin/coupon.graphql',
    // 'admin/points.graphql', // 已被会员模块替代
    'admin/recommendation.graphql',
    'admin/trending.graphql',
  ];
  
  for (const schema of adminSchemas) {
    const content = readGraphQLFile(schema);
    if (content) {
      schemas.push(content);
    }
  }
  
  // 移动端 schemas
  console.log('📂 加载移动端schema...');
  const mobileSchemas = [
    'mobile/home.graphql', // 先加载基础类型
    'mobile/app.graphql',  // 再加载应用类型
  ];
  
  for (const schema of mobileSchemas) {
    const content = readGraphQLFile(schema);
    if (content) {
      schemas.push(content);
    }
  }
  
  // 订阅 schemas
  console.log('📂 加载订阅schema...');
  schemas.push(readGraphQLFile('subscriptions.graphql'));

  // 过滤空内容并合并
  const validSchemas = schemas.filter(schema => schema.trim().length > 0);
  const combinedSchema = validSchemas.join('\n\n');

  if (!combinedSchema.trim()) {
    throw new Error('❌ 没有找到有效的GraphQL schema文件或所有文件都为空');
  }

  console.log(`✅ 成功合并 ${validSchemas.length} 个schema文件，总长度: ${combinedSchema.length}`);
  return combinedSchema;
}

/**
 * 构建 GraphQL Schema 对象
 */
export function buildGraphQLSchema() {
  const schemaString = loadSchema();
  
  try {
    const schema = buildSchema(schemaString);
    console.log('✅ GraphQL Schema 构建成功');
    return schema;
  } catch (error) {
    console.error('❌ GraphQL Schema 构建失败:', error);
    console.error('Schema内容预览:');
    console.error(schemaString.substring(0, 500) + '...');
    throw error;
  }
}

/**
 * 验证 Schema 语法和完整性
 */
export function validateSchema(): boolean {
  try {
    const schema = buildGraphQLSchema();
    const schemaString = loadSchema();
    
    // 检查必要的类型定义
    const requiredTypes = [
      'type Query',
      'type Mutation',
      'type Member',
      'type MemberLevel',
      'type PointsRecord',
      'type Address', 
      'type MemberTag',
      'interface BaseEntity',
      'type PaginationInfo'
    ];
    
    const missingTypes = requiredTypes.filter(type => !schemaString.includes(type));
    
    if (missingTypes.length > 0) {
      console.error('❌ 缺少必要的类型定义:', missingTypes);
      return false;
    }
    
    // 检查会员模块的核心枚举
    const requiredEnums = [
      'enum Gender',
      'enum MembershipStatus', 
      'enum PointsType',
      'enum TagType',
      'enum VerificationStatus'
    ];
    
    const missingEnums = requiredEnums.filter(enumType => !schemaString.includes(enumType));
    
    if (missingEnums.length > 0) {
      console.error('❌ 缺少必要的枚举定义:', missingEnums);
      return false;
    }
    
    console.log('✅ GraphQL Schema 验证通过 - 包含完整的会员模块定义');
    return true;
  } catch (error) {
    console.error('❌ GraphQL Schema 验证失败:', error);
    return false;
  }
}

/**
 * 获取类型定义字符串 (用于兼容现有代码)
 */
export function getTypeDefs(): string {
  return loadSchema();
}

/**
 * 获取 Schema 统计信息
 */
export function getSchemaStats(): {
  totalFiles: number;
  totalLength: number;
  memberModuleFiles: number;
  adminFiles: number;
  mobileFiles: number;
} {
  const schemaString = loadSchema();
  
  // 统计不同模块的文件数量（简单估计）
  const memberModuleFiles = (schemaString.match(/# 会员/g) || []).length;
  const adminFiles = (schemaString.match(/# 管理/g) || []).length;  
  const mobileFiles = (schemaString.match(/# 移动/g) || []).length;
  
  return {
    totalFiles: memberModuleFiles + adminFiles + mobileFiles + 2, // +2 for base and subscriptions
    totalLength: schemaString.length,
    memberModuleFiles,
    adminFiles,
    mobileFiles
  };
}

// 导出用于向后兼容的类型定义
export const typeDefs = getTypeDefs();
