const ITEM_TYPES = {
  BOOK: { label: "Book", emoji: "📖" },
  BOARD_GAME: { label: "Board Game", emoji: "🎲" },
};

function isValidItemType(type) {
  return Object.prototype.hasOwnProperty.call(ITEM_TYPES, type);
}

module.exports = { ITEM_TYPES, isValidItemType };
