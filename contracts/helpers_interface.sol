pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

interface FoodiezHelpersInterface {
    function uint2str(uint _i) external pure returns (string memory _uintAsString);
    function calcServiceFee(uint _amount, uint _networkServiceFee) external pure returns(uint);
    function calcDriverFlatFee(uint _amount, uint _driverFlatFee) external pure returns(uint);
    function calcWeightedAvg(uint oneStar, uint twoStar, uint threeStar, uint fourStar, uint fiveStar) external pure returns (uint);
}