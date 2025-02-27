const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const ProgramSchema = new Schema({
  id: ObjectId,
  created_at: Date,
  name: { type: String },
});

const Program = mongoose.model('programs', ProgramSchema);

module.exports = Program;
