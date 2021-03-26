pragma solidity 0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

interface FoodiezRegistrationInterface {

    function setParentContract(address _address) external returns(string memory);

    function userRegistration(address _address, string memory name, uint uType) external returns (bool);
     
    function getUserInfo(address _address) external view returns(string memory, address, string memory, uint );
    
    // Restaurant and Items Registration 
    function createRestaurant(address _address, string memory _name, string memory _rId) external returns(bool);
    
    function addMenuItems(address _address, string memory _itemName, uint _type, uint _price) external returns (string memory, string memory, string memory);
    
    function getRestaurantMenu(address _restaurantAddress, uint _itemNumber) external view returns(string memory, string memory, uint);
    
    function getrestaurantInfo(address _restaurantAddress) external view returns(string memory, address, uint, uint);
    
    /*************Orders Functions********************************************************************/
    function getOrderTotal(address _userAddress, address _address, uint _itemNum) external view  returns(string memory, address, string memory, uint);
    
    function createFoodOrder(string memory rId, address userAddress, address restaurantAddress, string memory itemName, uint totalPrice) external payable returns (string memory, string memory, uint, string memory);
    
    function addRestaurantRating(address _restaurantAddress, uint _restaurantRating) external  ;
    
    function addDriverRating(address _address, uint _deliveryRating) external  ;
    
    
    /*************Registration Helpers********************************************************************/
    
    function checkUserDelivery(address _address) external view returns (bool);

    function getItemInfo(address _restaurantAddress, uint _itemNumber) external view returns(string memory, uint);
    
    function getOrderCount() external view returns(uint);
    
    function incrementOrderCount() external ;
}