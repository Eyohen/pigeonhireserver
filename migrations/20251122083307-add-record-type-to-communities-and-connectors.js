'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add recordType column to Communities table
    await queryInterface.addColumn('Communities', 'recordType', {
      type: Sequelize.ENUM('owner record', 'public record'),
      allowNull: false,
      defaultValue: 'public record'
    });

    // Add recordType column to Connectors table
    await queryInterface.addColumn('Connectors', 'recordType', {
      type: Sequelize.ENUM('owner record', 'public record'),
      allowNull: false,
      defaultValue: 'public record'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove recordType column from Communities table
    await queryInterface.removeColumn('Communities', 'recordType');

    // Remove recordType column from Connectors table
    await queryInterface.removeColumn('Connectors', 'recordType');

    // Drop the ENUM type
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Communities_recordType";');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Connectors_recordType";');
  }
};
