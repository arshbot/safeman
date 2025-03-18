
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Layers, LogOut, User, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AddVCModal } from "./AddVCModal";
import { AddRoundModal } from "./AddRoundModal";
import { ImportVCsModal } from "./ImportVCsModal";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useIsMobile } from "@/hooks/use-mobile";

interface PageHeaderProps {
  onAddVC: () => void;
}

export function PageHeader({ onAddVC }: PageHeaderProps) {
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 space-y-4 lg:space-y-0 lg:flex lg:justify-between lg:items-center"
    >
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">SAFEMAN</h1>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-bold">SAFE</span> Allocation & Financing Equity <span className="font-bold">Man</span>ager
        </p>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <Button 
          variant="outline" 
          onClick={() => setIsImportModalOpen(true)}
          className="flex-1 sm:flex-none"
          size={isMobile ? "sm" : "default"}
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Import from Carta</span>
          <span className="sm:hidden">Import</span>
        </Button>
        <AddVCModal
          open={isAddVCModalOpen}
          onOpenChange={setIsAddVCModalOpen}
          roundId={undefined}
          trigger={
            <Button 
              variant="outline"
              className="flex-1 sm:flex-none"
              size={isMobile ? "sm" : "default"}
              onClick={() => {
                setIsAddVCModalOpen(true);
                onAddVC();
              }}
            >
              <Users className="h-4 w-4 mr-2" />
              Add VC
            </Button>
          }
        />
        <AddRoundModal
          trigger={
            <Button 
              className="flex-1 sm:flex-none" 
              size={isMobile ? "sm" : "default"}
            >
              <Layers className="h-4 w-4 mr-2" />
              Add Round
            </Button>
          }
        />
        
        <ImportVCsModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
        />
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                  <AvatarFallback>{user.displayName?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <User className="mr-2 h-4 w-4" />
                <span>{user.displayName || user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </motion.div>
  );
}
