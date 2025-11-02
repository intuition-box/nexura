import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function OrgSignInButton() {
  return (
    <div className="fixed left-4 bottom-4 z-50">
      <Link href="/projects">
        <a>
          <Button size="sm" className="whitespace-nowrap">
            Are you an Orgainstion? Sign In
          </Button>
        </a>
      </Link>
    </div>
  );
}
