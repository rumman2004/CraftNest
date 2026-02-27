import express from "express";
import {
  createOrder, getMyOrders, getOrderById,
  getAllOrders, updateOrderStatus, deleteOrder,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post  ("/",          protect,             createOrder);
router.get   ("/my",        protect,             getMyOrders);
router.get   ("/:id",       protect,             getOrderById);
router.get   ("/",          protect, adminOnly,  getAllOrders);
router.put   ("/:id/status",protect, adminOnly,  updateOrderStatus);
router.delete("/:id",       protect, adminOnly,  deleteOrder);

export default router;