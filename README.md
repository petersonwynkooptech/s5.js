# S5 JavaScript ORM

A Rails ActiveRecord-like JavaScript ORM for the s5 API.

## Installation

```bash
npm install
```

## Usage

### Basic Setup

```javascript
import S5 from './index.js';

const s5 = new S5({
  baseURL: 'http://localhost:3000/api/v1',
  apiKey: 'ak_your_prefix_your_secret',
  collection: 'users' // default collection
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
  q: ['eq(data.status,"active")', 'gt(data.score,100)']
});

// Find with JSON filter
const filteredUsers = await User.where({
  filter: {
    eq: { 'data.status': 'active' },
    gt: { 'data.score': 100 }
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
console.log(user.get('data.email')); // 'john@example.com'

// Set data
user.set('data.status', 'inactive');
user.set('data.last_login', new Date());

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

// Delete
await user.destroy();

// Reload from server
await user.reload();
```

### Query DSL Examples

```javascript
// Equality
await User.where({ q: ['eq(data.status,"active")'] });

// Numeric comparisons
await User.where({ q: ['gt(data.score,100)', 'lt(data.age,65)'] });

// Array operations
await User.where({ q: ['in(data.role,["admin","user"])'] });

// Existence checks
await User.where({ q: ['exists(data.email,true)'] });

// Multiple conditions
await User.where({ 
  q: ['eq(data.status,"active")', 'gt(data.score,100)'],
  order: ['-data.created_at']
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
    'eq(data.status,"active")',
    'gt(data.score,100)',
    'in(data.role,["admin","moderator"])'
  ],
  order: ['-data.last_login', 'data.name'],
  limit: 50
});
```
