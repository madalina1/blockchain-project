import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./navbar/Navbar";
import Main from "./main/Main";
import getBlockchain from "./blockchainConfig";
import CircularProgress from "@material-ui/core/CircularProgress";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    height: '90%',
    justifyContent: 'center',
    alignItems: 'center'
  },
}));

export const App = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);

  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [account, setAccount] = useState(null);

  const [paymentProcessor, setPaymentProcessor] = useState(undefined);
  const [dai, setDai] = useState(undefined);
  const [provider, setProvider] = useState(undefined);

  useEffect(() => {
    const init = async () => {
      const { paymentProcessor, dai, provider } = await getBlockchain();

      setPaymentProcessor(paymentProcessor);
      setDai(dai);
      setProvider(provider);

      const currentAccount = await paymentProcessor.getCurrentPerson();
      setAccount(currentAccount);
      setRole(currentAccount.roleName);
      setUserName(currentAccount.name);
      setLoading(false);

    };

    init();
  }, []);

  if (typeof window.ethereum === "undefined") {
    return <div>You need to install the latest version of Metamask!</div>;
  }

  return (
    <div style={{ height: '100%' }}>
      <Navbar account={account} userName={userName} role={role} />

      {loading ? (
        <div className={classes.root}>
          <CircularProgress style={{ color: '#0277bd' }} />
        </div>
      ) : (
        <Main
          account={account}
          role={role}
          paymentProcessor={paymentProcessor}
          dai={dai}
          provider={provider}
        />
      )}
    </div>
  );
};

export default App;
