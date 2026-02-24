const mongoose = require('mongoose');
const User = require('./models/User');

console.log('--- USER SCHEMA VERIFICATION START ---');
try {
    const rolePath = User.schema.path('role');
    if (rolePath) {
        console.log('Role Path Found.');
        console.log('Enum Values:', JSON.stringify(rolePath.enumValues));
    } else {
        console.log('Role Path NOT Found!');
    }

    // Test validation manually
    const testAdmin = new User({
        name: 'Test Admin',
        email: 'test@admin.com',
        role: 'admin',
        department: 'CSE'
    });

    console.log('Validating test user...');
    const validationError = testAdmin.validateSync();

    if (validationError) {
        console.log('Validation FAILED:', JSON.stringify(validationError.errors, null, 2));
    } else {
        console.log('Validation PASSED successfully.');
    }

} catch (err) {
    console.error('Error inspecting schema:', err);
}
console.log('--- USER SCHEMA VERIFICATION END ---');
process.exit();
