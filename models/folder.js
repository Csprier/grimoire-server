const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: { type: String, required: true/* , unique: true */ },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  noteId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }]
}, { timestamps: true });

folderSchema.index({ name: 1, userId: 1 }, { unique: true });

folderSchema.set('toObject', {
  transform: function (doc, ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Folder', folderSchema);