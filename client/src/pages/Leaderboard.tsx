import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

const rankColors: Record<number, string> = {
  1: "#FFD700", // gold
  2: "#C0C0C0", // silver
  3: "#CD7F32", // bronze
};

export default function Leaderboard() {
  const leaderboardData = [
  { id: 1, name: "Ariana", avatar: "https://i.pravatar.cc/40?img=1", xp: 820, tTrust: 12.4 },
  { id: 2, name: "Liam", avatar: "https://i.pravatar.cc/40?img=4", xp: 640, tTrust: 4.2 },
  { id: 3, name: "Promise", avatar: "https://i.pravatar.cc/40?img=2", xp: 500, tTrust: 9.1 },
  { id: 4, name: "Daniel", avatar: "https://i.pravatar.cc/40?img=3", xp: 420, tTrust: 7.8 },
  { id: 5, name: "Emma", avatar: "https://i.pravatar.cc/40?img=5", xp: 780, tTrust: 11.2 },
  { id: 6, name: "Noah", avatar: "https://i.pravatar.cc/40?img=6", xp: 670, tTrust: 6.5 },
  { id: 7, name: "Olivia", avatar: "https://i.pravatar.cc/40?img=7", xp: 590, tTrust: 8.3 },
  { id: 8, name: "Ethan", avatar: "https://i.pravatar.cc/40?img=8", xp: 550, tTrust: 5.7 },
  { id: 9, name: "Sophia", avatar: "https://i.pravatar.cc/40?img=9", xp: 510, tTrust: 7.1 },
  { id: 10, name: "Mason", avatar: "https://i.pravatar.cc/40?img=10", xp: 480, tTrust: 4.9 },
  { id: 11, name: "Isabella", avatar: "https://i.pravatar.cc/40?img=11", xp: 460, tTrust: 6.3 },
  { id: 12, name: "Logan", avatar: "https://i.pravatar.cc/40?img=12", xp: 450, tTrust: 5.1 },
  { id: 13, name: "Mia", avatar: "https://i.pravatar.cc/40?img=13", xp: 430, tTrust: 6.0 },
  { id: 14, name: "Lucas", avatar: "https://i.pravatar.cc/40?img=14", xp: 410, tTrust: 4.8 },
  { id: 15, name: "Charlotte", avatar: "https://i.pravatar.cc/40?img=15", xp: 400, tTrust: 5.9 },
  { id: 16, name: "Alexander", avatar: "https://i.pravatar.cc/40?img=16", xp: 390, tTrust: 4.5 },
  { id: 17, name: "Amelia", avatar: "https://i.pravatar.cc/40?img=17", xp: 380, tTrust: 5.0 },
  { id: 18, name: "James", avatar: "https://i.pravatar.cc/40?img=18", xp: 370, tTrust: 4.2 },
  { id: 19, name: "Harper", avatar: "https://i.pravatar.cc/40?img=19", xp: 360, tTrust: 4.7 },
  { id: 20, name: "Benjamin", avatar: "https://i.pravatar.cc/40?img=20", xp: 350, tTrust: 4.0 },
  { id: 21, name: "Evelyn", avatar: "https://i.pravatar.cc/40?img=21", xp: 340, tTrust: 4.6 },
  { id: 22, name: "Daniela", avatar: "https://i.pravatar.cc/40?img=22", xp: 330, tTrust: 3.8 },
  { id: 23, name: "Sebastian", avatar: "https://i.pravatar.cc/40?img=23", xp: 320, tTrust: 4.1 },
  { id: 24, name: "Ella", avatar: "https://i.pravatar.cc/40?img=24", xp: 310, tTrust: 3.9 },
  { id: 25, name: "Jacob", avatar: "https://i.pravatar.cc/40?img=25", xp: 300, tTrust: 3.5 },
  { id: 26, name: "Avery", avatar: "https://i.pravatar.cc/40?img=26", xp: 290, tTrust: 3.7 },
  { id: 27, name: "Matthew", avatar: "https://i.pravatar.cc/40?img=27", xp: 280, tTrust: 3.4 },
  { id: 28, name: "Scarlett", avatar: "https://i.pravatar.cc/40?img=28", xp: 270, tTrust: 3.2 },
  { id: 29, name: "David", avatar: "https://i.pravatar.cc/40?img=29", xp: 260, tTrust: 3.0 },
  { id: 30, name: "Victoria", avatar: "https://i.pravatar.cc/40?img=30", xp: 250, tTrust: 2.8 },
  { id: 31, name: "Joseph", avatar: "https://i.pravatar.cc/40?img=31", xp: 240, tTrust: 2.7 },
  { id: 32, name: "Grace", avatar: "https://i.pravatar.cc/40?img=32", xp: 230, tTrust: 2.6 },
  { id: 33, name: "Andrew", avatar: "https://i.pravatar.cc/40?img=33", xp: 220, tTrust: 2.5 },
  { id: 34, name: "Hannah", avatar: "https://i.pravatar.cc/40?img=34", xp: 210, tTrust: 2.4 },
  { id: 35, name: "Joshua", avatar: "https://i.pravatar.cc/40?img=35", xp: 200, tTrust: 2.3 },
  { id: 36, name: "Lily", avatar: "https://i.pravatar.cc/40?img=36", xp: 190, tTrust: 2.2 },
  { id: 37, name: "Christopher", avatar: "https://i.pravatar.cc/40?img=37", xp: 180, tTrust: 2.1 },
  { id: 38, name: "Aria", avatar: "https://i.pravatar.cc/40?img=38", xp: 170, tTrust: 2.0 },
  { id: 39, name: "Ryan", avatar: "https://i.pravatar.cc/40?img=39", xp: 160, tTrust: 1.9 },
  { id: 40, name: "Zoey", avatar: "https://i.pravatar.cc/40?img=40", xp: 150, tTrust: 1.8 },
  { id: 41, name: "Nathan", avatar: "https://i.pravatar.cc/40?img=41", xp: 140, tTrust: 1.7 },
  { id: 42, name: "Mila", avatar: "https://i.pravatar.cc/40?img=42", xp: 130, tTrust: 1.6 },
  { id: 43, name: "Anthony", avatar: "https://i.pravatar.cc/40?img=43", xp: 120, tTrust: 1.5 },
  { id: 44, name: "Ella-Rose", avatar: "https://i.pravatar.cc/40?img=44", xp: 110, tTrust: 1.4 },
  { id: 45, name: "Christian", avatar: "https://i.pravatar.cc/40?img=45", xp: 100, tTrust: 1.3 },
  { id: 46, name: "Madison", avatar: "https://i.pravatar.cc/40?img=46", xp: 90, tTrust: 1.2 },
  { id: 47, name: "Jonathan", avatar: "https://i.pravatar.cc/40?img=47", xp: 80, tTrust: 1.1 },
  { id: 48, name: "Sofia", avatar: "https://i.pravatar.cc/40?img=48", xp: 70, tTrust: 1.0 },
  { id: 49, name: "Brayden", avatar: "https://i.pravatar.cc/40?img=49", xp: 60, tTrust: 0.9 },
  { id: 50, name: "Chloe", avatar: "https://i.pravatar.cc/40?img=50", xp: 50, tTrust: 0.8 },
];


  const userRank = {
    rank: 3,
    name: "Promise",
    avatar: "https://i.pravatar.cc/40?img=2",
    xp: 500,
    tTrust: 9.1,
  };

  return (
    <div className="min-h-screen bg-background overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}


        {/* Leaderboard Table */}
        <Card className="p-6 space-y-4">
          <CardHeader>
            <CardTitle className="text-center text-lg font-semibold">Top Performers</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {leaderboardData.map((user, index) => {
              const rank = index + 1;
              const medalColor = rankColors[rank] || "#374151"; // fallback gray
              const isTop3 = rank <= 3;

              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between w-full p-4 rounded-lg border border-gray-200 bg-card hover:shadow-md transition-shadow"
                >
                  {/* LEFT: Rank + Avatar + Name */}
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        isTop3 ? "text-black" : "text-white"
                      }`}
                      style={{ backgroundColor: medalColor }}
                    >
                      {rank}
                    </div>

                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-10 h-10 rounded-full border border-gray-300"
                    />

                    <div className="font-semibold">{user.name}</div>
                  </div>

                  {/* RIGHT: XP + tTrust */}
                  <div className="flex items-center gap-6 font-semibold text-sm md:text-base text-primary">
                    <div>⚡ {user.xp}</div>
                    <div>🔰 {user.tTrust}</div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* USER RANKING */}
        <Card className="mt-8 p-6 border border-gray-300 bg-primary/10">
          <h2 className="text-xl font-semibold mb-4">Your Ranking</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  userRank.rank <= 3 ? "text-black" : "text-white"
                }`}
                style={{
                  backgroundColor: rankColors[userRank.rank] || "#374151",
                }}
              >
                {userRank.rank}
              </div>

              <img
                src={userRank.avatar}
                alt={userRank.name}
                className="w-10 h-10 rounded-full border border-gray-300"
              />

              <div className="font-semibold">{userRank.name}</div>
            </div>

            <div className="flex items-center gap-6 font-semibold text-sm md:text-base text-primary">
              <div>⚡ {userRank.xp}</div>
              <div>🔰 {userRank.tTrust}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
