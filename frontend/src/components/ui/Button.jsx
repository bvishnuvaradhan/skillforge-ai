export function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button className={`sf-button sf-button--${variant} ${className}`.trim()} {...props}>
      {children}
    </button>
  );
}

export default Button;