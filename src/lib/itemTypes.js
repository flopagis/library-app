const ITEM_TYPES = {
  BOOK: { label: "Book", emoji: "📖", externalLabel: "Goodreads" },
  BOARD_GAME: { label: "Board Game", emoji: "🎲", externalLabel: "BoardGameGeek" },
};

function isValidItemType(type) {
  return Object.prototype.hasOwnProperty.call(ITEM_TYPES, type);
}

module.exports = { ITEM_TYPES, isValidItemType };
