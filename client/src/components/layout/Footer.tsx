import { Link } from "react-router-dom";

import { WashlyLogo } from "@/components/WashlyLogo";

export function Footer() {
  return (
    <footer className="border-t border-border/80 bg-card/50 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <WashlyLogo size="xs" />
          <span className="text-lg font-bold tracking-tight text-primary">
            Washly
          </span>
        </Link>
        <div className="text-sm text-muted-foreground sm:text-right">
          <p>© {new Date().getFullYear()} Washly. All rights reserved.</p>
          <p className="mt-1 text-xs">
            Built with React, Node.js, Express & MongoDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
