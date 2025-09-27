export const CONTRACTS = {
  flow: {
    chainId: 747,
    rpc: "https://testnet.evm.nodes.onflow.org",
    factory: "0x1234567890123456789012345678901234567890",
    bondingCurve: "0x2345678901234567890123456789012345678901"
  },
  hedera: {
    chainId: 295,
    rpc: "https://testnet.hashio.io/api",
    factory: "0x3456789012345678901234567890123456789012",
    bondingCurve: "0x4567890123456789012345678901234567890123"
  }
}

export const FACTORY_ABI = [
  "function createMeme(string name, string symbol, string description, string imageUrl, address creator, uint256 maxSupply) returns (address)",
  "function getMeme(string symbol) view returns (address)",
  "event MemeCreated(string indexed symbol, address indexed tokenAddress, address indexed bondingCurve)"
]

export const BONDING_CURVE_ABI = [
  "function buy(uint256 amount) payable",
  "function sell(uint256 amount)",
  "function calculateBuyQuote(uint256 amount) view returns (uint256 cost, uint256 fee)",
  "function calculateSellQuote(uint256 amount) view returns (uint256 proceeds, uint256 fee)",
  "function getCurrentPrice() view returns (uint256)",
  "function getSupply() view returns (uint256)",
  "function burnForCrossChain(address user, uint256 amount, address recipient, uint256 targetChainId)",
  "function mintFromCrossChain(address recipient, uint256 amount, bytes32 burnTxHash)",
  "event Buy(address indexed buyer, uint256 amount, uint256 cost)",
  "event Sell(address indexed seller, uint256 amount, uint256 proceeds)",
  "event CrossChainBurn(address indexed from, uint256 amount, uint256 targetChainId)",
  "event CrossChainMint(address indexed to, uint256 amount, bytes32 burnTxHash)"
]

export const TOKEN_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address account) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 value)",
  "event Approval(address indexed owner, address indexed spender, uint256 value)"
]