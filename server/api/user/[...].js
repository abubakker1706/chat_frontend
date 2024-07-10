import { createUserController, deleteUserController, getUser, updateUserController } from "~/server/controller/user/userController";
import {readBody} from "h3"


const router = createRouter();

router.get('/get-all-users', defineEventHandler(async(event)=>{
    return await getUser()
}))
router.post('/create-user', defineEventHandler(async (event)=>{
    console.log(event,"create user");
    const body = await readBody(event)
    const result = await createUserController(body)
    return result


}))
router.put('/update-user/:id', defineEventHandler(async (event) => {
    const id = event.context.params.id;

    const body = await readBody(event);
    const result = await updateUserController(id, body);
    return { affectedRows: result };  
}));

router.delete('/delete-user/:id', defineEventHandler(async (event) => {
    const id = event.context.params.id;
    const result = await deleteUserController(id);
    return { affectedRows: result };  
}));

export default useBase('/api/user',router.handler);