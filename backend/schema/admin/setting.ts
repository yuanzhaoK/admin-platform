export const settingTypeDefs = `
  # 订单设置类型
  type OrderSetting {
    id: String!
    setting_key: String!
    setting_name: String!
    setting_value: String!
    setting_type: SettingType!
    description: String
    category: SettingCategory!
    created: String!
    updated: String!
  }

  enum SettingType {
    number
    boolean
    text
    json
  }

  enum SettingCategory {
    payment
    shipping
    timeout
    auto_operations
    notifications
  }

  extend type Query {
    # 设置查询
    orderSettings: [OrderSetting!]!
    orderSetting(key: String!): OrderSetting
  }

  extend type Mutation {
    # 设置变更
    updateOrderSetting(id: String!, value: String!): OrderSetting!
  }
`; 