
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export function Scratchpad() {
  const [notes, setNotes] = useState<string>("");

  return (
    <Card className="hidden lg:block fixed right-4 top-20 w-72 h-[calc(100vh-6rem)] shadow-lg">
      <div className="p-4 h-full flex flex-col">
        <h3 className="text-lg font-semibold mb-2">Scratchpad</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Quick notes and thoughts
        </p>
        <Textarea 
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Type your notes here..."
          className="flex-grow resize-none"
        />
      </div>
    </Card>
  );
}
