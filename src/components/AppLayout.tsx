import { ReactNode } from 'react';
import { NotificationBell } from '@/components/NotificationBell';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardCheck,
  Target,
  Users,
  Globe,
  LogOut,
  Settings,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { Language, languageNames } from '@/i18n/translations';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const navItems = [
  { titleKey: 'dashboard' as const, url: '/', icon: LayoutDashboard },
  { titleKey: 'frameworkExplorer' as const, url: '/framework', icon: BookOpen },
  { titleKey: 'selfAssessment' as const, url: '/assessment', icon: ClipboardCheck },
  { titleKey: 'developmentPlan' as const, url: '/plan', icon: Target },
  { titleKey: 'team' as const, url: '/team', icon: Users },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const { t, language, setLanguage } = useLanguage();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar className="border-r border-sidebar-border">
          <div className="p-4 border-b border-sidebar-border">
            <h1 className="text-lg font-bold text-sidebar-primary-foreground tracking-tight">
              Expanscience
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Management Framework</p>
          </div>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-sidebar-foreground/50 text-xs uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.titleKey}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === '/'}
                          className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                          activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{t(item.titleKey)}</span>
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <div className="mt-auto border-t border-sidebar-border">
            <div className="p-4 space-y-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/settings"
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <Settings className="h-4 w-4 shrink-0" />
                      <span>{language === 'fr' ? 'Paramètres' : 'Settings'}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              {user && (
                <p className="text-xs text-sidebar-foreground/60 truncate px-1">
                  {user.user_metadata?.full_name || user.email}
                </p>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                    <Globe className="h-4 w-4" />
                    <span>{languageNames[language]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={lang === language ? 'bg-accent' : ''}
                    >
                      {languageNames[lang]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </Button>
            </div>
          </div>
        </Sidebar>

        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-14 flex items-center justify-between border-b border-border px-4 bg-card">
            <SidebarTrigger />
            <NotificationBell />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
