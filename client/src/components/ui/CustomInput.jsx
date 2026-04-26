const CustomInput = ({ label, type = "text", placeholder, value, onChange }) => (
  <div className="flex flex-col gap-2 w-full">
    <label className="text-sm font-medium text-gray-300">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white 
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                 transition-all placeholder:text-gray-500"
    />
  </div>
);

export default CustomInput;