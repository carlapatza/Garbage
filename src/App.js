import React, { useState, useEffect } from 'react';
import ContractForm from './ContractForm'; // Import the ContractForm component

function App() {
  const [showForm, setShowForm] = useState(false); // Default to false
  const [contracts, setContracts] = useState([]); // State to hold contract data
  const [contractsFetched, setContractsFetched] = useState(false); // State to track if contracts have been fetched
  const [fetchTriggered, setFetchTriggered] = useState(false); // State to track if fetch has been triggered

  const handleButtonClick = () => {
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const fetchContracts = async () => {
    setFetchTriggered(true);
    try {
      const response = await fetch('/api/contracte');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Fetched contracts:', data); // Debugging line
      setContracts(data);
      setContractsFetched(true); // Set contractsFetched to true after fetching contracts
    } catch (error) {
      console.error('Error fetching contracts:', error);
      setContractsFetched(true); // Even if there's an error, we consider fetching attempted
    }
  };

  useEffect(() => {
    // Initial fetch on component mount if needed
    // fetchContracts();
  }, []);

  return (
    <div>
      {!showForm ? (
        <div>
          <h1>Bun venit la Sistemul de management al gunoiului</h1>
          <button onClick={handleButtonClick}>Contract Nou</button>
          <button onClick={fetchContracts}>Contractele mele</button>
          {fetchTriggered && contractsFetched && (
            <table border="1" cellPadding="5" cellSpacing="0">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Timestamp</th>
                  <th>Nume</th>
                  <th>Prenume</th>
                  <th>CNP</th>
                  <th>Adresă</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length > 0 ? (
                  contracts.map((contract) => (
                    <tr key={contract.id}>
                      <td>{contract.id}</td>
                      <td>{contract.timestamp}</td>
                      <td>{contract.nume}</td>
                      <td>{contract.prenume}</td>
                      <td>{contract.cnp}</td>
                      <td>{contract.adresa}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No contracts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <ContractForm onClose={handleClose} /> // Assume ContractForm accepts an onClose prop
      )}
    </div>
  );
}

export default App;
