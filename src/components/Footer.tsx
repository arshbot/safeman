
import { Github, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="py-6 px-4 mt-auto border-t">
      <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:flex-row md:gap-6">
        <p className="text-sm text-muted-foreground text-center">
          Made with <Heart className="inline h-4 w-4 text-red-500 fill-red-500" /> by a Mississippi boy
        </p>
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2"
          asChild
        >
          <a 
            href="https://github.com/arshbot/safeman" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <Github className="h-4 w-4" />
            <span>Star us on GitHub</span>
          </a>
        </Button>
      </div>
    </footer>
  );
}
