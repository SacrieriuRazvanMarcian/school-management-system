import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface SchoolClass {
  id: number;
  name: string;
  teacher_id: number | null;
}

interface User {
  id: number;
  email: string;
  role: 'ADMIN' | 'STUDENT' | 'TEACHER';
  student?: { first_name: string; last_name: string; class_id: number | null };
  teacher?: { first_name: string; last_name: string };
}

export function AssignUsers() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  
  const [selectedClassForTeacher, setSelectedClassForTeacher] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  
  const [selectedClassForStudent, setSelectedClassForStudent] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');

  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      const [classesRes, usersRes] = await Promise.all([
        api.get('/classes'),
        api.get('/users')
      ]);
      setClasses(classesRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const teachers = users.filter(u => {
    if (u.role !== 'TEACHER') return false;
    if (selectedClassForTeacher) {
      const currentClass = classes.find(c => c.id === parseInt(selectedClassForTeacher));
      if (currentClass && currentClass.teacher_id === u.id) {
        return false;
      }
    }
    
    return true;
  });  const students = users.filter(u => {
    if (u.role !== 'STUDENT') return false;
    if (selectedClassForStudent) {
        return u.student?.class_id !== parseInt(selectedClassForStudent);
    }
    
    return true;
  });

  const handleAssignTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForTeacher || !selectedTeacher) return;
    
    try {
      await api.patch(`/classes/${selectedClassForTeacher}`, { teacher_id: parseInt(selectedTeacher) });
      setMessage({ text: 'Teacher successfully assigned!', type: 'success' });
      fetchData();
      setSelectedTeacher('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Error assigning teacher.', type: 'error' });
    }
  };

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClassForStudent || !selectedStudent) return;
    
    try {
      await api.patch(`/users/${selectedStudent}`, { role: 'STUDENT', class_id: parseInt(selectedClassForStudent) });
      setMessage({ text: 'Student successfully assigned!', type: 'success' });
      fetchData();
      setSelectedStudent('');
    } catch (err: any) {
      setMessage({ text: err.response?.data?.message || 'Error assigning student.', type: 'error' });
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Assign to Classes</h2>
        <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
      <hr style={{ marginBottom: '30px' }} />

      {message && (
        <div style={{ padding: '10px', marginBottom: '20px', borderRadius: '4px', background: message.type === 'success' ? '#d1e7dd' : '#f8d7da', color: message.type === 'success' ? '#0f5132' : '#842029' }}>
          {message.text}
        </div>
      )}

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        <div style={{ flex: '1', minWidth: '300px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, color: '#0d6efd' }}>Assign Teacher</h3>
          <form onSubmit={handleAssignTeacher} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <select value={selectedClassForTeacher} onChange={e => setSelectedClassForTeacher(e.target.value)} required style={{ padding: '8px' }}>
              <option value="">-- Choose Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} required style={{ padding: '8px' }}>
              <option value="">-- Choose Teacher --</option>
              {teachers.map(t => 
              <option key={t.id} value={t.id}>
                {t.teacher?.last_name} {t.teacher?.first_name} 
                </option>)}
            </select>

            <button type="submit" style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
              Assign Teacher
            </button>
          </form>
        </div>

        <div style={{ flex: '1', minWidth: '300px', background: '#f8f9fa', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0, color: '#198754' }}>Assign Student to Class</h3>
          <form onSubmit={handleAssignStudent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <select value={selectedClassForStudent} onChange={e => setSelectedClassForStudent(e.target.value)} required style={{ padding: '8px' }}>
              <option value="">-- Choose Class --</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} required style={{ padding: '8px' }}>
              <option value="">-- Choose Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.student?.last_name} {s.student?.first_name} {s.student?.class_id ? `(Clasa: ${s.student.class_id})` : '(Unnasigned)'}
                </option>
              ))}
            </select>

            <button type="submit" style={{ background: '#198754', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer' }}>
              Assign Student
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}