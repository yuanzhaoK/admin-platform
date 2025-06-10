import { NextRequest, NextResponse } from 'next/server';
import { getPocketBase } from '@/lib/pocketbase';
import { PocketBaseAirCode } from '@/lib/pocketbase-aircode';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const executionId = searchParams.get('executionId');

        if (!executionId) {
            return NextResponse.json({ error: 'Execution ID is required' }, { status: 400 });
        }

        const pb = getPocketBase();
        const airCode = new PocketBaseAirCode(pb);
        const logs = await airCode.getExecutionLogs(executionId);

        return NextResponse.json({ logs });
    } catch (error) {
        console.error('Error fetching logs:', error);
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

 