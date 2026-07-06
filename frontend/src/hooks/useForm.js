

import { useState } from "react";

export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]:
        type === "checkbox"
          ? checked
          : type === "number"
            ? parseInt(value)
            : type === "file"
              ? files[0]
              : value,
    }));
  };

  return { formData, setFormData, handleChange };
};
