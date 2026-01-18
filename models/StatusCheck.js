const mongoose = require('mongoose');

const StatusCheckSchema = new mongoose.Schema({
  client_name: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// To match the Python model's behavior where id was returned but _id was excluded in some queries,
// Mongoose handles _id automatically. We can use a virtual 'id' if needed, 
// but standard Mongoose _id is usually sufficient.
StatusCheckSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
  }
});

module.exports = mongoose.model('StatusCheck', StatusCheckSchema);
