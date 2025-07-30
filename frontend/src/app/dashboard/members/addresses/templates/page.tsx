"use client";

import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ArrowUpDown,
  Bookmark,
  Copy,
  Edit,
  Eye,
  Globe,
  Heart,
  Lock,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
  Star,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  CREATE_ADDRESS_TEMPLATE,
  DELETE_ADDRESS_TEMPLATE,
  GET_ADDRESS_TEMPLATES,
  UPDATE_ADDRESS_TEMPLATE,
} from "@/lib/graphql/queries/member-system";

// 类型定义
interface TemplateData {
  id: string;
  created: string;
  updated: string;
  name: string;
  description?: string;
  template: any;
  type: string;
  category: string;
  usageCount: number;
  popularityScore: number;
  isActive: boolean;
  isPublic: boolean;
  createdBy?: string;
  metadata?: any;
}

interface TemplateFormData {
  name: string;
  description: string;
  category: string;
  type: string;
  isActive: boolean;
  isPublic: boolean;
  // 模板字段
  templateName: string;
  templatePhone: string;
  templateEmail: string;
  templateProvince: string;
  templateCity: string;
  templateDistrict: string;
  templateStreet: string;
  templateAddress: string;
  templateDetailAddress: string;
  templatePostalCode: string;
  templateTag: string;
  templateTagColor: string;
}

export default function AddressTemplatesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("popularityScore");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const [editingTemplate, setEditingTemplate] = useState<TemplateData | null>(
    null,
  );
  const [templateToDelete, setTemplateToDelete] = useState<TemplateData | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateData | null>(
    null,
  );

  const [templateForm, setTemplateForm] = useState<TemplateFormData>({
    name: "",
    description: "",
    category: "general",
    type: "CUSTOM",
    isActive: true,
    isPublic: false,
    templateName: "",
    templatePhone: "",
    templateEmail: "",
    templateProvince: "",
    templateCity: "",
    templateDistrict: "",
    templateStreet: "",
    templateAddress: "",
    templateDetailAddress: "",
    templatePostalCode: "",
    templateTag: "",
    templateTagColor: "#3b82f6",
  });

  // GraphQL queries and mutations
  const {
    data: templatesData,
    loading: templatesLoading,
    refetch: refetchTemplates,
  } = useQuery(GET_ADDRESS_TEMPLATES, {
    variables: {
      query: {
        pagination: {
          page: 1,
          perPage: 100,
          sortBy,
          sortOrder,
        },
        search: searchTerm || undefined,
        type: filterType !== "all" ? filterType : undefined,
        category: filterCategory !== "all" ? [filterCategory] : undefined,
        isActive: filterStatus === "active"
          ? true
          : filterStatus === "inactive"
          ? false
          : undefined,
      },
    },
    errorPolicy: "all",
  });

  const [createTemplate] = useMutation(CREATE_ADDRESS_TEMPLATE, {
    onCompleted: () => {
      refetchTemplates();
      setTemplateDialogOpen(false);
      resetForm();
    },
  });

  const [updateTemplate] = useMutation(UPDATE_ADDRESS_TEMPLATE, {
    onCompleted: () => {
      refetchTemplates();
      setTemplateDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
    },
  });

  const [deleteTemplate] = useMutation(DELETE_ADDRESS_TEMPLATE, {
    onCompleted: () => {
      refetchTemplates();
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    },
  });

  // Data processing
  const templates = templatesData?.addressTemplates?.items || [];
  const stats = templatesData?.addressTemplates?.stats;
  const categories = templatesData?.addressTemplates?.categories || [];

  // Event handlers
  const resetForm = () => {
    setTemplateForm({
      name: "",
      description: "",
      category: "general",
      type: "CUSTOM",
      isActive: true,
      isPublic: false,
      templateName: "",
      templatePhone: "",
      templateEmail: "",
      templateProvince: "",
      templateCity: "",
      templateDistrict: "",
      templateStreet: "",
      templateAddress: "",
      templateDetailAddress: "",
      templatePostalCode: "",
      templateTag: "",
      templateTagColor: "#3b82f6",
    });
  };

  const handleCreateTemplate = async () => {
    try {
      const templateData = {
        name: templateForm.templateName || templateForm.name,
        phone: templateForm.templatePhone,
        email: templateForm.templateEmail,
        province: templateForm.templateProvince,
        city: templateForm.templateCity,
        district: templateForm.templateDistrict,
        street: templateForm.templateStreet,
        address: templateForm.templateAddress,
        detailAddress: templateForm.templateDetailAddress,
        postalCode: templateForm.templatePostalCode,
        tag: templateForm.templateTag,
        tagColor: templateForm.templateTagColor,
      };

      await createTemplate({
        variables: {
          input: {
            name: templateForm.name,
            description: templateForm.description,
            template: templateData,
            type: templateForm.type,
            category: templateForm.category,
            isActive: templateForm.isActive,
            isPublic: templateForm.isPublic,
          },
        },
      });
    } catch (error) {
      console.error("Create template error:", error);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;

    try {
      const templateData = {
        name: templateForm.templateName || templateForm.name,
        phone: templateForm.templatePhone,
        email: templateForm.templateEmail,
        province: templateForm.templateProvince,
        city: templateForm.templateCity,
        district: templateForm.templateDistrict,
        street: templateForm.templateStreet,
        address: templateForm.templateAddress,
        detailAddress: templateForm.templateDetailAddress,
        postalCode: templateForm.templatePostalCode,
        tag: templateForm.templateTag,
        tagColor: templateForm.templateTagColor,
      };

      await updateTemplate({
        variables: {
          id: editingTemplate.id,
          input: {
            name: templateForm.name,
            description: templateForm.description,
            template: templateData,
            type: templateForm.type,
            category: templateForm.category,
            isActive: templateForm.isActive,
            isPublic: templateForm.isPublic,
          },
        },
      });
    } catch (error) {
      console.error("Update template error:", error);
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate({
        variables: {
          id: templateToDelete.id,
        },
      });
    } catch (error) {
      console.error("Delete template error:", error);
    }
  };

  const handleDuplicateTemplate = (template: TemplateData) => {
    const templateData = template.template || {};
    setTemplateForm({
      name: `${template.name} - 副本`,
      description: template.description || "",
      category: template.category,
      type: "CUSTOM",
      isActive: true,
      isPublic: false,
      templateName: templateData.name || "",
      templatePhone: templateData.phone || "",
      templateEmail: templateData.email || "",
      templateProvince: templateData.province || "",
      templateCity: templateData.city || "",
      templateDistrict: templateData.district || "",
      templateStreet: templateData.street || "",
      templateAddress: templateData.address || "",
      templateDetailAddress: templateData.detailAddress || "",
      templatePostalCode: templateData.postalCode || "",
      templateTag: templateData.tag || "",
      templateTagColor: templateData.tagColor || "#3b82f6",
    });
    setEditingTemplate(null);
    setTemplateDialogOpen(true);
  };

  // Utility functions
  const getTypeBadge = (type: string) => {
    const typeMap: Record<
      string,
      { label: string; variant: "default" | "secondary" | "outline" }
    > = {
      SYSTEM: { label: "系统", variant: "default" },
      CUSTOM: { label: "自定义", variant: "secondary" },
      POPULAR: { label: "热门", variant: "outline" },
    };

    const typeInfo = typeMap[type] ||
      { label: type, variant: "outline" as const };
    return <Badge variant={typeInfo.variant}>{typeInfo.label}</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? "default" : "destructive"}>
        {isActive ? "启用" : "禁用"}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) {
      return <ArrowUpDown className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === "ASC"
      ? <ArrowUpDown className="h-4 w-4 rotate-180" />
      : <ArrowUpDown className="h-4 w-4" />;
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(field);
      setSortOrder("DESC");
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">地址模板</h1>
          <p className="text-muted-foreground">
            管理地址模板，提高地址录入效率
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingTemplate(null);
            setTemplateDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          新增模板
        </Button>
      </div>

      {/* 统计信息 */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总模板数</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalTemplates || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">系统模板</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.systemTemplates || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">自定义模板</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.customTemplates || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总使用次数</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalUsage || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 搜索和筛选 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">搜索筛选</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            <div className="space-y-2">
              <Label>搜索模板</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="搜索模板名称或描述"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>模板类型</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="选择类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有类型</SelectItem>
                  <SelectItem value="SYSTEM">系统模板</SelectItem>
                  <SelectItem value="CUSTOM">自定义模板</SelectItem>
                  <SelectItem value="POPULAR">热门模板</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>模板分类</Label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="选择分类" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分类</SelectItem>
                  <SelectItem value="general">通用</SelectItem>
                  <SelectItem value="home">家庭</SelectItem>
                  <SelectItem value="office">办公</SelectItem>
                  <SelectItem value="school">学校</SelectItem>
                  <SelectItem value="mall">商场</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>状态</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="选择状态" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有状态</SelectItem>
                  <SelectItem value="active">启用</SelectItem>
                  <SelectItem value="inactive">禁用</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={() => refetchTemplates()}>
                <RefreshCcw className="h-4 w-4 mr-2" />
                刷新
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 模板列表 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>模板列表</CardTitle>
              <CardDescription>
                共 {templates.length} 个模板
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {templatesLoading
            ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-16 bg-muted animate-pulse rounded"
                  />
                ))}
              </div>
            )
            : templates.length === 0
            ? (
              <div className="text-center py-8">
                <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">暂无模板</h3>
                <p className="text-muted-foreground mb-4">
                  没有找到符合条件的地址模板
                </p>
                <Button
                  onClick={() => {
                    resetForm();
                    setEditingTemplate(null);
                    setTemplateDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  创建第一个模板
                </Button>
              </div>
            )
            : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                        className="p-0 h-auto font-medium"
                      >
                        模板名称
                        {getSortIcon("name")}
                      </Button>
                    </TableHead>
                    <TableHead>分类</TableHead>
                    <TableHead>类型</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("usageCount")}
                        className="p-0 h-auto font-medium"
                      >
                        使用次数
                        {getSortIcon("usageCount")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("popularityScore")}
                        className="p-0 h-auto font-medium"
                      >
                        热度评分
                        {getSortIcon("popularityScore")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("updated")}
                        className="p-0 h-auto font-medium"
                      >
                        更新时间
                        {getSortIcon("updated")}
                      </Button>
                    </TableHead>
                    <TableHead>操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template: TemplateData) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{template.name}</div>
                          {template.description && (
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeBadge(template.type)}
                          {template.isPublic && (
                            <Badge variant="outline" className="text-blue-600">
                              <Globe className="h-3 w-3 mr-1" />
                              公开
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(template.isActive)}
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-medium">
                            {template.usageCount}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">
                            {template.popularityScore?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(template.updated)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedTemplate(template);
                                setDetailDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              查看详情
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const templateData = template.template || {};
                                setEditingTemplate(template);
                                setTemplateForm({
                                  name: template.name,
                                  description: template.description || "",
                                  category: template.category,
                                  type: template.type,
                                  isActive: template.isActive,
                                  isPublic: template.isPublic,
                                  templateName: templateData.name || "",
                                  templatePhone: templateData.phone || "",
                                  templateEmail: templateData.email || "",
                                  templateProvince: templateData.province || "",
                                  templateCity: templateData.city || "",
                                  templateDistrict: templateData.district || "",
                                  templateStreet: templateData.street || "",
                                  templateAddress: templateData.address || "",
                                  templateDetailAddress:
                                    templateData.detailAddress || "",
                                  templatePostalCode: templateData.postalCode ||
                                    "",
                                  templateTag: templateData.tag || "",
                                  templateTagColor: templateData.tagColor ||
                                    "#3b82f6",
                                });
                                setTemplateDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              编辑
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicateTemplate(template)}
                            >
                              <Copy className="h-4 w-4 mr-2" />
                              复制
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setTemplateToDelete(template);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              删除
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
        </CardContent>
      </Card>

      {/* 模板表单对话框 */}
      <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "编辑模板" : "新增模板"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate ? "修改地址模板信息" : "创建新的地址模板"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-medium mb-4">基本信息</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">模板名称 *</Label>
                  <Input
                    id="name"
                    value={templateForm.name}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))}
                    placeholder="模板名称"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">分类 *</Label>
                  <Select
                    value={templateForm.category}
                    onValueChange={(value) =>
                      setTemplateForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">通用</SelectItem>
                      <SelectItem value="home">家庭</SelectItem>
                      <SelectItem value="office">办公</SelectItem>
                      <SelectItem value="school">学校</SelectItem>
                      <SelectItem value="mall">商场</SelectItem>
                      <SelectItem value="other">其他</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={templateForm.description}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))}
                  placeholder="模板描述（可选）"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <Select
                    value={templateForm.type}
                    onValueChange={(value) =>
                      setTemplateForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SYSTEM">系统模板</SelectItem>
                      <SelectItem value="CUSTOM">自定义模板</SelectItem>
                      <SelectItem value="POPULAR">热门模板</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-6 mt-7">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isActive"
                      checked={templateForm.isActive}
                      onCheckedChange={(checked) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          isActive: checked,
                        }))}
                    />
                    <Label htmlFor="isActive">启用模板</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={templateForm.isPublic}
                      onCheckedChange={(checked) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          isPublic: checked,
                        }))}
                    />
                    <Label htmlFor="isPublic">公开模板</Label>
                  </div>
                </div>
              </div>
            </div>

            {/* 模板内容 */}
            <div>
              <h3 className="text-lg font-medium mb-4">模板内容</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">联系人</Label>
                  <Input
                    id="templateName"
                    value={templateForm.templateName}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateName: e.target.value,
                      }))}
                    placeholder="收货人姓名"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templatePhone">手机号</Label>
                  <Input
                    id="templatePhone"
                    value={templateForm.templatePhone}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templatePhone: e.target.value,
                      }))}
                    placeholder="手机号码"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="templateEmail">邮箱</Label>
                <Input
                  id="templateEmail"
                  type="email"
                  value={templateForm.templateEmail}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      templateEmail: e.target.value,
                    }))}
                  placeholder="邮箱地址"
                />
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="templateProvince">省份</Label>
                  <Input
                    id="templateProvince"
                    value={templateForm.templateProvince}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateProvince: e.target.value,
                      }))}
                    placeholder="省份"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateCity">城市</Label>
                  <Input
                    id="templateCity"
                    value={templateForm.templateCity}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateCity: e.target.value,
                      }))}
                    placeholder="城市"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateDistrict">区县</Label>
                  <Input
                    id="templateDistrict"
                    value={templateForm.templateDistrict}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateDistrict: e.target.value,
                      }))}
                    placeholder="区县"
                  />
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="templateStreet">街道</Label>
                <Input
                  id="templateStreet"
                  value={templateForm.templateStreet}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      templateStreet: e.target.value,
                    }))}
                  placeholder="街道/乡镇"
                />
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="templateAddress">详细地址</Label>
                <Textarea
                  id="templateAddress"
                  value={templateForm.templateAddress}
                  onChange={(e) =>
                    setTemplateForm((prev) => ({
                      ...prev,
                      templateAddress: e.target.value,
                    }))}
                  placeholder="详细地址"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="templateDetailAddress">门牌号/楼层</Label>
                  <Input
                    id="templateDetailAddress"
                    value={templateForm.templateDetailAddress}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateDetailAddress: e.target.value,
                      }))}
                    placeholder="门牌号、楼层等"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templatePostalCode">邮政编码</Label>
                  <Input
                    id="templatePostalCode"
                    value={templateForm.templatePostalCode}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templatePostalCode: e.target.value,
                      }))}
                    placeholder="邮政编码"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="templateTag">地址标签</Label>
                  <Input
                    id="templateTag"
                    value={templateForm.templateTag}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateTag: e.target.value,
                      }))}
                    placeholder="如：家、公司、学校"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateTagColor">标签颜色</Label>
                  <Input
                    id="templateTagColor"
                    type="color"
                    value={templateForm.templateTagColor}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        templateTagColor: e.target.value,
                      }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTemplateDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={editingTemplate
                ? handleUpdateTemplate
                : handleCreateTemplate}
              disabled={!templateForm.name || !templateForm.category}
            >
              {editingTemplate ? "更新" : "创建"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除模板 "{templateToDelete?.name}" 吗？ 此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate}>
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 模板详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>模板详情</DialogTitle>
            <DialogDescription>查看完整的模板信息</DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div>
                <h3 className="font-semibold mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">模板名称:</span>
                    <span>{selectedTemplate.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">分类:</span>
                    <Badge variant="outline">{selectedTemplate.category}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">类型:</span>
                    {getTypeBadge(selectedTemplate.type)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">状态:</span>
                    {getStatusBadge(selectedTemplate.isActive)}
                  </div>
                </div>
                {selectedTemplate.description && (
                  <div className="mt-4">
                    <span className="text-muted-foreground">描述:</span>
                    <p className="mt-1">{selectedTemplate.description}</p>
                  </div>
                )}
              </div>

              {/* 模板内容 */}
              <div>
                <h3 className="font-semibold mb-3">模板内容</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {selectedTemplate.template
                    ? (
                      <div className="space-y-2">
                        {selectedTemplate.template.name && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              联系人:
                            </span>
                            <span>{selectedTemplate.template.name}</span>
                          </div>
                        )}
                        {selectedTemplate.template.phone && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              手机号:
                            </span>
                            <span>{selectedTemplate.template.phone}</span>
                          </div>
                        )}
                        {selectedTemplate.template.email && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">邮箱:</span>
                            <span>{selectedTemplate.template.email}</span>
                          </div>
                        )}
                        {(selectedTemplate.template.province ||
                          selectedTemplate.template.city ||
                          selectedTemplate.template.district) && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">地区:</span>
                            <span>
                              {[
                                selectedTemplate.template.province,
                                selectedTemplate.template.city,
                                selectedTemplate.template.district,
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            </span>
                          </div>
                        )}
                        {selectedTemplate.template.street && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">街道:</span>
                            <span>{selectedTemplate.template.street}</span>
                          </div>
                        )}
                        {selectedTemplate.template.address && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              详细地址:
                            </span>
                            <span className="text-right">
                              {selectedTemplate.template.address}
                            </span>
                          </div>
                        )}
                        {selectedTemplate.template.detailAddress && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">
                              门牌号:
                            </span>
                            <span>
                              {selectedTemplate.template.detailAddress}
                            </span>
                          </div>
                        )}
                        {selectedTemplate.template.postalCode && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">邮编:</span>
                            <span>{selectedTemplate.template.postalCode}</span>
                          </div>
                        )}
                        {selectedTemplate.template.tag && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">标签:</span>
                            <Badge
                              style={{
                                backgroundColor:
                                  selectedTemplate.template.tagColor
                                    ? `${selectedTemplate.template.tagColor}20`
                                    : undefined,
                                color: selectedTemplate.template.tagColor ||
                                  undefined,
                                borderColor:
                                  selectedTemplate.template.tagColor ||
                                  undefined,
                              }}
                              variant="outline"
                            >
                              {selectedTemplate.template.tag}
                            </Badge>
                          </div>
                        )}
                      </div>
                    )
                    : (
                      <p className="text-muted-foreground text-center">
                        暂无模板内容
                      </p>
                    )}
                </div>
              </div>

              {/* 使用统计 */}
              <div>
                <h3 className="font-semibold mb-3">使用统计</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedTemplate.usageCount}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      使用次数
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedTemplate.popularityScore?.toFixed(1) || "0.0"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      热度评分
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间信息 */}
              <div>
                <h3 className="font-semibold mb-3">时间信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">创建时间:</span>
                    <span>{formatDate(selectedTemplate.created)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">更新时间:</span>
                    <span>{formatDate(selectedTemplate.updated)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDetailDialogOpen(false)}
            >
              关闭
            </Button>
            <Button
              onClick={() => {
                if (selectedTemplate) {
                  handleDuplicateTemplate(selectedTemplate);
                  setDetailDialogOpen(false);
                }
              }}
            >
              <Copy className="h-4 w-4 mr-2" />
              复制模板
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
