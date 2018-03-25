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

function readAll(entity, searchCriteria = {}) {
  if (entity) {
    return entity.find(searchCriteria).exec();
  } else {
    console.log(
      "Can't read entities from database. I don't know what type of empty to read"
    );
    return new Promise();
  }
}

module.exports = {
  save,
  readAll
};
