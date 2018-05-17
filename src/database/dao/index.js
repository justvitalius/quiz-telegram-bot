function save(entity) {
  if (entity) {
    return entity.save();
  } else {
    console.log("Save is not successful. Entity is empty");
    return new Promise();
  }
}

function find(entity, searchCriteria = {}) {
  if (entity) {
    return entity.find(searchCriteria).exec();
  } else {
    console.log(
      "Can't read entities from database. I don't know what type of empty to read"
    );
    return new Promise();
  }
}

function remove(entity, searchCriteria = {}) {
  if (entity) {
    return entity.remove(searchCriteria);
  } else {
    console.log("Remove is not successful. Entity is empty");
    return new Promise();
  }
}

function updateArrayValue(entity, searchCriteria = {}, updateStatement = {}) {
  if (entity) {
    return entity.findOneAndUpdate(searchCriteria, { $set: updateStatement });
  } else {
    console.log("Update is not successful. Entity is empty");
    return new Promise();
  }
}

module.exports = {
  save,
  find,
  remove,
  updateArrayValue
};
