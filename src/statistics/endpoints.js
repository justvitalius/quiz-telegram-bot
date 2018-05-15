const { getAllUsers, getAllCategories } = require("../database");

module.exports = function(app) {
  app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  //TODO implement
  app.route("/categories").get((req, res) => {
    getAllCategories().then(categories => res.send(categories));
  });

  //TODO implement
  app.route("/gamers").get((req, res) => {
    getAllUsers().then(users => res.send(users));
  });
};
