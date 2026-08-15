const trades = [];

const symbols = [
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "ITC",
  "WIPRO",
  "AXISBANK",
  "LT",
];

const sides = ["BUY", "SELL"];

const clientsCount = 300;

for (let i = 1; i <= 5000; i++) {
  const clientNumber = ((i - 1) % clientsCount) + 1;

  const clientId = `C${String(clientNumber).padStart(3, "0")}`;

  const date = new Date(2026, 7, 1 + (i % 13), (i * 7) % 24, (i * 11) % 60, (i * 13) % 60);

  // Deterministic seed-style values make demo brokerage figures stable across restarts.
  const quantity = ((i * 37) % 500) + 1;
  const price = Number((((i * 97) % 400000) / 100 + 100).toFixed(2));

  const brokerage = Number(
    (quantity * price * 0.0005).toFixed(2)
  );

  trades.push({
    id: `T${String(i).padStart(5, "0")}`,
    clientId,
    tradeDate: date.toISOString(),
    symbol: symbols[i % symbols.length],
    side: sides[i % sides.length],
    quantity,
    price,
    brokerage,
  });
}

module.exports = trades;
