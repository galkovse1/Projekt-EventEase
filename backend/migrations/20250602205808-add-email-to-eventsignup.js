'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Dodaj polje 'email' v tabelo EventSignups
    await queryInterface.addColumn('EventSignups', 'email', {
      type: Sequelize.STRING,
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Odstrani polje 'email' iz tabele EventSignups
    await queryInterface.removeColumn('EventSignups', 'email');
  }
};
