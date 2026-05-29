import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { api } from '../services/api';
import { LayoutDashboard, CheckSquare, Users, Clock, Settings, LogOut, MoreVertical, Plus, Search, Calendar, Activity, ChevronRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton, TeamSkeleton, AttendanceSkeleton } from '../components/SkeletonLoader';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useContext(AuthContext);
  
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'tasks', icon: <CheckSquare size={20} />, label: 'Tasks List' },
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { id: 'team', icon: <Users size={20} />, label: 'Team Activity' },
      { id: 'attendance', icon: <Clock size={20} />, label: 'Attendance' },
      { id: 'settings', icon: <Settings size={20} />, label: 'Settings' }
    );
  }

  return (
    <div className="w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none h-screen fixed left-0 top-0 flex flex-col p-6 z-50">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/30 flex items-center justify-center font-bold text-lg text-white">M</div>
        <h2 className="text-xl font-bold tracking-wide text-slate-800">MonitorSys</h2>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all mt-auto group">
        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
        <span className="font-medium">Logout</span>
      </button>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend, isPositive }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-panel p-6 relative overflow-hidden group">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
      </div>
      <div className="p-3 bg-indigo-50 rounded-xl text-primary group-hover:scale-110 transition-transform">{icon}</div>
    </div>
    <div className="mt-4 text-sm">
      <span className={isPositive ? "text-green-600 font-medium" : "text-red-500 font-medium"}>{trend}</span> <span className="text-slate-500">vs last week</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(true);
  const [myAttendance, setMyAttendance] = useState([]);

  const showNotification = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const [tasks, setTasks] = useState([]);
  const [team, setTeam] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [loadingTeam, setLoadingTeam] = useState(true);

  // New Employee Form State
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState('employee');
  const [addEmpLoading, setAddEmpLoading] = useState(false);
  const [addEmpError, setAddEmpError] = useState('');

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState('');
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [addTaskError, setAddTaskError] = useState('');

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await api.get('/tasks/');
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const res = await api.get('/users/');
      setTeam(res.data);
    } catch (err) {
      console.error("Error fetching team:", err);
    } finally {
      setLoadingTeam(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchTeam();
      setSelectedMemberId(user.id);
    }
  }, [user]);

  useEffect(() => {
    const fetchMyAttendance = async () => {
      if (!user) return;
      try {
        const response = await api.get(`/users/${user.id}/attendance`);
        setMyAttendance(response.data);
      } catch (err) {
        console.error("Error fetching my attendance for stats:", err);
      }
    };
    fetchMyAttendance();
  }, [user]);

  const fetchAttendance = async (userId) => {
    if (!userId) return;
    setLoadingAttendance(true);
    try {
      const response = await api.get(`/users/${userId}/attendance`);
      setAttendanceLogs(response.data);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      showNotification("Failed to load attendance records.", "error");
    } finally {
      setLoadingAttendance(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'attendance' && selectedMemberId) {
      fetchAttendance(selectedMemberId);
    }
  }, [activeTab, selectedMemberId]);

  // Enforce access control router guard for non-admins
  useEffect(() => {
    if (user && user.role !== 'admin' && ['team', 'attendance', 'settings'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      showNotification(`Task status updated to "${newStatus}"!`);
    } catch (err) {
      console.error("Error updating task status:", err);
      showNotification("Failed to update task status.", "error");
      fetchTasks(); // Revert back by re-fetching
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      setTeam(prev => prev.map(u => String(u.id) === String(userId) ? { ...u, role: newRole } : u));
      await api.put(`/users/${userId}/role`, { role: newRole });
      showNotification("Employee role updated successfully!");
    } catch (err) {
      console.error("Error updating user role:", err);
      showNotification("Failed to update employee role.", "error");
      fetchTeam();
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    setAddEmpLoading(true);
    setAddEmpError('');
    try {
      await api.post('/users/', {
        full_name: empName,
        email: empEmail,
        password: empPassword,
        role: empRole
      });
      showNotification("New employee added successfully!");
      setShowAddEmployee(false);
      setEmpName('');
      setEmpEmail('');
      setEmpPassword('');
      setEmpRole('employee');
      fetchTeam();
    } catch (err) {
      let errorMsg = "Failed to add employee";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc.slice(1).join('.')}: ${d.msg}`).join(", ");
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      }
      setAddEmpError(errorMsg);
    } finally {
      setAddEmpLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!taskAssigneeId) {
      setAddTaskError('Please select an assignee');
      return;
    }
    setAddTaskLoading(true);
    setAddTaskError('');
    try {
      await api.post('/tasks/', {
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: 'Pending',
        deadline: taskDeadline,
        assignee_id: taskAssigneeId
      });
      showNotification("New task created successfully!");
      setShowAddTask(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskPriority('Medium');
      setTaskDeadline('');
      setTaskAssigneeId('');
      fetchTasks();
    } catch (err) {
      let errorMsg = "Failed to create task";
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMsg = err.response.data.detail.map(d => `${d.loc.slice(1).join('.')}: ${d.msg}`).join(", ");
        } else if (typeof err.response.data.detail === 'string') {
          errorMsg = err.response.data.detail;
        } else {
          errorMsg = JSON.stringify(err.response.data.detail);
        }
      }
      setAddTaskError(errorMsg);
    } finally {
      setAddTaskLoading(false);
    }
  };

  const getAssigneeName = (assigneeId) => {
    const found = team.find(u => String(u.id) === String(assigneeId));
    return found ? found.full_name : 'Unassigned';
  };

  const activeEmployeesCount = team.filter(u => u.status === 'online' || u.status === 'active').length;

  const renderContent = () => {
    switch (activeTab) {
      case 'tasks':
        return (
          <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
              <h3 className="text-xl font-bold text-slate-800">
                {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
              </h3>
              <button 
                onClick={() => {
                  if (user?.role === 'employee') {
                    setTaskAssigneeId(user.id);
                  }
                  setShowAddTask(true);
                }} 
                className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md"
              >
                <Plus size={16} /> New Task
              </button>
            </div>
            
            {loadingTasks ? (
              <TableSkeleton />
            ) : tasks.length === 0 ? (
              <div className="text-center p-20 text-slate-500 font-medium">No tasks found. Create a new task to get started!</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="p-4 font-semibold">Task Name</th>
                      <th className="p-4 font-semibold">Priority</th>
                      <th className="p-4 font-semibold">Status</th>
                      <th className="p-4 font-semibold">Deadline Date</th>
                      <th className="p-4 font-semibold">Assignee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <motion.tr 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        key={task.id} 
                        className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors"
                      >
                        <td className="p-4">
                          <h4 className="font-semibold text-slate-800 text-sm">{task.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{task.description}</p>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2.5 py-1 rounded-md font-medium border whitespace-nowrap ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>{task.priority}</span>
                        </td>
                        <td className="p-4 text-sm text-slate-600">
                          {user?.role === 'admin' ? (
                            <div className="flex items-center gap-2">
                              {task.status === 'Pending' ? (
                                <>
                                  <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                                    Pending Approval
                                  </span>
                                  <button
                                    onClick={() => handleStatusChange(task.id, 'In Progress')}
                                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                  >
                                    Approve
                                  </button>
                                </>
                              ) : (
                                <select 
                                  value={task.status} 
                                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                  className={`border rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 ${task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                                >
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              )}
                            </div>
                          ) : (
                            // Employee Side
                            task.status === 'Pending' ? (
                              <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                                Pending Approval
                              </span>
                            ) : (
                              <select 
                                value={task.status} 
                                onChange={(e) => handleStatusChange(task.id, e.target.value)}
                                className={`border rounded-lg px-3 py-1.5 text-sm font-medium outline-none cursor-pointer focus:border-primary focus:ring-2 focus:ring-primary/20 ${task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}
                              >
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            )
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-sm text-slate-600">
                            <Calendar size={16} className="text-primary" /> {task.deadline}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <img src={`https://ui-avatars.com/api/?name=${getAssigneeName(task.assignee_id)}&background=random&size=32`} className="rounded-full shadow-sm border border-slate-200" alt="" />
                            <span className="text-sm font-medium text-slate-700">{getAssigneeName(task.assignee_id)}</span>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      
      case 'team':
        return (
          <div className="glass-panel overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/40">
              <h3 className="text-lg font-bold text-slate-800">Live Team Activity</h3>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search members..." className="bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 shadow-sm" />
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => setShowAddEmployee(true)} className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-md">
                    <Plus size={16} /> Add Employee
                  </button>
                )}
              </div>
            </div>
            
            {loadingTeam ? (
              <TableSkeleton />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="p-4 font-semibold">Employee</th>
                      <th className="p-4 font-semibold">Current Status</th>
                      <th className="p-4 font-semibold">Role</th>
                      <th className="p-4 font-semibold">Last Active</th>
                      <th className="p-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((member) => (
                      <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <img src={`https://ui-avatars.com/api/?name=${member.full_name}&background=random&size=40`} className="rounded-full shadow-sm border border-slate-200" alt="" />
                              <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'online' || member.status === 'active' ? 'bg-green-500' : member.status === 'idle' ? 'bg-yellow-500' : member.status === 'away' ? 'bg-orange-500' : 'bg-slate-400'}`}></div>
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800">{member.full_name}</p>
                              <p className="text-xs text-slate-500">{member.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="capitalize text-sm font-medium flex items-center gap-2 text-slate-700">
                            {member.status === 'online' || member.status === 'active' ? <Activity size={16} className="text-green-500 animate-pulse" /> : <Clock size={16} className="text-slate-400" />}
                            {member.status}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 capitalize">
                          {user?.role === 'admin' ? (
                            <select 
                              value={member.role} 
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="border border-slate-200 rounded-lg px-2.5 py-1 text-sm font-medium outline-none cursor-pointer focus:border-primary bg-white text-slate-700 shadow-sm"
                            >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            member.role
                          )}
                        </td>
                        <td className="p-4 text-sm text-slate-500">
                          {member.last_active ? new Date(member.last_active).toLocaleString() : 'Never'}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              setSelectedMemberId(member.id);
                              setActiveTab('attendance');
                            }}
                            className="text-primary hover:text-indigo-700 transition-colors text-sm font-semibold"
                          >
                            View Logs
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );

      case 'attendance':
        return (
          <div className="glass-panel p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800">Attendance & Hours</h3>
                <p className="text-sm text-slate-500 font-medium mt-0.5">
                  {user?.role === 'admin' ? 'View employee-wise daily working details' : 'Your personal daily work log'}
                </p>
              </div>
              {user?.role === 'admin' && (
                <div className="flex items-center gap-3 bg-white/60 border border-slate-200 rounded-xl px-4 py-2 shadow-sm">
                  <span className="text-sm font-semibold text-slate-500">Employee:</span>
                  <select 
                    value={selectedMemberId} 
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="bg-transparent border-0 font-bold text-sm text-slate-800 outline-none cursor-pointer focus:ring-0"
                  >
                    {team.map(member => (
                      <option key={member.id} value={member.id}>{member.full_name} ({member.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            {loadingAttendance ? (
              <AttendanceSkeleton />
            ) : (
              <div className="space-y-4">
                {attendanceLogs.map((log) => (
                  <div key={log.day} className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                      <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex flex-col items-center justify-center text-primary shadow-sm">
                        <span className="text-xs font-bold uppercase tracking-wider">May</span>
                        <span className="text-xl font-black leading-none">{18 - log.day}</span>
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">Total Hours Logged: {log.total_hours}</p>
                        <p className="text-sm text-slate-500 font-medium">Check In: {log.check_in} • Check Out: {log.check_out}</p>
                      </div>
                    </div>
                    <div className="w-full md:w-1/3">
                      <div className="flex justify-between text-sm mb-1.5 font-medium">
                        <span className="text-slate-600">Productivity Hours</span>
                        <span className="text-secondary">{log.productivity}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200/50">
                        <div className="bg-secondary h-2.5 rounded-full" style={{ width: `${log.productivity}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        // Calculate dynamic total hours from myAttendance
        const totalHours = myAttendance.reduce((acc, log) => {
          const match = log.total_hours.match(/(\d+)h\s*(\d+)m/);
          if (match) {
            const h = parseInt(match[1]);
            const m = parseInt(match[2]);
            return acc + h + m / 60;
          }
          return acc;
        }, 0);
        const displayHours = totalHours > 0 ? `${totalHours.toFixed(1)}h` : "0h";

        // Calculate dynamic average productivity from myAttendance
        const avgProductivity = myAttendance.length > 0
          ? Math.round(myAttendance.reduce((acc, log) => acc + log.productivity, 0) / myAttendance.length)
          : 0;
        const displayProductivity = avgProductivity > 0 ? `${avgProductivity}%` : "0%";

        // Generate dynamic alerts based on live data
        const dynamicAlerts = [];
        tasks.slice(0, 2).forEach(task => {
          const assignee = getAssigneeName(task.assignee_id);
          dynamicAlerts.push({
            text: `Task "${task.title}" is ${task.status.toLowerCase()} for ${assignee}`,
            time: 'Live',
            type: task.status === 'Completed' ? 'success' : 'info'
          });
        });
        team.filter(u => u.status === 'online' || u.status === 'active').slice(0, 2).forEach(member => {
          dynamicAlerts.push({
            text: `${member.full_name} is currently ${member.status}`,
            time: 'Now',
            type: 'success'
          });
        });
        if (dynamicAlerts.length === 0) {
          dynamicAlerts.push({
            text: 'System online & logging active',
            time: 'Always',
            type: 'success'
          });
        }

        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <StatCard title="Total Tasks" value={tasks.length} icon={<CheckSquare />} trend={`${tasks.filter(t => t.status === 'Completed').length} done`} isPositive={true} />
              <StatCard title="Active Team" value={`${activeEmployeesCount}/${team.length}`} icon={<Users />} trend="Online" isPositive={true} />
              <StatCard title="Hours Logged" value={displayHours} icon={<Clock />} trend="This week" isPositive={true} />
              <StatCard title="Productivity Score" value={displayProductivity} icon={<Activity />} trend="Average" isPositive={true} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 glass-panel p-8 min-h-[400px] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Weekly Productivity Trend</h3>
                  <select className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm outline-none font-medium text-slate-700 shadow-sm focus:border-primary">
                    <option>This Week</option>
                    <option>Last Week</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end justify-between gap-3 pt-10">
                  {myAttendance.length > 0 ? (
                    myAttendance.slice().reverse().map((log, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 w-full group">
                        <div className="w-full bg-slate-100 rounded-t-xl relative flex items-end justify-center h-48 overflow-hidden">
                           <div className="w-full bg-primary/80 group-hover:bg-primary transition-colors rounded-t-sm shadow-sm" style={{ height: `${log.productivity}%` }}></div>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">{log.month} {log.day_num}</span>
                      </div>
                    ))
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-medium">No productivity records yet</div>
                  )}
                </div>
              </div>
              <div className="glass-panel p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Recent Alerts</h3>
                </div>
                <div className="space-y-4">
                  {dynamicAlerts.map((notif, i) => (
                    <div key={i} className="flex gap-3 items-start p-3 bg-white/60 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200">
                      <div className={`w-2.5 h-2.5 mt-1.5 rounded-full shadow-sm ${notif.type === 'warn' ? 'bg-yellow-500' : notif.type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{notif.text}</p>
                        <span className="text-xs font-medium text-slate-500">{notif.time}</span>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-sm font-bold text-primary hover:bg-indigo-50 rounded-lg transition-colors mt-2 flex items-center justify-center gap-1 border border-transparent hover:border-indigo-100">
                    View All <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pl-64 text-slate-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-black mb-1 capitalize text-slate-800">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h1>
            <p className="text-slate-500 font-medium">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden md:block">
                <p className="font-bold text-sm text-slate-800">{user?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize font-medium">{user?.role}</p>
             </div>
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm">
               <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
            </div>
          </div>
        </header>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderContent()}
        </motion.div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Add New Employee</h3>
                <button onClick={() => setShowAddEmployee(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleAddEmployee} className="space-y-4">
                {addEmpError && <div className="text-red-500 text-sm font-medium">{addEmpError}</div>}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <input required value={empName} onChange={e => setEmpName(e.target.value)} type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800" placeholder="e.g. Rahul Kumar" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Email Address</label>
                  <input required value={empEmail} onChange={e => setEmpEmail(e.target.value)} type="email" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800" placeholder="rahul@company.com" />
                </div>
                 <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Password</label>
                  <div className="relative">
                    <input 
                      required 
                      value={empPassword} 
                      onChange={e => setEmpPassword(e.target.value)} 
                      type={showEmpPassword ? "text" : "password"} 
                      className="w-full px-4 py-2.5 pr-12 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800" 
                      placeholder="••••••••" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmpPassword(!showEmpPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showEmpPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Role</label>
                  <select value={empRole} onChange={e => setEmpRole(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 cursor-pointer">
                    <option value="employee">Employee</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <button type="submit" disabled={addEmpLoading} className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-bold rounded-lg mt-6 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                  {addEmpLoading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100]">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Create New Task</h3>
                <button onClick={() => setShowAddTask(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleAddTask} className="space-y-4">
                {addTaskError && <div className="text-red-500 text-sm font-medium">{addTaskError}</div>}
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Task Title</label>
                  <input required value={taskTitle} onChange={e => setTaskTitle(e.target.value)} type="text" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800" placeholder="e.g. Design UI Mockups" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Description</label>
                  <textarea required value={taskDesc} onChange={e => setTaskDesc(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 min-h-[80px]" placeholder="Brief description of the task..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Priority</label>
                    <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 cursor-pointer">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Deadline Date</label>
                    <input required value={taskDeadline} onChange={e => setTaskDeadline(e.target.value)} type="date" className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800" />
                  </div>
                </div>
                {user?.role === 'admin' ? (
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Assignee</label>
                    <select required value={taskAssigneeId} onChange={e => setTaskAssigneeId(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-slate-800 cursor-pointer">
                      <option value="">Select Employee</option>
                      {team.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.full_name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200/60 p-3 rounded-lg text-slate-500 text-xs font-semibold">
                    Task will be automatically assigned to yourself and sent to the Admin for approval.
                  </div>
                )}
                <button type="submit" disabled={addTaskLoading} className="w-full py-3 bg-primary hover:bg-indigo-600 text-white font-bold rounded-lg mt-6 shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 disabled:opacity-50">
                  {addTaskLoading ? 'Creating Task...' : 'Create Task'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
        {/* Custom Toast Notification Popup */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9, transition: { duration: 0.2 } }}
              className="fixed top-6 right-6 z-[150] max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-center gap-3.5"
            >
              <div className={`p-2.5 rounded-xl ${toast.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {toast.type === 'success' ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-sm text-slate-800 capitalize">{toast.type}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-50 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Dashboard;
