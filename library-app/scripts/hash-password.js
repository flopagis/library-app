const bcrypt = require("bcryptjs");

const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -- <your-admin-password>");
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log("\nPut this in your .env as ADMIN_PASSWORD_HASH:\n");
console.log(hash);
console.log("");
