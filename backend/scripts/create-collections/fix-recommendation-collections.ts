import PocketBase from 'pocketbase';

const pb = new PocketBase('http://localhost:8090');

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

async function authenticate() {
  try {
    await pb.admins.authWithPassword('ahukpyu@outlook.com', 'kpyu1512..@');
    console.log('✅ 管理员认证成功');
  } catch (error) {
    console.error('❌ 认证失败:', getErrorMessage(error));
    throw error;
  }
}

async function fixRecommendationCollections() {
  try {
    await authenticate();
    
    // 删除有问题的集合
    const collectionsToFix = ['recommendations', 'recommendation_rules'];
    
    for (const collName of collectionsToFix) {
      try {
        await pb.collections.delete(collName);
        console.log(`🗑️ 删除有问题的集合: ${collName}`);
      } catch (error) {
        console.log(`⚠️ 删除集合 ${collName} 失败:`, getErrorMessage(error));
      }
    }
    
    // 重新创建推荐集合
    console.log('\n📝 重新创建推荐集合...');
    const recommendationsSchema = {
      name: 'recommendations',
      type: 'base',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['hot', 'new', 'recommend', 'category', 'brand', 'manual', 'other']
        },
        {
          name: 'position',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['homepage_banner', 'homepage_grid', 'category_top', 'category_side', 'sidebar', 'footer', 'popup', 'other']
        },
        {
          name: 'products',
          type: 'json',
          required: false
        },
        {
          name: 'priority',
          type: 'number',
          required: false
        },
        {
          name: 'clicks',
          type: 'number',
          required: false
        },
        {
          name: 'views',
          type: 'number',
          required: false
        },
        {
          name: 'status',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['active', 'inactive', 'expired']
        },
        {
          name: 'start_time',
          type: 'date',
          required: false
        },
        {
          name: 'end_time',
          type: 'date',
          required: false
        },
        {
          name: 'description',
          type: 'text',
          required: false
        }
      ]
    };
    
    await pb.collections.create(recommendationsSchema);
    console.log('✅ recommendations 集合创建成功');
    
    // 重新创建推荐规则集合
    console.log('\n📝 重新创建推荐规则集合...');
    const recommendationRulesSchema = {
      name: 'recommendation_rules',
      type: 'base',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true
        },
        {
          name: 'type',
          type: 'select',
          required: true,
          maxSelect: 1,
          values: ['sales', 'views', 'rating', 'new', 'category', 'brand', 'price', 'manual']
        },
        {
          name: 'algorithm',
          type: 'select',
          required: false,
          maxSelect: 1,
          values: ['collaborative', 'content_based', 'popularity', 'trending', 'random', 'manual']
        },
        {
          name: 'conditions',
          type: 'json',
          required: false
        },
        {
          name: 'weight',
          type: 'number',
          required: false
        },
        {
          name: 'limit',
          type: 'number',
          required: false
        },
        {
          name: 'sort_order',
          type: 'number',
          required: false
        },
        {
          name: 'is_active',
          type: 'bool',
          required: false
        },
        {
          name: 'description',
          type: 'text',
          required: false
        }
      ]
    };
    
    await pb.collections.create(recommendationRulesSchema);
    console.log('✅ recommendation_rules 集合创建成功');
    
    console.log('\n✅ 推荐相关集合修复完成！');
    
  } catch (error) {
    console.error('❌ 修复失败:', getErrorMessage(error));
  }
}

if (import.meta.main) {
  fixRecommendationCollections();
} 