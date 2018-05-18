const http = require("http");
const config = require("config");
const querystring = require("querystring");
const logger = require("../logger")(config.get("bot_server.logDest"));

const { getAllUsers, updateUser } = require("../database");
const { WAIT_QUESTION_STATUS } = require("./user");

module.exports = {
  start
};

function start(callback) {
  return http
    .createServer((req, res) => {
      logger.info("server started");
      res.end("ok");
    })
    .listen(config.get("bot_server.port"))
    .on("request", (req, res) => {
      logger.info("Request %s", { method: req.method, headers: req.headers });
      if (req.method === "POST") {
        let body = "";
        req.on("data", function(chunk) {
          body += chunk;
        });

        req.on("end", _ => {
          const data = JSON.parse(body);
          logger.info("Body %s", data);

          if (req.url === "/sendMessage") {
            sendMessage(data, callback);
          }

          if (req.url === "/revokeFinish") {
            revokeFinish();
          }

          if (req.url === "/clearAnswers") {
            clearAnswers(data);
          }

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(body);
        });
      }
    });
}

/**
{
	"all": true,
	"msg": "<b>Hello</b> man"
}
 */
function sendMessage({ all = false, msg = "" }, callback) {
  logger.info("Will send message to all gamers");
  if (all && msg) {
    getAllUsers()
      .then(
        users =>
          users.map(user =>
            callback(user.telegramId, msg, { parse_mode: "html" })
          )
        // Code without queues;
        // bot
        //   .sendMessage(user.telegramId, msg, { parse_mode: "html" })
        //   .then(_ =>
        //     logger.info(
        //       "Successful send message to gamer=%s",
        //       user.telegramId
        //     )
        //   )
        //   .catch(err =>
        //     logger.error(
        //       "Failed send message to gamer=%s\n%s",
        //       user.telegramId,
        //       err
        //     )
        //   );
      )
      .catch(err => logger.error(err));
  }
}

function revokeFinish() {
  logger.info("Will revoke finish status for all gamers");
  return getAllUsers()
    .then(users =>
      Promise.all(
        users.map(user => {
          user.status = WAIT_QUESTION_STATUS;
          return updateUser(user)
            .then(_ =>
              logger.info(
                "Change gamer=%s to status=%s",
                user.telegramId,
                user.status
              )
            )
            .catch(err =>
              logger.info("Failed change gamer=%s\n%s", user.telegramId, err)
            );
        })
      )
    )
    .catch(err => logger.error("Failed revoke finish status\n%s", err));
}

function clearAnswers({ all = false }) {
  logger.info("Will clear all answers for all gamers");
  if (all) {
    return getAllUsers()
      .then(users =>
        Promise.all(
          users.map(user => {
            user.status = WAIT_QUESTION_STATUS;
            user.answers = [];
            return updateUser(user)
              .then(_ =>
                logger.info(
                  "Change gamer=%s to status=%s, answers=%s",
                  user.telegramId,
                  user.status,
                  user.answers
                )
              )
              .catch(err =>
                logger.info("Failed change gamer=%s\n%s", user.telegramId, err)
              );
          })
        )
      )
      .catch(err => logger.error("Failed clear answers\n%s", err));
  }
}
