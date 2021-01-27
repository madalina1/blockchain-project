const Dai = artifacts.require("Dai.sol");
const PaymentProcessor = artifacts.require("PaymentProcessor.sol");

module.exports = async function(deployer, network, accounts) {
  if (network === "develop") {
    await deployer.deploy(Dai);
    const token = await Dai.deployed();
    await token.faucet(accounts[1], web3.utils.toWei("10000"));
    await token.faucet(accounts[2], web3.utils.toWei("10000"));

    await deployer.deploy(PaymentProcessor, accounts[0], token.address, "Jane Paterson");
    const paymentProcessor = await PaymentProcessor.deployed();
    
    await paymentProcessor.addFunder(accounts[1], "John Doe");
    await paymentProcessor.addFunder(accounts[2], "John Smith");
    await paymentProcessor.addFreelancer(accounts[3], "John Dev", "Web");
    await paymentProcessor.addFreelancer(accounts[4], "John Dev 2", "Blockchain");
    await paymentProcessor.addEvaluator(accounts[5], "Matt Doe", "Web");
    
  } else {
    const ADMIN_ADDRESS = "";
    const TOKEN_ADDRESS = "";
    await deployer.deploy(PaymentProcessor, ADMIN_ADDRESS, TOKEN_ADDRESS);
  }
};
