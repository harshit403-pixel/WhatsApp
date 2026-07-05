import * as userDao from '../dao/user.dao.js'

export const searchUserByUsername = async (req, res) => {
    const { query } = req.query;
   try {
    const users = await userDao.searchUsersByUsername(query);
    res.status(200).json({
        message: "Users fetched successfully",
        data: users
    })
   } catch (error) {
    res.status(500).json({
        message: "Error fetching users",
        error: error.message
    })
   }}