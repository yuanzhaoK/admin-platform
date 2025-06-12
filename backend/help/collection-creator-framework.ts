// PocketBase 集合创建标准化框架
// 用户可以通过配置文件轻松创建任何想要的集合

interface FieldConfig {
  name: string;
  type: 'text' | 'number' | 'bool' | 'email' | 'url' | 'date' | 'select' | 'relation' | 'file' | 'json';
  required?: boolean;
  unique?: boolean;
  options?: {
    // text 字段选项
    max?: number;
    min?: number;
    pattern?: string;
    
    // number 字段选项
    onlyInt?: boolean;
    
    // select 字段选项
    maxSelect?: number;
    values?: string[];
    
    // relation 字段选项
    collectionId?: string;
    collectionName?: string; // 如果提供名称，会自动查找ID
    cascadeDelete?: boolean;
    displayFields?: string[];
    
    // file 字段选项
    fileMaxSize?: number;
    mimeTypes?: string[];
    thumbs?: string[];
    
    // json 字段选项
    jsonMaxSize?: number;
  };
}

interface CollectionConfig {
  name: string;
  type?: 'base' | 'auth';
  listRule?: string;
  viewRule?: string;
  createRule?: string;
  updateRule?: string;
  deleteRule?: string;
  fields: FieldConfig[];
}

interface TestDataConfig {
  count: number;
  generator: (index: number) => Record<string, any>;
}

interface CollectionBlueprint {
  collection: CollectionConfig;
  testData?: TestDataConfig;
}

class PocketBaseCollectionCreator {
  private baseUrl: string;
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:8091') {
    this.baseUrl = baseUrl;
  }

  async adminLogin(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/_superusers/auth-with-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identity: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        this.authToken = data.token;
        return true;
      }
      return false;
    } catch (error) {
      console.error('登录失败:', error);
      return false;
    }
  }

  private generateFieldId(type: string): string {
    const randomNum = Math.floor(Math.random() * 9999999999);
    return `${type}${randomNum}`;
  }

  private async getCollectionId(collectionName: string): Promise<string | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/${collectionName}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });

      if (response.ok) {
        const collection = await response.json();
        return collection.id;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  private async buildField(fieldConfig: FieldConfig): Promise<any> {
    const baseField = {
      id: this.generateFieldId(fieldConfig.type),
      name: fieldConfig.name,
      type: fieldConfig.type,
      required: fieldConfig.required || false,
      hidden: false,
      presentable: false,
      system: false,
    };

    // 处理不同类型的字段
    switch (fieldConfig.type) {
      case 'text':
      case 'email':
      case 'url':
        return {
          ...baseField,
          unique: fieldConfig.unique || false,
          autogeneratePattern: '',
          max: fieldConfig.options?.max || 0,
          min: fieldConfig.options?.min || 0,
          pattern: fieldConfig.options?.pattern || '',
          primaryKey: false,
        };

      case 'number':
        return {
          ...baseField,
          max: fieldConfig.options?.max || null,
          min: fieldConfig.options?.min || null,
          onlyInt: fieldConfig.options?.onlyInt || false,
        };

      case 'bool':
        return baseField;

      case 'date':
        return {
          ...baseField,
          max: '',
          min: '',
        };

      case 'select':
        return {
          ...baseField,
          maxSelect: fieldConfig.options?.maxSelect || 1,
          values: fieldConfig.options?.values || [],
        };

      case 'relation':
        let collectionId = fieldConfig.options?.collectionId;
        if (!collectionId && fieldConfig.options?.collectionName) {
          collectionId = await this.getCollectionId(fieldConfig.options.collectionName);
        }
        return {
          ...baseField,
          cascadeDelete: fieldConfig.options?.cascadeDelete || false,
          collectionId: collectionId || '',
          maxSelect: 1,
          minSelect: 0,
        };

      case 'file':
        return {
          ...baseField,
          maxSelect: 1,
          maxSize: fieldConfig.options?.fileMaxSize || 5242880,
          mimeTypes: fieldConfig.options?.mimeTypes || [],
          protected: false,
          thumbs: fieldConfig.options?.thumbs || null,
        };

      case 'json':
        return {
          ...baseField,
          maxSize: fieldConfig.options?.jsonMaxSize || 0,
        };

      default:
        return baseField;
    }
  }

  async deleteCollection(name: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/collections/${name}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
        },
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  async createCollection(config: CollectionConfig): Promise<boolean> {
    console.log(`📝 创建集合: ${config.name}`);

    // 构建字段
    const fields = [];
    for (const fieldConfig of config.fields) {
      const field = await this.buildField(fieldConfig);
      fields.push(field);
    }

    const collectionData = {
      name: config.name,
      type: config.type || 'base',
      listRule: config.listRule || '',
      viewRule: config.viewRule || '',
      createRule: config.createRule || '',
      updateRule: config.updateRule || '',
      deleteRule: config.deleteRule || '',
      fields: fields,
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/collections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.authToken}`,
        },
        body: JSON.stringify(collectionData),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ 集合 ${config.name} 创建成功！`);
        console.log(`📋 字段数量: ${result.fields?.length || 0}`);
        
        if (result.fields && result.fields.length > 1) {
          console.log('📝 字段列表:');
          result.fields.forEach((field: any, index: number) => {
            if (field.name !== 'id') {
              console.log(`  ${index}. ${field.name} (${field.type}) ${field.required ? '[必填]' : '[可选]'}`);
            }
          });
        }
        return true;
      } else {
        const errorData = await response.json();
        console.error(`❌ 集合 ${config.name} 创建失败:`, errorData);
        return false;
      }
    } catch (error) {
      console.error(`❌ 创建集合 ${config.name} 时发生错误:`, error);
      return false;
    }
  }

  async createTestData(collectionName: string, testDataConfig: TestDataConfig): Promise<void> {
    console.log(`🧪 为集合 ${collectionName} 创建测试数据...`);

    for (let i = 0; i < testDataConfig.count; i++) {
      const data = testDataConfig.generator(i);
      
      try {
        const response = await fetch(`${this.baseUrl}/api/collections/${collectionName}/records`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          const result = await response.json();
          console.log(`✅ 测试数据 ${i + 1} 创建成功！`);
        } else {
          const errorData = await response.json();
          console.error(`❌ 测试数据 ${i + 1} 创建失败:`, errorData);
        }
      } catch (error) {
        console.error(`❌ 创建测试数据 ${i + 1} 时发生错误:`, error);
      }
    }
  }

  async verifyCollection(collectionName: string): Promise<void> {
    try {
      const [collectionResponse, recordsResponse] = await Promise.all([
        fetch(`${this.baseUrl}/api/collections/${collectionName}`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
        }),
        fetch(`${this.baseUrl}/api/collections/${collectionName}/records`, {
          headers: { 'Authorization': `Bearer ${this.authToken}` },
        }),
      ]);

      if (collectionResponse.ok && recordsResponse.ok) {
        const [collection, records] = await Promise.all([
          collectionResponse.json(),
          recordsResponse.json(),
        ]);

        console.log(`🔍 验证集合 ${collectionName}:`);
        console.log(`  集合ID: ${collection.id}`);
        console.log(`  字段数量: ${collection.fields?.length || 0}`);
        console.log(`  记录数量: ${records.totalItems}`);
        
        if (records.items.length > 0) {
          console.log(`📝 示例记录:`, records.items[0]);
        }
      }
    } catch (error) {
      console.error(`❌ 验证集合 ${collectionName} 失败:`, error);
    }
  }

  async createFromBlueprint(blueprint: CollectionBlueprint): Promise<boolean> {
    console.log(`🚀 开始创建集合: ${blueprint.collection.name}`);
    console.log('');

    // 1. 删除现有集合
    console.log('🗑️ 删除现有集合...');
    await this.deleteCollection(blueprint.collection.name);
    console.log('✅ 删除完成');
    console.log('');

    // 2. 创建新集合
    console.log('📦 创建新集合...');
    const createSuccess = await this.createCollection(blueprint.collection);
    
    if (!createSuccess) {
      console.log('❌ 集合创建失败');
      return false;
    }
    console.log('');

    // 3. 创建测试数据
    if (blueprint.testData) {
      console.log('🧪 创建测试数据...');
      await this.createTestData(blueprint.collection.name, blueprint.testData);
      console.log('');
    }

    // 4. 验证集合
    console.log('🔍 验证集合...');
    await this.verifyCollection(blueprint.collection.name);

    console.log('');
    console.log(`🎉 集合 ${blueprint.collection.name} 创建完成！`);
    return true;
  }

  async createMultipleCollections(blueprints: CollectionBlueprint[]): Promise<void> {
    console.log(`🚀 批量创建 ${blueprints.length} 个集合...`);
    console.log('');

    for (let i = 0; i < blueprints.length; i++) {
      const blueprint = blueprints[i];
      console.log(`📦 [${i + 1}/${blueprints.length}] 处理集合: ${blueprint.collection.name}`);
      
      const success = await this.createFromBlueprint(blueprint);
      
      if (!success) {
        console.log(`❌ 集合 ${blueprint.collection.name} 创建失败，停止后续操作`);
        return;
      }
      
      console.log('');
    }

    console.log('🎉 所有集合创建完成！');
  }
}

// 导出框架
export {
  PocketBaseCollectionCreator,
  type FieldConfig,
  type CollectionConfig,
  type TestDataConfig,
  type CollectionBlueprint,
}; 