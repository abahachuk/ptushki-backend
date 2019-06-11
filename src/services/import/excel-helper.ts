import Excel, { Column, Worksheet, Workbook, Row, Cell } from 'exceljs';
import { excelColumns } from './excel-columns';
import { excelProperties } from './excel-properties';

const createColumns = (columnNames: string[]): Partial<Column>[] => {
  const columns: Partial<Column>[] = [];

  if (columnNames) {
    columnNames.forEach(
      (name: string): void => {
        const extendedColumn = Object.assign({}, excelProperties.colProperties, { header: name, key: name });
        columns.push(extendedColumn);
      },
    );
  }

  return columns;
};

const setStyleToRow = (row: Row, styles: Partial<Cell>): void => {
  row.eachCell(
    (cell: Cell): void => {
      // eslint-disable-next-line  no-param-reassign
      cell.style = styles;
    },
  );
};

export const createExcelWorkBook = async (type: string): Promise<Workbook> => {
  const workbook: Workbook = new Excel.Workbook();
  const worksheet: Worksheet = workbook.addWorksheet(excelProperties.sheetName);
  const columnNames: string[] = excelColumns[type];
  const columnNamesLength: number = columnNames ? columnNames.length : 0;
  const extendedFilter = Object.assign({}, excelProperties.wsAutoFilter, { to: { row: 1, column: columnNamesLength } });

  workbook.properties = excelProperties.wbProperties;
  workbook.views = excelProperties.wbViews;

  worksheet.columns = createColumns(columnNames);
  worksheet.views = excelProperties.wsViews;
  worksheet.autoFilter = extendedFilter;

  setStyleToRow(worksheet.getRow(1), excelProperties.headerCellStyles);

  return workbook;
};
