#!/usr/bin/env -S deno run --allow-net --allow-read --allow-env

import PocketBase from "npm:pocketbase";

// 初始化 PocketBase 客户端
const pb = new PocketBase("http://127.0.0.1:8090");

// 管理员登录
try {
  await pb.admins.authWithPassword("admin@example.com", "admin123456");
  console.log("管理员登录成功");
} catch (error) {
  console.error("管理员登录失败:", error);
  Deno.exit(1);
}

// 积分规则模板集合配置
const pointsRuleTemplatesSchema = {
  name: "points_rule_templates",
  type: "base",
  system: false,
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
      options: {
        min: 1,
        max: 100,
        pattern: ""
      }
    },
    {
      name: "description",
      type: "text",
      required: false,
      options: {
        min: 0,
        max: 500,
        pattern: ""
      }
    },
    {
      name: "template_data",
      type: "json",
      required: true,
      options: {}
    },
    {
      name: "category",
      type: "text",
      required: false,
      options: {
        min: 0,
        max: 50,
        pattern: ""
      }
    },
    {
      name: "is_public",
      type: "bool",
      required: true,
      options: {}
    },
    {
      name: "usage_count",
      type: "number",
      required: true,
      options: {
        min: 0,
        max: null
      }
    },
    {
      name: "created_by",
      type: "text",
      required: true,
      options: {
        min: 1,
        max: 50,
        pattern: ""
      }
    }
  ],
  indexes: [
    "CREATE INDEX idx_points_rule_templates_category ON points_rule_templates (category)",
    "CREATE INDEX idx_points_rule_templates_is_public ON points_rule_templates (is_public)",
    "CREATE INDEX idx_points_rule_templates_usage_count ON points_rule_templates (usage_count)",
    "CREATE INDEX idx_points_rule_templates_created_by ON points_rule_templates (created_by)"
  ],
  listRule: "@request.auth.id != ''",
  viewRule: "@request.auth.id != ''",
  createRule: "@request.auth.id != ''",
  updateRule: "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
  deleteRule: "@request.auth.id != '' && (created_by = @request.auth.id || @request.auth.role = 'admin')",
  options: {}
};

// 创建集合
try {
  console.log("正在创建积分规则模板集合...");
  const collection = await pb.collections.create(pointsRuleTemplatesSchema);
  console.log("✅ 积分规则模板集合创建成功:", collection.name);
} catch (error) {
  if (error instanceof Error && error.message.includes("already exists")) {
    console.log("⚠️  积分规则模板集合已存在，跳过创建");
  } else {
    console.error("❌ 创建积分规则模板集合失败:", error);
    Deno.exit(1);
  }
}

// 创建一些示例模板数据
const sampleTemplates = [
  {
    name: "每日签到奖励",
    description: "用户每日签到可获得积分奖励",
    template_data: {
      name: "每日签到",
      description: "每日签到获得积分",
      type: "earned_login",
      points: 10,
      daily_limit: 1,
      total_limit: 0,
      is_active: true,
      sort_order: 1
    },
    category: "daily",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  },
  {
    name: "注册欢迎奖励",
    description: "新用户注册时的欢迎积分",
    template_data: {
      name: "注册奖励",
      description: "新用户注册欢迎积分",
      type: "earned_register",
      points: 100,
      daily_limit: 0,
      total_limit: 1,
      is_active: true,
      sort_order: 0
    },
    category: "growth",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  },
  {
    name: "购买奖励模板",
    description: "用户购买商品时获得积分",
    template_data: {
      name: "购买奖励",
      description: "每次购买获得积分",
      type: "earned_purchase",
      points: 50,
      daily_limit: 0,
      total_limit: 0,
      is_active: true,
      sort_order: 2
    },
    category: "purchase",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  },
  {
    name: "分享奖励",
    description: "用户分享内容获得积分奖励",
    template_data: {
      name: "分享奖励",
      description: "分享内容获得积分",
      type: "earned_share",
      points: 20,
      daily_limit: 3,
      total_limit: 0,
      is_active: true,
      sort_order: 3
    },
    category: "social",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  },
  {
    name: "评价奖励",
    description: "用户评价商品获得积分",
    template_data: {
      name: "评价奖励",
      description: "评价商品获得积分",
      type: "earned_review",
      points: 15,
      daily_limit: 5,
      total_limit: 0,
      is_active: true,
      sort_order: 4
    },
    category: "activity",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  },
  {
    name: "邀请好友奖励",
    description: "成功邀请好友注册获得积分",
    template_data: {
      name: "邀请奖励",
      description: "邀请好友注册获得积分",
      type: "earned_invite",
      points: 200,
      daily_limit: 0,
      total_limit: 0,
      is_active: true,
      sort_order: 5
    },
    category: "social",
    is_public: true,
    usage_count: 0,
    created_by: "admin"
  }
];

// 插入示例数据
console.log("正在插入示例模板数据...");
for (const template of sampleTemplates) {
  try {
    const record = await pb.collection('points_rule_templates').create(template);
    console.log(`✅ 创建模板: ${template.name}`);
  } catch (error) {
    console.error(`❌ 创建模板失败 ${template.name}:`, error);
  }
}

console.log("🎉 积分规则模板集合和示例数据创建完成！"); 