#!/usr/bin/env -S deno run --allow-net --allow-read --allow-write

import { pocketbaseClient } from '../config/pocketbase.ts';

// 初始化移动端商城数据
async function initMobileData() {
  try {
    console.log('🚀 开始初始化移动端商城数据...');
    
    // 确保认证
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();
    
    // 1. 创建首页轮播图数据
    console.log('📸 创建首页轮播图...');
    const banners = [
      {
        title: '春季家装节',
        image: '/uploads/banner1.jpg',
        link_type: 'category',
        link_value: 'living_room',
        sort_order: 1,
        is_active: true,
      },
      {
        title: '新品上市',
        image: '/uploads/banner2.jpg',
        link_type: 'product',
        link_value: 'product001',
        sort_order: 2,
        is_active: true,
      },
      {
        title: '限时优惠',
        image: '/uploads/banner3.jpg',
        link_type: 'url',
        link_value: 'https://example.com/promotion',
        sort_order: 3,
        is_active: true,
      }
    ];
    
    for (const banner of banners) {
      try {
        await pb.collection('home_banners').create(banner);
        console.log(`✅ 创建轮播图: ${banner.title}`);
      } catch (error) {
        console.log(`⚠️ 轮播图已存在或创建失败: ${banner.title}`);
      }
    }
    
    // 2. 创建首页套装数据
    console.log('🏠 创建首页套装...');
    const packages = [
      {
        name: '现代简约套装',
        subtitle: '包含客厅、卧室、厨房全套家具',
        description: '现代简约风格，追求简洁、舒适的生活理念',
        price: 99999,
        market_price: 129999,
        cover_image: '/uploads/package_modern.jpg',
        images: ['/uploads/package_modern_1.jpg', '/uploads/package_modern_2.jpg'],
        category: '套装家具',
        style_type: 'modern',
        is_recommended: true,
        is_featured: true,
        tags: ['现代', '简约', '全屋定制'],
        sort_order: 1,
        status: 'active',
      },
      {
        name: '北欧风格套装',
        subtitle: '温馨自然，营造舒适运氛围居家氛围',
        description: '北欧设计风格，注重功能性与美观性的完美结合',
        price: 89999,
        market_price: 119999,
        cover_image: '/uploads/package_nordic.jpg',
        images: ['/uploads/package_nordic_1.jpg', '/uploads/package_nordic_2.jpg'],
        category: '套装家具',
        style_type: 'nordic',
        is_recommended: true,
        is_featured: true,
        tags: ['北欧', '自然', '温馨'],
        sort_order: 2,
        status: 'active',
      },
      {
        name: '中式传统套装',
        subtitle: '典雅古朴，传承中华文化之美',
        description: '中式传统家具，展现东方文化的深厚底蕴',
        price: 129999,
        market_price: 159999,
        cover_image: '/uploads/package_chinese.jpg',
        images: ['/uploads/package_chinese_1.jpg', '/uploads/package_chinese_2.jpg'],
        category: '套装家具',
        style_type: 'chinese',
        is_recommended: true,
        is_featured: true,
        tags: ['中式', '传统', '典雅'],
        sort_order: 3,
        status: 'active',
      }
    ];
    
    for (const pkg of packages) {
      try {
        await pb.collection('home_packages').create(pkg);
        console.log(`✅ 创建套装: ${pkg.name}`);
      } catch (error) {
        console.log(`⚠️ 套装已存在或创建失败: ${pkg.name}`);
      }
    }
    
    // 3. 更新产品，添加移动端相关字段
    console.log('📦 更新产品数据...');
    try {
      const products = await pb.collection('products').getFullList();
      
      for (const product of products) {
        const updates: any = {};
        
        // 随机设置特色标识
        if (!product.is_featured) updates.is_featured = Math.random() > 0.7;
        if (!product.is_new) updates.is_new = Math.random() > 0.8;
        if (!product.is_hot) updates.is_hot = Math.random() > 0.75;
        if (!product.is_recommended) updates.is_recommended = Math.random() > 0.6;
        
        // 设置积分和成长值
        if (!product.points) updates.points = Math.floor(product.price * 0.01);
        if (!product.growth_value) updates.growth_value = Math.floor(product.price * 0.005);
        
        // 设置销量和浏览量
        if (!product.sales_count) updates.sales_count = Math.floor(Math.random() * 100);
        if (!product.view_count) updates.view_count = Math.floor(Math.random() * 1000);
        
        // 设置服务保障
        if (!product.service_guarantee) {
          updates.service_guarantee = ['正品保证', '7天无理由退换', '全国联保', '免费安装'];
        }
        
        if (Object.keys(updates).length > 0) {
          await pb.collection('products').update(product.id, updates);
          console.log(`✅ 更新产品: ${product.name}`);
        }
      }
    } catch (error) {
      console.log('⚠️ 更新产品数据失败:', error);
    }
    
    // 4. 创建优惠券数据
    console.log('🎫 创建优惠券...');
    const coupons = [
      {
        name: '新用户专享券',
        type: 'fixed',
        value: 100,
        min_amount: 500,
        description: '新用户注册专享100元优惠券',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        usage_limit: 1000,
        used_count: 0,
        status: 'active',
      },
      {
        name: '满1000减200',
        type: 'fixed',
        value: 200,
        min_amount: 1000,
        description: '购买满1000元减200元',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        usage_limit: 500,
        used_count: 0,
        status: 'active',
      },
      {
        name: '全场9折券',
        type: 'percent',
        value: 0.9,
        min_amount: 300,
        max_discount: 500,
        description: '全场商品9折优惠，最高优惠500元',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        usage_limit: 200,
        used_count: 0,
        status: 'active',
      }
    ];
    
    for (const coupon of coupons) {
      try {
        await pb.collection('coupons').create(coupon);
        console.log(`✅ 创建优惠券: ${coupon.name}`);
      } catch (error) {
        console.log(`⚠️ 优惠券已存在或创建失败: ${coupon.name}`);
      }
    }
    
    // 5. 创建系统通知
    console.log('📢 创建系统通知...');
    const notifications = [
      {
        title: '欢迎使用装库科技商城',
        content: '感谢您选择装库科技，我们将为您提供优质的家居产品和服务！',
        type: 'system',
        is_read: false,
        link_type: 'none',
      },
      {
        title: '春季家装节开始啦！',
        content: '春季家装节火热进行中，全场家具5折起，更有惊喜好礼等您来拿！',
        type: 'promotion',
        is_read: false,
        link_type: 'url',
        link_value: '/promotion/spring-festival',
      },
      {
        title: '新品上市通知',
        content: '全新北欧风格沙发系列上市，简约设计，舒适体验，现在购买享受早鸟优惠！',
        type: 'announcement',
        is_read: false,
        link_type: 'category',
        link_value: 'sofa',
      }
    ];
    
    for (const notification of notifications) {
      try {
        await pb.collection('notifications').create(notification);
        console.log(`✅ 创建通知: ${notification.title}`);
      } catch (error) {
        console.log(`⚠️ 通知已存在或创建失败: ${notification.title}`);
      }
    }
    
    console.log('✨ 移动端商城数据初始化完成！');
    console.log('');
    console.log('📱 现在您可以使用以下接口测试移动端功能：');
    console.log('- 首页数据: query { homeData { ... } }');
    console.log('- 商品列表: query { mobileProducts { ... } }');
    console.log('- 分类数据: query { categoryData { ... } }');
    console.log('');
    console.log('🔗 GraphQL 端点: http://localhost:8082/graphql');
    console.log('🎯 GraphiQL 界面: http://localhost:8082/graphql');
    
  } catch (error) {
    console.error('❌ 初始化数据失败:', error);
    Deno.exit(1);
  }
}

// 运行初始化
if (import.meta.main) {
  await initMobileData();
} 