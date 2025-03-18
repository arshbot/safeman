
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "./ui/spinner";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  canEdit: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface ShareAccessModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareAccessModal({ open, onOpenChange }: ShareAccessModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      canEdit: false,
    },
  });

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      // Check if this email is already shared with
      const { data: existingShares, error: checkError } = await supabase
        .from('shared_access')
        .select('id')
        .eq('owner_id', user.id)
        .eq('shared_with_email', values.email);
        
      if (checkError) throw checkError;
      
      if (existingShares && existingShares.length > 0) {
        // Update existing share
        const { error: updateError } = await supabase
          .from('shared_access')
          .update({
            can_edit: values.canEdit,
            is_active: true,
          })
          .eq('id', existingShares[0].id);
          
        if (updateError) throw updateError;
      } else {
        // Create new share
        const { error: insertError } = await supabase
          .from('shared_access')
          .insert({
            owner_id: user.id,
            shared_with_email: values.email,
            can_edit: values.canEdit,
          });
          
        if (insertError) throw insertError;
      }
      
      toast({
        title: "Access granted",
        description: `${values.email} now has ${values.canEdit ? "edit" : "view-only"} access to your SAFEMAN data.`,
      });
      
      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error sharing access:", error);
      toast({
        title: "Failed to share access",
        description: error.message || "There was a problem granting access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Access</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to grant access to your SAFEMAN data.
            No email will be sent - they will need to sign in with this email to view your data.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input placeholder="colleague@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="canEdit"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Allow editing</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      If checked, this user will be able to make changes to your data.
                      Otherwise, they will have view-only access.
                    </p>
                  </div>
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Spinner className="mr-2" /> : null}
                Share Access
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
