# 会员模块类型定义

这是一个完整的、模块化的会员系统TypeScript类型定义集合，基于当前主流电商平台的设计趋势和架构实践。

## 📁 模块结构

``` plainText
backend/types/member/
├── base.ts          # 基础类型、枚举和工具类型
├── member.ts        # 会员核心类型定义
├── level.ts         # 会员等级相关类型
├── points.ts        # 积分系统类型
├── address.ts       # 地址管理类型
├── tags.ts          # 会员标签类型
├── index.ts         # 统一导出文件
└── README.md        # 本说明文档
```

## 🚀 快速开始

### 导入使用

```typescript
// 导入所有类型
import * as MemberTypes from '@/types/member';

// 导入特定类型
import { 
  Member, 
  MemberLevel, 
  PointsRecord, 
  Address 
} from '@/types/member';

// 导入服务接口
import { 
  IMemberService, 
  IPointsService 
} from '@/types/member';

// 导入枚举
import { 
  Gender, 
  MemberStatus, 
  PointsType 
} from '@/types/member';
```

### 基本使用示例

```typescript
// 创建会员
const createMember = async (input: MemberCreateInput): Promise<Member> => {
  // 实现逻辑
};

// 查询会员
const getMembers = async (query: MemberQueryInput): Promise<MembersResponse> => {
  // 实现逻辑
};

// 积分操作
const adjustPoints = async (input: PointsAdjustmentInput): Promise<PointsRecord> => {
  // 实现逻辑
};
```

## 🏗️ 核心模块详解

### 1. base.ts - 基础类型模块

包含系统的基础类型定义，如枚举、分页、通用接口等。

**主要内容:**

- 基础枚举（性别、状态、积分类型等）
- 分页相关类型
- 通用响应接口
- 工具类型
- 验证规则常量

```typescript
// 枚举使用
const status: MemberStatus = MemberStatus.ACTIVE;

// 分页查询
const query: PaginationInput = {
  page: 1,
  perPage: 20,
  sortBy: 'created',
  sortOrder: 'desc'
};
```

### 2. member.ts - 会员核心模块

定义会员实体及相关的所有类型。

**主要功能:**

- 会员基础信息管理
- 会员资料和偏好设置
- 会员认证和验证
- 第三方账号绑定
- 会员统计和分析

```typescript
// 会员创建
const newMember: MemberCreateInput = {
  username: 'user123',
  email: 'user@example.com',
  phone: '13800138000',
  gender: Gender.MALE,
  levelId: 'bronze_level'
};

// 会员资料更新
const profileUpdate: ProfileUpdateInput = {
  nickname: '新昵称',
  avatar: 'avatar_url',
  bio: '个人简介'
};
```

### 3. level.ts - 会员等级模块

管理会员等级体系的相关类型。

**主要功能:**

- 多层级会员等级定义
- 等级权益管理
- 升级条件和规则
- 保级机制
- 等级统计分析

```typescript
// 等级定义
const level: MemberLevel = {
  id: 'gold_level',
  name: '黄金会员',
  pointsRequired: 5000,
  discountRate: 0.85,
  benefits: [
    {
      id: 'free_shipping',
      type: 'freeShipping',
      name: '免邮特权',
      description: '订单满99元免邮费',
      isActive: true
    }
  ]
};

// 升级检查
const upgradeCheck: LevelUpgradeCheckResult = {
  canUpgrade: true,
  targetLevelId: 'platinum_level',
  currentConditions: [...]
};
```

### 4. points.ts - 积分系统模块

完整的积分系统类型定义。

**主要功能:**

- 积分记录管理
- 积分规则引擎
- 积分兑换商城
- 积分统计分析
- 到期管理

```typescript
// 积分规则
const rule: PointsRule = {
  id: 'order_complete',
  name: '订单完成奖励',
  type: PointsType.EARNED_ORDER,
  points: 100,
  conditions: [
    {
      field: 'orderAmount',
      operator: 'gte',
      value: 100,
      description: '订单金额不少于100元'
    }
  ]
};

// 积分兑换
const exchange: PointsExchange = {
  id: 'coupon_10',
  name: '10元优惠券',
  pointsRequired: 1000,
  exchangeType: ExchangeType.COUPON,
  rewardValue: 10
};
```

### 5. address.ts - 地址管理模块

收货地址管理的所有相关类型。

**主要功能:**

- 收货地址CRUD
- 地址验证和标准化
- 地区信息管理
- 地址模板
- 使用统计

```typescript
// 地址创建
const address: AddressCreateInput = {
  name: '张三',
  phone: '13800138000',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  address: '某某街道123号',
  isDefault: true
};

// 地址验证
const validation: AddressValidationInput = {
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  address: '某某街道123号',
  validateCoordinates: true
};
```

### 6. tags.ts - 会员标签模块

会员标签和分群的类型定义。

**主要功能:**

- 会员标签管理
- 标签规则引擎
- 标签分组
- 会员画像
- 行为分析

```typescript
// 标签定义
const tag: MemberTag = {
  id: 'high_value_customer',
  name: '高价值客户',
  type: TagType.BEHAVIOR,
  category: '消费行为',
  autoRules: [
    {
      type: 'transaction',
      condition: 'totalAmount > 10000',
      description: '总消费金额超过1万元'
    }
  ]
};

// 标签分配
const assignment: MemberTagAssignInput = {
  memberIds: ['member1', 'member2'],
  tagIds: ['tag1', 'tag2'],
  assignedReason: '满足高价值客户条件'
};
```

## 📊 设计特点

### 1. 模块化设计

- 按功能域拆分，便于维护
- 独立的类型命名空间
- 清晰的依赖关系

### 2. 完整的类型覆盖

- 输入类型（Input）
- 输出类型（Response）
- 查询参数（QueryInput）
- 实体类型（Entity）
- 事件类型（Event）

### 3. 服务接口定义

- 标准化的服务接口
- 统一的错误处理
- 完整的CRUD操作
- 批量操作支持

### 4. 扩展性设计

- 通用的扩展字段
- 可配置的业务规则
- 插件化的功能模块
- 向后兼容的升级路径

## 🛠️ 使用最佳实践

### 1. 类型安全

```typescript
// ✅ 推荐：使用具体类型
const createMember = (input: MemberCreateInput): Promise<Member> => {
  // 实现
};

// ❌ 避免：使用any类型
const createMember = (input: any): Promise<any> => {
  // 实现
};
```

### 2. 枚举使用

```typescript
// ✅ 推荐：使用枚举值
const status = MemberStatus.ACTIVE;

// ❌ 避免：硬编码字符串
const status = 'active';
```

### 3. 响应类型处理

```typescript
// ✅ 推荐：完整的响应处理
const response: MembersResponse = await getMembersAPI(query);
const { items, pagination } = response;

// 处理分页信息
if (pagination.hasNext) {
  // 加载更多
}
```

### 4. 错误处理

```typescript
// ✅ 推荐：使用统一的错误类型
try {
  const result = await memberService.create(input);
} catch (error) {
  if (error instanceof ValidationError) {
    // 处理验证错误
  }
}
```

## 🔄 与现有代码集成

### 1. GraphQL Schema同步

```typescript
// GraphQL resolver实现
const memberResolvers = {
  Query: {
    members: async (
      _: any,
      { input }: { input: MemberQueryInput }
    ): Promise<MembersResponse> => {
      return memberService.findMany(input);
    }
  }
};
```

### 2. 数据库模型映射

```typescript
// PocketBase记录转换
const toMember = (record: any): Member => {
  return {
    id: record.id,
    profile: {
      username: record.username,
      email: record.email,
      // ...其他字段映射
    },
    // ...完整映射
  };
};
```

### 3. 前端组件使用

```typescript
// React组件props
interface MemberFormProps {
  member?: Member;
  onSubmit: (input: MemberUpdateInput) => void;
  loading?: boolean;
}

const MemberForm: React.FC<MemberFormProps> = ({ member, onSubmit }) => {
  // 组件实现
};
```

## 🚀 扩展开发

### 1. 添加新的会员字段

```typescript
// 扩展MemberProfile接口
interface ExtendedMemberProfile extends MemberProfile {
  companyName?: string;
  jobTitle?: string;
  industry?: string;
}
```

### 2. 自定义积分规则

```typescript
// 扩展积分规则条件
interface CustomPointsRuleCondition extends PointsRuleCondition {
  customLogic?: string;
  parameters?: Record<string, any>;
}
```

### 3. 增加新的标签类型

```typescript
// 扩展标签类型枚举
enum ExtendedTagType {
  SYSTEM = 'system',
  CUSTOM = 'custom',
  BEHAVIOR = 'behavior',
  PREFERENCE = 'preference',
  DEMOGRAPHIC = 'demographic',
  BUSINESS = 'business',        // 新增
  GEOGRAPHIC = 'geographic'     // 新增
}
```

## 📝 开发规范

### 1. 命名约定

- 接口使用PascalCase：`MemberCreateInput`
- 枚举使用PascalCase：`MemberStatus`
- 函数使用camelCase：`formatMemberDisplayName`
- 常量使用UPPER_SNAKE_CASE：`DEFAULT_PAGINATION`

### 2. 文档注释

```typescript
/**
 * 会员创建输入接口
 * @description 用于创建新会员的输入参数
 */
export interface MemberCreateInput {
  /**
   * 用户名
   * @minLength 2
   * @maxLength 50
   * @pattern /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/
   */
  username: string;
}
```

### 3. 版本兼容性

- 新增字段使用可选属性
- 废弃字段添加@deprecated注释
- 重大变更提供迁移指南

## 🔧 故障排除

### 常见问题

1. **类型导入错误**

   ```typescript
   // ❌ 错误
   import { Member } from './member';
   
   // ✅ 正确
   import { Member } from './member.ts';
   ```

2. **枚举值使用错误**

   ```typescript
   // ❌ 错误
   const status = 'active';
   
   // ✅ 正确
   const status = MemberStatus.ACTIVE;
   ```

3. **类型断言过度使用**

   ```typescript
   // ❌ 避免
   const member = data as Member;
   
   // ✅ 推荐：使用类型守卫
   if (isMember(data)) {
     // data 现在是 Member 类型
   }
   ```
