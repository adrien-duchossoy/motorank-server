const { Schema, model } = require("mongoose")


const eventCommentSchema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 500,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
})

eventCommentSchema.index({ eventId: 1, createdAt: 1 })


const EventComment = model("EventComment", eventCommentSchema)
module.exports = EventComment
