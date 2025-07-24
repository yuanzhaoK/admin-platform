// GraphQL Schema 索引文件
import { join } from 'https://deno.land/std@0.208.0/path/mod.ts';

// 读取schema文件
async function readSchemaFile(path: string): Promise<string> {
  try {
    const decoder = new TextDecoder('utf-8');
    const data = await Deno.readFile(path);
    const content = decoder.decode(data);
    console.log(`✅ 成功读取schema文件: ${path}, 内容长度: ${content.length}`);
    return content;
  } catch (error) {
    console.error(`读取schema文件失败: ${path}`, error);
    return '';
  }
}

// 获取所有schema文件
export async function getTypeDefs(): Promise<string> {
  const schemas: string[] = [];
  
  // 基础schema
  const baseSchema = await readSchemaFile(join(Deno.cwd(), 'schema', 'base.graphql'));
  schemas.push(baseSchema);
  
  // 公共schema
  const authSchema = await readSchemaFile(join(Deno.cwd(), 'schema', 'common', 'auth.graphql'));
  schemas.push(authSchema);
  
  // 管理后台schema
  const adminSchemas = [
    'product.graphql',
    'category.graphql',
    'brand.graphql',
    'product-type.graphql',
    'order.graphql',
    'refund.graphql',
    'setting.graphql',
    'user.graphql',
    'member.graphql',
    'coupon.graphql',
    'points.graphql',
    'recommendation.graphql',
    'advertisement.graphql',
    'trending.graphql',
  ];
  
  for (const schema of adminSchemas) {
    const content = await readSchemaFile(join(Deno.cwd(), 'schema', 'admin', schema));
    if (content) {
      schemas.push(content);
    }
  }
  
  // 移动端schema - 只包含移动端特有的类型
  const mobileSchemas = [
    'home.graphql',    // 先加载基础类型
    'member.graphql',  // 再加载会员相关类型
    'app.graphql',     // 最后加载应用类型
  ];
  
  for (const schema of mobileSchemas) {
    const content = await readSchemaFile(join(Deno.cwd(), 'schema', 'mobile', schema));
    if (content) {
      schemas.push(content);
    }
  }
  
  // 订阅schema
  const subscriptionSchema = await readSchemaFile(join(Deno.cwd(), 'schema', 'subscriptions.graphql'));
  schemas.push(subscriptionSchema);
  
  return schemas.join('\n\n');
}

// 验证schema
export async function validateSchema(): Promise<boolean> {
  try {
    const typeDefs = await getTypeDefs();
    if (!typeDefs.trim()) {
      console.error('❌ Schema为空');
      return false;
    }
    
    // 检查必要的schema定义
    if (!typeDefs.includes('type Query')) {
      console.error('❌ 缺少Query类型定义');
      return false;
    }
    
    if (!typeDefs.includes('type Mutation')) {
      console.error('❌ 缺少Mutation类型定义');
      return false;
    }
    
    console.log('✅ Schema验证通过');
    return true;
  } catch (error) {
    console.error('❌ Schema验证失败:', error);
    return false;
  }
}

// 导出schema
export { getTypeDefs as default };
