from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
import logging
import os

router = APIRouter()

class EmailSchema(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: str
    date: str

conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME", "zweetztuph@gmail.com"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD", "ifem zynw iwuq iezm"),
    MAIL_FROM=os.getenv("MAIL_FROM", "mwegter95@gmail.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", "587")),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() == "true",
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() == "true",
    USE_CREDENTIALS=os.getenv("USE_CREDENTIALS", "True").lower() == "true",
    VALIDATE_CERTS=os.getenv("VALIDATE_CERTS", "True").lower() == "true",
)

@router.post("/send-email")
async def send_email(email: EmailSchema):
    logging.info("📤 Preparing to send email")
    logging.info(f"📧 Payload: {email}")
    
    message = MessageSchema(
        subject="🎉 New Booking Request",
        recipients=["mwegter95@gmail.com"],
        body=f"""
        New booking request from {email.firstName} {email.lastName}.

        - Email: {email.email}
        - Phone: {email.phone}
        - Date of Event: {email.date}
        """,
        subtype="plain"
    )

    fm = FastMail(conf)
    try:
        await fm.send_message(message)
        logging.info("✅ Email sent successfully")
        return {"message": "Email sent successfully"}
    except Exception as e:
        logging.error(f"❌ Error sending email: {e}")
        raise HTTPException(status_code=500, detail=str(e))
