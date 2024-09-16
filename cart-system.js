const prompt = require('prompt-sync')();

class Product {
  constructor(id, name, price, category) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.category = category;
  }
}

class CartItem {
  constructor(product, quantity) {
    this.product = product;
    this.quantity = quantity;
  }

  getTotalPrice() {
    return this.product.price * this.quantity;
  }
}

class Cart {
  constructor() {
    this.items = [];
  }

  addToCart(product, quantity) {
    const existingItem = this.items.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity; // Update quantity if product exists
    } else {
      this.items.push(new CartItem(product, quantity)); // Add new item if it doesn't exist
    }
  }

  removeFromCart(productId, quantity = null) {
    const index = this.items.findIndex(item => item.product.id === productId);
    if (index !== -1) {
      if (quantity && this.items[index].quantity > quantity) {
        this.items[index].quantity -= quantity;
      } else {
        this.items.splice(index, 1); // Remove item if no quantity or full quantity is to be removed
      }
    }
  }

  viewCart() {
    if (this.items.length === 0) {
      console.log("Your cart is empty.");
      return;
    }

    let total = 0;
    console.log("Your Cart:");
    this.items.forEach(item => {
      const itemTotal = item.getTotalPrice();
      console.log(
        `${item.product.name} - Quantity: ${item.quantity}, Price: ${item.product.price.toFixed(2)} USD, Total: ${itemTotal.toFixed(2)} USD`
      );
      total += itemTotal;
    });
    console.log(`Total (before discounts): ${total.toFixed(2)} USD`);
  }

  getTotalPrice() {
    return this.items.reduce((sum, item) => sum + item.getTotalPrice(), 0);
  }
}

class Discount {
  constructor(name, apply) {
    this.name = name;
    this.apply = apply;
  }
}

const discounts = [
  new Discount('Buy 1 Get 1 Free on Fashion items', cart => {
    cart.items.forEach(item => {
      if (item.product.category === 'Fashion') {
        item.quantity = Math.floor(item.quantity / 2) + (item.quantity % 2); // Apply discount
      }
    });
  }),
  new Discount('10% Off on Electronics', cart => {
    cart.items.forEach(item => {
      if (item.product.category === 'Electronics') {
        item.product.price *= 0.9; // Apply discount
      }
    });
  })
];

function listDiscounts() {
  console.log('Available Discounts:');
  discounts.forEach((discount, index) => {
    console.log(`${index + 1}. ${discount.name}`);
  });
}

const currencyRates = {
  EUR: 0.85,
  GBP: 0.75
};

function convertCurrency(amount, currency) {
  return (amount * currencyRates[currency]).toFixed(2);
}

function checkout(cart) {
  console.log("Applying discounts...");
  discounts.forEach(discount => discount.apply(cart));

  let totalUSD = cart.getTotalPrice();
  console.log(`Final Total in USD: ${totalUSD.toFixed(2)} USD`);

  let convert = prompt("Would you like to view it in a different currency? (yes/no): ").toLowerCase();
  if (convert === 'yes') {
    console.log('Available Currencies: EUR, GBP');
    const currency = prompt('Enter currency: ').toUpperCase();
    if (currencyRates[currency]) {
      const convertedTotal = convertCurrency(totalUSD, currency);
      console.log(`Final Total in ${currency}: ${convertedTotal} ${currency}`);
    } else {
      console.log('Invalid currency.');
    }
  }
}

// Product Catalog
const productCatalog = [
  new Product('P001', 'Laptop', 1000.00, 'Electronics'),
  new Product('P002', 'Phone', 500.00, 'Electronics'),
  new Product('P003', 'T-Shirt', 20.00, 'Fashion')
];

const cart = new Cart();

function main() {
  while (true) {
    const command = prompt('Enter command: ').toLowerCase();
    const [action, productId, quantity] = command.split(' ');

    switch (action) {
      case 'add_to_cart':
        const product = productCatalog.find(p => p.id === productId.toUpperCase());
        if (product) {
          cart.addToCart(product, parseInt(quantity));
          console.log(`${quantity} ${product.name} added to the cart.`);
        } else {
          console.log('Product not found.');
        }
        break;
      
      case 'remove_from_cart':
        cart.removeFromCart(productId.toUpperCase(), parseInt(quantity));
        console.log(`${quantity || 'All'} of product with ID ${productId} removed.`);
        break;

      case 'view_cart':
        cart.viewCart();
        break;

      case 'list_discounts':
        listDiscounts();
        break;

      case 'checkout':
        checkout(cart);
        return;

      default:
        console.log('Unknown command.');
    }
  }
}

main();
