import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  fetchUsers,
  addEmployee,
  updateUserRole,
  fetchTasks as apiFetchTasks,
  addTask as apiAddTask,
  updateTaskStatus as apiUpdateTaskStatus
} from '../services/api';
import { LayoutDashboard, CheckSquare, Users, Clock, Settings, LogOut, MoreVertical, Plus, Search, Calendar, Activity, ChevronRight, Loader2, Eye, EyeOff, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableSkeleton, TeamSkeleton } from '../components/SkeletonLoader';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const Sidebar = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { logout, user } = useContext(AuthContext);
  
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'tasks', icon: <CheckSquare size={20} />, label: 'Tasks List' },
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { id: 'team', icon: <Users size={20} />, label: 'Team Activity' }
    );
  }

  return (
    <div className={`w-64 glass-panel border-l-0 border-t-0 border-b-0 rounded-none h-screen fixed left-0 top-0 flex flex-col p-6 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center justify-between gap-3 mb-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/30 flex items-center justify-center font-bold text-lg text-white">M</div>
          <h2 className="text-xl font-bold tracking-wide text-slate-800">MonitorSys</h2>
        </div>
        <button onClick={onClose} className="lg:hidden text-slate-500 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100">
          <X size={20} />
        </button>
      </div>
      
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <button 
            key={item.id} 
            onClick={() => {
              setActiveTab(item.id);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === item.id ? 'bg-primary/10 text-primary border border-primary/20 shadow-sm' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'}`}>
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="border-t border-slate-100 pt-4 mt-auto">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

const MobileHeader = ({ user, logout }) => {
  const [showMenu, setShowMenu] = useState(false);
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-100 flex items-center justify-between px-4 z-40 md:hidden shadow-sm">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary shadow-lg shadow-primary/30 flex items-center justify-center font-bold text-base text-white">M</div>
        <h2 className="text-lg font-black tracking-wide text-slate-800">MonitorSys</h2>
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="w-9 h-9 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex-shrink-0 focus:outline-none"
        >
          <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
        </button>
        
        <AnimatePresence>
          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50"
              >
                <div className="px-3 py-2 border-b border-slate-100 mb-1">
                  <p className="font-bold text-sm text-slate-800 truncate">{user?.full_name}</p>
                  <p className="text-xs text-slate-500 capitalize font-medium">{user?.role}</p>
                </div>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

const BottomNavBar = ({ activeTab, setActiveTab, user }) => {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'tasks', icon: <CheckSquare size={20} />, label: 'Tasks' },
  ];

  if (user?.role === 'admin') {
    navItems.push(
      { id: 'team', icon: <Users size={20} />, label: 'Team' }
    );
  }
  


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-slate-100 flex justify-around items-center z-40 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.03)] px-2">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className="flex flex-col items-center justify-center flex-1 h-full py-1 text-slate-500 hover:text-slate-800 transition-colors relative"
          >
            <div className={`p-1 rounded-xl transition-all ${isActive ? 'text-primary scale-110' : 'text-slate-400'}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] font-bold mt-0.5 transition-all ${isActive ? 'text-primary' : 'text-slate-400 font-medium'}`}>
              {item.label}
            </span>
            {isActive && (
              <motion.div 
                layoutId="activeTabIndicator"
                className="absolute top-0 w-8 h-1 bg-primary rounded-full" 
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

const StatCard = ({ title, value, icon, trend, isPositive }) => (
  <motion.div 
    whileHover={{ y: -3 }} 
    className="glass-panel p-3 sm:p-5 relative overflow-hidden group flex flex-col justify-between h-full"
  >
    <div className="flex justify-between items-start mb-2 sm:mb-4">
      <div className="min-w-0 flex-1">
        <p className="text-slate-400 sm:text-slate-500 text-[9px] sm:text-xs font-semibold tracking-wider uppercase truncate">{title}</p>
        <h3 className="text-lg sm:text-3xl font-black text-slate-800 mt-1 sm:mt-2">{value}</h3>
      </div>
      <div className="p-1.5 sm:p-3 bg-indigo-50/80 text-primary rounded-lg sm:rounded-xl group-hover:scale-105 transition-transform flex-shrink-0 ml-1.5">
        {React.cloneElement(icon, { className: "w-3.5 h-3.5 sm:w-5 sm:h-5 text-primary" })}
      </div>
    </div>
    <div className="text-[10px] sm:text-xs border-t border-slate-100 pt-2 sm:mt-2 flex items-center gap-1 text-slate-500 whitespace-nowrap overflow-hidden">
      <span className={`font-bold ${isPositive ? "text-green-600" : "text-amber-500"}`}>{trend}</span>
      <span className="hidden sm:inline text-slate-400 font-medium">vs last week</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showAddTask, setShowAddTask] = useState(false);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }
  const [showEmpPassword, setShowEmpPassword] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');

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
      const data = await apiFetchTasks(user?.id, user?.role);
      setTasks(data || []);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    } finally {
      setLoadingTasks(false);
    }
  };

  const fetchTeam = async () => {
    try {
      setLoadingTeam(true);
      const data = await fetchUsers();
      setTeam(data || []);
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
    if (user && user.role !== 'admin' && ['team'].includes(activeTab)) {
      setActiveTab('dashboard');
    }
  }, [activeTab, user]);

  const handleStatusChange = async (taskId, newStatus) => {
    // ✅ LOCK: Once Completed, status can never be changed back
    const currentTask = tasks.find(t => t.id === taskId);
    if (currentTask?.status === 'Completed') {
      showNotification('This task is already completed and cannot be changed.', 'error');
      return;
    }
    try {
      // Optimistic UI update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await apiUpdateTaskStatus(taskId, newStatus);
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
      await updateUserRole(userId, newRole);
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
      await addEmployee({
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
      setAddEmpError(err.message || "Failed to add employee");
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
      await apiAddTask({
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
      setAddTaskError(err.message || "Failed to create task");
    } finally {
      setAddTaskLoading(false);
    }
  };



  const getAssigneeName = (assigneeId) => {
    const found = team.find(u => String(u.id) === String(assigneeId));
    return found ? found.full_name : 'Unassigned';
  };

  const activeEmployeesCount = team.filter(u => u.status === 'online' || u.status === 'active').length;

  const getMonthlyChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyCounts = months.map(m => ({
      month: m,
      Total: 0,
      Completed: 0,
      Pending: 0
    }));

    tasks.forEach(task => {
      if (!task.created_at) return;
      try {
        const date = new Date(task.created_at);
        const monthIndex = date.getMonth();
        if (monthIndex >= 0 && monthIndex < 12) {
          monthlyCounts[monthIndex].Total += 1;
          if (task.status === 'Completed') {
            monthlyCounts[monthIndex].Completed += 1;
          } else if (task.status === 'Pending') {
            monthlyCounts[monthIndex].Pending += 1;
          }
        }
      } catch (err) {
        console.error("Error parsing date for chart:", err);
      }
    });

    return monthlyCounts;
  };

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
              <>
                {/* Desktop View (Table) */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
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
                                ) : task.status === 'Completed' ? (
                                  // 🔒 LOCKED — Completed is final
                                  <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                    Completed
                                  </span>
                                ) : (
                                  // In Progress — admin can only move forward to Completed
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                      In Progress
                                    </span>
                                    <button
                                      onClick={() => handleStatusChange(task.id, 'Completed')}
                                      className="px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                    >
                                      Mark Complete
                                    </button>
                                  </div>
                                )}
                              </div>
                            ) : (
                              // Employee Side
                              task.status === 'Pending' ? (
                                <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Pending Approval
                                </span>
                              ) : task.status === 'Completed' ? (
                                // 🔒 LOCKED — Completed is final for employee too
                                <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-green-50 text-green-700 border-green-200 flex items-center gap-1.5">
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                  Completed
                                </span>
                              ) : (
                                // In Progress — employee can only move forward to Completed
                                <div className="flex items-center gap-2">
                                  <span className="text-xs px-2.5 py-1.5 rounded-lg font-medium border bg-blue-50 text-blue-700 border-blue-200">
                                    In Progress
                                  </span>
                                  <button
                                    onClick={() => handleStatusChange(task.id, 'Completed')}
                                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
                                  >
                                    Mark as Done
                                  </button>
                                </div>
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

                {/* Mobile View (Gorgeous Cards) */}
                <div className="lg:hidden p-1 sm:p-4 space-y-4">
                  {tasks.map((task) => (
                    <motion.div 
                      key={task.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 border border-slate-100/80 shadow-sm space-y-4"
                    >
                      {/* Title & Priority */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 text-base">{task.title}</h4>
                          <p className="text-xs text-slate-500 leading-relaxed">{task.description}</p>
                        </div>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider ${task.priority === 'High' || task.priority === 'Critical' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{task.priority}</span>
                      </div>

                      {/* Date & Assignee info */}
                      <div className="flex items-center justify-between border-t border-b border-slate-50 py-3 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Calendar size={14} className="text-primary" />
                          <span className="font-semibold">{task.deadline}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <img src={`https://ui-avatars.com/api/?name=${getAssigneeName(task.assignee_id)}&background=random&size=24`} className="rounded-full w-6 h-6 border border-slate-200" alt="" />
                          <span className="font-bold text-slate-700 text-xs">{getAssigneeName(task.assignee_id)}</span>
                        </div>
                      </div>

                      {/* Actions & Status */}
                      <div className="flex items-center justify-between gap-4 pt-1">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-0.5">Status</span>
                          <span className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border ${
                            task.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                            task.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                            'bg-blue-50 text-blue-700 border-blue-100'
                          }`}>
                            {task.status === 'Pending' ? 'Pending Approval' : task.status}
                          </span>
                        </div>

                        {/* Interactive Buttons */}
                        <div className="flex-shrink-0">
                          {user?.role === 'admin' ? (
                            task.status === 'Pending' ? (
                              <button
                                onClick={() => handleStatusChange(task.id, 'In Progress')}
                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-black rounded-xl shadow-md shadow-green-500/20 transition-all cursor-pointer"
                              >
                                Approve
                              </button>
                            ) : task.status === 'In Progress' ? (
                              <button
                                onClick={() => handleStatusChange(task.id, 'Completed')}
                                className="px-4 py-2 bg-primary hover:bg-indigo-600 text-white text-xs font-black rounded-xl shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
                              >
                                Complete
                              </button>
                            ) : null
                          ) : (
                            task.status === 'In Progress' ? (
                              <button
                                onClick={() => handleStatusChange(task.id, 'Completed')}
                                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                              >
                                Mark Done
                              </button>
                            ) : null
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      
      case 'team':
        return (
          <div className="glass-panel overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white/40">
              <h3 className="text-lg font-bold text-slate-800">Live Team Activity</h3>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative w-full sm:w-auto">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search members..." className="w-full sm:w-auto bg-white border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 text-slate-700 shadow-sm" />
                </div>
                {user?.role === 'admin' && (
                  <button onClick={() => setShowAddEmployee(true)} className="w-full sm:w-auto px-4 py-2 bg-primary hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-medium shadow-md">
                    <Plus size={16} /> Add Employee
                  </button>
                )}
              </div>
            </div>
            
            {loadingTeam ? (
              <TableSkeleton />
            ) : (
              <>
                {/* Desktop View (Table) */}
                <div className="hidden lg:block overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                        <th className="p-4 font-semibold">Employee</th>
                        <th className="p-4 font-semibold">Current Status</th>
                        <th className="p-4 font-semibold">Role</th>
                        <th className="p-4 font-semibold">Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {team.map((member) => (
                        <tr key={member.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <img src={`https://ui-avatars.com/api/?name=${member.full_name}&background=random&size=40`} className="rounded-full shadow-sm border border-slate-200" alt="" />
                                <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                              </div>
                              <div>
                                <p className="font-semibold text-sm text-slate-800">{member.full_name}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="capitalize text-sm font-medium flex items-center gap-2 text-slate-700">
                              {member.status === 'online' ? <Activity size={16} className="text-green-500 animate-pulse" /> : <Clock size={16} className="text-slate-400" />}
                              {member.status === 'online' ? 'online' : 'offline'}
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View (Premium rows) */}
                <div className="lg:hidden p-1 sm:p-4 space-y-3.5">
                  {team.map((member) => (
                    <motion.div 
                      key={member.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-4"
                    >
                      {/* Avatar, Info, Status Indicator */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <img src={`https://ui-avatars.com/api/?name=${member.full_name}&background=random&size=44`} className="rounded-full w-11 h-11 border border-slate-200" alt="" />
                            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${member.status === 'online' ? 'bg-green-500' : 'bg-slate-400'}`}></div>
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 text-sm sm:text-base">{member.full_name}</h4>
                            <p className="text-xs text-slate-400 font-medium mt-0.5">{member.email}</p>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider flex items-center gap-1.5 ${
                          member.status === 'online' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                        }`}>
                          {member.status === 'online' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                          {member.status || 'offline'}
                        </span>
                      </div>

                      {/* Role selection & Last active details */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-3.5 text-xs gap-4">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Assigned Role</span>
                          {user?.role === 'admin' ? (
                            <select 
                              value={member.role} 
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-primary bg-slate-50/50 text-slate-700 shadow-sm"
                            >
                              <option value="employee">Employee</option>
                              <option value="admin">Admin</option>
                            </select>
                          ) : (
                            <span className="font-bold text-slate-700 capitalize">{member.role}</span>
                          )}
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] font-bold text-slate-400 block uppercase tracking-wider mb-1">Last Active</span>
                          <span className="font-semibold text-slate-500 block">
                            {member.last_active ? new Date(member.last_active).toLocaleDateString() + ' ' + new Date(member.last_active).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Never'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        );



      default:
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
        team.filter(u => u.status === 'online').slice(0, 2).forEach(member => {
          dynamicAlerts.push({
            text: `${member.full_name} is currently ${member.status}`,
            time: 'Now',
            type: 'success'
          });
        });
        if (dynamicAlerts.length === 0) {
          dynamicAlerts.push({
            text: 'System online & tasks active',
            time: 'Always',
            type: 'success'
          });
        }

        const isAdmin = user?.role === 'admin';

        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2.5 lg:gap-6 mb-6 lg:mb-10">
              <StatCard 
                title="Total Tasks" 
                value={tasks.length} 
                icon={<CheckSquare />} 
                trend={`${tasks.filter(t => t.status === 'Completed').length} done`} 
                isPositive={true} 
              />
              <StatCard 
                title="Completed Tasks" 
                value={tasks.filter(t => t.status === 'Completed').length} 
                icon={<Activity />} 
                trend={`${tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0}% rate`} 
                isPositive={true} 
              />
              <StatCard 
                title="Pending Tasks" 
                value={tasks.filter(t => t.status === 'Pending').length} 
                icon={<Clock />} 
                trend={`${tasks.filter(t => t.status === 'Pending').length} active`} 
                isPositive={false} 
              />
            </div>

            {/* Main Visuals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Monthly Task Analytics Graph */}
              <div className="lg:col-span-2 glass-panel p-4 sm:p-6 min-h-[320px] sm:min-h-[400px] flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start sm:items-center gap-3 mb-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">Monthly Task Analytics</h3>
                    <p className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">Overall task creation and completion trend</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary"></span>
                      <span className="text-[10px] sm:text-xs text-slate-600 font-bold">Total Tasks</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-[10px] sm:text-xs text-slate-600 font-bold">Completed</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[220px] sm:min-h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={getMonthlyChartData()}
                      margin={{ top: 10, right: 5, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="month" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} 
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)',
                          fontFamily: 'inherit'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Total" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorTotal)" 
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Completed" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorCompleted)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Tasks List */}
              <div className="glass-panel p-6 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-slate-800">Recent Tasks</h3>
                  <span className="text-xs bg-primary/10 text-primary font-bold px-2.5 py-1 rounded-full">Latest</span>
                </div>
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[320px]">
                  {tasks.length > 0 ? (
                    tasks.slice().reverse().slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3.5 bg-white/60 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200">
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">{task.title}</p>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                            <Calendar size={12} className="text-primary" /> {task.deadline}
                          </span>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase border ${
                          task.status === 'Completed' ? 'bg-green-50 text-green-600 border-green-200' :
                          task.status === 'Pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                          'bg-blue-50 text-blue-600 border-blue-200'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 font-medium py-10">
                      No recent tasks
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        );
    }
  };

  const { logout } = useContext(AuthContext);

  return (
    <div className="min-h-screen text-slate-800 bg-slate-50 font-sans antialiased relative pb-20 lg:pb-0">
      {/* Mobile Sticky Header */}
      <MobileHeader user={user} logout={logout} />

      {/* Desktop Left Sidebar (always visible on desktop, hidden on mobile) */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={false} 
        onClose={() => {}} 
      />

      {/* Sticky Bottom Navigation Bar for Mobile */}
      <BottomNavBar activeTab={activeTab} setActiveTab={setActiveTab} user={user} />

      {/* Main Content Area */}
      <div className="pl-0 lg:pl-64 pt-16 lg:pt-0 transition-all duration-300">
        <div className="p-4 sm:p-6 lg:p-10">
          {/* Desktop/Tablet Header (hidden on mobile) */}
          <header className="hidden lg:flex justify-between items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-black mb-1 capitalize text-slate-800">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h1>
              <p className="text-slate-500 font-medium">Welcome back, {user?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-bold text-sm text-slate-800">{user?.full_name}</p>
                <p className="text-xs text-slate-500 capitalize font-medium">{user?.role}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
                <img src={`https://ui-avatars.com/api/?name=${user?.full_name}&background=random`} alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </header>

          {/* Mobile Screen Page Title (under top sticky header) */}
          <div className="lg:hidden mb-6 mt-2">
            <h1 className="text-2xl font-black capitalize text-slate-800">{activeTab === 'dashboard' ? 'Overview' : activeTab}</h1>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </div>
      </div>

        {/* Add Employee Modal */}
        {showAddEmployee && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 mx-auto">
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
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-200 mx-auto">
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
              className="fixed top-6 right-6 left-6 sm:left-auto z-[150] max-w-sm sm:w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 flex items-center gap-3.5"
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
  );
};

export default Dashboard;
