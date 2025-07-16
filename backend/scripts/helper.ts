
import { pocketbaseClient } from '../config/pocketbase.ts';

export const pb = pocketbaseClient.getClient();



// 错误处理辅助函数
export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

// 管理员认证
export async function authenticate() {
  try {
    await pocketbaseClient.authenticate();
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

// 删除集合（如果存在）
export async function deleteCollectionIfExists(collectionName: string) {
  try {
    const collections = await pb.collections.getFullList();
    const existingCollection = collections.find(c => c.name === collectionName);
    if (existingCollection) {
      await pb.collections.delete(existingCollection.id);
      console.log(`🗑️ 删除已存在的 ${collectionName} 集合`);
    }
  } catch (error) {
    console.log(`⚠️ 删除 ${collectionName} 集合失败 (可能不存在):`, getErrorMessage(error));
  }
}