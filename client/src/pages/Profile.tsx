import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "lucide-react";
import { Link } from "wouter";

// Tier colors for badge display
// const TIER_COLORS = {
//   enchanter: "#8b5cf6",
//   illuminated: "#10b981",
//   conscious: "#3b82f6",
//   oracle: "#8b1538",
//   templar: "#ef4444"
// };

// User Analytics Data
const userAnalytics = {
  xp: 175,
  level: 8,
  badges: 3,
  questsCompleted: 12,
  // rewardsEarned: 42,
  tTrustEarned: 6.0
};

// Level achievements
const levelAchievementsInitial = [
  { level: 5, xpRequired: 500, color: "#8b5cf6", unlocked: true },
  { level: 10, xpRequired: 1000, color: "#6b7280", unlocked: false },
  { level: 15, xpRequired: 1500, color: "#6b7280", unlocked: false },
  { level: 20, xpRequired: 2000, color: "#6b7280", unlocked: false },
  { level: 25, xpRequired: 2500, color: "#6b7280", unlocked: false },
  { level: 30, xpRequired: 3000, color: "#8b1538", unlocked: false },
  { level: 35, xpRequired: 3500, color: "#6b7280", unlocked: false },
  { level: 40, xpRequired: 4000, color: "#6b7280", unlocked: false },
  { level: 45, xpRequired: 4500, color: "#6b7280", unlocked: false },
  { level: 50, xpRequired: 5000, color: "#6b7280", unlocked: false }
];


export default function Profile() {
  // Mock profile data
  const [userData] = useState({
    username: "0xD524...9779",
    displayName: "0xD524...9779",
    joinedDate: "Nov 2024",
    // tier: "enchanter" as keyof typeof TIER_COLORS
  });

  const [userXp, setUserXp] = useState(100); 
  const [levelAchievements, setLevelAchievements] = useState(levelAchievementsInitial);

  // const tierDisplayName = userData.tier.charAt(0).toUpperCase() + userData.tier.slice(1);

  const nextLevelToMint = levelAchievements.find(
    (l) => userXp >= l.xpRequired && !l.unlocked
  );

  const handleMint = (level: number) => {
    setLevelAchievements((prev) =>
      prev.map((l) => (l.level === level ? { ...l, unlocked: true } : l))
    );

    const completedLevel = levelAchievements.find((l) => l.level === level);
    if (completedLevel) {
      const excessXp = userXp - completedLevel.xpRequired;
      setUserXp(excessXp);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-auto p-6">
      <div className="max-w-5xl mx-auto space-y-10">

        {/* ---------------------------- PROFILE HEADER ---------------------------- */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
          <Link href="/profile/edit">
            <Button>Edit Profile</Button>
          </Link>
        </div>

        <Card className="relative overflow-hidden">
          <CardContent className="p-8">
            <div className="flex items-start space-x-6">
              <Avatar className="w-32 h-32 border-4 border-background">
                <AvatarImage src="" />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-green-500 via-blue-500 to-red-500 text-white">
                  {userData.displayName.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold">{userData.displayName}</h2>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  Joined {userData.joinedDate}
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-muted-foreground">User ID</div>
                <div className="text-sm font-mono">{userData.username}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ---------------------------- USER ANALYTICS ---------------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-4">User Analytics</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total XP</p><p className="text-2xl font-bold">{userAnalytics.xp}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Level</p><p className="text-2xl font-bold">{userAnalytics.level}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Badges</p><p className="text-2xl font-bold">{userAnalytics.badges}</p></CardContent></Card>
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Quests Completed</p><p className="text-2xl font-bold">{userAnalytics.questsCompleted}</p></CardContent></Card>
            {/* <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Rewards Earned</p><p className="text-2xl font-bold">{userAnalytics.rewardsEarned}</p></CardContent></Card> */}
            <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">tTRUST Earned</p><p className="text-2xl font-bold">{userAnalytics.tTrustEarned}</p></CardContent></Card>
          </div>
        </section>

        {/* ---------------------------- ACHIEVEMENTS / LEVELS ---------------------------- */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Achievements</h2>

<div className="flex flex-col gap-6">
  {levelAchievements.map((achievement) => {
    const progress = Math.min((userXp / achievement.xpRequired) * 100, 100);
    const isUnlocked = achievement.unlocked;
    const canMint = nextLevelToMint?.level === achievement.level;

    return (
      <Card
        key={achievement.level}
        className={`${isUnlocked ? "border-primary/50 bg-primary/5" : ""}`}
      >
        <CardContent className="p-6 relative">
          {canMint && (
            <button
              onClick={() => handleMint(achievement.level)}
              className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-green-600"
            >
              Mint
            </button>
          )}

          <div className="flex items-center justify-between mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
              style={{ backgroundColor: isUnlocked ? achievement.color : "#6b7280" }}
            >
              {achievement.level}
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">{Math.floor(progress)}%</p>
              {isUnlocked && <Badge className="bg-green-500 mt-1">Unlocked</Badge>}
            </div>
          </div>

          <h3 className="font-bold text-lg mb-1">Level {achievement.level}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Reach Level {achievement.level} by earning {achievement.xpRequired} XP
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span>
                {Math.min(userXp, achievement.xpRequired)} / {achievement.xpRequired}
              </span>
            </div>

            <Progress
              value={progress}
              className="h-2"
              style={{
                "--progress-background": isUnlocked ? achievement.color : "#6b7280",
              } as React.CSSProperties}
            />
          </div>
        </CardContent>
      </Card>
    );
  })}
</div>
        </section>

      </div>
    </div>
  );
}
