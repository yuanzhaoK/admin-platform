import { pocketbaseClient } from '../../config/pocketbase.ts';
import { PaginationInfo } from '../../types/base.ts';

export const advertisementResolvers = {
  Query: {
    advertisements: async (
      parent: any,
      { input }: { input?: any }
    ): Promise<{ items: any[]; pagination: PaginationInfo }> => {
      const { page = 1, perPage = 20, search, type, status, sortBy = 'created', sortOrder = 'desc' } = input || {};

      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let filter = '';
        const filterParams: string[] = [];

        if (search) {
          filterParams.push(`title ~ "${search}"`);
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

        const result = await pb.collection('advertisements').getList(page, perPage, {
          filter,
          sort: sortOrder === 'desc' ? `-${sortBy}` : sortBy
        });

        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalItems: result.totalItems,
            totalPages: result.totalPages
          }
        };
      } catch (error) {
        console.error('Error fetching advertisements:', error);
        throw new Error('Failed to fetch advertisements');
      }
    },

    advertisement: async (
      parent: any,
      { id }: { id: string }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').getOne(id);
        return result;
      } catch (error) {
        console.error('Error fetching advertisement:', error);
        return null;
      }
    }
  },

  Mutation: {
    createAdvertisement: async (
      parent: any,
      { input }: { input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').create(input);
        return result;
      } catch (error) {
        console.error('Error creating advertisement:', error);
        throw new Error('Failed to create advertisement');
      }
    },

    updateAdvertisement: async (
      parent: any,
      { id, input }: { id: string; input: any }
    ) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const result = await pb.collection('advertisements').update(id, input);
        return result;
      } catch (error) {
        console.error('Error updating advertisement:', error);
        throw new Error('Failed to update advertisement');
      }
    },

    deleteAdvertisement: async (
      parent: any,
      { id }: { id: string }
    ): Promise<boolean> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        await pb.collection('advertisements').delete(id);
        return true;
      } catch (error) {
        console.error('Error deleting advertisement:', error);
        return false;
      }
    }
  }
}; 