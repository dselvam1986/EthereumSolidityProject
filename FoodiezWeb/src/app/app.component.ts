import { Component } from '@angular/core';
import { VirtualTimeScheduler } from 'rxjs';
import { EthcontractService } from './ethContract.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  public currentAccount :any;

  public registerAsUser = false;
  public registerAsRestaurant = false;
  public noItemSelected = true;

  public noRegisterViewOn = false;
  public userViewOn = false;
  public userOverviewOn = false;
  public userTypeCustomer = true;
  public driverViewOn = false;
  public restViewOn = false;
  public registerViewOn = false;
  public addingMenuItem = false;
  public showingMenu = false;
  public userRestsView = true;
  public userOrdersView = false;
  public payOrderScreenOn = false;
  public userOrdersListView = false;

  /********Order track var*************** */
  public restaurantChoosen = "";
  public orderConfirmationScreen = false;
  public orderTotals = {
    total: 0,
    serviceFee: 0,
    networkFee: 0,
    final: 0
  };

  userRegisterObj = {
    fname: '', // full name
    userId: '',
    type: null,
    token: 0,
    nameError: false,
    typeError: false,
    tokenError: false
  }

  userViewObj = {
    name: '',
    userId:'',
    type: '',
    token: 0,
    amount: 0,
    rating: 0,
    activeOrders: 0,
    naviRestaurant: true
  }

  userOrderViewArry = []; // empty at init. based on num of order push obj.
  driverOrderViewArry = [];

  restaurantRegisterObj = {
    name:"",
    id: "",
    token: 0,
    nameError: false,
    idError: false, 
    tokenError: false
  }

  restViewObj = {
    id: '',
    items: 0,
    token: 0,
    amount: 0,
    rating: 0,
    address: ''
  }

  menuItemRegisterObj = {
    name: "",
    type: null,
    price: "",
    nameError: false,
    typeError: false,
    priceError: false,
  }

  userTypeOption = [
    { id: 0, name: "Customer" },
    { id: 1, name: "Driver" },
  ];

  menuItemType = [
    { id: 0, name: "Appetizer" },
    { id: 1, name: "Main" },
    { id: 2, name: "Desert" }
  ];

  menuItemArray = [];
  restaurantArray =[];

  payOrderObj={
    orderId: '',
    total: 0,
    driverTip: 0,
    tokenTip: 0,
    restRating: '',
    driverRating: ''
  };

  constructor(private ethService: EthcontractService){}

  public async ngOnInit(){
    this.ethService.accountChanged.subscribe((value) => {
      if(value != '' && value != undefined && this.ethService.ethereumConnected){
        this.currentAccount = value;
        this.checkAddressRegistration(value);
        console.log(value);
      }
    });
  }

  public connectToMetaMask(){
    console.log("Connect to MetaMask clicked")
    this.ethService.connectToMetaMask();
  }

  public async getBalance(){
    let result = await this.ethService.getAccountsBalance();
    console.log(result);
  }

  /********************************Registration info methods******************************************************************************************** */
  
  public registerAddress(type){
    if(type == 'user'){
      this.registerAsUser = true;
      this.registerAsRestaurant = false;
    }else{
      this.registerAsUser = false;
      this.registerAsRestaurant = true;
    }
  }
  public setUserType(typeNum){
    this.userRegisterObj.type = typeNum;
  }

  public changeUserView(isRestView){
    console.log("changeUserView");
    if (isRestView){
      this.getAllRestaurant();
      this.userViewObj.naviRestaurant = true;
      this.userOrdersView = false;
      this.userRestsView = true;
      this.menuItemArray = [];

    }else{
      if (this.userViewObj.type == 'Customer'){
        this.orderConfirmationScreen = false;
        this.userOrdersView = true;
        
        this.getAllUserOrders();
      }else{
        // this.driverViewOn = true;
        this.getAllOrders();
      }  
      this.userViewObj.naviRestaurant = false;
      this.userRestsView = false;
    }

  }

  public setMenuType(typeNum) {
    this.menuItemRegisterObj.type = typeNum;
  }

  public async checkAddressRegistration(address){
    console.log("checkAddressRegistration");
    this.resetRegisterObj(3);
    if (address != '' && address != undefined){
      await this.ethService.checkAddressRegistration(address, true).then(async (data)=>{
        if (data.usrName !=undefined){
          // user identified. update view to User view based on type
          // console.log(data);
          this.userOverviewOn = true;

          this.userViewObj.name = data.usrName;
          this.userViewObj.userId = data.usrId;
          this.userViewObj.type = data.usrType;
          this.userViewObj.rating = data.rating;
          this.userViewObj.token = await this.ethService.getTokenBalance(address);
          
          if(data.usrType == 'Customer'){
            this.userViewOn = true;
            this.userTypeCustomer = true;

            this.userOrdersView = false;
            this.driverViewOn = false;
            this.noRegisterViewOn = false;
            this.restViewOn = false;
            this.registerAsUser = false;
            this.registerAsRestaurant = false;

            this.getAllRestaurant(); // all rest 
            this.getUserOrder(); // all orders by user.
            
          }else{
            // driver type so get all orders.
            this.driverViewOn = true;

            this.userTypeCustomer = false;
            this.userViewOn = false;
            this.userOrdersView = false;
            this.noRegisterViewOn = false;
            this.restViewOn = false;
            this.payOrderScreenOn = false;
            this.registerAsUser = false;
            this.registerAsRestaurant = false;
            this.getAllOrders()
          }
         

        }else{
          await this.ethService.checkAddressRegistration(address, false).then( async(data) => {
            
            // let res = this.errorHandler(data);
            if (data.rId != undefined){
              // console.log(data);
              this.restViewObj.id = data.rId;
              this.restViewObj.items = data.rItems;
              this.restViewObj.rating = data.rating;
              this.restViewObj.token = await this.ethService.getTokenBalance(address);

              this.restViewOn = true;

              this.noRegisterViewOn = false;
              this.driverViewOn = false;
              this.userViewOn = false;
              this.userOverviewOn = false;
              this.payOrderScreenOn = false;
              this.registerAsUser = false;
              this.registerAsRestaurant = false;

            }else{
              let res = this.errorHandler(data);
              if (res.code == -32000){
                console.log("Restaurant not Found")
                this.noRegisterViewOn = true;

                this.driverViewOn = false;
                this.userViewOn = false;
                this.restViewOn = false;
                this.userOverviewOn = false;
                this.payOrderScreenOn = false;
                this.registerAsUser = false;
                this.registerAsRestaurant = false;
              }
            }
          });
        }
      });
    }
  }

  public async getAddressDetails() {
    console.log(this.currentAccount);
    await this.ethService.checkAddressRegistration(this.currentAccount, true).then((data)=>{
      console.log(data);
    });
  }

  public async registerUser() {
    
    // check to make sure all fields are valid
    if (this.userRegisterObj.fname.trim() == '' || this.userRegisterObj.userId.trim() == ''){
      this.userRegisterObj.nameError = true;
      return;
    }

    if(this.userRegisterObj.type == null){
      this.userRegisterObj.typeError = true;
      return;
    }

    if(this.userRegisterObj.type == 1 && this.userRegisterObj.token < 10){
      this.userRegisterObj.tokenError = true;
      return;
    }

    if (this.userRegisterObj.type == 1){
      await this.ethService.registerDriver(this.userRegisterObj.fname, this.userRegisterObj.userId, this.userRegisterObj.type, this.userRegisterObj.token).then( async (result) => {
        if(result.status != undefined){
          this.registerAsUser = false;
          
          this.resetRegisterObj(1);
          this.checkAddressRegistration(result.from);
        }
        console.log("Driver Registey", result);
      });
    }else{
      await this.ethService.registerUser(this.userRegisterObj.fname, this.userRegisterObj.userId, this.userRegisterObj.type, this.userRegisterObj.token).then( async (result) => {
        if (result.status != undefined) {
          this.checkAddressRegistration(result.from);
        }
        console.log("User Registry: ",result);
      });
    }
  }

  public async registerRestaurant(){
    if (this.restaurantRegisterObj.name.trim() == '' ) {
      this.restaurantRegisterObj.nameError = true;
      return;
    }

    if (this.restaurantRegisterObj.id.trim() == '') {
      this.restaurantRegisterObj.idError = true;
      return;
    }

    if (this.restaurantRegisterObj.token < 10) {
      this.restaurantRegisterObj.tokenError = true;
      return;
    }

    await this.ethService.registerRestaurant(this.restaurantRegisterObj.name, this.restaurantRegisterObj.id, this.restaurantRegisterObj.token).then( async (result)=>{
      if (result.status != undefined){
        console.log(result);
        this.registerAsRestaurant = false;
        this.resetRegisterObj(2);
        this.checkAddressRegistration(result.from);
      }else{
        // error
        console.log("Error", result);
      }
    })
  }

  public addMenuItemsView(){
    this.addingMenuItem = true;
    this.showingMenu = false;
    this.menuItemArray = [];
  }

  public async getRestaurantMenuView(){
    console.log("getRestaurantMenuView");
    this.menuItemArray = [];
    const self: this = this;

      let numOfItem = Number(this.restViewObj.items);

      for (var i = 0; i < numOfItem; i++) {
        self.ethService.getMenuItem(this.currentAccount, i).then(async (result) => {
          this.menuItemArray.push(result);
        });
      }

    this.addingMenuItem = false;
    this.showingMenu = true;
  }

  public async getRestaurantMenu(address, numItems) {
    console.log("getRestaurantMenu");
    this.menuItemArray = [];

    if (address != null || address != '') {

      for (var i = 0; i < numItems; i++) {
        this.ethService.getMenuItem(address, i).then(async (result) => {
          result['restAddress'] = address;
          result['isSelected'] = false;
          this.menuItemArray.push(result);
        });
      }
      this.restaurantChoosen = address;
    }
  }

  public async createRestaurantMenuItem() {
    console.log("createRestaurantMenuItem");
    if(this.menuItemRegisterObj.name.trim() == "" ){
      this.menuItemRegisterObj.nameError = true;
      return;
    }
    if (this.menuItemRegisterObj.price.trim() == ""){
      this.menuItemRegisterObj.priceError = true;
      return;
    }

    if (this.menuItemRegisterObj.type == null){
      this.menuItemRegisterObj.typeError = true;
      return;
    }

    await this.ethService.addMenuItem(this.menuItemRegisterObj.name, this.menuItemRegisterObj.type, this.menuItemRegisterObj.price).then( async (result) => {
      if (result.status != undefined) {
        console.log(result);
        // reset obj
        this.resetRegisterObj(3);
        this.checkAddressRegistration(result.from);
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public async getUserOrderCount(){
    console.log("getUserOrderCount");
    await this.ethService.registerUser(this.userRegisterObj.fname, this.userRegisterObj.userId, this.userRegisterObj.type, this.userRegisterObj.token).then(async (result) => {
      if (result.status != undefined) {
        this.checkAddressRegistration(result.from);
      }
      console.log("User Registry: ", result);
    });
  }

  /*************************Order Methods************************************************************************************** */
  public getAllRestaurant(){
    console.log("getAllRestaurant");
    const self: this = this;
    self.restaurantArray = [];
    this.ethService.getAllRestaurants().then(async (result) => {
      if (result.count != undefined) {
        let num = result.restAddresses.length;
        let restAddress = result.restAddresses;
        for (var i = 0; i < num; i++){
          await this.ethService.checkAddressRegistration(restAddress[i], false).then( (data) => {

            // let res = this.errorHandler(data);
            if (data.rId != undefined) {
              // console.log(data);
              self.restViewObj.id = data.rId;
              self.restViewObj.items = data.rItems;
              self.restViewObj.rating = data.rating;
              self.restViewObj.address = restAddress[i];

              self.restaurantArray.push(self.restViewObj);
              self.resetRegisterObj(2);
            } 
          });
        }
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public async getAllUserOrders(){
    console.log("getAllUserOrders");
    this.userOrderViewArry = [];
    for (var i = 0; i < this.userViewObj.activeOrders; i++){
      let uniqueId = this.userViewObj.userId + i;

      await this.ethService.getOrderStatus(uniqueId).then(async (result)=>{
        // console.log(result);
        result['isSelected'] = false;
        this.userOrderViewArry.push(result);
      })
    }
    this.userOrdersListView = true;
    console.log(this.userOrderViewArry);
    
  }

  public addItemForOrder(index){
    console.log("addItemForOrder");
    this.menuItemArray[index].isSelected = !this.menuItemArray[index].isSelected;

    this.noItemSelected = true;
    for (var i = 0; i < this.menuItemArray.length; i++) {
      if (this.menuItemArray[i].isSelected) {
        this.noItemSelected = false;
      }
    }
  }

  public async getOrderTotal(){
    console.log("getOrderTotal");
    let itemNum = [];
    let total = 0;

    for(var i = 0; i< this.menuItemArray.length; i++){
      if(this.menuItemArray[i].isSelected){
        itemNum.push(i);
        total += Number(this.menuItemArray[i].itemPrice);
      }
    }
    console.log(itemNum);
    await this.ethService.orderTotal(this.restaurantChoosen, itemNum).then(async (result) => {
      if (result != undefined) {

        this.orderTotals.serviceFee = (total * (2/100));
        this.orderTotals.networkFee = (total * (2/100));
        this.orderTotals.total = total;
        this.orderTotals.final = result;
        this.orderConfirmationScreen = true;
        console.log(result);
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public navBackToMenuScreen(resetObj: boolean){
    console.log("navBackToMenuScreen");
    if(resetObj){
      for (var i = 0; i < this.menuItemArray.length; i++) {
        this.menuItemArray[i].isSelected = false;
      }
    }
    this.orderConfirmationScreen = false;
  }

  public async placeOrder() {
    console.log("placeOrder");
    let itemNameArry = [];
    for (var i = 0; i < this.menuItemArray.length; i++) {
      if (this.menuItemArray[i].isSelected) {
        itemNameArry.push(this.menuItemArray[i].itemName)
      }
    }

    await this.ethService.placeOrder(this.restaurantChoosen, itemNameArry, this.orderTotals.final, 0).then(async (result) => {
      if (result.status != undefined) {
        console.log(result);

        this.navBackToMenuScreen(true);
        this.noItemSelected = true;
        this.getUserOrder();
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public async getUserOrder() {
    console.log("getUserOrder");
    await this.ethService.getUserOrders().then(async (result) => {
      if (result != undefined) {
        this.userViewObj.activeOrders = result;
        console.log(result);
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  /*************************Driver Methods************************************************************************************** */
  public async getAllOrders(){
    console.log("getAllOrders");
    this.driverOrderViewArry = [];
    await this.ethService.getAllOrder().then(async (result) => {
      if (result != undefined) {
        if (result.length > 0){
          let allOrder = result;

          for(var i = 0; i < allOrder.length; i++){
            await this.ethService.getOrderStatus(allOrder[i]).then(async (orders)=>{
              orders['driverAddressLC'] = orders.driverAddress.toLowerCase();
              console.log(orders);
              console.log(orders.driverAddress);
              console.log(this.currentAccount);
              
              this.driverOrderViewArry.push(orders);
            })
          }
        }
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public async assignToDriver(userOrderId){
    await this.ethService.driverAssign(userOrderId).then(async (result) => {
      if (result != undefined) {
        
        console.log(result);
        this.getAllOrders();
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public async driverDelivered(userOrderId) {
    await this.ethService.driverDeliveredOrder(userOrderId).then(async (result) => {
      if (result != undefined) {

        console.log(result);
        this.getAllOrders();
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public payOrderView(orderObj){
    console.log("orderObj");
    this.payOrderScreenOn = true;
    this.userOrdersListView = false;

    this.payOrderObj.orderId = orderObj.orderId;
    this.payOrderObj.total = orderObj.ethTotal;

  }

  public navBackToConfirmationScreen() {
    console.log("navBackToConfirmationScreen");
    this.payOrderScreenOn = false;
    this.changeUserView(false);
  }

  public async orderDeliveryConfirm() {

    let userOrderId = this.payOrderObj.orderId;
    let restRating = this.payOrderObj.restRating;
    let driverRating = this.payOrderObj.driverRating;
    let driverTip = this.payOrderObj.driverTip;
    let tokenTip = this.payOrderObj.tokenTip;

    await this.ethService.orderDeliveredConfirm(userOrderId, restRating, driverRating, driverTip, tokenTip).then(async (result) => {
      if (result != undefined) {

        // console.log(result);
        this.navBackToConfirmationScreen();
        this.resetRegisterObj(3);
        this.checkAddressRegistration(this.currentAccount);
        this.getAllOrders();
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }

  public errorHandler(errorMessage) {
    let string = errorMessage.toString();
    let objIndex = string.indexOf('{');
    let objStr = string.substring(objIndex).trim()
    return JSON.parse(objStr);
  }

  public resetRegisterObj(num){
    if(num == 1){
      // user obj
      this.userRegisterObj = {
        fname: '',
        userId: '',
        type: null,
        token: 0,
        nameError: false,
        typeError: false,
        tokenError: false
      }
    }else if(num == 2){
      // rest obj
      this.restaurantRegisterObj = {
        name: "",
        id: "",
        token: 0,
        nameError: false,
        idError: false,
        tokenError: false
      };

      this.restViewObj = {
        id: '',
        items: 0,
        token: 0,
        amount: 0,
        rating: 0,
        address: ''
      };

      this.restaurantChoosen = '';

    }else if(num == 3){
      // 3 is order payments 
      this.payOrderObj = {
        orderId: '',
        total: 0,
        driverTip: 0,
        tokenTip: 0,
        restRating: '',
        driverRating: ''
      };

    }else{
      // menu obj
      this.menuItemRegisterObj = {
        name: "",
        type: null,
        price: "",
        nameError: false,
        typeError: false,
        priceError: false,
      }

      this.restaurantArray = [];
      this.menuItemArray = [];
    }

  }

  public async sampleTokenTest(){
    let sender = '0x204dBe0448667ffa72Cf0862769C53792Fe1a4ba';
    let recipient = '0xf209a9506da30650d102e45e673de232a12dc5f7'
    let token = 1;
    await this.ethService.tokenTransferFrom(sender, recipient, token).then(async (result) => {
      if (result != undefined) {

        console.log(result);
        this.getAllOrders();
        // reset obj
      } else {
        // error
        console.log("Error", result);
      }
    })
  }
}
