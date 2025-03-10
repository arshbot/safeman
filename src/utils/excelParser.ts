
import { VC } from "@/types";
import { parseExcelValue } from "./formatters";

interface ParsedVC {
  vc: Omit<VC, 'id'>;
  valuationCap: number | null;
}

interface ColumnMap {
  [key: string]: string;
}

export function findHeaderRow(jsonData: any[]): number {
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    const values = Object.values(row);
    
    const isHeaderRow = values.some(val => 
      typeof val === 'string' && 
      (val.includes("Stakeholder Name") || val.includes("stakeholder name"))
    );
    
    if (isHeaderRow) {
      return i;
    }
  }
  return -1;
}

export function mapColumns(headerRow: any): ColumnMap {
  const columnMap: ColumnMap = {};
  Object.entries(headerRow).forEach(([colKey, value]) => {
    if (typeof value === 'string') {
      const valueLower = value.toLowerCase();
      if (valueLower.includes("stakeholder name")) columnMap.name = colKey;
      else if (valueLower.includes("stakeholder email")) columnMap.email = colKey;
      else if (valueLower.includes("principal")) columnMap.principal = colKey;
      else if (valueLower.includes("valuation")) columnMap.valuation = colKey;
      else if (colKey === 'R') columnMap.valuationCap = colKey;
    }
  });
  return columnMap;
}

export function parseVCsFromExcel(jsonData: any[], headerRowIndex: number, columnMap: ColumnMap): ParsedVC[] {
  const importedVCs: ParsedVC[] = [];
  
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i] as any;
    
    if (!row[columnMap.name] || !row[columnMap.principal]) continue;
    
    const name = row[columnMap.name];
    const email = columnMap.email ? row[columnMap.email] : undefined;
    const principalRaw = row[columnMap.principal];
    
    const valuationCapKey = columnMap.valuationCap || columnMap.valuation;
    let valuationCap = null;
    
    if (valuationCapKey && row[valuationCapKey]) {
      const valuationRaw = row[valuationCapKey];
      valuationCap = parseExcelValue(valuationRaw);
    }
    
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
  
  return importedVCs;
}
