import React, { useState, useEffect } from "react";
import { useStyles } from "./table.style";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Checkbox from "@material-ui/core/Checkbox";
import GenericTableToolbar from "./TableToolbar";
import GenericTableHead from "./TableHead";
import {
  rows,
  stableSort,
  getComparator,
  headCells,
  createRows,
} from "./table.config";
import * as ProductJSON from "../../build/Product.json";
import { ethers, Contract } from "ethers";
import CircularProgress from "@material-ui/core/CircularProgress";
import Rating from "@material-ui/lab/Rating";
import ApplyProject from "./ApplyProject";
import Button from "@material-ui/core/Button";
import { Typography } from "@material-ui/core";
import Snackbar from "@material-ui/core/Snackbar";
import Alert from "@material-ui/lab/Alert";

const GenericTable = (props) => {
  const classes = useStyles();
  const { role, dai, account, paymentProcessor, provider } = props;

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("calories");
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [completedProducts, setCompletedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const handleRequestSort = (_event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = createRows(completedProducts).map((n) => n.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleChangePage = (_event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    rowsPerPage -
    Math.min(
      rowsPerPage,
      createRows(completedProducts).length - page * rowsPerPage
    );

  const checkSubscriber = async (productAddress) => {
    return await paymentProcessor.checkIfHasSubscriber(
      productAddress
    );
  };

  const checkIfFreelancerApplied = async (productAddress) => {
    return await paymentProcessor.checkIfFreelancerApplied(
      productAddress
    );
  };

  const getCompletedProducts = async () => {
    return await paymentProcessor
      .returnAllProducts()
      .then((products) => {
        setLoading(false);

        products.forEach((productAddress, index) => {
          const instance = new Contract(
            productAddress,
            ProductJSON.abi,
            new ethers.providers.Web3Provider(window.ethereum).getSigner()
          );

          instance.getProductState().then((state) => {
            if (state === 2) {
              instance.getDetails().then((productData) => {
                paymentProcessor
                  .getUserBasedOnAddress(productData.managerAddress)
                  .then((manager) => {
                    let addProduct = {
                      id: index,
                      managerId: productData.managerAddress,
                      title: productData.productTitle,
                      description: productData.productDescription,
                      goal: ethers.utils.formatEther(productData.goalAmount),
                      currentAmount: ethers.utils.formatEther(
                        productData.currentAmount
                      ),
                      domain: productData.productDomain,
                      managerName: manager.name,
                      managerRating: manager.rating.toNumber(),
                      devReward: ethers.utils.formatEther(
                        productData.productDevReward
                      ),
                      evaluatorReward: ethers.utils.formatEther(
                        productData.productEvaluatorReward
                      ),
                      productId: productData.productAddress,
                    };

                    if(role === "evaluator"){
                      checkSubscriber(productData.productAddress).then((subscriber) => {
                        addProduct = { ...addProduct, hasSubscriber: subscriber };
                        setCompletedProducts((prevProduct) => [
                          ...prevProduct,
                          addProduct,
                        ]);
                      });
                    } else if (role === "freelancer") {
                      checkIfFreelancerApplied(productData.productAddress).then((applied) => {
                        addProduct = { ...addProduct, applied };
                        setCompletedProducts((prevProduct) => [
                          ...prevProduct,
                          addProduct,
                        ]);
                      });
                    }                      
                  });
              });
            }
          });
        });
      })
      .catch(() => setLoading(false));
  };

  const init = async () => {
    await getCompletedProducts();
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    return () => setCompletedProducts([]);
  }, []);


  const handleEvaluatorSubscribe = (productId) => {
    setLoading(true);
    paymentProcessor
      .addSubscriber(ethers.utils.getAddress(productId))
      .then((res) => {
        paymentProcessor.checkIfHasSubscriber(productId).then((subscriber) => {
          setLoading(false);
          if (subscriber) {
            setOpenSnackbar(true);
          }
        });
      });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnackbar(false);
  };

  return loading ? (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress style={{ color: "#0277bd" }} />
    </div>
  ) : completedProducts.length === 0 ? (
    <div>No products</div>
  ) : (
    <>
      <Paper className={classes.paper}>
        <GenericTableToolbar numSelected={selected.length} />
        <TableContainer className={classes.tableContainer}>
          <Table
            className={classes.table}
            aria-labelledby="tableTitle"
            size="medium"
            aria-label="enhanced table"
          >
            <GenericTableHead
              classes={classes}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={createRows(completedProducts).length}
              headCells={headCells}
            />
            <TableBody>
              {stableSort(
                createRows(completedProducts),
                getComparator(order, orderBy)
              )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow hover key={row.productId}>
                      <TableCell
                        component="th"
                        id={labelId}
                        scope="row"
                        padding="none"
                      >
                        {row.title}
                      </TableCell>
                      <TableCell align="right">{row.description}</TableCell>
                      <TableCell align="right">{row.domain}</TableCell>
                      <TableCell align="right">{row.goal}</TableCell>
                      <TableCell align="right">{row.manager}</TableCell>
                      <TableCell align="right">
                        <Rating
                          name="read-only"
                          value={row.managerRating}
                          className={classes.managerRating}
                          readOnly
                          max={10}
                        />
                      </TableCell>
                      <TableCell align="right" style={{ height: "32px" }}>
                        {role === "freelancer" && !row.applied && (
                          <ApplyProject
                            devReward={row.devReward}
                            paymentProcessor={paymentProcessor}
                            productId={row.productId}
                            address={account.userAddress}
                          />
                        )}
                        {role === "freelancer" && row.applied && (
                          <Typography variant="body1">Applied for this project</Typography>
                        )}
                        {role === "evaluator" && !row.hasSubscriber && (
                          <Button
                            variant="outlined"
                            color="secondary"
                            onClick={() =>
                              handleEvaluatorSubscribe(row.productId)
                            }
                          >
                            Subscribe
                          </Button>
                        )}
                        {role === "evaluator" && row.hasSubscriber && (
                          <Typography variant="body1">Subscribed</Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[]}
          component="div"
          count={createRows(completedProducts).length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </Paper>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          You successfully subscribed to this project.
        </Alert>
      </Snackbar>
    </>
  );
};

export default GenericTable;
