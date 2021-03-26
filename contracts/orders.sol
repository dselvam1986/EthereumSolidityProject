pragma solidity 0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

contract FoodiezOrders {
    
    /************************ Unique Address to be used for Customer, Restaurant and Delivery Driver******************/
    address public parentContractAddress;
    address public registerContractAddress;
    bool isParentContractSet = false;
    bool isRegisterContract = false;
    
    function setParentContract(address _address) public returns(string memory) {
        require(isParentContractSet == false,"Foodiez Orders - Parent already set. Cannot be Changed");
        parentContractAddress = _address;
        isParentContractSet = true;
        
        return("Foodiez Orders parent contract address set.");
    }
    
    function setRegisterContract(address _address) public returns(string memory) {
        require(isRegisterContract == false,"Foodiez Orders - Register already set. Cannot be Changed");
        registerContractAddress = _address;
        isRegisterContract = true;
        
        return("Foodiez Orders register contract address set.");
    }
    
    modifier OnlyParent(){
        require(msg.sender == parentContractAddress || msg.sender == registerContractAddress, "Only Owner can call this function");
        _; // this underscore is requierd otherwise compiler will break;
    }
     
     //Account creation all users will have default 0 tokens. 
     // Customer will earn token by making puchases
     //Drivers will earn tokens in the form of tips ( from customers ) or by refering new drivers
     
     enum OrderStatus {Ordered, InTransit, Delivered, Completed}
     
     struct Order{
         string orderId;
         string restaurantId;
         address restaurantAddress;
         address userAddress;
         address driverAddress;
         string items;
         uint total;
         OrderStatus status;
     }
     
     mapping(string => Order) UserOrders; // unique user order id to order.
     mapping(address => Order) DriverOrderAssignment; // order assigned to driver. 
     mapping(string => uint256) OrderIdTokenPay;
     
     uint256 orderTotalCount = 0;
     
     uint NetworkServiceFee = 2;
     uint DriverFlatFee = 2;
     
     
     /*******Events *************/
     event OrderAssignedToDriver(uint value, address sender);
     event OrderDeliveredToCustomer(bytes data, address sender);
     
    /**************************User Food Orders***************************************************************************************************************************************/
    function createFoodOrderEntry( string memory _uniqueOrderId, string memory _rId, address _restaurantAddress, address _userAddress, string memory _itemName, uint _total) 
    public payable OnlyParent returns(string memory, string memory, uint256, string memory) {
        
        Order memory order = Order(_uniqueOrderId, _rId, _restaurantAddress, _userAddress,address(0x0), _itemName, _total, OrderStatus(0));
        UserOrders[_uniqueOrderId] = order;
        
        return( _uniqueOrderId, _itemName, _total, getOrderStatusFriendly(uint8(order.status)) );
        
    }
    
    function getUserOrderStatus(string memory userOrderId) public view OnlyParent returns(string memory, address, address, string memory, uint256, string memory){
        Order memory order = UserOrders[userOrderId];
        
        return (order.orderId, order.userAddress, order.driverAddress, order.items, order.total, getOrderStatusFriendly(uint8(order.status)));
    }
     
     
     /**************************Food Orders assignment and delivery*******************************************************************/
    function assignOrderToDriver(address _deliveryAddress, string memory userOrderId) public OnlyParent returns (address, string memory){
         //check user order to see if driverAddress is set already
         Order memory order = UserOrders[userOrderId];
         require(order.driverAddress == address(0x0), "Order is already assigned");
         
         order.driverAddress = _deliveryAddress;
         order.status = OrderStatus(1);
         UserOrders[userOrderId] = order;
         DriverOrderAssignment[_deliveryAddress] = order;
         // stake token so that driver cant cheat the customer
         
         return(order.driverAddress, getOrderStatusFriendly(uint8(order.status)) );
         
    }
     
    function driverDelieveredOrder(address _deliveryAddress, string memory userOrderId) public OnlyParent returns (address, string memory){

         Order memory order = UserOrders[userOrderId];
         order.status = OrderStatus(2);
         UserOrders[userOrderId] = order;
         
         DriverOrderAssignment[_deliveryAddress] = order;
         
         return(order.driverAddress, getOrderStatusFriendly(uint8(order.status)) );
    }
     
    function orderDeliveryConfirmed(string memory userOrderId ) public  OnlyParent returns (address, address, address, uint ){
        Order memory order = UserOrders[userOrderId];
        order.status = OrderStatus(3);
        UserOrders[userOrderId] = order;
        
    
    return (payable(order.restaurantAddress), payable(order.driverAddress), payable(order.userAddress), order.total );
    
    //  orderPayments(order.total , payable(order.restaurantAddress), payable(order.driverAddress), msg.value, order.restaurantId, _restaurantRating);
    }
     
    /*************************************Order Helpers ************************************************************************/
    function getOrderStatusFriendly(uint8 _orderStatus) internal pure returns (string memory status) {
        
        if(OrderStatus.Ordered == OrderStatus(_orderStatus) ) return "Ordered";
        if(OrderStatus.InTransit == OrderStatus(_orderStatus) ) return "InTransit";
        if(OrderStatus.Delivered == OrderStatus(_orderStatus) ) return "Delivered";
        if(OrderStatus.Completed == OrderStatus(_orderStatus) ) return "Completed";
    }
    
    function setTokenPayOrder(string memory _uniqueOrderId, uint256 tokenPay) public OnlyParent {
        OrderIdTokenPay[_uniqueOrderId] = tokenPay;
    }
    
    function getTokenPayOrder(string memory _uniqueOrderId) public view OnlyParent returns(uint256){
        uint256 tokenPay = OrderIdTokenPay[_uniqueOrderId];
        return tokenPay;
    }
    
}