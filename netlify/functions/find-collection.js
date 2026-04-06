exports.handler = async function (event) {
  const uprn = event.queryStringParameters?.uprn || '';

  const response = await fetch(
    'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home/FindCollection',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `UPRN=${encodeURIComponent(uprn)}`,
    }
  );

  const data = await response.json();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
