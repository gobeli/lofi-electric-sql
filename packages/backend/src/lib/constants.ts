export const tables = ["schedule"] as const;
export type TableName = (typeof tables)[number];
