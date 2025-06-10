'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Play, 
  Plus, 
  Zap, 
  Terminal, 
  Save, 
  Edit, 
  Trash2, 
  Globe, 
  EyeOff,
  Copy,
  RefreshCw
} from 'lucide-react';
import VSCodeEditor from '@/components/VSCodeEditor';

interface FunctionInfo {
  name: string;
  code: string;
  description: string;
  created: string;
  updated: string;
  published: boolean;
  dependencies: string[];
  params?: Record<string, string>;
}

interface TestResult {
  success: boolean;
  result?: any;
  error?: string;
  timestamp: string;
}

export default function FunctionsPage() {
  const [functions, setFunctions] = useState<FunctionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<FunctionInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { toast } = useToast();

  // 编辑器状态
  const [editForm, setEditForm] = useState({
    name: '',
    code: '',
    description: '',
    published: false,
    dependencies: [] as string[]
  });

  // 测试状态
  const [testParams, setTestParams] = useState('{}');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    fetchFunctions();
  }, []);

  const fetchFunctions = async () => {
    try {
      const response = await fetch('/api/functions');
      const data = await response.json();
      setFunctions(data.availableFunctions || []);
    } catch (error) {
      console.error('Failed to fetch functions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch functions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const saveFunction = async () => {
    try {
      const response = await fetch('/api/functions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: editForm.name,
          code: editForm.code,
          description: editForm.description,
          published: editForm.published,
          dependencies: editForm.dependencies
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        });
        await fetchFunctions();
        setIsEditing(false);
        setIsCreating(false);
        setActiveTab('list');
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save function',
        variant: 'destructive'
      });
    }
  };

  const deleteFunction = async (functionName: string) => {
    try {
      const response = await fetch(`/api/functions?name=${functionName}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        toast({
          title: 'Success',
          description: result.message
        });
        await fetchFunctions();
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete function',
        variant: 'destructive'
      });
    }
  };

  const testFunction = async () => {
    if (!selectedFunction) return;

    setTesting(true);
    setTestResult(null);

    try {
      let params = {};
      try {
        params = JSON.parse(testParams);
      } catch (e) {
        throw new Error('Invalid JSON parameters');
      }

      const response = await fetch('/api/functions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          functionName: selectedFunction.name,
          params
        })
      });

      const result = await response.json();
      setTestResult(result);
    } catch (error: any) {
      setTestResult({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    } finally {
      setTesting(false);
    }
  };

  const createNewFunction = () => {
    setEditForm({
      name: '',
      code: `function newFunction(params) {
  // Write your function logic here
  return { message: "Hello from new function!" };
}`,
      description: '',
      published: false,
      dependencies: []
    });
    setIsCreating(true);
    setIsEditing(true);
    setActiveTab('editor');
  };

  const editFunction = (func: FunctionInfo) => {
    setEditForm({
      name: func.name,
      code: func.code,
      description: func.description,
      published: func.published,
      dependencies: func.dependencies
    });
    setSelectedFunction(func);
    setIsCreating(false);
    setIsEditing(true);
    setActiveTab('editor');
  };

  const copyApiUrl = (functionName: string) => {
    const url = `${window.location.origin}/api/functions/${functionName}`;
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'API URL copied to clipboard'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Serverless Functions
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Create, manage and deploy serverless functions
          </p>
        </div>
        <Button 
          onClick={createNewFunction}
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Function
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Functions</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="test">Test</TabsTrigger>
        </TabsList>

        {/* Functions List */}
        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                Available Functions
              </CardTitle>
              <CardDescription>
                Manage your serverless functions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading functions...
                </div>
              ) : functions.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No functions found. Create your first function!
                </div>
              ) : (
                <div className="space-y-3">
                  {functions.map((func) => (
                    <div
                      key={func.name}
                      className="p-4 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-slate-900 dark:text-slate-100">
                              {func.name}
                            </h3>
                            <Badge variant={func.published ? 'default' : 'secondary'}>
                              {func.published ? (
                                <><Globe className="w-3 h-3 mr-1" /> Published</>
                              ) : (
                                <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                            {func.description || 'No description'}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-slate-400">
                            <span>Created: {new Date(func.created).toLocaleDateString()}</span>
                            <span>Updated: {new Date(func.updated).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFunction(func);
                              setActiveTab('test');
                            }}
                          >
                            <Play className="w-4 h-4 mr-1" />
                            Test
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => editFunction(func)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          {func.published && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyApiUrl(func.name)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              API
                            </Button>
                          )}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Trash2 className="w-4 h-4 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Function</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete &quot;{func.name}&quot;? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-end gap-2">
                                <Button variant="outline">Cancel</Button>
                                <Button 
                                  variant="destructive"
                                  onClick={() => deleteFunction(func.name)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Editor */}
        <TabsContent value="editor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="mr-2 h-5 w-5" />
                {isCreating ? 'Create Function' : `Edit Function: ${editForm.name}`}
              </CardTitle>
              <CardDescription>
                Write your serverless function code
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="function-name">Function Name</Label>
                  <Input
                    id="function-name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="myFunction"
                    disabled={!isCreating}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="function-published">Status</Label>
                  <Select
                    value={editForm.published.toString()}
                    onValueChange={(value) => setEditForm({ ...editForm, published: value === 'true' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">Draft</SelectItem>
                      <SelectItem value="true">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="function-description">Description</Label>
                <Textarea
                  id="function-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Describe what this function does..."
                  rows={2}
                />
              </div>

                              <div className="space-y-2">
                  <Label>Function Code</Label>
                  <VSCodeEditor
                    height="500px"
                    language="javascript"
                    value={editForm.code}
                    onChange={(value) => setEditForm({ ...editForm, code: value || '' })}
                    functionName={editForm.name || 'untitled'}
                    dependencies={editForm.dependencies}
                    onDependenciesChange={(deps) => setEditForm({ ...editForm, dependencies: deps })}
                  />
                </div>

              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setIsCreating(false);
                    setActiveTab('list');
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={saveFunction}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Function
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Code Templates */}
          <Card>
            <CardHeader>
              <CardTitle>Code Templates</CardTitle>
              <CardDescription>Click to load a template</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => setEditForm({ 
                    ...editForm, 
                    code: `function helloWorld(params) {
  const name = params.name || 'World';
  return { 
    message: \`Hello, \${name}!\`,
    timestamp: new Date().toISOString()
  };
}` 
                  })}
                >
                  <div className="font-medium">Hello World</div>
                  <div className="text-xs text-slate-500 mt-1">Basic greeting function</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => setEditForm({ 
                    ...editForm, 
                    code: `function apiProxy(params) {
  // Make HTTP requests to external APIs
  const fetch = require('node-fetch');
  
  return fetch(params.url)
    .then(response => response.json())
    .then(data => ({ success: true, data }))
    .catch(error => ({ success: false, error: error.message }));
}` 
                  })}
                >
                  <div className="font-medium">API Proxy</div>
                  <div className="text-xs text-slate-500 mt-1">Proxy external API calls</div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-start"
                  onClick={() => setEditForm({ 
                    ...editForm, 
                    code: `function dataProcessor(params) {
  // Process and transform data
  const { data, operation } = params;
  
  switch (operation) {
    case 'sort':
      return { result: data.sort() };
    case 'filter':
      return { result: data.filter(item => item > 0) };
    case 'map':
      return { result: data.map(item => item * 2) };
    default:
      return { error: 'Unknown operation' };
  }
}` 
                  })}
                >
                  <div className="font-medium">Data Processor</div>
                  <div className="text-xs text-slate-500 mt-1">Transform and process data</div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Function Testing */}
        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Terminal className="mr-2 h-5 w-5" />
                Test Function
                {selectedFunction && (
                  <Badge variant="outline" className="ml-2">
                    {selectedFunction.name}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Test your function with custom parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedFunction ? (
                <Alert>
                  <Zap className="h-4 w-4" />
                  <AlertDescription>
                    Please select a function from the functions list to test it.
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="test-params">Function Parameters (JSON)</Label>
                    <VSCodeEditor
                      height="120px"
                      language="json"
                      value={testParams}
                      onChange={(value) => setTestParams(value || '{}')}
                      functionName="test-params"
                      readOnly={false}
                    />
                  </div>

                  <Button
                    onClick={testFunction}
                    disabled={testing}
                    className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
                  >
                    {testing ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Test Function
                      </>
                    )}
                  </Button>

                  {testResult && (
                                          <div className="space-y-2">
                        <Label>Test Result</Label>
                        <VSCodeEditor
                          height="200px"
                          language="json"
                          value={JSON.stringify(testResult, null, 2)}
                          readOnly={true}
                          functionName="test-result"
                        />
                      </div>
                  )}

                  {selectedFunction.published && (
                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        <strong>API Endpoint:</strong> This function is published and available at:<br />
                        <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-sm">
                          GET/POST {window.location.origin}/api/functions/{selectedFunction.name}
                        </code>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="ml-2"
                          onClick={() => copyApiUrl(selectedFunction.name)}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 