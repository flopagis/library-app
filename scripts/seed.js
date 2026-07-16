require("dotenv").config();
const prisma = require("../src/lib/prisma");

// Real library items, added in batches as photos of the shelves come in.
async function main() {
  const items = [
    { title: "Your Inner Fish", type: "BOOK", category: "Evolutionary Biology", author: "Neil Shubin" },
    { title: "Metazoa", type: "BOOK", category: "Biology", author: "Peter Godfrey-Smith" },
    { title: "Behave", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky" },
    { title: "An Immense World", type: "BOOK", category: "Biology", author: "Ed Yong" },
    { title: "The Selfish Gene", type: "BOOK", category: "Evolutionary Biology", author: "Richard Dawkins" },
    { title: "The Ancestor's Tale", type: "BOOK", category: "Evolutionary Biology", author: "Richard Dawkins & Yan Wong" },
    { title: "The Eighth Day of Creation", type: "BOOK", category: "Genetics", author: "Horace Freeland Judson", notes: "Commemorative Edition." },
    { title: "The Gene", type: "BOOK", category: "Genetics", author: "Siddhartha Mukherjee" },
  ];

  for (const data of items) {
    await prisma.item.create({ data });
  }

  console.log(`Seeded ${items.length} items.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
