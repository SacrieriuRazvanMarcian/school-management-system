import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface SchoolClass {
  id: number;
  name: string;
  teacher?: { first_name: string; last_name: string } | null;
  students?: { user_id: number; first_name: string; last_name: string }[];
}

export function ManageClasses() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [className, setClassName] = useState('');
  const [classError, setClassError] = useState('');

  const fetchClasses = async () => {
    try {
      const response = await api.get('/classes');
      setClasses(response.data);
    } catch (err) {
      console.error('Error getting classes', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setClassError('');
    try {
      await api.post('/classes', { name: className });
      setClassName('');
      fetchClasses();
    } catch (err: any) {
      setClassError(err.response?.data?.message || 'Error creating class');
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        await api.delete(`/classes/${id}`);
        fetchClasses();
      } catch (err: any) {
        alert(err.response?.data?.message || 'Error deleting class');
      }
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Classes</h2>
        <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', cursor: 'pointer' }}>
          Back to Dashboard
        </button>
      </div>
      <hr style={{ marginBottom: '30px' }} />

      <div>
        <h3>Add a new class</h3>
        {classError && <p style={{ color: 'red' }}>{classError}</p>}
        
        <form onSubmit={handleCreateClass} style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
          <input 
            type="text" 
            placeholder="Class Name (ex, 10A)" 
            required 
            value={className} 
            onChange={(e) => setClassName(e.target.value)} 
            style={{ padding: '8px', width: '200px' }}
          />
          <button type="submit" style={{ padding: '8px 16px', cursor: 'pointer', background: '#198754', color: 'white', border: 'none', borderRadius: '4px' }}>
            Add class
          </button>
        </form>

        <h3>Classes list</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#eee' }}>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Class name</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Teacher</th>
              <th style={{ border: '1px solid #ddd', padding: '12px' }}>Students</th>
              <th style={{ border: '1px solid #ddd', padding: '12px', width: '100px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classes.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No classes yet.</td>
              </tr>
            ) : (
              classes.map((cls) => (
                <tr key={cls.id}>
                  <td style={{ border: '1px solid #ddd', padding: '12px', fontWeight: 'bold' }}>{cls.name}</td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    {cls.teacher ? (
                      `${cls.teacher.last_name} ${cls.teacher.first_name}`
                    ) : (
                      <span style={{ color: '#dc3545', fontStyle: 'italic', fontSize: '0.9em' }}>Unassigned</span>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                    <details style={{ cursor: 'pointer' }}>
                      <summary style={{ fontWeight: 'bold', color: '#198754' }}>
                        View Students ({cls.students?.length || 0})
                      </summary>
                      {cls.students && cls.students.length > 0 ? (
                        <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '0.9em' }}>
                          {cls.students.map(s => (
                            <li key={s.user_id}>{s.last_name} {s.first_name}</li>
                          ))}
                        </ul>
                      ) : (
                        <p style={{ margin: '5px 0 0 0', fontSize: '0.85em', color: '#666' }}>No students assigned.</p>
                      )}
                    </details>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '12px', textAlign: 'center' }}>
                    <button 
                      onClick={() => handleDeleteClass(cls.id)} 
                      style={{ background: '#dc3545', color: 'white', padding: '5px 10px', cursor: 'pointer', border: 'none', borderRadius: '3px' }}
                    >
                      Delete
                    </button>
                    <button 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to remove the teacher?")) {
                        try {
                          await api.patch(`/classes/${cls.id}`, { teacher_id: null });
                          alert('Teacher was removed from class.');
                          fetchClasses(); 
                        } catch (err) {
                          alert('Error removing teacher from class.');
                        }
                      }
                    }}
                    style={{ background: '#dc3545', color: 'white', marginLeft: '10px' }}
                  >
                    Unassign Teacher
                  </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}