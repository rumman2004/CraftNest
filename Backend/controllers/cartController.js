import Cart    from "../models/Cart.js";
import Product from "../models/Product.js";

// ── GET /api/cart ─────────────────────────────────────────────────────────
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      "items.product",
      "name price images stock"
    );

    if (!cart) {
      return res.status(200).json({ items: [], totalPrice: 0 });
    }

    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/cart ────────────────────────────────────────────────────────
export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    // Validate product exists and has enough stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} items in stock` });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        user:  req.user._id,
        items: [{ product: productId, quantity }],
      });
    } else {
      // Check if product already in cart
      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (existingIndex > -1) {
        // Update quantity
        const newQty = cart.items[existingIndex].quantity + quantity;
        if (newQty > product.stock) {
          return res
            .status(400)
            .json({ message: `Only ${product.stock} items in stock` });
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        // Add new item
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();

    // Return populated cart
    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/cart/:productId ──────────────────────────────────────────────
export const updateCartItem = async (req, res) => {
  const { productId }      = req.params;
  const { quantity }       = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    // Validate stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    if (product.stock < quantity) {
      return res
        .status(400)
        .json({ message: `Only ${product.stock} items in stock` });
    }

    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (i) => i.product.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not in cart" });
    }

    item.quantity = quantity;
    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/cart/:productId ───────────────────────────────────────────
export const removeCartItem = async (req, res) => {
  const { productId } = req.params;

  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (i) => i.product.toString() !== productId
    );

    await cart.save();

    const populated = await Cart.findById(cart._id).populate(
      "items.product",
      "name price images stock"
    );

    res.status(200).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/cart ──────────────────────────────────────────────────────
export const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ user: req.user._id });
    res.status(200).json({ message: "Cart cleared", items: [], totalPrice: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};