import { Router } from "express";
import { logInUser, registerUser, logoutUser, refreshAccessToken } from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { veryfyJWT } from "../middleware/auth.middleware.js";

const router = Router();


router.route('/register').post( 
    upload.fields([
        {
            name:'avatar',
            maxCount:1
        },
        {
            name:'coverImage',
            maxCount:1
        }
    ]),
    registerUser 
);

router.route('/login').post(logInUser)
//secured routes
router.route('/logout').post( veryfyJWT ,logoutUser)
router.route('/refreshtoken').post(refreshAccessToken)

export default router