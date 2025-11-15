import { 
  Sidebar, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import { 
  BookOpen, 
  Compass, 
  Users, 
  Trophy,
  Zap, 
  Calendar, 
  Target, 
} from "lucide-react";
import { Link, useLocation } from "wouter";

const mainNavItems = [
  {
    title: "Learn",
    subtitle: "",
    icon: BookOpen,
    href: "/learn",
    activeClass: "nav-learn-active"
  },
  {
    title: "Explore",
    icon: Compass,
    href: "/",
    activeClass: "nav-explore-active"
  },
  {
    title: "Referrals",
    icon: Users,
    href: "/referrals",
    activeClass: "nav-referrals-active"
  },
  {
    title: "Quests",
    icon: Zap,
    href: "/quests",
    activeClass: "nav-quests-active"
  },
  {
    title: "Campaigns",
    icon: Calendar,
    href: "/campaigns",
    activeClass: "nav-campaigns-active"
  },
  {
    title: "Ecosystem Dapps",
    icon: Target,
    href: "/ecosystem-dapps",
    activeClass: "nav-ecosystem-dapps-active"
  }
  ,
  {
    title: "Leaderboard",
    icon: Trophy,
    href: "/leaderboard",
    activeClass: "nav-leaderboard-active"
  }
];


export default function NexuraSidebar() {
  const [location] = useLocation();

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarContent className="bg-background">
        {/* Logo */}
        <div className="p-6 border-b border-border/40">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">QF</span>
            </div>
            <div className="flex flex-col font-bold text-lg text-foreground">
              <span>NEX</span>
              <span className="ml-4">URA</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location === item.href || (item.href === "/" && (location === "/" || location === "/discover"));
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      className={isActive ? item.activeClass : ""}
                    >
                      <Link
                        href={item.href}
                        className="w-full"
                        data-testid={`nav-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <item.icon className="w-4 h-4" />
                        <div className="flex flex-col items-start">
                          <span className="text-base font-medium">{item.title}</span>
                          {item.subtitle && (
                            <span className="text-xs text-muted-foreground">{item.subtitle}</span>
                          )}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>
    </Sidebar>
  );
}