/**
 * 负载均衡和高可用配置
 * @description 提供服务发现、健康检查、负载均衡等功能
 */

interface ServiceInstance {
  id: string;
  host: string;
  port: number;
  weight: number;
  status: 'healthy' | 'unhealthy' | 'draining';
  lastCheck: Date;
  connections: number;
  responseTime: number;
  metadata: Record<string, any>;
}

interface LoadBalancerConfig {
  algorithm: 'round-robin' | 'weighted' | 'least-connections' | 'ip-hash';
  healthCheck: {
    interval: number;
    timeout: number;
    retries: number;
    path: string;
  };
  circuitBreaker: {
    failureThreshold: number;
    recoveryTimeout: number;
    monitoringPeriod: number;
  };
}

export class LoadBalancer {
  private instances: ServiceInstance[] = [];
  private currentIndex = 0;
  private config: LoadBalancerConfig;
  private circuitBreakerStates: Map<string, CircuitBreakerState> = new Map();

  constructor(config: LoadBalancerConfig) {
    this.config = config;
    this.startHealthChecks();
  }

  /**
   * 添加服务实例
   */
  addInstance(instance: Omit<ServiceInstance, 'status' | 'lastCheck' | 'connections' | 'responseTime'>): void {
    const newInstance: ServiceInstance = {
      ...instance,
      status: 'healthy',
      lastCheck: new Date(),
      connections: 0,
      responseTime: 0
    };

    this.instances.push(newInstance);
    this.circuitBreakerStates.set(instance.id, {
      state: 'closed',
      failures: 0,
      lastFailure: null,
      nextRetryAt: null
    });
  }

  /**
   * 移除服务实例
   */
  removeInstance(instanceId: string): void {
    this.instances = this.instances.filter(instance => instance.id !== instanceId);
    this.circuitBreakerStates.delete(instanceId);
  }

  /**
   * 获取可用的服务实例
   */
  getAvailableInstance(clientIp?: string): ServiceInstance | null {
    const healthyInstances = this.instances.filter(instance => 
      instance.status === 'healthy' && 
      this.getCircuitBreakerState(instance.id).state !== 'open'
    );

    if (healthyInstances.length === 0) {
      return null;
    }

    switch (this.config.algorithm) {
      case 'round-robin':
        return this.roundRobinSelect(healthyInstances);
      case 'weighted':
        return this.weightedSelect(healthyInstances);
      case 'least-connections':
        return this.leastConnectionsSelect(healthyInstances);
      case 'ip-hash':
        return this.ipHashSelect(healthyInstances, clientIp || '');
      default:
        return this.roundRobinSelect(healthyInstances);
    }
  }

  /**
   * 记录请求结果
   */
  recordRequest(instanceId: string, success: boolean, responseTime: number): void {
    const instance = this.instances.find(i => i.id === instanceId);
    if (!instance) return;

    instance.responseTime = responseTime;

    const circuitBreaker = this.getCircuitBreakerState(instanceId);
    
    if (success) {
      // 重置失败计数
      circuitBreaker.failures = 0;
      
      // 如果断路器是半开状态，可以考虑关闭
      if (circuitBreaker.state === 'half-open') {
        circuitBreaker.state = 'closed';
        circuitBreaker.nextRetryAt = null;
      }
    } else {
      circuitBreaker.failures++;
      circuitBreaker.lastFailure = new Date();
      
      // 检查是否需要打开断路器
      if (circuitBreaker.failures >= this.config.circuitBreaker.failureThreshold) {
        circuitBreaker.state = 'open';
        circuitBreaker.nextRetryAt = new Date(
          Date.now() + this.config.circuitBreaker.recoveryTimeout
        );
      }
    }

    this.circuitBreakerStates.set(instanceId, circuitBreaker);
  }

  /**
   * 开始连接
   */
  startConnection(instanceId: string): void {
    const instance = this.instances.find(i => i.id === instanceId);
    if (instance) {
      instance.connections++;
    }
  }

  /**
   * 结束连接
   */
  endConnection(instanceId: string): void {
    const instance = this.instances.find(i => i.id === instanceId);
    if (instance && instance.connections > 0) {
      instance.connections--;
    }
  }

  /**
   * 获取所有实例状态
   */
  getInstancesStatus(): ServiceInstance[] {
    return [...this.instances];
  }

  /**
   * 获取负载均衡统计
   */
  getStats() {
    const totalInstances = this.instances.length;
    const healthyInstances = this.instances.filter(i => i.status === 'healthy').length;
    const totalConnections = this.instances.reduce((sum, i) => sum + i.connections, 0);
    const avgResponseTime = this.instances.length > 0 
      ? this.instances.reduce((sum, i) => sum + i.responseTime, 0) / this.instances.length
      : 0;

    return {
      totalInstances,
      healthyInstances,
      totalConnections,
      avgResponseTime,
      instances: this.instances.map(i => ({
        id: i.id,
        host: i.host,
        port: i.port,
        status: i.status,
        connections: i.connections,
        responseTime: i.responseTime,
        weight: i.weight
      }))
    };
  }

  private roundRobinSelect(instances: ServiceInstance[]): ServiceInstance {
    const instance = instances[this.currentIndex % instances.length];
    this.currentIndex = (this.currentIndex + 1) % instances.length;
    return instance;
  }

  private weightedSelect(instances: ServiceInstance[]): ServiceInstance {
    const totalWeight = instances.reduce((sum, instance) => sum + instance.weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (const instance of instances) {
      currentWeight += instance.weight;
      if (random <= currentWeight) {
        return instance;
      }
    }
    
    return instances[0]; // fallback
  }

  private leastConnectionsSelect(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, current) => 
      current.connections < min.connections ? current : min
    );
  }

  private ipHashSelect(instances: ServiceInstance[], clientIp: string): ServiceInstance {
    // 简单的IP哈希
    let hash = 0;
    for (let i = 0; i < clientIp.length; i++) {
      hash = ((hash << 5) - hash) + clientIp.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    
    const index = Math.abs(hash) % instances.length;
    return instances[index];
  }

  private getCircuitBreakerState(instanceId: string): CircuitBreakerState {
    let state = this.circuitBreakerStates.get(instanceId);
    
    if (!state) {
      state = {
        state: 'closed',
        failures: 0,
        lastFailure: null,
        nextRetryAt: null
      };
      this.circuitBreakerStates.set(instanceId, state);
    }

    // 检查是否可以从开放状态转为半开状态
    if (state.state === 'open' && state.nextRetryAt && new Date() > state.nextRetryAt) {
      state.state = 'half-open';
      state.nextRetryAt = null;
    }

    return state;
  }

  private startHealthChecks(): void {
    setInterval(async () => {
      for (const instance of this.instances) {
        await this.checkInstanceHealth(instance);
      }
    }, this.config.healthCheck.interval);
  }

  private async checkInstanceHealth(instance: ServiceInstance): Promise<void> {
    const url = `http://${instance.host}:${instance.port}${this.config.healthCheck.path}`;
    const startTime = performance.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.healthCheck.timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        method: 'GET'
      });

      clearTimeout(timeoutId);

      const responseTime = performance.now() - startTime;
      instance.responseTime = responseTime;
      instance.lastCheck = new Date();

      if (response.ok) {
        if (instance.status !== 'healthy') {
          console.log(`Instance ${instance.id} is now healthy`);
        }
        instance.status = 'healthy';
      } else {
        if (instance.status === 'healthy') {
          console.log(`Instance ${instance.id} failed health check: ${response.status}`);
        }
        instance.status = 'unhealthy';
      }

    } catch (error) {
      const responseTime = performance.now() - startTime;
      instance.responseTime = responseTime;
      instance.lastCheck = new Date();
      
      if (instance.status === 'healthy') {
        console.log(`Instance ${instance.id} failed health check:`, error);
      }
      instance.status = 'unhealthy';
    }
  }
}

interface CircuitBreakerState {
  state: 'closed' | 'open' | 'half-open';
  failures: number;
  lastFailure: Date | null;
  nextRetryAt: Date | null;
}

/**
 * 服务发现
 */
export class ServiceDiscovery {
  private services: Map<string, ServiceInstance[]> = new Map();
  private watchers: Map<string, ((instances: ServiceInstance[]) => void)[]> = new Map();

  /**
   * 注册服务
   */
  registerService(serviceName: string, instance: ServiceInstance): void {
    const instances = this.services.get(serviceName) || [];
    const existingIndex = instances.findIndex(i => i.id === instance.id);
    
    if (existingIndex >= 0) {
      instances[existingIndex] = instance;
    } else {
      instances.push(instance);
    }
    
    this.services.set(serviceName, instances);
    this.notifyWatchers(serviceName, instances);
  }

  /**
   * 注销服务
   */
  deregisterService(serviceName: string, instanceId: string): void {
    const instances = this.services.get(serviceName) || [];
    const filteredInstances = instances.filter(i => i.id !== instanceId);
    
    this.services.set(serviceName, filteredInstances);
    this.notifyWatchers(serviceName, filteredInstances);
  }

  /**
   * 发现服务
   */
  discoverService(serviceName: string): ServiceInstance[] {
    return this.services.get(serviceName) || [];
  }

  /**
   * 监听服务变更
   */
  watchService(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    const watchers = this.watchers.get(serviceName) || [];
    watchers.push(callback);
    this.watchers.set(serviceName, watchers);

    // 立即调用一次回调
    const instances = this.services.get(serviceName) || [];
    callback(instances);
  }

  /**
   * 取消监听
   */
  unwatchService(serviceName: string, callback: (instances: ServiceInstance[]) => void): void {
    const watchers = this.watchers.get(serviceName) || [];
    const filteredWatchers = watchers.filter(w => w !== callback);
    this.watchers.set(serviceName, filteredWatchers);
  }

  private notifyWatchers(serviceName: string, instances: ServiceInstance[]): void {
    const watchers = this.watchers.get(serviceName) || [];
    watchers.forEach(callback => {
      try {
        callback(instances);
      } catch (error) {
        console.error('Error in service discovery watcher:', error);
      }
    });
  }
}

// 全局实例
export const serviceDiscovery = new ServiceDiscovery();

// 创建默认的负载均衡器配置
export function createLoadBalancer(config?: Partial<LoadBalancerConfig>): LoadBalancer {
  const defaultConfig: LoadBalancerConfig = {
    algorithm: 'round-robin',
    healthCheck: {
      interval: 30000, // 30秒
      timeout: 5000,   // 5秒
      retries: 3,
      path: '/health'
    },
    circuitBreaker: {
      failureThreshold: 5,
      recoveryTimeout: 60000, // 1分钟
      monitoringPeriod: 60000
    }
  };

  return new LoadBalancer({ ...defaultConfig, ...config });
}
