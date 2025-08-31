
// ===============================
// seeders/20241201000001-demo-users.js
// ===============================
'use strict';
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);

    const users = [
   
      {
        id: uuidv4(),
        firstName: 'Sarah',
        lastName: 'Super',
        email: 'superadmin@pigeonhire.com',
        phone: '+1234567891',
        password: hashedAdminPassword,
        role: 'superadmin',
        verified: true,
        subscribed: true,
        currency: 'USD',
        location: 'San Francisco, USA',
        description: 'Super administrator with ultimate access',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice@example.com',
        phone: '+1234567892',
        password: hashedPassword,
        role: 'user',
        verified: true,
        subscribed: true,
        currency: 'USD',
        location: 'Austin, TX',
        description: 'Community builder and tech enthusiast',
        twitter: '@alicejohnson',
        linkedin: 'linkedin.com/in/alicejohnson',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob@example.com',
        phone: '+1234567893',
        password: hashedPassword,
        role: 'user',
        verified: true,
        subscribed: false,
        currency: 'USD',
        location: 'Seattle, WA',
        description: 'Software developer and startup founder',
        twitter: '@bobsmith',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma@example.com',
        phone: '+1234567894',
        password: hashedPassword,
        role: 'user',
        verified: false,
        subscribed: false,
        currency: 'EUR',
        location: 'London, UK',
        description: 'Digital marketing expert and community manager',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Michael',
        lastName: 'Chen',
        email: 'michael@example.com',
        phone: '+1234567895',
        password: hashedPassword,
        role: 'user',
        verified: true,
        subscribed: true,
        currency: 'USD',
        location: 'Toronto, Canada',
        description: 'AI researcher and innovation consultant',
        linkedin: 'linkedin.com/in/michaelchen',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Users', users, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};
