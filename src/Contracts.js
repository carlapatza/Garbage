// src/Contracts.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Contracts = () => {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    axios.get('/contracts').then(response => {
      setContracts(response.data);
    });
  }, []);

  const handleSign = () => {
    // Logic to sign a contract
  };

  const handleRenew = (id) => {
    axios.put(`/contracts/${id}/renew`).then(response => {
      // Update the contract list
    });
  };

  return (
    <div>
      <h1>Contracts</h1>
      <ul>
        {contracts.map(contract => (
          <li key={contract.id}>
            {contract.name}
            <button onClick={() => handleRenew(contract.id)}>Renew</button>
          </li>
        ))}
      </ul>
      <button onClick={handleSign}>Sign New Contract</button>
    </div>
  );
};

export default Contracts;