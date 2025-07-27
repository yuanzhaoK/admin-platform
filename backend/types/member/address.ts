/**
 * 地址管理类型定义
 * @description 包含收货地址、地址验证、区域管理等相关类型
 */

import { BaseEntity, PaginationInput, PaginatedResponse, Location, ContactInfo, DateRange } from './base.ts';

// ========================= 地址核心实体 =========================

/**
 * 收货地址接口
 */
export interface Address extends BaseEntity {
  // 基础信息
  userId: string;
  
  // 联系人信息
  name: string;
  phone: string;
  email?: string;
  
  // 地址信息
  province: string;
  city: string;
  district: string;
  street?: string;
  address: string;
  detailAddress?: string;
  postalCode?: string;
  
  // 地理位置
  longitude?: number;
  latitude?: number;
  locationAccuracy?: number;
  
  // 地址标签
  tag?: string; // 如：家、公司、学校等
  tagColor?: string;
  
  // 地址状态
  isDefault: boolean;
  isActive: boolean;
  isVerified: boolean;
  
  // 验证信息
  verificationStatus: 'pending' | 'verified' | 'failed';
  verificationMethod?: 'auto' | 'manual' | 'third_party';
  verificationTime?: string;
  verificationDetails?: string;
  
  // 使用统计
  usageCount: number;
  lastUsedAt?: string;
  orderCount: number;
  
  // 地址来源
  source: 'manual' | 'location' | 'import' | 'third_party';
  sourceDetails?: string;
  
  // 扩展字段
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 地址模板接口
 */
export interface AddressTemplate extends BaseEntity {
  // 基础信息
  name: string;
  description?: string;
  
  // 模板内容
  template: Partial<Address>;
  
  // 模板类型
  type: 'system' | 'custom' | 'popular';
  category: string;
  
  // 使用统计
  usageCount: number;
  popularityScore: number;
  
  // 状态
  isActive: boolean;
  isPublic: boolean;
  
  // 创建者
  createdBy?: string;
  
  // 扩展字段
  metadata?: Record<string, any>;
}

/**
 * 地址验证结果接口
 */
export interface AddressValidationResult {
  isValid: boolean;
  confidence: number; // 0-1
  
  // 验证详情
  details: {
    provinceValid: boolean;
    cityValid: boolean;
    districtValid: boolean;
    streetValid?: boolean;
    postalCodeValid?: boolean;
    coordinatesValid?: boolean;
  };
  
  // 建议的修正
  suggestions?: Array<{
    field: string;
    originalValue: string;
    suggestedValue: string;
    confidence: number;
    reason: string;
  }>;
  
  // 标准化后的地址
  standardizedAddress?: Partial<Address>;
  
  // 错误信息
  errors: string[];
  warnings: string[];
  
  // 验证元数据
  validationMethod: string;
  validationTime: string;
  provider?: string;
}

/**
 * 地区信息接口
 */
export interface Region extends BaseEntity {
  // 基础信息
  code: string;
  name: string;
  fullName: string;
  shortName?: string;
  englishName?: string;
  
  // 层级信息
  level: number; // 1-省/直辖市, 2-市, 3-区/县, 4-街道/镇
  parentId?: string;
  parentPath: string; // 父级路径，如：110000/110100/110101
  
  // 地理信息
  longitude?: number;
  latitude?: number;
  boundaryData?: any; // 边界数据
  
  // 状态信息
  isActive: boolean;
  isHot: boolean; // 是否热门地区
  
  // 排序
  sortOrder: number;
  
  // 扩展信息
  metadata?: Record<string, any>;
}

/**
 * 地址使用记录接口
 */
export interface AddressUsageRecord extends BaseEntity {
  addressId: string;
  userId: string;
  
  // 使用信息
  usageType: 'order' | 'shipping' | 'billing' | 'other';
  orderId?: string;
  
  // 使用时的地址快照
  addressSnapshot: Address;
  
  // 使用结果
  result: 'success' | 'failed' | 'cancelled';
  resultDetails?: string;
  
  // 扩展字段
  metadata?: Record<string, any>;
}

// ========================= 查询参数 =========================

/**
 * 地址查询参数接口
 */
export interface AddressQueryInput extends PaginationInput {
  userId?: string | string[];
  name?: string;
  phone?: string;
  province?: string | string[];
  city?: string | string[];
  district?: string | string[];
  tag?: string | string[];
  isDefault?: boolean;
  isActive?: boolean;
  isVerified?: boolean;
  verificationStatus?: 'pending' | 'verified' | 'failed';
  usageCountMin?: number;
  usageCountMax?: number;
  lastUsedDateRange?: DateRange;
  source?: 'manual' | 'location' | 'import' | 'third_party';
  
  // 地理位置查询
  nearbyLocation?: {
    longitude: number;
    latitude: number;
    radius: number; // 半径，单位：米
  };
  
  // 包含关联数据
  includeUser?: boolean;
  includeUsageStats?: boolean;
  includeValidationInfo?: boolean;
}

/**
 * 地址模板查询参数接口
 */
export interface AddressTemplateQueryInput extends PaginationInput {
  search?: string;
  name?: string;
  type?: 'system' | 'custom' | 'popular';
  category?: string | string[];
  isActive?: boolean;
  isPublic?: boolean;
  createdBy?: string;
  usageCountMin?: number;
  usageCountMax?: number;
  popularityScoreMin?: number;
  popularityScoreMax?: number;
}

/**
 * 地区查询参数接口
 */
export interface RegionQueryInput extends PaginationInput {
  search?: string;
  code?: string;
  name?: string;
  level?: number | number[];
  parentId?: string;
  isActive?: boolean;
  isHot?: boolean;
  
  // 层级查询
  includeChildren?: boolean;
  includeParents?: boolean;
  maxDepth?: number;
}

/**
 * 地址使用记录查询参数接口
 */
export interface AddressUsageRecordQueryInput extends PaginationInput {
  addressId?: string | string[];
  userId?: string | string[];
  usageType?: 'order' | 'shipping' | 'billing' | 'other';
  orderId?: string;
  result?: 'success' | 'failed' | 'cancelled';
  dateRange?: DateRange;
  
  // 包含关联数据
  includeAddress?: boolean;
  includeUser?: boolean;
  includeOrder?: boolean;
}

// ========================= 输入类型 =========================

/**
 * 地址创建输入接口
 */
export interface AddressCreateInput {
  name: string;
  phone: string;
  email?: string;
  province: string;
  city: string;
  district: string;
  street?: string;
  address: string;
  detailAddress?: string;
  postalCode?: string;
  longitude?: number;
  latitude?: number;
  tag?: string;
  tagColor?: string;
  isDefault?: boolean;
  isActive?: boolean;
  source?: 'manual' | 'location' | 'import' | 'third_party';
  sourceDetails?: string;
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 地址更新输入接口
 */
export interface AddressUpdateInput {
  name?: string;
  phone?: string;
  email?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  address?: string;
  detailAddress?: string;
  postalCode?: string;
  longitude?: number;
  latitude?: number;
  tag?: string;
  tagColor?: string;
  isDefault?: boolean;
  isActive?: boolean;
  customFields?: Record<string, any>;
  metadata?: Record<string, any>;
}

/**
 * 地址验证输入接口
 */
export interface AddressValidationInput {
  province: string;
  city: string;
  district: string;
  street?: string;
  address: string;
  postalCode?: string;
  longitude?: number;
  latitude?: number;
  
  // 验证选项
  validateCoordinates?: boolean;
  validatePostalCode?: boolean;
  validateStructure?: boolean;
  getSuggestions?: boolean;
  standardize?: boolean;
}

/**
 * 地址模板创建输入接口
 */
export interface AddressTemplateCreateInput {
  name: string;
  description?: string;
  template: Partial<Address>;
  type: 'system' | 'custom' | 'popular';
  category: string;
  isActive?: boolean;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

/**
 * 地址模板更新输入接口
 */
export interface AddressTemplateUpdateInput {
  name?: string;
  description?: string;
  template?: Partial<Address>;
  type?: 'system' | 'custom' | 'popular';
  category?: string;
  isActive?: boolean;
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

/**
 * 地址批量导入输入接口
 */
export interface AddressImportInput {
  addresses: Array<AddressCreateInput & { userId: string }>;
  options?: {
    skipDuplicates?: boolean;
    validateAddresses?: boolean;
    setAsDefault?: boolean;
    source?: string;
  };
}

// ========================= 输出类型 =========================

/**
 * 地址列表响应接口
 */
export interface AddressesResponse extends PaginatedResponse<Address> {
  stats?: {
    totalAddresses: number;
    defaultAddresses: number;
    verifiedAddresses: number;
    totalUsers: number;
    averageAddressesPerUser: number;
  };
  regions?: Array<{
    region: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * 地址模板列表响应接口
 */
export interface AddressTemplatesResponse extends PaginatedResponse<AddressTemplate> {
  stats?: {
    totalTemplates: number;
    systemTemplates: number;
    customTemplates: number;
    popularTemplates: number;
    totalUsage: number;
  };
  categories?: Array<{
    category: string;
    count: number;
    totalUsage: number;
  }>;
}

/**
 * 地区列表响应接口
 */
export interface RegionsResponse extends PaginatedResponse<Region> {
  stats?: {
    totalRegions: number;
    activeRegions: number;
    hotRegions: number;
    maxLevel: number;
  };
  tree?: RegionTree[];
}

/**
 * 地区树形结构接口
 */
export interface RegionTree extends Region {
  children?: RegionTree[];
  hasChildren: boolean;
  childrenCount: number;
}

/**
 * 地址使用记录列表响应接口
 */
export interface AddressUsageRecordsResponse extends PaginatedResponse<AddressUsageRecord> {
  stats?: {
    totalRecords: number;
    successfulUsage: number;
    failedUsage: number;
    averageUsagePerAddress: number;
  };
}

/**
 * 地址统计响应接口
 */
export interface AddressStatsResponse {
  overview: {
    totalAddresses: number;
    totalUsers: number;
    verifiedAddresses: number;
    defaultAddresses: number;
    averageAddressesPerUser: number;
    totalUsage: number;
  };
  
  regionDistribution: Array<{
    province: string;
    city?: string;
    district?: string;
    addressCount: number;
    userCount: number;
    percentage: number;
    usageCount: number;
  }>;
  
  tagDistribution: Array<{
    tag: string;
    count: number;
    percentage: number;
    usageRate: number;
  }>;
  
  usageAnalysis: Array<{
    date: string;
    newAddresses: number;
    totalUsage: number;
    uniqueUsers: number;
    verificationRate: number;
  }>;
  
  qualityMetrics: {
    verificationRate: number;
    standardFormatRate: number;
    duplicateRate: number;
    coordinateAccuracy: number;
    userSatisfactionScore: number;
  };
}

/**
 * 地址导入结果接口
 */
export interface AddressImportResult {
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  duplicates: number;
  
  errors: Array<{
    row: number;
    address: any;
    error: string;
    suggestions?: string[];
  }>;
  
  summary: {
    newAddresses: number;
    updatedAddresses: number;
    skippedAddresses: number;
    validatedAddresses: number;
  };
  
  validationResults?: AddressValidationResult[];
}

// ========================= 事件类型 =========================

/**
 * 地址创建事件
 */
export interface AddressCreatedEvent {
  addressId: string;
  userId: string;
  address: Address;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 地址更新事件
 */
export interface AddressUpdatedEvent {
  addressId: string;
  userId: string;
  changes: Record<string, { old: any; new: any }>;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 地址验证事件
 */
export interface AddressValidatedEvent {
  addressId: string;
  userId: string;
  validationResult: AddressValidationResult;
  method: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * 地址使用事件
 */
export interface AddressUsedEvent {
  addressId: string;
  userId: string;
  usageType: string;
  orderId?: string;
  result: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

// ========================= 服务接口 =========================

/**
 * 地址服务接口
 */
export interface IAddressService {
  // 地址CRUD
  createAddress(userId: string, input: AddressCreateInput): Promise<Address>;
  updateAddress(id: string, input: AddressUpdateInput): Promise<Address>;
  deleteAddress(id: string): Promise<boolean>;
  getAddress(id: string): Promise<Address | null>;
  getAddresses(query: AddressQueryInput): Promise<AddressesResponse>;
  getUserAddresses(userId: string): Promise<Address[]>;
  getDefaultAddress(userId: string): Promise<Address | null>;
  
  // 默认地址管理
  setDefaultAddress(userId: string, addressId: string): Promise<boolean>;
  clearDefaultAddress(userId: string): Promise<boolean>;
  
  // 地址验证
  validateAddress(input: AddressValidationInput): Promise<AddressValidationResult>;
  batchValidateAddresses(inputs: AddressValidationInput[]): Promise<AddressValidationResult[]>;
  standardizeAddress(address: Partial<Address>): Promise<Address>;
  
  // 地址搜索
  searchAddresses(query: string, options?: any): Promise<Address[]>;
  searchNearbyAddresses(longitude: number, latitude: number, radius: number): Promise<Address[]>;
  findSimilarAddresses(addressId: string, threshold?: number): Promise<Address[]>;
  
  // 地址模板管理
  createAddressTemplate(input: AddressTemplateCreateInput): Promise<AddressTemplate>;
  updateAddressTemplate(id: string, input: AddressTemplateUpdateInput): Promise<AddressTemplate>;
  deleteAddressTemplate(id: string): Promise<boolean>;
  getAddressTemplates(query: AddressTemplateQueryInput): Promise<AddressTemplatesResponse>;
  getPopularTemplates(limit?: number): Promise<AddressTemplate[]>;
  
  // 地区管理
  getRegions(query: RegionQueryInput): Promise<RegionsResponse>;
  getRegionTree(parentId?: string, maxDepth?: number): Promise<RegionTree[]>;
  getRegion(id: string): Promise<Region | null>;
  getRegionByCode(code: string): Promise<Region | null>;
  searchRegions(keyword: string): Promise<Region[]>;
  
  // 地址使用记录
  recordAddressUsage(addressId: string, usageType: string, options?: any): Promise<AddressUsageRecord>;
  getAddressUsageRecords(query: AddressUsageRecordQueryInput): Promise<AddressUsageRecordsResponse>;
  getAddressUsageStats(addressId: string): Promise<any>;
  
  // 统计分析
  getAddressStats(dateRange?: DateRange): Promise<AddressStatsResponse>;
  getRegionStats(regionId?: string): Promise<any>;
  getUserAddressProfile(userId: string): Promise<any>;
  
  // 批量操作
  batchCreateAddresses(addresses: Array<AddressCreateInput & { userId: string }>): Promise<any>;
  batchUpdateAddresses(updates: Array<{ id: string; input: AddressUpdateInput }>): Promise<any>;
  batchDeleteAddresses(ids: string[]): Promise<any>;
  
  // 导入导出
  importAddresses(input: AddressImportInput): Promise<AddressImportResult>;
  exportAddresses(query: AddressQueryInput): Promise<any[]>;
  
  // 地址清理
  cleanupDuplicateAddresses(userId?: string): Promise<any>;
  cleanupInvalidAddresses(): Promise<any>;
  updateAddressCoordinates(addressId: string): Promise<boolean>;
} 