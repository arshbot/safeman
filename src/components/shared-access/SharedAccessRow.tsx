
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Trash2, Edit, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface SharedAccessRowProps {
  id: string;
  email: string;
  canEdit: boolean;
  isActive: boolean;
  activeShareId: string | null;
  onToggleEdit: (id: string, currentValue: boolean) => Promise<void>;
  onToggleActive: (id: string, currentValue: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function SharedAccessRow({
  id,
  email,
  canEdit,
  isActive,
  activeShareId,
  onToggleEdit,
  onToggleActive,
  onDelete
}: SharedAccessRowProps) {
  const isProcessing = activeShareId === id;

  return (
    <div 
      className={`p-4 rounded-lg border ${!isActive ? 'bg-muted/20 opacity-70' : 'bg-card'}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <p className="font-medium">{email}</p>
          <div className="flex items-center mt-1 text-sm text-muted-foreground">
            {canEdit ? (
              <Edit className="mr-1 h-3 w-3" />
            ) : (
              <Eye className="mr-1 h-3 w-3" />
            )}
            {canEdit ? "Edit access" : "View-only access"}
            
            {!isActive && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-muted text-xs">
                Disabled
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <span className="text-xs text-muted-foreground">View</span>
            <Switch
              checked={canEdit}
              onCheckedChange={() => onToggleEdit(id, canEdit)}
              disabled={isProcessing || !isActive}
              aria-label="Toggle edit permissions"
            />
            <span className="text-xs text-muted-foreground">Edit</span>
          </div>
          
          <Switch
            checked={isActive}
            onCheckedChange={() => onToggleActive(id, isActive)}
            disabled={isProcessing}
            aria-label="Toggle access status"
          />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(id)}
            disabled={isProcessing}
            aria-label="Delete access"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            {isProcessing ? <Spinner className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
