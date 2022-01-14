import { GridValueFormatterParams } from "@mui/x-data-grid";

export const customFormatter = (params: GridValueFormatterParams) => parseFloat(params.value as string).toFixed(6);