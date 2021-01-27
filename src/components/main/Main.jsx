import React, { useState } from "react";
import { useStyles } from "./main.style";
import GenericTable from "../table/Table";
import ProductsPage from "../product/ProductPage";
import { Typography } from "@material-ui/core";
import CreateProduct from "../product/CreateProduct";

const Main = (props) => {
  const classes = useStyles();
  const { role, paymentProcessor, dai, account, provider } = props;
  const [isProductAdded, setProductAdded] = useState(false);
  const [loading, setLoading] = useState(true);

  return (
    <div className={classes.root}>
      {(() => {
        switch (role) {
          case "manager":
            return (
              <>
                <div className={classes.createProduct}>
                  <div className={classes.createProductContainer}>
                    <Typography variant="h5" className={classes.title}>
                      List of products
                    </Typography>
                    <CreateProduct
                      productAdded={setProductAdded}
                      account={account}
                      paymentProcessor={paymentProcessor}
                      dai={dai}
                      loading={loading}
                      setLoading={setLoading}
                      provider={provider}
                    />
                  </div>
                </div>

                {paymentProcessor && (
                  <ProductsPage
                    role={role}
                    productAdded={isProductAdded}
                    setProductAdded={setProductAdded}
                    paymentProcessor={paymentProcessor}
                    dai={dai}
                    loading={loading}
                    setLoading={setLoading}
                    account={account}
                    provider={provider}
                  />
                )}
              </>
            );
          case "funder":
            return (
              <>
                <div className={classes.createProductContainerFunder}>
                  <Typography
                    variant="h5"
                    className={classes.funderProductsTitle}
                  >
                    List of products
                  </Typography>
                </div>
                <ProductsPage
                  role={role}
                  productAdded={isProductAdded}
                  setProductAdded={setProductAdded}
                  paymentProcessor={paymentProcessor}
                  dai={dai}
                  loading={loading}
                  setLoading={setLoading}
                  account={account}
                  provider={provider}
                />
              </>
            );
          case "freelancer":
          case "evaluator":
            return (
              <GenericTable
                role={role}
                dai={dai}
                account={account}
                provider={provider}
                paymentProcessor={paymentProcessor}
              />
            );
        }
      })()}
    </div>
  );
};

export default Main;
