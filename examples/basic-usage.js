import S5 from '../index.js';

// Example: Basic usage of S5 JavaScript ORM
async function basicExample() {
  console.log('📚 S5 JavaScript ORM - Basic Usage Example\n');

  // Initialize S5 client
  const s5 = new S5({
    apiKey: 'ak_your_prefix_your_secret' // Replace with your actual API key
  });

  // Get a collection (like a Rails model)
  const User = s5.collection('users');

  try {
    // Create a new user
    console.log('Creating user...');
    const user = await User.create({
      name: 'Alice Johnson',
      email: 'alice@example.com',
      role: 'admin',
      status: 'active',
      settings: {
        theme: 'dark',
        notifications: true
      }
    });
    console.log('✅ User created with ID:', user.id);

    // Find user by ID
    console.log('\nFinding user...');
    const foundUser = await User.find(user.id);
    console.log('✅ Found user:', foundUser.get('name'));

    // Update user
    console.log('\nUpdating user...');
    foundUser.set('role', 'super_admin');
    foundUser.set('last_login', new Date().toISOString());
    await foundUser.save();
    console.log('✅ User updated');

    // Query users
    console.log('\nQuerying users...');
    const allUsers = await User.all();
    console.log(`✅ Found ${allUsers.documents.length} users`);

    // Query with conditions
    console.log('\nQuerying active users...');
    const activeUsers = await User.where({
      q: ['eq(status,"active")']
    });
    console.log(`✅ Found ${activeUsers.documents.length} active users`);

    // Clean up
    console.log('\nCleaning up...');
    // await foundUser.destroy();
    // console.log('✅ User deleted');
    console.log(allUsers.documents.map(user => user.attributes()));

    allUsers.documents.forEach(user => {
      console.log(`🗑️ User: ${user.get('name')} (${user.get('email')})`);
      user.destroy();
    });


  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// export { basicExample };
basicExample();
