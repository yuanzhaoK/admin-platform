import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';
import { PocketBaseAirCode } from '@/lib/pocketbase-aircode';

export async function POST(req: NextRequest) {
    try {
        const pb = await getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const { id, params } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Function ID is required' }, { status: 400 });
        }

        const { executionId, result } = await airCode.executeFunction(id, params);

        // 订阅执行日志
        const logs: any[] = [];
        const unsubscribe = await airCode.subscribeToLogs(executionId, (newLogs) => {
            logs.push(...newLogs);
        });

        // 等待执行完成
        const checkStatus = async () => {
            const execution = await pb.collection('aircode_executions').getOne(executionId);
            if (execution.status === 'running') {
                await new Promise(resolve => setTimeout(resolve, 100));
                return checkStatus();
            }
            unsubscribe();
            return execution;
        };

        const execution = await checkStatus();

        return NextResponse.json({
            executionId,
            result: execution.result,
            error: execution.error,
            logs
        });
    } catch (error) {
        console.error('Error testing function:', error);
        return NextResponse.json({ error: 'Failed to test function' }, { status: 500 });
    }
} 