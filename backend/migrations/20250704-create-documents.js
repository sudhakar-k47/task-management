"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("documents", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      task_id: { type: Sequelize.INTEGER, references: { model: 'tasks', key: 'id' } },
      original_url: { type: Sequelize.STRING, allowNull: false },
      thumb_url: { type: Sequelize.STRING },
      status: { type: Sequelize.ENUM('PENDING', 'PROCESSED', 'FAILED'), defaultValue: 'PENDING' },
      created_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
      updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.fn('NOW') },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("documents");
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_documents_status"');
  },
};
