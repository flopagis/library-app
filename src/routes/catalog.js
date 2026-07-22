const express = require("express");
const prisma = require("../lib/prisma");
const { getItemStatus } = require("../lib/itemStatus");
const { ITEM_TYPES, isValidItemType } = require("../lib/itemTypes");
const { matchesQuery } = require("../lib/search");
const { coverUrlForSize } = require("../lib/coverImage");
const asyncHandler = require("../lib/asyncHandler");

const router = express.Router();

const ITEM_INCLUDE = {
  loans: { orderBy: { rentedOn: "desc" } },
  requests: true,
};

const PAGE_SIZE = 15; // 3 rows of 5 on the catalog grid

async function getFilteredItems({ type, category, q }) {
  const items = await prisma.item.findMany({
    where: type ? { type } : undefined,
    include: ITEM_INCLUDE,
    orderBy: { title: "asc" },
  });

  const availableCategories = type
    ? [...new Set(items.map((i) => i.category).filter(Boolean))].sort()
    : [];
  const resolvedCategory = availableCategories.includes(category) ? category : null;

  const filtered = items
    .filter((item) => !resolvedCategory || item.category === resolvedCategory)
    .filter((item) => matchesQuery(item.title, q))
    .map((item) => ({ ...item, status: getItemStatus(item) }));

  return { filtered, availableCategories, resolvedCategory };
}

router.get("/", asyncHandler(async (req, res) => {
  const type = isValidItemType(req.query.type) ? req.query.type : null;
  const q = (req.query.q || "").trim();

  const [{ filtered, availableCategories, resolvedCategory }, allTitles] = await Promise.all([
    getFilteredItems({ type, category: req.query.category, q }),
    prisma.item.findMany({ select: { id: true, title: true }, orderBy: { title: "asc" } }),
  ]);

  const pageItems = filtered.slice(0, PAGE_SIZE);
  const hasMore = filtered.length > PAGE_SIZE;

  res.render("catalog", {
    items: pageItems,
    hasMore,
    currentType: type,
    currentQuery: q,
    currentCategory: resolvedCategory,
    availableCategories,
    allTitles,
    ITEM_TYPES,
    coverUrlForSize,
  });
}));

router.get("/items-page", asyncHandler(async (req, res) => {
  const type = isValidItemType(req.query.type) ? req.query.type : null;
  const q = (req.query.q || "").trim();
  const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);

  const { filtered } = await getFilteredItems({ type, category: req.query.category, q });
  const pageItems = filtered.slice(offset, offset + PAGE_SIZE);
  const hasMore = offset + PAGE_SIZE < filtered.length;

  res.set("X-Has-More", hasMore ? "true" : "false");
  res.set("X-Next-Offset", String(offset + pageItems.length));
  res.render("partials/item-cards", { items: pageItems, ITEM_TYPES, coverUrlForSize });
}));

router.get("/items/:id", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).render("404");

  const item = await prisma.item.findUnique({
    where: { id },
    include: ITEM_INCLUDE,
  });

  if (!item) return res.status(404).render("404");

  res.render("item", { item: { ...item, status: getItemStatus(item) }, ITEM_TYPES });
}));

router.post("/items/:id/request", asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(404).render("404");

  const requesterName = (req.body.requesterName || "").trim();

  const item = await prisma.item.findUnique({
    where: { id },
    include: ITEM_INCLUDE,
  });

  if (!item) return res.status(404).render("404");

  if (!requesterName) {
    req.session.error = "Please enter your name to request this item.";
    return res.redirect(`/items/${id}`);
  }

  const status = getItemStatus(item);
  if (!status.isPubliclyAvailable) {
    req.session.error = "Sorry, that item isn't available anymore.";
    return res.redirect(`/items/${id}`);
  }

  await prisma.request.create({
    data: { itemId: id, requesterName },
  });

  req.session.flash = `Request sent for "${item.title}". The admin will confirm it soon.`;
  res.redirect(`/items/${id}`);
}));

module.exports = router;
