const KerwinToken = artifacts.require("KerwinToken");

module.exports = function(deployer, network, accounts) {
  // Deploy the KerwinToken contract
  deployer.deploy(KerwinToken, { from: accounts[0] });
}; 