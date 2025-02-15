export class StorageManager {
  constructor() {
    this.initializeStorage();
  }

  // Updated
  initializeStorage() {
    try {
      if (!localStorage.getItem("inventory")) {
        localStorage.setItem("inventory", JSON.stringify([]));
      }
      if (!localStorage.getItem("sales")) {
        localStorage.setItem("sales", JSON.stringify([]));
      }
    } catch (error) {
      console.error("Error initializing local storage:", error);
      alert("Failed to initialize storage. Please refresh the page.");
    }
  }

  getItems() {
    return JSON.parse(localStorage.getItem("inventory"));
  }

  addItem(item) {
    const items = this.getItems();
    const existingItem = items.find((i) => i.name === item.name);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      existingItem.price = item.price;
    } else {
      items.push(item);
    }

    localStorage.setItem("inventory", JSON.stringify(items));
  }

  updateItemQuantity(itemName, change) {
    const items = this.getItems();
    const item = items.find((i) => i.name === itemName);
    if (item) {
      item.quantity += change;
      localStorage.setItem("inventory", JSON.stringify(items));
    }
  }

  deleteItem(itemName) {
    const items = this.getItems();
    const filteredItems = items.filter((i) => i.name !== itemName);
    localStorage.setItem("inventory", JSON.stringify(filteredItems));
  }

  getSales() {
    return JSON.parse(localStorage.getItem("sales"));
  }

  recordSale(sale) {
    const sales = this.getSales();
    sales.push(sale);
    localStorage.setItem("sales", JSON.stringify(sales));
  }
}
