"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  BarChart3,
  ChevronRight,
  Coins,
  Crown,
  MapPin,
  Menu,
  Settings,
  Tag,
  Users,
} from "lucide-react";

const memberNavItems = [
  {
    title: "会员概览",
    href: "/dashboard/members",
    icon: Users,
    description: "会员总览和快速操作",
    exact: true,
  },
  {
    title: "会员列表",
    href: "/dashboard/members/management/list",
    icon: Users,
    description: "会员列表、详情和管理",
  },
  {
    title: "等级管理",
    href: "/dashboard/members/levels",
    icon: Crown,
    description: "会员等级设置和权益管理",
    children: [
      { title: "等级列表", href: "/dashboard/members/levels/list" },
      { title: "权益设置", href: "/dashboard/members/levels/benefits" },
      { title: "升级规则", href: "/dashboard/members/levels/rules" },
      { title: "升级历史", href: "/dashboard/members/levels/history" },
    ],
  },
  {
    title: "积分系统",
    href: "/dashboard/members/points",
    icon: Coins,
    description: "积分记录、规则和兑换管理",
    children: [
      { title: "积分记录", href: "/dashboard/members/points/records" },
      { title: "积分规则", href: "/dashboard/members/points/rules" },
      { title: "积分兑换", href: "/dashboard/members/points/exchanges" },
      { title: "兑换记录", href: "/dashboard/members/points/exchange-records" },
    ],
  },
  {
    title: "地址管理",
    href: "/dashboard/members/addresses",
    icon: MapPin,
    description: "会员地址和模板管理",
    children: [
      { title: "地址列表", href: "/dashboard/members/addresses/list" },
      { title: "地址模板", href: "/dashboard/members/addresses/templates" },
      { title: "使用记录", href: "/dashboard/members/addresses/usage" },
    ],
  },
  {
    title: "标签管理",
    href: "/dashboard/members/tags",
    icon: Tag,
    description: "会员标签分类和管理",
    children: [
      { title: "标签列表", href: "/dashboard/members/tags/list" },
      { title: "标签关系", href: "/dashboard/members/tags/relations" },
      { title: "标签统计", href: "/dashboard/members/tags/stats" },
      { title: "标签规则", href: "/dashboard/members/tags/rules" },
    ],
  },
  {
    title: "统计分析",
    href: "/dashboard/members/analytics",
    icon: BarChart3,
    description: "会员数据统计和分析",
    children: [
      { title: "会员概况", href: "/dashboard/members/analytics/overview" },
      { title: "等级分析", href: "/dashboard/members/analytics/levels" },
      { title: "积分分析", href: "/dashboard/members/analytics/points" },
      { title: "行为分析", href: "/dashboard/members/analytics/behavior" },
    ],
  },
  {
    title: "系统配置",
    href: "/dashboard/members/settings",
    icon: Settings,
    description: "会员系统配置和管理",
    children: [
      { title: "基础设置", href: "/dashboard/members/settings/general" },
      { title: "通知设置", href: "/dashboard/members/settings/notifications" },
      { title: "安全设置", href: "/dashboard/members/settings/security" },
      { title: "支付设置", href: "/dashboard/members/settings/payment" },
      { title: "高级设置", href: "/dashboard/members/settings/advanced" },
    ],
  },
  // {
  //   title: "系统设置",
  //   href: "/dashboard/members/settings",
  //   icon: Settings,
  //   description: "会员系统配置和设置",
  //   children: [
  //     { title: "基础设置", href: "/dashboard/members/settings/basic" },
  //     { title: "权限配置", href: "/dashboard/members/settings/permissions" },
  //     { title: "通知设置", href: "/dashboard/members/settings/notifications" },
  //   ],
  // },
];

interface MemberNavItemProps {
  item: typeof memberNavItems[0];
  pathname: string;
  level?: number;
}

function MemberNavItem({ item, pathname, level = 0 }: MemberNavItemProps) {
  const [isExpanded, setIsExpanded] = useState(
    pathname.startsWith(item.href) && (item.children?.length ?? 0) > 0,
  );

  const isActive = item.exact
    ? pathname === item.href
    : pathname.startsWith(item.href);

  const hasChildren = item.children && item.children.length > 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {hasChildren
          ? (
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "flex h-9 w-full justify-start gap-2 px-2 font-normal",
                isActive && "bg-accent text-accent-foreground",
                level > 0 && "ml-4 w-[calc(100%-1rem)]",
              )}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1 text-left">{item.title}</span>
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "rotate-90",
                )}
              />
            </Button>
          )
          : (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex h-9 w-full justify-start gap-2 px-2 font-normal",
                isActive && "bg-accent text-accent-foreground",
                level > 0 && "ml-4 w-[calc(100%-1rem)]",
              )}
            >
              <Link href={item.href}>
                <item.icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            </Button>
          )}
      </div>

      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-1">
          {item.children.map((child) => (
            <Button
              key={child.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex h-8 w-full justify-start px-2 font-normal text-sm",
                pathname === child.href && "bg-accent text-accent-foreground",
              )}
            >
              <Link href={child.href}>
                <span>{child.title}</span>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function MemberSidebar({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full w-64 flex-col border-r bg-muted/20">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="font-semibold">会员管理</h2>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {memberNavItems.map((item) => (
            <MemberNavItem
              key={item.href}
              item={item}
              pathname={pathname}
            />
          ))}
        </nav>
      </ScrollArea>
    </div>
  );
}

export default function MembersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <MemberSidebar pathname={pathname} />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <div className="flex h-14 items-center border-b px-4 lg:hidden">
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <div className="flex items-center gap-2 ml-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">会员管理</h2>
          </div>
        </div>

        <SheetContent side="left" className="w-64 p-0">
          <MemberSidebar pathname={pathname} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
