import uvicorn
from fastapi import FastAPI
from routes.auth_routes import router
from routes.doctor_routes import doctors_router
from database.connection import database ,metadata, engine
from fastapi.middleware.cors import CORSMiddleware

metadata.create_all(engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()
    
app.include_router(router,prefix="/auth", tags=["auth"])
app.include_router(doctors_router,prefix="/doctors", tags=["doctors"])

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)