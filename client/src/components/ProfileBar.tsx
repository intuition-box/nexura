import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Trophy, LogOut } from "lucide-react";
import { Link } from "wouter";

interface ProfileBarProps {
  userId?: string;
}

import { TIER_ORDER, TIER_DISPLAY, TIER_COLORS, type Tier } from "@shared/schema";
import { useWallet } from "@/hooks/use-wallet";
import { useAccount } from "wagmi";
import { mainnet } from "wagmi/chains";

export default function ProfileBar({ userId = "user-123" }: ProfileBarProps) {
  // prefer wagmi account when available; fallback to heuristic
  const { address, isConnected: wagmiConnected } = useAccount();
  const { isConnected, connectInjected } = useWallet();
  const connected = wagmiConnected || isConnected;

  // Mock user data - only used when connected. In real app this would come from API/auth
  const [userData] = useState({
    username: "0xD524...9779",
    xp: 175,
    questsCompleted: 12,
    level: 8,  // User's current level (separate from tier)
    tier: "illuminated" as Tier  // User's current tier
  });

  // Get tier information from user's current tier (not level)
  const currentTier = userData.tier;
  const tierNumber = TIER_ORDER[currentTier];
  const tierDisplayName = TIER_DISPLAY[currentTier];

  // Hexagonal tier icon component
  const HexagonTierIcon = () => (
    <Link href="/tiers">
      <div className="flex items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg">
        <div className="relative w-8 h-8">
          <svg viewBox="0 0 32 32" className="w-full h-full">
            <path
              d="M8 4h16l8 12-8 12H8L0 16z"
              fill={TIER_COLORS[currentTier]}
              className="drop-shadow-sm"
            />
            <text 
              x="16" 
              y="20" 
              textAnchor="middle" 
              className="fill-white text-xs font-bold"
              fontSize="10"
            >
              {tierNumber}
            </text>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground font-medium">Tier</span>
          <span className="text-sm font-bold text-foreground">{tierDisplayName}</span>
        </div>
      </div>
    </Link>
  );

  const handleLogout = () => {
    // Placeholder for logout logic
    console.log("Logging out...");
  };

  return (
    <div className="flex items-center gap-4">
  {connected ? (
        <>
          {/* Tier Display */}
          <HexagonTierIcon />
          
          {/* Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button variant="ghost" className="relative h-16 w-16 rounded-full p-0" data-testid="profile-dropdown">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                    {/* Online indicator - moved to bottom left to avoid blocking level */}
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full z-0"></div>
                  </Avatar>
                </Button>
                {/* Level Badge - Outside Avatar for clear visibility */}
                <div className="absolute top-1 right-1 bg-background/90 border border-border rounded px-1.5 py-0.5 text-xs font-bold text-foreground z-10" data-testid="text-level">
                  Lv{userData.level}
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 p-2" align="end" data-testid="profile-dropdown-menu">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="w-full cursor-pointer p-3 text-base">
                  <User className="mr-3 h-5 w-5" />
                  <span>My Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/achievements" className="w-full cursor-pointer p-3 text-base">
                  <Trophy className="mr-3 h-5 w-5" />
                  <span>Achievements</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-3 text-base">
                <LogOut className="mr-3 h-5 w-5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
        ) : (
          <Button
            variant="ghost"
            onClick={() => {
              // Immediately attempt injected wallet connection (MetaMask, etc.)
              connectInjected();
            }}
          >
            Connect Wallet
          </Button>
        )}
    </div>
  );
}