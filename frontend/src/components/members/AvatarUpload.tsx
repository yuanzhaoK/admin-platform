"use client";

import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Trash2, Upload, User } from "lucide-react";

interface AvatarUploadProps {
  currentAvatar?: string;
  memberName?: string;
  onAvatarChange: (avatarUrl: string | null) => void;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
}

export function AvatarUpload({
  currentAvatar,
  memberName,
  onAvatarChange,
  size = "md",
  disabled = false,
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      alert("请选择图片文件");
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("图片大小不能超过5MB");
      return;
    }

    // 创建预览URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    try {
      // 这里应该是实际的上传逻辑
      // 模拟上传延迟
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 上传成功后，通知父组件
      onAvatarChange(previewUrl);
      setUploadDialogOpen(false);
      setPreviewUrl(null);
    } catch (error) {
      console.error("头像上传失败:", error);
      alert("头像上传失败，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    onAvatarChange(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const handleCancelUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setUploadDialogOpen(false);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      <div className="relative group">
        <Avatar
          className={`${sizeClasses[size]} cursor-pointer transition-opacity ${
            disabled ? "opacity-50" : "group-hover:opacity-80"
          }`}
        >
          <AvatarImage src={currentAvatar} alt={memberName} />
          <AvatarFallback>
            {memberName?.[0]?.toUpperCase() || <User className="h-6 w-6" />}
          </AvatarFallback>
        </Avatar>

        {!disabled && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-all">
            <Camera
              className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={openFileDialog}
            />
          </div>
        )}
      </div>

      {!disabled && (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openFileDialog}
          >
            <Upload className="h-4 w-4 mr-1" />
            {currentAvatar ? "更换头像" : "上传头像"}
          </Button>

          {currentAvatar && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveAvatar}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="选择头像文件"
      />

      {/* 上传确认对话框 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传头像</DialogTitle>
            <DialogDescription>
              预览新头像，确认后点击上传
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <Label className="text-sm text-muted-foreground">
                  当前头像
                </Label>
                <Avatar className="h-20 w-20 mt-2">
                  <AvatarImage src={currentAvatar} alt={memberName} />
                  <AvatarFallback>
                    {memberName?.[0]?.toUpperCase() || (
                      <User className="h-6 w-6" />
                    )}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="text-center">
                <Label className="text-sm text-muted-foreground">新头像</Label>
                <Avatar className="h-20 w-20 mt-2">
                  <AvatarImage src={previewUrl || undefined} alt="新头像" />
                  <AvatarFallback>
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelUpload}
              disabled={isUploading}
            >
              取消
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? "上传中..." : "确认上传"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
