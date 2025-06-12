import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { OrderSetting } from '../../types/index.ts';

export const settingResolvers = {
  Query: {
    orderSettings: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const settings = await pb.collection('order_settings').getFullList<OrderSetting>();
        console.log('✅ Successfully fetched order settings:', settings.length);
        return settings;
      } catch (error) {
        console.error('Failed to fetch order settings:', error);
        return [];
      }
    },

    orderSetting: async (_: any, { key }: { key: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const settings = await pb.collection('order_settings').getFullList<OrderSetting>({
          filter: `setting_key="${key}"`
        });
        return settings.length > 0 ? settings[0] : null;
      } catch (error) {
        console.error('Failed to fetch order setting:', error);
        return null;
      }
    },
  },

  Mutation: {
    updateOrderSetting: async (_: any, { id, value }: { id: string; value: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('order_settings').update<OrderSetting>(id, {
          setting_value: value
        });
      } catch (error) {
        console.error('Failed to update order setting:', error);
        throw new Error('Failed to update order setting');
      }
    },
  }
}; 