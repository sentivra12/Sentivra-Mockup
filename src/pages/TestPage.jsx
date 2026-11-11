import React from 'react';

const TestPage = () => {
  return (
    <div style={{ padding: '40px', background: 'white', minHeight: '100vh' }}>
      <h1 style={{ color: 'black', fontSize: '32px' }}>✅ Test Page Working!</h1>
      <p style={{ color: 'black', fontSize: '18px' }}>If you see this, React is working.</p>
      <ul style={{ color: 'black' }}>
        <li>Dev server: Running ✅</li>
        <li>React: Working ✅</li>
        <li>Routing: Working ✅</li>
      </ul>
    </div>
  );
};

export default TestPage;
