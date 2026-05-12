/**
 * Reusable API features for MongoDB queries.
 * Supports filtering, sorting, field selection, and pagination.
 */
class APIFeatures {
  /**
   * @param {import('mongoose').Query} query - Mongoose query object
   * @param {object} queryString - Express req.query object
   */
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  /**
   * Filter query based on query string parameters.
   * Supports MongoDB operators: gte, gt, lte, lt
   */
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search', 'q'];
    excludedFields.forEach((field) => delete queryObj[field]);

    // Advanced filtering: { price: { gte: 100 } } → { price: { $gte: 100 } }
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt|in|ne)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  /**
   * Sort results by specified fields.
   * Default sort: -createdAt (newest first)
   */
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  /**
   * Select specific fields to return.
   * Default: exclude __v
   */
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  /**
   * Paginate results.
   * Default: page 1, limit 20
   */
  paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(this.queryString.limit, 10) || 20)
    );
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }

  /**
   * Full-text search on indexed fields.
   */
  search() {
    const searchTerm = this.queryString.search || this.queryString.q;
    if (searchTerm) {
      this.query = this.query.find({
        $text: { $search: searchTerm },
      });
    }
    return this;
  }
}

module.exports = APIFeatures;
