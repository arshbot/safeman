
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Layers, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AddVCModal } from "./AddVCModal";
import { AddRoundModal } from "./AddRoundModal";
import { ImportVCsModal } from "./ImportVCsModal";
import { useState } from "react";

interface PageHeaderProps {
  onAddVC: () => void;
}

export function PageHeader({ onAddVC }: PageHeaderProps) {
  const [isAddVCModalOpen, setIsAddVCModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 flex justify-between items-center"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight">SAFEMAN</h1>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="font-bold">SAFE</span> Allocation & Financing Equity <span className="font-bold">Man</span>ager
        </p>
      </div>
      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={() => setIsImportModalOpen(true)}
          className="gap-1"
        >
          <FileSpreadsheet className="h-4 w-4" />
          Import from Carta
        </Button>
        <AddVCModal
          open={isAddVCModalOpen}
          onOpenChange={setIsAddVCModalOpen}
          roundId={undefined}
          trigger={
            <Button variant="outline" onClick={() => {
              setIsAddVCModalOpen(true);
              onAddVC();
            }}>
              <Users className="mr-2 h-4 w-4" />
              Add VC
            </Button>
          }
        />
        <AddRoundModal
          trigger={
            <Button>
              <Layers className="mr-2 h-4 w-4" />
              Add Round
            </Button>
          }
        />
        
        <ImportVCsModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
        />
      </div>
    </motion.div>
  );
}
