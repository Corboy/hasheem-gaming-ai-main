import { Gamepad2 } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border bg-card py-12">
    <div className="container mx-auto px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="flex items-center gap-2">
          <Gamepad2 className="h-6 w-6 text-primary" />
          <span className="font-display text-lg font-bold tracking-wider text-primary">
            HASHEEM GAMING
          </span>
        </div>
        <p className="font-body text-sm text-muted-foreground">
          © 2026 HASHEEM GAMING. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
