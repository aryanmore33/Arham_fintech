const clients = [];

for (let i = 1; i <= 300; i++) {
   const clientId = `C${String(i).padStart(3, "0")}`;

  clients.push({
    id: clientId,
    name: ["Client A", "Client B", "Client C"][i - 1] || `Client ${i}`,
    email: `client${i}@example.com`,
    phone: `98765${String(i).padStart(5, "0")}`,
    city: i % 2 === 0 ? "Mumbai" : "Pune",
  });
    
}

module.exports = clients;
