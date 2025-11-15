import React from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function OrgSignInButton() {
  return (
    <div className="fixed left-4 bottom-4 z-50">
      {/* Render the Link as the Button child so we don't nest an <a> inside an <a> */}
      <Button asChild size="sm" className="whitespace-nowrap">
        <Link href="/projects">Are you an Orgainstion? Sign In</Link>
      </Button>
    </div>
  );
}
