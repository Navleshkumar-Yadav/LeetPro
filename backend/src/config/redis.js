const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-16057.c98.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 16057
        // host: 'redis-11840.c16.us-east-1-3.ec2.redns.redis-cloud.com',
        // port: 11840
    }
});

module.exports = redisClient;