import mongoose from "mongoose";

const lastMessageSchema =
  new mongoose.Schema(
    {
      message: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "message",
      },
      sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      content: {
        type: String,
        trim: true,
        default: "",
      },
      createdAt: {
        type: Date,
      },
      status: {
        type: String,
        enum: [
          "sending",
          "sent",
          "delivered",
          "read",
        ],
        default: "sent",
      },
      attachmentsCount: {
        type: Number,
        default: 0,
      },
    },
    { _id: false }
  );

const conversationSchema =
  new mongoose.Schema(
    {
      participants: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
          required: true,
        },
      ],
      isGroup: {
        type: Boolean,
        default: false,
      },
      groupName: {
        type: String,
        trim: true,
        default: "",
      },
      groupAvatar: {
        type: String,
        trim: true,
        default: "",
      },
      admins: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "user",
        },
      ],
      lastMessage: lastMessageSchema,
      lastMessageAt: {
        type: Date,
      },
      unreadCounts: {
        type: Map,
        of: Number,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );

conversationSchema.index({
  participants: 1,
  isGroup: 1,
});
conversationSchema.index({
  lastMessageAt: -1,
  updatedAt: -1,
});

const conversationModel = mongoose.model(
  "conversations",
  conversationSchema
);

export default conversationModel;
