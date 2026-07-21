const express = require("express");
const bcrypt = require("bcryptjs");
const prisma = require("../lib/prisma");
const requireAdmin = require("../middleware/requireAdmin");
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

const DEFAULT_LOAN_DAYS = 14;

function defaultDueBackDateString() {
  const d = new Date();
  d.setDate(d.getDate() + DEFAULT_LOAN_DAYS);
  return d.toISOString().slice(0, 10);
}

async function getExistingCategories() {
  const items = await prisma.item.findMany({ select: { category: true } });
  return [...new Set(items.map((i) => i.category).filter(Boolean))].sort();
}

router.get("/login", (req, res) => {
  if (req.session.isAdmin) return res.redirect("/admin");
  res.render("admin/login", { title: "Admin login" });
});

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const password = req.body.password || "";
    const hash = process.env.ADMIN_PASSWORD_HASH;

    const valid = hash ? await bcrypt.compare(password, hash) : false;

    if (!valid) {
      req.session.error = "Incorrect password.";
      return res.redirect("/admin/login");
    }

    req.session.isAdmin = true;
    res.redirect("/admin");
  })
);

router.post("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

router.use(requireAdmin);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const [pendingRequests, activeLoans, items] = await Promise.all([
      prisma.request.findMany({
        where: { status: "PENDING" },
        include: { item: true },
        orderBy: [{ item: { title: "asc" } }, { requestedAt: "asc" }],
      }),
      prisma.loan.findMany({
        where: { returnedOn: null },
        include: { item: true },
        orderBy: { dueBack: "asc" },
      }),
      prisma.item.findMany({ include: ITEM_INCLUDE, orderBy: { title: "asc" } }),
    ]);

    const q = (req.query.q || "").trim();
    const itemsWithStatus = items
      .filter((item) => matchesQuery(item.title, q))
      .map((item) => ({ ...item, status: getItemStatus(item) }));

    res.render("admin/dashboard", {
      pendingRequests,
      activeLoans,
      items: itemsWithStatus,
      allTitles: items.map((i) => ({ id: i.id, title: i.title })),
      now: new Date(),
      defaultDueBack: defaultDueBackDateString(),
      currentQuery: q,
      ITEM_TYPES,
      coverUrlForSize,
    });
  })
);

router.post(
  "/requests/:id/approve",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const request = await prisma.request.findUnique({
      where: { id },
      include: { item: { include: ITEM_INCLUDE } },
    });

    if (!request || request.status !== "PENDING") {
      req.session.error = "That request is no longer pending.";
      return res.redirect("/admin");
    }

    const status = getItemStatus(request.item);
    if (status.state === "RENTED") {
      req.session.error = "That item is already out on loan.";
      return res.redirect("/admin");
    }

    let dueBack = null;
    if (!req.body.indefinite && req.body.dueBack) {
      const parsed = new Date(req.body.dueBack);
      if (!Number.isNaN(parsed.getTime())) dueBack = parsed;
    }

    const otherPendingCount = status.pendingRequests.filter((r) => r.id !== id).length;

    await prisma.$transaction([
      prisma.loan.create({
        data: { itemId: request.itemId, borrowerName: request.requesterName, dueBack },
      }),
      prisma.request.update({ where: { id }, data: { status: "APPROVED" } }),
      prisma.request.updateMany({
        where: { itemId: request.itemId, status: "PENDING", id: { not: id } },
        data: { status: "REJECTED" },
      }),
    ]);

    req.session.flash = `Approved "${request.item.title}" for ${request.requesterName}.`
      + (otherPendingCount > 0 ? ` (${otherPendingCount} other request${otherPendingCount === 1 ? '' : 's'} for this item declined.)` : '');
    res.redirect("/admin");
  })
);

router.post(
  "/requests/:id/reject",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const request = await prisma.request.findUnique({ where: { id }, include: { item: true } });

    if (!request || request.status !== "PENDING") {
      req.session.error = "That request is no longer pending.";
      return res.redirect("/admin");
    }

    await prisma.request.update({ where: { id }, data: { status: "REJECTED" } });

    req.session.flash = `Rejected request for "${request.item.title}".`;
    res.redirect("/admin");
  })
);

router.post(
  "/loans/:id/return",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const loan = await prisma.loan.findUnique({ where: { id }, include: { item: true } });

    if (!loan || loan.returnedOn) {
      req.session.error = "That loan is already closed.";
      return res.redirect("/admin");
    }

    await prisma.loan.update({ where: { id }, data: { returnedOn: new Date() } });

    req.session.flash = `Marked "${loan.item.title}" as returned.`;
    res.redirect("/admin");
  })
);

router.get(
  "/items/new",
  asyncHandler(async (req, res) => {
    const existingCategories = await getExistingCategories();
    res.render("admin/item-form", { item: null, ITEM_TYPES, existingCategories });
  })
);

router.post(
  "/items/new",
  asyncHandler(async (req, res) => {
    const { title, type, category, author, externalUrl, coverUrl, notes } = req.body;

    if (!title || !title.trim() || !isValidItemType(type)) {
      req.session.error = "Title and type are required.";
      return res.redirect("/admin/items/new");
    }

    const item = await prisma.item.create({
      data: {
        title: title.trim(),
        type,
        category: category && category.trim() ? category.trim() : null,
        author: author && author.trim() ? author.trim() : null,
        externalUrl: externalUrl && externalUrl.trim() ? externalUrl.trim() : null,
        coverUrl: coverUrl && coverUrl.trim() ? coverUrl.trim() : null,
        notes: notes && notes.trim() ? notes.trim() : null,
      },
    });

    req.session.flash = `Added "${item.title}".`;
    res.redirect("/admin");
  })
);

router.get(
  "/items/:id/edit",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const [item, existingCategories] = await Promise.all([
      prisma.item.findUnique({ where: { id } }),
      getExistingCategories(),
    ]);
    if (!item) return res.status(404).render("404");
    res.render("admin/item-form", { item, ITEM_TYPES, existingCategories });
  })
);

router.post(
  "/items/:id/edit",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const { title, type, category, author, externalUrl, coverUrl, notes } = req.body;

    const existing = await prisma.item.findUnique({ where: { id } });
    if (!existing) return res.status(404).render("404");

    if (!title || !title.trim() || !isValidItemType(type)) {
      req.session.error = "Title and type are required.";
      return res.redirect(`/admin/items/${id}/edit`);
    }

    await prisma.item.update({
      where: { id },
      data: {
        title: title.trim(),
        type,
        category: category && category.trim() ? category.trim() : null,
        author: author && author.trim() ? author.trim() : null,
        externalUrl: externalUrl && externalUrl.trim() ? externalUrl.trim() : null,
        coverUrl: coverUrl && coverUrl.trim() ? coverUrl.trim() : null,
        notes: notes && notes.trim() ? notes.trim() : null,
      },
    });

    req.session.flash = `Saved changes to "${title.trim()}".`;
    res.redirect("/admin");
  })
);

router.post(
  "/items/:id/delete",
  asyncHandler(async (req, res) => {
    const id = Number(req.params.id);
    const item = await prisma.item.findUnique({ where: { id }, include: ITEM_INCLUDE });
    if (!item) return res.status(404).render("404");

    const status = getItemStatus(item);
    if (status.state !== "AVAILABLE") {
      req.session.error = "Can't delete an item that's requested or out on loan.";
      return res.redirect("/admin");
    }

    await prisma.item.delete({ where: { id } });

    req.session.flash = `Deleted "${item.title}".`;
    res.redirect("/admin");
  })
);

module.exports = router;
