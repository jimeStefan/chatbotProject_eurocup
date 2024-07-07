// Define the conversation schema as a plain JavaScript object (POJO)
const conversationSchema = {
  user: { type: String, required: true },  // Assuming user is referenced by some unique identifier
  messages: [
    {
      text: { type: String, required: true },
      sender: { type: String, enum: ['user', 'bot'], required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
};

module.exports = conversationSchema;
