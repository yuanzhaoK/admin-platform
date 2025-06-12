import PocketBase from 'pocketbase';

// PocketBase client configuration
const POCKETBASE_URL = Deno.env.get('POCKETBASE_URL') || 'http://127.0.0.1:8090';
const ADMIN_EMAIL = Deno.env.get('POCKETBASE_ADMIN_EMAIL') || 'ahukpyu@outlook.com';
const ADMIN_PASSWORD = Deno.env.get('POCKETBASE_ADMIN_PASSWORD') || 'kpyu1512..@';

export class PocketBaseClient {
  private pb: PocketBase;
  private isAuthenticated = false;

  constructor() {
    this.pb = new PocketBase(POCKETBASE_URL);
  }

  async authenticate(): Promise<void> {
    if (this.isAuthenticated) return;

    try {
      await this.pb.collection('_superusers').authWithPassword(ADMIN_EMAIL, ADMIN_PASSWORD);
      this.isAuthenticated = true;
      console.log('✅ PocketBase authenticated successfully as superuser');
    } catch (error) {
      console.error('❌ PocketBase authentication failed:', error);
      throw new Error('Failed to authenticate with PocketBase');
    }
  }

  async ensureAuth(): Promise<void> {
    if (!this.pb.authStore.isValid) {
      await this.authenticate();
    }
  }

  getClient(): PocketBase {
    return this.pb;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.pb.health.check();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const pocketbaseClient = new PocketBaseClient(); 