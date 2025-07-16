import { authenticate, deleteCollectionIfExists, getErrorMessage, pb } from '../helper.ts';

async function createAdvertisementsCollection() {
  const collection = {
    name: 'advertisements',
    type: 'base',
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['banner', 'popup', 'floating', 'text', 'video', 'rich_media']
      },
      {
        name: 'position',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: [
          'homepage_top',
          'homepage_middle', 
          'homepage_bottom',
          'category_top',
          'category_sidebar',
          'product_detail_top',
          'product_detail_bottom',
          'cart_page',
          'checkout_page',
          'search_results',
          'mobile_banner'
        ]
      },
      {
        name: 'image',
        type: 'file',
        required: false,
        options: { maxSelect: 1, maxSize: 10485760 }
      },
      {
        name: 'link_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['url', 'product', 'category', 'page', 'none']
      },
      {
        name: 'link',
        type: 'url',
        required: false
      },
      {
        name: 'link_product_id',
        type: 'text',
        required: false
      },
      {
        name: 'link_category_id',
        type: 'text',
        required: false
      },
      {
        name: 'target_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['self', 'blank']
      },
      {
        name: 'content',
        type: 'text',
        required: false,
        options: { max: 2000 }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['active', 'inactive', 'expired', 'paused']
      },
      {
        name: 'start_time',
        type: 'date',
        required: true
      },
      {
        name: 'end_time',
        type: 'date',
        required: true
      },
      {
        name: 'weight',
        type: 'number',
        required: true,
        options: { min: 1, max: 100 }
      },
      {
        name: 'click_count',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'view_count',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'budget',
        type: 'number',
        required: false,
        options: { min: 0 }
      },
      {
        name: 'cost',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'tags',
        type: 'text',
        required: false,
        options: { max: 200 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ advertisements 集合创建成功');
  } catch (error) {
    console.error('❌ advertisements 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

async function createAdGroupsCollection() {
  const collection = {
    name: 'ad_groups',
    type: 'base',
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: { max: 100 }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: { max: 500 }
      },
      {
        name: 'position',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: [
          'homepage_top',
          'homepage_middle', 
          'homepage_bottom',
          'category_top',
          'category_sidebar',
          'product_detail_top',
          'product_detail_bottom',
          'cart_page',
          'checkout_page',
          'search_results',
          'mobile_banner'
        ]
      },
      {
        name: 'ad_ids',
        type: 'text',
        required: false,
        options: { max: 1000 }
      },
      {
        name: 'display_count',
        type: 'number',
        required: true,
        options: { min: 1, max: 10 }
      },
      {
        name: 'rotation_type',
        type: 'select',
        required: true,
        maxSelect: 1,
        values: ['sequential', 'random', 'weighted']
      },
      {
        name: 'is_active',
        type: 'bool',
        required: true
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ ad_groups 集合创建成功');
  } catch (error) {
    console.error('❌ ad_groups 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

async function createAdStatsCollection() {
  const collection = {
    name: 'ad_stats',
    type: 'base',
    fields: [
      {
        name: 'ad_id',
        type: 'text',
        required: true
      },
      {
        name: 'date',
        type: 'date',
        required: true
      },
      {
        name: 'view_count',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'click_count',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'ctr',
        type: 'number',
        required: true,
        options: { min: 0, max: 100 }
      },
      {
        name: 'cost',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'conversion_count',
        type: 'number',
        required: true,
        options: { min: 0 }
      },
      {
        name: 'conversion_rate',
        type: 'number',
        required: true,
        options: { min: 0, max: 100 }
      }
    ]
  };

  try {
    await pb.collections.create(collection);
    console.log('✅ ad_stats 集合创建成功');
  } catch (error) {
    console.error('❌ ad_stats 集合创建失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestData() {
  const testAdvertisements = [
    {
      title: '春季新品大促销',
      description: '春季新品上市，全场8折起，限时抢购！',
      type: 'banner',
      position: 'homepage_top',
      link_type: 'url',
      link: 'https://example.com/spring-sale',
      target_type: 'blank',
      content: '春季新品大促销，全场8折起，限时抢购！',
      status: 'active',
      start_time: '2024-03-01 00:00:00.000Z',
      end_time: '2024-05-31 23:59:59.000Z',
      weight: 10,
      click_count: 1250,
      view_count: 15000,
      budget: 5000,
      cost: 1250,
      tags: '春季,促销,新品'
    },
    {
      title: '会员专享优惠',
      description: 'VIP会员专享9折优惠，立即加入享受特权！',
      type: 'popup',
      position: 'homepage_middle',
      link_type: 'page',
      link: 'https://example.com/membership',
      target_type: 'self',
      content: 'VIP会员专享9折优惠，立即加入享受特权！',
      status: 'active',
      start_time: '2024-01-01 00:00:00.000Z',
      end_time: '2024-12-31 23:59:59.000Z',
      weight: 8,
      click_count: 890,
      view_count: 12000,
      budget: 3000,
      cost: 890,
      tags: '会员,优惠,VIP'
    },
    {
      title: '限时秒杀活动',
      description: '每日10点准时开抢，超值商品等你来！',
      type: 'floating',
      position: 'mobile_banner',
      link_type: 'url',
      link: 'https://example.com/flash-sale',
      target_type: 'blank',
      content: '每日10点准时开抢，超值商品等你来！',
      status: 'active',
      start_time: '2024-03-15 00:00:00.000Z',
      end_time: '2024-04-15 23:59:59.000Z',
      weight: 15,
      click_count: 2100,
      view_count: 25000,
      budget: 8000,
      cost: 2100,
      tags: '秒杀,限时,超值'
    },
    {
      title: '新品推荐',
      description: '发现最新最热门的商品，抢先体验！',
      type: 'text',
      position: 'category_sidebar',
      link_type: 'category',
      link_category_id: 'new-arrivals',
      target_type: 'self',
      content: '发现最新最热门的商品，抢先体验！',
      status: 'active',
      start_time: '2024-02-01 00:00:00.000Z',
      end_time: '2024-12-31 23:59:59.000Z',
      weight: 5,
      click_count: 450,
      view_count: 8000,
      budget: 2000,
      cost: 450,
      tags: '新品,推荐,热门'
    },
    {
      title: '购物车优惠券',
      description: '满100减20，满200减50，立即使用！',
      type: 'banner',
      position: 'cart_page',
      link_type: 'url',
      link: 'https://example.com/coupons',
      target_type: 'blank',
      content: '满100减20，满200减50，立即使用！',
      status: 'active',
      start_time: '2024-03-01 00:00:00.000Z',
      end_time: '2024-06-30 23:59:59.000Z',
      weight: 12,
      click_count: 1800,
      view_count: 20000,
      budget: 6000,
      cost: 1800,
      tags: '优惠券,满减,购物车'
    }
  ];

  try {
    for (const ad of testAdvertisements) {
      await pb.collection('advertisements').create(ad);
      console.log(`✅ 广告 "${ad.title}" 创建成功`);
    }
    console.log('✅ 所有测试广告数据插入完成');
  } catch (error) {
    console.error('❌ 测试数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestAdGroups() {
  try {
    // 获取已创建的广告ID
    const ads = await pb.collection('advertisements').getList(1, 5);
    const adIds = ads.items.map(ad => ad.id);

    const testAdGroups = [
      {
        name: '首页轮播广告组',
        description: '首页顶部轮播展示的广告组',
        position: 'homepage_top',
        ad_ids: adIds.slice(0, 3).join(','),
        display_count: 3,
        rotation_type: 'sequential',
        is_active: true
      },
      {
        name: '侧边栏推荐广告组',
        description: '分类页面侧边栏的推荐广告',
        position: 'category_sidebar',
        ad_ids: adIds.slice(3, 5).join(','),
        display_count: 2,
        rotation_type: 'random',
        is_active: true
      }
    ];

    for (const group of testAdGroups) {
      await pb.collection('ad_groups').create(group);
      console.log(`✅ 广告组 "${group.name}" 创建成功`);
    }
    console.log('✅ 所有测试广告组数据插入完成');
  } catch (error) {
    console.error('❌ 测试广告组数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

async function insertTestAdStats() {
  try {
    // 获取已创建的广告ID
    const ads = await pb.collection('advertisements').getList(1, 5);
    
    const today = new Date();
    const stats = [];

    for (const ad of ads.items) {
      // 为每个广告创建最近7天的统计数据
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        const views = Math.floor(Math.random() * 1000) + 100;
        const clicks = Math.floor(Math.random() * 100) + 10;
        const ctr = (clicks / views * 100).toFixed(2);
        const cost = clicks * (Math.random() * 2 + 0.5);
        const conversions = Math.floor(clicks * (Math.random() * 0.3 + 0.1));
        const conversionRate = (conversions / clicks * 100).toFixed(2);

        stats.push({
          ad_id: ad.id,
          date: date.toISOString().split('T')[0],
          view_count: views,
          click_count: clicks,
          ctr: parseFloat(ctr),
          cost: parseFloat(cost.toFixed(2)),
          conversion_count: conversions,
          conversion_rate: parseFloat(conversionRate)
        });
      }
    }

    for (const stat of stats) {
      await pb.collection('ad_stats').create(stat);
    }
    console.log(`✅ 创建了 ${stats.length} 条广告统计数据`);
  } catch (error) {
    console.error('❌ 测试统计数据插入失败:', getErrorMessage(error));
    throw error;
  }
}

// 主函数
async function main() {
  try {
    await authenticate();
    
    // 按依赖关系的反序删除集合（先删除依赖的，再删除被依赖的）
    await deleteCollectionIfExists('ad_stats');
    await deleteCollectionIfExists('ad_groups');
    await deleteCollectionIfExists('advertisements');
    
    console.log('🚀 开始创建广告相关集合...');
    await createAdvertisementsCollection();
    await createAdGroupsCollection();
    await createAdStatsCollection();
    
    console.log('📊 开始插入测试数据...');
    await insertTestData();
    await insertTestAdGroups();
    await insertTestAdStats();
    
    console.log('🎉 所有广告相关集合和测试数据创建完成！');
  } catch (error) {
    console.error('❌ 脚本执行失败:', getErrorMessage(error));
    Deno.exit(1);
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  main();
}


