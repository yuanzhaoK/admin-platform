# 移动端商城 GraphQL API 文档

## 概述
基于现有backend架构的移动端商城GraphQL API接口文档。支持首页数据、商品浏览、购物车、收藏、地址管理、订单处理等移动端商城功能。

## 服务端点
- **GraphQL 端点**: `http://localhost:8082/graphql`
- **GraphiQL 界面**: `http://localhost:8082/graphql` (GET 请求)
- **健康检查**: `http://localhost:8082/health`

## 认证说明
大部分移动端接口需要用户认证，请在请求头中添加：
```
Authorization: Bearer <access_token>
```

## API 接口

### 1. 首页数据

#### 获取首页数据
```graphql
query GetHomeData {
  homeData {
    banners {
      id
      title
      image
      link_type
      link_value
      sort_order
      is_active
      start_time
      end_time
      created
    }
    packages {
      id
      name
      subtitle
      description
      price
      market_price
      cover_image
      images
      category
      style_type
      is_recommended
      is_featured
      tags
      sort_order
      status
      created
      updated
      products {
        id
        name
        price
        images
      }
    }
    featured_products {
      id
      name
      subtitle
      price
      market_price
      images
      is_featured
      is_new
      is_hot
      sales_count
    }
    categories {
      id
      name
      description
      image
      sort_order
      status
    }
    recommendations {
      id
      name
      price
      images
      sales_count
    }
  }
}
```

**响应示例**:
```json
{
  "data": {
    "homeData": {
      "banners": [
        {
          "id": "banner001",
          "title": "春季家装节",
          "image": "/uploads/banner1.jpg",
          "link_type": "category",
          "link_value": "living_room",
          "sort_order": 1,
          "is_active": true,
          "created": "2024-01-01T00:00:00Z"
        }
      ],
      "packages": [
        {
          "id": "pkg001",
          "name": "现代简约套装",
          "subtitle": "包含客厅、卧室、厨房全套家具",
          "price": 99999,
          "market_price": 129999,
          "cover_image": "/uploads/package1.jpg",
          "style_type": "modern",
          "products": [...]
        }
      ],
      "featured_products": [...],
      "categories": [...],
      "recommendations": [...]
    }
  }
}
```

### 2. 商品相关接口

#### 获取商品列表
```graphql
query GetMobileProducts($query: MobileProductQueryInput) {
  mobileProducts(query: $query) {
    items {
      id
      name
      subtitle
      price
      market_price
      images
      category_id
      brand_id
      status
      is_featured
      is_new
      is_hot
      sales_count
      view_count
      created
      category {
        id
        name
      }
      brand {
        id
        name
        logo
      }
    }
    pagination {
      page
      perPage
      totalPages
      totalItems
    }
  }
}
```

**查询参数**:
```json
{
  "query": {
    "page": 1,
    "perPage": 20,
    "category_id": "cat001",
    "brand_id": "brand001",
    "keyword": "沙发",
    "price_min": 100,
    "price_max": 5000,
    "sort_by": "price",
    "sort_order": "asc"
  }
}
```

#### 获取商品详情
```graphql
query GetProductDetail($id: String!) {
  productDetail(id: $id) {
    id
    name
    subtitle
    description
    price
    market_price
    cost_price
    images
    sku
    stock
    unit
    weight
    tags
    is_featured
    is_new
    is_hot
    points
    growth_value
    service_guarantee
    sales_count
    view_count
    status
    attributes
    category {
      id
      name
      description
    }
    brand {
      id
      name
      logo
      website
    }
    product_type {
      id
      name
      attributes
    }
  }
}
```

#### 获取相关商品
```graphql
query GetRelatedProducts($product_id: String!, $limit: Int = 6) {
  relatedProducts(product_id: $product_id, limit: $limit) {
    id
    name
    price
    images
    sales_count
  }
}
```

### 3. 分类页面数据

#### 获取分类页数据
```graphql
query GetCategoryData($category_id: String) {
  categoryData(category_id: $category_id) {
    categories {
      id
      name
      description
      image
      children {
        id
        name
        image
      }
    }
    products {
      items {
        id
        name
        price
        images
        category_id
        brand_id
      }
      pagination {
        page
        perPage
        totalPages
        totalItems
      }
    }
    filters {
      brands {
        id
        name
        logo
      }
      price_ranges {
        label
        min
        max
      }
      attributes
    }
  }
}
```

### 4. 购物车管理

#### 获取购物车
```graphql
query GetCart {
  cart {
    items {
      id
      user_id
      product_id
      quantity
      selected
      created
      updated
      product {
        id
        name
        price
        images
        stock
      }
    }
    total_items
    total_amount
    selected_amount
  }
}
```

#### 添加到购物车
```graphql
mutation AddToCart($input: CartItemInput!) {
  addToCart(input: $input) {
    id
    quantity
    selected
    product {
      id
      name
      price
      images
    }
  }
}
```

**输入参数**:
```json
{
  "input": {
    "product_id": "prod001",
    "quantity": 1
  }
}
```

#### 更新购物车项
```graphql
mutation UpdateCartItem($id: String!, $input: CartUpdateInput!) {
  updateCartItem(id: $id, input: $input) {
    id
    quantity
    selected
    product {
      id
      name
      price
    }
  }
}
```

#### 从购物车移除
```graphql
mutation RemoveFromCart($id: String!) {
  removeFromCart(id: $id)
}
```

#### 清空购物车
```graphql
mutation ClearCart {
  clearCart
}
```

#### 全选/取消全选
```graphql
mutation SelectAllCart($selected: Boolean!) {
  selectAllCart(selected: $selected)
}
```

### 5. 收藏管理

#### 获取收藏列表
```graphql
query GetFavorites($page: Int = 1, $perPage: Int = 20) {
  favorites(page: $page, perPage: $perPage) {
    items {
      id
      user_id
      product_id
      created
      product {
        id
        name
        price
        images
        status
      }
    }
    pagination {
      page
      perPage
      totalPages
      totalItems
    }
  }
}
```

#### 检查是否收藏
```graphql
query IsFavorite($product_id: String!) {
  isFavorite(product_id: $product_id)
}
```

#### 添加收藏
```graphql
mutation AddToFavorites($product_id: String!) {
  addToFavorites(product_id: $product_id) {
    id
    created
    product {
      id
      name
      price
      images
    }
  }
}
```

#### 移除收藏
```graphql
mutation RemoveFromFavorites($product_id: String!) {
  removeFromFavorites(product_id: $product_id)
}
```

### 6. 地址管理

#### 获取地址列表
```graphql
query GetAddresses {
  addresses {
    id
    user_id
    name
    phone
    province
    city
    district
    address
    postal_code
    is_default
    tag
    created
    updated
  }
}
```

#### 获取默认地址
```graphql
query GetDefaultAddress {
  defaultAddress {
    id
    name
    phone
    province
    city
    district
    address
    postal_code
    is_default
    tag
  }
}
```

#### 创建地址
```graphql
mutation CreateAddress($input: AddressInput!) {
  createAddress(input: $input) {
    id
    name
    phone
    province
    city
    district
    address
    postal_code
    is_default
    tag
    created
  }
}
```

**输入参数**:
```json
{
  "input": {
    "name": "张三",
    "phone": "13800138000",
    "province": "广东省",
    "city": "深圳市",
    "district": "南山区",
    "address": "科技园南区A座1001",
    "postal_code": "518000",
    "is_default": true,
    "tag": "home"
  }
}
```

#### 更新地址
```graphql
mutation UpdateAddress($id: String!, $input: AddressInput!) {
  updateAddress(id: $id, input: $input) {
    id
    name
    phone
    province
    city
    district
    address
    is_default
    tag
    updated
  }
}
```

#### 删除地址
```graphql
mutation DeleteAddress($id: String!) {
  deleteAddress(id: $id)
}
```

#### 设置默认地址
```graphql
mutation SetDefaultAddress($id: String!) {
  setDefaultAddress(id: $id) {
    id
    is_default
  }
}
```

### 7. 用户信息

#### 获取移动端用户信息
```graphql
query GetMobileProfile {
  mobileProfile {
    id
    email
    name
    avatar
    phone
    nickname
    gender
    birthday
    points
    growth_value
    level
    vip_status
    balance
    created
    updated
  }
}
```

#### 更新用户信息
```graphql
mutation UpdateMobileProfile(
  $name: String
  $avatar: String
  $phone: String
  $nickname: String
  $gender: String
  $birthday: String
) {
  updateMobileProfile(
    name: $name
    avatar: $avatar
    phone: $phone
    nickname: $nickname
    gender: $gender
    birthday: $birthday
  ) {
    id
    name
    avatar
    phone
    nickname
    gender
    birthday
    updated
  }
}
```

### 8. 订单管理

#### 创建订单
```graphql
mutation CreateMobileOrder($input: OrderCreateInput!) {
  createMobileOrder(input: $input) {
    id
    order_number
    user_id
    total_amount
    payment_method
    order_source
    order_type
    status
    items {
      product_id
      product_name
      price
      quantity
      total
    }
    shipping_address {
      name
      phone
      province
      city
      district
      address
      postal_code
    }
    notes
    created
  }
}
```

**输入参数**:
```json
{
  "input": {
    "items": [
      {
        "product_id": "prod001",
        "quantity": 1,
        "price": 1999
      }
    ],
    "shipping_address": {
      "name": "张三",
      "phone": "13800138000",
      "province": "广东省",
      "city": "深圳市",
      "district": "南山区",
      "address": "科技园南区A座1001",
      "postal_code": "518000"
    },
    "payment_method": "wechat_pay",
    "coupon_id": "coupon001",
    "notes": "请小心轻放"
  }
}
```

#### 取消订单
```graphql
mutation CancelOrder($id: String!, $reason: String) {
  cancelOrder(id: $id, reason: $reason) {
    id
    status
    updated
  }
}
```

#### 确认收货
```graphql
mutation ConfirmReceived($id: String!) {
  confirmReceived(id: $id) {
    id
    status
    delivered_at
    updated
  }
}
```

### 9. 搜索历史

#### 获取搜索历史
```graphql
query GetSearchHistory {
  searchHistory {
    id
    user_id
    keyword
    created
  }
}
```

#### 添加搜索历史
```graphql
mutation AddSearchHistory($keyword: String!) {
  addSearchHistory(keyword: $keyword) {
    id
    keyword
    created
  }
}
```

#### 清空搜索历史
```graphql
mutation ClearSearchHistory {
  clearSearchHistory
}
```

### 10. 浏览历史

#### 获取浏览历史
```graphql
query GetViewHistory($page: Int = 1, $perPage: Int = 20) {
  viewHistory(page: $page, perPage: $perPage) {
    id
    user_id
    product_id
    created
    updated
    product {
      id
      name
      price
      images
      status
    }
  }
}
```

#### 添加浏览历史
```graphql
mutation AddViewHistory($product_id: String!) {
  addViewHistory(product_id: $product_id) {
    id
    created
  }
}
```

## Flutter 集成示例

### 依赖配置
```yaml
dependencies:
  graphql_flutter: ^5.1.2
  http: ^0.13.5
```

### GraphQL 客户端配置
```dart
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLService {
  static late GraphQLClient _client;
  
  static void initialize() {
    final HttpLink httpLink = HttpLink('http://localhost:8082/graphql');
    
    final AuthLink authLink = AuthLink(
      getToken: () async {
        // 从本地存储获取token
        final prefs = await SharedPreferences.getInstance();
        return 'Bearer ${prefs.getString('access_token') ?? ''}';
      },
    );
    
    final Link link = authLink.concat(httpLink);
    
    _client = GraphQLClient(
      link: link,
      cache: GraphQLCache(store: InMemoryStore()),
    );
  }
  
  static GraphQLClient get client => _client;
}
```

### 使用示例 - 获取首页数据
```dart
class HomeService {
  static const String GET_HOME_DATA = r'''
    query GetHomeData {
      homeData {
        banners {
          id
          title
          image
          link_type
          link_value
        }
        packages {
          id
          name
          price
          market_price
          cover_image
          style_type
        }
        featured_products {
          id
          name
          price
          images
        }
      }
    }
  ''';
  
  static Future<HomeData?> getHomeData() async {
    try {
      final QueryOptions options = QueryOptions(
        document: gql(GET_HOME_DATA),
        fetchPolicy: FetchPolicy.cacheAndNetwork,
      );
      
      final QueryResult result = await GraphQLService.client.query(options);
      
      if (result.hasException) {
        print('GraphQL Error: ${result.exception}');
        return null;
      }
      
      if (result.data != null) {
        return HomeData.fromJson(result.data!['homeData']);
      }
      
      return null;
    } catch (e) {
      print('Error fetching home data: $e');
      return null;
    }
  }
}
```

### 使用示例 - 购物车操作
```dart
class CartService {
  static const String ADD_TO_CART = r'''
    mutation AddToCart($input: CartItemInput!) {
      addToCart(input: $input) {
        id
        quantity
        product {
          id
          name
          price
          images
        }
      }
    }
  ''';
  
  static Future<bool> addToCart(String productId, int quantity) async {
    try {
      final MutationOptions options = MutationOptions(
        document: gql(ADD_TO_CART),
        variables: {
          'input': {
            'product_id': productId,
            'quantity': quantity,
          }
        },
      );
      
      final QueryResult result = await GraphQLService.client.mutate(options);
      
      if (result.hasException) {
        print('GraphQL Error: ${result.exception}');
        return false;
      }
      
      return result.data != null;
    } catch (e) {
      print('Error adding to cart: $e');
      return false;
    }
  }
}
```

## 错误处理

### 常见错误码

| 错误类型 | 描述 | 解决方案 |
|---------|------|----------|
| `UNAUTHENTICATED` | 用户未登录 | 引导用户登录 |
| `FORBIDDEN` | 权限不足 | 检查用户权限 |
| `NOT_FOUND` | 资源不存在 | 检查资源ID |
| `VALIDATION_ERROR` | 参数验证失败 | 检查输入参数 |
| `INTERNAL_ERROR` | 服务器内部错误 | 稍后重试 |

### 错误响应示例
```json
{
  "errors": [
    {
      "message": "用户未登录",
      "extensions": {
        "code": "UNAUTHENTICATED",
        "path": ["addToCart"]
      }
    }
  ],
  "data": null
}
```

## 最佳实践

### 1. 缓存策略
- 首页数据：使用 `cache-and-network` 策略
- 商品列表：使用 `cache-first` 策略
- 用户数据：使用 `network-only` 策略

### 2. 分页处理
```dart
// 实现无限滚动
class ProductListWidget extends StatefulWidget {
  @override
  _ProductListWidgetState createState() => _ProductListWidgetState();
}

class _ProductListWidgetState extends State<ProductListWidget> {
  List<Product> products = [];
  int currentPage = 1;
  bool isLoading = false;
  bool hasMore = true;
  
  Future<void> loadMore() async {
    if (isLoading || !hasMore) return;
    
    setState(() => isLoading = true);
    
    final result = await ProductService.getProducts(
      page: currentPage,
      perPage: 20,
    );
    
    if (result != null) {
      setState(() {
        products.addAll(result.items);
        currentPage++;
        hasMore = result.pagination.page < result.pagination.totalPages;
      });
    }
    
    setState(() => isLoading = false);
  }
}
```

### 3. 离线支持
使用GraphQL的缓存机制实现基本的离线功能：

```dart
// 配置缓存持久化
final store = HiveStore();

final client = GraphQLClient(
  link: link,
  cache: GraphQLCache(store: store),
);
```

### 4. 图片优化
```dart
// 使用缓存网络图片
CachedNetworkImage(
  imageUrl: product.images.first,
  placeholder: (context, url) => CircularProgressIndicator(),
  errorWidget: (context, url, error) => Icon(Icons.error),
  fit: BoxFit.cover,
)
```

## 部署说明

### 开发环境启动
```bash
cd backend
deno task dev
```

### 生产环境部署
```bash
# 构建Docker镜像
docker build -t mobile-api .

# 运行容器
docker run -d \
  -p 8082:8082 \
  -e POCKETBASE_URL=http://pocketbase:8090 \
  --name mobile-api \
  mobile-api
```

### 环境变量
```env
GRAPHQL_PORT=8082
POCKETBASE_URL=http://localhost:8090
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your-admin-password
```

## 总结

该移动端商城API基于GraphQL架构，提供了完整的移动端商城功能支持，包括：

- 🏠 首页数据展示
- 🛍️ 商品浏览和搜索  
- 🛒 购物车管理
- ❤️ 收藏功能
- 📍 地址管理
- 👤 用户信息管理
- 📦 订单处理
- 🔍 搜索和浏览历史

API设计遵循RESTful和GraphQL最佳实践，支持灵活的查询、完整的错误处理和良好的性能优化。 