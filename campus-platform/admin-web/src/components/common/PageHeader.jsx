export default function PageHeader({
  eyebrow,
  title,
  text,
  action,
}) {
  return (
    <div className="page-header">
      <div>
        <span className="page-eyebrow">
          {eyebrow}
        </span>

        <h1 className="page-title">
          {title}
        </h1>

        <p className="page-text">
          {text}
        </p>
      </div>

      {action && (
        <div className="page-action">
          {action}
        </div>
      )}
    </div>
  );
}