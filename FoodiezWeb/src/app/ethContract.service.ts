import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
const Web3 = require('web3');
let foodzJson = require('../../../build/contracts/Foodiez.json');
var Contract = require('web3-eth-contract');
let srcfoodzJson = require('../assets/Foodiez.json');
const $ = require("jquery");
// var $ = require( "jquery" );

declare let require: any;
declare let window: any;


export class EthcontractService {
    private web3: any;
    private chainId: any;
    private networkId: any;
    private contracts: {};
    public activeAccount;
    public ethereumConnected = false;
    public accounts = [];
    public accountSubscription: any;
    private foodiezInstance: any;
    private foodiezTokenInstance: any;
    public foodiezTokenName: any;
    public foodiezTokenSymbol: any;
    public foodiezTokenAmount: any;

    private accountChangeSubject = new BehaviorSubject<string>("");
    accountChanged = this.accountChangeSubject.asObservable();

    constructor() {
        // let web3 = new Web3('http://localhost:7545');
        if (window.ethereum === undefined) {
            alert('Non-Ethereum browser detected. Install MetaMask');
        } else {
            if (typeof window.web3 !== 'undefined') {
                this.web3 = window.web3.currentProvider;
                console.log('EthService :: constructor :: window.web3 is set');
            } else {
                this.web3 = new Web3.providers.HttpProvider('http://localhost:7545');
                console.log('EthService :: constructor :: window.ethereum web3 http provider set');
            }
            console.log(this.web3);
            window.web3 = new Web3(window.ethereum);
            console.log('transfer.service :: constructor :: this.web3');
        }

        // this.foodiezInstance = new this.web3.eth.contract(JSON.parse(foodzJson));

    }
    
    public async connectToMetaMask(){
        const self: this = this;

        self.chainId = await window.ethereum.request({
            method: 'eth_chainId'
        });

        self.networkId = await window.ethereum.request({
            method: 'net_version'
        });

        await window.ethereum.request({ method: 'eth_requestAccounts' }).then((data)=>{
            self.activeAccount = data[0];
            this.ethereumConnected = true;
            
            setTimeout(function(){
                self.accountChangeSubject.next(window.web3.currentProvider.selectedAddress);
            }, 500)
            

            let accountCheckInterval = setInterval(function () {
                if (self.activeAccount != window.web3.currentProvider.selectedAddress) {
                    self.updateActiveAccount();
                }
            }, 100);
        }).catch((err)=>{
            console.log(err);
        }).then(()=>{
            $.getJSON('../assets/Foodiez.json', function (data) {
                try {
                    // Get the contract instance.
                    let deployedNetwork = data.networks[self.networkId];

                    self.foodiezInstance = new window.web3.eth.Contract(data.abi, deployedNetwork.address);
                    console.log(self.foodiezInstance);
                    // approve contract to transfer tokens

                } catch (error) {
                    // Catch any errors for any of the above operations.
                    alert(`Failed to load web3, accounts contracts. Check console for details.`);
                    console.log(error);
                }
            });
            $.getJSON('../assets/FoodiezToken.json', function (data) {
                console.log(data);
                try {
                    // Get the contract instance.
                    let deployedNetwork = data.networks[self.networkId];
                    self.foodiezTokenInstance = new window.web3.eth.Contract(data.abi, deployedNetwork.address);

                    self.foodiezTokenInstance.methods.name().call().then((data) => {
                        self.foodiezTokenName = data;
                        // console.log("Token Name", data) 
                    });
                    
                    self.foodiezTokenInstance.methods.symbol().call().then((data) => {
                        self.foodiezTokenSymbol = data;
                        // console.log("Token Sybmot", data) 
                    });
        
                    self.foodiezTokenInstance.methods.totalSupply().call().then((data) => {
                        self.foodiezTokenAmount = data;
                        // console.log("Token Supply", data) 
                    });
                    
                    console.log(self.foodiezTokenInstance);
                    // approve contract to transfer tokens
                } catch (error) {
                    // Catch any errors for any of the above operations.
                    alert(`Failed to load web3, accounts contracts. Check console for details.`);
                    console.log(error);
                }
            });
        });
    }

    public updateActiveAccount() {
        this.activeAccount = window.web3.currentProvider.selectedAddress;
        this.accountChangeSubject.next(window.web3.currentProvider.selectedAddress);
    }

    public async getAccountsBalance(){
        // console.log(this.web3.currentProvider);
        let balance = await window.web3.eth.getBalance(this.activeAccount);
        return window.web3.utils.fromWei(balance);
    }

    public getTokenBalance(address): any {
        // console.log(this.web3.currentProvider);
        return this.foodiezInstance.methods.getTokenBalanceOf(address).call().then( function(result){
            return result;
        })
    }

    public checkAddressRegistration(address: string, isUser: boolean): any{
        const self: this = this;

        let dataObj = {};
        if(isUser){
            if (address != undefined && address != '') {
                return this.foodiezInstance.methods.getUserInfo(address).call().then(function (result) {
                    // check if result is data value or its its a error
                    if (result.usrName != undefined && result.usrType != undefined) {
                        
                        dataObj['usrName'] = result.usrName;
                        dataObj['usrType'] = result.usrType;
                        dataObj['rating'] = result.rating;

                        return dataObj;
                    } else {
                        // its an error. pass to error Handler
                        let usrErr = self.errorHandler(result);
                        if (usrErr.code == -32000) {
                            return usrErr;
                        }
                    }
                }).catch((error)=>{
                    // console.log(error);
                    return error;
                });
            }
        }else{
            return this.foodiezInstance.methods.getrestaurantInfo(address).call().then(function (result) {
                if (result.rId != undefined && result.rItems != undefined) {
                    dataObj['rId'] = result.rId;
                    dataObj['rItems'] = result.rItems;
                    dataObj['rating'] = result.rating;
                    return dataObj;
                }else{
                    let usrErr = self.errorHandler(result);
                    if (usrErr.code == -32000) {
                        return usrErr;
                    }
                }
            }).catch((error)=>{
                // console.log(error);
                return error;
            });
        }
    }

    public registerUser(name, type, tokenAmt): any {
        const self: this = this;

        if (tokenAmt > 0) {
            return this.foodiezInstance.methods.userRegister(name, type, tokenAmt).send({ from: this.activeAccount, value: window.web3.utils.toWei(tokenAmt, 'ether') })
                .then(function (result) {
                    return result;
                }).catch((error) => {
                    return error;
                });
        } else {
            return this.foodiezInstance.methods.userRegister(name, type, tokenAmt).send({ from: this.activeAccount })
                .then(function (result) {
                    return result;
                }).catch((error) => {
                    return error;
                });
        }
    }

    public registerDriver(name, type, tokenAmt): any {
        const self: this = this;

        return this.foodiezInstance.methods.userRegister(name, type, tokenAmt)
            .send({ from: this.activeAccount, value: window.web3.utils.toWei(tokenAmt, 'ether') })
            .then(function (result) {
                return result;
            }).catch((error) => {
                return error;
            });
    }

    public registerRestaurant(name, id, tokenAmt):any {
        const self: this = this;

        return this.foodiezInstance.methods.registerRestaurant(name, id, tokenAmt)
            .send({ from: this.activeAccount, value: window.web3.utils.toWei(tokenAmt, 'ether')})
            .then(function (result) {
                return result;
            }).catch((error) => {
                return error;
            });
    }

    public getAllRestaurants(): any{

        return this.foodiezInstance.methods.getAllRestaurants().call().then(function (result) {
            return result;
            }).catch((error) => {
                return error;
            });
    }

    public addMenuItem(name, type, price): any{
        return this.foodiezInstance.methods.addMenuItems(name, type, price).send({ from: this.activeAccount }).then( function(result){
            return result;
        }).catch((error)=>{
            return error;
        });
    }

    public getMenuItem(address, itemNum): any {
        return this.foodiezInstance.methods.getRestaurantMenu(address, itemNum).call({ from: this.activeAccount }).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    /*************Order methods**************************************************************************** */

    public placeOrder(address, itemNum, tokenPay, price): any {
        return this.foodiezInstance.methods.placeOrder(address, itemNum, tokenPay).send({ from: this.activeAccount, value: window.web3.utils.toWei(price, 'ether') }).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    public orderStatus(userOrderId): any {
        return this.foodiezInstance.methods.getOrderStatus(userOrderId).call({ from: this.activeAccount }).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }
    //assignToDriver
    public driverAssign(userOrderId): any {
        return this.foodiezInstance.methods.assignToDriver(userOrderId).call({ from: this.activeAccount }).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }
    //driverDelieveredOrder
    public driverDeliveredOrder(userOrderId): any {
        return this.foodiezInstance.methods.driverDelieveredOrder(userOrderId).call({ from: this.activeAccount }).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }
    
    //orderDeliveryConfirmed
    public orderDelievered(userOrderId, restRating, userRating, tip, tokenTip): any {
        return this.foodiezInstance.methods.orderDeliveryConfirmed(userOrderId, restRating, userRating, tokenTip).send({ from: this.activeAccount, value: window.web3.utils.toWei(tip, 'ether')}).then(function (result) {
            return result;
        }).catch((error) => {
            return error;
        });
    }

    public errorHandler(errorMessage){
        let string = errorMessage.toString();
        let objIndex = string.indexOf('{');
        let objStr = string.substring(objIndex).trim()
        return JSON.parse(objStr);
    }

}