import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import NotFound from "@/pages/not-found";
import Discover from "@/pages/Discover";
import Rewards from "@/pages/Rewards";
import Learn from "@/pages/Learn";
import Campaigns from "@/pages/Campaigns";
import Quests from "@/pages/Quests";
import EcosystemDapps from "@/pages/EcosystemDapps";
import Referrals from "@/pages/Referrals";
import QuestEnvironment from "@/pages/QuestEnvironment";
import CampaignEnvironment from "@/pages/CampaignEnvironment";
import Profile from "@/pages/Profile";
import EditProfile from "@/pages/EditProfile";
import Achievements from "@/pages/Achievements";
import Tiers from "@/pages/Tiers";
import Leaderboard from "@/pages/Leaderboard";
import Projects from "@/pages/Projects";
import NexuraSidebar from "@/components/QuestflowSidebar";
import ProfileBar from "@/components/ProfileBar";
import { WalletProvider } from "@/lib/wallet";
import { AuthProvider } from "@/lib/auth";
import OrgSignInButton from "@/components/OrgSignInButton";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Discover} />
      <Route path="/discover" component={Discover} />
  {/* NEXURA pages */}
      <Route path="/learn" component={Learn} />
      <Route path="/quests" component={Quests} />
      <Route path="/campaigns" component={Campaigns} />
      <Route path="/ecosystem-dapps" component={EcosystemDapps} />
      <Route path="/referrals" component={Referrals} />
      <Route path="/quest/:questId" component={QuestEnvironment} />
      <Route path="/campaign/:campaignId" component={CampaignEnvironment} />
      {/* Profile pages */}
      <Route path="/profile" component={Profile} />
      <Route path="/profile/edit" component={EditProfile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/tiers" component={Tiers} />
  <Route path="/leaderboard" component={Leaderboard} />
    {/* Developer pages */}
    <Route path="/projects" component={Projects} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // NEXURA-style sidebar configuration
  const sidebarStyle = {
    "--sidebar-width": "18rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>
        <AuthProvider>
        <TooltipProvider>
          <SidebarProvider style={sidebarStyle as React.CSSProperties}>
            <div className="flex h-screen w-full bg-background">
              <NexuraSidebar />
              <div className="flex flex-col flex-1">
                {/* Top Header with Profile Bar */}
                <header className="flex items-center justify-between p-4 app-header">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ProfileBar />
                </header>
                {/* Main Content with Better Scrolling */}
                <main className="flex-1 overflow-y-auto main-shell">
                  <div className="container max-w-7xl mx-auto">
                    <div className="card-glass p-6">
                      <Router />
                    </div>
                  </div>
                </main>
              </div>
              <OrgSignInButton />
            </div>
          </SidebarProvider>
          <Toaster />
        </TooltipProvider>
        </AuthProvider>
      </WalletProvider>
    </QueryClientProvider>
  );
}

export default App;
