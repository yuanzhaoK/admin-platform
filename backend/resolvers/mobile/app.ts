/**
 * 移动端APP专用Resolvers
 * 所有接口都使用 app 前缀，与管理后台接口完全分离
 */

import { GraphQLError } from "https://deno.land/x/graphql_deno@v15.0.0/mod.ts";
import { pocketbaseClient } from '../../config/pocketbase.ts';

export const appResolvers = {
  Query: {
    // 首页数据
    appHomeData: async (_parent: any, _args: any, context: any) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取轮播图
        let banners: any[] = [];
        try {
          const bannersResult = await pb.collection('home_banners').getFullList({
            sort: 'sort_order',
            filter: 'is_active=true',
          });
          banners = bannersResult.map((banner: any) => ({
            id: banner.id,
            title: banner.title,
            image_url: banner.image || banner.image_url,
            link_url: banner.link || banner.link_url,
            type: banner.type || 'banner',
            sort_order: banner.sort_order,
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

    // 购物车
    appCart: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const cartItems = await pb.collection('cart_items').getFullList({
          sort: '-created',
          filter: `user_id="${user.id}"`,
          expand: 'product',
        });

        const totalItems = cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
        const totalAmount = cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);
        const selectedAmount = cartItems
          .filter((item: any) => item.selected)
          .reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0);

        return {
          items: cartItems,
          total_items: totalItems,
          total_amount: totalAmount,
          selected_amount: selectedAmount,
        };
      } catch (error) {
        console.error('Error fetching app cart:', error);
        throw new GraphQLError('获取购物车失败');
      }
    },

    // 收藏列表
    appFavorites: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { page = 1, perPage = 20 } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const result = await pb.collection('favorites').getList(page, perPage, {
          sort: '-created',
          filter: `user_id="${user.id}"`,
          expand: 'product',
        });

        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems,
          },
        };
      } catch (error) {
        console.error('Error fetching app favorites:', error);
        throw new GraphQLError('获取收藏列表失败');
      }
    },

    // 检查是否收藏
    appIsFavorite: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { product_id } = args;
        
        if (!user) {
          return false;
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const favorites = await pb.collection('favorites').getFullList({
          filter: `user_id="${user.id}" && product_id="${product_id}"`,
        });

        return favorites.length > 0;
      } catch (error) {
        console.error('Error checking app favorite:', error);
        return false;
      }
    },

    // 地址列表
    appAddresses: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const addresses = await pb.collection('addresses').getFullList({
          sort: '-is_default,-created',
          filter: `user_id="${user.id}"`,
        });

        return addresses;
      } catch (error) {
        console.error('Error fetching app addresses:', error);
        throw new GraphQLError('获取地址列表失败');
      }
    },

    // 默认地址
    appDefaultAddress: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          return null;
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const addresses = await pb.collection('addresses').getFullList({
          filter: `user_id="${user.id}" && is_default=true`,
        });

        return addresses.length > 0 ? addresses[0] : null;
      } catch (error) {
        console.error('Error fetching app default address:', error);
        return null;
      }
    },

    // 移动端用户信息
    appProfile: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const userProfile = await pb.collection('users').getOne(user.id);
        
        return {
          ...userProfile,
          identity: userProfile.email || userProfile.username,
          points: userProfile.points || 0,
          growth_value: userProfile.growth_value || 0,
          level: userProfile.level || 1,
          vip_status: userProfile.vip_status || 'normal',
          balance: userProfile.balance || 0,
        };
      } catch (error) {
        console.error('Error fetching app profile:', error);
        throw new GraphQLError('获取用户信息失败');
      }
    },

    // 用户优惠券
    appUserCoupons: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const userCoupons = await pb.collection('user_coupons').getFullList({
          sort: '-created',
          filter: `user_id="${user.id}"`,
          expand: 'coupon',
        });

        return userCoupons;
      } catch (error) {
        console.error('Error fetching app user coupons:', error);
        throw new GraphQLError('获取优惠券失败');
      }
    },

    // 通知列表
    appNotifications: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { page = 1, perPage = 20 } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const notifications = await pb.collection('notifications').getList(page, perPage, {
          sort: '-created',
          filter: `user_id="${user.id}" || user_id=""`,
        });

        return notifications.items;
      } catch (error) {
        console.error('Error fetching app notifications:', error);
        throw new GraphQLError('获取通知失败');
      }
    },
  },

  Mutation: {
    // 添加到购物车
    appAddToCart: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { input } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 检查是否已存在
        const existingItems = await pb.collection('cart_items').getFullList({
          filter: `user_id="${user.id}" && product_id="${input.product_id}"`,
        });

        if (existingItems.length > 0) {
          // 更新数量
          const updatedItem = await pb.collection('cart_items').update(existingItems[0].id, {
            quantity: existingItems[0].quantity + input.quantity,
          });
          
          return await pb.collection('cart_items').getOne(updatedItem.id, {
            expand: 'product',
          });
        } else {
          // 创建新项
          const newItem = await pb.collection('cart_items').create({
            user_id: user.id,
            product_id: input.product_id,
            quantity: input.quantity,
            selected: true,
          });
          
          return await pb.collection('cart_items').getOne(newItem.id, {
            expand: 'product',
          });
        }
      } catch (error) {
        console.error('Error adding to app cart:', error);
        throw new GraphQLError('添加到购物车失败');
      }
    },

    // 更新购物车项
    appUpdateCartItem: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { id, input } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const updatedItem = await pb.collection('cart_items').update(id, input);
        
        return await pb.collection('cart_items').getOne(updatedItem.id, {
          expand: 'product',
        });
      } catch (error) {
        console.error('Error updating app cart item:', error);
        throw new GraphQLError('更新购物车失败');
      }
    },

    // 从购物车移除
    appRemoveFromCart: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { id } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        await pb.collection('cart_items').delete(id);
        return true;
      } catch (error) {
        console.error('Error removing from app cart:', error);
        throw new GraphQLError('从购物车移除失败');
      }
    },

    // 清空购物车
    appClearCart: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const cartItems = await pb.collection('cart_items').getFullList({
          filter: `user_id="${user.id}"`,
        });

        for (const item of cartItems) {
          await pb.collection('cart_items').delete(item.id);
        }

        return true;
      } catch (error) {
        console.error('Error clearing app cart:', error);
        throw new GraphQLError('清空购物车失败');
      }
    },

    // 添加到收藏
    appAddToFavorites: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { product_id } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 检查是否已存在
        const existing = await pb.collection('favorites').getFullList({
          filter: `user_id="${user.id}" && product_id="${product_id}"`,
        });

        if (existing.length > 0) {
          throw new GraphQLError('已经收藏过了');
        }

        const favorite = await pb.collection('favorites').create({
          user_id: user.id,
          product_id,
        });

        return await pb.collection('favorites').getOne(favorite.id, {
          expand: 'product',
        });
      } catch (error) {
        console.error('Error adding to app favorites:', error);
        throw new GraphQLError('添加收藏失败');
      }
    },

    // 从收藏移除
    appRemoveFromFavorites: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { product_id } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const favorites = await pb.collection('favorites').getFullList({
          filter: `user_id="${user.id}" && product_id="${product_id}"`,
        });

        if (favorites.length > 0) {
          await pb.collection('favorites').delete(favorites[0].id);
        }

        return true;
      } catch (error) {
        console.error('Error removing from app favorites:', error);
        throw new GraphQLError('移除收藏失败');
      }
    },

    // 创建地址
    appCreateAddress: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { input } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 如果设置为默认地址，先取消其他默认地址
        if (input.is_default) {
          const existingAddresses = await pb.collection('addresses').getFullList({
            filter: `user_id="${user.id}" && is_default=true`,
          });

          for (const addr of existingAddresses) {
            await pb.collection('addresses').update(addr.id, {
              is_default: false,
            });
          }
        }

        const address = await pb.collection('addresses').create({
          ...input,
          user_id: user.id,
        });

        return address;
      } catch (error) {
        console.error('Error creating app address:', error);
        throw new GraphQLError('创建地址失败');
      }
    },

    // 创建移动端订单
    appCreateOrder: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { input } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        // 生成订单号
        const orderNumber = `APP${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

        // 计算总金额
        const totalAmount = input.items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

        const order = await pb.collection('orders').create({
          order_number: orderNumber,
          user_id: user.id,
          total_amount: totalAmount,
          payment_method: input.payment_method,
          order_source: 'mobile_app',
          order_type: 'normal',
          status: 'pending_payment',
          items: input.items,
          shipping_address: input.shipping_address,
          notes: input.notes,
        });

        return await pb.collection('orders').getOne(order.id, {
          expand: 'user_id',
        });
      } catch (error) {
        console.error('Error creating app order:', error);
        throw new GraphQLError('创建订单失败');
      }
    },

    // 标记通知已读
    appMarkNotificationRead: async (_parent: any, args: any, context: any) => {
      try {
        const { user } = context;
        const { id } = args;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        await pb.collection('notifications').update(id, {
          is_read: true,
        });

        return true;
      } catch (error) {
        console.error('Error marking app notification read:', error);
        throw new GraphQLError('标记通知失败');
      }
    },

    // 标记所有通知已读
    appMarkAllNotificationsRead: async (_parent: any, _args: any, context: any) => {
      try {
        const { user } = context;
        
        if (!user) {
          throw new GraphQLError('用户未登录');
        }

        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();

        const notifications = await pb.collection('notifications').getFullList({
          filter: `(user_id="${user.id}" || user_id="") && is_read=false`,
        });

        for (const notification of notifications) {
          await pb.collection('notifications').update(notification.id, {
            is_read: true,
          });
        }

        return true;
      } catch (error) {
        console.error('Error marking all app notifications read:', error);
        throw new GraphQLError('标记所有通知失败');
      }
    },
  },
}; 