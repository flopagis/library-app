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

    { title: "How to Win Friends and Influence People", type: "BOOK", category: "Self-Help", author: "Dale Carnegie", externalUrl: "https://www.goodreads.com/book/show/4865.How_to_Win_Friends_Influence_People", coverUrl: "https://covers.openlibrary.org/b/id/13314878-L.jpg" },
    { title: "The 7 Habits of Highly Effective People", type: "BOOK", category: "Self-Help", author: "Stephen R. Covey", externalUrl: "https://www.goodreads.com/book/show/36072.The_7_Habits_of_Highly_Effective_People", coverUrl: "https://covers.openlibrary.org/b/id/10079937-L.jpg" },
    { title: "The Creative Act", type: "BOOK", category: "Creativity", author: "Rick Rubin", externalUrl: "https://www.goodreads.com/book/show/60965426-the-creative-act", coverUrl: "https://covers.openlibrary.org/b/id/13316390-L.jpg" },
    { title: "She Has Her Mother's Laugh", type: "BOOK", category: "Genetics", author: "Carl Zimmer", externalUrl: "https://www.goodreads.com/book/show/36391536-she-has-her-mother-s-laugh", coverUrl: "https://covers.openlibrary.org/b/id/10140352-L.jpg" },
    { title: "The Omnivore's Dilemma", type: "BOOK", category: "Food & Nutrition", author: "Michael Pollan", externalUrl: "https://www.goodreads.com/book/show/3109.The_Omnivore_s_Dilemma", coverUrl: "https://covers.openlibrary.org/b/id/8596706-L.jpg" },

    { title: "Game Tech: The Math and Science of Gaming", type: "BOOK", category: "Game Design", author: "Geoffrey Engelstein" },
    { title: "A Game Design Vocabulary", type: "BOOK", category: "Game Design", author: "Anna Anthropy & Naomi Clark", externalUrl: "https://www.goodreads.com/book/show/16269919-a-game-design-vocabulary", coverUrl: "https://covers.openlibrary.org/b/id/9403888-L.jpg" },
    { title: "The Game Designer's Playlist", type: "BOOK", category: "Game Design", author: "Zack Hiwiller", coverUrl: "https://covers.openlibrary.org/b/id/8814603-L.jpg" },
    { title: "Game Changer", type: "BOOK", category: "Game Design", author: "Matthew Sadler & Natasha Regan", externalUrl: "https://www.goodreads.com/book/show/43171395-game-changer" },
    { title: "Design Patterns", type: "BOOK", category: "Computer Science", author: "Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides", externalUrl: "https://www.goodreads.com/book/show/85009.Design_Patterns", coverUrl: "https://covers.openlibrary.org/b/id/6601119-L.jpg" },
    { title: "Cracking the Coding Interview", type: "BOOK", category: "Computer Science", author: "Gayle Laakmann McDowell", externalUrl: "https://www.goodreads.com/book/show/55014663-cracking-the-coding-interview", coverUrl: "https://covers.openlibrary.org/b/id/7276811-L.jpg" },
    { title: "Algorithms", type: "BOOK", category: "Computer Science", author: "Robert Sedgewick & Kevin Wayne", notes: "Fourth Edition", externalUrl: "https://www.goodreads.com/book/show/10803540-algorithms", coverUrl: "https://covers.openlibrary.org/b/id/7992499-L.jpg" },
    { title: "Python Machine Learning", type: "BOOK", category: "Machine Learning", author: "Sebastian Raschka & Vahid Mirjalili", notes: "Second Edition", externalUrl: "https://www.goodreads.com/book/show/25545994-python-machine-learning", coverUrl: "https://covers.openlibrary.org/b/id/8509317-L.jpg" },
    { title: "Hands-On Machine Learning with Scikit-Learn and TensorFlow", type: "BOOK", category: "Machine Learning", author: "Aurelien Geron", externalUrl: "https://www.goodreads.com/book/show/32899495-hands-on-machine-learning-with-scikit-learn-and-tensorflow" },

    { title: "Never Home Alone", type: "BOOK", category: "Biology", author: "Rob Dunn", externalUrl: "https://www.goodreads.com/book/show/39088985-never-home-alone", coverUrl: "https://covers.openlibrary.org/b/id/10093522-L.jpg" },
    { title: "Nature via Nurture", type: "BOOK", category: "Genetics", author: "Matt Ridley", externalUrl: "https://www.goodreads.com/book/show/80035.Nature_Via_Nurture", coverUrl: "https://covers.openlibrary.org/b/id/20464-L.jpg" },
    { title: "In the Shadow of Man", type: "BOOK", category: "Animal Behavior", author: "Jane Goodall", externalUrl: "https://www.goodreads.com/book/show/135486.In_the_Shadow_of_Man", coverUrl: "https://covers.openlibrary.org/b/id/5376160-L.jpg" },
    { title: "The Wild Life of Our Bodies", type: "BOOK", category: "Biology", author: "Rob Dunn", externalUrl: "https://www.goodreads.com/book/show/10746145-the-wild-life-of-our-bodies", coverUrl: "https://covers.openlibrary.org/b/id/11959889-L.jpg" },
    { title: "The Trouble with Testosterone", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky", externalUrl: "https://www.goodreads.com/book/show/20668.The_Trouble_with_Testosterone_and_Other_Essays_on_the_Biology_of_the_Human_Predicament", coverUrl: "https://covers.openlibrary.org/b/id/426426-L.jpg" },
    { title: "A Primate's Memoir", type: "BOOK", category: "Animal Behavior", author: "Robert M. Sapolsky", externalUrl: "https://www.goodreads.com/book/show/32289.A_Primate_s_Memoir", coverUrl: "https://covers.openlibrary.org/b/id/471241-L.jpg" },
    { title: "Monkeyluv", type: "BOOK", category: "Animal Behavior", author: "Robert M. Sapolsky", externalUrl: "https://www.goodreads.com/book/show/20671.Monkeyluv", coverUrl: "https://covers.openlibrary.org/b/id/474227-L.jpg" },
    { title: "Are We Smart Enough to Know How Smart Animals Are?", type: "BOOK", category: "Animal Behavior", author: "Frans de Waal", externalUrl: "https://www.goodreads.com/book/show/30231743-are-we-smart-enough-to-know-how-smart-animals-are", coverUrl: "https://covers.openlibrary.org/b/id/12514840-L.jpg" },
    { title: "The Mind-Gut Connection", type: "BOOK", category: "Health", author: "Emeran Mayer", externalUrl: "https://www.goodreads.com/book/show/24700355-the-mind-gut-connection", coverUrl: "https://covers.openlibrary.org/b/id/7444751-L.jpg" },
    { title: "I Contain Multitudes", type: "BOOK", category: "Biology", author: "Ed Yong", externalUrl: "https://www.goodreads.com/en/book/show/27213168-i-contain-multitudes", coverUrl: "https://covers.openlibrary.org/b/id/8085300-L.jpg" },
    { title: "The Emperor of All Maladies", type: "BOOK", category: "Genetics", author: "Siddhartha Mukherjee", externalUrl: "https://www.goodreads.com/book/show/7170627-the-emperor-of-all-maladies", coverUrl: "https://covers.openlibrary.org/b/id/11320203-L.jpg" },
    { title: "Why Zebras Don't Get Ulcers", type: "BOOK", category: "Neuroscience", author: "Robert M. Sapolsky", externalUrl: "https://www.goodreads.com/book/show/327.Why_Zebras_Don_t_Get_Ulcers", coverUrl: "https://covers.openlibrary.org/b/id/12493377-L.jpg" },

    { title: "Philosophy of Mind", type: "BOOK", category: "Philosophy of Mind", author: "Edward Feser", externalUrl: "https://www.goodreads.com/book/show/752479.The_Philosophy_of_Mind", coverUrl: "https://covers.openlibrary.org/b/id/2043916-L.jpg" },
    { title: "Sizing Up Consciousness", type: "BOOK", category: "Philosophy of Mind", author: "Marcello Massimini & Giulio Tononi", externalUrl: "https://www.goodreads.com/book/show/38647538", coverUrl: "https://covers.openlibrary.org/b/id/8832402-L.jpg" },
    { title: "From Bacteria to Bach and Back", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", externalUrl: "https://www.goodreads.com/book/show/35167699-from-bacteria-to-bach-and-back", coverUrl: "https://covers.openlibrary.org/b/id/8425621-L.jpg" },
    { title: "Intuition Pumps and Other Tools for Thinking", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", externalUrl: "https://www.goodreads.com/book/show/18378002-intuition-pumps-and-other-tools-for-thinking", coverUrl: "https://covers.openlibrary.org/b/id/7277286-L.jpg" },
    { title: "Consciousness Explained", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", externalUrl: "https://www.goodreads.com/book/show/2069.Consciousness_Explained", coverUrl: "https://covers.openlibrary.org/b/id/3964666-L.jpg" },
    { title: "Darwin's Dangerous Idea", type: "BOOK", category: "Philosophy of Mind", author: "Daniel C. Dennett", externalUrl: "https://www.goodreads.com/book/show/2068.Darwin_s_Dangerous_Idea", coverUrl: "https://covers.openlibrary.org/b/id/3889800-L.jpg" },
    { title: "Constructing the World", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", externalUrl: "https://www.goodreads.com/book/show/14828329-constructing-the-world", coverUrl: "https://covers.openlibrary.org/b/id/10104367-L.jpg" },
    { title: "The Character of Consciousness", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", externalUrl: "https://www.goodreads.com/book/show/752483.The_Character_of_Consciousness", coverUrl: "https://covers.openlibrary.org/b/id/10709813-L.jpg" },
    { title: "The Conscious Mind", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers", externalUrl: "https://www.goodreads.com/book/show/144960.The_Conscious_Mind", coverUrl: "https://covers.openlibrary.org/b/id/123344-L.jpg" },
    { title: "Philosophy of Mind: Classical and Contemporary Readings", type: "BOOK", category: "Philosophy of Mind", author: "David J. Chalmers (ed.)", externalUrl: "https://www.goodreads.com/book/show/31839.Philosophy_of_Mind", coverUrl: "https://covers.openlibrary.org/b/id/125477-L.jpg" },

    { title: "Seven and a Half Lessons About the Brain", type: "BOOK", category: "Neuroscience", author: "Lisa Feldman Barrett", externalUrl: "https://www.goodreads.com/book/show/48930266-seven-and-a-half-lessons-about-the-brain", coverUrl: "https://covers.openlibrary.org/b/id/10543903-L.jpg" },
    { title: "Deep", type: "BOOK", category: "Health", author: "James Nestor", externalUrl: "https://www.goodreads.com/book/show/18222705-deep", coverUrl: "https://covers.openlibrary.org/b/id/8469127-L.jpg" },
    { title: "What a Fish Knows", type: "BOOK", category: "Animal Behavior", author: "Jonathan Balcombe", externalUrl: "https://www.goodreads.com/book/show/26114430-what-a-fish-knows", coverUrl: "https://covers.openlibrary.org/b/id/8408966-L.jpg" },
    { title: "Other Minds", type: "BOOK", category: "Biology", author: "Peter Godfrey-Smith", externalUrl: "https://www.goodreads.com/book/show/28116739-other-minds", coverUrl: "https://covers.openlibrary.org/b/id/9244367-L.jpg" },
    { title: "At the Water's Edge", type: "BOOK", category: "Evolutionary Biology", author: "Carl Zimmer", externalUrl: "https://www.goodreads.com/book/show/374074", coverUrl: "https://covers.openlibrary.org/b/id/427901-L.jpg" },
    { title: "The Hidden Life of Trees", type: "BOOK", category: "Botany", author: "Peter Wohlleben", externalUrl: "https://www.goodreads.com/book/show/28256439-the-hidden-life-of-trees", coverUrl: "https://covers.openlibrary.org/b/id/8064205-L.jpg" },
    { title: "The Soul of an Octopus", type: "BOOK", category: "Animal Behavior", author: "Sy Montgomery", externalUrl: "https://www.goodreads.com/en/book/show/22609485-the-soul-of-an-octopus", coverUrl: "https://covers.openlibrary.org/b/id/10665428-L.jpg" },
    { title: "The Genius of Birds", type: "BOOK", category: "Animal Behavior", author: "Jennifer Ackerman", externalUrl: "https://www.goodreads.com/book/show/25938481-the-genius-of-birds", coverUrl: "https://covers.openlibrary.org/b/id/10125224-L.jpg" },
    { title: "What a Plant Knows", type: "BOOK", category: "Botany", author: "Daniel Chamovitz", externalUrl: "https://www.goodreads.com/book/show/13166639-what-a-plant-knows", coverUrl: "https://covers.openlibrary.org/b/id/10454364-L.jpg" },
    { title: "The Secret Life of Plants", type: "BOOK", category: "Botany", author: "Peter Tompkins & Christopher Bird", externalUrl: "https://www.goodreads.com/book/show/6054496-the-secret-life-of-plants", coverUrl: "https://covers.openlibrary.org/b/id/6560972-L.jpg" },
    { title: "This Is Your Brain on Parasites", type: "BOOK", category: "Biology", author: "Kathleen McAuliffe", externalUrl: "https://www.goodreads.com/book/show/25897836-this-is-your-brain-on-parasites", coverUrl: "https://covers.openlibrary.org/b/id/8858094-L.jpg" },
    { title: "Parasite Rex", type: "BOOK", category: "Biology", author: "Carl Zimmer", externalUrl: "https://www.goodreads.com/book/show/815394.Parasite_Rex", coverUrl: "https://covers.openlibrary.org/b/id/427918-L.jpg" },
    { title: "The Oxygen Advantage", type: "BOOK", category: "Health", author: "Patrick McKeown", externalUrl: "https://www.goodreads.com/book/show/26533127-the-oxygen-advantage", coverUrl: "https://covers.openlibrary.org/b/id/13759322-L.jpg" },
    { title: "Breath", type: "BOOK", category: "Health", author: "James Nestor", externalUrl: "https://www.goodreads.com/book/show/48890486-breath", coverUrl: "https://covers.openlibrary.org/b/id/10096454-L.jpg" },
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
