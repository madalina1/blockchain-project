import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import AddIcon from "@material-ui/icons/Add";
import { useStyles } from "./product.style";
import { CURRENCY } from "./product.config";
import { ethers, wait } from "ethers";

const initialState = {
  title: "",
  domain: "",
  devReward: "",
  evaluatorReward: "",
  description: "",
};

const CreateProduct = (props) => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [state, setState] = useState(initialState);
  const { paymentProcessor, dai, account, productAdded, loading, setLoading, provider } = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setState(initialState);
  };

  const startProduct = async () => {
    const { title, description, domain, devReward, evaluatorReward } = state;
    setLoading(true);
    await paymentProcessor
      .startProduct(
        title,
        description,
        domain,
        ethers.utils.parseEther(devReward),
        ethers.utils.parseEther(evaluatorReward),
      )
      .then(() => {
        setLoading(true);
        setTimeout(() => {
          productAdded(true);
          setLoading(false);
        }, 4000);
      });  
  };

  const handleCreateProduct = () => {
    setOpen(false);
    setState(initialState);
    startProduct();
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
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        style={{ backgroundColor: "#0277bd" }}
        onClick={handleClickOpen}
      >
        Create new product
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        aria-labelledby="form-dialog-title"
        variant="outlined"
        fullWidth
      >
        <DialogTitle id="form-dialog-title" className={classes.dialogTitle}>
          Create a new product
        </DialogTitle>
        <DialogContent>
          <form noValidate autoComplete="off" className={classes.form}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                id="title"
                label="Title"
                className={classes.formMargin}
                onChange={handleOnChange}
                value={state.title}
              />
              <TextField
                id="domain"
                label="Domain expertise"
                className={classes.formMargin}
                onChange={handleOnChange}
                value={state.domain}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <TextField
                id="devReward"
                label={`Development reward (${CURRENCY})`}
                type="number"
                className={classes.formMargin}
                onChange={handleOnChange}
                value={state.devReward}
              />
              <TextField
                id="evaluatorReward"
                label={`Evaluator reward (${CURRENCY})`}
                type="number"
                className={classes.formMargin}
                onChange={handleOnChange}
                value={state.evaluatorReward}
              />
            </div>
            <TextField
              id="description"
              label="Description"
              multiline
              rows={4}
              variant="outlined"
              className={classes.descriptionStyle}
              onChange={handleOnChange}
              value={state.description}
            />
          </form>
        </DialogContent>
        <DialogActions className={classes.dialogActions}>
          <Button
            onClick={handleClose}
            color="primary"
            style={{ color: "#757575" }}
          >
            Cancel
          </Button>
          <Button
            autoFocus
            onClick={handleCreateProduct}
            color="primary"
            style={{ color: "#0277bd" }}
            disabled={Object.values(state).every((x) => x === 0 || x === "")}
          >
            Create product
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CreateProduct;
