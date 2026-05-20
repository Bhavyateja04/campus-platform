import { motion } from "framer-motion";

export default function CrudModal({
  title,
  description,
  fields,
  value,
  onChange,
  onSubmit,
  onClose,
  submitLabel,
}) {
  return (
    <div className="modal-overlay">
      <motion.div
        className="crud-modal"
        initial={{
          opacity: 0,
          scale: 0.9,
        }}
        animate={{
          opacity: 1,
          scale: 1,
        }}
      >
        <h2>{title}</h2>

        <p>{description}</p>

        <div className="modal-fields">
          {fields.map((field) => (
            <div
              key={field.name}
              className="field-group"
            >
              <label>
                {field.label}
              </label>

              {field.type ===
              "textarea" ? (
                <textarea
                  value={
                    value[
                      field.name
                    ] || ""
                  }
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [field.name]:
                        e.target
                          .value,
                    })
                  }
                />
              ) : field.type ===
                "checkbox" ? (
                <input
                  type="checkbox"
                  checked={
                    value[
                      field.name
                    ] || false
                  }
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [field.name]:
                        e.target
                          .checked,
                    })
                  }
                />
              ) : field.type ===
                "file" ? (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [field.name]:
                        URL.createObjectURL(
                          e.target
                            .files[0]
                        ),
                    })
                  }
                />
              ) : (
                <input
                  type="text"
                  value={
                    value[
                      field.name
                    ] || ""
                  }
                  onChange={(e) =>
                    onChange({
                      ...value,
                      [field.name]:
                        e.target
                          .value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="button-row">
          <button
            className="soft-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary-button"
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
}