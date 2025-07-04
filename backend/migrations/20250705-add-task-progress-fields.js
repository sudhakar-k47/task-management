"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("tasks", "images_total", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tasks", "images_processed", {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    });
    await queryInterface.addColumn("tasks", "email_status", {
      type: Sequelize.ENUM("PENDING", "SENT", "FAILED"),
      defaultValue: "PENDING",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("tasks", "images_total");
    await queryInterface.removeColumn("tasks", "images_processed");
    await queryInterface.removeColumn("tasks", "email_status");
  },
};
