import { pocketbaseClient } from '../../config/pocketbase.ts';

interface Advertisement {
  name: string;
  description?: string;
  type: string;
  position: string;
  image: string;
  link_type: string;
  link_url?: string;
  link_product_id?: string;
  link_category_id?: string;
  target_type: string;
  content?: string;
  status: string;
  start_time: string;
  end_time: string;
  weight: number;
  click_count: number;
  view_count: number;
  budget?: number;
  cost: number;
  tags?: string[];
}

interface AdGroup {
  name: string;
  description?: string;
  position: string;
  ad_ids: string[];
  display_count: number;
  rotation_type: string;
  is_active: boolean;
}

interface AdStats {
  ad_id: string;
  date: string;
  view_count: number;
  click_count: number;
  ctr: number;
  cost: number;
  conversion_count: number;
  conversion_rate: number;
}

async function initAdvertisementData() {
  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('🚀 开始初始化广告模块数据...');

    // 1. 清理现有数据
    console.log('🧹 清理现有数据...');
    try {
      const existingAds = await pb.collection('advertisements').getFullList();
      for (const ad of existingAds) {
        await pb.collection('advertisements').delete(ad.id);
      }
    } catch (error) {
      console.log('advertisements 集合可能不存在，跳过清理');
    }

    try {
      const existingGroups = await pb.collection('ad_groups').getFullList();
      for (const group of existingGroups) {
        await pb.collection('ad_groups').delete(group.id);
      }
    } catch (error) {
      console.log('ad_groups 集合可能不存在，跳过清理');
    }

    try {
      const existingStats = await pb.collection('ad_stats').getFullList();
      for (const stat of existingStats) {
        await pb.collection('ad_stats').delete(stat.id);
      }
    } catch (error) {
      console.log('ad_stats 集合可能不存在，跳过清理');
    }

    // 2. 创建广告数据
    console.log('📝 创建广告数据...');
    const advertisements: Advertisement[] = [
      {
        name: '春季促销横幅',
        description: '春季新品上市，全场8折优惠',
        type: 'banner',
        position: 'homepage_top',
        image: '/images/ads/spring-banner.jpg',
        link_type: 'url',
        link_url: '/promotions/spring',
        target_type: 'self',
        content: '春季大促销，全场8折起！',
        status: 'active',
        start_time: '2024-03-01T00:00:00Z',
        end_time: '2024-03-31T23:59:59Z',
        weight: 10,
        click_count: 3840,
        view_count: 125600,
        budget: 5000,
        cost: 2580,
        tags: ['促销', '春季', '横幅']
      },
      {
        name: '新品发布弹窗',
        description: '最新智能手机发布，抢先预订',
        type: 'popup',
        position: 'homepage_middle',
        image: '/images/ads/new-phone-popup.jpg',
        link_type: 'product',
        link_product_id: 'phone-001',
        target_type: 'blank',
        content: '新品首发，立即抢购！',
        status: 'active',
        start_time: '2024-03-15T00:00:00Z',
        end_time: '2024-04-15T23:59:59Z',
        weight: 8,
        click_count: 1260,
        view_count: 45200,
        budget: 3000,
        cost: 1890,
        tags: ['新品', '手机', '弹窗']
      },
      {
        name: '会员专享浮动广告',
        description: 'VIP会员专享优惠，限时抢购',
        type: 'floating',
        position: 'category_sidebar',
        image: '/images/ads/vip-floating.jpg',
        link_type: 'category',
        link_category_id: 'electronics',
        target_type: 'self',
        content: 'VIP专享价格，立即查看！',
        status: 'active',
        start_time: '2024-03-01T00:00:00Z',
        end_time: '2024-12-31T23:59:59Z',
        weight: 6,
        click_count: 890,
        view_count: 28500,
        budget: 2000,
        cost: 1250,
        tags: ['会员', '专享', '浮动']
      },
      {
        name: '品牌合作文字广告',
        description: '与知名品牌合作推广',
        type: 'text',
        position: 'product_detail_top',
        image: '/images/ads/brand-text.jpg',
        link_type: 'url',
        link_url: 'https://partner.example.com',
        target_type: 'blank',
        content: '品牌合作，品质保证！',
        status: 'active',
        start_time: '2024-02-01T00:00:00Z',
        end_time: '2024-05-31T23:59:59Z',
        weight: 5,
        click_count: 650,
        view_count: 18900,
        budget: 1500,
        cost: 800,
        tags: ['品牌', '合作', '文字']
      },
      {
        name: '季末清仓视频广告',
        description: '季末清仓，最后机会',
        type: 'video',
        position: 'homepage_bottom',
        image: '/images/ads/clearance-video.jpg',
        link_type: 'page',
        link_url: '/clearance',
        target_type: 'self',
        content: '季末清仓，低至3折！',
        status: 'paused',
        start_time: '2024-02-20T00:00:00Z',
        end_time: '2024-03-20T23:59:59Z',
        weight: 4,
        click_count: 420,
        view_count: 12600,
        budget: 1000,
        cost: 580,
        tags: ['清仓', '季末', '视频']
      },
      {
        name: '母亲节特别推广',
        description: '母亲节礼品推荐',
        type: 'banner',
        position: 'category_top',
        image: '/images/ads/mothers-day.jpg',
        link_type: 'category',
        link_category_id: 'gifts',
        target_type: 'self',
        content: '母亲节礼品，表达爱意！',
        status: 'inactive',
        start_time: '2024-05-01T00:00:00Z',
        end_time: '2024-05-15T23:59:59Z',
        weight: 7,
        click_count: 0,
        view_count: 0,
        budget: 2500,
        cost: 0,
        tags: ['母亲节', '礼品', '横幅']
      }
    ];

    const createdAds: string[] = [];
    for (const ad of advertisements) {
      try {
        const result = await pb.collection('advertisements').create(ad);
        createdAds.push(result.id);
        console.log(`✅ 创建广告: ${ad.name}`);
      } catch (error) {
        console.error(`❌ 创建广告失败: ${ad.name}`, error);
      }
    }

    // 3. 创建广告组数据
    console.log('📝 创建广告组数据...');
    const adGroups: AdGroup[] = [
      {
        name: '首页轮播广告组',
        description: '首页顶部轮播广告',
        position: 'homepage_top',
        ad_ids: createdAds.slice(0, 3),
        display_count: 3,
        rotation_type: 'sequential',
        is_active: true
      },
      {
        name: '分类页推荐广告组',
        description: '分类页面推荐广告',
        position: 'category_sidebar',
        ad_ids: createdAds.slice(2, 5),
        display_count: 2,
        rotation_type: 'weighted',
        is_active: true
      }
    ];

    for (const group of adGroups) {
      try {
        await pb.collection('ad_groups').create(group);
        console.log(`✅ 创建广告组: ${group.name}`);
      } catch (error) {
        console.error(`❌ 创建广告组失败: ${group.name}`, error);
      }
    }

    // 4. 创建统计数据
    console.log('📝 创建统计数据...');
    const adStats: AdStats[] = [];
    
    // 为每个广告生成最近30天的统计数据
    for (let i = 0; i < createdAds.length; i++) {
      const adId = createdAds[i];
      const baseViews = Math.floor(Math.random() * 5000) + 1000;
      const baseClicks = Math.floor(baseViews * (Math.random() * 0.05 + 0.01));
      
      for (let day = 0; day < 30; day++) {
        const date = new Date();
        date.setDate(date.getDate() - day);
        
        const dailyViews = Math.floor(baseViews * (0.8 + Math.random() * 0.4));
        const dailyClicks = Math.floor(baseClicks * (0.7 + Math.random() * 0.6));
        const ctr = dailyViews > 0 ? (dailyClicks / dailyViews * 100) : 0;
        const cost = dailyClicks * (Math.random() * 2 + 0.5);
        const conversions = Math.floor(dailyClicks * (Math.random() * 0.1 + 0.02));
        const conversionRate = dailyClicks > 0 ? (conversions / dailyClicks * 100) : 0;

        adStats.push({
          ad_id: adId,
          date: date.toISOString().split('T')[0],
          view_count: dailyViews,
          click_count: dailyClicks,
          ctr: Number(ctr.toFixed(2)),
          cost: Number(cost.toFixed(2)),
          conversion_count: conversions,
          conversion_rate: Number(conversionRate.toFixed(2))
        });
      }
    }

    // 批量创建统计数据
    for (const stat of adStats) {
      try {
        await pb.collection('ad_stats').create(stat);
      } catch (error) {
        console.error('❌ 创建统计数据失败', error);
      }
    }

    console.log(`✅ 创建了 ${adStats.length} 条统计数据`);

    console.log('🎉 广告模块数据初始化完成！');
    console.log(`📊 总计创建:`);
    console.log(`   - 广告: ${advertisements.length} 个`);
    console.log(`   - 广告组: ${adGroups.length} 个`);
    console.log(`   - 统计数据: ${adStats.length} 条`);

  } catch (error) {
    console.error('❌ 初始化失败:', error);
    throw error;
  }
}

// 如果直接运行此脚本
if (import.meta.main) {
  initAdvertisementData()
    .then(() => {
      console.log('✅ 脚本执行完成');
      Deno.exit(0);
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      Deno.exit(1);
    });
}

export { initAdvertisementData };
