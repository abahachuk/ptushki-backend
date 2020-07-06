import { WorkbookProperties, AutoFilter, WorkbookView, WorksheetViewFrozen, Column, Cell } from 'exceljs';

export const properties: {
  sheetName: string;
  wbProperties: WorkbookProperties;
  wbViews: WorkbookView[];
  wsViews: WorksheetViewFrozen[];
  wsAutoFilter: AutoFilter;
  colProperties: Partial<Column>;
  headerCellStyles: Partial<Cell>;
} = {
  sheetName: 'List',
  wbProperties: {
    date1904: true,
  },
  wbViews: [
    {
      x: 0,
      y: 0,
      width: 10,
      height: 20,
      firstSheet: 0,
      activeTab: 1,
      visibility: 'visible',
    },
  ],
  wsViews: [{ state: 'frozen', xSplit: 0, ySplit: 1, topLeftCell: 'G10' }],
  wsAutoFilter: {
    from: {
      row: 1,
      column: 1,
    },
    to: {
      row: 1,
      column: 1,
    },
  },
  colProperties: {
    header: 'name',
    key: 'name',
    width: 25,
    style: {
      numFmt: '@',
      alignment: {
        vertical: 'middle',
        horizontal: 'center',
      },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      },
      font: {
        size: 12,
      },
    },
  },
  headerCellStyles: {
    alignment: {
      vertical: 'middle',
      horizontal: 'center',
    },
    border: {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'double' },
      right: { style: 'thin' },
    },
    font: {
      size: 12,
    },
    fill: {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'd4d8dd' },
      bgColor: { argb: '#FF0000' },
    },
  },
};
