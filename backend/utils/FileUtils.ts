import { pocketbaseClient } from '../config/pocketbase.ts';

const pb = pocketbaseClient.getClient();

export class FileUtils {
  /**
   * 获取文件的完整 URL
   * @param record 记录对象
   * @param fieldName 文件字段名
   * @returns 文件的完整 URL
   */
  static getFileUrl(record: any, fieldName: string): string | null {
    if (!record || !record[fieldName]) {
      return null;
    }
    
    return pb.files.getUrl(record, fieldName);
  }

  /**
   * 获取多个文件的 URL 数组
   * @param record 记录对象
   * @param fieldName 文件字段名
   * @returns 文件 URL 数组
   */
  static getFileUrls(record: any, fieldName: string): string[] {
    if (!record || !record[fieldName]) {
      return [];
    }
    
    const files = Array.isArray(record[fieldName]) ? record[fieldName] : [record[fieldName]];
    return files.map(file => pb.files.getUrl(record, fieldName, file));
  }

  /**
   * 上传文件到指定集合
   * @param collectionId 集合 ID
   * @param fieldName 字段名
   * @param file 文件对象
   * @returns 上传后的文件信息
   */
  static async uploadFile(collectionId: string, fieldName: string, file: File) {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    return await pb.collection(collectionId).create(formData);
  }

  /**
   * 更新记录中的文件
   * @param collectionId 集合 ID
   * @param recordId 记录 ID
   * @param fieldName 字段名
   * @param file 文件对象
   * @returns 更新后的记录
   */
  static async updateFile(collectionId: string, recordId: string, fieldName: string, file: File) {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    return await pb.collection(collectionId).update(recordId, formData);
  }

  /**
   * 删除文件
   * @param collectionId 集合 ID
   * @param recordId 记录 ID
   * @param fieldName 字段名
   * @param fileName 文件名（可选）
   */
  static async deleteFile(collectionId: string, recordId: string, fieldName: string, fileName?: string) {
    const formData = new FormData();
    formData.append(fieldName, ''); // 空字符串表示删除文件
    
    return await pb.collection(collectionId).update(recordId, formData);
  }

  /**
   * 获取文件的缩略图 URL
   * @param record 记录对象
   * @param fieldName 文件字段名
   * @param thumb 缩略图尺寸 (例如: '100x100', '300x300')
   * @returns 缩略图 URL
   */
  static getThumbUrl(record: any, fieldName: string, thumb: string): string | null {
    if (!record || !record[fieldName]) {
      return null;
    }
    
    // PocketBase 的缩略图 URL 格式
    const baseUrl = pb.files.getUrl(record, fieldName, record[fieldName]);
    return `${baseUrl}?thumb=${thumb}`;
  }

  /**
   * 验证文件类型和大小
   * @param file 文件对象
   * @param allowedTypes 允许的文件类型数组
   * @param maxSize 最大文件大小（字节）
   * @returns 验证结果
   */
  static validateFile(file: File, allowedTypes: string[] = [], maxSize?: number): { valid: boolean; error?: string } {
    // 检查文件类型
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return { 
        valid: false, 
        error: `不支持的文件类型: ${file.type}。支持的类型: ${allowedTypes.join(', ')}` 
      };
    }
    
    // 检查文件大小
    if (maxSize && file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
      return { 
        valid: false, 
        error: `文件大小超过限制: ${(file.size / 1024 / 1024).toFixed(2)}MB > ${maxSizeMB}MB` 
      };
    }
    
    return { valid: true };
  }
}

// 广告文件相关的工具函数
export class AdvertisementFileUtils {
  /**
   * 获取广告图片的完整 URL
   * @param advertisement 广告记录
   * @returns 图片 URL
   */
  static getImageUrl(advertisement: any): string | null {
    return FileUtils.getFileUrl(advertisement, 'image');
  }

  /**
   * 获取广告图片的缩略图 URL
   * @param advertisement 广告记录
   * @param size 缩略图尺寸
   * @returns 缩略图 URL
   */
  static getImageThumbUrl(advertisement: any, size: string = '300x200'): string | null {
    return FileUtils.getThumbUrl(advertisement, 'image', size);
  }

  /**
   * 上传广告图片
   * @param imageFile 图片文件
   * @returns 上传后的广告记录
   */
  static async uploadAdvertisementImage(imageFile: File) {
    // 验证图片文件
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validation = FileUtils.validateFile(imageFile, allowedTypes, maxSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    return await FileUtils.uploadFile('advertisements', 'image', imageFile);
  }

  /**
   * 更新广告图片
   * @param recordId 广告记录 ID
   * @param imageFile 新的图片文件
   * @returns 更新后的广告记录
   */
  static async updateAdvertisementImage(recordId: string, imageFile: File) {
    // 验证图片文件
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validation = FileUtils.validateFile(imageFile, allowedTypes, maxSize);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    
    return await FileUtils.updateFile('advertisements', recordId, 'image', imageFile);
  }
} 