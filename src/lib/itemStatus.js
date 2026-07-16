const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start, end) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}

// item must include { loans, requests }
// Multiple people may request the same item at once — the admin picks who gets it.
// "REQUESTED" is internal/admin-facing only; the public only ever sees AVAILABLE or RENTED
// (isPubliclyAvailable covers both AVAILABLE and REQUESTED, since pending requests aren't shown publicly).
function getItemStatus(item) {
  const activeLoan = item.loans.find((l) => l.returnedOn === null) || null;
  const pendingRequests = !activeLoan
    ? item.requests.filter((r) => r.status === "PENDING")
    : [];

  if (activeLoan) {
    const now = new Date();
    return {
      state: "RENTED",
      activeLoan,
      pendingRequests: [],
      isPubliclyAvailable: false,
      durationDays: daysBetween(activeLoan.rentedOn, now),
      isOverdue: activeLoan.dueBack ? now > activeLoan.dueBack : false,
    };
  }

  if (pendingRequests.length > 0) {
    return { state: "REQUESTED", activeLoan: null, pendingRequests, isPubliclyAvailable: true };
  }

  return { state: "AVAILABLE", activeLoan: null, pendingRequests: [], isPubliclyAvailable: true };
}

module.exports = { getItemStatus, daysBetween };
