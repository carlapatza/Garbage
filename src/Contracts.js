// ContractForm.js
import React from 'react';

function ContractForm() {
  return (
    <div>
      <h1 style="text-align: center;">Contract</h1>
      <form id="uploadForm" enctype="multipart/form-data">
          <h2>Scanați actul de identitate</h2>
          <label for="image">Încărcați o imagine:</label>
          <input type="file" id="image" name="image" accept="image/png, image/jpeg" required />
          <button type="button" id="processImage">Procesează imaginea</button>
      </form>
      <form id="dataForm">
          <h2>Completați formularul</h2>
          <label for="input1">Nume:</label>
          <input type="text" id="input1" name="input1" placeholder="Introduceți numele" required />
          <label for="input2">Prenume:</label>
          <input type="text" id="input2" name="input2" placeholder="Introduceți prenumele" required />
          <label for="input3">CNP:</label>
          <input type="text" id="input3" name="input3" placeholder="Introduceți CNP-ul" required />
          <label for="input4">Adresă:</label>
          <input type="text" id="input4" name="input4" placeholder="Introduceți adresa" required />
          <label for="email">Adresă de email:</label>
          <input type="email" id="email" name="email" placeholder="Introduceți adresa de email" required />
          <div className="row">
              <label for="combobox">Capacitate:</label>
              <select id="combobox" name="combobox" required>
                  <option value="mic">Mic</option>
                  <option value="mare">Mare</option>
              </select>
              <label for="numarPersoane" style={{ marginLeft: '10px' }}>Nr. Persoane:</label>
              <input type="number" id="numarPersoane" name="numarPersoane" placeholder="Nr. persoane" required />
          </div>
          <label for="sumaLunara">Suma de plată lunară:</label>
          <input type="text" id="sumaLunara" name="sumaLunara" placeholder="Suma calculată" readonly />
          <label>Semnătură:</label>
          <div className="signature-container">
              <canvas id="signatureCanvas" width="300" height="150"></canvas>
              <button type="button" onclick="clearCanvas()">Șterge Semnătura</button>
          </div>
          <input type="hidden" id="signatureData" name="signatureData" />
          <button type="submit" onclick="saveSignature()">Trimite</button>
      </form>
      <h2>Date salvate</h2>
      <div id="data-container">
          <!-- Table will be dynamically generated -->
      </div>
      <script>
          // Process the uploaded image
          document.getElementById('processImage').addEventListener('click', async () => {
              const uploadForm = document.getElementById('uploadForm');
              const formData = new FormData(uploadForm);
              try {
                  const response = await fetch('/upload', {
                      method: 'POST',
                      body: formData,
                  });
                  if (!response.ok) {
                      throw new Error('Eroare la procesarea imaginii.');
                  }
                  const data = await response.json();
                  document.getElementById('input1').value = data.nume || '';
                  document.getElementById('input2').value = data.prenume || '';
                  document.getElementById('input3').value = data.cnp || '';
                  document.getElementById('input4').value = data.adresa || '';
              } catch (error) {
                  console.error('Eroare:', error);
                  alert('A apărut o problemă la procesarea imaginii.');
              }
          });

          // Canvas logic
          const canvas = document.getElementById('signatureCanvas');
          const ctx = canvas.getContext('2d');
          let isDrawing = false;
          canvas.addEventListener('mousedown', (e) => {
              isDrawing = true;
              ctx.beginPath();
              ctx.moveTo(e.offsetX, e.offsetY);
          });
          canvas.addEventListener('mousemove', (e) => {
              if (isDrawing) {
                  ctx.lineTo(e.offsetX, e.offsetY);
                  ctx.stroke();
              }
          });
          canvas.addEventListener('mouseup', () => {
              isDrawing = false;
          });
          canvas.addEventListener('mouseleave', () => {
              isDrawing = false;
          });

          function clearCanvas() {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
          }

          function saveSignature() {
              const signatureData = canvas.toDataURL('image/png');
              document.getElementById('signatureData').value = signatureData;
          }

          // Fetch saved data
          async function fetchSavedData() {
              try {
                  const response = await fetch('/contracte');
                  if (!response.ok) {
                      throw new Error('Eroare la încărcarea datelor salvate.');
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
                  console.error('Eroare:', error);
              }
          }

          // Load saved data on page load
          fetchSavedData();
      </script>
    </div>
  );
}

export default ContractForm;