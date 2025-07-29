/**
 * 地址管理 Resolvers
 * @description 处理地址 CRUD、验证、统计等操作
 */

import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { 
  Address,
  AddressTemplate,
  AddressValidationResult,
  Region,
  AddressQueryInput,
  AddressCreateInput,
  AddressUpdateInput,
  AddressValidationInput,
  AddressesResponse,
  AddressStatsResponse
} from '../../types/member/index.ts';

// 地址服务工具函数
class AddressService {
  /**
   * 根据 ID 查找地址
   */
  static async findById(id: string): Promise<Address | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('addresses').getOne(id);
      return AddressService.formatAddressRecord(record);
    } catch (error) {
      console.error('Failed to find address by ID:', error);
      return null;
    }
  }

  /**
   * 查询地址列表
   */
  static async findMany(query: AddressQueryInput): Promise<AddressesResponse> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const filter = AddressService.buildQueryFilter(query);
      const page = query.page || 1;
      const perPage = query.perPage || 20;
      const sort = AddressService.buildSort(query);
      
      const result = await pb.collection('addresses').getList(page, perPage, {
        filter,
        sort
      });
      
      const items = result.items.map(AddressService.formatAddressRecord);
      
      return {
        items,
        pagination: {
          page: result.page,
          perPage: result.perPage,
          totalItems: result.totalItems,
          totalPages: result.totalPages,
          hasNext: result.page < result.totalPages,
          hasPrev: result.page > 1
        }
      };
    } catch (error) {
      console.error('Failed to query addresses:', error);
      throw new Error('查询地址列表失败');
    }
  }

  /**
   * 获取用户地址
   */
  static async findUserAddresses(userId: string): Promise<Address[]> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const records = await pb.collection('addresses').getFullList({
        filter: `userId = "${userId}"`,
        sort: '-isDefault,-created'
      });
      
      return records.map(AddressService.formatAddressRecord);
    } catch (error) {
      console.error('Failed to get user addresses:', error);
      return [];
    }
  }

  /**
   * 获取默认地址
   */
  static async findDefaultAddress(userId: string): Promise<Address | null> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      const record = await pb.collection('addresses').getFirstListItem(
        `userId = "${userId}" && isDefault = true`
      );
      
      return AddressService.formatAddressRecord(record);
    } catch (error) {
      console.error('Failed to get default address:', error);
      return null;
    }
  }

  /**
   * 创建地址
   */
  static async create(userId: string, input: AddressCreateInput): Promise<Address> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 如果设置为默认地址，先取消其他默认地址
      if (input.isDefault) {
        await pb.collection('addresses').getFullList({
          filter: `userId = "${userId}" && isDefault = true`
        }).then(records => {
          return Promise.all(records.map(record => 
            pb.collection('addresses').update(record.id, { isDefault: false })
          ));
        });
      }
      
      const data = {
        userId,
        name: input.name,
        phone: input.phone,
        email: input.email,
        province: input.province,
        city: input.city,
        district: input.district,
        street: input.street,
        address: input.address,
        detailAddress: input.detailAddress,
        postalCode: input.postalCode,
        longitude: input.longitude,
        latitude: input.latitude,
        tag: input.tag,
        tagColor: input.tagColor,
        isDefault: input.isDefault ?? false,
        isActive: input.isActive ?? true,
        verificationStatus: 'pending',
        verificationMethod: 'auto',
        source: input.source || 'manual',
        sourceDetails: input.sourceDetails,
        customFields: input.customFields || {},
        metadata: input.metadata || {}
      };
      
      const record = await pb.collection('addresses').create(data);
      return AddressService.formatAddressRecord(record);
    } catch (error) {
      console.error('Failed to create address:', error);
      throw new Error('创建地址失败');
    }
  }

  /**
   * 更新地址
   */
  static async update(id: string, input: AddressUpdateInput): Promise<Address> {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 获取现有地址
      const existing = await pb.collection('addresses').getOne(id);
      
      // 如果设置为默认地址，先取消其他默认地址
      if (input.isDefault) {
        await pb.collection('addresses').getFullList({
          filter: `userId = "${existing.userId}" && isDefault = true && id != "${id}"`
        }).then(records => {
          return Promise.all(records.map(record => 
            pb.collection('addresses').update(record.id, { isDefault: false })
          ));
        });
      }
      
      const data: any = {};
      
      if (input.name !== undefined) data.name = input.name;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.email !== undefined) data.email = input.email;
      if (input.province !== undefined) data.province = input.province;
      if (input.city !== undefined) data.city = input.city;
      if (input.district !== undefined) data.district = input.district;
      if (input.street !== undefined) data.street = input.street;
      if (input.address !== undefined) data.address = input.address;
      if (input.detailAddress !== undefined) data.detailAddress = input.detailAddress;
      if (input.postalCode !== undefined) data.postalCode = input.postalCode;
      if (input.longitude !== undefined) data.longitude = input.longitude;
      if (input.latitude !== undefined) data.latitude = input.latitude;
      if (input.tag !== undefined) data.tag = input.tag;
      if (input.tagColor !== undefined) data.tagColor = input.tagColor;
      if (input.isDefault !== undefined) data.isDefault = input.isDefault;
      if (input.isActive !== undefined) data.isActive = input.isActive;
          if (input.customFields !== undefined) data.customFields = input.customFields;
    if (input.metadata !== undefined) data.metadata = input.metadata;
      
      const record = await pb.collection('addresses').update(id, data);
      return AddressService.formatAddressRecord(record);
    } catch (error) {
      console.error('Failed to update address:', error);
      throw new Error('更新地址失败');
    }
  }

  /**
   * 构建查询过滤器
   */
  private static buildQueryFilter(query: AddressQueryInput): string {
    const conditions: string[] = [];
    
    if (query.userId) {
      conditions.push(`userId = "${query.userId}"`);
    }
    
    // 移除 search 字段，使用其他查询条件
    
    if (query.name) {
      conditions.push(`name = "${query.name}"`);
    }
    
    if (query.phone) {
      conditions.push(`phone = "${query.phone}"`);
    }
    
    if (query.province) {
      conditions.push(`province = "${query.province}"`);
    }
    
    if (query.city) {
      conditions.push(`city = "${query.city}"`);
    }
    
    if (query.district) {
      conditions.push(`district = "${query.district}"`);
    }
    
    if (query.tag) {
      conditions.push(`tag = "${query.tag}"`);
    }
    
    if (query.isDefault !== undefined) {
      conditions.push(`isDefault = ${query.isDefault}`);
    }
    
    if (query.isActive !== undefined) {
      conditions.push(`isActive = ${query.isActive}`);
    }
    
    if (query.verificationStatus) {
      conditions.push(`verificationStatus = "${query.verificationStatus}"`);
    }
    
    return conditions.length > 0 ? conditions.join(' && ') : '';
  }

  /**
   * 构建排序条件
   */
  private static buildSort(query: AddressQueryInput): string {
    const sortBy = query.sortBy || 'created';
    const sortOrder = query.sortOrder || 'desc';
    return `${sortOrder === 'desc' ? '-' : ''}${sortBy}`;
  }

  /**
   * 格式化地址记录
   */
  private static formatAddressRecord(record: any): Address {
    return {
      id: record.id,
      created: record.created,
      updated: record.updated,
      userId: record.userId,
      name: record.name,
      phone: record.phone,
      email: record.email,
      province: record.province,
      city: record.city,
      district: record.district,
      street: record.street,
      address: record.address,
      detailAddress: record.detailAddress,
      postalCode: record.postalCode,
      longitude: record.longitude,
      latitude: record.latitude,
      tag: record.tag,
      tagColor: record.tagColor,
      isDefault: record.isDefault,
      isActive: record.isActive,
      verificationStatus: record.verificationStatus,
      verificationMethod: record.verificationMethod,
      verifiedAt: record.verifiedAt,
      lastUsedAt: record.lastUsedAt,
      usageCount: record.usageCount || 0,
      source: record.source,
      sourceDetails: record.sourceDetails,
      customFields: record.customFields || {},
      metadata: record.metadata || {}
    };
  }
}

// Query resolvers
const Query = {
  // 地址查询
  addresses: async (_: any, { query }: { query: AddressQueryInput }) => {
    return await AddressService.findMany(query);
  },

  address: async (_: any, { id }: { id: string }) => {
    return await AddressService.findById(id);
  },

  userAddresses: async (_: any, { userId }: { userId: string }) => {
    return await AddressService.findUserAddresses(userId);
  },

  defaultAddress: async (_: any, { userId }: { userId: string }) => {
    return await AddressService.findDefaultAddress(userId);
  },

  // 地址模板查询
  addressTemplates: async (_: any, { query }: { query: any }) => {
    // TODO: 实现地址模板查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  addressTemplate: async (_: any, { id }: { id: string }) => {
    // TODO: 实现单个地址模板查询
    return null;
  },

  popularTemplates: async (_: any, { limit }: { limit?: number }) => {
    // TODO: 实现热门模板查询
    return [];
  },

  // 地区查询
  regions: async (_: any, { query }: { query: any }) => {
    // TODO: 实现地区查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  region: async (_: any, { id }: { id: string }) => {
    // TODO: 实现单个地区查询
    return null;
  },

  regionByCode: async (_: any, { code }: { code: string }) => {
    // TODO: 实现根据编码查询地区
    return null;
  },

  regionTree: async (_: any, { parentId, maxDepth }: { parentId?: string; maxDepth?: number }) => {
    // TODO: 实现地区树形结构查询
    return [];
  },

  searchRegions: async (_: any, { keyword }: { keyword: string }) => {
    // TODO: 实现地区搜索
    return [];
  },

  // 地址使用记录查询
  addressUsageRecords: async (_: any, { query }: { query: any }) => {
    // TODO: 实现地址使用记录查询
    return {
      items: [],
      pagination: {
        page: 1,
        perPage: 20,
        totalItems: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false
      }
    };
  },

  addressUsageStats: async (_: any, { addressId }: { addressId: string }) => {
    // TODO: 实现地址使用统计
    return {};
  },

  // 统计分析
  addressStats: async (_: any, { dateRange }: { dateRange?: any }): Promise<AddressStatsResponse> => {
    // TODO: 实现地址统计
    return {
      overview: {
        totalAddresses: 0,
        totalUsers: 0,
        verifiedAddresses: 0,
        defaultAddresses: 0,
        averageAddressesPerUser: 0,
        totalUsage: 0
      },
      regionDistribution: [],
      tagDistribution: [],
      verificationStats: [],
      usageAnalysis: [],
      trendAnalysis: []
    };
  },

  regionStats: async (_: any, { regionId }: { regionId?: string }) => {
    // TODO: 实现地区统计
    return {};
  },

  userAddressProfile: async (_: any, { userId }: { userId: string }) => {
    // TODO: 实现用户地址画像
    return {};
  },

  // 地址搜索
  searchAddresses: async (_: any, { query, options }: { query: string; options?: any }) => {
    // TODO: 实现地址搜索
    return [];
  },

  searchNearbyAddresses: async (_: any, { longitude, latitude, radius }: { longitude: number; latitude: number; radius: number }) => {
    // TODO: 实现附近地址搜索
    return [];
  },

  findSimilarAddresses: async (_: any, { addressId, threshold }: { addressId: string; threshold?: number }) => {
    // TODO: 实现相似地址查找
    return [];
  }
};

// Mutation resolvers
const Mutation = {
  // 地址CRUD
  createAddress: async (_: any, { userId, input }: { userId: string; input: AddressCreateInput }) => {
    return await AddressService.create(userId, input);
  },

  updateAddress: async (_: any, { id, input }: { id: string; input: AddressUpdateInput }) => {
    return await AddressService.update(id, input);
  },

  deleteAddress: async (_: any, { id }: { id: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      await pb.collection('addresses').delete(id);
      return true;
    } catch (error) {
      console.error('Failed to delete address:', error);
      return false;
    }
  },

  // 默认地址设置
  setDefaultAddress: async (_: any, { userId, addressId }: { userId: string; addressId: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 取消其他默认地址
      await pb.collection('addresses').getFullList({
        filter: `userId = "${userId}" && isDefault = true`
      }).then(records => {
        return Promise.all(records.map(record => 
          pb.collection('addresses').update(record.id, { isDefault: false })
        ));
      });
      
      // 设置新的默认地址
      await pb.collection('addresses').update(addressId, { isDefault: true });
      return true;
    } catch (error) {
      console.error('Failed to set default address:', error);
      return false;
    }
  },

  // 地址验证
  validateAddress: async (_: any, { input }: { input: AddressValidationInput }): Promise<AddressValidationResult> => {
    // TODO: 实现地址验证逻辑
    return {
      isValid: true,
      confidence: 0.95,
      standardizedAddress: {
        province: input.province,
        city: input.city,
        district: input.district,
        address: input.address,
        longitude: input.longitude,
        latitude: input.latitude,
        postalCode: input.postalCode
      },
      details: {
        provinceValid: true,
        cityValid: true,
        districtValid: true
      },
      suggestions: [],
      errors: [],
      warnings: [],
      validationMethod: 'api',
      validationTime: new Date().toISOString()
    };
  },

  // 批量操作
  batchDeleteAddresses: async (_: any, { ids }: { ids: string[] }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      await Promise.all(ids.map(id => pb.collection('addresses').delete(id)));
      
      return {
        success: true,
        successCount: ids.length,
        failureCount: 0,
        totalCount: ids.length,
        message: '批量删除地址成功',
        errors: []
      };
    } catch (error) {
      console.error('Failed to batch delete addresses:', error);
      return {
        success: false,
        successCount: 0,
        failureCount: ids.length,
        totalCount: ids.length,
        message: '批量删除地址失败',
        errors: [error.message]
      };
    }
  },

  // 地址使用记录
  recordAddressUsage: async (_: any, { addressId, usageType, orderId }: { addressId: string; usageType: string; orderId?: string }) => {
    try {
      await pocketbaseClient.ensureAuth();
      const pb = pocketbaseClient.getClient();
      
      // 更新地址最后使用时间和使用次数
      const address = await pb.collection('addresses').getOne(addressId);
      await pb.collection('addresses').update(addressId, {
        lastUsedAt: new Date().toISOString(),
        usageCount: (address.usageCount || 0) + 1
      });
      
      // 创建使用记录
      await pb.collection('address_usage_records').create({
        addressId,
        usageType,
        orderId,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Failed to record address usage:', error);
      return false;
    }
  }
};

// 类型解析器
const types = {
  Address: {
    // 解析关联的用户信息
    user: async (parent: Address) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('members').getOne(parent.userId);
      } catch (error) {
        console.error('Failed to resolve address user:', error);
        return null;
      }
    },

    // 格式化完整地址
    fullAddress: (parent: Address) => {
      return [parent.province, parent.city, parent.district, parent.address, parent.detailAddress]
        .filter(Boolean)
        .join('');
    },

    // 获取坐标信息
    coordinates: (parent: Address) => {
      if (parent.longitude && parent.latitude) {
        return {
          longitude: parent.longitude,
          latitude: parent.latitude
        };
      }
      return null;
    }
  }
};

export const addressResolvers = {
  Query,
  Mutation,
  types
}; 