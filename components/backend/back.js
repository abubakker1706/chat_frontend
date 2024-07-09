import User from '../model/userModel.js';
import { getRouterParam, readBody } from 'h3';

const userController = {
  createUser: async (event) => {
    const body = await readBody(event);
    const id = await User.create(body);
    return { id };
  },

  getAllUsers: async (event) => {
    const users = await User.getAll();
    return users;
  },

  getUserById: async (event) => {
    const id = getRouterParam(event, 'id');
    const user = await User.getById(id);
    return user;
  },

  updateUser: async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);
    const updatedRows = await User.update(id, body);
    return updatedRows > 0 ? { message: 'User updated successfully' } : { error: 'User not found' };
  },

  deleteUser: async (event) => {
    const id = getRouterParam(event, 'id');
    const deletedRows = await User.delete(id);
    return deletedRows > 0 ? { message: 'User deleted successfully' } : { error: 'User not found' };
  }
};

export default userController;
import { createRouter, defineEventHandler,useBase } from 'h3';
import userController from '../../controller/userController';

const router = createRouter();

router.post('/users', defineEventHandler(userController.createUser));
router.get('/get-all-users', defineEventHandler((event)=>{
    return userController.getAllUsers
}));
router.get('/users/:id', defineEventHandler(userController.getUserById));
router.put('/users/:id', defineEventHandler(userController.updateUser));
router.delete('/users/:id', defineEventHandler(userController.deleteUser));

export default useBase("/api/user",router.handler);
import { connection } from "../db/db.js";

const User = {
  create: async (user) => {
    const { name, email } = user;
    const sql = 'INSERT INTO user (name, email) VALUES (?, ?)';
    const [result] = await connection.execute(sql, [name, email]);
    return result.insertId;
  },

  getAll: async () => {
    const sql = 'SELECT * FROM user';
    const [rows] = await connection.execute(sql);
    return rows;
  },

  getById: async (id) => {
    const sql = 'SELECT * FROM user WHERE id = ?';
    const [rows] = await connection.execute(sql, [id]);
    return rows[0];
  },

  update: async (id, user) => {
    const { name, email } = user;
    const sql = 'UPDATE user SET name = ?, email = ? WHERE id = ?';
    const [result] = await connection.execute(sql, [name, email, id]);
    return result.affectedRows;
  },

  delete: async (id) => {
    const sql = 'DELETE FROM user WHERE id = ?';
    const [result] = await connection.execute(sql, [id]);
    return result.affectedRows;
  }
};

export default User;

import mysql from 'mysql2/promise'

export const connection = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'Abu@1706',
  database: 'user',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


