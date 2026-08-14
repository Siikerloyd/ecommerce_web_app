const fs = require('fs');
const jwt = require('jsonwebtoken');

const privateKey = fs.readFileSync(
    './keys/private.key',
    'utf8'
);

exports.generateToken = (data) => {
    const payload = {
        userId: data.user_id,
        role: data.role
    };
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
    return token;

};