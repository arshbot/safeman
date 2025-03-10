
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileSpreadsheet, Upload, AlertCircle } from "lucide-react";
import { useCRM } from "@/context/CRMContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VC } from "@/types";

interface ImportVCsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportVCsModal({ open, onOpenChange }: ImportVCsModalProps) {
  const { addVC } = useCRM();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setIsLoading(false);
  };

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import");
      return;
    }

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // We'll use the xlsx library to parse the Excel file
      const xlsx = await import('xlsx');
      
      // Read the file as an ArrayBuffer
      const data = await file.arrayBuffer();
      
      // Parse the Excel file
      const workbook = xlsx.read(data, { type: 'array' });
      
      // Look for the "Convertible Ledger" sheet
      const sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes('convertible ledger')
      );
      
      if (!sheetName) {
        throw new Error("Could not find 'Convertible Ledger' sheet in the Excel file. Please make sure you've exported the correct report from Carta.");
      }
      
      // Get the worksheet
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON - raw data
      const jsonData = xlsx.utils.sheet_to_json(worksheet);
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the Convertible Ledger sheet");
      }

      console.log("Parsed Excel data:", jsonData);
      
      // Find the row with column headers (usually row 4, index 3)
      // Then find the actual data rows (starting from row 5, index 4)
      const actualDataRows = jsonData.slice(3); // Skip header rows
      
      if (actualDataRows.length === 0) {
        throw new Error("Could not find data rows in the spreadsheet");
      }
      
      // Extract VCs data by looking at the correct fields in each row
      const importedVCs: Omit<VC, 'id'>[] = [];
      
      for (let i = 1; i < actualDataRows.length; i++) { // Start from 1 to skip the header row
        const row = actualDataRows[i];
        
        // Extract data by using the row properties
        // For Carta exports, we need to check multiple possible column names
        const name = findValueInRow(row, ['__EMPTY_1', 'Stakeholder Name']);
        const email = findValueInRow(row, ['__EMPTY_2', 'Stakeholder Email']);
        const principalRaw = findValueInRow(row, ['__EMPTY_3', 'Principal']);
        
        // Check if we have the essential data (name and principal amount)
        if (name && principalRaw) {
          const principal = typeof principalRaw === 'number' 
            ? principalRaw 
            : parseFloat(String(principalRaw).replace(/[^\d.-]/g, ''));
          
          if (!isNaN(principal) && principal > 0) {
            importedVCs.push({
              name,
              email: email || undefined,
              status: 'finalized' as const,
              purchaseAmount: principal,
              notes: `Imported from Carta on ${new Date().toLocaleDateString()}`
            });
          }
        }
      }
      
      if (importedVCs.length === 0) {
        throw new Error("No valid VC data found in the spreadsheet. Make sure the file contains columns for Stakeholder Name, Stakeholder Email, and Principal.");
      }
      
      // Add VCs to the CRM
      const addedCount = importedVCs.length;
      let importedAmount = 0;
      
      importedVCs.forEach(vc => {
        addVC(vc);
        importedAmount += vc.purchaseAmount || 0;
      });
      
      // Show success message
      toast.success(`Successfully imported ${addedCount} VCs with total commitment of $${formatAmount(importedAmount)}`);
      
      // Close the modal and reset form
      onOpenChange(false);
      resetForm();
      
    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import data from Excel file");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to find values in complex row objects
  const findValueInRow = (row: any, possibleKeys: string[]): any => {
    for (const key of possibleKeys) {
      if (row[key] !== undefined) {
        return row[key];
      }
    }
    return null;
  };
  
  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US', { 
      maximumFractionDigits: 0 
    }).format(amount);
  };

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
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              We'll extract VC data from the "Convertible Ledger" sheet.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport} 
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
      </DialogContent>
    </Dialog>
  );
}

