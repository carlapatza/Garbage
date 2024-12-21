const express = require('express');
const app = express();
const { signContract, getContracts, renewContract } = require('./contractController');

app.post('/contracts', signContract);
app.get('/contracts', getContracts);
app.put('/contracts/:id/renew', renewContract);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});