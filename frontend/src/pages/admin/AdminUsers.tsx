import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Search, MoreVertical, Eye, Edit2, Trash2, X, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  phone: string;
  dob: string;
  role: 'student' | 'admin';
  createdAt: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'overview' | 'edit' | 'delete' | null>(null);
  const [currentUser, setCurrentUser] = useState<Partial<User>>({});

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDropdown(activeDropdown === id ? null : id);
  };

  const handleOverview = (user: User) => {
    setActiveDropdown(null);
    setCurrentUser(user);
    setModalType('overview');
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setActiveDropdown(null);
    setCurrentUser(user);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setActiveDropdown(null);
    setCurrentUser(user);
    setModalType('delete');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/users/${currentUser._id}`);
      toast.success("User deleted successfully");
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.put(`/api/admin/users/${currentUser._id}`, currentUser);
      toast.success("User updated successfully");
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const filteredUsers = users.filter(user => {
    const s = search.toLowerCase();
    return (
      user.name?.toLowerCase()?.includes(s) || 
      user.email?.toLowerCase()?.includes(s) ||
      user.phone?.toString().includes(search)
    );
  });

  const handleDownloadCSV = () => {
    if (filteredUsers.length === 0) {
      toast.error("No users to download");
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Date of Birth', 'Joined At'];
    
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => {
        const dob = user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A';
        const joined = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : new Date().toLocaleDateString();
        // Escape quotes and commas in fields by wrapping in double quotes
        return [
          `"${user.name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.phone || ''}"`,
          `"${dob}"`,
          `"${joined}"`
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'registered_users.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success("CSV downloaded!");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] space-y-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">Loading Users...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-visible min-h-[500px]" onClick={() => setActiveDropdown(null)}>
      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50/50 dark:bg-gray-900/50">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">Registered Users</h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center w-full md:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>
      <div className="overflow-x-auto w-full pb-32 min-h-[400px]" ref={dropdownRef}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-gray-300 text-sm border-b border-gray-100 dark:border-gray-700">
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium">Phone</th>
              <th className="px-6 py-4 font-medium">DOB</th>
              <th className="px-6 py-4 font-medium">Joined</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700 relative">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 text-gray-800 dark:text-gray-100 font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'}`}>
                      {(user.role || 'student').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.phone || 'N/A'}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                    {new Date(user.createdAt || Date.now()).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right relative">
                    <button 
                      onClick={(e) => toggleDropdown(user._id, e)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:outline-none"
                    >
                      <MoreVertical size={20} />
                    </button>

                    {/* Dropdown Menu */}
                    {activeDropdown === user._id && (
                      <div className="absolute right-8 top-12 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 overflow-hidden" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleOverview(user)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Eye size={16} className="text-blue-500" /> Overview
                        </button>
                        <button 
                          onClick={() => handleEdit(user)}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
                        >
                          <Edit2 size={16} className="text-orange-500" /> Edit
                        </button>
                        <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                        <button 
                          onClick={() => handleDeleteClick(user)}
                          className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center gap-2"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className={`flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-700 ${modalType === 'delete' ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
              <h2 className={`text-xl font-bold ${modalType === 'delete' ? 'text-red-600 dark:text-red-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {modalType === 'overview' ? 'User Overview' : modalType === 'edit' ? 'Edit User' : 'Delete User'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className={`${modalType === 'delete' ? 'text-red-400 hover:text-red-600' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}>
                <X size={24} />
              </button>
            </div>
            
            {modalType === 'delete' ? (
              <div className="p-6 space-y-6 text-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 size={40} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Are you sure?</h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Do you really want to delete <span className="font-semibold text-gray-800 dark:text-gray-200">{currentUser.name}</span>? This action cannot be undone.
                  </p>
                </div>
                <div className="flex justify-center gap-4 pt-4">
                  <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button onClick={confirmDelete} className="px-6 py-2.5 bg-red-500 text-white font-medium hover:bg-red-600 rounded-xl transition-colors shadow-lg shadow-red-500/30">
                    Yes, Delete User
                  </button>
                </div>
              </div>
            ) : modalType === 'overview' ? (
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{currentUser.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{currentUser.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{currentUser.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date of Birth</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{currentUser.dob ? new Date(currentUser.dob).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100 capitalize">{currentUser.role || 'Student'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleString() : 'N/A'}</p>
                </div>
                <div className="pt-4 flex justify-end">
                  <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={currentUser.name || ''}
                    onChange={e => setCurrentUser({...currentUser, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input 
                    type="email" 
                    required
                    value={currentUser.email || ''}
                    onChange={e => setCurrentUser({...currentUser, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={currentUser.role || 'student'}
                    onChange={e => setCurrentUser({...currentUser, role: e.target.value as 'student' | 'admin'})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="student" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">Student</option>
                    <option value="admin" className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input 
                    type="text" 
                    value={currentUser.phone || ''}
                    onChange={e => setCurrentUser({...currentUser, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-transparent text-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
