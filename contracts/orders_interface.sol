pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

interface FoodiezOrdersInterface {
    function setParentContract(address _address) external returns(string memory);
    function setRegisterContract(address _address) external returns(string memory);
    function createFoodOrderEntry( string memory, string memory, address, address, string memory, uint) external payable returns(string memory, string memory, uint256, string memory);
    function getUserOrderStatus(string memory userOrderId) external view returns(string memory, address, address, string memory, uint256, string memory);
    function assignOrderToDriver(address _deliveryAddress, string memory userOrderId) external returns (address, string memory);
    function driverDelieveredOrder(address _deliveryAddress, string memory userOrderId) external returns (address, string memory);
    function orderDeliveryConfirmed(string memory userOrderId ) external returns (address, address, address, uint );
    function setTokenPayOrder(string memory _uniqueOrderId, uint256 tokenPay) external;
    function getTokenPayOrder(string memory _uniqueOrderId) external view returns(uint256);
}