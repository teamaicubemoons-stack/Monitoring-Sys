import database
import auth
from models import RoleEnum, UserStatusEnum

def seed():
    # Make sure sheets/headers exist
    database.init_db()
    
    users = database.get_all_records("Users")
    
    # Check if admin exists
    admin_exists = any(u.get("email") == "admin@company.com" for u in users)
    if not admin_exists:
        database.insert_record("Users", {
            "email": "admin@company.com",
            "full_name": "System Admin",
            "hashed_password": auth.get_password_hash("admin123"),
            "role": RoleEnum.admin.value,
            "is_active": "True",
            "status": UserStatusEnum.offline.value,
            "last_active": ""
        })
        print("Admin user created: admin@company.com / admin123")
    
    # Check if employee exists
    emp_exists = any(u.get("email") == "employee@company.com" for u in users)
    if not emp_exists:
        database.insert_record("Users", {
            "email": "employee@company.com",
            "full_name": "John Doe",
            "hashed_password": auth.get_password_hash("password123"),
            "role": RoleEnum.employee.value,
            "is_active": "True",
            "status": UserStatusEnum.offline.value,
            "last_active": ""
        })
        print("Employee user created: employee@company.com / password123")
    
    print("Database seeding complete!")

if __name__ == "__main__":
    try:
        seed()
    except Exception as e:
        print("Error during seed:", e)
        print("Ensure 'credentials.json' exists in the backend folder and is a valid Google Service Account key.")
