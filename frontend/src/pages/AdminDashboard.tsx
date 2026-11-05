import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const cardStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #eaeaea',
    cursor: 'pointer',
    flex: '1',
    minWidth: '250px',
    textAlign: 'center' as const,
    transition: 'transform 0.2s, boxShadow 0.2s',
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'system-ui, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, color: '#333' }}>Dashboard - Admin</h2>
        <button 
          onClick={handleLogout} 
          style={{ background: '#dc3545', color: 'white', padding: '10px 20px', cursor: 'pointer', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
          Logout
        </button>
      </div>
      <hr style={{ border: 'none', borderTop: '1px solid #eaeaea', marginBottom: '40px' }} />

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        
        <div 
          style={cardStyle} 
          onClick={() => navigate('/admin/users')}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
        >
          <h3 style={{ color: '#0056b3', marginTop: 0, fontSize: '1.5em' }}>Manage users</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Create, view, edit and delete accounts.</p>
        </div>

        <div 
          style={cardStyle} 
          onClick={() => navigate('/admin/classes')}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
        >
          <h3 style={{ color: '#198754', marginTop: 0, fontSize: '1.5em' }}>Manage classes</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Create and delete classes.</p>
        </div>

        <div 
          style={cardStyle} 
          onClick={() => navigate('/admin/assign')}
          onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.1)'; }}
          onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05)'; }}
        >
          <h3 style={{ color: '#fd7e14', marginTop: 0, fontSize: '1.5em' }}>Assign to classes</h3>
          <p style={{ color: '#666', lineHeight: '1.5' }}>Assign a teacher to a class and add students to classes.</p>
        </div>

      </div>
    </div>
  );
}