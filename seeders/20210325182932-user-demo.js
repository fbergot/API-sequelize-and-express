'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    // créer plusieurs utilisateurs dans notre base de données :
    await queryInterface.bulkInsert("Users", [
      {
        username: "jacqueline",
        email: "jacqueline.bergot235@gmail.com",
        password: "test",
        isAdmin: false,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      },
      {
        username: "jose",
        email: "jose.bergot235@gmail.com",
        password: "test",
        isAdmin: true,
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {

        await queryInterface.bulkDelete('Users', null, {});
  }
};
