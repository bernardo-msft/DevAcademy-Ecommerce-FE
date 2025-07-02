import { Mountain } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground py-6">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 px-4 md:px-6">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <Mountain className="h-6 w-6" />
          <span>MyStore</span>
        </div>
        <p className="text-center text-sm">
          &copy; {new Date().getFullYear()} Ecommerce. All rights reserved.
        </p>
      </div>
    </footer>
  );  
}