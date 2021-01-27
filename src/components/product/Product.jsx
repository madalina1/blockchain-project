import React, { useState, useEffect } from "react";
import { useStyles } from "./product.style";
import Paper from "@material-ui/core/Paper";
import Chip from "@material-ui/core/Chip";
import { Typography } from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Button from "@material-ui/core/Button";
import Tooltip from "@material-ui/core/Tooltip";
import Rating from "@material-ui/lab/Rating";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { CURRENCY } from "./product.config";
import { ethers, Contract } from "ethers";
import * as ProductJSON from "../../build/Product.json";
import AccountBalanceIcon from "@material-ui/icons/AccountBalance";

const Status = {
  ongoing: "Ongoing",
  completed: "Completed",
};

const Product = (props) => {
  const classes = useStyles();
  const {
    title,
    role,
    description,
    goal,
    currentAmount,
    managerName,
    managerRating,
    domain,
    paymentProcessor,
    dai,
    productInstance,
    setLoading,
    managerId,
    index,
    account,
  } = props;

  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState(Status.ongoing);
  const [funderPayed, setFunderPayed] = useState(false);

  useEffect(() => {
    currentAmount === goal && setStatus(Status.completed);
    productInstance.checkIfFunderPayed(account.userAddress).then((payed) => {
      setFunderPayed(payed);
    });
    productInstance.getProductState().then((res) => {
      console.log(res);
    })
  }, [currentAmount]);

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const fundProject = async (amount) => {
    setLoading(true);
    const price = ethers.utils.parseEther(amount);

    const getDai = await dai.approve(productInstance.address, price);
    await getDai.wait();

    productInstance.contribute(price).then((res) => {
      setLoading(false);
    });
  };

  const handleProductFunding = () => {
    fundProject(amount);
  };

  const handleRemoveProduct = () => {
    console.log("removed");
  };

  const refund = async () => {
    let x;
    await productInstance.getAmountToRefund().then((res) => {
      x = ethers.utils.formatEther(res);
    });
    console.log("Manager address:", managerId);

    const getDai = await dai.approve(
      managerId,
      ethers.utils.parseEther(x)
    );
    await getDai.wait();

    productInstance
      .getRefund()
      .then((res) => {
        console.log(res);
      })
      .catch((error) => console.log(error));
  };

  const handleRefund = () => {
    refund();
  };

  return (
    <Paper elevation={3} className={classes.paper}>
      <div className={classes.header}>
        <div className={classes.headerTitle}>
          <Chip
            style={{
              backgroundColor:
                status === Status.ongoing ? "#0277bd" : "#4caf50",
            }}
            color="primary"
            label={status}
          />
          <Typography variant="h5" className={classes.title}>
            {title}
          </Typography>

          <Tooltip title="Domain">
            <div className={classes.domainTitle}>
              <span className={classes.dot}></span>
              <Typography variant="subtitle1" className={classes.domainName}>
                {domain}
              </Typography>
            </div>
          </Tooltip>
        </div>

        <Tooltip title="Associated manager">
          <div style={{ paddingTop: "6px" }}>
            <Typography
              component="legend"
              style={{ fontSize: "14px", textAlign: "right" }}
            >
              {managerName}
            </Typography>
            <Rating
              name="read-only"
              value={managerRating}
              className={classes.managerRating}
              readOnly
              max={10}
            />
          </div>
        </Tooltip>
      </div>

      <Typography variant="body1" className={classes.description}>
        {description}
      </Typography>

      <div style={{ display: "flex", alignItems: "center", marginTop: "24px" }}>
        <Typography variant="body1" className={classes.description}>
          Goal of
        </Typography>
        <Typography variant="body1" className={classes.goal}>
          {goal} {CURRENCY}
        </Typography>
        {status === Status.completed && (
          <Typography
            variant="body1"
            className={classes.description}
            style={{ marginLeft: "8px" }}
          >
            has been achieved!
          </Typography>
        )}
      </div>

      {status === Status.ongoing && (
        <>
          {role === "funder" && (
            <div className={classes.inputFund}>
              <TextField
                id="filled-number"
                label={`Amount (in ${CURRENCY})`}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={handleAmountChange}
              />

              <Button
                variant="contained"
                color="primary"
                style={{ backgroundColor: "#0277bd", marginLeft: "16px" }}
                onClick={handleProductFunding}
                disabled={
                  amount === "" ||
                  amount <= 0 ||
                  currentAmount + Number(amount) > goal
                }
              >
                Fund
              </Button>
            </div>
          )}

          <div
            style={{
              marginTop: "24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="body1" className={classes.description}>
                Current amount:
              </Typography>
              <Typography variant="body1" className={classes.goal}>
                {currentAmount} {CURRENCY}
              </Typography>
            </div>

            {role === "manager" && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRemoveProduct}
                startIcon={<DeleteOutlineIcon />}
              >
                Remove product
              </Button>
            )}
            {role === "funder" && funderPayed && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleRefund}
                startIcon={<AccountBalanceIcon />}
              >
                Refund
              </Button>
            )}
          </div>
        </>
      )}
    </Paper>
  );
};

export default Product;
