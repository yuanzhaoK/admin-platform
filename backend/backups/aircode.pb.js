// 函数执行钩子
routerAdd('POST', '/api/aircode/functions/:id/execute', (c) => {
    const id = c.pathParam('id');
    const body = c.requestBody;
    const admin = c.admin;
    const db = c.app.dao().db();

    // 获取函数信息
    const functionRecord = db.findOne('aircode_functions', id);
    if (!functionRecord) {
        return c.json(404, { error: 'Function not found' });
    }

    // 创建执行记录
    const execution = {
        function_id: id,
        status: 'running',
        start_time: new Date().toISOString(),
        request_body: body,
        logs: []
    };

    const executionRecord = db.create('aircode_executions', execution);
    const executionId = executionRecord.id;

    // 执行函数
    try {
        // 创建函数执行环境
        const context = {
            db: db,
            admin: admin,
            executionId: executionId,
            log: (message) => {
                db.update('aircode_executions', executionId, {
                    logs: [...execution.logs, {
                        timestamp: new Date().toISOString(),
                        message: message
                    }]
                });
            }
        };

        // 执行函数代码
        const fn = new Function('context', functionRecord.code);
        const result = fn(context);

        // 更新执行记录
        db.update('aircode_executions', executionId, {
            status: 'completed',
            end_time: new Date().toISOString(),
            result: result
        });

        return c.json(200, { 
            executionId,
            result 
        });
    } catch (error) {
        // 记录错误
        db.update('aircode_executions', executionId, {
            status: 'failed',
            end_time: new Date().toISOString(),
            error: error.message,
            logs: [...execution.logs, {
                timestamp: new Date().toISOString(),
                message: `Error: ${error.message}`,
                level: 'error'
            }]
        });

        return c.json(500, { 
            executionId,
            error: error.message 
        });
    }
});

// 获取执行日志
routerAdd('GET', '/api/aircode/executions/:id/logs', (c) => {
    const id = c.pathParam('id');
    const db = c.app.dao().db();

    const execution = db.findOne('aircode_executions', id);
    if (!execution) {
        return c.json(404, { error: 'Execution not found' });
    }

    return c.json(200, {
        logs: execution.logs || []
    });
});

// 获取函数列表
routerAdd('GET', '/api/aircode/functions', (c) => {
    const db = c.app.dao().db();
    const functions = db.find('aircode_functions');
    return c.json(200, { functions });
});

// 创建函数
routerAdd('POST', '/api/aircode/functions', (c) => {
    const body = c.requestBody;
    const db = c.app.dao().db();

    const functionRecord = {
        name: body.name,
        code: body.code,
        description: body.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const record = db.create('aircode_functions', functionRecord);
    return c.json(200, record);
});

// 更新函数
routerAdd('PUT', '/api/aircode/functions/:id', (c) => {
    const id = c.pathParam('id');
    const body = c.requestBody;
    const db = c.app.dao().db();

    const functionRecord = db.findOne('aircode_functions', id);
    if (!functionRecord) {
        return c.json(404, { error: 'Function not found' });
    }

    const updates = {
        name: body.name,
        code: body.code,
        description: body.description,
        updated_at: new Date().toISOString()
    };

    db.update('aircode_functions', id, updates);
    return c.json(200, { ...functionRecord, ...updates });
});

// 删除函数
routerAdd('DELETE', '/api/aircode/functions/:id', (c) => {
    const id = c.pathParam('id');
    const db = c.app.dao().db();

    const functionRecord = db.findOne('aircode_functions', id);
    if (!functionRecord) {
        return c.json(404, { error: 'Function not found' });
    }

    db.delete('aircode_functions', id);
    return c.json(200, { success: true });
}); 