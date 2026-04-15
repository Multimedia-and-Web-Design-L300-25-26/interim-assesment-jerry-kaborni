import { Router } from "express";
import { getProfile, login, register } from "../controllers/authController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/register", (req, res) => {
  res.status(200).json({ message: "Use POST /register to create an account." });
});

router.post("/register", register);

router.get("/login", (req, res) => {
  res.status(200).json({ message: "Use POST /login to authenticate." });
});

router.post("/login", login);
router.get("/profile", verifyToken, getProfile);

export default router;
