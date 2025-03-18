
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Spinner } from "./ui/spinner";
import { Trash2, Share2, Edit, Eye } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { ShareAccessModal } from "./ShareAccessModal";
import { Alert, AlertDescription } from "./ui/alert";

interface SharedAccess {
  id: string;
  shared_with_email: string;
  can_edit: boolean;
  created_at: string;
  is_active: boolean;
}

interface ManageAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ManageAccessModal({ open, onOpenChange }: ManageAccessModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sharedAccess, setSharedAccess] = useState<SharedAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load shared access data
  const loadSharedAccess = async () => {
    if (!user) {
      setError("You must be logged in to manage access");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('shared_access')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setSharedAccess(data || []);
    } catch (error: any) {
      console.error("Error loading shared access:", error);
      setError(error.message || "Failed to load shared access data");
      toast({
        title: "Failed to load shared access",
        description: error.message || "There was a problem loading your shared access data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && user) {
      loadSharedAccess();
    }
  }, [open, user]);

  // Toggle edit permissions
  const toggleEditPermission = async (id: string, currentValue: boolean) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ can_edit: !currentValue })
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => 
        prev.map(share => 
          share.id === id ? { ...share, can_edit: !currentValue } : share
        )
      );
      
      toast({
        title: "Permissions updated",
        description: `User now has ${!currentValue ? "edit" : "view-only"} access.`,
      });
    } catch (error: any) {
      console.error("Error updating permissions:", error);
      toast({
        title: "Failed to update permissions",
        description: error.message || "There was a problem updating the permissions.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  // Toggle active status
  const toggleActiveStatus = async (id: string, currentValue: boolean) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .update({ is_active: !currentValue })
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => 
        prev.map(share => 
          share.id === id ? { ...share, is_active: !currentValue } : share
        )
      );
      
      toast({
        title: "Access status updated",
        description: `Access for this user is now ${!currentValue ? "enabled" : "disabled"}.`,
      });
    } catch (error: any) {
      console.error("Error updating active status:", error);
      toast({
        title: "Failed to update access",
        description: error.message || "There was a problem updating the access status.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  // Delete shared access
  const deleteAccess = async (id: string) => {
    if (!user) return;
    
    setActiveShareId(id);
    try {
      const { error } = await supabase
        .from('shared_access')
        .delete()
        .eq('id', id)
        .eq('owner_id', user.id);
        
      if (error) throw error;
      
      setSharedAccess(prev => prev.filter(share => share.id !== id));
      
      toast({
        title: "Access removed",
        description: "The user's access has been completely removed.",
      });
    } catch (error: any) {
      console.error("Error deleting access:", error);
      toast({
        title: "Failed to remove access",
        description: error.message || "There was a problem removing the access.",
        variant: "destructive",
      });
    } finally {
      setActiveShareId(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Share2 className="mr-2 h-5 w-5" />
              Manage Shared Access
            </DialogTitle>
            <DialogDescription>
              Control who has access to your SAFEMAN data.
            </DialogDescription>
          </DialogHeader>
          
          {!user ? (
            <Alert variant="destructive">
              <AlertDescription>
                You need to be logged in to manage shared access.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="flex justify-end mb-4">
                <Button onClick={() => setShowShareModal(true)}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share with New User
                </Button>
              </div>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <Spinner />
                </div>
              ) : sharedAccess.length === 0 ? (
                <div className="text-center p-6 border rounded-lg bg-muted/30">
                  <p className="text-muted-foreground">
                    You haven't shared access with anyone yet.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {sharedAccess.map((share) => (
                    <div 
                      key={share.id}
                      className={`p-4 rounded-lg border ${!share.is_active ? 'bg-muted/20 opacity-70' : 'bg-card'}`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{share.shared_with_email}</p>
                          <div className="flex items-center mt-1 text-sm text-muted-foreground">
                            {share.can_edit ? (
                              <Edit className="mr-1 h-3 w-3" />
                            ) : (
                              <Eye className="mr-1 h-3 w-3" />
                            )}
                            {share.can_edit ? "Edit access" : "View-only access"}
                            
                            {!share.is_active && (
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
                              checked={share.can_edit}
                              onCheckedChange={() => toggleEditPermission(share.id, share.can_edit)}
                              disabled={activeShareId === share.id || !share.is_active}
                              aria-label="Toggle edit permissions"
                            />
                            <span className="text-xs text-muted-foreground">Edit</span>
                          </div>
                          
                          <Switch
                            checked={share.is_active}
                            onCheckedChange={() => toggleActiveStatus(share.id, share.is_active)}
                            disabled={activeShareId === share.id}
                            aria-label="Toggle access status"
                          />
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteAccess(share.id)}
                            disabled={activeShareId === share.id}
                            aria-label="Delete access"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            {activeShareId === share.id ? <Spinner /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <ShareAccessModal
        open={showShareModal}
        onOpenChange={(open) => {
          setShowShareModal(open);
          if (!open) {
            loadSharedAccess();
          }
        }}
      />
    </>
  );
}
