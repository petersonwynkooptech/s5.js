import axios from "axios";

/**
 * S5 JavaScript ORM - Rails ActiveRecord-like interface
 */
export class S5Client {
  constructor(config = {}) {
    this.baseURL = config.baseURL || "https://s5.host/api/v1";
    this.apiKey = config.apiKey;
    this.collection = config.collection;

    if (!this.apiKey) {
      throw new Error("API key is required");
    }

    if (!this.collection) {
      throw new Error("Collection name is required");
    }

    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
    });
  }
}

/**
 * Document model - Rails ActiveRecord-like interface
 */
export class Document {
  constructor(data = {}, client) {
    // Extract the actual user data from the nested structure
    this.data = data.data || data;
    this.client = client;
    this.id = data.id;
    this.collection = data.collection;
    this.version = data.version;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.ttl_at = data.ttl_at;
  }

  // overwrite toString to return the document data
  attributes() {
    return this.data;
  }

  /**
   * Get All Documents
   * @returns {Promise<{documents: Array<Document>, pagination?: Object}>}
   */
  static async all() {
    return this.where();
  }

  /**
   * Find documents with query DSL
   * @param {Object} options - Query options
   * @returns {Promise<{documents: Array<Document>, pagination?: Object}>}
   */
  static async where(options = {}) {
    const { client } = this;
    const params = new URLSearchParams();

    // Handle query DSL
    if (options.q) {
      const queries = Array.isArray(options.q) ? options.q : [options.q];
      queries.forEach((q) => params.append("q", q));
    }

    // Handle ordering
    if (options.order) {
      const orders = Array.isArray(options.order)
        ? options.order
        : [options.order];
      orders.forEach((order) => params.append("order", order));
    }

    // Handle pagination
    if (options.limit) params.append("limit", options.limit);
    if (options.page) params.append("page", options.page);

    // Handle JSON filter
    if (options.filter) {
      params.append("filter", JSON.stringify(options.filter));
    }

    try {
      const response = await client.axios.get(
        `/${client.collection}?${params}`
      );

      const documents = response.data.data.data.map(
        (doc) => new Document(doc, client)
      );

      // Always return consistent structure
      const result = { documents };

      // Add pagination metadata if available
      if (response.data.data.pagination) {
        result.pagination = response.data.data.pagination;
      }

      return result;
    } catch (error) {
      throw new Error(
        `Query failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Find a single document by ID
   * @param {string} id - Document ID
   * @returns {Promise<Document>}
   */
  static async find(id) {
    const { client } = this;

    try {
      const response = await client.axios.get(`/${client.collection}/${id}`);
      return new Document(response.data.data, client);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      throw new Error(
        `Find failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Find the first document matching criteria
   * @param {Object} options - Query options
   * @returns {Promise<Document|null>}
   */
  static async first(options = {}) {
    const results = await this.where({ ...options, limit: 1 });
    return results.documents.length > 0 ? results.documents[0] : null;
  }

  /**
   * Count documents matching criteria
   * @param {Object} options - Query options
   * @returns {Promise<number>}
   */
  static async count(options = {}) {
    const results = await this.where({ ...options, limit: 1 });
    // Note: This is a simplified count - in production you'd want a dedicated count endpoint
    return results.documents.length;
  }

  /**
   * Create a new document
   * @param {Object} data - Document data
   * @param {Object} options - Additional options (ttl_at, etc.)
   * @returns {Promise<Document>}
   */
  static async create(data, options = {}) {
    const { client } = this;

    try {
      const payload = {
        data,
        ...options,
      };

      const response = await client.axios.post(
        `/${client.collection}`,
        payload
      );
      return new Document(response.data.data, client);
    } catch (error) {
      throw new Error(
        `Create failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Save the document (create or update)
   * @returns {Promise<Document>}
   */
  async save() {
    if (this.id) {
      return this.update();
    } else {
      return this.create();
    }
  }

  /**
   * Create this document
   * @returns {Promise<Document>}
   */
  async create() {
    const { client } = this;

    try {
      const payload = {
        data: this.data,
        ttl_at: this.ttl_at,
      };

      const response = await client.axios.post(
        `/${client.collection}`,
        payload
      );
      const newDoc = new Document(response.data.data, client);

      // Update this instance with the new data
      Object.assign(this, newDoc);
      return this;
    } catch (error) {
      throw new Error(
        `Create failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Update this document
   * @param {Object} data - Data to update (optional)
   * @returns {Promise<Document>}
   */
  async update(data = null) {
    const { client } = this;

    if (data) {
      this.data = { ...this.data, ...data };
    }

    try {
      const payload = {
        data: this.data,
        ttl_at: this.ttl_at,
      };

      const response = await client.axios.put(
        `/${client.collection}/${this.id}`,
        payload
      );
      const updatedDoc = new Document(response.data.data, client);

      // Update this instance with the new data
      Object.assign(this, updatedDoc);
      return this;
    } catch (error) {
      throw new Error(
        `Update failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Patch this document (merge data)
   * @param {Object} data - Data to merge
   * @returns {Promise<Document>}
   */
  async patch(data) {
    const { client } = this;

    try {
      const payload = { data };

      const response = await client.axios.patch(
        `/${client.collection}/${this.id}/patch`,
        payload
      );
      const updatedDoc = new Document(response.data.data, client);

      // Update this instance with the new data
      Object.assign(this, updatedDoc);
      return this;
    } catch (error) {
      throw new Error(
        `Patch failed: ${error.response?.data?.error?.message || error.message}`
      );
    }
  }

  /**
   * Delete this document
   * @returns {Promise<boolean>}
   */
  async destroy() {
    const { client } = this;

    try {
      await client.axios.delete(`/${client.collection}/${this.id}`);
      return true;
    } catch (error) {
      throw new Error(
        `Delete failed: ${
          error.response?.data?.error?.message || error.message
        }`
      );
    }
  }

  /**
   * Reload this document from the server
   * @returns {Promise<Document>}
   */
  async reload() {
    if (!this.id) {
      throw new Error("Cannot reload document without ID");
    }

    const fresh = await Document.find(this.id);
    if (fresh) {
      Object.assign(this, fresh);
    }
    return this;
  }

  /**
   * Check if document is persisted
   * @returns {boolean}
   */
  get persisted() {
    return !!this.id;
  }

  /**
   * Get a value from the document data
   * @param {string} key - Key path (supports dot notation)
   * @returns {any}
   */
  get(key) {
    return this.getNestedValue(this.data, key);
  }

  /**
   * Set a value in the document data
   * @param {string} key - Key path (supports dot notation)
   * @param {any} value - Value to set
   */
  set(key, value) {
    this.setNestedValue(this.data, key, value);
  }

  /**
   * Get nested value using dot notation
   * @private
   */
  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  /**
   * Set nested value using dot notation
   * @private
   */
  setNestedValue(obj, path, value) {
    const keys = path.split(".");
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      collection: this.collection,
      data: this.data,
      version: this.version,
      created_at: this.created_at,
      updated_at: this.updated_at,
      ttl_at: this.ttl_at,
    };
  }
}

/**
 * Collection factory - creates a Document class bound to a specific collection
 */
export function createCollection(collection, client) {
  class CollectionDocument extends Document {
    constructor(data = {}) {
      super(data, client);
    }

    static get client() {
      return client;
    }

    static get collection() {
      return collection;
    }
  }

  return CollectionDocument;
}

/**
 * Main S5 class - entry point
 */
export class S5 {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Get a collection (table-like interface)
   * @param {string} name - Collection name
   * @returns {CollectionDocument}
   */
  collection(name) {
    const client = new S5Client({ ...this.config, collection: name });
    return createCollection(name, client);
  }
}

export default S5;
