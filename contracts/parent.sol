pragma solidity 0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./helpers_interface.sol";
import "./registration_interface.sol";
import "./orders_interface.sol";


contract Foodiez {
    
    address ownerAddress;

    // FoodiezRegistration public _foodiezRegistration;
    // FoodiezHelpers public _foodiezHelpers;
    // FoodiezOrders public _foodiezOrders;
    
    FoodiezRegistrationInterface public _foodiezRegistration;
    FoodiezHelpersInterface public _foodiezHelpers;
    FoodiezOrdersInterface public _foodiezOrders;

    /*************Variables and Event Emitter***********************************************************/
    
    uint NetworkServiceFee = 2;
    uint DeliveryFlatFee = 2;

    event UserRegisteredEvent(string userName, bool isRegistered);
    event UserInfoEvent(string name, address usrAddress, string usrType, uint256 rating);
    event RestaurantRegistered(string restaurantName, address rAddress, bool isRegistered);
    event ItemAddedEvent(string restaurantId, string itemId, string itemName);
    event OrderPlaced(string orderId, uint total, string orderStatus);
    event OrderAssignedToDriver(string orderId, address driverAddress, string orderStatus);
    event OrderDeliveredToUser(string orderId, address driverAddress, string orderStatus);
    event orderDeliveryConfirmedEvent(uint restaurantTotal, uint deliveryTotal);
    
    event AccountApproved(address account, uint256 allowance);
    event AmountTransferedToAccount(address account, uint256 amount);
    event TransferedSenderToRecipient(address sender, address recipient, uint256 amount);
    
    /*************Token Setup *************************/
    IERC20 token;
    
    address payable owner;
    
    mapping (address => uint256) private _balances;

    mapping (address => mapping (address => uint256)) private _allowances;
    
    
    /************Constructor / Modifiers /  contract address setters*********************************************/
    constructor(FoodiezRegistrationInterface _registerAddress, FoodiezHelpersInterface _helperAddress, FoodiezOrdersInterface _orderAddress, address _token) {
        ownerAddress = msg.sender;
        _foodiezHelpers = _helperAddress;
        _foodiezRegistration = _registerAddress;
        _foodiezOrders = _orderAddress;
        
        _foodiezRegistration.setParentContract(address(this));
        _foodiezOrders.setParentContract(address(this));
        
        owner = payable(msg.sender); // Token deploy address;
        token = IERC20(_token);
    }

    modifier OnlyOwner(){
        require(msg.sender == ownerAddress, "Foodiez Registration - Only Owner can call this function");
        _; // this underscore is requierd otherwise compiler will break;
    }

    modifier isDeliveryCheck(){
        require( _foodiezRegistration.checkUserDelivery(msg.sender) == true, "User is not a Delivery agent. Only Delivery agents can be assigned food order.");
        _;
    }
    
    modifier isUserCheck(){
        require( _foodiezRegistration.checkUserDelivery(msg.sender) == false, "User is a Delivery agent. Only customers can access this.");
        _;
    }

    /*************Token Functions******************************************/
    
    function tokenApproveAccount(address _address, uint256 amount) public payable returns (bool){
        
        bool isApproved = token.approve(_address, amount);
        if(isApproved) emit AccountApproved(_address, amount);
        return isApproved;
    }
    
    function allowance(address own, address spender) public view returns (uint256){
        return token.allowance(own, spender);
    }
    
    function getTokenBalanceOf(address _address) public view returns (uint256){
        return token.balanceOf(_address);
    }
    
    function tokenTransfer(address recipient, uint256 amount) public payable {
        bool tokenTransfered = token.transfer(recipient, amount);
        if(tokenTransfered) emit AmountTransferedToAccount(recipient, amount);
    }
    
    function tokenTransferFrom(address sender, address recipient, uint256 amount) public payable {
        
        bool tokenTransfered = token.transferFrom(sender, recipient, amount);
        
        
        if(tokenTransfered) emit TransferedSenderToRecipient(sender, recipient, amount);
    }
    
    /*****************Registration of User ( customer and delivery ) and Restaurant *********************/
    function userRegister(string memory name, uint uType, uint256 amountStake) public payable returns(bool isSuccess){
        if(uType == 1) { 
            require(msg.value >= 10 ether, "Delivery Agent must stake minimum 10 ether"); 
        }
        
        // bool success = tokenApproveAccount(msg.sender, amountStake ); // approval of account to be done directly at tokenContract
        if(amountStake > 0){
            require(msg.value >= amountStake, "Ether must match tokenStake");
            tokenTransferFrom(owner, msg.sender, amountStake);
        }
        
        bool isRegistered = _foodiezRegistration.userRegistration(msg.sender, name, uType); // setup token here
        emit UserRegisteredEvent( name, isRegistered);
        return isRegistered;
    }
    
    function getUserInfo(address _address) public view returns (string memory usrName, address usrAddress, string memory usrType, uint256 rating){
        
        return _foodiezRegistration.getUserInfo(_address);
        
    }
    
    function registerRestaurant(string memory _name, string memory _rId, uint256 amountStake) public payable{
        
        bool isRegistered = _foodiezRegistration.createRestaurant(msg.sender, _name, _rId);
        emit RestaurantRegistered(_name, msg.sender, isRegistered);
        
        //token register and purchase
        require(msg.value >= 0, "Restaurant must stake more than 0 ether");
        // bool success = tokenApproveAccount(msg.sender, amountStake);
        tokenTransferFrom(owner, msg.sender, amountStake);
    }
    
    function addMenuItems(string memory _itemName, uint _type, uint _price) public {
        (string memory rId, string memory uniqueId, string memory itemName) = _foodiezRegistration.addMenuItems(msg.sender, _itemName, _type, _price);
        
        emit ItemAddedEvent(rId, uniqueId, itemName);
    }
    
    function getRestaurantMenu(address _restaurantAddress, uint _itemNumber) public view returns(string memory itemName, string memory itemType, uint256 itemPrice){
        return _foodiezRegistration.getRestaurantMenu(_restaurantAddress, _itemNumber);
    } 
    
    function getrestaurantInfo(address _restaurantAddress) public view returns(string memory rId, address rAddress, uint256 rItems, uint256 rating){
        return _foodiezRegistration.getrestaurantInfo(_restaurantAddress);
    }
    
    /************Foodiez Orders Vars and Functions**********************/
    function placeOrder(address _restaurantAddress, uint _itemNum, uint tokenPay) public payable returns (string memory uOrderId, string memory orderItemName, uint256 orderTotal, string memory orderStatus){
        
        (string memory rId, address restaurantAddress, string memory itemName, uint totalPrice) = _foodiezRegistration.getOrderTotal(msg.sender, _restaurantAddress, _itemNum);
        
        //check for required ether 
        require(msg.value >= totalPrice || weiConverter(tokenPay) >= totalPrice , "Not enough monies to cover order amount.");
        (string memory uniqueId, string memory oItemName, uint256 total, string memory status) = _foodiezRegistration.createFoodOrder(rId, msg.sender, restaurantAddress, itemName, totalPrice);
        
        
        if(tokenPay > 0) {
            _foodiezOrders.setTokenPayOrder(uniqueId, tokenPay);
            // transfer(address(this), tokenPay);
        }
        
        emit OrderPlaced(uniqueId, total, status);
        return (uniqueId, oItemName, total, status);
    }
    
    function getOrderStatus(string memory userOrderId) public view returns (string memory orderId, address userAddress, address driverAddress, string memory items, uint256 total, string memory status){
        return _foodiezOrders.getUserOrderStatus(userOrderId);
    }
    
    function assignToDriver(string memory userOrderId) public isDeliveryCheck {
        
        (address driverAddress, string memory status) = _foodiezOrders.assignOrderToDriver(msg.sender, userOrderId);
        emit OrderAssignedToDriver(userOrderId,driverAddress, status);
    }
    
    function driverDelieveredOrder(string memory userOrderId) public isDeliveryCheck {
        
        (address driverAddress, string memory status) = _foodiezOrders.driverDelieveredOrder(msg.sender, userOrderId);
        emit OrderDeliveredToUser(userOrderId,driverAddress, status);
    }
    
    function orderDeliveryConfirmed(string memory userOrderId, uint _restaurantRating, uint _deliveryRating, uint tokenTip ) public isUserCheck payable{
         
         (address restaurantAddress, address deliveryAddress, address userAddress, uint total ) = _foodiezOrders.orderDeliveryConfirmed(userOrderId);
        
        //ratings for restaurant and drivers
        _foodiezRegistration.addRestaurantRating(restaurantAddress, _restaurantRating);
        
        _foodiezRegistration.addDriverRating(deliveryAddress, _deliveryRating);
         
        // payment 
        require(getTokenBalanceOf(msg.sender) >= tokenTip, "Not Enough tokens to tip.");
        
        uint256 tokenPay = _foodiezOrders.getTokenPayOrder(userOrderId);
        
         uint finalOrderTotal = total;
        // take out service fee from total
        uint serviceFee = _foodiezHelpers.calcServiceFee(total, NetworkServiceFee);
        finalOrderTotal -= serviceFee;
            
        // driver fee + any tips go to 
        uint driverTotal = _foodiezHelpers.calcDriverFlatFee(total, DeliveryFlatFee); 
        finalOrderTotal -= driverTotal; 
        
        
        driverTotal += msg.value;
        
        // transfer driver money
        payable(deliveryAddress).transfer(driverTotal);
        if(tokenTip > 0) {
            token.transferFrom(userAddress, deliveryAddress, tokenTip);
        }
        
        // transfer rest money
        if(tokenPay > 0){
            token.transferFrom(userAddress, restaurantAddress, tokenPay);
        }else {
            payable(restaurantAddress).transfer(finalOrderTotal);   
        }
        
        emit orderDeliveryConfirmedEvent(finalOrderTotal, driverTotal);
    }

    
    function weiConverter(uint256 tokenPay) internal pure returns(uint){
        return tokenPay * 10**18;
    }
}