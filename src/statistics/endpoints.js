const { getAllUsers } = require("../database");

module.exports = function(app) {
  //TODO implement
  app.route("/categories").get();

  //TODO implement
  app.route("/statistic").get((req, res) => {
    getAllUsers().then(users => res.send(users));
  });
};
