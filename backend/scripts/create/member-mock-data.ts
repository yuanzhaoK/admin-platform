import { authenticate, getErrorMessage, pb } from '../helper.ts';

// ========================= 配置常量 =========================
const MOCK_CONFIG = {
  MEMBER_COUNT: 100,           // 生成会员数量
  ADDRESS_PER_MEMBER: 2,       // 每个会员的地址数量
  POINTS_RECORDS_PER_MEMBER: 5, // 每个会员的积分记录数量
  TAG_RELATIONS_PER_MEMBER: 3,  // 每个会员的标签数量
  EXCHANGE_RECORDS_COUNT: 50,   // 兑换记录数量
  ADDRESS_USAGE_RECORDS_COUNT: 200, // 地址使用记录数量
};

// ========================= 数据生成器 =========================

// 中文姓氏和名字库
const CHINESE_SURNAMES = [
  '王', '李', '张', '刘', '陈', '杨', '黄', '赵', '周', '吴',
  '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗',
  '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧',
  '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'
];

const CHINESE_NAMES = [
  '伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军',
  '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞',
  '平', '刚', '桂英', '志强', '志明', '秀珍', '建华', '建国', '建军', '志华',
  '晓明', '晓东', '晓丽', '文静', '文华', '文明', '雅静', '雅琴', '雅丽', '春花',
  '春雨', '春燕', '春梅', '秋月', '秋菊', '冬梅', '冬雪', '夏雨', '夏天'
];

const NICKNAMES = [
  '购物达人', '省钱小能手', '时尚潮人', '数码控', '美食家', '旅行者', '读书人', '运动健将',
  '音乐爱好者', '电影迷', '摄影师', '设计师', '程序猿', '创业者', '学霸', '吃货',
  '夜猫子', '早起鸟', '咖啡控', '茶道师', '园艺师', '手工达人', '收藏家', '极简主义者',
  '潮流引领者', '品质生活家', '科技发烧友', '环保主义者', '健身达人', '瑜伽爱好者'
];

const PHONE_PREFIXES = ['138', '139', '156', '158', '159', '176', '177', '178', '188', '189', '130', '131', '132', '134', '135', '136', '137', '150', '151', '152', '157', '182', '183', '184', '187'];

const EMAIL_DOMAINS = ['qq.com', '163.com', 'gmail.com', 'sina.com', 'hotmail.com', '126.com', 'foxmail.com', 'sohu.com', 'yeah.net', 'outlook.com'];

const PROVINCES = [
  { name: '北京市', cities: ['北京市'] },
  { name: '上海市', cities: ['上海市'] },
  { name: '广东省', cities: ['广州市', '深圳市', '东莞市', '佛山市', '中山市', '珠海市'] },
  { name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市'] },
  { name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '徐州市', '南通市'] },
  { name: '山东省', cities: ['济南市', '青岛市', '烟台市', '潍坊市', '临沂市', '淄博市'] },
  { name: '河南省', cities: ['郑州市', '洛阳市', '开封市', '南阳市', '安阳市', '新乡市'] },
  { name: '四川省', cities: ['成都市', '绵阳市', '德阳市', '南充市', '宜宾市', '自贡市'] },
  { name: '湖北省', cities: ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄石市', '十堰市'] },
  { name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市'] }
];

const DISTRICTS = [
  '朝阳区', '海淀区', '丰台区', '西城区', '东城区', '石景山区', '通州区', '昌平区',
  '浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区', '普陀区', '虹口区', '杨浦区',
  '南山区', '福田区', '罗湖区', '盐田区', '宝安区', '龙岗区', '龙华区', '坪山区',
  '天河区', '越秀区', '海珠区', '荔湾区', '白云区', '黄埔区', '番禺区', '花都区'
];

const STREET_NAMES = [
  '人民路', '解放路', '建设路', '中山路', '北京路', '上海路', '广州路', '深圳路',
  '和平街', '友谊街', '幸福街', '光明街', '文化街', '教育街', '科技街', '商业街',
  '花园大道', '滨海大道', '环城大道', '迎宾大道', '发展大道', '创新大道', '未来大道'
];

const ADDRESS_TAGS = [
  { name: '家', color: '#52c41a' },
  { name: '公司', color: '#1890ff' },
  { name: '学校', color: '#722ed1' },
  { name: '父母家', color: '#fa8c16' },
  { name: '朋友家', color: '#eb2f96' },
  { name: '收货地址', color: '#13c2c2' },
  { name: '办公室', color: '#faad14' },
  { name: '宿舍', color: '#f5222d' }
];

const BIOS = [
  '热爱生活，享受购物的乐趣',
  '追求品质，注重性价比',
  '时尚达人，紧跟潮流',
  '简约生活，理性消费',
  '科技爱好者，喜欢新奇产品',
  '美食控，对吃很挑剔',
  '旅行达人，喜欢收集当地特产',
  '读书爱好者，经常买书',
  '运动健将，专业装备控',
  '居家达人，喜欢装饰家居',
  '宠物主人，为毛孩子花钱不手软',
  '健康生活倡导者',
  '环保主义者，支持可持续消费',
  '收藏爱好者，喜欢限量版商品',
  '极简主义者，买东西很谨慎'
];

// ========================= 随机数据生成函数 =========================

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return parseFloat(value.toFixed(decimals));
}

function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

function randomDate(start: Date, end: Date): string {
  const startTime = start.getTime();
  const endTime = end.getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString().split('T')[0];
}

function generateChineseName(): string {
  const surname = randomChoice(CHINESE_SURNAMES);
  const nameLength = randomBoolean(0.7) ? 1 : 2; // 70%概率生成两字名
  let name = '';
  for (let i = 0; i < nameLength; i++) {
    name += randomChoice(CHINESE_NAMES);
  }
  return surname + name;
}

function generateUsername(): string {
  const base = `user_${randomInt(100000, 999999)}`;
  return randomBoolean(0.3) ? base + randomChoice(['_vip', '_pro', '_2024', '_new']) : base;
}

function generatePhoneNumber(): string {
  const prefix = randomChoice(PHONE_PREFIXES);
  const suffix = randomInt(10000000, 99999999).toString();
  return prefix + suffix;
}

function generateEmail(username: string): string {
  const domain = randomChoice(EMAIL_DOMAINS);
  return `${username.toLowerCase()}@${domain}`;
}

function generateLocation() {
  const province = randomChoice(PROVINCES);
  const city = randomChoice(province.cities);
  const district = randomChoice(DISTRICTS);
  
  return {
    province: province.name,
    city: city,
    district: district,
    postalCode: randomInt(100000, 999999).toString()
  };
}

function generateAddress(userId: string) {
  const location = generateLocation();
  const street = randomChoice(STREET_NAMES);
  const buildingNumber = randomInt(1, 9999);
  const tag = randomChoice(ADDRESS_TAGS);
  
  return {
    user_id: userId,
    name: generateChineseName(),
    phone: generatePhoneNumber(),
    email: randomBoolean(0.3) ? generateEmail('user') : undefined,
    province: location.province,
    city: location.city,
    district: location.district,
    street: street,
    address: `${street}${buildingNumber}号`,
    detail_address: randomBoolean(0.8) ? 
      `${randomChoice(['A', 'B', 'C', 'D'])}座${randomInt(1, 50)}${randomChoice(['01', '02', '03', '04', '05'])}室` : 
      undefined,
    postal_code: location.postalCode,
    longitude: randomFloat(73.0, 135.0, 6),
    latitude: randomFloat(18.0, 54.0, 6),
    tag: tag.name,
    tag_color: tag.color,
    is_default: randomBoolean(0.2),
    is_active: randomBoolean(0.95),
    is_verified: randomBoolean(0.8),
    verification_status: randomChoice(['PENDING', 'VERIFIED', 'FAILED']),
    verification_method: randomBoolean(0.7) ? randomChoice(['AUTO', 'MANUAL', 'THIRD_PARTY']) : undefined,
    verification_time: randomBoolean(0.7) ? randomDate(new Date('2022-01-01'), new Date()) : undefined,
    usage_count: randomInt(0, 50),
    last_used_at: randomBoolean(0.6) ? randomDate(new Date('2023-01-01'), new Date()) : undefined,
    order_count: randomInt(0, 30),
    source: randomChoice(['MANUAL', 'LOCATION', 'IMPORT', 'THIRD_PARTY']),
    source_details: randomChoice([
      '用户手动添加',
      '通过定位获取',
      '从第三方平台导入',
      '微信授权获取',
      '支付宝导入'
    ])
  };
}

// ========================= 批量数据生成函数 =========================

async function generateMockMembers() {
  console.log(`📊 开始生成 ${MOCK_CONFIG.MEMBER_COUNT} 个会员的mock数据...`);
  
  try {
    // 获取会员等级
    const levels = await pb.collection('member_levels').getFullList({ sort: 'level' });
    if (levels.length === 0) {
      throw new Error('请先创建会员等级数据');
    }

    const members = [];
    
    for (let i = 0; i < MOCK_CONFIG.MEMBER_COUNT; i++) {
      const username = generateUsername();
      const realName = generateChineseName();
      const registerDate = randomDate(new Date('2020-01-01'), new Date());
      const location = generateLocation();
      
      // 根据注册时间和活跃度选择等级
      const daysSinceRegister = Math.floor((new Date().getTime() - new Date(registerDate).getTime()) / (1000 * 60 * 60 * 24));
      let levelIndex = 0;
      if (daysSinceRegister > 365 && randomBoolean(0.4)) levelIndex = 1;
      if (daysSinceRegister > 730 && randomBoolean(0.3)) levelIndex = 2;
      if (daysSinceRegister > 1095 && randomBoolean(0.2)) levelIndex = 3;
      if (daysSinceRegister > 1460 && randomBoolean(0.1)) levelIndex = 4;
      
      const totalOrders = randomInt(0, Math.min(100, Math.floor(daysSinceRegister / 10)));
      const totalAmount = totalOrders * randomFloat(50, 500);
      const points = randomInt(0, Math.floor(totalAmount * 0.1));
      
      const member = {
        username: username,
        email: generateEmail(username),
        phone: generatePhoneNumber(),
        real_name: realName,
        nickname: randomBoolean(0.7) ? randomChoice(NICKNAMES) : undefined,
        gender: randomChoice(['MALE', 'FEMALE', 'UNKNOWN']),
        birthday: randomBoolean(0.6) ? randomDate(new Date('1970-01-01'), new Date('2005-12-31')) : undefined,
        bio: randomBoolean(0.4) ? randomChoice(BIOS) : undefined,
        level_id: levels[Math.min(levelIndex, levels.length - 1)].id,
        points: points,
        frozen_points: randomInt(0, Math.floor(points * 0.1)),
        total_earned_points: randomInt(points, points * 2),
        total_spent_points: randomInt(0, points),
        balance: randomFloat(0, 1000),
        frozen_balance: randomFloat(0, 50),
        status: randomChoice(['ACTIVE', 'INACTIVE', 'BANNED', 'PENDING']),
        is_verified: randomBoolean(0.7),
        verification: {
          status: randomChoice(['PENDING', 'VERIFIED', 'FAILED']),
          type: randomChoice(['none', 'phone', 'email', 'identity']),
          verifiedAt: randomBoolean(0.5) ? new Date().toISOString() : undefined
        },
        register_time: registerDate,
        last_login_time: randomBoolean(0.8) ? randomDate(new Date(registerDate), new Date()) : undefined,
        last_active_time: randomBoolean(0.7) ? randomDate(new Date(registerDate), new Date()) : undefined,
        level_upgrade_time: randomBoolean(0.3) ? randomDate(new Date(registerDate), new Date()) : undefined,
        wechat_openid: randomBoolean(0.4) ? `wx_${randomInt(100000, 999999)}` : undefined,
        wechat_unionid: randomBoolean(0.3) ? `union_${randomInt(100000, 999999)}` : undefined,
        third_party_bindings: randomBoolean(0.3) ? [
          {
            platform: randomChoice(['wechat', 'alipay', 'qq']),
            platformUserId: `${randomInt(100000, 999999)}`,
            bindTime: randomDate(new Date(registerDate), new Date()),
            isActive: randomBoolean(0.9)
          }
        ] : [],
        groups: randomBoolean(0.5) ? [randomChoice(['vip_customer', 'new_user', 'frequent_buyer', 'high_value'])] : [],
        segment: randomChoice(['potential', 'developing', 'stable', 'high_value', 'premium']),
        risk_level: randomChoice(['low', 'medium', 'high']),
        trust_score: randomInt(60, 100),
        blacklist_reason: randomBoolean(0.05) ? '异常交易行为' : undefined,
        stats: {
          totalOrders: totalOrders,
          totalAmount: totalAmount,
          totalSavings: randomFloat(0, totalAmount * 0.2),
          averageOrderValue: totalOrders > 0 ? totalAmount / totalOrders : 0,
          favoriteCategories: [
            randomChoice(['服装', '美妆', '数码', '家居', '图书', '运动', '食品']),
            randomChoice(['鞋包', '母婴', '汽车', '旅游', '音乐', '游戏', '健康'])
          ],
          loyaltyScore: randomInt(0, 100),
          engagementScore: randomInt(0, 100),
          lastOrderDate: totalOrders > 0 ? randomDate(new Date(registerDate), new Date()) : undefined,
          membershipDuration: daysSinceRegister
        },
        preferences: {
          language: 'zh-CN',
          timezone: 'Asia/Shanghai',
          currency: 'CNY',
          notifications: {
            email: randomBoolean(0.7),
            sms: randomBoolean(0.5),
            push: randomBoolean(0.8),
            wechat: randomBoolean(0.6),
            orderUpdates: randomBoolean(0.9),
            promotions: randomBoolean(0.6),
            pointsUpdates: randomBoolean(0.8),
            systemMessages: randomBoolean(0.4)
          },
          privacy: {
            profileVisibility: randomChoice(['public', 'friends', 'private']),
            showLocation: randomBoolean(0.3),
            showBirthday: randomBoolean(0.4),
            showPhone: randomBoolean(0.1),
            showEmail: randomBoolean(0.2),
            allowSearch: randomBoolean(0.7),
            allowRecommendation: randomBoolean(0.8)
          },
          marketing: {
            emailMarketing: randomBoolean(0.5),
            smsMarketing: randomBoolean(0.3),
            pushMarketing: randomBoolean(0.6),
            personalizedRecommendations: randomBoolean(0.8),
            behaviorTracking: randomBoolean(0.7)
          }
        },
        location: location,
        emailVisibility: false,
        password: 'password123',
        passwordConfirm: 'password123'
      };

      members.push(member);
    }

    // 批量插入会员数据
    const createdMembers = [];
    for (const member of members) {
      const created = await pb.collection('members').create(member);
      createdMembers.push(created);
      
      if (createdMembers.length % 10 === 0) {
        console.log(`✅ 已创建 ${createdMembers.length}/${MOCK_CONFIG.MEMBER_COUNT} 个会员`);
      }
    }

    console.log(`✅ 所有 ${MOCK_CONFIG.MEMBER_COUNT} 个会员创建完成`);
    return createdMembers;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成会员mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

async function generateMockAddresses(members: any[]) {
  console.log(`📊 开始为会员生成地址数据...`);
  
  try {
    const addresses = [];
    
    for (const member of members) {
      const addressCount = randomInt(1, MOCK_CONFIG.ADDRESS_PER_MEMBER);
      
      for (let i = 0; i < addressCount; i++) {
        const address = generateAddress(member.id);
        
        // 确保每个会员至少有一个默认地址
        if (i === 0) {
          address.is_default = true;
        }
        
        addresses.push(address);
      }
    }

    // 批量插入地址数据
    const createdAddresses = [];
    for (const address of addresses) {
      const created = await pb.collection('addresses').create(address);
      createdAddresses.push(created);
      
      if (createdAddresses.length % 50 === 0) {
        console.log(`✅ 已创建 ${createdAddresses.length}/${addresses.length} 个地址`);
      }
    }

    console.log(`✅ 所有 ${addresses.length} 个地址创建完成`);
    return createdAddresses;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成地址mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

async function generateMockPointsRecords(members: any[]) {
  console.log(`📊 开始为会员生成积分记录数据...`);
  
  try {
    // 获取积分规则
    const rules = await pb.collection('points_rules').getFullList();
    if (rules.length === 0) {
      console.log('⚠️ 没有积分规则，跳过积分记录生成');
      return [];
    }

    const pointsRecords = [];
    
    for (const member of members) {
      const recordCount = randomInt(1, MOCK_CONFIG.POINTS_RECORDS_PER_MEMBER);
      let currentBalance = 0;
      
      for (let i = 0; i < recordCount; i++) {
        const rule = randomChoice(rules);
        const points = randomInt(-200, 500); // 可以是负数（消费积分）
        const balanceBefore = currentBalance;
        currentBalance = Math.max(0, currentBalance + points);
        
        const record = {
          member_id: member.id,
          rule_id: randomBoolean(0.8) ? rule.id : undefined,
          type: rule.type,
          points: points,
          balance_before: balanceBefore,
          balance_after: currentBalance,
          title: randomChoice([
            '购物奖励', '签到奖励', '注册奖励', '评价奖励', '邀请奖励',
            '兑换扣除', '订单抵扣', '过期扣除', '管理员调整'
          ]),
          description: randomChoice([
            '完成订单获得积分奖励',
            '每日签到获得积分',
            '新用户注册奖励',
            '商品评价奖励',
            '邀请好友奖励',
            '积分兑换商品',
            '订单抵扣积分',
            '积分过期扣除',
            '客服手动调整'
          ]),
          related_id: randomBoolean(0.6) ? `order_${randomInt(100000, 999999)}` : undefined,
          related_type: randomChoice(['order', 'checkin', 'review', 'exchange', 'referral']),
          expires_at: points > 0 && randomBoolean(0.7) ? 
            randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : 
            undefined,
          status: randomChoice(['ACTIVE', 'EXPIRED', 'FROZEN', 'USED']),
          operator_id: randomBoolean(0.1) ? 'admin_001' : undefined,
          operator_type: randomChoice(['SYSTEM', 'ADMIN', 'MEMBER']),
          source_data: {
            source: randomChoice(['web', 'mobile', 'miniprogram', 'api']),
            userAgent: randomChoice(['iOS', 'Android', 'Web', 'WeChat']),
            ip: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`
          },
          tags: randomBoolean(0.3) ? [randomChoice(['promotion', 'bonus', 'regular', 'special'])] : undefined
        };

        pointsRecords.push(record);
      }
    }

    // 批量插入积分记录
    const createdRecords = [];
    for (const record of pointsRecords) {
      const created = await pb.collection('points_records').create(record);
      createdRecords.push(created);
      
      if (createdRecords.length % 100 === 0) {
        console.log(`✅ 已创建 ${createdRecords.length}/${pointsRecords.length} 个积分记录`);
      }
    }

    console.log(`✅ 所有 ${pointsRecords.length} 个积分记录创建完成`);
    return createdRecords;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成积分记录mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

async function generateMockMemberTagRelations(members: any[]) {
  console.log(`📊 开始为会员生成标签关系数据...`);
  
  try {
    // 获取会员标签
    const tags = await pb.collection('member_tags').getFullList();
    if (tags.length === 0) {
      console.log('⚠️ 没有会员标签，跳过标签关系生成');
      return [];
    }

    const tagRelations = [];
    
    for (const member of members) {
      const relationCount = randomInt(1, Math.min(MOCK_CONFIG.TAG_RELATIONS_PER_MEMBER, tags.length));
      const memberTags = [...tags].sort(() => 0.5 - Math.random()).slice(0, relationCount);
      
      for (const tag of memberTags) {
        const relation = {
          member_id: member.id,
          tag_id: tag.id,
          assigned_by: randomBoolean(0.2) ? 'admin_001' : undefined,
          assigned_method: randomChoice(['MANUAL', 'AUTO', 'RULE', 'IMPORT']),
          assigned_reason: randomChoice([
            '系统自动分配',
            '管理员手动分配',
            '规则触发分配',
            '数据导入分配',
            '用户行为触发'
          ]),
          assigned_at: randomDate(new Date(member.register_time), new Date()),
          expires_at: randomBoolean(0.3) ? 
            randomDate(new Date(), new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)) : 
            undefined,
          is_active: randomBoolean(0.9),
          priority: randomInt(1, 10),
          source_data: {
            trigger: randomChoice(['order', 'login', 'register', 'activity']),
            confidence: randomFloat(0.5, 1.0, 2)
          },
          metadata: {
            assignedVersion: '1.0',
            notes: randomBoolean(0.2) ? '手动添加的备注信息' : undefined
          }
        };

        tagRelations.push(relation);
      }
    }

    // 批量插入标签关系
    const createdRelations = [];
    for (const relation of tagRelations) {
      const created = await pb.collection('member_tag_relations').create(relation);
      createdRelations.push(created);
      
      if (createdRelations.length % 50 === 0) {
        console.log(`✅ 已创建 ${createdRelations.length}/${tagRelations.length} 个标签关系`);
      }
    }

    console.log(`✅ 所有 ${tagRelations.length} 个标签关系创建完成`);
    return createdRelations;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成标签关系mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

async function generateMockExchangeRecords(members: any[]) {
  console.log(`📊 开始生成积分兑换记录数据...`);
  
  try {
    // 获取积分兑换商品
    const exchanges = await pb.collection('points_exchanges').getFullList();
    if (exchanges.length === 0) {
      console.log('⚠️ 没有积分兑换商品，跳过兑换记录生成');
      return [];
    }

    const exchangeRecords = [];
    
    for (let i = 0; i < MOCK_CONFIG.EXCHANGE_RECORDS_COUNT; i++) {
      const member = randomChoice(members);
      const exchange = randomChoice(exchanges);
      const quantity = randomInt(1, 3);
      const exchangeTime = randomDate(new Date(member.register_time), new Date());
      
      const record = {
        member_id: member.id,
        exchange_id: exchange.id,
        exchange_code: `EX${Date.now()}${randomInt(1000, 9999)}`,
        points_spent: exchange.points_required * quantity,
        reward_value: exchange.reward_value * quantity,
        quantity: quantity,
        status: randomChoice(['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED', 'FAILED', 'REFUNDED']),
        exchange_time: exchangeTime,
        processing_time: randomBoolean(0.8) ? 
          randomDate(new Date(exchangeTime), new Date()) : 
          undefined,
        completion_time: randomBoolean(0.7) ? 
          randomDate(new Date(exchangeTime), new Date()) : 
          undefined,
        cancellation_time: randomBoolean(0.1) ? 
          randomDate(new Date(exchangeTime), new Date()) : 
          undefined,
        failure_reason: randomBoolean(0.05) ? randomChoice([
          '库存不足', '积分不足', '地址信息错误', '系统错误', '用户取消'
        ]) : undefined,
        delivery_info: exchange.exchange_type === 'PRODUCT' && randomBoolean(0.8) ? {
          carrier: randomChoice(['顺丰', '圆通', '中通', '申通', '韵达']),
          trackingNumber: `SF${randomInt(1000000000, 9999999999)}`,
          estimatedDelivery: randomDate(new Date(exchangeTime), new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
        } : undefined,
        contact_info: {
          name: member.real_name || generateChineseName(),
          phone: generatePhoneNumber(),
          address: `${randomChoice(PROVINCES).name}${randomChoice(['市', '区'])}${randomChoice(STREET_NAMES)}${randomInt(1, 999)}号`
        },
        notes: randomBoolean(0.3) ? randomChoice([
          '请在工作日配送',
          '配送前请电话联系',
          '放在门口即可',
          '请妥善包装',
          '急需，请尽快发货'
        ]) : undefined,
        operator_id: randomBoolean(0.2) ? 'admin_001' : undefined,
        external_order_id: randomBoolean(0.6) ? `EXT_${randomInt(100000, 999999)}` : undefined,
        tracking_info: randomBoolean(0.7) ? {
          status: randomChoice(['已发货', '运输中', '派送中', '已签收']),
          lastUpdate: new Date().toISOString(),
          location: randomChoice(['深圳', '广州', '上海', '北京', '杭州'])
        } : undefined,
        metadata: {
          source: randomChoice(['web', 'mobile', 'miniprogram']),
          userAgent: randomChoice(['iOS', 'Android', 'Web']),
          ip: `192.168.${randomInt(1, 255)}.${randomInt(1, 255)}`,
          sessionId: `session_${randomInt(100000, 999999)}`
        }
      };

      exchangeRecords.push(record);
    }

    // 批量插入兑换记录
    const createdRecords = [];
    for (const record of exchangeRecords) {
      const created = await pb.collection('points_exchange_records').create(record);
      createdRecords.push(created);
      
      if (createdRecords.length % 20 === 0) {
        console.log(`✅ 已创建 ${createdRecords.length}/${MOCK_CONFIG.EXCHANGE_RECORDS_COUNT} 个兑换记录`);
      }
    }

    console.log(`✅ 所有 ${MOCK_CONFIG.EXCHANGE_RECORDS_COUNT} 个兑换记录创建完成`);
    return createdRecords;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成兑换记录mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

async function generateMockAddressUsageRecords(addresses: any[], members: any[]) {
  console.log(`📊 开始生成地址使用记录数据...`);
  
  try {
    const usageRecords = [];
    
    for (let i = 0; i < MOCK_CONFIG.ADDRESS_USAGE_RECORDS_COUNT; i++) {
      const address = randomChoice(addresses);
      const member = members.find(m => m.id === address.user_id);
      
      if (!member) continue;
      
      const usageTime = randomDate(new Date(member.register_time), new Date());
      
      const record = {
        address_id: address.id,
        user_id: address.user_id,
        usage_type: randomChoice(['ORDER', 'SHIPPING', 'BILLING', 'OTHER']),
        order_id: randomBoolean(0.8) ? `order_${randomInt(100000, 999999)}` : undefined,
        address_snapshot: {
          name: address.name,
          phone: address.phone,
          address: `${address.province}${address.city}${address.district}${address.address}${address.detail_address || ''}`,
          timestamp: usageTime
        },
        result: randomChoice(['SUCCESS', 'FAILED', 'CANCELLED']),
        result_details: randomBoolean(0.3) ? randomChoice([
          '订单成功配送',
          '用户确认收货',
          '配送失败，地址错误',
          '用户取消订单',
          '无人签收，退回'
        ]) : undefined,
        metadata: {
          deliveryAttempts: randomInt(1, 3),
          carrierUsed: randomChoice(['顺丰', '圆通', '中通', '申通', '韵达']),
          deliveryTime: randomFloat(0.5, 5.0, 1) + '天'
        }
      };

      usageRecords.push(record);
    }

    // 批量插入使用记录
    const createdRecords = [];
    for (const record of usageRecords) {
      const created = await pb.collection('address_usage_records').create(record);
      createdRecords.push(created);
      
      if (createdRecords.length % 50 === 0) {
        console.log(`✅ 已创建 ${createdRecords.length}/${MOCK_CONFIG.ADDRESS_USAGE_RECORDS_COUNT} 个使用记录`);
      }
    }

    console.log(`✅ 所有 ${MOCK_CONFIG.ADDRESS_USAGE_RECORDS_COUNT} 个地址使用记录创建完成`);
    return createdRecords;

  } catch (error) {
    console.log(error);
    console.error('❌ 生成地址使用记录mock数据失败:', getErrorMessage(error));
    throw error;
  }
}

// ========================= 主函数 =========================
async function main() {
  try {
    await authenticate();
    
    console.log('🚀 开始生成会员系统Mock数据...');
    console.log(`📋 生成配置:`);
    console.log(`  - 会员数量: ${MOCK_CONFIG.MEMBER_COUNT}`);
    console.log(`  - 每会员地址数: ${MOCK_CONFIG.ADDRESS_PER_MEMBER}`);
    console.log(`  - 每会员积分记录数: ${MOCK_CONFIG.POINTS_RECORDS_PER_MEMBER}`);
    console.log(`  - 每会员标签数: ${MOCK_CONFIG.TAG_RELATIONS_PER_MEMBER}`);
    console.log(`  - 兑换记录数: ${MOCK_CONFIG.EXCHANGE_RECORDS_COUNT}`);
    console.log(`  - 地址使用记录数: ${MOCK_CONFIG.ADDRESS_USAGE_RECORDS_COUNT}`);
    console.log('');

    // 检查基础数据是否存在
    const levels = await pb.collection('member_levels').getFullList();
    const tags = await pb.collection('member_tags').getFullList();
    const rules = await pb.collection('points_rules').getFullList();
    const exchanges = await pb.collection('points_exchanges').getFullList();
    
    if (levels.length === 0) {
      throw new Error('请先运行 member-system.ts 创建基础数据');
    }

    // 生成会员数据
    const members = await generateMockMembers();
    
    // 生成地址数据
    const addresses = await generateMockAddresses(members);
    
    // 生成积分记录
    const pointsRecords = await generateMockPointsRecords(members);
    
    // 生成标签关系
    const tagRelations = await generateMockMemberTagRelations(members);
    
    // 生成兑换记录
    const exchangeRecords = await generateMockExchangeRecords(members);
    
    // 生成地址使用记录
    const usageRecords = await generateMockAddressUsageRecords(addresses, members);

    console.log('');
    console.log('🎉 所有Mock数据生成完成！');
    console.log('📈 数据统计:');
    console.log(`  - 会员: ${members.length}个`);
    console.log(`  - 地址: ${addresses.length}个`);
    console.log(`  - 积分记录: ${pointsRecords.length}个`);
    console.log(`  - 标签关系: ${tagRelations.length}个`);
    console.log(`  - 兑换记录: ${exchangeRecords.length}个`);
    console.log(`  - 地址使用记录: ${usageRecords.length}个`);
    console.log('');
    console.log('🌟 数据特点:');
    console.log('  ✅ 真实的中文姓名和地址');
    console.log('  ✅ 合理的会员等级分布');
    console.log('  ✅ 符合逻辑的时间关系');
    console.log('  ✅ 丰富的用户行为数据');
    console.log('  ✅ 完整的业务流程记录');
    console.log('');
    console.log('💡 提示: 现在可以在管理后台查看和分析这些数据了！');

  } catch (error) {
    console.error('❌ Mock数据生成失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  main();
} 