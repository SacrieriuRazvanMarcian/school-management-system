import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axios";

interface Grade {
  id: number;
  value: number;
  subject: string;
  date: string;
}

type GroupedGrades = {
  [subjectName: string]: Grade[];
};

export function StudentDashboard() {
  const navigate = useNavigate();
  
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [className, setClassName] = useState('Unassigned');
  
  const [groupedGrades, setGroupedGrades] = useState<GroupedGrades>({});
  const [average, setAverage] = useState<number>(0);

  

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userId = payload.sub || payload.id;

        const userRes = await api.get(`/users/${userId}`);
        const userData = userRes.data;
        const studentData = userData.student;
        
        if (userData) setEmail(userData.email || 'N/A');
        
        if (studentData) {
          setStudentName(`${studentData.last_name} ${studentData.first_name}`);
          setDateOfBirth(studentData.date_of_birth || 'N/A');
          
          if (studentData.class_id) {
            const classesRes = await api.get('/classes');
            const myClass = classesRes.data.find((c: any) => c.id === studentData.class_id);
            if (myClass) setClassName(myClass.name);
          }
        }

        const gradesRes = await api.get('/grades');
        if (gradesRes.data) {
          const rawGrades: Grade[] = gradesRes.data.grades || [];
          setAverage(gradesRes.data.average || 0);

          const grouped = rawGrades.reduce((acc: GroupedGrades, grade) => {
            if (!acc[grade.subject]) {
              acc[grade.subject] = [];
            }
            acc[grade.subject].push(grade);
            return acc;
          }, {});

          Object.keys(grouped).forEach(subject => {
            grouped[subject].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          });

          setGroupedGrades(grouped);
        }

      } catch (err) {
        console.error('Error fetching student data', err);
      }
    };

    fetchStudentData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Student Dashboard</h2>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', padding: '8px 16px', cursor: 'pointer', border: 'none', borderRadius: '4px' }}>
          Logout
        </button>
      </div>
      <hr style={{ marginBottom: '30px' }} />

      <div style={{ background: '#f8f9fa', padding: '25px', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '30px', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div style={{ flex: '2', minWidth: '250px' }}>
          <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>Personal Information</h3>
          <p style={{ margin: '8px 0', fontSize: '1.1em' }}><span style={{ color: '#666', width: '120px', display: 'inline-block' }}>Full Name:</span> <strong>{studentName}</strong></p>
          <p style={{ margin: '8px 0', fontSize: '1.1em' }}><span style={{ color: '#666', width: '120px', display: 'inline-block' }}>Email:</span> <strong>{email}</strong></p>
          <p style={{ margin: '8px 0', fontSize: '1.1em' }}><span style={{ color: '#666', width: '120px', display: 'inline-block' }}>Date of Birth:</span> <strong>{dateOfBirth}</strong></p>
          <p style={{ margin: '8px 0', fontSize: '1.1em' }}><span style={{ color: '#666', width: '120px', display: 'inline-block' }}>Class:</span> <strong style={{ color: '#0d6efd' }}>{className}</strong></p>
        </div>

        <div style={{ flex: '1', minWidth: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', borderLeft: '2px solid #eaeaea' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#555' }}>Overall Average</h3>
          <span style={{ fontSize: '3.5em', fontWeight: 'bold', color: average >= 5 ? '#198754' : '#dc3545', lineHeight: '1' }}>
            {average ? average.toFixed(2) : '0.00'}
          </span>
        </div>
      </div>

      <h3>School Register (Grades)</h3>
      {Object.keys(groupedGrades).length === 0 ? (
        <p style={{ color: '#666', background: '#f8f9fa', padding: '15px', borderRadius: '4px', border: '1px solid #ddd' }}>
          No grades available yet.
        </p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <thead>
            <tr style={{ background: '#eee', borderBottom: '2px solid #ccc' }}>
              <th style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'left', width: '30%' }}>Subject</th>
              <th style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'left' }}>Grades</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(groupedGrades).map(subject => {
              const subjectGrades = groupedGrades[subject];
              const sum = subjectGrades.reduce((acc, grade) => acc + grade.value, 0);
              const subjectAverage = (sum / subjectGrades.length).toFixed(2);
              const isPassing = Number(subjectAverage) >= 5;

              return (
                <tr key={subject}>
                  <td style={{ border: '1px solid #ddd', padding: '15px' }}>
                    <strong style={{ display: 'block', fontSize: '1.1em', color: '#333' }}>
                      {subject}
                    </strong>
                    <span style={{ fontSize: '0.9em', color: '#666' }}>
                      Average: <strong style={{ color: isPassing ? '#198754' : '#dc3545' }}>{subjectAverage}</strong>
                    </span>
                  </td>
                  
                  <td style={{ border: '1px solid #ddd', padding: '15px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {subjectGrades.map(grade => (
                      <span 
                        key={grade.id} 
                        title={`Received on: ${grade.date}`} 
                        style={{
                          padding: '8px 12px',
                          background: grade.value >= 5 ? '#e7f5ea' : '#fce8e8',
                          color: grade.value >= 5 ? '#198754' : '#dc3545',
                          border: `1px solid ${grade.value >= 5 ? '#c3e6cb' : '#f5c6cb'}`,
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          cursor: 'help'
                        }}
                      >
                        {grade.value}
                      </span>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}