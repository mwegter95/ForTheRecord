import { useState } from "react";
import axios from "axios";

const useEmail = () => {
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const sendEmail = async (formData) => {
    setStatus({ state: "loading", message: "" });

    try {
      const response = await axios.post(
        "http://localhost:8000/send-email",
        {
          ...formData,
          date: formData.date.toISOString().split("T")[0], // Format date
        }
      );

      if (response.data.message === "Email sent successfully") {
        setStatus({ state: "success", message: "Email sent!" });
      } else {
        setStatus({
          state: "error",
          message: "Unexpected response from server.",
        });
      }
    } catch (error) {
      setStatus({
        state: "error",
        message:
          error.response?.data?.detail ||
          "Failed to send email. Please try again.",
      });
    }
  };

  return { status, sendEmail };
};

export default useEmail;
