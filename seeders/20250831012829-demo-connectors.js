
// ===============================
// seeders/20241201000003-demo-connectors.js
// ===============================
'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Get community names and user IDs
    const communities = await queryInterface.sequelize.query(
      `SELECT name FROM "Communities" LIMIT 5;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM "Users" WHERE role = 'user' LIMIT 3;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const connectors = [
      {
        id: uuidv4(),
        firstName: 'Jessica',
        lastName: 'Martinez',
        email: 'jessica@example.com',
        phone: '+1555678901',
        role: 'Community Manager',
        description: 'Experienced community manager with 5+ years in tech communities. Passionate about building inclusive environments.',
        sourceOfInfo: 'LinkedIn',
        connectionType: 'Professional',
        connectionPlatform: 'Slack',
        accessRequirement: 'Application Required',
        website: 'https://jessicamartinez.dev',
        otherContact: 'Signal: +1555678901',
        instagram: '@jessica_connects',
        linkedIn: 'linkedin.com/in/jessicamartinez',
        whatsapp: '+1555678901',
        telegram: '@jessicaconnector',
        twitter: '@jess_connects',
        communityName: communities[0]?.name || 'Green Earth Advocates',
        verified: true,
        restrict: false,
        userId: users[0]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'David',
        lastName: 'Kim',
        email: 'david@example.com',
        phone: '+1555789012',
        role: 'Technical Lead',
        description: 'Senior software engineer and tech community advocate. Specializes in mentoring junior developers.',
        sourceOfInfo: 'GitHub',
        connectionType: 'Technical',
        connectionPlatform: 'Discord',
        accessRequirement: 'Open Access',
        website: 'https://davidkim.tech',
        otherContact: 'david@protonmail.com',
        linkedIn: 'linkedin.com/in/davidkimtech',
        whatsapp: '+1555789012',
        twitter: '@davidkimtech',
        communityName: communities[1]?.name || 'Tech Innovators Hub',
        verified: true,
        restrict: false,
        userId: users[1]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Rachel',
        lastName: 'Green',
        email: 'rachel@example.com',
        phone: '+1555890123',
        role: 'Content Creator',
        description: 'Award-winning writer and content strategist helping creative communities grow their online presence.',
        sourceOfInfo: 'Twitter',
        connectionType: 'Creative',
        connectionPlatform: 'Facebook',
        accessRequirement: 'Membership Required',
        website: 'https://rachelgreen.writer',
        instagram: '@rachel_writes',
        linkedIn: 'linkedin.com/in/rachelgreen',
        telegram: '@rachelcreates',
        twitter: '@rachel_creates',
        communityName: communities[2]?.name || 'Creative Writers Circle',
        verified: false,
        restrict: false,
        userId: users[2]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Alex',
        lastName: 'Thompson',
        email: 'alex@example.com',
        phone: '+1555901234',
        role: 'Startup Advisor',
        description: 'Serial entrepreneur and startup mentor with 3 successful exits. Connects founders with investors and resources.',
        sourceOfInfo: 'AngelList',
        connectionType: 'Business',
        connectionPlatform: 'LinkedIn',
        accessRequirement: 'Invitation Only',
        website: 'https://alexthompson.ventures',
        linkedIn: 'linkedin.com/in/alexthompson',
        twitter: '@alex_ventures',
        communityName: communities[3]?.name || 'Startup Founders Network',
        verified: true,
        restrict: false,
        userId: users[0]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Maya',
        lastName: 'Patel',
        email: 'maya@example.com',
        phone: '+1555012345',
        role: 'Remote Work Consultant',
        description: 'Digital nomad lifestyle expert helping professionals transition to remote work. Based in 15+ countries.',
        sourceOfInfo: 'Nomad List',
        connectionType: 'Lifestyle',
        connectionPlatform: 'Discord',
        accessRequirement: 'Open Access',
        website: 'https://mayapatel.nomad',
        instagram: '@maya_nomads',
        linkedIn: 'linkedin.com/in/mayapatel',
        whatsapp: '+1555012345',
        telegram: '@mayanomad',
        twitter: '@maya_nomad',
        communityName: communities[4]?.name || 'Digital Nomads Collective',
        verified: false,
        restrict: false,
        userId: users[1]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: uuidv4(),
        firstName: 'Carlos',
        lastName: 'Rodriguez',
        email: 'carlos@example.com',
        phone: '+1555123789',
        role: 'Environmental Scientist',
        description: 'Climate researcher and sustainability advocate. Bridges the gap between scientific research and community action.',
        sourceOfInfo: 'Research Gate',
        connectionType: 'Academic',
        connectionPlatform: 'Telegram',
        accessRequirement: 'Verification Required',
        website: 'https://carlosrodriguez.science',
        linkedIn: 'linkedin.com/in/carlosrodriguez',
        telegram: '@carloseco',
        twitter: '@carlos_climate',
        communityName: communities[0]?.name || 'Green Earth Advocates',
        verified: true,
        restrict: false,
        userId: users[2]?.id || null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await queryInterface.bulkInsert('Connectors', connectors, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Connectors', null, {});
  }
};
