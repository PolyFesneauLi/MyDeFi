const KerwinToken = artifacts.require("KerwinToken");
const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

contract("KerwinToken - Mint Function Tests", accounts => {
  const [owner, recipient, anotherAccount] = accounts;
  const mintAmount = new BN('1000000000000000000000'); // 1000 tokens with 18 decimals
  
  let token;

  beforeEach(async () => {
    // Deploy a new KerwinToken contract before each test
    token = await KerwinToken.new({ from: owner });
  });

  describe("Basic minting functionality", () => {
    it("should mint tokens to specified address", async () => {
      const initialTotalSupply = await token.totalSupply();
      const initialRecipientBalance = await token.balanceOf(recipient);

      // Mint tokens to recipient
      const receipt = await token.mint(recipient, mintAmount, { from: owner });
      
      // Check for expected events
      expectEvent(receipt, 'Transfer', {
        _from: constants.ZERO_ADDRESS,
        _to: recipient,
        _value: mintAmount
      });
      
      expectEvent(receipt, 'Mint', {
        _to: recipient,
        _value: mintAmount
      });
      
      // Check updated balances
      const finalTotalSupply = await token.totalSupply();
      const finalRecipientBalance = await token.balanceOf(recipient);
      
      expect(finalTotalSupply).to.be.bignumber.equal(initialTotalSupply.add(mintAmount));
      expect(finalRecipientBalance).to.be.bignumber.equal(initialRecipientBalance.add(mintAmount));
    });

    it("should only allow owner to mint tokens", async () => {
      // Try to mint tokens from non-owner account
      await expectRevert(
        token.mint(recipient, mintAmount, { from: anotherAccount }),
        "Only owner can perform this action"
      );
    });
    
    it("should revert when minting to zero address", async () => {
      await expectRevert(
        token.mint(constants.ZERO_ADDRESS, mintAmount, { from: owner }),
        "Cannot mint to zero address"
      );
    });
    
    it("should revert when minting zero tokens", async () => {
      await expectRevert(
        token.mint(recipient, new BN('0'), { from: owner }),
        "Amount must be greater than zero"
      );
    });
  });
  
  describe("Integration with existing token functionality", () => {
    it("minted tokens should be transferable", async () => {
      // Mint tokens to recipient
      await token.mint(recipient, mintAmount, { from: owner });
      
      // Transfer minted tokens to another account
      const transferAmount = new BN('500000000000000000000'); // 500 tokens
      const receipt = await token.transfer(anotherAccount, transferAmount, { from: recipient });
      
      expectEvent(receipt, 'Transfer', {
        _from: recipient,
        _to: anotherAccount,
        _value: transferAmount
      });
      
      // Check balances after transfer
      const recipientBalance = await token.balanceOf(recipient);
      const anotherAccountBalance = await token.balanceOf(anotherAccount);
      
      expect(recipientBalance).to.be.bignumber.equal(mintAmount.sub(transferAmount));
      expect(anotherAccountBalance).to.be.bignumber.equal(transferAmount);
    });
  });
}); 