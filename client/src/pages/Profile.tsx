import { useMemo } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Edit2, Calendar } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { XP_PER_LEVEL, TIER_COLORS } from "@shared/schema";
import { Progress } from "@/components/ui/progress";

export default function Profile() {
  const { user, loading } = useAuth();

  // Only show profile content when server-provided `user` exists. Do not
  // display any mock or wallet-derived data here.
  if (loading) {
    return (
      <div className="min-h-screen bg-background overflow-auto p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If there's no server-backed `user` yet, render the profile page with
  // safe default values (level 1, 0 XP, no roles). This keeps the UI stable
  // and shows placeholders until the DB-backed profile exists.
  const defaultUser = {
    username: "guest",
    displayName: "",
    avatar: "",
    level: 1,
    xp: 0,
    questsCompleted: 0,
    ttrust: 0,
    dateJoined: "",
  } as const;

  const userData = user ?? (defaultUser as any);

  // Use server-provided profile fields only (fall back to defaults above)
  const currentTier = useMemo(() => {
    const lvl: number = userData.level ?? 1;
    if (lvl >= 50) return "templar";
    if (lvl >= 30) return "oracle";
    if (lvl >= 15) return "conscious";
    if (lvl >= 5) return "illuminated";
    return "enchanter";
  }, [userData.level]);

  const tierDisplayName = currentTier.charAt(0).toUpperCase() + currentTier.slice(1);
  const nextLevelXp = (userData.level + 1) * XP_PER_LEVEL;
  const currentLevelXp = userData.level * XP_PER_LEVEL;
  const progressXp = (userData.xp ?? 0) - currentLevelXp;
  const neededXp = Math.max(0, nextLevelXp - (userData.xp ?? 0));
  const progressPercentage = (progressXp / XP_PER_LEVEL) * 100;

  return (
    <div className="min-h-screen bg-background overflow-auto p-6" data-testid="profile-page">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Link href="/profile/edit">
            <Button data-testid="button-edit-profile">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </Link>
        </div>

        <Card className="relative overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: `linear-gradient(135deg, ${TIER_COLORS[currentTier]}, ${TIER_COLORS[currentTier]}80)`
            }}
          />

          <CardContent className="relative p-8">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <Avatar className="w-32 h-32 border-4 border-background">
                  <AvatarImage src={userData.avatar ?? ""} />
                  <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-green-500 via-blue-500 to-red-500 text-white">
                    {userData.level ?? ""}
                  </AvatarFallback>
                </Avatar>
                <div 
                  className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center text-white text-base font-bold border-2 border-background bg-gradient-to-br from-blue-500 to-red-500"
                >
                  {userData.level}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{userData.displayName ?? userData.username}</h2>
                  <Badge 
                    className="mt-2 text-white border-0"
                    style={{ backgroundColor: TIER_COLORS[currentTier] }}
                  >
                    {tierDisplayName}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">XP Progress</span>
                    <span className="text-sm font-medium">{userData.xp ?? 0} / {nextLevelXp} XP</span>
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

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {userData.dateJoined ?? ""}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">User ID</div>
                <div className="text-sm font-mono">{userData.username}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card data-testid="stat-quests">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Quests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.questsCompleted ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Completed</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-xp">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total XP</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.xp ?? 0}</div>
              <p className="text-xs text-muted-foreground mt-1">XP earned</p>
            </CardContent>
          </Card>

          <Card data-testid="stat-total-ttrust">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total tTRUST</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userData.ttrust ?? ""}</div>
              <p className="text-xs text-muted-foreground mt-1">tTRUST earned</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}