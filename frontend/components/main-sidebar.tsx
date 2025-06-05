'use client';

import { useSidebar } from './sidebar-provider';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  FolderOpen,
  Menu,
  PanelLeft,
  Shield,
  Users,
  AlertTriangle,
  X,
  Settings,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useState, useEffect } from 'react';
import Image from 'next/image';

const navItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: BarChart3,
  },
  {
    title: 'Cases',
    href: '/cases',
    icon: FolderOpen,
    badge: 3,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: FileText,
    badge: 5,
  },
  {
    title: 'Victims/Witnesses',
    href: '/victims',
    icon: Users,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
  },
];

export function MainSidebar() {
  const { expanded, toggleSidebar, isMobile, mobileOpen, setMobileOpen } = useSidebar();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    console.log('[MainSidebar] Initiating logout');
    logout();
    console.log('[MainSidebar] Tokens cleared, navigating to /login');
    router.push('/login');
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Get user initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!mounted) return null;

  if (isMobile) {
    return (
      <>
        <Button
          variant="outline"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden bg-background/80 backdrop-blur-sm border shadow-sm"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0 w-[280px]">
            <div className="flex flex-col h-full bg-background">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center justify-center w-full">
                  <div className="relative">
                    <Image
                      src="/human_logo.png"
                      alt="Human Rights Monitor Logo"
                      width={48}
                      height={48}
                      className="object-contain"
                    />
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)} className="absolute right-4">
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4 border-b">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-primary">
                    <AvatarImage src="/placeholder.svg?height=40&width=40" />
                    <AvatarFallback>{user ? getInitials(user.full_name) : 'JD'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user ? user.full_name : 'Guest'}</div>
                    <div className="text-xs text-muted-foreground">{user ? user.role : 'Not logged in'}</div>
                  </div>
                </div>
              </div>

              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group',
                      pathname === item.href
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'hover:bg-muted text-foreground',
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto bg-accent text-accent-foreground" variant="secondary">
                        {item.badge}
                      </Badge>
                    )}
                    {pathname === item.href && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-300 rounded-l-full" />
                    )}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t space-y-2">
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Help & Support</span>
                </Button>
                <Button variant="destructive" size="sm" className="w-full justify-start gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency</span>
                </Button>
              </div>

              <div className="p-4 border-t flex justify-between items-center">
                <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'h-screen bg-background border-r flex flex-col transition-all duration-300 ease-in-out relative z-10',
          expanded ? 'w-64' : 'w-[70px]',
        )}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center justify-center w-full">
            <div className="relative flex-shrink-0">
              <Image
                src="/human_logo.png"
                alt="Human Rights Monitor Logo"
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-muted-foreground hover:text-foreground absolute right-4"
          >
            <PanelLeft className={cn('h-5 w-5 transition-transform', !expanded && 'rotate-180')} />
          </Button>
        </div>

        {expanded && (
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-primary">
                <AvatarImage src="/placeholder.svg?height=40&width=40" />
                <AvatarFallback>{user ? getInitials(user.full_name) : 'JD'}</AvatarFallback>
              </Avatar>
              <div className="overflow-hidden">
                <div className="font-medium truncate">{user ? user.full_name : 'Guest'}</div>
                <div className="text-xs text-muted-foreground truncate">{user ? user.role : 'Not logged in'}</div>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <Tooltip key={item.href}>
              <TooltipTrigger asChild>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md transition-colors relative group',
                    pathname === item.href
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'hover:bg-muted text-foreground',
                    !expanded && 'justify-center',
                  )}
                >
                  <item.icon className={cn('h-5 w-5', !expanded && 'flex-shrink-0')} />
                  {expanded && (
                    <>
                      <span className="truncate">{item.title}</span>
                      {item.badge && (
                        <Badge className="ml-auto bg-accent text-accent-foreground" variant="secondary">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                  {!expanded && item.badge && (
                    <Badge
                      className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
                      variant="secondary"
                    >
                      {item.badge}
                    </Badge>
                  )}
                  {pathname === item.href && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary-300 rounded-l-full" />
                  )}
                </Link>
              </TooltipTrigger>
              {!expanded && (
                <TooltipContent side="right" className="font-medium">
                  {item.title}
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        <div className={cn('border-t', expanded ? 'p-4 space-y-2' : 'p-2 space-y-2')}>
          {expanded ? (
            <>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start gap-2">
                <HelpCircle className="h-4 w-4" />
                <span>Help & Support</span>
              </Button>
              <Button variant="destructive" size="sm" className="w-full justify-start gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span>Emergency</span>
              </Button>
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full">
                    <Settings className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" className="w-full">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Help & Support</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" size="icon" className="w-full">
                    <AlertTriangle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Emergency</TooltipContent>
              </Tooltip>
            </>
          )}
        </div>

        <div
          className={cn('p-4 border-t flex', expanded ? 'justify-between items-center' : 'flex-col gap-2 items-center')}
        >
          {expanded ? (
            <>
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
              <ThemeToggle />
            </>
          ) : (
            <>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
              <ThemeToggle />
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}