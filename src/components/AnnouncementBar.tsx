export default function AnnouncementBar() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: 'linear-gradient(135deg, #4472C4, #2563EB)',
      color: '#fff',
      textAlign: 'center',
      padding: '0.5rem 1rem',
      fontSize: '0.85rem',
      fontWeight: 600,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      🎉 Early Access: Join the Founding Members list before October 2nd for a special discount!
    </div>
  );
}
