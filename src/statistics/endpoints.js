const { getAllUsers } = require("../database");

module.exports = function(app) {
  app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  //TODO implement
  app.route("/categories").get((req, res) => {
    res.send([{}]);
  });

  //TODO implement
  app.route("/statistic").get((req, res) => {
    getAllUsers().then(users => res.send(users));
  });
};
