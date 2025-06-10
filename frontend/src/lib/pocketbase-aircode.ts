import PocketBase from 'pocketbase';

export interface FunctionRecord {
    id: string;
    name: string;
    code: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface ExecutionRecord {
    id: string;
    function_id: string;
    status: 'running' | 'completed' | 'failed';
    start_time: string;
    end_time?: string;
    request_body: any;
    result?: any;
    error?: string;
    logs: Array<{
        timestamp: string;
        message: string;
        level?: 'info' | 'error';
    }>;
}

export class PocketBaseAirCode {
    private pb: PocketBase;

    constructor(pb: PocketBase) {
        this.pb = pb;
    }

    // 函数管理
    async listFunctions(): Promise<FunctionRecord[]> {
        const response = await fetch('/api/aircode/functions', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to list functions: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async createFunction(data: Omit<FunctionRecord, 'id' | 'created_at' | 'updated_at'>): Promise<FunctionRecord> {
        const response = await fetch('/api/aircode/functions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to create function: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async updateFunction(id: string, data: Partial<FunctionRecord>): Promise<FunctionRecord> {
        const response = await fetch('/api/aircode/functions', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, ...data })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update function: ${response.statusText}`);
        }
        
        return await response.json();
    }

    async deleteFunction(id: string): Promise<void> {
        const response = await fetch(`/api/aircode/functions?id=${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete function: ${response.statusText}`);
        }
    }

    // 函数执行
    async executeFunction(id: string, params: any): Promise<{ executionId: string; result: any }> {
        const response = await fetch('/api/aircode/functions/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, params })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to execute function: ${response.statusText}`);
        }
        
        return await response.json();
    }

    // 执行日志
    async getExecutionLogs(executionId: string): Promise<ExecutionRecord['logs']> {
        const response = await fetch(`/api/aircode/logs?executionId=${executionId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to get execution logs: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data.logs;
    }

    // 实时日志订阅
    async subscribeToLogs(executionId: string, callback: (logs: ExecutionRecord['logs']) => void): Promise<() => void> {
        const unsubscribe = await this.pb.collection('aircode_executions').subscribe(executionId, (e) => {
            if (e.record.logs) {
                callback(e.record.logs);
            }
        });
        return unsubscribe;
    }
} 