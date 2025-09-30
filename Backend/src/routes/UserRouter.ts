import express from "express";
const router = express.Router();
import userController from "../controllers/UserController";
import verifyAccessToken from "../middlewares/verifyAccessToken";
import verifyRoles from "../middlewares/verifyRole";
import { UserRoleEnum } from "../enums";
import verifyResetToken from "../middlewares/verifyResetToken";
const {
  handleAddUser,
  getAll,
  updateUser,
  deleteUserByPK,
  sendResetPassword,
  enterData,
  resetForgottenPassword,
} = userController;

router.use(verifyAccessToken);
router.get("/users", verifyRoles([UserRoleEnum.SUPER_ADMIN]), getAll);
router.put("/user/:id", verifyRoles([UserRoleEnum.SUPER_ADMIN]), updateUser);
router.delete("/user/:username", verifyRoles([UserRoleEnum.SUPER_ADMIN]), deleteUserByPK);
router.post("/user", verifyRoles([UserRoleEnum.SUPER_ADMIN]), handleAddUser);
router.post("/sendResetPassword", sendResetPassword);

router.use(verifyResetToken);
router.get("/enterData", enterData); 
router.post("/resetForgottenPassword", resetForgottenPassword);
export default router;
