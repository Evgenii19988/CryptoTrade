import loadTickers from "../apiTickers.js";
import loadCoinList from "../apiCoinList.js";
import upgradeLocalStorage from "../localStorageManager.js";

const App = {
  data() {
    return {
      tickerInput: "",
      filter: "",

      tickers: [],
      selectedTicker: null,

      graph: [],

      noExistMessage: false,

      coinList: null,
      steers: [],

      page: 1,

      currency: "USD"
    };
  },

  methods: {
    select(tick) {
      this.selectedTicker = tick;
    },

    addTicker() {
      if (!Object.keys(this.coinList).includes(this.tickerInput)) {
        this.showMessage();
        return;
      }

      if (
        this.tickersNames.includes(this.tickerInput) ||
        this.tickerInput === ""
      ) {
        return;
      }

      const currentTicker = {
        name: this.tickerInput,
        price: "-",
        hasPrice: false
      };

      this.tickers = [...this.tickers, currentTicker];

      this.tickerInput = "";
    },

    getTickerImage(tickerName) {
      return `https://www.cryptocompare.com${this.coinList[tickerName].ImageUrl}`;
    },

    deleteTicker(removeTicker) {
      this.tickers = this.tickers.filter((t) => t !== removeTicker);
      this.deleteGraph();
    },

    deleteGraph() {
      this.selectedTicker = null;
    },

    async getCoinList() {
      const data = await loadCoinList();

      this.coinList = data.Data;
    },

    getSteers() {
      this.steers = Object.keys(this.coinList)
        .filter((item, idx) => item.startsWith(this.tickerInput))
        .sort()
        .splice(0, 6);
    },

    addSteer(ticker) {
      this.tickerInput = ticker;
      this.addTicker();
    },

    async updateTickers() {
      if (!this.tickers.length) {
        return;
      }
      const data = await loadTickers(this.tickersNames, this.currency);
      this.tickers.forEach((ticker) => {
        const price = data[ticker.name];
        ticker.price = price;
        this.addGraph(ticker.price);
      });

      this.markTickersWithoutPrice();
    },

    formatPrice(price) {
      if (price === undefined || price === "-") {
        return "-";
      }
      const number = price > 1 ? price.toFixed(2) : price.toPrecision(2);
      if (number <= 0.001) return number;
      return new Intl.NumberFormat("ru-RU").format(number);
    },

    addGraph(tickerPrice) {
      if (tickerPrice === this.selectedTicker?.price) {
        this.graph.push(tickerPrice);
      }
    },

    clearGraph() {
      this.graph = [];
    },

    showMessage() {
      this.noExistMessage = true;
    },

    markTickersWithoutPrice() {
      const tickersWithoutPrice = this.tickers.filter(
        (ticker) => ticker.price === undefined
      );
      if (tickersWithoutPrice.length) {
        tickersWithoutPrice.map((tick) => (tick.hasPrice = true));
      }
      const tickersWithPrice = this.tickers.filter(
        (ticker) => ticker.price !== undefined
      );
      tickersWithPrice.map((tick) => (tick.hasPrice = false));
    }
  },

  computed: {
    startIndex() {
      return (this.page - 1) * 5;
    },

    endIndex() {
      return this.page * 5;
    },

    filteredTickers() {
      return this.tickers.filter((t) => t.name.includes(this.filter));
    },

    paginatedTickers() {
      return this.filteredTickers.slice(this.startIndex, this.endIndex);
    },

    hasNextPage() {
      return this.filteredTickers.length > this.endIndex;
    },

    tickersNames() {
      return this.tickers.map((ticker) => ticker.name);
    },

    normalizedGraph() {
      const minValue = Math.min(...this.graph);
      const maxValue = Math.max(...this.graph);
      if (maxValue === minValue) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minValue) * 95) / (maxValue - minValue)
      );
    },

    hasSameTicker() {
      return this.tickersNames.includes(this.tickerInput) ? true : false;
    }
  },

  watch: {
    currency() {
      this.tickers.map((ticker) => (ticker.price = "-"));
      this.graph = [];
    },

    tickers() {
      upgradeLocalStorage(this.tickers);
    },

    selectedTicker() {
      this.clearGraph();
    },

    paginatedTickers: function (newValue, oldValue) {
      if (this.paginatedTickers.length === 0 && this.page > 1) {
        this.page -= 1;
      }
    },

    tickerInput: function (newValue, oldValue) {
      this.noExistMessage = false;
      this.tickerInput = newValue.toUpperCase();

      this.getSteers();
    },

    filter: function (newValue) {
      this.filter = newValue.toUpperCase();
      this.page = 1;
    }
  },

  created() {
    this.getCoinList().catch(alert);

    if (window.localStorage.tickers) {
      this.tickers = JSON.parse(localStorage.getItem("tickers"));
    }

    setInterval(() => this.updateTickers(), 5000);
  },

  mounted() {}
};

Vue.createApp(App).mount(".crypto__container");
