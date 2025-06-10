'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Globe, Code, Terminal, Book } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FunctionInfo {
  name: string;
  description: string;
  published: boolean;
  params?: Record<string, string>;
}

export default function ApiDocsPage() {
  const [publishedFunctions, setPublishedFunctions] = useState<FunctionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPublishedFunctions();
  }, []);

  const fetchPublishedFunctions = async () => {
    try {
      const response = await fetch('/api/functions');
      const data = await response.json();
      const published = data.availableFunctions?.filter((func: FunctionInfo) => func.published) || [];
      setPublishedFunctions(published);
    } catch (error) {
      console.error('Failed to fetch functions:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: 'Code copied to clipboard'
    });
  };

  const generateCurlExample = (functionName: string, params: Record<string, string> = {}) => {
    const baseUrl = `${window.location.origin}/api/functions/${functionName}`;
    
    if (Object.keys(params).length === 0) {
      return `curl -X GET "${baseUrl}"`;
    }

    const exampleParams = Object.entries(params).reduce((acc, [key, type]) => {
      switch (type) {
        case 'string':
          acc[key] = 'example';
          break;
        case 'number':
          acc[key] = 123;
          break;
        case 'boolean':
          acc[key] = true;
          break;
        default:
          acc[key] = 'value';
      }
      return acc;
    }, {} as Record<string, any>);

    return `curl -X POST "${baseUrl}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(exampleParams, null, 2)}'`;
  };

  const generateJavaScriptExample = (functionName: string, params: Record<string, string> = {}) => {
    const baseUrl = `${window.location.origin}/api/functions/${functionName}`;
    
    if (Object.keys(params).length === 0) {
      return `// GET request
fetch('${baseUrl}')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
    }

    const exampleParams = Object.entries(params).reduce((acc, [key, type]) => {
      switch (type) {
        case 'string':
          acc[key] = 'example';
          break;
        case 'number':
          acc[key] = 123;
          break;
        case 'boolean':
          acc[key] = true;
          break;
        default:
          acc[key] = 'value';
      }
      return acc;
    }, {} as Record<string, any>);

    return `// POST request
fetch('${baseUrl}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${JSON.stringify(exampleParams, null, 2)})
})
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));`;
  };

  const generatePythonExample = (functionName: string, params: Record<string, string> = {}) => {
    const baseUrl = `${window.location.origin}/api/functions/${functionName}`;
    
    if (Object.keys(params).length === 0) {
      return `import requests

# GET request
response = requests.get('${baseUrl}')
data = response.json()
print(data)`;
    }

    const exampleParams = Object.entries(params).reduce((acc, [key, type]) => {
      switch (type) {
        case 'string':
          acc[key] = 'example';
          break;
        case 'number':
          acc[key] = 123;
          break;
        case 'boolean':
          acc[key] = true;
          break;
        default:
          acc[key] = 'value';
      }
      return acc;
    }, {} as Record<string, any>);

    return `import requests
import json

# POST request
url = '${baseUrl}'
data = ${JSON.stringify(exampleParams, null, 2).replace(/"/g, "'")}

response = requests.post(url, json=data)
result = response.json()
print(result)`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center">
            <Book className="mr-3 h-8 w-8" />
            API Documentation
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Learn how to call your published serverless functions
          </p>
        </div>
      </div>

      {/* API Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Globe className="mr-2 h-5 w-5" />
            API Overview
          </CardTitle>
          <CardDescription>
            Your serverless functions are available as HTTP endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Terminal className="h-4 w-4" />
            <AlertDescription>
              <strong>Base URL:</strong> <code>{window.location.origin}/api/functions/</code><br />
              <strong>Methods:</strong> GET, POST, PUT, DELETE<br />
              <strong>Content-Type:</strong> application/json
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Published Functions */}
      <Card>
        <CardHeader>
          <CardTitle>Published Functions</CardTitle>
          <CardDescription>
            {publishedFunctions.length} published function(s) available
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading functions...</div>
          ) : publishedFunctions.length === 0 ? (
            <Alert>
              <Code className="h-4 w-4" />
              <AlertDescription>
                No published functions found. Go to the Functions page to create and publish functions.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-6">
              {publishedFunctions.map((func) => (
                <div key={func.name} className="border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{func.name}</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {func.description || 'No description'}
                      </p>
                    </div>
                    <Badge variant="default">
                      <Globe className="w-3 h-3 mr-1" />
                      Published
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Endpoint</h4>
                      <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded font-mono text-sm">
                        {window.location.origin}/api/functions/{func.name}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-2"
                          onClick={() => copyToClipboard(`${window.location.origin}/api/functions/${func.name}`)}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    {func.params && Object.keys(func.params).length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Parameters</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(func.params).map(([param, type]) => (
                            <div key={param} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900 rounded">
                              <span className="font-mono text-sm">{param}</span>
                              <Badge variant="outline" className="text-xs">
                                {type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Tabs defaultValue="curl" className="w-full">
                      <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="curl">cURL</TabsTrigger>
                        <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                        <TabsTrigger value="python">Python</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="curl">
                        <div className="relative">
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generateCurlExample(func.name, func.params)}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(generateCurlExample(func.name, func.params))}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="javascript">
                        <div className="relative">
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generateJavaScriptExample(func.name, func.params)}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(generateJavaScriptExample(func.name, func.params))}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="python">
                        <div className="relative">
                          <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto text-sm">
                            <code>{generatePythonExample(func.name, func.params)}</code>
                          </pre>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(generatePythonExample(func.name, func.params))}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Handling */}
      <Card>
        <CardHeader>
          <CardTitle>Error Handling</CardTitle>
          <CardDescription>
            Standard HTTP status codes and error responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium text-green-600 mb-2">200 OK</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Function executed successfully
                </div>
                <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
{`{
  "message": "Hello, World!",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
                </pre>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium text-red-600 mb-2">404 Not Found</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Function not found or not published
                </div>
                <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
{`{
  "error": "Function 'myFunction' not found"
}`}
                </pre>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium text-yellow-600 mb-2">400 Bad Request</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Invalid parameters or request format
                </div>
                <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
{`{
  "error": "Invalid JSON parameters"
}`}
                </pre>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="font-medium text-red-600 mb-2">500 Server Error</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Function execution failed
                </div>
                <pre className="mt-2 text-xs bg-slate-100 dark:bg-slate-800 p-2 rounded">
{`{
  "error": "Function execution failed",
  "timestamp": "2024-01-01T00:00:00.000Z"
}`}
                </pre>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 