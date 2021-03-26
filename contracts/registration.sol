pragma solidity 0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

import "./helpers_interface.sol";
import "./orders_interface.sol";


contract FoodiezRegistration {
    
    // FoodiezHelpers public _foodiezHelpers;
    // FoodiezOrders public _foodiezOrders;
    FoodiezHelpersInterface public _foodiezHelpers;
    FoodiezOrdersInterface public _foodiezOrders;

    address ownerAddress;

    address public parentContractAddress;
    bool isParentContractSet = false;
    
    constructor(FoodiezHelpersInterface _helperAddress, FoodiezOrdersInterface _orderAddress) {
        ownerAddress = msg.sender;
        _foodiezHelpers = _helperAddress;
        _foodiezOrders = _orderAddress;
        
        _foodiezOrders.setRegisterContract(address(this));
    }
    
    
    /************User and mapping**********************/
    enum UserType { Customer, Delivery } // 0 , 1
    struct User {
        string name;
        address userID;
        UserType usrType;
        uint rating;
        uint256 tokens;
        bool isRegistered;
    }
     
    // address to registered user mapping.
    mapping(address => User) registeredUserMapping;
    address[] RegisteredUserAddresses;
    
    /************Restaurant and mapping**********************/
    struct Restaurant {
        address restaurantAddress;
        string name;
        string rId;
        uint noOfItems;
        uint rating;
        string[] itemNames;
        bool isRegistered;
    } 
    
    enum MenuType { Appetizer, Main, Desert }
    struct MenuItem{
        uint itemNum;
        string name;
        MenuType itemType;
        uint256 price;
    }
    
    struct Rating{
        uint oneStar;
        uint twoStar;
        uint threeStar;
        uint fourStar;
        uint fiveStar;
    } 
    
    address[] RestaurantCount;
    
    mapping(address => Restaurant) RestaurantMapping;
    mapping(address => Rating) RestaurantRating;
    mapping(string => MenuItem) RestaurantMenuItems; // restaurantIds to menu items
    mapping(address => Rating) DriverRating;
    
    uint256 orderTotalCount = 0;
     
    uint NetworkServiceFee = 2;
    uint DeliveryFlatFee = 2;
    
    /************Modifiers *************************************************/
    modifier OnlyParent(){
        require(msg.sender == parentContractAddress, "Foodiez Registration - Only Owner can call this function");
        _; // this underscore is requierd otherwise compiler will break;
    }

    modifier OnlyOwner(){
        require(msg.sender == ownerAddress, "Foodiez Registration - Only Owner can call this function");
        _; // this underscore is requierd otherwise compiler will break;
    }

    modifier isDeliveryCheck(){
        User memory u = registeredUserMapping[msg.sender];
        require(uint(UserType(u.usrType))== 1, "User is not a Delivery agent. Only Delivery agents can be assigned food order.");
        
        _;
    }
    
    /************Address setters for helper / order contracts *************************************************/
    function setParentContract(address _address) public OnlyOwner returns(string memory) {
        require(isParentContractSet == false,"Foodiez Registration - Parent already set. Cannot be Changed");
        parentContractAddress = _address;
        isParentContractSet = true;
        
        return("Foodiez Orders parent contract address set.");
    }

    /************User and Restaurant***********************************************/
    
    // User Registration
    function userRegistration(address _address, string memory name, uint uType) public OnlyParent returns (bool) {
         require(isUserRegistered(_address) == false, "User Already registered");
        
        // task: check is user is already registered, is yes then return message already registered
         
        User memory u = User(name, _address, UserType(uType), 0, 0, true);
        registeredUserMapping[_address] = u;
        RegisteredUserAddresses.push(_address);
        
        if(uType == 1){
            // Create default ratings for delivery
            Rating memory rating = Rating(0,0,0,0,0);
            DriverRating[_address] = rating;
        } 
        
        return true;
     }
     
    function getUserInfo(address _address) public OnlyParent view returns(string memory, address, string memory, uint ){
        require(isUserRegistered(_address) == true, "User data not found! ");
        
        User memory usr = registeredUserMapping[_address];
         
        return(usr.name, usr.userID, getUserTypeFriendly(uint8(usr.usrType)), usr.rating);
         
     }
    
    // Restaurant and Items Registration 
    function createRestaurant(address _address, string memory _name, string memory _rId) public OnlyParent returns(bool) {
        require(isRestaurantRegistered(_address) == false, "Restaurant is already registered.");
        
        // Create new Restaurant
        string[] memory itemNames; // init for empty array;
        Restaurant memory m = Restaurant(_address, _name, _rId, 0, 0, itemNames,true);
        
        RestaurantMapping[_address] = m;
        RestaurantCount.push(_address);
        
        // Create default ratings for Restaurant
        Rating memory rating = Rating(0,0,0,0,0);
        RestaurantRating[_address] = rating;
        
        return true;
    }
    
    function addMenuItems(address _address, string memory _itemName, uint _type, uint _price) public OnlyParent returns (string memory, string memory, string memory) {
        // only allowed by restaurants address that are already registered.
        require(isRestaurantRegistered(_address) == true, "Restaurant is not registered.");
        
        Restaurant storage rest = RestaurantMapping[_address];
        
        // create unique id from itemName and num ( itemNumberCount)
        string memory uni = _foodiezHelpers.uint2str(rest.noOfItems);
        string memory uniqueId = string(abi.encodePacked(rest.rId, uni));
        
        MenuItem memory mItem = MenuItem(rest.noOfItems, _itemName, MenuType(_type), _price);
        
        RestaurantMenuItems[uniqueId] = mItem;
        rest.itemNames.push(uniqueId);
        rest.noOfItems++;
        RestaurantMapping[_address] = rest;
        
        return (rest.rId, uniqueId, _itemName);
    }
    
    function getRestaurantMenu(address _restaurantAddress, uint _itemNumber) public OnlyParent view returns(string memory, string memory, uint){
        require(isRestaurantRegistered(_restaurantAddress) == true, "Restaurant is not registered.");
        
        Restaurant memory rest = RestaurantMapping[_restaurantAddress];
        
        string[] memory menuItems = rest.itemNames;
        
        MenuItem memory item = RestaurantMenuItems[menuItems[_itemNumber]];
        return(item.name, getMenuTypeFriendly(uint8(item.itemType)) , item.price);
        
    }
    
    function getrestaurantInfo(address _restaurantAddress) public OnlyParent view returns(string memory, address, uint, uint){
        require(isRestaurantRegistered(_restaurantAddress) == true, "Restaurant is not registered.");
        
        Restaurant memory rest = RestaurantMapping[_restaurantAddress];
        return(rest.rId, rest.restaurantAddress, rest.noOfItems, rest.rating);
    }
    
    /*************Orders Functions********************************************************************/
    function getOrderTotal(address _userAddress, address _address, uint _itemNum) public view OnlyParent returns(string memory, address, string memory, uint){
        require(isUserRegistered(_userAddress) == true, "User must register before placing order");
        uint totalPrice = 0;
        // get restaurant
        Restaurant memory rest = RestaurantMapping[_address];
        
        string[] memory menuItems = rest.itemNames;
        MenuItem memory m = RestaurantMenuItems[menuItems[_itemNum]];
        
        totalPrice += m.price;
        // calculate total bill
        uint tempTotal = totalPrice;
        totalPrice += _foodiezHelpers.calcServiceFee(tempTotal, NetworkServiceFee);
        totalPrice += _foodiezHelpers.calcDriverFlatFee(tempTotal, DeliveryFlatFee);
        
        return ( rest.rId, rest.restaurantAddress, m.name, totalPrice);
    }
    
    function createFoodOrder(string memory rId, address userAddress, address restaurantAddress, string memory itemName, uint totalPrice) public payable returns (string memory, string memory, uint, string memory){
        
        /****** create unique userOrderId*****/
        // get user data 
        User memory _regUser = registeredUserMapping[msg.sender];
        
        string memory orderNumString = _foodiezHelpers.uint2str(orderTotalCount);
        string memory uniqueUserOrderId = string(abi.encodePacked(_regUser.name, orderNumString));
        orderTotalCount++;
        
        return _foodiezOrders.createFoodOrderEntry(uniqueUserOrderId, rId, restaurantAddress, userAddress, itemName, totalPrice);
        
    }
    
    function addRestaurantRating(address _restaurantAddress, uint _restaurantRating) public OnlyParent {
        Rating memory r = RestaurantRating[_restaurantAddress];
        
        if(_restaurantRating == 1){
            r.oneStar++;
        }else if(_restaurantRating == 2){
            r.twoStar++;
        }else if(_restaurantRating == 3){
            r.threeStar++;
        }else if(_restaurantRating == 4){
            r.fourStar++;
        }else if(_restaurantRating == 5){
            r.fiveStar++;
        }
        
        // calculate the weighted average
        RestaurantRating[_restaurantAddress] = r;
        
        Restaurant memory res = RestaurantMapping[_restaurantAddress];
        res.rating = _foodiezHelpers.calcWeightedAvg(r.oneStar, r.twoStar, r.threeStar, r.fourStar, r.fiveStar);
        RestaurantMapping[_restaurantAddress] = res;
    }
    
    function addDriverRating(address _address, uint _deliveryRating) public OnlyParent {
        Rating memory r = DriverRating[_address];
         
        if(_deliveryRating == 1){
            r.oneStar++;
        }else if(_deliveryRating == 2){
            r.twoStar++;
        }else if(_deliveryRating == 3){
            r.threeStar++;
        }else if(_deliveryRating == 4){
            r.fourStar++;
        }else if(_deliveryRating == 5){
            r.fiveStar++;
        }

        DriverRating[_address] = r;
         
        User memory usr = registeredUserMapping[_address];
        usr.rating = _foodiezHelpers.calcWeightedAvg(r.oneStar, r.twoStar, r.threeStar, r.fourStar, r.fiveStar);
        registeredUserMapping[_address] = usr;
    }
    
    
    /*************Registration Helpers********************************************************************/
    function isUserRegistered( address _address) internal view returns (bool) {
         
        for( uint8 j = 0; j < RegisteredUserAddresses.length; j++){
             
            if(RegisteredUserAddresses[j] == _address){
                return (true); // user is registered.
            }
        }
        return (false); // user is not registered.
    }
    
    function checkUserDelivery(address _address) public view returns (bool){
        User memory u = registeredUserMapping[_address];
        
        if(uint(UserType(u.usrType))== 1) return true;
        
        return false;
    }
    
    function isRestaurantRegistered ( address _address) internal view returns (bool) {
        Restaurant memory m = RestaurantMapping[_address];
        
        return (m.isRegistered);
    }
    
    // function getrestaurantInfo()
    
    function getItemInfo(address _restaurantAddress, uint _itemNumber) public view returns(string memory, uint){
        require(isRestaurantRegistered(_restaurantAddress) == true, "Restaurant is not registered.");
        
        Restaurant memory rest = RestaurantMapping[_restaurantAddress];
        
        string[] memory menuItems = rest.itemNames;
        
        MenuItem memory item = RestaurantMenuItems[menuItems[_itemNumber]];
        return(item.name, item.price);
    }
    
    function getOrderCount() public view returns(uint){
        return orderTotalCount;
    }
    
    function incrementOrderCount() public {
        orderTotalCount++;
    }
    
    function getUserTypeFriendly(uint8 _usrType) internal pure returns (string memory userType) {
        
        if(UserType.Customer == UserType(_usrType) ) return "Customer";
        if(UserType.Delivery == UserType(_usrType)) return "Delivery";
    }
    
    function getMenuTypeFriendly(uint8 _menuType) internal pure returns (string memory userType) {
        
        if(MenuType.Appetizer == MenuType(_menuType) ) return "Appetizer";
        if(MenuType.Main == MenuType(_menuType) ) return "Main";
        if(MenuType.Desert == MenuType(_menuType)) return "Desert";
    }
    
}