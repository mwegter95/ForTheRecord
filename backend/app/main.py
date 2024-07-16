from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.handler import router as handler_router
from .routes.auth import router as auth_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(handler_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to For the Record DJing Service"}
