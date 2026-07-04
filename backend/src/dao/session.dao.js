import sessionModel from "../models/session.model.js";

/**
 * Creates a new session document for a user.
 * The refresh token will be hashed automatically
 * by the pre('save') middleware in the Session model.
 *
 * @param {Object} params
 * @param {string} params.userId - ID of the user
 * @param {string} params.refreshToken - Plain refresh token
 * @returns {Promise<Document>} Created session document
 */
export const createSession = async ({ userId, refreshToken }) => {
  const session = await sessionModel.create({
    userId,
    refreshToken,
  });

  return session;
};

/**
 * Finds the session document associated with a user.
 *
 * @param {string} userId - ID of the user
 * @returns {Promise<Document|null>} Session document or null if not found
 */
export const getSessionByUserId = async (userId) => {
  const session = await sessionModel.findOne({ userId });

  return session;
};


/**
 * update session by usedID
 * @param {string} userId - ID of the user
 * @param {string} refreshToken - new refresh token
 * @returns {Promise<Document|null>} Updated session document or null if not found
*/

export const updateSessionbyUserId = async (userId, refreshToken)=>{
  const session = await sessionModel.findOneAndUpdate(
    {userId},
    {refreshToken},
    {new:true}
  )
  return session
}


export const deleteSessionByUserId = async (req,res) => {
  const session = await sessionModel.findOneAndDelete({userId})
  return session
  
}