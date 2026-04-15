import Crypto from "../models/Crypto.js";

const defaultIcon = (symbol) =>
  `https://cdn.jsdelivr.net/gh/spothq/cryptocurrency-icons@master/32/color/${symbol.toLowerCase()}.png`;

const seedCryptos = [
  { name: "Bitcoin", symbol: "BTC", price: 71234.56, change24h: 2.58 },
  { name: "Ethereum", symbol: "ETH", price: 3584.12, change24h: 1.37 },
  { name: "Solana", symbol: "SOL", price: 168.44, change24h: 6.92 },
  { name: "XRP", symbol: "XRP", price: 0.62, change24h: 4.11 },
  { name: "Cardano", symbol: "ADA", price: 0.53, change24h: 3.18 },
  { name: "Dogecoin", symbol: "DOGE", price: 0.16, change24h: 8.73 },
  { name: "Avalanche", symbol: "AVAX", price: 45.27, change24h: 5.24 },
  { name: "Chainlink", symbol: "LINK", price: 21.98, change24h: 4.84 },
];

function serializeCrypto(crypto) {
  return {
    id: crypto._id,
    name: crypto.name,
    symbol: crypto.symbol,
    current_price: crypto.price,
    price: crypto.price,
    price_change_percentage_24h: crypto.change24h,
    change24h: crypto.change24h,
    image: crypto.image,
    createdAt: crypto.createdAt,
    updatedAt: crypto.updatedAt,
  };
}

async function ensureSeedData() {
  const count = await Crypto.countDocuments();
  if (count > 0) {
    return;
  }

  await Crypto.insertMany(
    seedCryptos.map((crypto) => ({
      ...crypto,
      image: defaultIcon(crypto.symbol),
    })),
  );
}

export async function getAllCryptos(req, res, next) {
  try {
    await ensureSeedData();
    const cryptos = await Crypto.find().sort({ createdAt: -1 });

    return res.status(200).json({
      cryptos: cryptos.map(serializeCrypto),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getTopGainers(req, res, next) {
  try {
    await ensureSeedData();
    const cryptos = await Crypto.find().sort({ change24h: -1, createdAt: -1 });

    return res.status(200).json({
      cryptos: cryptos.map(serializeCrypto),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getNewCryptos(req, res, next) {
  try {
    await ensureSeedData();
    const cryptos = await Crypto.find().sort({ createdAt: -1 });

    return res.status(200).json({
      cryptos: cryptos.map(serializeCrypto),
    });
  } catch (error) {
    return next(error);
  }
}

export async function getCryptoById(req, res, next) {
  try {
    const crypto = await Crypto.findById(req.params.id);

    if (!crypto) {
      return res.status(404).json({ message: "Crypto asset not found." });
    }

    return res.status(200).json({ crypto: serializeCrypto(crypto) });
  } catch (error) {
    return next(error);
  }
}

export async function createCrypto(req, res, next) {
  try {
    const { name, symbol, price, image, change24h } = req.body;

    if (!name || !symbol || price === undefined || change24h === undefined) {
      return res.status(400).json({
        message: "Name, symbol, price, image, and 24h change are required.",
      });
    }

    const parsedPrice = Number(price);
    const parsedChange = Number(change24h);

    if (Number.isNaN(parsedPrice) || Number.isNaN(parsedChange)) {
      return res.status(400).json({
        message: "Price and 24h change must be valid numbers.",
      });
    }

    const crypto = await Crypto.create({
      name,
      symbol: symbol.toUpperCase(),
      price: parsedPrice,
      image: image || defaultIcon(symbol),
      change24h: parsedChange,
      createdBy: req.user?.id || null,
    });

    return res.status(201).json({
      message: "Crypto asset created successfully.",
      crypto: serializeCrypto(crypto),
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: "That symbol already exists." });
    }

    return next(error);
  }
}
