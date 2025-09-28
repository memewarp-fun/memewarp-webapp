const PYTH_HERMES_URL = 'https://hermes.pyth.network/api/latest_price_feeds';

const PRICE_IDS = {
  FLOW_USD: '2fb245b9a84554a0f15aa123cbb5f64cd263b59e9a87d80148cbffab50c69f30',
  HBAR_USD: '3728e591097635310e6341af53db8b7ee42da9b3a8d918f9463ce9cca886dfbd'
};

export async function getPrices() {
  try {
    // Fetch both price feeds
    const url = `${PYTH_HERMES_URL}?ids[]=${PRICE_IDS.FLOW_USD}&ids[]=${PRICE_IDS.HBAR_USD}`;
    const res = await fetch(url);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();

    // Find the price feeds by ID
    const flowFeed = data.find((feed: any) => feed.id === PRICE_IDS.FLOW_USD);
    const hbarFeed = data.find((feed: any) => feed.id === PRICE_IDS.HBAR_USD);

    // Calculate actual prices
    if (!flowFeed || !hbarFeed) {
      throw new Error('Missing price feed data');
    }

    const flowUsd = parseInt(flowFeed.price.price) * Math.pow(10, flowFeed.price.expo);
    const hbarUsd = parseInt(hbarFeed.price.price) * Math.pow(10, hbarFeed.price.expo);

    console.log('Pyth prices - FLOW/USD:', flowUsd, 'HBAR/USD:', hbarUsd);

    return {
      flowUsd,
      hbarUsd
    };
  } catch (error) {
    console.error('Failed to fetch Pyth prices:', error);
    throw error;
  }
}