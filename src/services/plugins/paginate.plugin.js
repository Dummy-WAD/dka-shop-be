const paginate = async function (tableName, filter = {}, options = {}) {
  let sort = options.sortBy ? options.sortBy : 'created_at';

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const filterKeys = Object.keys(filter);
  let whereClause = '';
  if (filterKeys.length > 0) {
    const conditions = filterKeys.map((key, index) => `${key} = $${index + 1}`).join(' AND ');
    whereClause = `WHERE ${conditions}`;
  }

  const countQuery = `SELECT COUNT(*) FROM ${tableName} ${whereClause}`;
  const countResult = await pool.query(countQuery, Object.values(filter));
  const totalResults = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalResults / limit);

  const dataQuery = `SELECT * FROM ${tableName} ${whereClause} ORDER BY ${sort} LIMIT $${filterKeys.length + 1} OFFSET $${filterKeys.length + 2}`;
  const dataResult = await pool.query(dataQuery, [...Object.values(filter), limit, offset]);

  const result = {
    results: dataResult.rows,
    page,
    limit,
    totalPages,
    totalResults,
  };

  return result;
};
export default paginate;
