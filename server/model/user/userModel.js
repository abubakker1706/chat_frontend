import { connection } from "~/server/db/db";


export const getAll = async () => {
    const sql = 'SELECT * FROM user ';
    
    const [rows] = await connection.execute(sql);
    return rows;
  }

export const createUserModel = async (user) => {

    const {firstname, lastname,dob,email,age}= user
    const formattedDob = new Date(dob.split('/').reverse().join('-')); 
    const sql = 'INSERT INTO user (firstname, lastname, email,dob,age) VALUES (?,?,?,?,?)'

    const [result] = await connection.execute(sql,[firstname,lastname,email,formattedDob,age])
    return result.insertId

}

export const updateUser = async (id, user) => {
    const { firstname, lastname, email, dob, age } = user;
    const formattedDob = new Date(dob.split('/').reverse().join('-'));  // Convert to yyyy-mm-dd format
    const sql = 'UPDATE user SET firstname = ?, lastname = ?, email = ?, dob = ?, age = ? WHERE user_id = ?';
    const [result] = await connection.execute(sql, [firstname, lastname, email, formattedDob, age, id]);
    return result.affectedRows;
}
export const deleteUser = async (id) => {
    const sql = 'DELETE FROM user WHERE user_id = ?';
    const [result] = await connection.execute(sql, [id]);
    return result.affectedRows;
}
