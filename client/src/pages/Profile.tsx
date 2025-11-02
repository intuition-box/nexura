import { useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Edit2, Calendar } from "lucide-react";
import { Link } from "wouter";

// Import constants from shared schema (would be imported in real app)
const XP_PER_LEVEL = 20;
const TIER_LEVEL_RANGES = {
  enchanter: { min: 0, max: 5 },
  illuminated: { min: 5, max: 15 },
  conscious: { min: 15, max: 30 },
  oracle: { min: 30, max: 50 },
  templar: { min: 50, max: Infinity }
};

const TIER_COLORS = {
  enchanter: "#8b5cf6", // purple
  illuminated: "#10b981", // green
  conscious: "#3b82f6", // blue
  oracle: "#8b1538", // wine red
  templar: "#ef4444" // red
};

export default function Profile() {
  const { isConnected } = useWallet();

  // If user is not connected, do not show demo/profile mock data
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background overflow-auto p-6" data-testid="profile-page">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold">My Profile</h1>
          <div className="mt-6 text-sm text-muted-foreground">Connect your wallet to view your profile and stats.</div>
        </div>
      </div>
    );
  }

  // Mock user data - when connected, app would fetch real user data from API
  const [userData] = useState({
    username: "0xD524...9779",
    displayName: "0xD524...9779",
    xp: 175,
    questsCompleted: 12,
    level: 8,
    joinedDate: "Nov 2024",
    tier: "enchanter" as keyof typeof TIER_COLORS
  });

  const getTierFromLevel = (level: number): keyof typeof TIER_COLORS => {
    if (level >= TIER_LEVEL_RANGES.templar.min) return "templar";
    if (level >= TIER_LEVEL_RANGES.oracle.min) return "oracle";
    if (level >= TIER_LEVEL_RANGES.conscious.min) return "conscious";
    if (level >= TIER_LEVEL_RANGES.illuminated.min) return "illuminated";
    return "enchanter";
  };

  const getXpForNextLevel = () => {
    const nextLevelXp = (userData.level + 1) * XP_PER_LEVEL;
    const currentLevelXp = userData.level * XP_PER_LEVEL;
    const progressXp = userData.xp - currentLevelXp;
    const neededXp = nextLevelXp - userData.xp;
    return { progressXp, neededXp, totalForNext: XP_PER_LEVEL };
  };

  const currentTier = getTierFromLevel(userData.level);
  const tierDisplayName = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const { progressXp, neededXp, totalForNext } = getXpForNextLevel();
  const progressPercentage = (progressXp / totalForNext) * 100;

  return (
    <div className="min-h-screen bg-background overflow-auto p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Edit Button */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Link href="/profile/edit">
            <Button data-testid="button-edit-profile">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Profile Header Card */}
        <Card className="relative overflow-hidden">
          {/* Background gradient */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(135deg, ${TIER_COLORS[currentTier]}, ${TIER_COLORS[currentTier]}80)`
            }}
          />
          
          <CardContent className="relative p-8">
            <div className="flex items-start space-x-6">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-green-500 via-blue-500 to-red-500 text-white">
                    {userData.level}
                  </AvatarFallback>
                </Avatar>
                {/* Level indicator */}
                <div 
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-background bg-gradient-to-br from-blue-500 to-red-500"
                >
                  {userData.level}
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{userData.displayName}</h2>
                  <Badge 
                    className="mt-2 text-white border-0"
                    style={{ backgroundColor: TIER_COLORS[currentTier] }}
                  >
                    {tierDisplayName}
                  </Badge>
                </div>

                {/* XP Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">XP Progress</span>
                    <span className="text-sm font-medium">{userData.xp} / {(userData.level + 1) * XP_PER_LEVEL} XP</span>
                  </div>
                  <Progress 
                    value={progressPercentage} 
                    className="h-3"
                    style={{
                      backgroundColor: TIER_COLORS[currentTier] + "20"
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    {neededXp} XP to next level
                  </div>
                </div>

                {/* Joined Date */}
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {userData.joinedDate}
                </div>
              </div>

              {/* User ID */}
              <div className="text-right">
                <div className="text-sm text-muted-foreground">User ID</div>
                <div className="text-sm font-mono">{userData.username}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stat-quests">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.questsCompleted}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-xp">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.xp}</div>
              <p className="text-xs text-muted-foreground mt-1">XP earned</p>
            </CardContent>
          </Card>


          <Card data-testid="stat-total-ttrust">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total tTRUST</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">6.0</div>
              <p className="text-xs text-muted-foreground mt-1">tTRUST earned</p>
            </CardContent>
          </Card>
        </div>


      </div>
    </div>
  );
}