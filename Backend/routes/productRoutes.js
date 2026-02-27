import express from "express";
import {
  getProducts, getProductById,
  createProduct, updateProduct,
  deleteProduct, addReview,
} from "../controllers/productController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";
import upload                 from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.get  ("/",           getProducts);
router.get  ("/:id",        getProductById);
router.post ("/",           protect, adminOnly, upload.array("images", 5), createProduct);
router.put  ("/:id",        protect, adminOnly, upload.array("images", 5), updateProduct);
router.delete("/:id",       protect, adminOnly, deleteProduct);
router.post ("/:id/review", protect, addReview);

export default router;