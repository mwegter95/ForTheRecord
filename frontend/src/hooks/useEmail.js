import { useState } from "react";
import emailjs from "@emailjs/browser";

const SERVICE_ID = "service_gg499mn";
const TEMPLATE_ID = "template_rkyxp9c";
const PUBLIC_KEY = "LhsrdX3yXhmH9PHk7";

const useEmail = () => {
  const [status, setStatus] = useState({ state: "idle", message: "" });

  const sendEmail = async (formData) => {
    setStatus({ state: "loading", message: "" });

    const templateParams = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      date: formData.date.toISOString().split("T")[0],
    };

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );
      console.log("EmailJS success:", result.text);
      setStatus({ state: "success", message: "Email sent successfully!" });
    } catch (error) {
      console.error("EmailJS error:", error);
      setStatus({
        state: "error",
        message: "Failed to send email. Please try again.",
      });
    }
  };

  return { status, sendEmail };
};

export default useEmail;
