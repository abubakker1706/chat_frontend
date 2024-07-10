import { createUserModel, deleteUser, getAll, updateUser, } from "~/server/model/user/userModel";


export const getUser =async()=>{
    const users = await getAll();
    return users;
}

export const createUserController =async(user)=>{
    
      const result = await createUserModel(user)
      return result;
}
export const updateUserController = async (id, user) => {
    const result = await updateUser(id, user);
    return result;
}

export const deleteUserController = async (id) => {
    const result = await deleteUser(id);
    return result;
}