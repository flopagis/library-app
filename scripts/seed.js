require("dotenv").config();
const prisma = require("../src/lib/prisma");

// Real library items, added in batches as photos of the shelves come in.
// coverUrl points at Open Library's cover API (covers.openlibrary.org) — free/public, no auth needed.
async function main() {
  const items = [
    { title: "Your Inner Fish", type: "BOOK", category: "Evolutionary Biology", author: "Neil Shubin", externalUrl: "https://www.goodreads.com/book/show/1662160.Your_Inner_Fish", coverUrl: "https://covers.openlibrary.org/b/id/4609000-L.jpg" },
    { title: "Metazoa", type: "BOOK", category: "Biology", author: "Peter Godfrey-Smith", externalUrl: "https://www.goodreads.com/en/book/show/50403455-metazoa", coverUrl: "https://covers.openlibrary.org/b/id/10528209-L.jpg" },
    { title: "Behave", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky", externalUrl: "https://www.goodreads.com/book/show/31170723-behave", coverUrl: "https://covers.openlibrary.org/b/id/8814831-L.jpg" },
    { title: "An Immense World", type: "BOOK", category: "Biology", author: "Ed Yong", externalUrl: "https://www.goodreads.com/en/book/show/59575939-an-immense-world", coverUrl: "https://covers.openlibrary.org/b/id/12835209-L.jpg" },
    { title: "The Selfish Gene", type: "BOOK", category: "Evolutionary Biology", author: "Richard Dawkins", externalUrl: "https://www.goodreads.com/book/show/61535.The_Selfish_Gene", coverUrl: "https://covers.openlibrary.org/b/id/133936-L.jpg" },
    { title: "The Ancestor's Tale", type: "BOOK", category: "Evolutionary Biology", author: "Richard Dawkins & Yan Wong", externalUrl: "https://www.goodreads.com/book/show/17977.The_Ancestor_s_Tale", coverUrl: "https://covers.openlibrary.org/b/id/501730-L.jpg" },
    { title: "The Eighth Day of Creation", type: "BOOK", category: "Genetics", author: "Horace Freeland Judson", notes: "Commemorative Edition.", externalUrl: "https://www.goodreads.com/book/show/228568.The_Eighth_Day_of_Creation", coverUrl: "https://covers.openlibrary.org/b/id/4433506-L.jpg" },
    { title: "The Gene", type: "BOOK", category: "Genetics", author: "Siddhartha Mukherjee", externalUrl: "https://www.goodreads.com/book/show/27276428-the-gene", coverUrl: "https://covers.openlibrary.org/b/id/11320163-L.jpg" },

    { title: "How to Win Friends and Influence People", type: "BOOK", category: "Self-Help", author: "Dale Carnegie", coverUrl: "https://covers.openlibrary.org/b/id/13314878-L.jpg" },
    { title: "The 7 Habits of Highly Effective People", type: "BOOK", category: "Self-Help", author: "Stephen R. Covey", coverUrl: "https://covers.openlibrary.org/b/id/10079937-L.jpg" },
    { title: "The Creative Act", type: "BOOK", category: "Creativity", author: "Rick Rubin", coverUrl: "https://covers.openlibrary.org/b/id/13316390-L.jpg" },
    { title: "She Has Her Mother's Laugh", type: "BOOK", category: "Genetics", author: "Carl Zimmer", coverUrl: "https://covers.openlibrary.org/b/id/10140352-L.jpg" },
    { title: "The Omnivore's Dilemma", type: "BOOK", category: "Food & Nutrition", author: "Michael Pollan", coverUrl: "https://covers.openlibrary.org/b/id/8596706-L.jpg" },

    { title: "Game Tech: The Math and Science of Gaming", type: "BOOK", category: "Game Design", author: "Geoffrey Engelstein" },
    { title: "A Game Design Vocabulary", type: "BOOK", category: "Game Design", author: "Anna Anthropy & Naomi Clark", coverUrl: "https://covers.openlibrary.org/b/id/9403888-L.jpg" },
    { title: "The Game Designer's Playlist", type: "BOOK", category: "Game Design", author: "Zack Hiwiller", coverUrl: "https://covers.openlibrary.org/b/id/8814603-L.jpg" },
    { title: "Game Changer", type: "BOOK", category: "Game Design", author: "Matthew Sadler & Natasha Regan" },
    { title: "Design Patterns", type: "BOOK", category: "Computer Science", author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", coverUrl: "https://covers.openlibrary.org/b/id/6601119-L.jpg" },
    { title: "Cracking the Coding Interview", type: "BOOK", category: "Computer Science", author: "Gayle Laakmann McDowell", coverUrl: "https://covers.openlibrary.org/b/id/7276811-L.jpg" },
    { title: "Algorithms", type: "BOOK", category: "Computer Science", author: "Robert Sedgewick & Kevin Wayne", notes: "Fourth Edition", coverUrl: "https://covers.openlibrary.org/b/id/7992499-L.jpg" },
    { title: "Python Machine Learning", type: "BOOK", category: "Machine Learning", author: "Sebastian Raschka & Vahid Mirjalili", notes: "Second Edition", coverUrl: "https://covers.openlibrary.org/b/id/8509317-L.jpg" },
    { title: "Hands-On Machine Learning with Scikit-Learn and TensorFlow", type: "BOOK", category: "Machine Learning", author: "Aurelien Geron" },

    { title: "Never Home Alone", type: "BOOK", category: "Biology", author: "Rob Dunn", coverUrl: "https://covers.openlibrary.org/b/id/10093522-L.jpg" },
    { title: "Nature via Nurture", type: "BOOK", category: "Genetics", author: "Matt Ridley", coverUrl: "https://covers.openlibrary.org/b/id/20464-L.jpg" },
    { title: "In the Shadow of Man", type: "BOOK", category: "Animal Behavior", author: "Jane Goodall", coverUrl: "https://covers.openlibrary.org/b/id/5376160-L.jpg" },
    { title: "The Wild Life of Our Bodies", type: "BOOK", category: "Biology", author: "Rob Dunn", coverUrl: "https://covers.openlibrary.org/b/id/11959889-L.jpg" },
    { title: "The Trouble with Testosterone", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky", coverUrl: "https://covers.openlibrary.org/b/id/426426-L.jpg" },
    { title: "A Primate's Memoir", type: "BOOK", category: "Animal Behavior", author: "Robert M. Sapolsky", coverUrl: "https://covers.openlibrary.org/b/id/471241-L.jpg" },
    { title: "Monkeyluv", type: "BOOK", category: "Animal Behavior", author: "Robert M. Sapolsky", coverUrl: "https://covers.openlibrary.org/b/id/474227-L.jpg" },
    { title: "Are We Smart Enough to Know How Smart Animals Are?", type: "BOOK", category: "Animal Behavior", author: "Frans de Waal", coverUrl: "https://covers.openlibrary.org/b/id/12514840-L.jpg" },
    { title: "The Mind-Gut Connection", type: "BOOK", category: "Health", author: "Emeran Mayer", coverUrl: "https://covers.openlibrary.org/b/id/7444751-L.jpg" },
    { title: "I Contain Multitudes", type: "BOOK", category: "Biology", author: "Ed Yong", coverUrl: "https://covers.openlibrary.org/b/id/8085300-L.jpg" },
    { title: "The Emperor of All Maladies", type: "BOOK", category: "Genetics", author: "Siddhartha Mukherjee", coverUrl: "https://covers.openlibrary.org/b/id/11320203-L.jpg" },
    { title: "Why Zebras Don't Get Ulcers", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky", coverUrl: "https://covers.openlibrary.org/b/id/12493377-L.jpg" },

    { title: "Philosophy of Mind", type: "BOOK", category: "Philosophy of Mind", author: "Edward Feser", coverUrl: "https://covers.openlibrary.org/b/id/2043916-L.jpg" },
    { title: "Sizing Up Consciousness", type: "BOOK", category: "Philosophy of Mind", author: "Marcello Massimini & Giulio Tononi", coverUrl: "https://covers.openlibrary.org/b/id/8832402-L.jpg" },
    { title: "From Bacteria to Bach and Back", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", coverUrl: "https://covers.openlibrary.org/b/id/8425621-L.jpg" },
    { title: "Intuition Pumps and Other Tools for Thinking", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", coverUrl: "https://covers.openlibrary.org/b/id/7277286-L.jpg" },
    { title: "Consciousness Explained", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", coverUrl: "https://covers.openlibrary.org/b/id/3964666-L.jpg" },
    { title: "Darwin's Dangerous Idea", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", coverUrl: "https://covers.openlibrary.org/b/id/3889800-L.jpg" },
    { title: "Constructing the World", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", coverUrl: "https://covers.openlibrary.org/b/id/10104367-L.jpg" },
    { title: "The Character of Consciousness", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", coverUrl: "https://covers.openlibrary.org/b/id/10709813-L.jpg" },
    { title: "The Conscious Mind", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", coverUrl: "https://covers.openlibrary.org/b/id/123344-L.jpg" },
    { title: "Philosophy of Mind: Classical and Contemporary Readings", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers (ed.)", coverUrl: "https://covers.openlibrary.org/b/id/125477-L.jpg" },

    { title: "Seven and a Half Lessons About the Brain", type: "BOOK", category: "Neuroscience", author: "Lisa Feldman Barrett", coverUrl: "https://covers.openlibrary.org/b/id/10543903-L.jpg" },
    { title: "Deep", type: "BOOK", category: "Health", author: "James Nestor", coverUrl: "https://covers.openlibrary.org/b/id/8469127-L.jpg" },
    { title: "What a Fish Knows", type: "BOOK", category: "Animal Behavior", author: "Jonathan Balcombe", coverUrl: "https://covers.openlibrary.org/b/id/8408966-L.jpg" },
    { title: "Other Minds", type: "BOOK", category: "Biology", author: "Peter Godfrey-Smith", coverUrl: "https://covers.openlibrary.org/b/id/9244367-L.jpg" },
    { title: "At the Water's Edge", type: "BOOK", category: "Evolutionary Biology", author: "Carl Zimmer", coverUrl: "https://covers.openlibrary.org/b/id/427901-L.jpg" },
    { title: "The Hidden Life of Trees", type: "BOOK", category: "Botany", author: "Peter Wohlleben", coverUrl: "https://covers.openlibrary.org/b/id/8064205-L.jpg" },
    { title: "The Soul of an Octopus", type: "BOOK", category: "Animal Behavior", author: "Sy Montgomery", coverUrl: "https://covers.openlibrary.org/b/id/10665428-L.jpg" },
    { title: "The Genius of Birds", type: "BOOK", category: "Animal Behavior", author: "Jennifer Ackerman", coverUrl: "https://covers.openlibrary.org/b/id/10125224-L.jpg" },
    { title: "What a Plant Knows", type: "BOOK", category: "Botany", author: "Daniel Chamovitz", coverUrl: "https://covers.openlibrary.org/b/id/10454364-L.jpg" },
    { title: "The Secret Life of Plants", type: "BOOK", category: "Botany", author: "Peter Tompkins & Christopher Bird", coverUrl: "https://covers.openlibrary.org/b/id/6560972-L.jpg" },
    { title: "This Is Your Brain on Parasites", type: "BOOK", category: "Biology", author: "Kathleen McAuliffe", coverUrl: "https://covers.openlibrary.org/b/id/8858094-L.jpg" },
    { title: "Parasite Rex", type: "BOOK", category: "Biology", author: "Carl Zimmer", coverUrl: "https://covers.openlibrary.org/b/id/427918-L.jpg" },
    { title: "The Oxygen Advantage", type: "BOOK", category: "Health", author: "Patrick McKeown", coverUrl: "https://covers.openlibrary.org/b/id/13759322-L.jpg" },
    { title: "Breath", type: "BOOK", category: "Health", author: "James Nestor", coverUrl: "https://covers.openlibrary.org/b/id/10096454-L.jpg" },
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
