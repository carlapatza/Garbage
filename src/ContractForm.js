import React, { useEffect } from 'react';

function ContractForm() {
  useEffect(() => {
    const processImage = async () => {
      document.getElementById('processImage').addEventListener('click', async () => {
        const uploadForm = document.getElementById('uploadForm');
        const formData = new FormData(uploadForm);
        try {
          const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Error processing the image.');
          }
          const data = await response.json();
          document.getElementById('input1').value = data.nume || '';
          document.getElementById('input2').value = data.prenume || '';
          document.getElementById('input3').value = data.cnp || '';
          document.getElementById('input4').value = data.adresa || '';
        } catch (error) {
          console.error('Error:', error);
          alert('There was an issue processing the image.');
        }
      });
    };

    const fetchSavedData = async () => {
      try {
        const response = await fetch('/contracte');
        if (!response.ok) {
          throw new Error('Error fetching saved data.');
        }
        const data = await response.json();
        const container = document.getElementById('data-container');
        let html = '<table><tr><th>ID</th><th>Nume</th><th>Prenume</th><th>CNP</th><th>Adresă</th></tr>';
        data.forEach(contract => {
          html += `<tr>
            <td>${contract.id}</td>
            <td>${contract.nume}</td>
            <td>${contract.prenume}</td>
            <td>${contract.cnp}</td>
            <td>${contract.adresa}</td>
          </tr>`;
        });
        html += '</table>';
        container.innerHTML = html;
      } catch (error) {
        console.error('Error:', error);
      }
    };

    processImage();
    fetchSavedData();
  }, []);

  // Canvas logic
  const clearCanvas = () => {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = (event) => {
    event.preventDefault();
    const canvas = document.getElementById('signatureCanvas');
    const signatureData = canvas.toDataURL('image/png');
    document.getElementById('signatureData').value = signatureData;
    // Add code to submit the form data including the signature
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Contract</h1>
      <form id="uploadForm" encType="multipart/form-data">
        <h2>Scanați actul de identitate</h2>
        <label htmlFor="image">Încărcați o imagine:</label>
        <input type="file" id="image" name="image" accept="image/png, image/jpeg" required />
        <button type="button" id="processImage">Procesează imaginea</button>
      </form>
      <form id="dataForm">
        <h2>Completați formularul</h2>
        <label htmlFor="input1">Nume:</label>
        <input type="text" id="input1" name="input1" placeholder="Introduceți numele" required />
        <label htmlFor="input2">Prenume:</label>
        <input type="text" id="input2" name="input2" placeholder="Introduceți prenumele" required />
        <label htmlFor="input3">CNP:</label>
        <input type="text" id="input3" name="input3" placeholder="Introduceți CNP-ul" required />
        <label htmlFor="input4">Adresă:</label>
        <input type="text" id="input4" name="input4" placeholder="Introduceți adresa" required />
        <label htmlFor="email">Adresă de email:</label>
        <input type="email" id="email" name="email" placeholder="Introduceți adresa de email" required />
        <div className="row">
          <label htmlFor="combobox">Capacitate:</label>
          <select id="combobox" name="combobox" required>
            <option value="mic">Mic</option>
            <option value="mare">Mare</option>
          </select>
          <label htmlFor="numarPersoane" style={{ marginLeft: '10px' }}>Nr. Persoane:</label>
          <input type="number" id="numarPersoane" name="numarPersoane" placeholder="Nr. persoane" required />
        </div>
        <label htmlFor="sumaLunara">Suma de plată lunară:</label>
        <input type="text" id="sumaLunara" name="sumaLunara" placeholder="Suma calculată" readOnly />
        <label>Semnătură:</label>
        <div className="signature-container">
          <canvas id="signatureCanvas" width="300" height="150"></canvas>
          <button type="button" onClick={clearCanvas}>Șterge Semnătura</button>
        </div>
        <input type="hidden" id="signatureData" name="signatureData" />
        <button type="submit" onClick={saveSignature}>Trimite</button>
      </form>
      <h2>Date salvate</h2>
      <div id="data-container">
        {/* Table will be dynamically generated */}
      </div>
    </div>
  );
}

export default ContractForm;