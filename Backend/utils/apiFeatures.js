class ApiFeatures {
  constructor(query, queryStr) {
    this.query    = query;
    this.queryStr = queryStr;
  }

  // Filter
  filter() {
    const queryObj  = { ...this.queryStr };
    const excluded  = ["page", "sort", "limit", "fields", "search"];
    excluded.forEach((k) => delete queryObj[k]);

    // Advanced: gte, gt, lte, lt
    let queryStr = JSON.stringify(queryObj);
    queryStr     = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  // Search by name
  search() {
    if (this.queryStr.search) {
      this.query = this.query.find({
        name: { $regex: this.queryStr.search, $options: "i" },
      });
    }
    return this;
  }

  // Sort
  sort() {
    if (this.queryStr.sort) {
      const sortBy = this.queryStr.sort.split(",").join(" ");
      this.query   = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }

  // Pagination
  paginate(defaultLimit = 12) {
    const page  = Number(this.queryStr.page)  || 1;
    const limit = Number(this.queryStr.limit) || defaultLimit;
    const skip  = (page - 1) * limit;
    this.query  = this.query.skip(skip).limit(limit);
    return this;
  }
}

export default ApiFeatures;