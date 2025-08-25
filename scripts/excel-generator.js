const ExcelJS = require('exceljs');
const path = require('path');

class ExcelGenerator {
  constructor() {
    this.templatesPath = path.join(__dirname, '../excel-models/templates');
    this.outputPath = path.join(__dirname, '../excel-models/generated');
  }

  async createDCFModel(companyData) {
    const workbook = new ExcelJS.Workbook();
    
    // Create worksheets
    const summarySheet = workbook.addWorksheet('Executive Summary');
    const assumptionsSheet = workbook.addWorksheet('Key Assumptions');
    const projectionsSheet = workbook.addWorksheet('Financial Projections');
    const dcfSheet = workbook.addWorksheet('DCF Analysis');
    const sensitivitySheet = workbook.addWorksheet('Sensitivity Analysis');

    // Executive Summary Sheet
    this.setupExecutiveSummary(summarySheet, companyData);
    
    // Key Assumptions Sheet
    this.setupAssumptions(assumptionsSheet);
    
    // Financial Projections Sheet
    this.setupProjections(projectionsSheet);
    
    // DCF Analysis Sheet
    this.setupDCFAnalysis(dcfSheet);
    
    // Sensitivity Analysis Sheet
    this.setupSensitivityAnalysis(sensitivitySheet);

    // Save the workbook
    const filename = `DCF_${companyData.symbol}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = path.join(this.outputPath, filename);
    
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  setupExecutiveSummary(sheet, companyData) {
    // Header styling
    sheet.getCell('A1').value = `${companyData.name || companyData.symbol} - DCF Valuation Model`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    sheet.mergeCells('A1:F1');

    sheet.getCell('A2').value = `Analysis Date: ${new Date().toLocaleDateString()}`;
    sheet.getCell('A2').font = { italic: true };

    // Key Metrics Section
    let row = 4;
    sheet.getCell(`A${row}`).value = 'VALUATION SUMMARY';
    sheet.getCell(`A${row}`).font = { bold: true, size: 14 };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE6F0FF' }
    };
    sheet.mergeCells(`A${row}:F${row}`);

    row += 2;
    const metrics = [
      ['Current Stock Price', companyData.currentPrice || 0, '$'],
      ['Intrinsic Value (DCF)', '=DCF!B20', '$'],
      ['Upside/(Downside)', '=IF(B7>0,(B7-B6)/B6,0)', '%'],
      ['Shares Outstanding (M)', companyData.sharesOutstanding || 0, 'M'],
      ['Market Cap', '=B6*B9*1000000', '$'],
      ['Enterprise Value', '=B10+B11-B12', '$'],
      ['Total Debt', companyData.totalDebt || 0, '$'],
      ['Cash & Equivalents', companyData.cash || 0, '$']
    ];

    metrics.forEach(([label, formula, unit], i) => {
      const currentRow = row + i;
      sheet.getCell(`A${currentRow}`).value = label;
      sheet.getCell(`A${currentRow}`).font = { bold: true };
      
      if (typeof formula === 'string' && formula.startsWith('=')) {
        sheet.getCell(`B${currentRow}`).formula = formula.substring(1);
      } else {
        sheet.getCell(`B${currentRow}`).value = formula;
      }
      
      if (unit === '$') {
        sheet.getCell(`B${currentRow}`).numFmt = '_($* #,##0_);_($* (#,##0);_($* "-"_);_(@_)';
      } else if (unit === '%') {
        sheet.getCell(`B${currentRow}`).numFmt = '0.0%';
      } else if (unit === 'M') {
        sheet.getCell(`B${currentRow}`).numFmt = '#,##0.0"M"';
      }

      sheet.getCell(`C${currentRow}`).value = unit;
    });

    // Column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 20;
    sheet.getColumn('C').width = 8;
  }

  setupAssumptions(sheet) {
    sheet.getCell('A1').value = 'KEY ASSUMPTIONS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    let row = 3;
    
    // Revenue Assumptions
    sheet.getCell(`A${row}`).value = 'REVENUE ASSUMPTIONS';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    
    row += 2;
    const years = [2024, 2025, 2026, 2027, 2028, 2029];
    
    // Headers
    sheet.getCell(`A${row}`).value = 'Metric';
    years.forEach((year, i) => {
      sheet.getCell(`${String.fromCharCode(66 + i)}${row}`).value = year;
      sheet.getCell(`${String.fromCharCode(66 + i)}${row}`).font = { bold: true };
    });
    
    row++;
    const assumptions = [
      ['Revenue Growth %', [0.05, 0.08, 0.06, 0.04, 0.03, 0.025]],
      ['EBITDA Margin %', [0.20, 0.22, 0.23, 0.24, 0.24, 0.25]],
      ['EBIT Margin %', [0.15, 0.17, 0.18, 0.19, 0.19, 0.20]],
      ['Tax Rate %', [0.25, 0.25, 0.25, 0.25, 0.25, 0.25]],
      ['CAPEX % of Revenue', [0.04, 0.04, 0.03, 0.03, 0.03, 0.03]],
      ['Depreciation % of Revenue', [0.03, 0.03, 0.03, 0.03, 0.03, 0.03]]
    ];

    assumptions.forEach(([label, values]) => {
      sheet.getCell(`A${row}`).value = label;
      values.forEach((value, i) => {
        const cell = sheet.getCell(`${String.fromCharCode(66 + i)}${row}`);
        cell.value = value;
        cell.numFmt = '0.0%';
      });
      row++;
    });

    // WACC Assumptions
    row += 2;
    sheet.getCell(`A${row}`).value = 'COST OF CAPITAL';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    
    row += 2;
    const waccAssumptions = [
      ['Risk-Free Rate', 0.045],
      ['Market Risk Premium', 0.065],
      ['Beta', 1.2],
      ['Cost of Equity', '=B' + (row + 3) + '+B' + (row + 4) + '*B' + (row + 5)],
      ['Cost of Debt', 0.06],
      ['Tax Rate', 0.25],
      ['Debt/(Debt+Equity)', 0.30],
      ['WACC', '=B' + (row + 9) + '*B' + (row + 6) + '*(1-B' + (row + 8) + ')+B' + (row + 6) + '*B' + (row + 9)]
    ];

    waccAssumptions.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      if (typeof value === 'string' && value.startsWith('=')) {
        sheet.getCell(`B${row}`).formula = value.substring(1);
      } else {
        sheet.getCell(`B${row}`).value = value;
      }
      sheet.getCell(`B${row}`).numFmt = '0.0%';
      row++;
    });

    // Column widths
    sheet.getColumn('A').width = 25;
    for (let i = 0; i < years.length; i++) {
      sheet.getColumn(String.fromCharCode(66 + i)).width = 12;
    }
  }

  setupProjections(sheet) {
    sheet.getCell('A1').value = 'FINANCIAL PROJECTIONS ($M)';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    let row = 3;
    const years = ['Historical', 2024, 2025, 2026, 2027, 2028, 'Terminal'];
    
    // Headers
    sheet.getCell(`A${row}`).value = 'Financial Statement Items';
    sheet.getCell(`A${row}`).font = { bold: true };
    years.forEach((year, i) => {
      sheet.getCell(`${String.fromCharCode(66 + i)}${row}`).value = year;
      sheet.getCell(`${String.fromCharCode(66 + i)}${row}`).font = { bold: true };
      sheet.getCell(`${String.fromCharCode(66 + i)}${row}`).alignment = { horizontal: 'center' };
    });

    row++;
    const projectionItems = [
      'Revenue',
      'Revenue Growth %',
      '',
      'EBITDA',
      'EBITDA Margin %',
      'Depreciation & Amortization',
      'EBIT',
      'EBIT Margin %',
      'Tax Expense',
      'NOPAT',
      '',
      'CAPEX',
      'Change in Working Capital',
      'Unlevered Free Cash Flow',
      '',
      'PV Factor',
      'PV of FCF'
    ];

    projectionItems.forEach((item) => {
      sheet.getCell(`A${row}`).value = item;
      if (item === '' || item.includes('%')) {
        sheet.getCell(`A${row}`).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF5F5F5' }
        };
      }
      row++;
    });

    // Column widths
    sheet.getColumn('A').width = 25;
    for (let i = 0; i < years.length; i++) {
      sheet.getColumn(String.fromCharCode(66 + i)).width = 12;
    }
  }

  setupDCFAnalysis(sheet) {
    sheet.getCell('A1').value = 'DCF VALUATION ANALYSIS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    let row = 3;
    const dcfItems = [
      ['Sum of PV of FCF (Years 1-5)', '=SUM(Projections!C17:G17)'],
      ['Terminal Value', '=Projections!H14*(1+Assumptions!G5)/(Assumptions!B25-Assumptions!G5)'],
      ['PV of Terminal Value', '=B5/(1+Assumptions!B25)^5'],
      ['Enterprise Value', '=B4+B6'],
      ['Less: Net Debt', 500], // Placeholder
      ['Equity Value', '=B8-B9'],
      ['Shares Outstanding (M)', 100], // Placeholder
      ['Value per Share', '=B10/B11'],
      ['Current Stock Price', 150], // Placeholder
      ['Upside/(Downside)', '=(B12-B13)/B13'],
      '',
      'SENSITIVITY ANALYSIS',
      'WACC vs Terminal Growth Rate',
      '',
      'Terminal Growth →', '1.5%', '2.0%', '2.5%', '3.0%', '3.5%',
      'WACC ↓',
      '8.0%',
      '9.0%',
      '10.0%',
      '11.0%',
      '12.0%'
    ];

    dcfItems.forEach(([label, formula]) => {
      if (label) {
        sheet.getCell(`A${row}`).value = label;
        if (typeof formula === 'string' && formula.startsWith('=')) {
          sheet.getCell(`B${row}`).formula = formula.substring(1);
        } else if (formula !== undefined) {
          sheet.getCell(`B${row}`).value = formula;
        }
      }
      row++;
    });

    // Column widths
    sheet.getColumn('A').width = 25;
    sheet.getColumn('B').width = 15;
  }

  setupSensitivityAnalysis(sheet) {
    sheet.getCell('A1').value = 'SENSITIVITY & SCENARIO ANALYSIS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    // This would include data tables for sensitivity analysis
    // For now, just create the structure
    let row = 3;
    
    sheet.getCell(`A${row}`).value = 'Base Case Assumptions';
    sheet.getCell(`A${row}`).font = { bold: true };
    row += 2;
    
    const scenarios = [
      ['Scenario', 'Revenue Growth', 'EBITDA Margin', 'WACC', 'Value per Share'],
      ['Bear Case', '2%', '18%', '12%', '=DCF!B12*0.8'],
      ['Base Case', '5%', '22%', '10%', '=DCF!B12'],
      ['Bull Case', '8%', '26%', '8%', '=DCF!B12*1.2']
    ];

    scenarios.forEach(([scenario, growth, margin, wacc, value]) => {
      sheet.getCell(`A${row}`).value = scenario;
      sheet.getCell(`B${row}`).value = growth;
      sheet.getCell(`C${row}`).value = margin;
      sheet.getCell(`D${row}`).value = wacc;
      if (typeof value === 'string' && value.startsWith('=')) {
        sheet.getCell(`E${row}`).formula = value.substring(1);
      } else {
        sheet.getCell(`E${row}`).value = value;
      }
      row++;
    });

    // Column widths
    sheet.getColumn('A').width = 15;
    sheet.getColumn('B').width = 15;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 10;
    sheet.getColumn('E').width = 15;
  }

  async createLBOModel(dealData) {
    const workbook = new ExcelJS.Workbook();
    
    // Create worksheets for LBO model
    const summarySheet = workbook.addWorksheet('Executive Summary');
    const sourcesUsesSheet = workbook.addWorksheet('Sources & Uses');
    const projectionsSheet = workbook.addWorksheet('Financial Projections');
    const returnsSheet = workbook.addWorksheet('Returns Analysis');
    const sensitivitySheet = workbook.addWorksheet('Sensitivity Analysis');

    // Setup each sheet (similar structure to DCF)
    this.setupLBOSummary(summarySheet, dealData);
    this.setupSourcesUses(sourcesUsesSheet, dealData);
    this.setupLBOProjections(projectionsSheet);
    this.setupReturnsAnalysis(returnsSheet);
    this.setupLBOSensitivity(sensitivitySheet);

    // Save the workbook
    const filename = `LBO_${dealData.companyName}_${new Date().toISOString().split('T')[0]}.xlsx`;
    const filepath = path.join(this.outputPath, filename);
    
    await workbook.xlsx.writeFile(filepath);
    return filepath;
  }

  setupLBOSummary(sheet, dealData) {
    sheet.getCell('A1').value = `${dealData.companyName} - LBO Analysis`;
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    sheet.mergeCells('A1:F1');

    let row = 4;
    const summary = [
      ['TRANSACTION SUMMARY', ''],
      ['Enterprise Value', dealData.enterpriseValue || 1000],
      ['Total Debt', dealData.totalDebt || 600],
      ['Sponsor Equity', '=B5-B6'],
      ['Entry Multiple (EV/EBITDA)', '=B5/' + (dealData.ebitda || 100)],
      ['Exit Multiple (EV/EBITDA)', dealData.exitMultiple || 10],
      [''],
      ['RETURNS SUMMARY', ''],
      ['Total Multiple', '=Returns!B10'],
      ['IRR', '=Returns!B11'],
      ['Target IRR Met?', '=IF(B12>=20%,"YES","NO")']
    ];

    summary.forEach(([label, formula]) => {
      if (label) {
        sheet.getCell(`A${row}`).value = label;
        if (label.includes('SUMMARY')) {
          sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
          sheet.getCell(`A${row}`).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE6F0FF' }
          };
        }
        if (typeof formula === 'string' && formula.startsWith('=')) {
          sheet.getCell(`B${row}`).formula = formula.substring(1);
        } else if (formula !== '') {
          sheet.getCell(`B${row}`).value = formula;
        }
      }
      row++;
    });
  }

  setupSourcesUses(sheet, dealData) {
    sheet.getCell('A1').value = 'SOURCES & USES OF FUNDS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    let row = 3;
    
    // Sources
    sheet.getCell(`A${row}`).value = 'SOURCES';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    sheet.getCell(`C${row}`).value = '$M';
    sheet.getCell(`D${row}`).value = '%';
    
    row++;
    const sources = [
      ['Revolver', dealData.revolver || 50],
      ['Term Loan A', dealData.termLoanA || 200],
      ['Term Loan B', dealData.termLoanB || 250],
      ['Subordinated Debt', dealData.subordinatedDebt || 100],
      ['Sponsor Equity', '=C9-C5-C6-C7-C8'],
      ['Total Sources', '=SUM(C5:C9)']
    ];

    sources.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      if (typeof value === 'string' && value.startsWith('=')) {
        sheet.getCell(`C${row}`).formula = value.substring(1);
      } else {
        sheet.getCell(`C${row}`).value = value;
      }
      sheet.getCell(`D${row}`).formula = `C${row}/C$10`;
      sheet.getCell(`D${row}`).numFmt = '0.0%';
      row++;
    });

    row += 2;
    
    // Uses
    sheet.getCell(`A${row}`).value = 'USES';
    sheet.getCell(`A${row}`).font = { bold: true, size: 12 };
    sheet.getCell(`A${row}`).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFEB3B' }
    };
    
    row++;
    const uses = [
      ['Purchase Price', dealData.enterpriseValue || 1000],
      ['Transaction Fees', dealData.fees || 25],
      ['Total Uses', '=SUM(C13:C14)']
    ];

    uses.forEach(([label, value]) => {
      sheet.getCell(`A${row}`).value = label;
      sheet.getCell(`C${row}`).value = value;
      row++;
    });

    // Column widths
    sheet.getColumn('A').width = 20;
    sheet.getColumn('C').width = 15;
    sheet.getColumn('D').width = 10;
  }

  setupLBOProjections(sheet) {
    sheet.getCell('A1').value = 'FINANCIAL PROJECTIONS & DEBT SCHEDULE';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    // Similar to DCF projections but with debt schedule
    // This would be a comprehensive implementation
  }

  setupReturnsAnalysis(sheet) {
    sheet.getCell('A1').value = 'RETURNS ANALYSIS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    // Returns calculation implementation
  }

  setupLBOSensitivity(sheet) {
    sheet.getCell('A1').value = 'SENSITIVITY ANALYSIS';
    sheet.getCell('A1').font = { size: 16, bold: true, color: { argb: 'FF2E5090' } };
    
    // LBO sensitivity tables
  }
}

module.exports = ExcelGenerator;
