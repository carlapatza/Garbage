
import React, { useState } from 'react';
import ContractForm from './ContractForm'; // Import the ContractForm component

function App() {
  const [showForm, setShowForm] = useState(false); // Default to false

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <div>
      {!showForm ? (
        <div>
          <h1>Welcome to the Contract Management System</h1>
          <button onClick={handleButtonClick}>Sign New Contract</button>
        </div>
      ) : (
        <ContractForm onClose={handleClose} /> // Assume ContractForm accepts an onClose prop
      )}
    </div>
  );
}

export default App;
