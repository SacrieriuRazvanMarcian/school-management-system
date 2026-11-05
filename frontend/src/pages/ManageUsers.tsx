import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface User {
    id: number;
    email: string;
    role: 'ADMIN' | 'STUDENT' | 'TEACHER';
}

const AVAILABLE_SUBJECTS = [
    'Math',
    'English',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'Computer Science',
    'Physical Education',
    'Art'
];

export function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [newEmail, setNewEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState<'ADMIN' | 'TEACHER' | 'STUDENT'>('STUDENT');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [userError, setUserError] = useState('');
    const [editingUser, setEditingUser] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        date_of_birth: '',
        class_id: ''
    });
    const [classes, setClasses] = useState<any[]>([]);

    const [gradesViewUser, setGradesViewUser] = useState<any>(null);
    const [studentGrades, setStudentGrades] = useState<any[]>([]);
    const [isAddingGrade, setIsAddingGrade] = useState(false);
    const [newGradeSubject, setNewGradeSubject] = useState(AVAILABLE_SUBJECTS[0]);
    const [newGradeValue, setNewGradeValue] = useState<number>(10);
    const [newGradeDate, setNewGradeDate] = useState(new Date().toISOString().split('T')[0]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (err) {
            console.error('Error getting users', err);
        }
    };

    const fetchClasses = async () => {
        try {
            const res = await api.get('/classes');
            setClasses(res.data);
        } catch (err) {
            console.error('Error getting classes', err);
        }
    }

    useEffect(() => {
        fetchUsers();
        fetchClasses();
        const token = localStorage.getItem('token');
        if (token) {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setCurrentUserId(payload.sub || payload.id);
        }
    }, []);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setUserError('');
        try {
            const payload: any = {
                email: newEmail,
                password: newPassword,
                role: newRole,
            };
            if (newRole === 'STUDENT' || newRole === 'TEACHER') {
                payload.first_name = firstName;
                payload.last_name = lastName;
            }
            if (newRole === 'STUDENT') {
                payload.date_of_birth = dateOfBirth;
            }
            await api.post('/users', payload);

            setFirstName('');
            setLastName('');
            setDateOfBirth('');
            setNewEmail('');
            setNewPassword('');
            setNewRole('STUDENT');
            fetchUsers();
        } catch (err: any) {
            setUserError(
                Array.isArray(err.response?.data?.message)
                    ? err.response.data.message.join(', ')
                    : err.response?.data?.message || 'Error creating user.'
            );
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (err: any) {
                alert(err.response?.data?.message || 'Error deleting user');
            }
        }
    };

    const handleEdit = (user: any) => {
        const profile = user.student || user.teacher || {};

        setEditingUser(user);
        setEditForm({
            email: user.email,
            password: '',
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            date_of_birth: profile.date_of_birth || '',
            class_id: profile.class_id || ''
        });
    };

    const handleSaveChanges = async () => {
        try {
            const payload: any = {
                email: editForm.email,
                first_name: editForm.first_name,
                last_name: editForm.last_name
            };

            if (editForm.password && editForm.password.trim() !== '') {
                payload.password = editForm.password;
            }

            if (editingUser.role === 'STUDENT') {
                payload.date_of_birth = editForm.date_of_birth;
                payload.class_id = editForm.class_id ? Number(editForm.class_id) : null;
            }

            await api.patch(`/users/${editingUser.id}`, payload);

            alert('User updated successfully!');
            setEditingUser(null);

        } catch (err) {
            console.error(err);
            alert('Failed to update user.');
        }
    };

    const handleViewGrades = async (user: any) => {
        try {
            setGradesViewUser(user);
            const res = await api.get(`/grades/student/${user.student.user_id}`);
            setStudentGrades(res.data);
        } catch (err) {
            console.error(err);
            alert('Failed to load grades.');
        }
    };

    const handleEditGrade = async (grade: any) => {
        const newVal = window.prompt("Add new grade from (1-10):", grade.value);

        if (newVal && !isNaN(Number(newVal))) {
            const numericGrade = Number(newVal);
            if (numericGrade < 1 || numericGrade > 10) {
                alert("Grade must be between 1 and 10!");
                return;
            }

            try {
                await api.patch(`/grades/${grade.id}`, { value: numericGrade });
                const res = await api.get(`/grades/student/${gradesViewUser.student.user_id}`);
                setStudentGrades(res.data);
                alert('Grade updated.');
            } catch (err) {
                alert('Error editing grade.');
            }
        }
    };

    const handleDeleteGrade = async (gradeId: number) => {
        if (window.confirm("Are you sure you want to remove this grade?")) {
            try {
                await api.delete(`/grades/${gradeId}`);
                const res = await api.get(`/grades/student/${gradesViewUser.student.user_id}`);
                setStudentGrades(res.data);
            } catch (err) {
                alert('Error deleting grade.');
            }
        }
    };
    const handleAddGrade = async () => {
        if (!newGradeSubject || !newGradeDate) {
            alert("Add new subject.");
            return;
        }

        try {
            const studentProfileId = gradesViewUser.student.id || gradesViewUser.student.user_id;

            await api.post('/grades', {
                student_id: studentProfileId,
                subject: newGradeSubject,
                value: Number(newGradeValue),
                date: newGradeDate,
            });

            setIsAddingGrade(false);
            setNewGradeSubject(AVAILABLE_SUBJECTS[0]);
            setNewGradeValue(10);
            setNewGradeDate(new Date().toISOString().split('T')[0]);


            const res = await api.get(`/grades/student/${studentProfileId}`);
            setStudentGrades(res.data);
            alert('Grade successfully added!');

        } catch (err) {
            console.error(err);
            alert('Error adding grade.');
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Manage users</h2>
                <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                    Back to Dashboard
                </button>
            </div>
            <hr />

            {userError && <p style={{ color: 'red' }}>{userError}</p>}

            <form onSubmit={handleCreateUser} style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
                <select value={newRole} onChange={(e) => setNewRole(e.target.value as any)}>
                    <option value="STUDENT">Student</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ADMIN">Admin</option>
                </select>

                <input type="email" placeholder="Email" required value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                <input type="password" placeholder="Parolă" required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />

                {(newRole === 'STUDENT' || newRole === 'TEACHER') && (
                    <>
                        <input type="text" placeholder="Last name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                        <input type="text" placeholder="First name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </>
                )}
                {newRole === 'STUDENT' && (
                    <input type="date" required value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} />
                )}

                <button type="submit" style={{ padding: '5px 15px', cursor: 'pointer' }}>Add User</button>
            </form>
            {
                gradesViewUser ? (
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3>Grades for: {gradesViewUser.student.last_name} {gradesViewUser.student.first_name}</h3>
                            <button
                                onClick={() => setIsAddingGrade(!isAddingGrade)}
                                style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}
                            >
                                {isAddingGrade ? 'Cancel Add' : '+ Add Grade'}
                            </button>
                            <button
                                onClick={() => setGradesViewUser(null)}
                                style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Back to Users
                            </button>
                        </div>
                        {isAddingGrade && (
                            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '4px', marginTop: '15px', display: 'flex', gap: '15px', alignItems: 'flex-end', border: '1px solid #ccc' }}>
                                <label style={{ display: 'flex', flexDirection: 'column' }}>
                                    Subject:
                                    <select
                                        value={newGradeSubject}
                                        onChange={(e) => setNewGradeSubject(e.target.value)}
                                        style={{ padding: '6px', marginTop: '5px' }}
                                    >
                                        {AVAILABLE_SUBJECTS.map(subj => (
                                            <option key={subj} value={subj}>{subj}</option>
                                        ))}
                                    </select>
                                </label>

                                <label style={{ display: 'flex', flexDirection: 'column' }}>
                                    Grade:
                                    <select
                                        value={newGradeValue}
                                        onChange={(e) => setNewGradeValue(Number(e.target.value))}
                                        style={{ padding: '6px', marginTop: '5px', width: '80px' }}
                                    >
                                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </label>
                                <label style={{ display: 'flex', flexDirection: 'column' }}>
                                    Date:
                                    <input
                                        type="date"
                                        value={newGradeDate}
                                        onChange={(e) => setNewGradeDate(e.target.value)}
                                        style={{ padding: '5px', marginTop: '5px' }}
                                    />
                                </label>
                                <button
                                    onClick={handleAddGrade}
                                    style={{ background: '#198754', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Save Grade
                                </button>
                            </div>
                        )}
                        <table style={{ width: '100%', marginTop: '20px', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#eee' }}>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Subject</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Grade</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Date</th>
                                    <th style={{ padding: '10px', borderBottom: '2px solid #ccc' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {studentGrades.length === 0 ? (
                                    <tr><td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>No grades for this student.</td></tr>
                                ) : (
                                    studentGrades.map(grade => (
                                        <tr key={grade.id} style={{ textAlign: 'center', borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '10px' }}>{grade.subject}</td>
                                            <td style={{ fontWeight: 'bold', color: grade.value >= 5 ? '#198754' : '#dc3545' }}>{grade.value}</td>
                                            <td>{new Date(grade.date).toLocaleDateString()}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleEditGrade(grade)}
                                                    style={{ background: '#ffc107', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteGrade(grade.id)}
                                                    style={{ background: '#dc3545', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                ) : editingUser ? (
                    <div style={{ background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
                        <h3>Edit User: {editingUser.role}</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px' }}>

                            <label>Email:
                                <input
                                    type="email"
                                    value={editForm.email}
                                    onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </label>
                            <label>Set / Reset Password:
                                <input
                                    type="password"
                                    placeholder="Leave empty to keep current password"
                                    value={editForm.password}
                                    onChange={e => setEditForm({ ...editForm, password: e.target.value })}
                                    style={{ width: '100%', padding: '8px' }}
                                />
                            </label>

                            {editingUser.role !== 'ADMIN' && (
                                <>
                                    <label>First Name:
                                        <input
                                            type="text"
                                            value={editForm.first_name}
                                            onChange={e => setEditForm({ ...editForm, first_name: e.target.value })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </label>

                                    <label>Last Name:
                                        <input
                                            type="text"
                                            value={editForm.last_name}
                                            onChange={e => setEditForm({ ...editForm, last_name: e.target.value })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </label>
                                </>)
                            }

                            {editingUser.role === 'STUDENT' && (
                                <>
                                    <label>Date of Birth:
                                        <input
                                            type="date"
                                            value={editForm.date_of_birth}
                                            onChange={e => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </label>

                                    <label>Assign to Class:
                                        <select
                                            value={editForm.class_id}
                                            onChange={e => setEditForm({ ...editForm, class_id: e.target.value })}
                                            style={{ width: '100%', padding: '8px' }}
                                        >
                                            <option value="">-- No Class --</option>
                                            {classes.map(cls => (
                                                <option key={cls.id} value={cls.id}>{cls.name}</option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                <button onClick={handleSaveChanges} style={{ background: '#198754', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Save Changes
                                </button>
                                <button onClick={() => setEditingUser(null)} style={{ background: '#6c757d', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                    Cancel
                                </button>
                            </div>

                        </div>
                    </div>
                ) : (<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#eee' }}>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Email</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Role</th>
                            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.email}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.role}</td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                    {user.id !== currentUserId && (
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            style={{ background: 'red', color: 'white', padding: '5px 10px', cursor: 'pointer', border: 'none' }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '8px' }}><button onClick={() => handleEdit(user)}>Edit</button>
                                    {user.role === 'STUDENT' && (
                                        <button
                                            onClick={() => handleViewGrades(user)}
                                            style={{ background: '#0dcaf0', color: 'black', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', marginLeft: '10px' }}
                                        >
                                            View Grades
                                        </button>
                                    )}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>)}
        </div>
    );
}