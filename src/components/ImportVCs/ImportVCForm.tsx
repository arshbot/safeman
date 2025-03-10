
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload } from "lucide-react";
import { DialogFooter } from "@/components/ui/dialog";

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
          <Input
            id="excelFile"
            type="file"
            accept=".xlsx,.xls"
            onChange={onFileChange}
            disabled={isLoading}
          />
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
