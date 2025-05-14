/**
 * Base repository class providing common database operations
 * for mongoose models
 */
class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  async findById(id, projection = {}) {
    return this.model.findById(id, projection);
  }

  async findOne(filter = {}, projection = {}) {
    return this.model.findOne(filter, projection);
  }

  async find(filter = {}, projection = {}, options = {}) {
    return this.model.find(filter, projection, options);
  }

  /**
   * Find all documents in the collection
   * @param {Object} projection Fields to include/exclude
   * @param {Object} options Query options like sort, limit, etc.
   * @returns {Promise<Array>} All documents in the collection
   */
  async findAll(projection = {}, options = {}) {
    return this.find({}, projection, options);
  }

  async create(data) {
    return this.model.create(data);
  }

  /**
   * Create multiple documents at once
   * @param {Array} dataArray Array of documents to create
   * @returns {Promise} Result of insertion
   */
  async createMany(dataArray) {
    return this.model.insertMany(dataArray);
  }

  async update(id, updateData) {
    return this.model.findByIdAndUpdate(id, updateData, { new: true });
  }

  async updateMany(filter, updateData) {
    return this.model.updateMany(filter, updateData);
  }

  /**
   * Perform bulk write operations
   * @param {Array} operations Array of operations to perform
   * @param {Object} options Options for the bulk write
   * @returns {Promise} Result of bulk write
   */
  async bulkWrite(operations, options = {}) {
    return this.model.bulkWrite(operations, options);
  }

  async delete(id) {
    return this.model.findByIdAndDelete(id);
  }

  async deleteMany(filter) {
    return this.model.deleteMany(filter);
  }

  async count(filter = {}) {
    return this.model.countDocuments(filter);
  }

  async exists(filter = {}) {
    return this.model.exists(filter);
  }

  async findWithPagination(filter = {}, options = {}) {
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      ...restOptions
    } = options;

    const skip = (page - 1) * limit;

    const [data, totalCount] = await Promise.all([
      this.model.find(filter, restOptions.projection || {}, {
        ...restOptions,
        skip,
        limit,
        sort,
      }),
      this.model.countDocuments(filter),
    ]);

    return {
      data,
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async aggregate(pipeline) {
    return this.model.aggregate(pipeline);
  }
}

export default BaseRepository;
