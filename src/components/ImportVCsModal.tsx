
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileSpreadsheet } from "lucide-react";
import { ImportVCForm } from "./ImportVCs/ImportVCForm";
import { useVCImport } from "@/hooks/useVCImport";

interface ImportVCsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportVCsModal({ open, onOpenChange }: ImportVCsModalProps) {
  const {
    file,
    isLoading,
    error,
    handleFileChange,
    handleImport,
    resetForm
  } = useVCImport(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (!newOpen) resetForm();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Import VCs from Carta
          </DialogTitle>
          <DialogDescription>
            Upload the Cap Table export from Carta to import your VCs.
            <div className="mt-2 text-xs text-muted-foreground">
              <p className="font-medium">How to export from Carta:</p>
              <ol className="list-decimal list-inside ml-2 mt-1 space-y-1">
                <li>Go to Essentials &gt; View Cap Table</li>
                <li>Click Export &gt; Select Cap Table Report Options</li>
                <li>Select all options under Worksheet tabs</li>
                <li>Download the Excel file</li>
                <li>Upload the file below</li>
              </ol>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <ImportVCForm
          file={file}
          isLoading={isLoading}
          error={error}
          onFileChange={handleFileChange}
          onImport={handleImport}
          onCancel={() => {
            resetForm();
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
