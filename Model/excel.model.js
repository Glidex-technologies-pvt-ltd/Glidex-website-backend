import XLSX from "xlsx";

// Create a new Excel file
export const saveToExcel = (data) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  return XLSX.write(wb, { bookType: "xlsx", type: "buffer" });
};

// Append new data to an existing Excel buffer
export const appendToExcel = (existingBuffer, newEntry) => {
  const workbook = XLSX.read(existingBuffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert sheet to JSON, append new entry, and update
  const data = XLSX.utils.sheet_to_json(worksheet);
  data.push(newEntry);
  const updatedSheet = XLSX.utils.json_to_sheet(data);
  workbook.Sheets[sheetName] = updatedSheet;

  return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
};
