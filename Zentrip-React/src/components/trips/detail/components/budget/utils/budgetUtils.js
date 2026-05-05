export function getExpenseShare(expense, uid) {
  if (!expense.splitAmong?.includes(uid)) return 0;
  const base = expense.tripAmount ?? expense.amount;
  const rate = expense.exchangeRate ?? 1;
  if (expense.splitType === 'percentage') {
    return ((expense.percentages?.[uid] ?? 0) / 100) * base;
  }
  if (expense.splitType === 'amounts') {
    return (expense.customAmounts?.[uid] ?? 0) * rate;
  }
  const n = expense.splitAmong.length || 1;
  const each = Math.floor((base / n) * 100) / 100;
  const remainder = Math.round((base - each * n) * 100);
  if (remainder === 0) return each;
  const seed = expense.id
    ? [...expense.id].reduce((s, c) => s + c.charCodeAt(0), 0)
    : 0;
  const extraIdx = seed % n;
  return expense.splitAmong[extraIdx] === uid ? each + remainder / 100 : each;
}

export function computeSettlement(expenses, members, payments = []) {
  const balances = {};
  members.forEach((m) => { balances[m.uid] = 0; });

  for (const exp of expenses) {
    if (!exp.amount || !exp.paidBy || !exp.splitAmong?.length) continue;
    const credit = exp.tripAmount ?? exp.amount;
    balances[exp.paidBy] = (balances[exp.paidBy] ?? 0) + credit;
    for (const uid of exp.splitAmong) {
      balances[uid] = (balances[uid] ?? 0) - getExpenseShare(exp, uid);
    }
  }

  for (const pay of payments) {
    if (!pay.amount || !pay.from || !pay.to) continue;
    balances[pay.from] = (balances[pay.from] ?? 0) + pay.amount;
    balances[pay.to]   = (balances[pay.to]   ?? 0) - pay.amount;
  }

  for (const uid of Object.keys(balances)) {
    balances[uid] = Math.round(balances[uid] * 100) / 100;
  }

  const creditors = Object.entries(balances)
    .filter(([, b]) => b > 0.005)
    .map(([uid, balance]) => ({ uid, balance }))
    .sort((a, b) => b.balance - a.balance);

  const debtors = Object.entries(balances)
    .filter(([, b]) => b < -0.005)
    .map(([uid, balance]) => ({ uid, balance: -balance }))
    .sort((a, b) => b.balance - a.balance);

  const debts = [];
  let ci = 0;
  let di = 0;
  while (ci < creditors.length && di < debtors.length) {
    const cred = creditors[ci];
    const debt = debtors[di];
    const amt = Math.min(cred.balance, debt.balance);
    debts.push({ from: debt.uid, to: cred.uid, amount: Math.round(amt * 100) / 100 });
    cred.balance -= amt;
    debt.balance -= amt;
    if (cred.balance < 0.005) ci += 1;
    if (debt.balance < 0.005) di += 1;
  }

  return { balances, debts };
}

export function computeCategoryTotals(expenses) {
  const totals = {
    alojamiento: 0, transporte: 0, comida: 0, actividades: 0,
    supermercado: 0, compras: 0, salud: 0, otros: 0, personalizada: 0,
  };
  for (const exp of expenses) {
    const cat = exp.category ?? 'otros';
    totals[cat] = (totals[cat] ?? 0) + (exp.tripAmount ?? exp.amount ?? 0);
  }
  return totals;
}
