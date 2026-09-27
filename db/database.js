import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('udhar.db');

const initDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      note TEXT,
      date TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers (id)
    );

    DROP TABLE IF EXISTS split_members;
    DROP TABLE IF EXISTS split_expenses;
    DROP TABLE IF EXISTS split_expense_shares;

    CREATE TABLE IF NOT EXISTS groups (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      currency TEXT DEFAULT 'INR',
      date TEXT DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS group_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      is_me INTEGER DEFAULT 0,
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );
    CREATE TABLE IF NOT EXISTS group_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      paid_by INTEGER NOT NULL,
      split_type TEXT DEFAULT 'equal',
      date TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups (id),
      FOREIGN KEY (paid_by) REFERENCES group_members (id)
    );
    CREATE TABLE IF NOT EXISTS expense_shares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      expense_id INTEGER NOT NULL,
      member_id INTEGER NOT NULL,
      share REAL NOT NULL,
      FOREIGN KEY (expense_id) REFERENCES group_expenses (id),
      FOREIGN KEY (member_id) REFERENCES group_members (id)
    );
    CREATE TABLE IF NOT EXISTS settlements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      group_id INTEGER NOT NULL,
      from_member INTEGER NOT NULL,
      to_member INTEGER NOT NULL,
      amount REAL NOT NULL,
      method TEXT,
      date TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (group_id) REFERENCES groups (id)
    );
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    );
  `);
};

initDB();

// ---------- Udhar functions (unchanged) ----------
export const addCustomer = (name, phone) => {
  db.runSync('INSERT INTO customers (name, phone) VALUES (?, ?)', [name, phone]);
};
export const getCustomers = () => db.getAllSync('SELECT * FROM customers ORDER BY name');
export const addTransaction = (customerId, type, amount, note) => {
  db.runSync(
    'INSERT INTO transactions (customer_id, type, amount, note) VALUES (?, ?, ?, ?)',
    [customerId, type, amount, note]
  );
};
export const getTransactions = (customerId) =>
  db.getAllSync('SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC', [customerId]);
export const getBalance = (customerId) => {
  const rows = db.getAllSync(
    'SELECT type, SUM(amount) as total FROM transactions WHERE customer_id = ? GROUP BY type',
    [customerId]
  );
  let gave = 0, got = 0;
  rows.forEach(r => { if (r.type === 'gave') gave = r.total; else got = r.total; });
  return gave - got;
};

// ---------- Groups ----------
export const createGroup = (name, description, currency) => {
  const result = db.runSync(
    'INSERT INTO groups (name, description, currency) VALUES (?, ?, ?)',
    [name, description, currency]
  );
  const groupId = result.lastInsertRowId;
  db.runSync('INSERT INTO group_members (group_id, name, is_me) VALUES (?, ?, 1)', [groupId, 'You']);
  return groupId;
};

export const getGroups = () => db.getAllSync('SELECT * FROM groups ORDER BY date DESC');

export const getGroupById = (groupId) =>
  db.getAllSync('SELECT * FROM groups WHERE id = ?', [groupId])[0];

export const getGroupMembers = (groupId) =>
  db.getAllSync('SELECT * FROM group_members WHERE group_id = ? ORDER BY is_me DESC, name', [groupId]);

export const getMeMember = (groupId) =>
  db.getAllSync('SELECT * FROM group_members WHERE group_id = ? AND is_me = 1', [groupId])[0];

export const addGroupMember = (groupId, name) => {
  db.runSync('INSERT INTO group_members (group_id, name, is_me) VALUES (?, ?, 0)', [groupId, name]);
};

// balance for one member in one group: + means gets money back, - means owes
export const getMemberBalance = (groupId, memberId) => {
  const paid = db.getAllSync(
    'SELECT SUM(amount) as total FROM group_expenses WHERE group_id = ? AND paid_by = ?',
    [groupId, memberId]
  )[0]?.total || 0;

  const owed = db.getAllSync(
    `SELECT SUM(es.share) as total FROM expense_shares es
     JOIN group_expenses ge ON es.expense_id = ge.id
     WHERE ge.group_id = ? AND es.member_id = ?`,
    [groupId, memberId]
  )[0]?.total || 0;

  const paidSettlements = db.getAllSync(
    'SELECT SUM(amount) as total FROM settlements WHERE group_id = ? AND from_member = ?',
    [groupId, memberId]
  )[0]?.total || 0;

  const receivedSettlements = db.getAllSync(
    'SELECT SUM(amount) as total FROM settlements WHERE group_id = ? AND to_member = ?',
    [groupId, memberId]
  )[0]?.total || 0;

  return paid - owed + paidSettlements - receivedSettlements;
};

export const getGroupsWithMyBalance = () => {
  return getGroups().map(g => {
    const me = getMeMember(g.id);
    const balance = me ? getMemberBalance(g.id, me.id) : 0;
    return { ...g, balance };
  });
};

export const getDashboardTotals = () => {
  const groups = getGroupsWithMyBalance();
  let youOwe = 0, youAreOwed = 0;
  groups.forEach(g => {
    if (g.balance > 0) youAreOwed += g.balance;
    else youOwe += Math.abs(g.balance);
  });
  return { youOwe, youAreOwed, net: youAreOwed - youOwe };
};

// ---------- Expenses ----------
export const addExpense = (groupId, description, amount, paidBy, participantShares, splitType) => {
  // participantShares = { memberId: shareAmount, ... } already calculated
  const result = db.runSync(
    'INSERT INTO group_expenses (group_id, description, amount, paid_by, split_type) VALUES (?, ?, ?, ?, ?)',
    [groupId, description, amount, paidBy, splitType]
  );
  const expenseId = result.lastInsertRowId;
  Object.entries(participantShares).forEach(([memberId, share]) => {
    db.runSync(
      'INSERT INTO expense_shares (expense_id, member_id, share) VALUES (?, ?, ?)',
      [expenseId, memberId, share]
    );
  });
};

export const getGroupExpenses = (groupId) => db.getAllSync(
  `SELECT ge.*, gm.name as paid_by_name FROM group_expenses ge
   JOIN group_members gm ON ge.paid_by = gm.id
   WHERE ge.group_id = ? ORDER BY ge.date DESC`,
  [groupId]
);

export const getExpenseDetail = (expenseId) => {
  const expense = db.getAllSync(
    `SELECT ge.*, gm.name as paid_by_name FROM group_expenses ge
     JOIN group_members gm ON ge.paid_by = gm.id WHERE ge.id = ?`,
    [expenseId]
  )[0];
  const shares = db.getAllSync(
    `SELECT es.*, gm.name FROM expense_shares es
     JOIN group_members gm ON es.member_id = gm.id WHERE es.expense_id = ?`,
    [expenseId]
  );
  return { expense, shares };
};

export const deleteExpense = (expenseId) => {
  db.runSync('DELETE FROM expense_shares WHERE expense_id = ?', [expenseId]);
  db.runSync('DELETE FROM group_expenses WHERE id = ?', [expenseId]);
};

export const getGroupSummary = (groupId) => {
  const me = getMeMember(groupId);
  const total = db.getAllSync(
    'SELECT SUM(amount) as total FROM group_expenses WHERE group_id = ?',
    [groupId]
  )[0]?.total || 0;
  const youPaid = me ? (db.getAllSync(
    'SELECT SUM(amount) as total FROM group_expenses WHERE group_id = ? AND paid_by = ?',
    [groupId, me.id]
  )[0]?.total || 0) : 0;
  const yourShare = me ? (db.getAllSync(
    `SELECT SUM(es.share) as total FROM expense_shares es
     JOIN group_expenses ge ON es.expense_id = ge.id
     WHERE ge.group_id = ? AND es.member_id = ?`,
    [groupId, me.id]
  )[0]?.total || 0) : 0;
  return { total, youPaid, yourShare, net: youPaid - yourShare };
};

// ---------- Settlements ----------
export const recordSettlement = (groupId, fromMember, toMember, amount, method) => {
  db.runSync(
    'INSERT INTO settlements (group_id, from_member, to_member, amount, method) VALUES (?, ?, ?, ?, ?)',
    [groupId, fromMember, toMember, amount, method]
  );
};

export const getSettlements = (groupId) => db.getAllSync(
  `SELECT s.*, fm.name as from_name, tm.name as to_name FROM settlements s
   JOIN group_members fm ON s.from_member = fm.id
   JOIN group_members tm ON s.to_member = tm.id
   WHERE s.group_id = ? ORDER BY s.date DESC`,
  [groupId]
);

// ---------- Auth ----------
export const registerUser = (name, email, hashedPassword) => {
  try {
    db.runSync(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );
    return { success: true };
  } catch (e) {
    return { success: false, error: 'That email is already registered.' };
  }
};

export const loginUser = (email, hashedPassword) => {
  const rows = db.getAllSync(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, hashedPassword]
  );
  return rows[0] || null;
};