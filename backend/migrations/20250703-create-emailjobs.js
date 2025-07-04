"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("email_jobs", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      task_id: { type: Sequelize.INTEGER, references: { model: 'tasks', key: 'id' } },
      status: { type: Sequelize.ENUM('PENDING', 'SENT', 'FAILED'), defaultValue: 'PENDING' },
      attempts: { type: Sequelize.INTEGER, defaultValue: 0 },
      last_error: { type: Sequelize.TEXT },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("email_jobs");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_email_jobs_status"');
  },
};
