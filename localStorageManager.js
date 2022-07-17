function upgradeLocalStorage(tickers) {
    localStorage.clear();
    localStorage.setItem("tickers", JSON.stringify(tickers));
  }
export default upgradeLocalStorage;