const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync(
    path.join(__dirname, '../keys/private.pem'),
    'utf8'
);

exports.generateToken = (data) => {
    const payload = {
        user_id: data.user_id,
        role: data.role,
        token_version: data.token_version
    };

    const token = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '1h'
    });

    return token;
};