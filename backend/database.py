import gspread
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

CREDENTIALS_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "credentials.json")
SPREADSHEET_NAME = os.getenv("SPREADSHEET_NAME", "MonitoringSystemDB")

def get_gc():
    if not os.path.exists(CREDENTIALS_FILE):
        # We return a dummy object or raise an error.
        # For development, we will raise an error asking to set up credentials.json.
        raise FileNotFoundError(f"Missing {CREDENTIALS_FILE}. Please create it using a Google Cloud Service Account.")
    return gspread.service_account(filename=CREDENTIALS_FILE)

def get_worksheet(name):
    gc = get_gc()
    try:
        sh = gc.open(SPREADSHEET_NAME)
    except gspread.exceptions.SpreadsheetNotFound:
        # Create it if it doesn't exist
        sh = gc.create(SPREADSHEET_NAME)
        # We need to share it to the user's email, but we don't know it here.
        # This might fail if the service account doesn't have permissions in the folder, but default it creates it in the service account's drive.
        print(f"Created new spreadsheet: {sh.url}")
        
    try:
        ws = sh.worksheet(name)
    except gspread.exceptions.WorksheetNotFound:
        ws = sh.add_worksheet(title=name, rows="1000", cols="20")
    return ws

def init_db():
    # Initialize headers for all tables
    tables = {
        "Users": ["id", "email", "hashed_password", "full_name", "role", "is_active", "status", "last_active"],
        "Tasks": ["id", "title", "description", "priority", "status", "deadline", "creator_id", "assignee_id", "created_at"],
        "ActivityLogs": ["id", "user_id", "status", "timestamp"]
    }
    for table_name, headers in tables.items():
        ws = get_worksheet(table_name)
        existing_headers = ws.row_values(1)
        if not existing_headers:
            ws.append_row(headers)

def get_all_records(table_name):
    ws = get_worksheet(table_name)
    return ws.get_all_records()

def insert_record(table_name, record_dict):
    ws = get_worksheet(table_name)
    headers = ws.row_values(1)
    if not headers:
        raise ValueError(f"Table {table_name} has no headers.")
    
    # Ensure ID is generated
    if "id" not in record_dict or not record_dict["id"]:
        record_dict["id"] = str(uuid.uuid4())
        
    row_data = [str(record_dict.get(h, "")) for h in headers]
    ws.append_row(row_data)
    return record_dict

def update_record(table_name, record_id, update_dict):
    ws = get_worksheet(table_name)
    records = ws.get_all_records()
    for i, record in enumerate(records):
        if str(record.get("id")) == str(record_id):
            row_index = i + 2 # +1 for 0-index, +1 for headers
            headers = ws.row_values(1)
            for key, value in update_dict.items():
                if key in headers:
                    col_index = headers.index(key) + 1
                    ws.update_cell(row_index, col_index, str(value))
            return True
    return False

def get_record_by_id(table_name, record_id):
    records = get_all_records(table_name)
    for record in records:
        if str(record.get("id")) == str(record_id):
            return record
    return None
