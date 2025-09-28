export const CONTRACTS = {
  flow: {
    chainId: 747,
    rpc: "https://mainnet.evm.nodes.onflow.org",
    factory: process.env.NEXT_PUBLIC_FLOW_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000"
  },
  hedera: {
    chainId: 295,
    rpc: "https://mainnet.hashio.io/api",
    factory: process.env.NEXT_PUBLIC_HEDERA_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000"
  }
}

export const FACTORY_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "symbol", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "string", "name": "imageUrl", "type": "string" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "uint256", "name": "maxSupply", "type": "uint256" }
        ],
        "internalType": "struct MemeParams",
        "name": "params",
        "type": "tuple"
      }
    ],
    "name": "createMeme",
    "outputs": [
      { "internalType": "uint256", "name": "memeId", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "memeId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "symbol", "type": "string" },
      { "indexed": false, "internalType": "address", "name": "creator", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "token", "type": "address" },
      { "indexed": false, "internalType": "address", "name": "curve", "type": "address" }
    ],
    "name": "MemeCreated",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "relayer", "type": "address" }
    ],
    "name": "setRelayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "memeId", "type": "uint256" },
      { "internalType": "address", "name": "relayer", "type": "address" }
    ],
    "name": "setCurveRelayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export const BONDING_CURVE_ABI = [
  "function buy(uint256 amount) payable",
  "function sell(uint256 amount)",
  "function calculateBuyQuote(uint256 tokenAmount) view returns (uint256 price, uint256 amount, uint256 cost, uint256 protocolFee, uint256 creatorFee, uint256 netAmount)",
  "function calculateSellQuote(uint256 tokenAmount) view returns (uint256 price, uint256 amount, uint256 proceeds, uint256 protocolFee, uint256 creatorFee, uint256 netAmount)",
  "function getCurrentPrice() view returns (uint256)",
  "function getSupply() view returns (uint256)",
  "function state() view returns (uint256 localSupply, uint256 otherChainSupply, uint256 globalSupply, uint256 reserveBalance, bool isGraduated, address pool)",
  "function burnForCrossChain(address user, uint256 amount, address recipient, uint256 targetChainId)",
  "function mintFromCrossChain(address toUser, uint256 amount, address fromAddress, uint256 fromChainId)",
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