import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContentText from "@material-ui/core/DialogContentText";
import { ethers } from "ethers";

const initialState = {
  amount: "",
};

const ApplyProject = (props) => {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const { devReward, paymentProcessor, productId, address } = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setState(initialState);
  };

  const handleApplyProject = (productId) => {
    const amount = state.amount;
    
    paymentProcessor
      .applyProduct(
        ethers.utils.getAddress(productId),
        ethers.utils.parseEther(amount)
      )
      .then((res) => {
        setOpen(false);
        setState(initialState);
      });
  };

  const handleOnChange = (event) => {
    const { id, value } = event.target;

    event.persist();
    setState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  return (
    <>
      <Button variant="outlined" color="secondary" onClick={handleClickOpen}>
        Apply project
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        aria-labelledby="form-dialog-title"
        variant="outlined"
        fullWidth
      >
        <DialogTitle
          id="form-dialog-title"
          style={{ padding: "24px 48px !important" }}
        >
          Apply for this project:
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {`To apply for this project, please enter how much of the allocated
            development (${devReward} ETH) you are willing to work.`}
          </DialogContentText>
          <TextField
            id="amount"
            label="Amount"
            type="numeric"
            onChange={handleOnChange}
            value={state.amount}
          />
        </DialogContent>
        <DialogActions style={{ padding: "24px 48px !important" }}>
          <Button
            onClick={handleClose}
            color="primary"
            style={{ color: "#757575" }}
          >
            Cancel
          </Button>
          <Button
            autoFocus
            onClick={() => handleApplyProject(productId)}
            color="primary"
            style={{ color: "#0277bd" }}
            disabled={Object.values(state).every((x) => x === 0 || x === "")}
          >
            Apply project
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplyProject;
