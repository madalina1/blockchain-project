export const createData = (productId, title, description, domain, goal, manager, managerRating, hasSubscriber, devReward, applied) => ({
  productId,
  title,
  description,
  domain,
  goal,
  manager,
  managerRating,
  hasSubscriber,
  devReward,
  applied,
});

export const createRows = (products) => 
  products.map(({ productId, title, description, domain, goal, managerName, managerRating, hasSubscriber, devReward, applied }) => 
    createData(productId, title, description, domain, goal, managerName, managerRating, hasSubscriber, devReward, applied)
  );

export const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

export const getComparator = (order, orderBy) =>
  order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);

export const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  return stabilizedThis.map((el) => el[0]);
};

export const headCells = [
  {
    id: "title",
    numeric: false,
    disablePadding: true,
    label: "Title",
  },
  { id: "description", numeric: false, disablePadding: true, label: "Description" },
  { id: "domain", numeric: false, disablePadding: true, label: "Domain" },
  { id: "goal", numeric: true, disablePadding: true, label: "Goal (ETH)" },
  { id: "manager", numeric: false, disablePadding: true, label: "Manager" },
  { id: "managerRating", numeric: true, disablePadding: false, label: "Manager rating" },
  { id: "actions", numeric: false, disablePadding: false, label: "Actions" },
];
