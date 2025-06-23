#!/usr/bin/env -S deno run --allow-read --allow-env

/**
 * GraphQL Schema 验证脚本
 * 验证所有 .graphql 文件的语法正确性
 */

import { validateSchema } from '../schema/loader.ts';

async function main() {
  console.log('🔍 正在验证 GraphQL Schema...\n');
  
  try {
    const isValid = validateSchema();
    
    if (isValid) {
      console.log('\n🎉 所有 GraphQL Schema 文件验证通过！');
      console.log('✅ Schema 语法正确');
      console.log('✅ 类型定义完整');
      console.log('✅ 可以安全部署');
      Deno.exit(0);
    } else {
      console.log('\n❌ Schema 验证失败！');
      console.log('请检查 .graphql 文件中的语法错误');
      Deno.exit(1);
    }
  } catch (error) {
    console.error('\n💥 验证过程中发生错误：');
    console.error(error);
    Deno.exit(1);
  }
}

if (import.meta.main) {
  main();
}