
import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Check, Loader2, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCRM } from "@/context/CRMContext";

// Enum for save status
type SaveStatus = "saved" | "saving" | "unsaved";

export function Scratchpad() {
  const { state, setScratchpadNotes, isSaving } = useCRM();
  const [notes, setNotes] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const lastSavedNotes = useRef<string>("");
  const saveTimeoutRef = useRef<number | null>(null);
  const { toast } = useToast();
  
  // Load notes from CRM state on component mount
  useEffect(() => {
    if (state.scratchpadNotes) {
      setNotes(state.scratchpadNotes);
      lastSavedNotes.current = state.scratchpadNotes;
    }
  }, [state.scratchpadNotes]);

  // Save notes with debounce when they change
  useEffect(() => {
    // If notes changed, mark as unsaved
    if (notes !== lastSavedNotes.current) {
      setSaveStatus("unsaved");
      
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout to save after 2 seconds of inactivity
      saveTimeoutRef.current = window.setTimeout(() => {
        setSaveStatus("saving");
        try {
          // Use the context's method to save notes
          setScratchpadNotes(notes);
          lastSavedNotes.current = notes;
          
          // We don't immediately set to "saved" since the actual saving 
          // is handled by the context's persistence mechanism
        } catch (error) {
          console.error("Failed to save scratchpad notes:", error);
          setSaveStatus("unsaved");
          toast({
            title: "Failed to save notes",
            description: "Your notes couldn't be saved. Please try again.",
            variant: "destructive",
          });
        }
      }, 2000);
    }
    
    // Cleanup function to clear timeout
    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [notes, toast, setScratchpadNotes]);

  // Update save status when isSaving changes
  useEffect(() => {
    if (notes === lastSavedNotes.current) {
      setSaveStatus(isSaving ? "saving" : "saved");
    }
  }, [isSaving, notes]);

  // Render the appropriate status icon
  const renderStatusIcon = () => {
    switch (saveStatus) {
      case "saved":
        return <Check className="h-4 w-4 text-green-500" />;
      case "saving":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "unsaved":
        return <Save className="h-4 w-4 text-amber-500" />;
    }
  };

  // Handler to toggle collapse state
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="hidden lg:block fixed right-0 top-20 z-10 transition-all duration-300 ease-in-out">
      {/* Scratchpad card with attached collapse control */}
      <Card 
        className={cn(
          "w-72 h-[calc(100vh-6rem)] shadow-lg transition-all duration-300 ease-in-out",
          isCollapsed ? "translate-x-[calc(100%-12px)]" : ""
        )}
      >
        {/* Collapse/expand button attached to the card */}
        <div 
          className={cn(
            "absolute top-1/2 -left-6 -translate-y-1/2 bg-primary/10 hover:bg-primary/20 rounded-l-md p-1 cursor-pointer shadow-md transition-colors",
            "border border-r-0 border-border"
          )}
          onClick={toggleCollapse}
          aria-label={isCollapsed ? "Expand scratchpad" : "Collapse scratchpad"}
          role="button"
          tabIndex={0}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-5 w-5 text-primary" />
          ) : (
            <ChevronRight className="h-5 w-5 text-primary" />
          )}
        </div>
        
        <div className="p-4 h-full flex flex-col">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Scratchpad</h3>
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              <span>{renderStatusIcon()}</span>
              <span>{saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Unsaved"}</span>
            </div>
          </div>
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
    </div>
  );
}
