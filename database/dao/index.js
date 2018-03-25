function save(entity, callback) {
  if (entity) {
    entity
      .save()
      .then(() => {
        console.log("Entity saved successfully!");
        if (callback) {
          callback();
        }
      })
      .catch(err => console.log(err));
  } else {
    console.log("Save is not successfully. Entity is empty");
  }
}

function readAll(entity, searchCriteria = {}, callback) {
  if (entity) {
    entity
      .find(searchCriteria)
      .exec()
      .then(results => {
        console.log("Search results: ");
        console.log(results);
        if (callback) {
          callback(results);
        }
      })
      .catch(err => console.log(err));
  } else {
    console.log(
      "Can't read entities from database. I don't know what type of empty to read"
    );
  }
}

module.exports = {
  save,
  readAll
};
