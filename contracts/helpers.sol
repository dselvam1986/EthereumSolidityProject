pragma solidity 0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

contract FoodiezHelpers{
    
    function uint2str(uint256 _i) public pure returns (string memory _uintAsString) {
        if (_i == 0) {
        return "0";
        }
        
        uint256 j = _i;
        uint256 len;
        
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
    
    // functions to calculate service fee and driver fee
    function calcServiceFee(uint _amount, uint _networkServiceFee) public pure returns(uint){
        
        // uint serviceFeePercentage = NetworkServiceFee /100;
        
        return (_amount * _networkServiceFee) / 100;
        
    }
    
    function calcDriverFlatFee(uint _amount, uint _driverFlatFee) public pure returns(uint){
        
        // uint driverFeePercentage = DriverFlatFee /100;
        
        return (_amount * _driverFlatFee) / 100;
        
    }
    
    function calcWeightedAvg(uint oneStar, uint twoStar, uint threeStar, uint fourStar, uint fiveStar) public pure returns (uint){
        uint weightPerRating = 1*oneStar + 2*twoStar + 3*threeStar + 4*fourStar + 5*fiveStar;
        uint totalRatingCount = oneStar + twoStar + threeStar + fourStar + fiveStar;
        uint averageRating = weightPerRating / totalRatingCount;
        
        return averageRating;
        
    }
}