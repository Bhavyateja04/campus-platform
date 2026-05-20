import { FiX } from "react-icons/fi";
import { motion } from "framer-motion";
function Modal({ children, onClose, wide = false }) {
  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`modal ${wide ? "wide" : ""}`}
        initial={{ scale: 0.94, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.94, y: 20 }}
      >
        <button className="icon-button modal-close" onClick={onClose}>
          <FiX />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}
export default Modal;
