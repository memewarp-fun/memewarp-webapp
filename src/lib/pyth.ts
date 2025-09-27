const PYTH_HERMES_URL = 'https://hermes.pyth.network/api/latest_price_feeds';

const PRICE_IDS = {
  FLOW_USD: '0x2fb245b9a84554a0f15aa123cbb5f64cd263b59e9a87d80148cbffab50c69f30',
  HBAR_USD: '0x3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd'
};

export async function getPrices() {
  const ids = [PRICE_IDS.FLOW_USD, PRICE_IDS.HBAR_USD].join(',');
  const res = await fetch(`${PYTH_HERMES_URL}?ids[]=${ids}`);
  const data = await res.json();

  return {
    flowUsd: parseFloat(data[0].price.price) * Math.pow(10, data[0].price.expo),
    hbarUsd: parseFloat(data[1].price.price) * Math.pow(10, data[1].price.expo)
  };
}