import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface Student {
  user_id: number;
  first_name: string;
  last_name: string;
}

interface SchoolClass {
  id: number;
  name: string;
  teacher_id: number | null;
  teacher?: { user_id: number };
  students?: Student[];
}

interface Grade {
  id: number;
  value: number;
  subject: string;
  date: string;
}

const AVAILABLE_SUBJECTS = [
  'Math', 'English', 'Physics', 'Chemistry', 'Biology',
  'History', 'Geography', 'Computer Science', 'Physical Education', 'Art'
];

export function TeacherDashboard() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<number | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [myClasses, setMyClasses] = useState<SchoolClass[]>([]);

  const [selectedClass, setSelectedClass] = useState<SchoolClass | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [gradeValue, setGradeValue] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeDate, setGradeDate] = useState('');
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);

  const [editingGradeId, setEditingGradeId] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<number>(10);
  const [editGradeSubject, setEditGradeSubject] = useState<string>('');
  const [editGradeDate, setEditGradeDate] = useState<string>('');
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentUserId = payload.sub || payload.id;
      setUserId(currentUserId);

      try {
        const userRes = await api.get(`/users/${currentUserId}`);
        setTeacherProfile(userRes.data.teacher);
      } catch (err) {
        console.error("Nu am putut aduce profilul profesorului");
      }

      const classesRes = await api.get('/classes');
      const filteredClasses = classesRes.data.filter((c: any) =>
        c.teacher_id === currentUserId || (c.teacher && c.teacher.user_id === currentUserId)
      );
      setMyClasses(filteredClasses);
    } catch (err) {
      console.error('Error fetching data', err);
    }
  };

  const handleSelectClass = (cls: SchoolClass) => {
    setSelectedClass(cls);
    setSelectedStudent(null);
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    try {
      const studentProfileId = student.user_id;
      const response = await api.get(`/grades/student/${studentProfileId}`);
      setStudentGrades(response.data);

      setEditingGradeId(null);
    } catch (err) {
      console.error('Error fetching grades', err);
      setStudentGrades([]);
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !userId) return;

    try {
      await api.post('/grades', {
        value: parseInt(gradeValue),
        subject: subject,
        date: gradeDate,
        student_id: selectedStudent.user_id,
      });

      handleSelectStudent(selectedStudent);
      setGradeValue('');
      setSubject('');
      setGradeDate('');
      alert("Grade successfully added.");
    } catch (err) {
      console.error('Error adding grade', err);
      alert('Eroare la adăugarea notei');
    }
  };

  const handleSaveEditGrade = async (gradeId: number) => {
    try {
      await api.patch(`/grades/${gradeId}`, {
        value: Number(editGradeValue),
        subject: editGradeSubject,
        date: editGradeDate
      });

      if (selectedStudent) {
        handleSelectStudent(selectedStudent);
      }
      alert('Grade updated.');
    } catch (err) {
      console.error(err);
      alert('Error updating grade.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Teacher Dashboard</h2>
          {teacherProfile && (
            <span style={{ color: '#555', fontSize: '16px' }}>
              Welcome back, <strong style={{ color: '#000' }}>{teacherProfile.first_name} {teacherProfile.last_name}</strong>
            </span>
          )}
        </div>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', padding: '8px 16px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
      <hr style={{ marginBottom: '30px' }} />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>

        <div style={{ flex: '1', minWidth: '250px' }}>
          <h3>My Assigned Classes</h3>
          {myClasses.length === 0 ? (
            <p style={{ color: '#666' }}>No classes assigned to you yet.</p>
          ) : (
            <ul style={{ listStyleType: 'none', padding: 0 }}>
              {myClasses.map(cls => (
                <li key={cls.id} style={{ marginBottom: '10px' }}>
                  <button
                    onClick={() => handleSelectClass(cls)}
                    style={{
                      width: '100%',
                      padding: '15px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: selectedClass?.id === cls.id ? '#0d6efd' : '#f8f9fa',
                      color: selectedClass?.id === cls.id ? 'white' : 'black',
                      border: '1px solid #ddd',
                      borderRadius: '4px'
                    }}
                  >
                    Class <strong>{cls.name}</strong>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {selectedClass && (
          <div style={{ flex: '2', minWidth: '300px' }}>
            <h3>Manage Grades for {selectedClass.name}</h3>
            {(!selectedClass.students || selectedClass.students.length === 0) ? (
              <p style={{ color: '#666' }}>No students in this class yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <thead>
                  <tr style={{ background: '#eee' }}>
                    <th style={{ border: '1px solid #ddd', padding: '10px' }}>Student Name</th>
                    <th style={{ border: '1px solid #ddd', padding: '10px', width: '150px' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedClass.students.map(student => (
                    <tr key={student.user_id} style={{ background: selectedStudent?.user_id === student.user_id ? '#e9ecef' : 'transparent' }}>
                      <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                        {student.last_name} {student.first_name}
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleSelectStudent(student)}
                          style={{ background: '#198754', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '3px' }}
                        >
                          View/Edit Grades
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', border: '1px solid #ddd', borderRadius: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ marginTop: 0 }}>
              Catalog: {selectedStudent.last_name} {selectedStudent.first_name}
            </h3>
            <button onClick={() => setSelectedStudent(null)} style={{ cursor: 'pointer', padding: '5px 10px' }}>Close Catalog</button>
          </div>

          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>

            <div style={{ flex: '1', minWidth: '250px' }}>
              <h4>Add New Grade</h4>
              <form onSubmit={handleAddGrade} style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  Subject:
                  <select
                    required
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}
                  >
                    <option value="" disabled>-- Select --</option>
                    {AVAILABLE_SUBJECTS.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  Grade:
                  <select
                    required
                    value={gradeValue}
                    onChange={e => setGradeValue(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}
                  >
                    <option value="" disabled>-- Select --</option>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', fontSize: '14px' }}>
                  Date:
                  <input
                    type="date"
                    required
                    value={gradeDate}
                    onChange={e => setGradeDate(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginTop: '5px' }}
                  />
                </label>

                <button type="submit" style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '10px', cursor: 'pointer', borderRadius: '4px', marginTop: '10px' }}>
                  Save New Grade
                </button>
              </form>
            </div>

            <div style={{ flex: '2', minWidth: '350px' }}>
              <h4>Grades History</h4>
              {studentGrades.length === 0 ? (
                <p style={{ color: '#666' }}>No grades recorded yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                  <thead>
                    <tr style={{ background: '#eee' }}>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Subject</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Grade</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Date</th>
                      <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentGrades.map(grade => (
                      <tr key={grade.id} style={{ textAlign: 'center' }}>
                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                          {editingGradeId === grade.id ? (
                            <select
                              value={editGradeSubject}
                              onChange={e => setEditGradeSubject(e.target.value)}
                              style={{ padding: '5px', borderRadius: '4px', width: '100%' }}
                            >
                              {AVAILABLE_SUBJECTS.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                              ))}
                            </select>
                          ) : (
                            grade.subject
                          )}
                        </td>

                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                          {editingGradeId === grade.id ? (
                            <select
                              value={editGradeValue}
                              onChange={e => setEditGradeValue(Number(e.target.value))}
                              style={{ padding: '5px', borderRadius: '4px' }}
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                          ) : (
                            <span style={{ fontWeight: 'bold', color: grade.value >= 5 ? '#198754' : '#dc3545' }}>
                              {grade.value}
                            </span>
                          )}
                        </td>

                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                          {editingGradeId === grade.id ? (
                            <input
                              type="date"
                              value={editGradeDate}
                              onChange={e => setEditGradeDate(e.target.value)}
                              style={{ padding: '5px', borderRadius: '4px' }}
                            />
                          ) : (
                            new Date(grade.date).toLocaleDateString()
                          )}
                        </td>

                        <td style={{ border: '1px solid #ddd', padding: '10px' }}>
                          {editingGradeId === grade.id ? (
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                              <button
                                onClick={() => handleSaveEditGrade(grade.id)}
                                style={{ background: '#198754', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingGradeId(null)}
                                style={{ background: '#6c757d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingGradeId(grade.id);
                                setEditGradeValue(grade.value);
                                setEditGradeSubject(grade.subject);
                                setEditGradeDate(new Date(grade.date).toISOString().split('T')[0]);
                              }}
                              style={{ background: '#ffc107', border: 'none', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}