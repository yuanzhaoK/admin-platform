import { pocketbaseClient } from '../config/pocketbase.ts';

interface TestResult {
  test: string;
  success: boolean;
  message: string;
  data?: any;
}

async function validateAdvertisementModule(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  try {
    await pocketbaseClient.ensureAuth();
    const pb = pocketbaseClient.getClient();

    console.log('🧪 开始验证广告模块功能...\n');

    // 1. 测试广告列表查询
    console.log('📋 测试1: 广告列表查询');
    try {
      const ads = await pb.collection('advertisements').getList(1, 10);
      results.push({
        test: '广告列表查询',
        success: true,
        message: `成功获取 ${ads.items.length} 个广告`,
        data: { count: ads.items.length, total: ads.totalItems }
      });
      console.log(`✅ 成功: 获取到 ${ads.items.length} 个广告`);
    } catch (error) {
      results.push({
        test: '广告列表查询',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 2. 测试广告搜索功能
    console.log('\n🔍 测试2: 广告搜索功能');
    try {
      const searchResults = await pb.collection('advertisements').getList(1, 10, {
        filter: 'name ~ "春季"'
      });
      results.push({
        test: '广告搜索功能',
        success: true,
        message: `搜索"春季"找到 ${searchResults.items.length} 个结果`,
        data: { query: '春季', count: searchResults.items.length }
      });
      console.log(`✅ 成功: 搜索"春季"找到 ${searchResults.items.length} 个结果`);
    } catch (error) {
      results.push({
        test: '广告搜索功能',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 3. 测试广告状态筛选
    console.log('\n🎯 测试3: 广告状态筛选');
    try {
      const activeAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'status = "active"'
      });
      const inactiveAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'status = "inactive"'
      });
      results.push({
        test: '广告状态筛选',
        success: true,
        message: `活跃广告: ${activeAds.items.length}, 非活跃广告: ${inactiveAds.items.length}`,
        data: { active: activeAds.items.length, inactive: inactiveAds.items.length }
      });
      console.log(`✅ 成功: 活跃广告 ${activeAds.items.length} 个，非活跃广告 ${inactiveAds.items.length} 个`);
    } catch (error) {
      results.push({
        test: '广告状态筛选',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 4. 测试创建新广告
    console.log('\n➕ 测试4: 创建新广告');
    try {
      const newAd = {
        name: '测试广告_' + Date.now(),
        description: '这是一个测试广告',
        type: 'banner',
        position: 'homepage_top',
        image: '/test/test-banner.jpg',
        link_type: 'url',
        link_url: '/test',
        target_type: 'self',
        status: 'inactive',
        start_time: new Date().toISOString(),
        end_time: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        weight: 1,
        click_count: 0,
        view_count: 0,
        cost: 0
      };

      const createdAd = await pb.collection('advertisements').create(newAd);
      results.push({
        test: '创建新广告',
        success: true,
        message: `成功创建广告: ${createdAd.name}`,
        data: { id: createdAd.id, name: createdAd.name }
      });
      console.log(`✅ 成功: 创建广告 "${createdAd.name}"`);

      // 清理测试数据
      await pb.collection('advertisements').delete(createdAd.id);
      console.log(`🧹 清理: 已删除测试广告`);

    } catch (error) {
      results.push({
        test: '创建新广告',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 5. 测试广告组功能
    console.log('\n👥 测试5: 广告组功能');
    try {
      const adGroups = await pb.collection('ad_groups').getList(1, 10);
      results.push({
        test: '广告组功能',
        success: true,
        message: `成功获取 ${adGroups.items.length} 个广告组`,
        data: { count: adGroups.items.length }
      });
      console.log(`✅ 成功: 获取到 ${adGroups.items.length} 个广告组`);
    } catch (error) {
      results.push({
        test: '广告组功能',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 6. 测试统计数据
    console.log('\n📊 测试6: 统计数据');
    try {
      const stats = await pb.collection('ad_stats').getList(1, 10);
      results.push({
        test: '统计数据',
        success: true,
        message: `成功获取 ${stats.items.length} 条统计记录`,
        data: { count: stats.items.length, total: stats.totalItems }
      });
      console.log(`✅ 成功: 获取到 ${stats.items.length} 条统计记录`);
    } catch (error) {
      results.push({
        test: '统计数据',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 7. 测试广告类型分组
    console.log('\n🏷️ 测试7: 广告类型分组');
    try {
      const bannerAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'type = "banner"'
      });
      const popupAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'type = "popup"'
      });
      const textAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'type = "text"'
      });

      results.push({
        test: '广告类型分组',
        success: true,
        message: `横幅: ${bannerAds.items.length}, 弹窗: ${popupAds.items.length}, 文字: ${textAds.items.length}`,
        data: { 
          banner: bannerAds.items.length, 
          popup: popupAds.items.length, 
          text: textAds.items.length 
        }
      });
      console.log(`✅ 成功: 横幅广告 ${bannerAds.items.length} 个，弹窗广告 ${popupAds.items.length} 个，文字广告 ${textAds.items.length} 个`);
    } catch (error) {
      results.push({
        test: '广告类型分组',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 8. 测试广告位置筛选
    console.log('\n📍 测试8: 广告位置筛选');
    try {
      const homepageAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'position ~ "homepage"'
      });
      const categoryAds = await pb.collection('advertisements').getList(1, 10, {
        filter: 'position ~ "category"'
      });

      results.push({
        test: '广告位置筛选',
        success: true,
        message: `首页位置: ${homepageAds.items.length}, 分类页位置: ${categoryAds.items.length}`,
        data: { 
          homepage: homepageAds.items.length, 
          category: categoryAds.items.length 
        }
      });
      console.log(`✅ 成功: 首页位置 ${homepageAds.items.length} 个，分类页位置 ${categoryAds.items.length} 个`);
    } catch (error) {
      results.push({
        test: '广告位置筛选',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 9. 测试权重排序
    console.log('\n⚖️ 测试9: 权重排序');
    try {
      const sortedAds = await pb.collection('advertisements').getList(1, 10, {
        sort: '-weight'
      });

             if (sortedAds.items.length > 1) {
         const isProperlySorted = sortedAds.items[0].weight >= sortedAds.items[1].weight;
         results.push({
           test: '权重排序',
           success: isProperlySorted,
           message: isProperlySorted ? '权重排序正确' : '权重排序有误',
           data: { 
             first: sortedAds.items[0].weight, 
             second: sortedAds.items[1]?.weight 
           }
         });
         console.log(isProperlySorted ? '✅ 成功: 权重排序正确' : '❌ 失败: 权重排序有误');
      } else {
        results.push({
          test: '权重排序',
          success: true,
          message: '数据不足，无法测试排序',
          data: { count: sortedAds.items.length }
        });
        console.log('⚠️ 警告: 数据不足，无法测试排序');
      }
    } catch (error) {
      results.push({
        test: '权重排序',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

    // 10. 测试时间范围筛选
    console.log('\n⏰ 测试10: 时间范围筛选');
    try {
      const currentDate = new Date().toISOString();
      const activeTimeAds = await pb.collection('advertisements').getList(1, 10, {
        filter: `start_time <= "${currentDate}" && end_time >= "${currentDate}"`
      });

      results.push({
        test: '时间范围筛选',
        success: true,
        message: `当前时间有效的广告: ${activeTimeAds.items.length} 个`,
        data: { count: activeTimeAds.items.length }
      });
      console.log(`✅ 成功: 当前时间有效的广告 ${activeTimeAds.items.length} 个`);
    } catch (error) {
      results.push({
        test: '时间范围筛选',
        success: false,
        message: `失败: ${error}`
      });
      console.log(`❌ 失败: ${error}`);
    }

  } catch (error) {
    console.error('❌ 验证过程中发生错误:', error);
  }

  return results;
}

async function printSummary(results: TestResult[]) {
  console.log('\n' + '='.repeat(60));
  console.log('📊 广告模块验证总结');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;

  console.log(`\n✅ 成功: ${successCount}/${totalCount} 项测试通过`);
  console.log(`❌ 失败: ${totalCount - successCount}/${totalCount} 项测试失败`);

  if (successCount === totalCount) {
    console.log('\n🎉 所有测试都通过了！广告模块工作正常。');
  } else {
    console.log('\n⚠️ 部分测试失败，请检查相关功能。');
    console.log('\n失败的测试:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  - ${result.test}: ${result.message}`);
    });
  }

  console.log('\n详细测试结果:');
  results.forEach((result, index) => {
    const status = result.success ? '✅' : '❌';
    console.log(`  ${index + 1}. ${status} ${result.test}: ${result.message}`);
  });

  console.log('\n' + '='.repeat(60));
}

// 如果直接运行此脚本
if (import.meta.main) {
  validateAdvertisementModule()
    .then(async (results) => {
      await printSummary(results);
      
      const successCount = results.filter(r => r.success).length;
      const totalCount = results.length;
      
      if (successCount === totalCount) {
        console.log('✅ 脚本执行完成 - 所有测试通过');
        Deno.exit(0);
      } else {
        console.log('❌ 脚本执行完成 - 部分测试失败');
        Deno.exit(1);
      }
    })
    .catch((error) => {
      console.error('❌ 脚本执行失败:', error);
      Deno.exit(1);
    });
}

export { validateAdvertisementModule };
