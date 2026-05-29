from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, TaskPriorityEnum, TaskStatusEnum, UserStatusEnum

# Users
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: RoleEnum = RoleEnum.employee

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    is_active: bool
    status: UserStatusEnum
    
    class Config:
        from_attributes = True

# Authentication
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Tasks
class TaskBase(BaseModel):
    title: str
    description: str
    priority: TaskPriorityEnum
    status: TaskStatusEnum = TaskStatusEnum.pending
    deadline: str # Simplify for sheets

class TaskCreate(TaskBase):
    assignee_id: str

class TaskResponse(TaskBase):
    id: str
    creator_id: str
    assignee_id: str
    created_at: str
    
    class Config:
        from_attributes = True

# Status Update
class StatusUpdate(BaseModel):
    status: UserStatusEnum

class TaskStatusUpdate(BaseModel):
    status: TaskStatusEnum

class RoleUpdate(BaseModel):
    role: RoleEnum
