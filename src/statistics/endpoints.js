const { getConvertedUsers, getConvertedCategories } = require("./convertor");

module.exports = function(app) {
  app.all("/*", function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

  app.route("/categories").get((req, res) => {
    getConvertedCategories().then(categories => res.send(categories));
  });

  app.route("/gamers").get((req, res) => {
    getConvertedUsers().then(users => res.send(users));
  });
};
