pragma solidity ^0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

interface FoodiezHelpersInterface {
    function uint2str(uint _i) external pure returns (string memory _uintAsString);
    function calcServiceFee(uint _amount, uint _networkServiceFee) external pure returns(uint);
    function calcDriverFlatFee(uint _amount, uint _driverFlatFee) external pure returns(uint);
    function calcWeightedAvg(uint oneStar, uint twoStar, uint threeStar, uint fourStar, uint fiveStar) external pure returns (uint);
    function weiToEther(uint inWei) external pure returns (uint);
    function etherToWei(uint inEth) external pure returns (uint);
}