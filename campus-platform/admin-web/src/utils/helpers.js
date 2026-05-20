export const formatCurrency = (amount) => {
  return `₹${amount}`;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

export const getStatusColor = (status) => {
  switch (status) {
    case "Active":
      return "#22c55e";

    case "Pending":
      return "#f59e0b";

    case "Blocked":
      return "#ef4444";

    default:
      return "#64748b";
  }
};

export const cloneRecord = (record) => {
  return JSON.parse(JSON.stringify(record));
};

export const makeId = () => {
  return Math.random().toString(36).substring(7);
};