
// Import required modules
const fs = require("fs");
const prompt = require("prompt-sync")();

// Read and parse the product data from db.json
let productData;
try {
  const rawData = fs.readFileSync("db.json");
  const jsonData = JSON.parse(rawData);
  productData = jsonData.products.reduce((acc, product) => {
    acc[product.id.toLowerCase()] = product.price; // Store product prices in an object
    return acc;
  }, {});
} catch (error) {
  console.error("Error reading db.json:", error);
  process.exit(1);
}

// Shopping cart object to store items
const shoppingCart = {
  items: [],

  // Method to add a product to the cart
  addProduct: function (productName, quantity) {
    const price = productData[productName.toLowerCase()];
    if (price) {
      // Check if product already exists in the cart
      const existingProduct = this.items.find(
        (item) => item.name === productName
      );
      if (existingProduct) {
        // Update quantity if product exists
        existingProduct.quantity += quantity;
      } else {
        // Add new product to the cart
        this.items.push({ name: productName, quantity, price });
      }
    } else {
      console.log(`Product "${productName}" not found.`);
    }
  },

  // Method to calculate the cart state
  calculateCartState: function () {
    const subtotal = this.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = Math.ceil(subtotal * 0.125 * 100) / 100; // 12.5% tax, rounded up
    const total = Math.ceil((subtotal + tax) * 100) / 100; // Total payable, rounded up
    return { subtotal, tax, total };
  },

  // Method to display the cart contents and state
  displayCart: function () {
    console.log("\nCart Contents:");
    this.items.forEach((item) => {
      console.log(`${item.quantity} x ${item.name} @ $${item.price} each`);
    });
    const { subtotal, tax, total } = this.calculateCartState();
    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    console.log(`Tax: $${tax.toFixed(2)}`);
    console.log(`Total: $${total.toFixed(2)}\n`);
  },
};

// Function to handle user input
function main() {
  while (true) {
    const productName = prompt('Enter product name (or type "exit" to finish): ');
    if (productName.toLowerCase() === "exit") break;
    const quantity = parseInt(prompt("Enter quantity: "), 10);
    if (isNaN(quantity) || quantity <= 0) {
      console.log("Please enter a valid quantity.");
      continue;
    }
    shoppingCart.addProduct(productName, quantity);
    shoppingCart.displayCart();
  }
  console.log("Thank you for shopping!");
}

// Run the main function
main();

