from sqlalchemy import Column, String, Integer
from db import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    name = Column(String)

class Medicine(Base):
    __tablename__ = "medicines"
    id = Column(String, primary_key=True)
    user_id = Column(String)
    name = Column(String)
    dose = Column(String)
    times = Column(String)  # "08:00,20:00"
