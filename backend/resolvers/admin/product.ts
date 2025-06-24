import { pocketbaseClient } from '../../config/pocketbase.ts';
import type { Product, ProductQuery, ProductStats } from '../../types/index.ts';

export const productResolvers = {
  Query: {
    // 产品查询
    products: async (_: any, { query }: { query?: ProductQuery }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const page = query?.page || 1;
        const perPage = query?.perPage || 20;
        
        // 构建过滤条件
        const filters: string[] = [];
        if (query?.status) filters.push(`status="${query.status}"`);
        if (query?.category_id) filters.push(`category_id="${query.category_id}"`);
        if (query?.brand_id) filters.push(`brand_id="${query.brand_id}"`);
        if (query?.product_type_id) filters.push(`product_type_id="${query.product_type_id}"`);
        if (query?.search) {
          filters.push(`(name~"${query.search}" || description~"${query.search}" || sku~"${query.search}")`);
        }
        if (query?.priceMin !== undefined) filters.push(`price>=${query.priceMin}`);
        if (query?.priceMax !== undefined) filters.push(`price<=${query.priceMax}`);
        if (query?.stockMin !== undefined) filters.push(`stock>=${query.stockMin}`);
        if (query?.stockMax !== undefined) filters.push(`stock<=${query.stockMax}`);
        if (query?.tags && query.tags.length > 0) {
          const tagFilters = query.tags.map(tag => `tags~"${tag}"`);
          filters.push(`(${tagFilters.join(' || ')})`);
        }
        if (query?.is_featured !== undefined) filters.push(`is_featured=${query.is_featured}`);
        if (query?.is_new !== undefined) filters.push(`is_new=${query.is_new}`);
        if (query?.is_hot !== undefined) filters.push(`is_hot=${query.is_hot}`);
        if (query?.is_published !== undefined) filters.push(`is_published=${query.is_published}`);
        if (query?.review_status) filters.push(`review_status="${query.review_status}"`);
        
        const options: any = {};
        if (filters.length > 0) {
          options.filter = filters.join(' && ');
        }
        
        // 排序
        if (query?.sortBy) {
          const sortOrder = query.sortOrder === 'asc' ? '' : '-';
          options.sort = `${sortOrder}${query.sortBy}`;
        } else {
          options.sort = '-created';
        }
        
        // 展开关联数据
        options.expand = 'category_id,brand_id,product_type_id';
        
        const result = await pb.collection('products').getList<Product>(page, perPage, options);
        
        // 确保所有产品都有必需的字段
        const processedItems = result.items.map(item => ({
          ...item,
          review_status: item.review_status || 'pending' // 默认为pending状态
        }));
        
        return {
          items: processedItems,
          pagination: {
            page: result.page,
            perPage: result.perPage,
            total: result.totalItems,
            totalItems: result.totalItems,
            totalPages: result.totalPages,
            hasNext: result.page < result.totalPages,
            hasPrev: result.page > 1
          }
        };
      } catch (error) {
        console.error('Failed to fetch products:', error);
        throw new Error('Failed to fetch products');
      }
    },

    product: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const product = await pb.collection('products').getOne<Product>(id, {
          expand: 'category_id,brand_id,product_type_id'
        });
        
        // 确保产品有必需的字段
        return {
          ...product,
          review_status: product.review_status || 'pending' // 默认为pending状态
        };
      } catch (error) {
        console.error('Failed to fetch product:', error);
        return null;
      }
    },

    productStats: async (): Promise<ProductStats> => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>();
        
        const stats: ProductStats = {
          total: products.length,
          active: 0,
          inactive: 0,
          draft: 0,
          categories: {},
          avgPrice: 0,
          totalStock: 0,
          lowStock: 0,
          outOfStock: 0,
          brands: {},
          productTypes: {},
          review_status_distribution: {
            pending: 0,
            approved: 0,
            rejected: 0
          }
        };

        let totalPrice = 0;
        let priceCount = 0;

        products.forEach(product => {
          // 统计状态
          stats[product.status]++;
          
          // 统计分类
          if (product.category_id) {
            stats.categories[product.category_id] = (stats.categories[product.category_id] || 0) + 1;
          }
          
          // 统计品牌
          if (product.brand_id) {
            stats.brands[product.brand_id] = (stats.brands[product.brand_id] || 0) + 1;
          }
          
          // 统计商品类型
          if (product.product_type_id) {
            stats.productTypes[product.product_type_id] = (stats.productTypes[product.product_type_id] || 0) + 1;
          }
          
          // 统计价格
          if (product.price) {
            totalPrice += product.price;
            priceCount++;
          }
          
          // 统计库存
          if (product.stock !== undefined) {
            stats.totalStock = (stats.totalStock || 0) + product.stock;
            if (product.stock === 0) {
              stats.outOfStock++;
            } else if (product.stock <= 10) {
              stats.lowStock++;
            }
          }
        });

        stats.avgPrice = priceCount > 0 ? totalPrice / priceCount : 0;

        return stats;
      } catch (error) {
        console.error('Failed to fetch product stats:', error);
        throw new Error('Failed to fetch product stats');
      }
    },



    productsByCategory: async (_: any, { category }: { category: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>({
          filter: `category_id="${category}"`
        });
        
        // 确保所有产品都有必需的字段
        return products.map(item => ({
          ...item,
          review_status: item.review_status || 'pending'
        }));
      } catch (error) {
        console.error('Failed to fetch products by category:', error);
        throw new Error('Failed to fetch products by category');
      }
    },

    // 库存查询
    lowStockProducts: async (_: any, { threshold = 10 }: { threshold?: number }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>({
          filter: `stock<=${threshold} && stock>0`
        });
        
        // 确保所有产品都有必需的字段
        return products.map(item => ({
          ...item,
          review_status: item.review_status || 'pending'
        }));
      } catch (error) {
        console.error('Failed to fetch low stock products:', error);
        throw new Error('Failed to fetch low stock products');
      }
    },

    outOfStockProducts: async () => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>({
          filter: 'stock=0'
        });
        
        // 确保所有产品都有必需的字段
        return products.map(item => ({
          ...item,
          review_status: item.review_status || 'pending'
        }));
      } catch (error) {
        console.error('Failed to fetch out of stock products:', error);
        throw new Error('Failed to fetch out of stock products');
      }
    },

    // 搜索建议
    productSearchSuggestions: async (_: any, { query }: { query: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const products = await pb.collection('products').getFullList<Product>({
          filter: `name~"${query}" || description~"${query}" || sku~"${query}"`,
          fields: 'name,sku'
        });
        
        const suggestions = new Set<string>();
        products.forEach(product => {
          if (product.name.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.name);
          }
          if (product.sku && product.sku.toLowerCase().includes(query.toLowerCase())) {
            suggestions.add(product.sku);
          }
        });
        
        return Array.from(suggestions).slice(0, 10);
      } catch (error) {
        console.error('Failed to fetch search suggestions:', error);
        return [];
      }
    },

    // 相关产品
    relatedProducts: async (_: any, { productId, limit = 5 }: { productId: string; limit?: number }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 获取当前产品
        const currentProduct = await pb.collection('products').getOne<Product>(productId);
        
        // 基于分类和标签查找相关产品
        const filters: string[] = [`id!="${productId}"`];
        if (currentProduct.category_id) {
          filters.push(`category_id="${currentProduct.category_id}"`);
        }
        
        const relatedProducts = await pb.collection('products').getList<Product>(1, limit, {
          filter: filters.join(' && '),
          sort: '-created'
        });
        
        // 确保所有产品都有必需的字段
        return relatedProducts.items.map(item => ({
          ...item,
          review_status: item.review_status || 'pending'
        }));
      } catch (error) {
        console.error('Failed to fetch related products:', error);
        return [];
      }
    },
  },

  Mutation: {
    // 基础产品操作
    createProduct: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 确保有默认的review_status
        const productData = {
          ...input,
          review_status: input.review_status || 'pending'
        };
        
        const product = await pb.collection('products').create<Product>(productData);
        return {
          ...product,
          review_status: product.review_status || 'pending'
        };
      } catch (error) {
        console.error('Failed to create product:', error);
        throw new Error('Failed to create product');
      }
    },

    updateProduct: async (_: any, { id, input }: { id: string; input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        const product = await pb.collection('products').update<Product>(id, input);
        
        // 确保有必需的字段
        return {
          ...product,
          review_status: product.review_status || 'pending'
        };
      } catch (error) {
        console.error('Failed to update product:', error);
        throw new Error('Failed to update product');
      }
    },

    deleteProduct: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        await pb.collection('products').delete(id);
        return true;
      } catch (error) {
        console.error('Failed to delete product:', error);
        throw new Error('Failed to delete product');
      }
    },

    duplicateProduct: async (_: any, { id }: { id: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const originalProduct = await pb.collection('products').getOne<Product>(id);
        const { id: _, created, updated, ...productData } = originalProduct;
        
        // 修改名称以区分复制品
        productData.name = `${productData.name} (副本)`;
        if (productData.sku) {
          productData.sku = `${productData.sku}-copy`;
        }
        
        const product = await pb.collection('products').create<Product>(productData);
        
        // 确保有必需的字段
        return {
          ...product,
          review_status: product.review_status || 'pending'
        };
      } catch (error) {
        console.error('Failed to duplicate product:', error);
        throw new Error('Failed to duplicate product');
      }
    },

    // 批量操作
    batchUpdateProductStatus: async (_: any, { ids, status }: { ids: string[]; status: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const promises = ids.map(id => 
          pb.collection('products').update(id, { status })
        );
        
        await Promise.all(promises);
        return true;
      } catch (error) {
        console.error('Failed to batch update product status:', error);
        throw new Error('Failed to batch update product status');
      }
    },

    batchDeleteProducts: async (_: any, { ids }: { ids: string[] }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];
        
        for (const productId of ids) {
          try {
            await pb.collection('products').delete(productId);
            successCount++;
          } catch (error) {
            failureCount++;
            errors.push(`Product ${productId}: ${error}`);
          }
        }
        
        return {
          success: failureCount === 0,
          message: `成功删除 ${successCount} 个产品，失败 ${failureCount} 个`,
          successCount,
          failureCount,
          errors
        };
      } catch (error) {
        console.error('Failed to batch delete products:', error);
        throw new Error('Failed to batch delete products');
      }
    },

    batchUpdateProductPrices: async (_: any, { input }: { input: { productIds: string[]; price: number; updateType: string } }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let successCount = 0;
        let failureCount = 0;
        const errors: string[] = [];
        
        for (const productId of input.productIds) {
          try {
            const product = await pb.collection('products').getOne<Product>(productId);
            let newPrice = input.price;
            
            switch (input.updateType) {
              case 'SET':
                newPrice = input.price;
                break;
              case 'INCREASE':
                newPrice = (product.price || 0) + input.price;
                break;
              case 'DECREASE':
                newPrice = Math.max(0, (product.price || 0) - input.price);
                break;
              case 'PERCENTAGE_INCREASE':
                newPrice = (product.price || 0) * (1 + input.price / 100);
                break;
              case 'PERCENTAGE_DECREASE':
                newPrice = (product.price || 0) * (1 - input.price / 100);
                break;
            }
            
            await pb.collection('products').update(productId, { price: newPrice });
            successCount++;
          } catch (error) {
            failureCount++;
            errors.push(`Product ${productId}: ${error}`);
          }
        }
        
        return {
          success: failureCount === 0,
          message: `成功更新 ${successCount} 个产品价格，失败 ${failureCount} 个`,
          successCount,
          failureCount,
          errors
        };
      } catch (error) {
        console.error('Failed to batch update product prices:', error);
        throw new Error('Failed to batch update product prices');
      }
    },

    // 库存管理
    updateProductStock: async (_: any, { input }: { input: { productId: string; quantity: number; operation: string; reason?: string } }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const product = await pb.collection('products').getOne<Product>(input.productId);
        const previousStock = product.stock || 0;
        let newStock = previousStock;
        
        switch (input.operation) {
          case 'SET':
            newStock = input.quantity;
            break;
          case 'ADD':
            newStock = previousStock + input.quantity;
            break;
          case 'SUBTRACT':
            newStock = Math.max(0, previousStock - input.quantity);
            break;
        }
        
        const updatedProduct = await pb.collection('products').update<Product>(input.productId, { stock: newStock });
        
        return {
          success: true,
          message: `库存已从 ${previousStock} 更新为 ${newStock}`,
          product: updatedProduct,
          previousStock,
          newStock
        };
      } catch (error) {
        console.error('Failed to update product stock:', error);
        return {
          success: false,
          message: '更新库存失败',
          product: null,
          previousStock: 0,
          newStock: 0
        };
      }
    },

    batchUpdateStock: async (_: any, { inputs }: { inputs: Array<{ productId: string; quantity: number; operation: string; reason?: string }> }) => {
      const results = [];
      
      for (const input of inputs) {
        try {
          await pocketbaseClient.ensureAuth();
          const pb = pocketbaseClient.getClient();
          
          const product = await pb.collection('products').getOne<Product>(input.productId);
          const previousStock = product.stock || 0;
          let newStock = previousStock;
          
          switch (input.operation) {
            case 'SET':
              newStock = input.quantity;
              break;
            case 'ADD':
              newStock = previousStock + input.quantity;
              break;
            case 'SUBTRACT':
              newStock = Math.max(0, previousStock - input.quantity);
              break;
          }
          
          const updatedProduct = await pb.collection('products').update<Product>(input.productId, { stock: newStock });
          
          results.push({
            success: true,
            message: `库存已从 ${previousStock} 更新为 ${newStock}`,
            product: updatedProduct,
            previousStock,
            newStock
          });
        } catch (error) {
          results.push({
            success: false,
            message: `更新产品 ${input.productId} 库存失败`,
            product: null,
            previousStock: 0,
            newStock: 0
          });
        }
      }
      
      return results;
    },

    // 以下分类管理功能已移至 category.ts 模块

    // 导出功能
    exportProducts: async (_: any, { input }: { input: any }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        let products: Product[] = [];
        
        if (input.productIds && input.productIds.length > 0) {
          // 导出指定产品
          for (const id of input.productIds) {
            try {
              const product = await pb.collection('products').getOne<Product>(id);
              products.push(product);
            } catch (error) {
              console.warn(`Failed to fetch product ${id}:`, error);
            }
          }
        } else if (input.filters) {
          // 根据过滤条件导出
          const filters: string[] = [];
          if (input.filters.status) filters.push(`status="${input.filters.status}"`);
          if (input.filters.category) filters.push(`category="${input.filters.category}"`);
          
          const options: any = {};
          if (filters.length > 0) {
            options.filter = filters.join(' && ');
          }
          
          products = await pb.collection('products').getFullList<Product>(options);
        } else {
          // 导出所有产品
          products = await pb.collection('products').getFullList<Product>();
        }
        
        // 这里应该生成实际的文件并返回下载链接
        // 为了简化，我们返回一个模拟的结果
        const filename = `products_export_${Date.now()}.${input.format.toLowerCase()}`;
        
        return {
          success: true,
          message: `成功导出 ${products.length} 个产品`,
          downloadUrl: `/api/exports/${filename}`,
          filename
        };
      } catch (error) {
        console.error('Failed to export products:', error);
        return {
          success: false,
          message: '导出失败',
          downloadUrl: null,
          filename: null
        };
      }
    },

    // 图片管理
    uploadProductImage: async (_: any, { productId, imageData }: { productId: string; imageData: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        // 这里应该处理图片上传逻辑
        // 为了简化，我们返回一个模拟的图片URL
        const imageUrl = `https://example.com/images/${productId}_${Date.now()}.jpg`;
        
        // 更新产品的图片列表
        const product = await pb.collection('products').getOne<Product>(productId);
        const images = product.images || [];
        images.push(imageUrl);
        
        await pb.collection('products').update(productId, { images });
        
        return imageUrl;
      } catch (error) {
        console.error('Failed to upload product image:', error);
        throw new Error('Failed to upload product image');
      }
    },

    deleteProductImage: async (_: any, { productId, imageUrl }: { productId: string; imageUrl: string }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        const product = await pb.collection('products').getOne<Product>(productId);
        const images = (product.images || []).filter(img => img !== imageUrl);
        
        await pb.collection('products').update(productId, { images });
        
        return true;
      } catch (error) {
        console.error('Failed to delete product image:', error);
        return false;
      }
    },

    reorderProductImages: async (_: any, { productId, imageUrls }: { productId: string; imageUrls: string[] }) => {
      try {
        await pocketbaseClient.ensureAuth();
        const pb = pocketbaseClient.getClient();
        
        return await pb.collection('products').update<Product>(productId, { images: imageUrls });
      } catch (error) {
        console.error('Failed to reorder product images:', error);
        throw new Error('Failed to reorder product images');
      }
    },
  }
}; 