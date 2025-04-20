import * as XLSX from 'xlsx';
import { HighValueItem } from "@/types/paymentTypes";

/**
 * Extract high value items from a workbook
 * This is specifically designed for the NHS Scotland Payment Schedule format
 */
export function extractHighValueItems(workbook: XLSX.WorkBook): HighValueItem[] | null {
  console.log("Starting focused high value extraction for NHS Scotland format");
  console.log("Available sheets in workbook:", workbook.SheetNames);
  
  // Find the High Value sheet (try various formats)
  const highValueSheet = workbook.SheetNames.find(name => 
    name === "High Value" || 
    name.toLowerCase().includes("high value") ||
    name.toLowerCase().includes("high-value") ||
    name.toLowerCase().includes("highvalue") ||
    name.toLowerCase().includes("high cost") ||  // New pattern
    name.toLowerCase().includes("costly items") ||  // New pattern
    name.toLowerCase().includes("expensive items")  // New pattern
  );
  
  if (!highValueSheet) {
    console.log("No High Value sheet found in workbook. Available sheets:", workbook.SheetNames);
    // DEBUG: Try inspecting each sheet to look for high value content
    workbook.SheetNames.forEach(sheetName => {
      try {
        console.log(`Inspecting sheet "${sheetName}" for possible high value content`);
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        
        // Look for "HIGH VALUE" or "GIC" text in first 20 rows
        for (let i = 0; i < Math.min(20, data.length); i++) {
          if (!data[i]) continue;
          const rowStr = JSON.stringify(data[i]).toLowerCase();
          if (rowStr.includes("high value") || 
              rowStr.includes("paid gic") || 
              rowStr.includes("cost above") ||
              rowStr.includes("£200")) {
            console.log(`Sheet "${sheetName}" may contain high value data at row ${i}: ${rowStr}`);
          }
        }
      } catch (e) {
        console.log(`Error inspecting sheet "${sheetName}":`, e);
      }
    });
    return null;
  }
  
  console.log(`Found High Value sheet: "${highValueSheet}"`);
  
  // Get the sheet data
  const sheet = workbook.Sheets[highValueSheet];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
  
  console.log(`Sheet data has ${data.length} rows`);
  
  // NHS Scotland format-specific extraction
  // Based on analysis of the screenshot, structure is very specific
  
  // Step 1: Find the headers row (typically around row 10)
  let headerRow = -1;
  
  // First, check for the "HIGH VALUE REPORT" text as a marker
  for (let i = 0; i < 20 && i < data.length; i++) {
    if (data[i] && data[i][0] && String(data[i][0]).includes("HIGH VALUE REPORT")) {
      console.log(`Found "HIGH VALUE REPORT" marker at row ${i}`);
      // Headers are typically 6 rows after this marker
      headerRow = i + 6;
      break;
    }
  }
  
  // If we didn't find the marker, scan for the Paid Product Name column
  if (headerRow === -1) {
    for (let i = 0; i < 30 && i < data.length; i++) {
      if (!data[i]) continue;
      
      // Dump the first few rows for debugging
      if (i < 15) {
        console.log(`DEBUG Row ${i}:`, JSON.stringify(data[i]));
      }
      
      const hasProductNameCol = data[i].some(cell => 
        cell && String(cell).toLowerCase().includes("paid product name")
      );
      
      const hasGicCol = data[i].some(cell => 
        cell && String(cell).toLowerCase().includes("paid gic")
      );
      
      // Also check for just "product name" or "drug name"
      const hasGenericProductCol = data[i].some(cell => 
        cell && (String(cell).toLowerCase().includes("product name") || 
                String(cell).toLowerCase().includes("drug name"))
      );
      
      if (hasProductNameCol || (hasGenericProductCol && hasGicCol)) {
        headerRow = i;
        console.log(`Found header row with product name at row ${i}`);
        break;
      }
    }
  }
  
  if (headerRow === -1) {
    console.log("Could not find header row");
    // Log more details about the first 15 rows to help debug
    for (let i = 0; i < 15 && i < data.length; i++) {
      console.log(`Row ${i}:`, data[i]);
    }
    return null;
  }
  
  // Step 2: Find the columns we need from the header row
  const headerColumns = data[headerRow];
  console.log("Header row:", headerColumns);
  
  // Map column indices
  let productNameCol = -1;
  let gicCol = -1;
  let quantityCol = -1;
  let serviceFlagCol = -1;
  
  for (let i = 0; i < headerColumns.length; i++) {
    const col = headerColumns[i];
    if (!col) continue;
    
    const colText = String(col).toLowerCase();
    
    if (colText.includes("paid product name") || 
        colText.includes("product name") || 
        colText.includes("drug name")) {
      productNameCol = i;
      console.log(`Found product name column at index ${i}: "${col}"`);
    } else if (colText.includes("paid gic incl")) {
      gicCol = i;
      console.log(`Found GIC column at index ${i}: "${col}"`);
    } else if (colText === "paid gic" || colText.includes("cost")) {  // Expanded matching
      gicCol = i;
      console.log(`Found GIC/cost column at index ${i}: "${col}"`);
    } else if (colText.includes("paid quantity") || colText === "quantity") {
      quantityCol = i;
      console.log(`Found quantity column at index ${i}: "${col}"`);
    } else if (colText.includes("service flag") || colText === "flag" || colText === "service") {
      serviceFlagCol = i;
      console.log(`Found service flag column at index ${i}: "${col}"`);
    }
  }
  
  console.log(`Found columns - Product Name: ${productNameCol}, GIC: ${gicCol}, ` +
             `Quantity: ${quantityCol}, Service Flag: ${serviceFlagCol}`);
  
  if (productNameCol === -1 || gicCol === -1) {
    console.log("Critical columns not found");
    return null;
  }
  
  // Step 3: Extract data rows (starting from headerRow + 1)
  const items: HighValueItem[] = [];
  
  // For NHS Scotland, data starts right after the header row
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    if (!row || row.length <= Math.max(productNameCol, gicCol)) continue;
    
    // Skip if we've reached an empty row (likely end of data)
    if (!row[productNameCol] && !row[gicCol]) continue;
    
    // Get and check the GIC value
    let gicValue = row[gicCol];
    if (typeof gicValue === 'string') {
      // Remove currency symbols and commas
      gicValue = parseFloat(gicValue.replace(/[£$,]/g, ''));
    }
    
    // Skip if GIC is below £200 or NaN
    if (isNaN(gicValue) || gicValue < 200) continue;
    
    // Create the item
    const item: HighValueItem = {
      paidProductName: String(row[productNameCol] || "Unknown Product"),
      paidGicInclBb: gicValue
    };
    
    // Add optional fields if available
    if (quantityCol !== -1 && row[quantityCol] !== undefined) {
      item.paidQuantity = Number(row[quantityCol]);
    }
    
    if (serviceFlagCol !== -1 && row[serviceFlagCol] !== undefined) {
      item.serviceFlag = String(row[serviceFlagCol]);
    }
    
    console.log(`Adding item: ${item.paidProductName}, GIC: ${item.paidGicInclBb}`);
    items.push(item);
  }
  
  console.log(`Extracted ${items.length} high value items`);
  
  if (items.length === 0) {
    console.log("No high value items found. Trying direct row processing...");
    
    // Additional fallback: try direct processing of specific rows
    // Based on the screenshot, data starts around row 11 and columns are fixed
    const directStart = Math.max(10, headerRow + 1); // Usually row 11 (index 10)
    
    // If headers were found but no items extracted, try a fixed format approach
    for (let i = directStart; i < Math.min(data.length, directStart + 50); i++) {
      const row = data[i];
      if (!row || row.length < 5) continue; // Need at least 5 columns
      
      // Try to find a product name and GIC value in common positions
      const possibleProductName = row.find(cell => 
        cell && typeof cell === 'string' && cell.length > 5
      );
      
      const possibleGicValues = row.filter(cell => 
        cell && (typeof cell === 'number' || 
        (typeof cell === 'string' && /^\s*[£$]?\s*\d+(\.\d+)?\s*$/.test(cell)))
      );
      
      if (!possibleProductName || possibleGicValues.length === 0) continue;
      
      // Convert possible GIC values to numbers
      const gicNumbers = possibleGicValues.map(val => {
        if (typeof val === 'number') return val;
        return parseFloat(String(val).replace(/[£$,\s]/g, ''));
      }).filter(val => !isNaN(val) && val >= 200);
      
      if (gicNumbers.length === 0) continue;
      
      // Add an item using the highest GIC value
      const highestGic = Math.max(...gicNumbers);
      items.push({
        paidProductName: String(possibleProductName),
        paidGicInclBb: highestGic
      });
      
      console.log(`Direct processing added: ${possibleProductName}, GIC: ${highestGic}`);
    }
  }
  
  return items.length > 0 ? items : null;
}