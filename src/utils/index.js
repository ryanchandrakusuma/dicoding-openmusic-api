/* eslint-disable camelcase */
class BaseModel {
  constructor(data) {
    Object.assign(this, data);
  }
}

const mapDBToModel = (Model, data) => {
  const {
    created_at, updated_at, deleted_at, ...modelData
  } = data;
  return new Model(modelData);
};

module.exports = { mapDBToModel, BaseModel };
