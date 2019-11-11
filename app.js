// Revealing Module Pattern
// OOP Inheritance Application
var App = (function() {
  var Store = function(items) {
    this.items = items;
    this.index = this.items.length;
    this.total = 0;
  }
  Store.prototype = {
    add: function(item) {
      item.id = (this.index += 1);
      this.items.push(item);
    },
    getTotal: function() {
      return this.total.toFixed(6).slice(0, -4);
    },
    getItems: function() {
      return this.items;
    },
    getLength: function() {
      return this.items.length;
    },
    deleteItem: function(item) {
      const index = this.items.indexOf(item);
      this.items.splice(index, 1);
      
      console.log(this.items)
    },
    buildLists: function(listItem) {
      return `
      <div class="inventoryPanels" id=${listItem.id}><li>${listItem.name}: $${listItem.price}</li>
        <button class="removeItem" data-price=${listItem.price} data-id=${listItem.id} class="deleteIt">Remove Item</button>
        <button data-price=${listItem.price} data-name=${listItem.name} class="addToCart">Add to Cart</button>
      </div>`;
    },
    getItem: function(searchItem) {
      const foundItem = this.items.filter(function(item) {
        return item.name === searchItem;
      });
      return this.items.length ? foundItem : [];
    }
  }
  var Checkout = function(items) { 
    this.cartCache = [];
    this.cart = [];
    Store.call(this, items);
  }
  Checkout.prototype = Object.create(Store.prototype);
  Checkout.prototype.messageTracker = function(item, target) {
    this.cartCache.unshift(item);
    this.messageLogger(target);
  }
  Checkout.prototype.addToCart = function(item) {
    this.cart.unshift(item);
  }
  Checkout.prototype.messageLogger = function(target) {
    const currrentItem = this.cartCache[0];
    const message = `<div>Inside your inventory: You added one more item: ${currrentItem.name}</div>`;
    $(target).append(message);
  }
  Checkout.prototype.clearCartCache = function() { 
    this.cartCache = [];
    $('.logger').html('')
  }
  Checkout.prototype.addPriceToCart = function(itemPrice) {
    this.total += parseFloat(itemPrice);
  }
  Checkout.prototype.getShoppingCart = function() {
    return this.cart;
  }
  Checkout.prototype.clearCart = function() {
    this.cart = [];
    this.total = 0;
    $('#cartTotal').html(0);
    $('.shoppingCartList').html('');
  }
  Checkout.prototype.removeFromCart = function(idToRemove, price) {
    const index = this.cart.map(function(item) {
      return item.id;
    }).indexOf(idToRemove);
    this.cart.splice(index, 1);
    this.total -= parseFloat(price);
    $('#cartTotal').html(this.getTotal());
  }
  
  return {
    Checkout
  }
})();

$(function() {
  
  const mockCartData = [
    { id: 1, name:'Paper Plates', price: '12.99' },
    { id: 2, name:'Blue Jeans', price: '24.99' },
    { id: 3, name:'MLB Cap', price: '25.99' }
  ];
  function buildList(app) {
    const inventory = app.getItems();
    for (var j = 0; j < inventory.length; j++) {
      const list = app.buildLists(inventory[j]);
      $('.inventory').append(list); 
    }
  }
  const app = new App.Checkout(mockCartData);
  
  var init = function() {
    app.add({name: 'Poop',price: '20.99'});
    app.add({name: 'Salsa',price: '22.99'});
    buildList(app);
  }

 init();
  
 $('.deleteIt').each(function(el,i) {
    const name = $(this).attr('data-name');
    $(this).click(function(e) {
      e.preventDefault();
      app.deleteItem(name);
    })
 });
 $('.clearCache').click(function() {
   app.clearCartCache();
 });
  
 // add to cart
 $('body').on('click', '.addToCart', function() {
   const itemPrice = $(this).attr('data-price');
   const itemId = $(this).prev().prev().attr('id');
   const itemName = $(this).attr('data-name');
   const itemAdded = { id: itemId, name: itemName, price: itemPrice };
   
   app.addToCart(itemAdded);
   app.addPriceToCart(itemPrice);
   $('#cartTotal').html(app.getTotal());
   $('.shoppingCartList').append(`
    <div id=${itemAdded.id} class="myCart">
      <li>${itemAdded.name}, $${itemAdded.price}</li>
      <button class="removeItem" data-price=${itemAdded.price} data-id=${itemAdded.id}>x</button>
    </div>`);
   });
  
  $('body').on('click', '.removeItem', function() {
    const item = $(this).attr('data-id');
    const price = $(this).attr('data-price');
    // here we need to check if we are removing items from out shopping cart or inventory.
    // remove items from inventory will not decrement our cart total.
    // We'll just check for a class for now.
    if ($(this).parent('div.myCart').length) {
      app.removeFromCart(item, price);
    }
    $(this).parent('div').remove();
  });
  
 // clear the cart
  $('.clearCart').click(function() {
    app.clearCart();
  });

 $('.addItem').click(function() {
    const nameValue = $('.inputItem').val();
    const priceValue = $('.inputPrice').val();

    if (!nameValue || !priceValue) { return; };

    const $item = {
      name: nameValue,
      price: priceValue
    };
    app.add($item);
    $('.inventory').append(app.buildLists($item));
    app.messageTracker($item, '.logger');
    $('.inputItem, .inputPrice').val('');
  });
});
