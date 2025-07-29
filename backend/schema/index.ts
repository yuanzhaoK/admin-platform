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
  
  // 基础schema - 使用会员模块的基础定义
  const baseSchema = await readSchemaFile(join(Deno.cwd(), 'schema', 'member', 'base.graphql'));
  schemas.push(baseSchema);
  
  // 公共schema
  const commonBaseSchema = await readSchemaFile(join(Deno.cwd(), 'schema', 'common', 'base.graphql'));
  schemas.push(commonBaseSchema);
  
  // 会员模块schema - 按依赖顺序加载
  const memberSchemas = [
    'level.graphql',    // 会员等级（member.graphql 依赖）
    'points.graphql',   // 积分系统（member.graphql 依赖）
    'tags.graphql',     // 会员标签（member.graphql 依赖）
    'address.graphql',  // 地址管理（独立模块）
    'member.graphql',   // 会员核心（依赖上述所有模块）
  ];
  
  for (const schema of memberSchemas) {
    const content = await readSchemaFile(join(Deno.cwd(), 'schema', 'member', schema));
    if (content) {
      schemas.push(content);
    }
  }
  
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
    'coupon.graphql',
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
    
    // 检查会员模块的关键类型
    const requiredTypes = [
      'type Member',
      'type MemberLevel', 
      'type PointsRecord',
      'type Address',
      'type MemberTag'
    ];
    
    for (const requiredType of requiredTypes) {
      if (!typeDefs.includes(requiredType)) {
        console.error(`❌ 缺少必要的类型定义: ${requiredType}`);
        return false;
      }
    }
    
    console.log('✅ Schema验证通过，包含所有会员模块类型');
    return true;
  } catch (error) {
    console.error('❌ Schema验证失败:', error);
    return false;
  }
}

// 导出schema
export { getTypeDefs as default };
