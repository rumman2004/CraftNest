import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } =
    useCart();
  const navigate = useNavigate();

  const shipping = totalPrice >= 50 ? 0 : 5.99;
  const total = totalPrice + shipping;

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
          <p className="text-8xl mb-6">🛒</p>
          <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything yet!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl
              font-bold text-white bg-gradient-to-r from-rose-400 to-pink-400
              hover:from-rose-500 hover:to-pink-500 transition-all shadow-lg"
          >
            <ShoppingBag size={20} /> Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-3xl font-extrabold bg-gradient-to-r from-rose-500
            to-pink-500 bg-clip-text text-transparent"
        >
          🛒 Your Cart ({totalItems})
        </h1>
        <button
          onClick={() => { clearCart(); toast.success("Cart cleared"); }}
          className="text-sm text-red-400 hover:text-red-500 font-medium
            flex items-center gap-1 transition-colors"
        >
          <Trash2 size={15} /> Clear All
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {items.map((item) => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                className="bg-white dark:bg-gray-800 rounded-3xl p-4 flex
                  items-center gap-4 shadow-sm border border-gray-100
                  dark:border-gray-700/50"
              >
                <img
                  src={item.images?.[0]?.url || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-2xl flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold text-gray-800 dark:text-gray-100
                      text-sm sm:text-base truncate"
                  >
                    {item.name}
                  </h3>
                  <p
                    className="text-pink-500 font-bold text-sm"
                  >
                    ${item.price?.toFixed(2)}
                  </p>
                </div>

                {/* Qty */}
                <div
                  className="flex items-center bg-gray-100 dark:bg-gray-700
                    rounded-2xl overflow-hidden flex-shrink-0"
                >
                  <button
                    onClick={() =>
                      item.quantity <= 1
                        ? removeFromCart(item._id)
                        : updateQuantity(item._id, item.quantity - 1)
                    }
                    className="px-3 py-2 text-gray-600 dark:text-gray-300
                      hover:text-pink-500 font-bold transition-colors"
                  >
                    −
                  </button>
                  <span
                    className="px-3 py-2 text-gray-800 dark:text-gray-100
                      font-semibold text-sm min-w-[2.5rem] text-center"
                  >
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      item.quantity < item.stock &&
                      updateQuantity(item._id, item.quantity + 1)
                    }
                    className="px-3 py-2 text-gray-600 dark:text-gray-300
                      hover:text-pink-500 font-bold transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Subtotal */}
                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p
                    className="font-extrabold text-base bg-gradient-to-r
                      from-rose-500 to-pink-500 bg-clip-text text-transparent"
                  >
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => {
                    removeFromCart(item._id);
                    toast.success("Removed from cart");
                  }}
                  className="text-red-400 hover:text-red-500 transition-colors
                    p-1 flex-shrink-0"
                >
                  <Trash2 size={17} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div
            className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md
              border border-gray-100 dark:border-gray-700/50 sticky top-24"
          >
            <h2
              className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5"
            >
              Order Summary
            </h2>
            <div className="space-y-3 text-sm mb-6">
              <div
                className="flex justify-between text-gray-600 dark:text-gray-400"
              >
                <span>Subtotal ({totalItems} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between text-gray-600 dark:text-gray-400"
              >
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-500 font-semibold" : ""}>
                  {shipping === 0 ? "FREE 🎉" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">
                  Add ${(50 - totalPrice).toFixed(2)} more for free shipping!
                </p>
              )}
              <div
                className="border-t border-gray-200 dark:border-gray-700 pt-3
                  flex justify-between font-bold text-base text-gray-900
                  dark:text-white"
              >
                <span>Total</span>
                <span
                  className="bg-gradient-to-r from-rose-500 to-pink-500
                    bg-clip-text text-transparent"
                >
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate("/user/checkout")}
              className="w-full flex items-center justify-center gap-2 py-3.5
                rounded-2xl font-bold text-white bg-gradient-to-r
                from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500
                transition-all shadow-lg shadow-pink-200/50 dark:shadow-none mb-3"
            >
              Checkout <ArrowRight size={18} />
            </button>
            <Link
              to="/shop"
              className="w-full flex items-center justify-center gap-2 py-3
                rounded-2xl font-semibold text-sm border-2 border-pink-400
                text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20
                transition-colors"
            >
              <ShoppingBag size={16} /> Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;