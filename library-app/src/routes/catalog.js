const express = require("express");
const prisma = require("../lib/prisma");
const { getItemStatus } = require("../lib/itemStatus");
const { ITEM_TYPES, isValidItemType } = require("../lib/itemTypes");
const { matchesQuery } = require("../lib/search");
const asyncHandler = require("../lib/asyncHandler");

const router = express.Router();

const ITEM_INCLUDE = {
  loans: { orderBy: { rentedOn: "desc" } },
  requests: true,
};

router.get("/", asyncHandler(async (req, res) => {
  const type = isValidItemType(req.query.type) ? req.query.type : null;
  const q = (req.query.q || "").trim();

  const items = await prisma.item.findMany({
    where: type ? { type } : undefined,
    include: ITEM_INCLUDE,
    orderBy: { title: "asc" },
  });

  const availableCategories = type
    ? [...new Set(items.map((i) => i.category).filter(Boolean))].sort()
    : [];
  const category = availableCategories.includes(req.query.category) ? req.query.category : null;

  const itemsWithStatus = items
    .filter((item) => !category || item.category === category)
    .filter((item) => matchesQuery(item.title, q))
    .map((item) => ({ ...item, status: getItemStatus(item) }));

  res.render("catalog", {
    items: itemsWithStatus,
    currentType: type,
    currentQuery: q,
    currentCategory: category,
    availableCategories,
    ITEM_TYPES,
  });
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
  if (status.state !== "AVAILABLE") {
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
