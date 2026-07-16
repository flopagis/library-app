const MS_PER_DAY = 1000 * 60 * 60 * 24;

function daysBetween(start, end) {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY));
}

// item must include { loans, requests }
function getItemStatus(item) {
  const activeLoan = item.loans.find((l) => l.returnedOn === null) || null;
  const pendingRequest = !activeLoan
    ? item.requests.find((r) => r.status === "PENDING") || null
    : null;

  if (activeLoan) {
    const now = new Date();
    return {
      state: "RENTED",
      activeLoan,
      pendingRequest: null,
      durationDays: daysBetween(activeLoan.rentedOn, now),
      isOverdue: activeLoan.dueBack ? now > activeLoan.dueBack : false,
    };
  }

  if (pendingRequest) {
    return { state: "REQUESTED", activeLoan: null, pendingRequest };
  }

  return { state: "AVAILABLE", activeLoan: null, pendingRequest: null };
}

module.exports = { getItemStatus, daysBetween };
