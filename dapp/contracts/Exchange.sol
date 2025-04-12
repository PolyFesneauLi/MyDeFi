// SPDX-License-Identifier: GPL-3.0
// Source code follows the MIT license...
pragma solidity >=0.4.16 <0.9.0; // Solidity compiler version restriction
import "openzeppelin-solidity/contracts/utils/math/SafeMath.sol";
import "./KerwinToken.sol";

contract Exchange {
    using SafeMath for uint256; // To enable sub() and add() methods for uint256

    // Fee account address
    address public feeAccount;
    uint256 public feePercent; // Fee rate
    address constant ETHER = address(0);
    mapping(address => mapping(address => uint256)) public tokens;

    // Order struct
    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    // _Order[] orderlist;

    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancel;
    mapping(uint256 => bool) public orderFill;
    uint256 public orderCount;

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );
    // Order creation event
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    // Order cancellation event
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    // Order fill event
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

    // Deposit Ether
    function depositEther() public payable {
        // tokens[ETHER] is mapping address(0) => uint256 which is the balance of ETHER for each user  
        // first record
        // msg is the current transaction, msg.value is the amount of ether sent with the transaction
        // msg is gotten from where?
        /*
        When a user interacts with the contract (e.g., via MetaMask, web3.js, ethers.js, or a dApp frontend)
        Example (web3.js):
        await contract.methods.depositEther().send({
            from: "0xUserAddress",
            value: web3.utils.toWei("1", "ether") // Sends 1 ETH
        }); 
        */
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);   // tokens[ETHER] is mapping address(0) => uint256 which is the balance of ETHER for each user
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);  
    }

    // Deposit other tokens
    function depositToken(address _token, uint256 _amount) public {
        require(_token != ETHER);  // if false, revert the transaction
        // why we need this require compared to the Ether case?
        // since we are not using msg.value, we need to make sure the transfer is successful
        // so without transferfrom, how does Ether work?
        // Ether is sent with the transaction, so we don't need to call transferFrom
        // but for other tokens, we need to call transferFrom to transfer the tokens from the user to the contract
        require(
            KerwinToken(_token).transferFrom(msg.sender, address(this), _amount)
        );
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Withdraw Ether
    function withdrawEther(uint256 _amount) public {
        require(tokens[ETHER][msg.sender] >= _amount);
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        //payable is method from file "openzeppelin-solidity/contracts/utils/Address.sol"
        payable(msg.sender).transfer(_amount);
        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    // Withdraw other tokens
    function withdrawToken(address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);

        //
        require(KerwinToken(_token).transfer(msg.sender, _amount));

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    // Check balance
    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    // Make order
    function makeOrder(address _tokenGet,
        uint256 _amountGet,
        address _tokenGive,
        uint256 _amountGive) public{

        require(balanceOf(_tokenGive,msg.sender)>=_amountGive,"Insufficient balance when creating order");

        orderCount = orderCount.add(1);
        // struct _Order
        // orderCount user tokenGet amountGet tokenGive amountGive timestamp
        orders[orderCount] = _Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);

        // Emit order event
        emit Order(orderCount,msg.sender,_tokenGet,_amountGet,_tokenGive,_amountGive,block.timestamp);
    }

    // Cancel order
    function cancelOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        orderCancel[_id] = true;   
        //**Question:why we need orderCancel[_id] ? 
        //no initialization and no use in the code

        emit Cancel(myorder.id,msg.sender,myorder.tokenGet,myorder.amountGet,myorder.tokenGive,myorder.amountGive,block.timestamp);
    }

    // Fill order
    function fillOrder(uint256 _id) public {
        _Order memory myorder = orders[_id];
        require(myorder.id == _id);
        
        // Account balance exchange && fee collection
        /*
            xiaoming makes an order,
            100 KWT ==> 1 ether
            xiaoming loses 1 ether
            xiaoming gets 100 KWT

            msg.sender fills the order
            msg.sender gets 1 ether
            msg.sender loses 100 KWT
        */
        uint256 feeAmount = myorder.amountGet.mul(feePercent).div(100);

        require(balanceOf(myorder.tokenGive,myorder.user)>=myorder.amountGive,"Insufficient balance of the order creator");

        // require(balanceOf(myorder.tokenGet,msg.sender)>=myorder.amountGet.add(feeAmount),"Insufficient balance of the order filler");
        //**Question: why >=?
        //our receiver haven't get currency yet, how to pay the fee?
        tokens[myorder.tokenGive][msg.sender] = tokens[myorder.tokenGive][msg.sender].add(myorder.amountGive);
        tokens[myorder.tokenGive][myorder.user] = tokens[myorder.tokenGive][myorder.user].sub(myorder.amountGive);

        tokens[myorder.tokenGet][msg.sender] = tokens[myorder.tokenGet][msg.sender].sub(myorder.amountGet.add(feeAmount));
        tokens[myorder.tokenGet][feeAccount] = tokens[myorder.tokenGet][feeAccount].add(feeAmount);
        tokens[myorder.tokenGet][myorder.user] = tokens[myorder.tokenGet][myorder.user].add(myorder.amountGet);

        orderFill[_id] = true;
        //**Question: no initialization and no use in the code
        emit Trade(myorder.id,myorder.user,myorder.tokenGet,myorder.amountGet,myorder.tokenGive,myorder.amountGive,block.timestamp);
    }
}