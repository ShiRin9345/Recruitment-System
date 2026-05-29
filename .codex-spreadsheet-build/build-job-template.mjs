import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const workbook = Workbook.create();
const sheet = workbook.worksheets.add("岗位信息");

sheet.getRange("A1:B1").values = [["岗位名称", "岗位描述"]];
sheet.getRange("A2:B51").values = Array.from({ length: 50 }, () => ["", ""]);

sheet.getRange("A1:B1").format = {
  font: { bold: true, color: "#FFFFFF" },
  fill: "#1F4E78",
  horizontalAlignment: "center",
  verticalAlignment: "center",
};

sheet.getRange("A1:B51").format = {
  borders: { preset: "all", style: "thin", color: "#D9E2F3" },
  verticalAlignment: "top",
  wrapText: true,
};

sheet.getRange("A:A").format.columnWidth = 24;
sheet.getRange("B:B").format.columnWidth = 72;
sheet.getRange("1:1").format.rowHeight = 26;
sheet.getRange("2:51").format.rowHeight = 48;

sheet.freezePanes = { rows: 1, columns: 0 };
sheet.getRange("A1:B51").autoFilter = true;

const outputDir = "/Users/bytedance/hirement/outputs/job_template";
await fs.mkdir(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "岗位信息模板.xlsx");
const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const inspect = await workbook.inspect({
  kind: "table",
  range: "岗位信息!A1:B6",
  include: "values",
  tableMaxRows: 6,
  tableMaxCols: 2,
});

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 20 },
  summary: "formula error scan",
});

await workbook.render({ sheetName: "岗位信息", range: "A1:B12", scale: 2 });

console.log(JSON.stringify({ outputPath, preview: inspect.ndjson, errors: errors.ndjson }, null, 2));
