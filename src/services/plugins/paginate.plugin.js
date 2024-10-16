import { Op } from 'sequelize';

const paginate = async function (model, filter = {}, options = {}, include = [], searchFields = []) {
  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const whereClause = {};

  if (Object.keys(filter).length > 0) {
    Object.keys(filter).forEach(key => {
      if (key === 'keyword' && searchFields.length > 0) {
        whereClause[Op.or] = searchFields.map(field => ({
          [field]: { [Op.like]: `%${filter[key].trim()}%` }
        }));
      } else if (key === 'name') {
        whereClause[key] = { [Op.like]: `%${filter[key].trim()}%` };
      } else {
        whereClause[key] = filter[key].toString().trim();
      }
    });
  }

  const orderClause = [];
  if (options.sortBy) {
    const sortBy = options.sortBy.trim();
    const order = options.order ? options.order.toUpperCase() : 'ASC';
    orderClause.push([sortBy, order]);
  } else {
    orderClause.push(['id', 'ASC']);
  };

  const { count, rows } = await model.findAndCountAll({
    where: Object.keys(whereClause).length > 0 || whereClause[Op.or] ? whereClause : undefined,
    limit,
    offset,
    order: orderClause,
    ...(include.length > 0 ? { include } : {}),
  });

  const totalResults = count;
  const totalPages = Math.ceil(totalResults / limit);

  return {
    results: rows,
    page,
    limit,
    totalPages,
    totalResults,
  };
};

export default paginate;