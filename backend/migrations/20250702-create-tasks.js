"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("tasks", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      title: { type: Sequelize.STRING, allowNull: false },
      description: { type: Sequelize.TEXT },
      priority: { type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'), defaultValue: 'LOW' },
      processing_type: { type: Sequelize.ENUM('IMAGES'), allowNull: false, defaultValue: 'IMAGES' },
      status: { type: Sequelize.ENUM('PENDING', 'PROCESSING', 'DONE', 'ERROR'), defaultValue: 'PENDING' },
      images_total: { type: Sequelize.INTEGER, defaultValue: 0 },
      images_processed: { type: Sequelize.INTEGER, defaultValue: 0 },
      email_status: { type: Sequelize.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' },
      user_id: { type: Sequelize.INTEGER, references: { model: 'users', key: 'id' }, allowNull: true },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("tasks");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_priority"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_processing_type"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_status"');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_tasks_email_status"');
  },
};
