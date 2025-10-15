export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export function parsePagination(query: Record<string, unknown>, defaults = { page: 1, limit: 12 }) {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaults.limit));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}



