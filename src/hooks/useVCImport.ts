
import { useState } from "react";
import { useCRM } from "@/context/CRMContext";
import { findHeaderRow, mapColumns, parseVCsFromExcel } from "@/utils/excelParser";
import { formatNumberWithCommas } from "@/utils/formatters";
import { toast } from "sonner";
import { VC } from "@/types";

interface UseVCImportReturn {
  file: File | null;
  isLoading: boolean;
  error: string | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleImport: () => Promise<void>;
  resetForm: () => void;
}

export function useVCImport(onSuccess: () => void): UseVCImportReturn {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addVC, addRound, addVCToRound } = useCRM();

  const resetForm = () => {
    setFile(null);
    setError(null);
    setIsLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setError(null);
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
      const xlsx = await import('xlsx');
      const data = await file.arrayBuffer();
      const workbook = xlsx.read(data, { type: 'array' });
      
      const sheetName = workbook.SheetNames.find(name => 
        name.toLowerCase().includes('convertible ledger')
      );
      
      if (!sheetName) {
        throw new Error("Could not find 'Convertible Ledger' sheet in the Excel file");
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 'A' });
      
      if (jsonData.length === 0) {
        throw new Error("No data found in the Convertible Ledger sheet");
      }

      const headerRowIndex = findHeaderRow(jsonData);
      if (headerRowIndex === -1) {
        throw new Error("Could not find the header row in the spreadsheet");
      }

      const headerRow = jsonData[headerRowIndex] as any;
      const columnMap = mapColumns(headerRow);
      
      if (!columnMap.name || !columnMap.principal) {
        throw new Error("Could not identify the necessary columns in the spreadsheet");
      }
      
      const importedVCs = parseVCsFromExcel(jsonData, headerRowIndex, columnMap);
      
      if (importedVCs.length === 0) {
        throw new Error("No valid VC data found in the spreadsheet");
      }

      const vcsByValuation: Record<string, Array<Omit<VC, 'id'>>> = {};
      const noValuationVCs: Array<Omit<VC, 'id'>> = [];
      
      importedVCs.forEach(({ vc, valuationCap }) => {
        if (valuationCap) {
          const valuationKey = String(Math.round(valuationCap / 1000000) * 1000000);
          if (!vcsByValuation[valuationKey]) {
            vcsByValuation[valuationKey] = [];
          }
          vcsByValuation[valuationKey].push(vc);
        } else {
          noValuationVCs.push(vc);
        }
      });
      
      const createdRoundIds: Record<string, string> = {};
      let totalVCs = 0;
      let importedAmount = 0;
      
      // Create rounds and add VCs
      for (const [valuationStr, vcs] of Object.entries(vcsByValuation)) {
        const valuation = parseInt(valuationStr);
        if (isNaN(valuation)) continue;
        
        const roundName = `$${(valuation / 1000000).toFixed(1)}M Cap`;
        const totalRoundAmount = vcs.reduce((sum, vc) => sum + (vc.purchaseAmount || 0), 0);
        
        const roundId = addRound({
          name: roundName,
          valuationCap: valuation,
          targetAmount: Math.ceil(totalRoundAmount * 1.1),
        });
        
        createdRoundIds[valuationStr] = roundId;

        // Add VCs to the round
        for (const vc of vcs) {
          try {
            const vcId = addVC(vc); // The addVC function returns a string ID
            addVCToRound(vcId, roundId);
            totalVCs++;
            importedAmount += vc.purchaseAmount || 0;
          } catch (err) {
            console.error('Failed to create VC:', vc, err);
          }
        }
      }

      // Add VCs with no valuation
      for (const vc of noValuationVCs) {
        try {
          const vcId = addVC(vc); // Also capture the ID here, even if not using it directly
          totalVCs++;
          importedAmount += vc.purchaseAmount || 0;
        } catch (err) {
          console.error('Failed to create VC:', vc, err);
        }
      }
      
      const createdRoundsCount = Object.keys(createdRoundIds).length;
      const roundsMessage = createdRoundsCount > 0 
        ? `, created ${createdRoundsCount} rounds based on valuation caps`
        : "";
        
      toast.success(`Successfully imported ${totalVCs} VCs with total commitment of $${formatNumberWithCommas(importedAmount)}${roundsMessage}`);
      
      onSuccess();
      resetForm();
      
    } catch (err) {
      console.error("Import error:", err);
      setError(err instanceof Error ? err.message : "Failed to import data from Excel file");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    file,
    isLoading,
    error,
    handleFileChange,
    handleImport,
    resetForm
  };
}
