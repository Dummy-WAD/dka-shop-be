import { Op } from 'sequelize';

const paginate = async function (model, filter = {}, options = {}, include = [], searchFields = [], selectedAttributes = []) {
  const { limit: optionsLimit, page: optionsPage } = options;

  const isPaginationNeeded = optionsLimit && optionsPage;

  const limit = isPaginationNeeded ? parseInt(optionsLimit, 10) : undefined;
  const page = isPaginationNeeded ? parseInt(optionsPage, 10) : 1;
  const offset = isPaginationNeeded ? (page - 1) * limit : undefined;

  const whereClause = {};

  if (Object.keys(filter).length > 0) {
    Object.keys(filter).forEach(key => {
      if (key === 'keyword' && searchFields.length > 0) {
        whereClause[Op.or] = searchFields.map(field => ({
          [field]: { [Op.like]: `%${filter[key].trim()}%` }
        }));
      } else if (key === 'name') {
        whereClause[key] = { [Op.like]: `%${filter[key].trim()}%` };
      }
      else if (key === 'exclude') {
        whereClause.id = { [Op.notIn]: filter[key] };
      }
      else {
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
    attributes: selectedAttributes.length > 0 ? selectedAttributes : undefined,
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