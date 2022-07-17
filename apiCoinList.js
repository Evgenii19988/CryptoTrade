const loadCoinList = () =>
  fetch(
    "https://min-api.cryptocompare.com/data/all/coinlist?summary=true"
  ).then((response) => response.json());

export default loadCoinList;
