import React, { useState, useEffect } from "react";
import Product from "./Product";
import { Typography } from "@material-ui/core";
import * as ProductJSON from "../../build/Product.json";
import { ethers, Contract } from "ethers";
import CircularProgress from "@material-ui/core/CircularProgress";

const ProductsPage = (props) => {
  const {
    paymentProcessor,
    dai,
    productAdded,
    setProductAdded,
    loading,
    setLoading,
    account,
    provider,
  } = props;
  const [products, setProducts] = useState([]);
  const [productInstance, setProductInstance] = useState();

  const getProducts = async () => {
    setProductAdded(false);

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

          setProductInstance(instance);

          instance.getDetails().then((productData) => {
            paymentProcessor
              .getUserBasedOnAddress(productData.managerAddress)
              .then((manager) => {
                const addProduct = {
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
                };

                setProducts((prevProduct) => [...prevProduct, addProduct]);
              });
          });
        });
      })
      .catch(() => setLoading(false));
  };

  const init = async () => {
    await getProducts();
  };

  useEffect(() => {
    setProducts([]);
    productAdded && init();
  }, [productAdded]);

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
    return () => setProducts([]);
  }, []);

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
  ) : products.length === 0 ? (
    <Typography
      variant="subtitle1"
      style={{ display: "flex", justifyContent: "center", color: "#616161" }}
    >
      No products available
    </Typography>
  ) : (
    products.map((product, index) => (
      <div
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "center",
        }}
        key={index}
      >
        <Product
          key={`${product.id}-${index}`}
          role={props.role}
          paymentProcessor={paymentProcessor}
          dai={dai}
          productInstance={productInstance}
          index={index}
          setLoading={setLoading}
          account={account}
          {...product}
        />
      </div>
    ))
  );
};

export default ProductsPage;
