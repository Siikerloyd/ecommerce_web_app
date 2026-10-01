const { z } = require("zod");

const updateDeliveryStatusSchema = z.object({
    status: z.enum(["AVAILABLE", "BUSY", "OFFLINE"])
}).strict();

module.exports = updateDeliveryStatusSchema;