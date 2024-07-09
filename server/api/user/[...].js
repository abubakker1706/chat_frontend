
import userController from '../../controller/userController';

const router = createRouter();

router.get('/get-all-users', defineEventHandler((event)=>{
    return 'get-all-users'
}))


export default useBase("/api/user",router.handler);