const API_KEY = `17b6e295e88ee5bbd0e963d38fb7ee784b4529eb0dd59eff0a2cfbaf12374512`;

const loadTickers = (tickersNames, currency) =>
  fetch(
    `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${tickersNames}&tsyms=${currency}&api_key={${API_KEY}} `
  )
    .then((response) => response.json())
    .then((rawData) =>
      Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value[`${currency}`]])
      )
    );

export default loadTickers;