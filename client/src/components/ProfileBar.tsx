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
import { Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface ProfileBarProps {
  userId?: string;
}

import { TIER_ORDER, TIER_DISPLAY, TIER_COLORS, type Tier } from "@shared/schema";
import { useWallet } from "@/hooks/use-wallet";
import SignUpPopup from "@/components/SignUpPopup";
import { useAuth } from "@/lib/auth";

export default function ProfileBar({ userId = "user-123" }: ProfileBarProps) {
  const { address, isConnected: walletConnected, connectWallet, disconnect } = useWallet();
  const { user, signOut } = useAuth();
  const connected = Boolean(user) || walletConnected;

  // Use authenticated server user when available. If there's only a connected wallet
  // (no authenticated session), show minimal wallet info and do NOT surface XP/level/tier.
  // Display name should only come from the server profile. Do not show
  // wallet-derived usernames in profile areas.
  const displayName = user?.username ?? null;

  const hasServerProfile = Boolean(user);
  const currentTier = hasServerProfile ? (user.tier as Tier) : undefined;
  const tierNumber = currentTier ? TIER_ORDER[currentTier] : undefined;
  const tierDisplayName = currentTier ? TIER_DISPLAY[currentTier] : undefined;

  // Hexagonal tier icon component
  const HexagonTierIcon = () => (
    <Link href="/tiers">
      <div className="flex items-center gap-2 cursor-pointer hover-elevate p-2 rounded-lg">
        <div className="relative w-8 h-8">
            <svg viewBox="0 0 32 32" className="w-full h-full">
            <path
              d="M8 4h16l8 12-8 12H8L0 16z"
              fill={currentTier ? TIER_COLORS[currentTier] : "transparent"}
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

  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    // clear server session
    signOut();
    // clear local wallet storage and disconnect injected provider if available
    try {
      localStorage.removeItem("nexura:wallet");
    } catch (e) {
      /* ignore */
    }
    try {
      disconnect?.();
    } catch (e) {
      /* ignore */
    }
    // Attempt to wipe all non-httpOnly cookies on the client. httpOnly cookies
    // (like the session cookie) are cleared server-side by the /auth/logout call
    // in signOut(). This is best-effort for any remaining client-set cookies.
    try {
      if (typeof document !== "undefined") {
  const cookies = document.cookie.split("; ").map((c) => c.split("=")[0]);
        cookies.forEach((name) => {
          try {
            document.cookie = `${name}=; Max-Age=0; path=/;`; // expire
          } catch (e) {
            /* ignore */
          }
        });
      }
    } catch (e) {
      /* ignore */
    }
    // SPA navigate to root and show toast
    setLocation("/");
    toast({ title: "Signed out", description: "Your session was cleared." });
  };

  return (
    <div className="flex items-center gap-4">
      {hasServerProfile ? (
        <>
          {/* Tier Display - only when we have a server profile */}
          <HexagonTierIcon />

          {/* Profile Dropdown - only for server-backed profiles */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="relative">
                <Button variant="ghost" className="relative h-16 w-16 rounded-full p-0" data-testid="profile-dropdown">
                  <Avatar className="h-16 w-16 border-2 border-border">
                    <AvatarImage src={user.avatar ?? ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                    <div className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full z-0"></div>
                  </Avatar>
                </Button>
                <div className="absolute top-1 right-1 bg-background/90 border border-border rounded px-1.5 py-0.5 text-xs font-bold text-foreground z-10" data-testid="text-level">
                  Lv{user.level}
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
      ) : walletConnected ? (
        // Wallet-only connected: show a small dropdown with Profile and Log Out
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="px-3 py-2">
              {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Profile"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 p-2">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="w-full cursor-pointer p-2 text-base">
                <User className="mr-3 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer p-2 text-base">
              <LogOut className="mr-3 h-4 w-4" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <SignUpPopup mode="user" />
      )}
    </div>
  );
}