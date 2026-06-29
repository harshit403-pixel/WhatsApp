import mongoose from "mongoose";
import bcrypt from "bcryptjs";


// Schema to store a user's refresh token session
const sessionSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this session
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User collection
      required: true,
      index: true,
      unique: true, // One session document per user
    },

    // Hashed refresh token
    refreshToken: {
      type: String,
      required: true,
    },
  },
  {
    // Adds createdAt and updatedAt fields automatically
    timestamps: true,
  }
);

/**
 * Middleware that runs before saving the document.
 * If the refresh token has changed, hash it before storing it.
 */
sessionSchema.pre("save", async function () {
  // Skip hashing if the refresh token wasn't modified
  if (!this.isModified("refreshToken")) return;

  // Generate a salt
  const salt = await bcrypt.genSalt(10);

  // Hash the refresh token and store the hashed version
  this.refreshToken = await bcrypt.hash(this.refreshToken, salt);
});

/**
 * Instance method to compare a plain refresh token
 * with the hashed refresh token stored in the database.
 *
 * @param {string} refreshToken - Plain refresh token from the user
 * @returns {Promise<boolean>} True if tokens match, otherwise false
 */
sessionSchema.methods.compareRefreshToken = async function (
  refreshToken
) {
  return await bcrypt.compare(
    refreshToken,
    this.refreshToken
  );
};

// Create the Session model
const sessionModel = mongoose.model(
  "Session",
  sessionSchema
);

// Export the model
export default sessionModel;