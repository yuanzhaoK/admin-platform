const fs = require('fs');
const path = require('path');

// Function to create collections using PocketBase JS hooks
const createCollectionScript = `
// Create users collection
try {
  const usersCollection = $app.dao().findCollectionByNameOrId('users');
  console.log('✅ users collection already exists');
} catch (err) {
  console.log('📝 Creating users collection...');
  
  const collection = new Collection({
    name: 'users',
    type: 'auth',
    schema: [
      {
        name: 'name',
        type: 'text',
        required: false,
        options: {
          max: 100
        }
      },
      {
        name: 'avatar',
        type: 'file',
        required: false,
        options: {
          maxSelect: 1,
          maxSize: 5242880,
          mimeTypes: ['image/jpeg', 'image/png', 'image/gif']
        }
      },
      {
        name: 'role',
        type: 'select',
        required: false,
        options: {
          maxSelect: 1,
          values: ['admin', 'user']
        }
      }
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '',
    updateRule: '@request.auth.id = id',
    deleteRule: '@request.auth.id = id || @request.auth.role = "admin"',
    options: {
      allowEmailAuth: true,
      allowUsernameAuth: false,
      allowOAuth2Auth: false,
      requireEmail: true,
      exceptEmailDomains: [],
      onlyEmailDomains: [],
      minPasswordLength: 6
    }
  });
  
  $app.dao().saveCollection(collection);
  console.log('✅ users collection created');
}

// Create products collection  
try {
  const productsCollection = $app.dao().findCollectionByNameOrId('products');
  console.log('✅ products collection already exists');
} catch (err) {
  console.log('📝 Creating products collection...');
  
  const collection = new Collection({
    name: 'products',
    type: 'base',
    schema: [
      {
        name: 'name',
        type: 'text',
        required: true,
        options: {
          max: 100
        }
      },
      {
        name: 'description',
        type: 'text',
        required: false,
        options: {
          max: 500
        }
      },
      {
        name: 'status',
        type: 'select',
        required: true,
        options: {
          maxSelect: 1,
          values: ['active', 'inactive']
        }
      },
      {
        name: 'config',
        type: 'json',
        required: false
      }
    ],
    listRule: '@request.auth.id != ""',
    viewRule: '@request.auth.id != ""',
    createRule: '@request.auth.role = "admin"',
    updateRule: '@request.auth.role = "admin"',
    deleteRule: '@request.auth.role = "admin"'
  });
  
  $app.dao().saveCollection(collection);
  console.log('✅ products collection created');
}

// Create test user
try {
  const admin = $app.dao().findFirstRecordByEmail('users', 'admin@example.com');
  console.log('✅ Test user already exists:', admin.email());
} catch (err) {
  console.log('📝 Creating test user...');
  
  const collection = $app.dao().findCollectionByNameOrId('users');
  const record = new Record(collection, {
    email: 'admin@example.com',
    password: 'admin123',
    passwordConfirm: 'admin123',
    name: 'Admin User',
    role: 'admin',
    verified: true
  });
  
  $app.dao().saveRecord(record);
  console.log('✅ Test user created');
}
`;

// Write the script to a hook file
const hookPath = path.join(__dirname, 'pb_hooks', 'init-collections.pb.js');
fs.writeFileSync(hookPath, createCollectionScript, 'utf8');
console.log('✅ Collection initialization script created at:', hookPath);
console.log('🔄 Restart PocketBase to apply changes'); 