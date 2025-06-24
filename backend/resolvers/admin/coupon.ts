import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';
import {
    Coupon,
    CouponInput,
    CouponQueryInput,
    CouponStats,
    CouponUpdateInput
} from '../../types/coupon.ts';

export const couponResolvers = {
  Query: {
    coupons: async (
      parent: any,
      { input }: { input?: CouponQueryInput }
    ): Promise<{ items: Coupon[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, sortBy = 'created', sortOrder = 'desc' } = input || {};

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

        return {
          items: result.items as unknown as Coupon[],
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
        
        const result = await pb.collection('coupons').create(input);
        return result as unknown as Coupon;
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
        
        const result = await pb.collection('coupons').update(id, input);
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
    }
  }
}; 