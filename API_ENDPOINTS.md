# API Endpoints Documentation

## Authentication

All endpoints require authentication via JWT token. The token can be provided in two ways:

1. **Cookie**: `auth_token` cookie (automatically set by the frontend)
2. **Authorization Header**: `Bearer YOUR_JWT_TOKEN`

## 🎯 Objectives

### List Objectives
- **GET** `/api/objectives`
- **Description**: Get all objectives for the authenticated user
- **Response**: `{ success: true, objectives: [...] }`

### Create Objective
- **POST** `/api/objectives`
- **Body**:
```json
{
  "title": "Complete project alpha",
  "description": "Finish the main features",
  "deadline": "2024-02-15T10:00:00Z",
  "status": "ACTIVE",
  "priority": "HIGH",
  "details": "Markdown details...",
  "peopleHelp": ["John", "Sarah"],
  "timeNeeded": 120,
  "purpose": "Client delivery",
  "existing": "Some resources available",
  "complexities": "Database integration",
  "resources": { "links": [], "files": [] }
}
```
- **Required**: `title`, `deadline`
- **Response**: `{ success: true, objective: {...} }`

### Get Specific Objective
- **GET** `/api/objectives/{id}`
- **Response**: `{ success: true, objective: {...} }`

### Update Objective
- **PUT** `/api/objectives/{id}`
- **Body**: Same as create (all fields optional)
- **Response**: `{ success: true, objective: {...} }`

### Delete Objective
- **DELETE** `/api/objectives/{id}`
- **Response**: `{ success: true, message: "Objective deleted successfully" }`

## ✅ Tasks

### List Tasks
- **GET** `/api/tasks`
- **Description**: Get all tasks for the authenticated user
- **Response**: `{ success: true, tasks: [...] }`

### Create Task
- **POST** `/api/tasks`
- **Body**:
```json
{
  "title": "Implement user authentication",
  "description": "Add JWT-based auth system",
  "priority": "HIGH",
  "status": "BACKLOG",
  "limitDate": "2024-02-10T18:00:00Z",
  "details": "Markdown details...",
  "peopleHelp": ["Developer Team"],
  "timeNeeded": 240,
  "purpose": "Security requirement",
  "existing": "Auth framework available",
  "complexities": "Token refresh logic",
  "resources": { "docs": [], "examples": [] },
  "objectiveId": "obj_123"
}
```
- **Required**: `title`
- **Response**: `{ success: true, task: {...} }`

### Get/Update/Delete Task
- **GET/PUT/DELETE** `/api/tasks/{id}`
- Similar patterns to objectives

## 🔔 Reminders

### List Reminders
- **GET** `/api/reminders`
- **Response**: `{ success: true, reminders: [...] }`

### Create Reminder
- **POST** `/api/reminders`
- **Body**:
```json
{
  "text": "Call client about project status",
  "date": "2024-02-12T15:30:00Z",
  "isNear": false,
  "alertEnabled": true,
  "alertMinutes": 60,
  "completed": false
}
```
- **Required**: `text`, `date`
- **Response**: `{ success: true, reminder: {...} }`

## 🤝 Meetings

### List Meetings
- **GET** `/api/meetings`
- **Response**: `{ success: true, meetings: [...] }`

### Create Meeting
- **POST** `/api/meetings`
- **Body**:
```json
{
  "title": "Sprint Planning",
  "description": "Plan next sprint features",
  "datetime": "2024-02-14T10:00:00Z",
  "duration": 60,
  "alertEnabled": true,
  "alertMinutes": 5,
  "completed": false
}
```
- **Required**: `title`, `datetime`
- **Response**: `{ success: true, meeting: {...} }`

## 📝 Notes

### List Notes
- **GET** `/api/notes`
- **Response**: `{ success: true, notes: [...] }`

### Create Note
- **POST** `/api/notes`
- **Body**:
```json
{
  "title": "Meeting Notes",
  "content": "# Sprint Planning\n\n- Feature A\n- Feature B",
  "project": "Project Alpha",
  "tags": ["planning", "sprint"],
  "isNotebook": false,
  "notebookDate": null
}
```
- **Required**: `content`
- **Response**: `{ success: true, note: {...} }`

## 👤 User Profile

### Get User Profile
- **GET** `/api/user/profile`
- **Response**: `{ success: true, user: {...} }`

## 🔐 Authentication Endpoints

### Register
- **POST** `/api/auth/register`
- **Body**: `{ username, email, password }`

### Login
- **POST** `/api/auth/login`
- **Body**: `{ username, password }`

### Verify Token
- **POST** `/api/auth/verify`
- **Body**: `{ token }`

## 🚨 Error Responses

All endpoints return consistent error format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `404` - Not Found
- `500` - Internal Server Error

## 🔒 Data Isolation

- All endpoints automatically scope data to the authenticated user
- Users can only access their own data
- Cross-user data access is prevented at the database level

## 📊 Features Implemented

✅ **Full CRUD Operations** for all entities  
✅ **JWT Authentication** via cookies and headers  
✅ **Data Validation** with required field checks  
✅ **User Data Isolation** - secure multi-user support  
✅ **Error Handling** with consistent response format  
✅ **TypeScript Support** with proper type safety  
✅ **Database Relationships** ready for future enhancements  

## 🧪 Testing

You can test the endpoints using curl or any API client:

```bash
# Login to get token
curl -X POST http://localhost:4321/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'

# Create a task
curl -X POST http://localhost:4321/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"title": "Test Task", "priority": "HIGH"}'

# Get all tasks
curl http://localhost:4321/api/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🚀 Ready for Frontend Integration

These endpoints are now ready to be consumed by your React components in the dashboard! Each endpoint follows RESTful conventions and provides comprehensive CRUD functionality for your task management system. 