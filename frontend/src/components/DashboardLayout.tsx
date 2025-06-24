"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/hooks/use-i18n";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Users,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { GlobalSearch } from "@/components/GlobalSearch";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: Array<{ name: string; href: string }>;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(
    new Set(["商品管理"]),
  );
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const pathname = usePathname();

  const navigation = [
    { name: t("nav.dashboard"), href: "/dashboard", icon: LayoutDashboard },
    {
      name: "商品管理",
      href: "/dashboard/products",
      icon: Package,
      children: [
        { name: "商品列表", href: "/dashboard/products/management" },
        { name: "添加商品", href: "/dashboard/products/management/add" },
        { name: "商品分类", href: "/dashboard/products/categories" },
        { name: "品牌管理", href: "/dashboard/products/brands" },
        { name: "商品类型", href: "/dashboard/products/types" },
      ],
    },
    { name: "订单管理", href: "/dashboard/orders", icon: ShoppingCart },
    {
      name: "营销管理",
      href: "/dashboard/marketing",
      icon: Zap,
      children: [
        { name: "会员管理", href: "/dashboard/marketing/members" },
        { name: "优惠券管理", href: "/dashboard/marketing/coupons" },
        { name: "积分管理", href: "/dashboard/marketing/points" },
        { name: "商品推荐", href: "/dashboard/marketing/recommendations" },
        { name: "广告管理", href: "/dashboard/marketing/advertisements" },
        { name: "热门管理", href: "/dashboard/marketing/trending" },
      ],
    },
    { name: t("nav.users"), href: "/dashboard/users", icon: Users },
    { name: "CRUD 演示", href: "/dashboard/crud-demo", icon: Zap },
    { name: "I18n Demo", href: "/dashboard/i18n-demo", icon: Languages },
    { name: t("nav.settings"), href: "/dashboard/settings", icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const toggleMenu = (menuName: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuName)) {
      newExpanded.delete(menuName);
    } else {
      newExpanded.add(menuName);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuExpanded = (menuName: string) => expandedMenus.has(menuName);

  const isActiveMenu = (item: NavigationItem) => {
    if (item.children) {
      return item.children.some((child) => pathname === child.href) ||
        pathname === item.href;
    }
    return pathname === item.href;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Platform
          </h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = isActiveMenu(item);
              const isExpanded = isMenuExpanded(item.name);

              return (
                <div key={item.name}>
                  {/* Menu item with children */}
                  {item.children
                    ? (
                      <>
                        {/* Main menu item (clickable to expand/collapse) */}
                        <div
                          className={cn(
                            "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer",
                            isActive
                              ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
                          )}
                          onClick={() => toggleMenu(item.name)}
                        >
                          <item.icon
                            className={cn(
                              "mr-3 h-5 w-5 flex-shrink-0",
                              isActive
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                            )}
                          />
                          <span className="flex-1">{item.name}</span>
                          <span className="ml-auto">
                            {isExpanded
                              ? <ChevronDown className="h-4 w-4" />
                              : <ChevronRight className="h-4 w-4" />}
                          </span>
                        </div>

                        {/* Submenu items */}
                        {isExpanded && (
                          <div className="ml-6 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const isChildActive = pathname === child.href;
                              return (
                                <Link
                                  key={child.name}
                                  href={child.href}
                                  className={cn(
                                    "block px-3 py-2 text-sm rounded-lg transition-colors",
                                    isChildActive
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200",
                                  )}
                                  onClick={() => setSidebarOpen(false)}
                                >
                                  {child.name}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )
                    : (
                      /* Regular menu item (no children) - Link to the page */
                      <Link
                        href={item.href}
                        className={cn(
                          "group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                          isActive
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700",
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon
                          className={cn(
                            "mr-3 h-5 w-5 flex-shrink-0",
                            isActive
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                          )}
                        />
                        {item.name}
                      </Link>
                    )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top navigation */}
        <header className="sticky top-0 z-20 bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* 全局搜索组件 */}
              <div className="hidden sm:flex items-center ml-4">
                <GlobalSearch placeholder={t("common.search") + "..."} />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <LanguageSwitch />
              <ThemeToggle />
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full">
                </span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.avatar}
                        alt={user?.name || user?.email}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {user?.name?.[0] || user?.email?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("nav.logout")}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
