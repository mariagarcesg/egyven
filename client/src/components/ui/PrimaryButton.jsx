const PrimaryButton = ({ children, onClick, type = "button", className = "" }) => (
  <button
    type={type}
    onClick={onClick}
    className={`px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg 
                transition-all duration-300 transform hover:scale-105 active:scale-95 
                shadow-lg hover:shadow-blue-500/50 ${className}`}
  >
    {children}
  </button>
);

export default PrimaryButton;