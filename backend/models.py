import enum

class RoleEnum(str, enum.Enum):
    admin = "admin"
    team_leader = "team_leader"
    employee = "employee"

class TaskPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"
    Low = "Low"
    Medium = "Medium"
    High = "High"
    Critical = "Critical"

class TaskStatusEnum(str, enum.Enum):
    pending = "pending"
    in_progress = "in_progress"
    completed = "completed"
    delayed = "delayed"
    Pending = "Pending"
    In_Progress = "In Progress"
    Completed = "Completed"
    Delayed = "Delayed"

class UserStatusEnum(str, enum.Enum):
    online = "online"
    active = "active"
    idle = "idle"
    away = "away"
    offline = "offline"
