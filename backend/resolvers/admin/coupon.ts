import { pocketbaseClient } from '../../config/pocketbase.ts';
import { BatchOperationResult, PaginationInfo } from '../../types/base.ts';
import {
  Coupon,
  CouponInput,
  CouponQueryInput,
  CouponStats,
  CouponUpdateInput,
  CouponUsage,
  CouponUsageQueryInput
} from '../../types/coupon.ts';

export const couponResolvers = {
  Query: {
    coupons: async (
      parent: any,
      { input }: { input?: CouponQueryInput }
    ): Promise<{ items: Coupon[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, sortBy = 'start_time', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`(name ~ "${search}" || code ~ "${search}")`);
        }

        if (type) {
          filterParams.push(`type = "${type}"`);
        }

        if (status) {
          filterParams.push(`status = "${status}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('coupons').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        });
        // 映射PocketBase数据到GraphQL格式
        const mappedItems = result.items.map((item: any) => ({
          ...item,
          used_quantity: item.used_count || 0
        }));
        return {
          items: mappedItems as unknown as Coupon[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching coupons:', error);
        throw new Error('Failed to fetch coupons');
      }
    },

    coupon: async (
      parent: any,
      { id }: { id: string }
    ): Promise<Coupon | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('coupons').getOne(id);
        return result as unknown as Coupon;
      } catch (error) {
        console.error('Error fetching coupon:', error);
        return null;
      }
    },

    couponStats: async (): Promise<CouponStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const totalCoupons = await pb.collection('coupons').getList(1, 1, { filter: '' });
        const activeCoupons = await pb.collection('coupons').getList(1, 1, { filter: 'status = "active"' });
        const expiredCoupons = await pb.collection('coupons').getList(1, 1, { filter: 'status = "expired"' });
        const usedUpCoupons = await pb.collection('coupons').getList(1, 1, { filter: 'status = "used_up"' });
        const usedCoupons = await pb.collection('coupon_usage').getList(1, 1000);

        // 获取类型分布
        const allCoupons = await pb.collection('coupons').getList(1, 1000, { fields: 'type' });
        const typeDistribution: Record<string, number> = {};
        allCoupons.items.forEach((coupon: any) => {
          typeDistribution[coupon.type] = (typeDistribution[coupon.type] || 0) + 1;
        });

        // 获取本月使用量
        const currentMonth = new Date().toISOString().slice(0, 7);
        const usageThisMonth = await pb.collection('coupon_usage').getList(1, 1, {
          filter: `used_time >= "${currentMonth}-01"`
        });

        return {
          total: totalCoupons.totalItems,
          active: activeCoupons.totalItems,
          expired: expiredCoupons.totalItems,
          used_up: usedUpCoupons.totalItems,
          totalUsage: usedCoupons.totalItems,
          totalDiscount: usedCoupons.items.reduce((sum: number, usage: any) => sum + (usage.discount_amount || 0), 0),
          typeDistribution,
          usageThisMonth: usageThisMonth.totalItems
        };
      } catch (error) {
        console.error('Error fetching coupon stats:', error);
        throw new Error('Failed to fetch coupon stats');
      }
    },

    couponUsages: async (
      parent: any,
      { input }: { input?: CouponUsageQueryInput }
    ): Promise<{ items: CouponUsage[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, coupon_id, user_id, order_id, used_date_start, used_date_end, sortBy = 'used_time', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (coupon_id) {
          filterParams.push(`coupon_id = "${coupon_id}"`);
        }

        if (user_id) {
          filterParams.push(`user_id = "${user_id}"`);
        }

        if (order_id) {
          filterParams.push(`order_id = "${order_id}"`);
        }

        if (used_date_start) {
          filterParams.push(`used_time >= "${used_date_start}"`);
        }

        if (used_date_end) {
          filterParams.push(`used_time <= "${used_date_end}"`);
        }

        if (filterParams.length > 0) {
          filter = filterParams.join(' && ');
        }

        const result = await pb.collection('coupon_usage').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy,
          expand: 'coupon_id'
        });

        return {
          items: result.items.map((item: any) => ({
            ...item,
            coupon: item.expand?.coupon_id || null
          })) as unknown as CouponUsage[],
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching coupon usages:', error);
        throw new Error('Failed to fetch coupon usages');
      }
    },

    validateCouponCode: async (
      parent: any,
      { code }: { code: string }
    ): Promise<Coupon | null> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('coupons').getFirstListItem(`code = "${code}"`);
        
        // 检查优惠券是否有效
        const coupon = result as unknown as Coupon;
        const now = new Date();
        const startTime = new Date(coupon.start_time);
        const endTime = new Date(coupon.end_time);
        
        if (coupon.status !== 'active') {
          throw new Error('优惠券状态无效');
        }
        
        if (now < startTime) {
          throw new Error('优惠券尚未生效');
        }
        
        if (now > endTime) {
          throw new Error('优惠券已过期');
        }
        
        if (coupon.total_quantity && coupon.used_quantity >= coupon.total_quantity) {
          throw new Error('优惠券已用完');
        }
        
        return coupon;
      } catch (error) {
        console.error('Error validating coupon code:', error);
        if (error instanceof Error) {
          throw error;
        }
        return null;
      }
    }
  },

  Mutation: {
    createCoupon: async (
      parent: any,
      { input }: { input: CouponInput }
    ): Promise<Coupon> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 映射字段以匹配PocketBase schema
        const couponData: any = {
          used_count: 0, // PocketBase中是used_count
          ...input,
        };
        
        
        if (input.discount_value !== undefined) {
          couponData.value = input.discount_value;
          delete couponData.discount_value;
        }
        
        if (input.total_quantity !== undefined) {
          couponData.usage_limit = input.total_quantity;
          delete couponData.total_quantity;
        }
        
        // 删除PocketBase schema中不存在的字段
        delete couponData.per_user_limit;
        delete couponData.used_quantity;
        
        const result = await pb.collection('coupons').create(couponData);
        
        // 映射返回数据
        const mappedResult = {
          ...result,
          discount_type: result.type === 'fixed' ? 'fixed_amount' : 
                        result.type === 'percent' ? 'percentage' : 
                        result.type,
          discount_value: result.value,
          total_quantity: result.usage_limit,
          used_quantity: result.used_count || 0
        };
        
        return mappedResult as unknown as Coupon;
      } catch (error) {
        console.error('Error creating coupon:', error);
        throw new Error('Failed to create coupon');
      }
    },

    updateCoupon: async (
      parent: any,
      { id, input }: { id: string; input: CouponUpdateInput }
    ): Promise<Coupon> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 映射字段以匹配PocketBase schema
        const updateData: any = { ...input };
        const result = await pb.collection('coupons').update(id, updateData);
        return result as unknown as Coupon;
      } catch (error) {
        console.error('Error updating coupon:', error);
        throw new Error('Failed to update coupon');
      }
    },

    deleteCoupon: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('coupons').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting coupon:', error);
        return false;
      }
    },

    batchDeleteCoupons: async (
      parent: any,
      { ids }: { ids: string[] }
    ): Promise<BatchOperationResult> => {
      let successCount = 0;
      let failureCount = 0;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        for (const id of ids) {
          try {
            await pb.collection('coupons').delete(id);
            successCount++;
          } catch (error) {
            console.error(`Error deleting coupon ${id}:`, error);
            failureCount++;
          }
        }
        
        return {
          success: failureCount === 0,
          message: `成功删除 ${successCount} 个优惠券${failureCount > 0 ? `，失败 ${failureCount} 个` : ''}`,
          successCount,
          failureCount
        };
      } catch (error) {
        console.error('Error in batch delete coupons:', error);
        throw new Error('批量删除优惠券失败');
      }
    },

    generateCouponCodes: async (
      parent: any,
      { template, count }: { template: string; count: number }
    ): Promise<string[]> => {
      const codes: string[] = [];
      
      for (let i = 0; i < count; i++) {
        // 简单的代码生成逻辑，可以根据模板生成不同格式的代码
        let code = template;
        
        // 替换占位符
        code = code.replace(/\{RANDOM\}/g, Math.random().toString(36).substring(2, 8).toUpperCase());
        code = code.replace(/\{NUMBER\}/g, (Math.floor(Math.random() * 9000) + 1000).toString());
        code = code.replace(/\{DATE\}/g, new Date().toISOString().slice(5, 10).replace('-', ''));
        code = code.replace(/\{INDEX\}/g, (i + 1).toString().padStart(3, '0'));
        
        // 如果没有占位符，就添加随机后缀
        if (!template.includes('{')) {
          code = `${template}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
        }
        
        codes.push(code);
      }
      
      return codes;
    },

    batchCreateCoupons: async (
      parent: any,
      { input, codes }: { input: CouponInput; codes: string[] }
    ): Promise<BatchOperationResult> => {
      let successCount = 0;
      let failureCount = 0;
      
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        for (const code of codes) {
          try {
            const couponData: any = { 
              used_count: 0,
              ...input, 
              code 
            };
            
            // 映射GraphQL字段到PocketBase字段
            if (input.discount_type) {
              couponData.type = input.discount_type === 'fixed_amount' ? 'fixed' : 
                               input.discount_type === 'percentage' ? 'percent' : 
                               input.discount_type;
              delete couponData.discount_type;
            }
            
            if (input.discount_value !== undefined) {
              couponData.value = input.discount_value;
              delete couponData.discount_value;
            }
            
            if (input.total_quantity !== undefined) {
              couponData.usage_limit = input.total_quantity;
              delete couponData.total_quantity;
            }
            
            // 删除PocketBase schema中不存在的字段
            delete couponData.per_user_limit;
            delete couponData.used_quantity;
            
            await pb.collection('coupons').create(couponData);
            successCount++;
          } catch (error) {
            console.error(`Error creating coupon with code ${code}:`, error);
            failureCount++;
          }
        }
        
        return {
          success: failureCount === 0,
          message: `成功创建 ${successCount} 个优惠券${failureCount > 0 ? `，失败 ${failureCount} 个` : ''}`,
          successCount,
          failureCount
        };
      } catch (error) {
        console.error('Error in batch create coupons:', error);
        throw new Error('批量创建优惠券失败');
      }
    }
  }
}; 