import express from "express"
import {login, registerTestUser} from "../controllers/auth.controler.js"

const router = express.Router()
router.post("/login",login);
// TEMPORARY ENDPOINT - REMOVE IN PRODUCTION
router.post("/register-test", registerTestUser);
export default router;
