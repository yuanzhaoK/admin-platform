import { GraphQLError } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";
import { pocketbaseClient } from '../../config/pocketbase.ts';
import { HomeBanner } from '../../types/home.ts';

export const homeResolvers = {
  Query: {
     // 首页数据
    appHomeData: async (_parent: any, _args: any, context: any) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取轮播图
        let banners: HomeBanner[] = [];
        try {
          const bannersResult = await pb.collection('advertisements').getFullList({
            sort: '-end_time',
            filter: 'type="banner"&&status="active"',
          });
          banners = bannersResult.map((banner: any) => ({
            id: banner.id,
            title: banner.title,
            image_url: pb.files.getURL(banner, banner.image_url) ||'',
            link_url: banner.link || banner.link_url || '',
            status: banner.status || 1,
            start_time: banner.start_time || '',
            end_time: banner.end_time || '',
            created: banner.created || '',
            updated: banner.updated || '',
            position: banner.position || 0,
            type: banner.type || 'banner',
            sort_order: banner.sort_order || 0,
            link_type: banner.link_type || '',
            target_type: banner.target_type || '',
            target_id: banner.target_id || '',
            description: banner.description || '',
          }));
        } catch (e) {
          console.log('home_banners collection not found, using empty array');
        }

        // 获取特色产品 - 使用现有产品数据，转换为AppFeaturedProduct格式
        let featuredProducts: any[] = [];
        try {
          const productsResult = await pb.collection('products').getFullList({
            sort: '-created',
            perPage: 10,
          });
          featuredProducts = productsResult.map((product: any) => ({
            id: product.id,
            name: product.name,
            price: product.price,
            original_price: product.original_price,
            discount_percentage: product.original_price && product.original_price > product.price 
              ? ((product.original_price - product.price) / product.original_price) * 100 
              : null,
            image_url: product.image || product.image_url || '',
            rating: product.rating || 0,
            sales_count: product.sales_count || 0,
          }));
        } catch (e) {
          console.log('Error fetching products:', e);
        }

        // 获取分类 - 转换为AppCategory格式
        let categories: any[] = [];
        try {
          const categoriesResult = await pb.collection('product_categories').getFullList({
            sort: 'created',
            perPage: 8,
          });
          categories = categoriesResult.map((category: any) => ({
            id: category.id,
            name: category.name,
            icon_url: category.icon || category.icon_url || '',
            product_count: category.product_count || 0,
          }));
        } catch (e) {
          console.log('product_categories collection not found');
        }

        // 获取热门商品 - 从trending_items集合
        let trendingItems: any[] = [];
        try {
          const trendingResult = await pb.collection('trending_items').getFullList({
            sort: '-score',
            perPage: 10,
          });
          trendingItems = trendingResult.map((item: any) => ({
            id: item.id,
            name: item.name || item.product_name,
            image_url: item.image_url || '',
            score: item.score || 0,
            type: item.type || 'product',
          }));
        } catch (e) {
          console.log('trending_items collection not found, using featured products');
          // 如果没有热门商品数据，使用特色产品的前5个
          trendingItems = featuredProducts.slice(0, 5).map((product: any) => ({
            id: product.id,
            name: product.name,
            image_url: product.image_url,
            score: Math.random() * 100, // 临时分数
            type: 'product',
          }));
        }

        // 获取商品推荐 - 从recommendations集合
        let recommendations: any[] = [];
        try {
          const recommendationsResult = await pb.collection('recommendations').getFullList({
            sort: '-weight',
            perPage: 5,
            expand: 'products',
          });
          recommendations = recommendationsResult.map((rec: any) => ({
            id: rec.id,
            name: rec.name,
            type: rec.type,
            position: rec.position,
            products: rec.expand?.products ? rec.expand.products.map((product: any) => ({
              id: product.id,
              name: product.name,
              price: product.price,
              original_price: product.original_price,
              discount_percentage: product.original_price && product.original_price > product.price 
                ? ((product.original_price - product.price) / product.original_price) * 100 
                : null,
              image_url: product.image || product.image_url || '',
              rating: product.rating || 0,
              sales_count: product.sales_count || 0,
            })) : [],
          }));
        } catch (e) {
          console.log('recommendations collection not found');
        }

        // 获取广告 - 从advertisements集合
        let advertisements: any[] = [];
        try {
          const adsResult = await pb.collection('advertisements').getFullList({
            sort: 'sort_order',
            filter: 'status="active"',
          });
          advertisements = adsResult.map((ad: any) => ({
            id: ad.id,
            title: ad.title,
            image_url: ad.image_url || '',
            link_url: ad.link_url || '',
            position: ad.position || 'home',
            type: ad.type || 'banner',
          }));
        } catch (e) {
          console.log('advertisements collection not found');
        }

        return {
          banners,
          featured_products: featuredProducts,
          categories,
          trending_items: trendingItems,
          recommendations,
          advertisements,
        };
      } catch (error) {
        console.error('Error fetching app home data:', error);
        throw new GraphQLError('获取首页数据失败');
      }
    },
  }
}