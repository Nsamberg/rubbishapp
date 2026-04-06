const express = require('express');
const app = express();

app.get('/api/get-address', async (req, res) => {
  const postcode = req.query.postcode || '';
  try {
    const r = await fetch(
      'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home/GetAddress',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `Postcode=${encodeURIComponent(postcode)}`,
      }
    );
    res.json(await r.json());
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

app.get('/api/find-collection', async (req, res) => {
  const uprn = req.query.uprn || '';
  try {
    const r = await fetch(
      'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home/FindCollection',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `UPRN=${encodeURIComponent(uprn)}`,
      }
    );
    res.json(await r.json());
  } catch (err) {
    res.status(502).json({ error: String(err) });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`proxy listening on ${PORT}`));
