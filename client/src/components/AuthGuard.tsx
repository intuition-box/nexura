import React from "react";
import { useAccount } from "wagmi";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  if (!isConnected) return null;
  return <>{children}</>;
}
