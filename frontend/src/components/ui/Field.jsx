export function Field({ label, hint, children }) {
  return (
    <label className="sf-field">
      <span className="sf-field__label">{label}</span>
      {children}
      {hint ? <span className="sf-field__hint">{hint}</span> : null}
    </label>
  );
}

export default Field;