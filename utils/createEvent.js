const Event = require("../models/Event.model")

async function createEvent(actorId, type, referenceId, message, metadata = {}) {
  await Event.create({ actorId, type, referenceId, message, metadata })
}

module.exports = createEvent
