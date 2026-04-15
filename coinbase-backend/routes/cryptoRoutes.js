import { Router } from "express";
import {
  createCrypto,
  getAllCryptos,
  getCryptoById,
  getNewCryptos,
  getTopGainers,
} from "../controllers/cryptoController.js";
import verifyToken from "../middleware/verifyToken.js";

const router = Router();

router.get("/", getAllCryptos);
router.get("/gainers", getTopGainers);
router.get("/new", getNewCryptos);
router.get("/:id", getCryptoById);
router.post("/", verifyToken, createCrypto);

export default router;
