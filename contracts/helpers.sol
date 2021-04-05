pragma solidity ^0.8.1;
// pragma solidity 0.7.6;
// "SPDX-License-Identifier: UNLICENSED"

contract FoodiezHelpers{

    enum UserType { Customer, Delivery } // 0 , 1
    enum MenuType { Appetizer, Main, Desert }

    function uint2str(uint v) public pure returns (string memory) {
        if(v == 0){
            return '0';
        }
        uint maxlength = 100;
        bytes memory reversed = new bytes(maxlength);
        uint i = 0;
        while (v != 0) {
            uint remainder = v % 10;
            v = v / 10;
            reversed[i++] = bytes1(uint8(48 + remainder));
        }
        bytes memory s = new bytes(i); // i + 1 is inefficient
        for (uint j = 0; j < i; j++) {
            s[j] = reversed[i - j - 1]; // to avoid the off-by-one error
        }
        string memory str = string(s);  // memory isn't implicitly convertible to storage
        return str;
    }

        
    // function uint2str(uint _i) public pure returns (string memory _uintAsString) {
    //     if (_i == 0) {
    //     return "0";
    //     }
        
    //     uint j = _i;
    //     uint len;
        
    //     while (j != 0) {
    //         len++;
    //         j /= 10;
    //     }
    //     bytes memory bstr = new bytes(len);
    //     uint k = len - 1;
    //     while (_i != 0) {
    //         bstr[k--] = bytes1(uint8(48 + _i % 10));
    //         _i /= 10;
    //     }
    //     return string(bstr);
    // }
    
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

    function weiToEther(uint inWei) public pure returns (uint){
        uint oneEth = 1000000000000000000; //inWei
        return (inWei / oneEth);
    }

    function etherToWei(uint inEth) public pure returns (uint){
        uint oneEth = 1000000000000000000;
        return (inEth * oneEth);
    }

    function getUserTypeFriendly(uint8 _usrType) public pure returns (string memory userType) {
        
        if(UserType.Customer == UserType(_usrType) ) return "Customer";
        if(UserType.Delivery == UserType(_usrType)) return "Delivery";
    }
    
    function getMenuTypeFriendly(uint8 _menuType) public pure returns (string memory userType) {
        
        if(MenuType.Appetizer == MenuType(_menuType) ) return "Appetizer";
        if(MenuType.Main == MenuType(_menuType) ) return "Main";
        if(MenuType.Desert == MenuType(_menuType)) return "Desert";
    }
}