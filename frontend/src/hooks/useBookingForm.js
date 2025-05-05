import { useState } from "react";
import axios from "axios";

const useBookingForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: new Date(),
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await axios.post("http://localhost:8000/send-email", {
        ...formData,
        date: formData.date.toISOString().split("T")[0], // "YYYY-MM-DD"
      });
      if (response.data.message === "Email sent successfully") {
        setSubmitted(true);
      } else {
        setError("Failed to send the email. Please try again later.");
      }
    } catch (error) {
      setError("Failed to send the email. Please try again later.");
    }
  };

  return {
    formData,
    submitted,
    error,
    handleChange,
    handleDateChange,
    handleSubmit,
  };
};

export default useBookingForm;
