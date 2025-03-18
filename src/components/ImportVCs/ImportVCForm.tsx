
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, FileInput } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";

interface ImportVCFormProps {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImport: () => void;
  onCancel: () => void;
}

export function ImportVCForm({
  file,
  isLoading,
  error,
  onFileChange,
  onImport,
  onCancel
}: ImportVCFormProps) {
  const [isFileInputActive, setIsFileInputActive] = useState(false);
  
  const handleFileInputClick = () => {
    setIsFileInputActive(true);
    // Reset the active state after a delay
    setTimeout(() => {
      setIsFileInputActive(false);
    }, 1000);
  };

  return (
    <>
      <div className="space-y-4 py-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid w-full max-w-sm items-center gap-1.5">
          <Label htmlFor="excelFile">Excel File</Label>
          <div className="relative">
            <Input
              id="excelFile"
              type="file"
              accept=".xlsx,.xls"
              onChange={onFileChange}
              onClick={handleFileInputClick}
              disabled={isLoading}
              className={`pr-10 ${isFileInputActive ? 'bg-muted border-primary' : ''}`}
            />
            {isFileInputActive && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Spinner className="w-5 h-5" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            We'll extract VC data from the "Convertible Ledger" sheet and create rounds based on valuation caps found in column R.
          </p>
        </div>
      </div>
      
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          onClick={onImport} 
          disabled={!file || isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Importing...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              Import
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}
