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
import { parseExcelValue, formatNumberWithCommas } from "@/utils/formatters";

interface ImportVCsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportVCsModal({ open, onOpenChange }: ImportVCsModalProps) {
  const { addVC, addRound, addVCToRound } = useCRM();
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
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 'A' });
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the Convertible Ledger sheet");
      }

      console.log("Parsed Excel data:", jsonData);
      
      // Find the row with column headers by looking for "Stakeholder Name" or similar
      let headerRowIndex = -1;
      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        const values = Object.values(row);
        
        // Look for strings that might indicate this is the header row
        const isHeaderRow = values.some(val => 
          typeof val === 'string' && 
          (val.includes("Stakeholder Name") || val.includes("stakeholder name"))
        );
        
        if (isHeaderRow) {
          headerRowIndex = i;
          break;
        }
      }
      
      if (headerRowIndex === -1) {
        throw new Error("Could not find the header row in the spreadsheet");
      }

      // Get the header row to determine column positions
      const headerRow = jsonData[headerRowIndex] as any;
      console.log("Header row:", headerRow);
      
      // Map column letters to their meanings
      const columnMap: {[key: string]: string} = {};
      Object.entries(headerRow).forEach(([colKey, value]) => {
        if (typeof value === 'string') {
          const valueLower = value.toLowerCase();
          if (valueLower.includes("stakeholder name")) columnMap.name = colKey;
          else if (valueLower.includes("stakeholder email")) columnMap.email = colKey;
          else if (valueLower.includes("principal")) columnMap.principal = colKey;
          else if (valueLower.includes("valuation")) columnMap.valuation = colKey;
          // Look for column R specifically for valuation cap
          else if (colKey === 'R') columnMap.valuationCap = colKey;
        }
      });
      
      console.log("Column mapping:", columnMap);
      
      if (!columnMap.name || !columnMap.principal) {
        throw new Error("Could not identify the necessary columns in the spreadsheet. Make sure it contains Stakeholder Name and Principal columns.");
      }
      
      // Ensure we have valuation data
      if (!columnMap.valuationCap && !columnMap.valuation) {
        console.warn("Valuation cap information not found in column R or any column with 'valuation' in the name");
      }
      
      // Extract VCs data from all rows after the header
      const importedVCs: Array<{
        vc: Omit<VC, 'id'>;
        valuationCap: number | null;
      }> = [];
      
      for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        
        // Skip rows without essential data
        if (!row[columnMap.name] || !row[columnMap.principal]) continue;
        
        const name = row[columnMap.name];
        const email = columnMap.email ? row[columnMap.email] : undefined;
        const principalRaw = row[columnMap.principal];
        
        // Get valuation cap from column R or any column identified as containing valuation info
        const valuationCapKey = columnMap.valuationCap || columnMap.valuation;
        let valuationCap = null;
        
        if (valuationCapKey && row[valuationCapKey]) {
          const valuationRaw = row[valuationCapKey];
          valuationCap = parseExcelValue(valuationRaw);
        }
        
        // Parse the principal amount - handle different formats
        const principal = parseExcelValue(principalRaw);
        
        if (!isNaN(principal) && principal > 0) {
          importedVCs.push({
            vc: {
              name,
              email: email || undefined,
              status: 'finalized' as const,
              purchaseAmount: principal,
              notes: `Imported from Carta on ${new Date().toLocaleDateString()}`
            },
            valuationCap
          });
        }
      }
      
      if (importedVCs.length === 0) {
        throw new Error("No valid VC data found in the spreadsheet. Make sure the file contains columns for Stakeholder Name, Stakeholder Email, and Principal.");
      }
      
      console.log("VCs to import:", importedVCs);
      
      // Group VCs by valuation cap
      const vcsByValuation: Record<string, Array<Omit<VC, 'id'>>> = {};
      const noValuationVCs: Array<Omit<VC, 'id'>> = [];
      
      importedVCs.forEach(({ vc, valuationCap }) => {
        if (valuationCap) {
          // Use the valuation as a key, rounded to nearest million for better grouping
          const valuationKey = String(Math.round(valuationCap / 1000000) * 1000000);
          if (!vcsByValuation[valuationKey]) {
            vcsByValuation[valuationKey] = [];
          }
          vcsByValuation[valuationKey].push(vc);
        } else {
          noValuationVCs.push(vc);
        }
      });
      
      // Create rounds for each valuation group and add VCs
      const createdRoundIds: Record<string, string> = {};
      let totalVCs = 0;
      let importedAmount = 0;
      
      // First create rounds for each valuation
      Object.entries(vcsByValuation).forEach(([valuationStr, vcs]) => {
        const valuation = parseInt(valuationStr);
        if (isNaN(valuation)) return;
        
        const roundName = `$${(valuation / 1000000).toFixed(1)}M Cap`;
        
        // Calculate total amount committed to this round
        const totalRoundAmount = vcs.reduce((sum, vc) => sum + (vc.purchaseAmount || 0), 0);
        
        // Create the round and store its ID
        const roundId = addRound({
          name: roundName,
          valuationCap: valuation,
          targetAmount: Math.ceil(totalRoundAmount * 1.1), // Target amount slightly higher than committed
        });
        
        createdRoundIds[valuationStr] = roundId;
      });
      
      // Then add VCs to each round
      Object.entries(vcsByValuation).forEach(([valuationStr, vcs]) => {
        const roundId = createdRoundIds[valuationStr];
        if (!roundId) return;
        
        vcs.forEach(vc => {
          // First add the VC to get its ID
          const vcId = addVC(vc);
          
          // Then add the VC to its round
          addVCToRound(vcId, roundId);
          
          totalVCs++;
          importedAmount += vc.purchaseAmount || 0;
        });
      });
      
      // Add VCs with no valuation to unsorted
      noValuationVCs.forEach(vc => {
        const vcId = addVC(vc);
        totalVCs++;
        importedAmount += vc.purchaseAmount || 0;
      });
      
      // Show success message
      const createdRoundsCount = Object.keys(createdRoundIds).length;
      const roundsMessage = createdRoundsCount > 0 
        ? `, created ${createdRoundsCount} rounds based on valuation caps`
        : "";
        
      toast.success(`Successfully imported ${totalVCs} VCs with total commitment of $${formatNumberWithCommas(importedAmount)}${roundsMessage}`);
      
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
              We'll extract VC data from the "Convertible Ledger" sheet and create rounds based on valuation caps found in column R.
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
