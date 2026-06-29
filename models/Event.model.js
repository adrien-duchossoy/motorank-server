const { Schema, model } = require("mongoose")


const eventSchema = new Schema({
  actorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["new_review", "new_follow", "garage_add"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  referenceId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true,
  },
})

eventSchema.index({ actorId: 1, createdAt: -1 })


const Event = model("Event", eventSchema)
module.exports = Event
