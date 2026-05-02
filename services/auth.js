const crypto = require('crypto');

// Hardcoded users with encrypted passwords
const users = {
    superuser: {
        password: hashPassword('abcd1234'),
        role: 'superuser'
    },
    ssinha94: {
        password: hashPassword('abcd1234'),
        role: 'manufacturer'
    },
    josh: {
        password: hashPassword('abcd1234'),
        role: 'distributor'
    },
    zensparx: {
        password: hashPassword('abcd1234'),
        role: 'retailer'
    },
    nicolette: {
        password: hashPassword('abcd1234'),
        role: 'auditor'
    }
};

// Simple password hashing function
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
function verifyPassword(inputPassword, hashedPassword) {
    return hashPassword(inputPassword) === hashedPassword;
}

// Authenticate user
function authenticateUser(username, password) {
    const user = users[username];
    
    if (!user) {
        return null;
    }
    
    if (!verifyPassword(password, user.password)) {
        return null;
    }
    
    return {
        username,
        role: user.role
    };
}

// Role permissions
const rolePermissions = {
    superuser: ['register', 'query', 'journey'],
    manufacturer: ['register', 'query', 'journey'],
    distributor: ['query', 'journey'],
    retailer: ['query'],
    auditor: ['query', 'journey']
};

// Check if user has permission for an action
function hasPermission(role, action) {
    const permissions = rolePermissions[role];
    return permissions && permissions.includes(action);
}

module.exports = {
    authenticateUser,
    verifyPassword,
    hashPassword,
    hasPermission,
    rolePermissions
};
