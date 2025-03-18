
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";

interface EmptyAccessStateProps {
  onShareClick: () => void;
}

export function EmptyAccessState({ onShareClick }: EmptyAccessStateProps) {
  return (
    <div className="text-center p-6 border rounded-lg bg-muted/30">
      <p className="text-muted-foreground">
        You haven't shared access with anyone yet.
      </p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onShareClick}
      >
        <Share2 className="mr-2 h-4 w-4" />
        Share Now
      </Button>
    </div>
  );
}
