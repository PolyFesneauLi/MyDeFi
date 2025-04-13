// SPDX-License-Identifier: GPL-3.0
// Source code license: MIT...
pragma solidity >=0.4.16 <0.9.0; // Restrict Solidity compiler version
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";

contract KerwinToken {
    using SafeMath for uint256; // Enable SafeMath's sub() and add() methods for uint256

    string public name = "KerwinToken";
    string public symbol = "KWT";

    uint256 public decimals = 18; // 1 KerwinToken = 10**decimals (wei)
    uint256 public totalSupply;
    // Auto-generated getter methods

    // Contract owner address
    address public owner;

    // Mappings
    mapping(address => uint256) public balanceOf; // Tracks token balances
    mapping(address => mapping(address => uint256)) public allowance; // Tracks spending approvals

    // Events
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    event Mint(address indexed _to, uint256 _value);

    // Modifier to restrict function access to the owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender; // Set the deployer as the owner
        totalSupply = 1000000 * (10 ** decimals);
        // Assign total supply to the deployer's address
        balanceOf[msg.sender] = totalSupply;
    }

    // Mint new tokens and assign them to a specific address
    // Only the contract owner can call this function
    function mint(
        address _to,
        uint256 _amount
    ) public onlyOwner returns (bool success) {
        require(_to != address(0), "Cannot mint to zero address");
        require(_amount > 0, "Amount must be greater than zero");

        // Update balances and total supply
        totalSupply = totalSupply.add(_amount);
        balanceOf[_to] = balanceOf[_to].add(_amount);

        // Emit transfer event from address(0) (minting)
        emit Transfer(address(0), _to, _amount);
        emit Mint(_to, _amount);

        return true;
    }

    // Transfers tokens to another address
    function transfer(
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_to != address(0)); // Prevent burning tokens
        _transfer(msg.sender, _to, _value);
        return true;
    }

    // Internal transfer logic
    function _transfer(address _from, address _to, uint256 _value) internal {
        require(balanceOf[_from] >= _value); // Check sender's balance
        // Deduct from sender and add to receiver
        balanceOf[_from] = balanceOf[_from].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);

        // Emit event
        emit Transfer(_from, _to, _value);
    }

    // Approves a spender (e.g., an exchange) to spend tokens
    function approve(
        address _spender,
        uint256 _value
    ) public returns (bool success) {
        // msg.sender: Current logged-in account
        // _spender: Third-party exchange address
        // _value: Approved amount
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
        /*
            Example allowance structure:
            {
                "kerwin": {
                    "ExchangeA": 100,
                    "ExchangeB": 200
                },
                "xiaoming": {
                    "ExchangeA": 200,
                    "ExchangeB": 100
                }
            }
        */
    }

    // Called by an approved exchange to transfer tokens
    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        // _from: Token holder's address
        // _to: Recipient address
        // msg.sender: Exchange address
        require(balanceOf[_from] >= _value);
        require(allowance[_from][msg.sender] >= _value);

        allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
        _transfer(_from, _to, _value);
        return true;
    }
}
