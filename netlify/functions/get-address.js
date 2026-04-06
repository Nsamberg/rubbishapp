exports.handler = async function (event) {
  const postcode = event.queryStringParameters?.postcode || '';

  const response = await fetch(
    'https://www.ealing.gov.uk/site/custom_scripts/WasteCollectionWS/home/GetAddress',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `Postcode=${encodeURIComponent(postcode)}`,
    }
  );

  const data = await response.json();

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  };
};
