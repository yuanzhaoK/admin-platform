import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { RefundRequest, RefundQuery } from '../../types/index.ts';

export const refundResolvers = {
  Query: {
    refunds: async (_: any, { query }: { query?: RefundQuery }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        const filters: string[] = [];
        if (query?.status) filters.push(`status="${query.status}"`);
        if (query?.refund_type) filters.push(`refund_type="${query.refund_type}"`);
        if (query?.reason) filters.push(`reason="${query.reason}"`);
        if (query?.user_id) filters.push(`user_id="${query.user_id}"`);
        if (query?.order_id) filters.push(`order_id="${query.order_id}"`);
        if (query?.search) {
          filters.push(`(service_number~"${query.search}" || description~"${query.search}")`);
        }
        
        const options: any = {
          expand: 'order_id,user_id,processed_by'
        };
        
        if (filters.length > 0) {
          options.filter = filters.join(' && ');
        }
        
        if (query?.sortBy) {
          const sortOrder = query.sortOrder === 'asc' ? '' : '-';
          options.sort = `${sortOrder}${query.sortBy}`;
        } else {
          options.sort = '-created';
        }
        
        const result = await pb.collection('refund_requests').getList<RefundRequest>(page, perPage, options);
        
        return {
          items: result.items,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            totalPages: result.totalPages,
            totalItems: result.totalItems
          }
        };
      } catch (error) {
        console.error('Failed to fetch refunds:', error);
        throw new Error('Failed to fetch refunds');
      }
    },

    refund: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        return await pb.collection('refund_requests').getOne<RefundRequest>(id, {
          expand: 'order_id,user_id,processed_by'
        });
      } catch (error) {
        console.error('Failed to fetch refund:', error);
        return null;
      }
    },
  },

  Mutation: {
    processRefund: async (_: any, { id, status, adminNotes, processedBy }: { 
      id: string; 
      status: string; 
      adminNotes?: string; 
      processedBy?: string 
    }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const updateData: any = { status };
        if (adminNotes) updateData.admin_notes = adminNotes;
        if (processedBy) updateData.processed_by = processedBy;
        updateData.processed_at = new Date().toISOString();
        
        return await pb.collection('refund_requests').update<RefundRequest>(id, updateData);
      } catch (error) {
        console.error('Failed to process refund:', error);
        throw new Error('Failed to process refund');
      }
    },
  }
}; 