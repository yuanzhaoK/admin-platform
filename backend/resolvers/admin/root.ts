import { pocketbaseClient } from '../../config/pocketbase.ts';

export const rootResolvers = {
  Query: {
    health: async (): Promise<string> => {
      try {
        await pocketbaseClient.ensureAuth();
        const isHealthy = await pocketbaseClient.healthCheck();
        return isHealthy ? 'OK' : 'ERROR';
      } catch (error) {
        console.error('Health check failed:', error);
        return 'ERROR';
      }
    },
  },
}; 