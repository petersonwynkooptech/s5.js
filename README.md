# s5.js

A JavaScript ORM for the s5 API - the on-demand storage platform.

## About s5

s5 is an on-demand storage platform that provides a simple, RESTful API for storing and retrieving JSON documents. This library provides a Rails ActiveRecord-like interface for interacting with s5 collections, making it easy to work with your data in a familiar way.

## Features

- 🚀 **ActiveRecord-like API** - Familiar methods like `find()`, `where()`, `create()`, `save()`
- 📊 **Powerful Query DSL** - Support for complex queries with operators like `eq`, `gt`, `in`, `exists`
- 🔍 **JSON Filtering** - Filter documents using JSON-based criteria
- 📄 **Document Management** - Create, read, update, delete operations with full CRUD support
- ⏰ **TTL Support** - Set time-to-live for documents
- 🔄 **Real-time Updates** - Reload documents from the server

## Installation

```bash
npm install s5.js
```

## Quick Start

```javascript
import S5 from 's5.js';

// Initialize the client
const s5 = new S5({
  apiKey: 'ak_your_prefix_your_secret'
});

// Get a collection
const User = s5.collection('users');

// Create a new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  status: 'active'
});

// Find users
const activeUsers = await User.where({
  q: ['eq(status,"active")']
});

console.log(activeUsers.documents);
```

## Getting Started with s5

Before using this library, you'll need:

1. **An s5 account** - Sign up at [superstupidsimple.com](https://superstupidsimple.com)
2. **An API key** - Generate one in your s5 dashboard
3. **A collection** - Create collections to organize your data

## Usage

### Basic Setup

```javascript
import S5 from 's5.js';

const s5 = new S5({
  apiKey: 'ak_your_prefix_your_secret'
});

// Get a collection (like a Rails model)
const User = s5.collection('users');
```

### Querying

```javascript
// Find all users
const users = await User.where();

// Find with query DSL
const activeUsers = await User.where({
  q: ['eq(status,"active")', 'gt(score,100)']
});

// Find with JSON filter
const filteredUsers = await User.where({
  filter: {
    eq: { 'status': 'active' },
    gt: { 'score': 100 }
  }
});

// Find with ordering
const recentUsers = await User.where({
  order: ['-updated_at']
});

// Find first user
const firstUser = await User.first();

// Find by ID
const user = await User.find('user-123');

// Count users
const count = await User.count();
```

### Creating Documents

```javascript
// Create a new user
const user = await User.create({
  name: 'John Doe',
  email: 'john@example.com',
  status: 'active',
  score: 150
});

// Create with TTL
const tempUser = await User.create({
  name: 'Temp User'
}, {
  ttl_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
});
```

### Working with Documents

```javascript
// Get a document
const user = await User.find('user-123');

// Access data
console.log(user.data.name); // 'John Doe'
console.log(user.get('email')); // 'john@example.com'

// Set data
user.set('status', 'inactive');
user.set('last_login', new Date());

// Save changes
await user.save();

// Update specific fields
await user.update({
  status: 'active',
  last_seen: new Date()
});

// Patch (merge data)
await user.patch({
  preferences: { theme: 'dark' }
});

// Reload from server
await user.reload();

// Delete
await user.destroy();
```

### Query DSL Examples

```javascript
// Equality
await User.where({ q: ['eq(status,"active")'] });

// Numeric comparisons
await User.where({ q: ['gt(score,100)', 'lt(age,65)'] });

// Array operations
await User.where({ q: ['in(role,["admin","user"])'] });

// Existence checks
await User.where({ q: ['exists(email,true)'] });

// Multiple conditions
await User.where({ 
  q: ['eq(status,"active")', 'gt(score,100)'],
  order: ['-created_at']
});
```

### Error Handling

```javascript
try {
  const user = await User.find('nonexistent');
  if (!user) {
    console.log('User not found');
  }
} catch (error) {
  console.error('API Error:', error.message);
}
```

## API Reference

### S5 Class

- `new S5(config)` - Create S5 client
- `s5.collection(name)` - Get a collection

### Document Class

#### Static Methods (Class Methods)
- `Document.where(options)` - Find documents
- `Document.find(id)` - Find by ID
- `Document.first(options)` - Find first document
- `Document.count(options)` - Count documents
- `Document.create(data, options)` - Create new document

#### Instance Methods
- `document.save()` - Save (create or update)
- `document.update(data)` - Update document
- `document.patch(data)` - Merge data
- `document.destroy()` - Delete document
- `document.reload()` - Reload from server
- `document.get(key)` - Get nested value
- `document.set(key, value)` - Set nested value

#### Properties
- `document.persisted` - Check if document is saved
- `document.id` - Document ID
- `document.data` - Document data
- `document.version` - Document version
- `document.created_at` - Creation timestamp
- `document.updated_at` - Last update timestamp

## Query DSL Reference

### Operators
- `eq(field,value)` - Equality
- `ne(field,value)` - Not equal
- `gt(field,value)` - Greater than
- `gte(field,value)` - Greater than or equal
- `lt(field,value)` - Less than
- `lte(field,value)` - Less than or equal
- `in(field,values)` - In array
- `nin(field,values)` - Not in array
- `contains(field,value)` - JSON contains
- `exists(field,true/false)` - Field exists

### Ordering
- `order: ['field']` - Ascending
- `order: ['-field']` - Descending
- `order: ['field', '-other']` - Multiple fields

### Examples
```javascript
// Complex query
await User.where({
  q: [
    'eq(status,"active")',
    'gt(score,100)',
    'in(role,["admin","moderator"])'
  ],
  order: ['-last_login', 'name'],
  limit: 50
});
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- **GitHub**: [https://github.com/petersonwynkooptech/s5.js](https://github.com/petersonwynkooptech/s5.js)
- **npm**: [https://www.npmjs.com/package/s5.js](https://www.npmjs.com/package/s5.js)
- **s5 Platform**: [https://superstupidsimple.com](https://superstupidsimple.com)
