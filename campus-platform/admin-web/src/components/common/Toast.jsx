import { AnimatePresence, motion } from "framer-motion";
import { FiCheckCircle } from "react-icons/fi";

function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="toast"
          initial={{ opacity: 0, y: 24, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 18, scale: 0.96 }}
        >
          <FiCheckCircle />
          <span>{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export default Toast;