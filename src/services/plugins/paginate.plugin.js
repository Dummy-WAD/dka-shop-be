import { Op } from 'sequelize';

const paginate = async function (model, filter = {}, options = {}) {
  let sort = options.sortBy ? options.sortBy : 'createdAt';

  const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
  const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const offset = (page - 1) * limit;

  const whereClause = {};

  if (Object.keys(filter).length > 0) {
    Object.keys(filter).forEach(key => {
      if (key === 'name') {
        whereClause[key] = { [Op.like]: `%${filter[key]}%` };
      } else {
        whereClause[key] = filter[key];
      }
    });
  }

  const { count, rows } = await model.findAndCountAll({
    where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
    limit,
    offset,
    order: [[sort, 'ASC']],
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