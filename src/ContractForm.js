import React, { useEffect, useRef, useState } from 'react';

function ContractForm({ onClose }) {
  const imageInputRef = useRef(null);
  const uploadFormRef = useRef(null);
  const input1Ref = useRef(null);
  const input2Ref = useRef(null);
  const input3Ref = useRef(null);
  const input4Ref = useRef(null);
  const dataContainerRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const signatureDataRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const processImage = async () => {
      document.getElementById('processImage').addEventListener('click', async () => {
        const formData = new FormData(uploadFormRef.current);
        try {
          const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) {
            throw new Error('Error processing the image.');
          }
          const data = await response.json();
          input1Ref.current.value = data.nume || '';
          input2Ref.current.value = data.prenume || '';
          input3Ref.current.value = data.cnp || '';
          input4Ref.current.value = data.adresa || '';
        } catch (error) {
          console.error('Error:', error);
          alert('There was an issue processing the image.');
        }
      });
    };

    const fetchSavedData = async () => {
      try {
        const response = await fetch('/api/contracte');
        if (!response.ok) {
          throw new Error('Error fetching saved data.');
        }
        const data = await response.json();
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
        dataContainerRef.current.innerHTML = html;
      } catch (error) {
        console.error('Error:', error);
      }
    };

    processImage();
    fetchSavedData();
  }, []);

  // Canvas logic
  const startDrawing = (event) => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineTo(event.nativeEvent.offsetX, event.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = (event) => {
    event.preventDefault();
    const canvas = signatureCanvasRef.current;
    const signatureData = canvas.toDataURL('image/png');
    signatureDataRef.current.value = signatureData;
    // Add code to submit the form data including the signature
  };

  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Contract</h1>
      <form ref={uploadFormRef} encType="multipart/form-data">
        <h2>Scanați actul de identitate</h2>
        <label htmlFor="image">Alegeți documentul:</label>
        <input type="file" id="image" name="image" accept="image/png, image/jpeg" required ref={imageInputRef} />
        <button type="button" id="processImage">Procesează imaginea</button>
      </form>
      <form id="dataForm">
        <h2>Completați formularul</h2>
        <label htmlFor="input1">Nume:</label>
        <input type="text" id="input1" name="input1" placeholder="Introduceți numele" required ref={input1Ref} />
        <label htmlFor="input2">Prenume:</label>
        <input type="text" id="input2" name="input2" placeholder="Introduceți prenumele" required ref={input2Ref} />
        <label htmlFor="input3">CNP:</label>
        <input type="text" id="input3" name="input3" placeholder="Introduceți CNP-ul" required ref={input3Ref} />
        <label htmlFor="input4">Adresă:</label>
        <input type="text" id="input4" name="input4" placeholder="Introduceți adresa" required ref={input4Ref} />
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
          <canvas
            id="signatureCanvas"
            width="300"
            height="150"
            ref={signatureCanvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          ></canvas>
          <button type="button" onClick={clearCanvas}>Șterge Semnătura</button>
        </div>
        <input type="hidden" id="signatureData" name="signatureData" ref={signatureDataRef} />
        <button type="submit" onClick={saveSignature}>Trimite</button>
      </form>
      <button onClick={onClose}>Înapoi</button>
    </div>
  );
}

export default ContractForm;