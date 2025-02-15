import { StorageManager } from "./storage.js";
import { ReportManager } from "./reports.js";

const storage = new StorageManager();
const reports = new ReportManager();

// Chart configurations
const chartConfigs = {
  topProducts: {
    type: 'bar',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Top Selling Products'
        }
      }
    }
  },
  salesTrend: {
    type: 'line',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Sales Trends'
        }
      }
    }
  },
  inventory: {
    type: 'pie',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Inventory Levels'
        }
      }
    }
  },
  revenue: {
    type: 'doughnut',
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Revenue Breakdown'
        }
      }
    }
  }
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  refreshInventoryTable();
  refreshSaleItems();
  setupEventListeners();
  reports.updateCharts();
});

function setupEventListeners() {
  document
    .getElementById("add-item-form")
    .addEventListener("submit", handleAddItem);
  document
    .getElementById("sale-form")
    .addEventListener("submit", handleAddToCart);
}

// Updated
function handleAddItem(e) {
  e.preventDefault();
  try {
    const name = document.getElementById("item-name").value;
    const price = parseFloat(document.getElementById("item-price").value);
    const quantity = parseInt(document.getElementById("item-quantity").value);

    validateItemInput(name, price, quantity);

    storage.addItem({ name, price, quantity });
    refreshInventoryTable();
    refreshSaleItems();
    e.target.reset();
  } catch (error) {
    alert(error.message);
  }
}

// Added
function validateItemInput(name, price, quantity) {
  if (!name || typeof name !== "string" || name.trim() === "") {
    throw new Error("Item name is required and must be a valid string.");
  }
  if (isNaN(price) || price <= 0) {
    throw new Error("Price must be a positive number.");
  }
  if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new Error("Quantity must be a positive integer.");
  }
}

// Added
function validateSaleInput(itemName, quantity, availableQuantity) {
  if (!itemName) {
    throw new Error("Please select an item.");
  }
  if (isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new Error("Quantity must be a positive integer.");
  }
  if (quantity > availableQuantity) {
    throw new Error("Insufficient stock for the selected item.");
  }
}

function refreshInventoryTable() {
  const items = storage.getItems();
  const tbody = document.getElementById("inventory-table");
  tbody.innerHTML = "";

  items.forEach((item) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>${item.quantity}</td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteItem('${
          item.name
        }')">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function refreshSaleItems() {
  const select = document.getElementById("sale-item");
  const items = storage.getItems();
  select.innerHTML = '<option value="">Select an item...</option>';

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.name;
    option.textContent = `${item.name} ($${item.price.toFixed(2)})`;
    select.appendChild(option);
  });
}

let currentCart = [];

// Updated
function handleAddToCart(e) {
  e.preventDefault();
  try {
    const itemName = document.getElementById("sale-item").value;
    const quantity = parseInt(document.getElementById("sale-quantity").value);
    const item = storage.getItems().find((i) => i.name === itemName);

    if (!item) {
      throw new Error("Selected item not found in inventory.");
    }

    validateSaleInput(itemName, quantity, item.quantity);

    currentCart.push({
      name: item.name,
      quantity,
      price: item.price,
      total: item.price * quantity,
    });

    updateCartDisplay();
    e.target.reset();
  } catch (error) {
    alert(error.message);
  }
}

function updateCartDisplay() {
  const tbody = document.getElementById("cart-items");
  const totalElement = document.getElementById("cart-total");
  tbody.innerHTML = "";

  let total = 0;
  currentCart.forEach((item) => {
    total += item.total;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>$${item.price.toFixed(2)}</td>
      <td>$${item.total.toFixed(2)}</td>
    `;
    tbody.appendChild(tr);
  });

  totalElement.textContent = `$${total.toFixed(2)}`;
}

// Updated
window.completeSale = function () {
  try {
    if (currentCart.length === 0) {
      throw new Error("Cart is empty. Add items to complete the sale.");
    }

    // Update inventory
    currentCart.forEach((item) => {
      storage.updateItemQuantity(item.name, -item.quantity);
    });

    // Record sale
    const sale = {
      items: currentCart,
      total: currentCart.reduce((sum, item) => sum + item.total, 0),
      timestamp: new Date().toISOString(),
    };

    storage.recordSale(sale);
    currentCart = [];
    updateCartDisplay();
    refreshInventoryTable(); // Call this function to update the inventory table
    reports.updateCharts(); // Call this function to update the inventory charts
    // Show receipt modal immediately
    showReceipt(sale);
    printReceipt();
  } catch (error) {
    alert(error.message);
  }
};

window.showReceipt = function (sale) {
  const receiptContent = document.getElementById("receipt-content");
  const date = new Date(sale.timestamp);

  let receipt = `
    STORE RECEIPT
    ${date.toLocaleDateString()} ${date.toLocaleTimeString()}
    ------------------------------
    
    Items:
  `;

  sale.items.forEach((item) => {
    receipt += `
    ${item.name}
    ${item.quantity} x $${item.price.toFixed(2)} = $${item.total.toFixed(2)}`;
  });

  receipt += `
    ------------------------------
    Total: $${sale.total.toFixed(2)}
    
    Thank you for your purchase!
  `;

  receiptContent.innerHTML = receipt;
  
  // Initialize modal if not already initialized
  const receiptModal = new bootstrap.Modal(document.getElementById("receiptModal"), {
    backdrop: 'static',
    keyboard: false
  });
  
  // Show modal and handle shown event
  receiptModal.show();
  document.getElementById("receiptModal").addEventListener('shown.bs.modal', function () {
    // Focus on print button for better accessibility
    document.querySelector("#receiptModal .btn-primary").focus();
  });
};

window.printReceipt = function () {
  window.print();
};

window.deleteItem = function (itemName) {
  if (confirm("Are you sure you want to delete this item?")) {
    storage.deleteItem(itemName);
    refreshInventoryTable();
    refreshSaleItems();
  }
};

// Navigation functions
window.showInventory = function () {
  document.getElementById("inventory-section").style.display = "block";
  document.getElementById("sales-section").style.display = "none";
  document.getElementById("reports-section").style.display = "none";
};

window.showSales = function () {
  document.getElementById("inventory-section").style.display = "none";
  document.getElementById("sales-section").style.display = "block";
  document.getElementById("reports-section").style.display = "none";
};

window.showReports = function () {
  document.getElementById("inventory-section").style.display = "none";
  document.getElementById("sales-section").style.display = "none";
  document.getElementById("reports-section").style.display = "block";
  
  // Initialize all charts
  initCharts();
  reports.updateCharts();
};

function initCharts() {
  // Initialize Top Products Chart
  const topProductsCtx = document.getElementById('topProductsChart').getContext('2d');
  new Chart(topProductsCtx, {
    type: chartConfigs.topProducts.type,
    data: {
      labels: [],
      datasets: [{
        label: 'Quantity Sold',
        data: [],
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: chartConfigs.topProducts.options
  });

  // Initialize Sales Trend Chart
  const salesTrendCtx = document.getElementById('salesTrendChart').getContext('2d');
  new Chart(salesTrendCtx, {
    type: chartConfigs.salesTrend.type,
    data: {
      labels: [],
      datasets: [{
        label: 'Sales',
        data: [],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    },
    options: chartConfigs.salesTrend.options
  });

  // Initialize Inventory Chart
  const inventoryCtx = document.getElementById('inventoryChart').getContext('2d');
  new Chart(inventoryCtx, {
    type: chartConfigs.inventory.type,
    data: {
      labels: [],
      datasets: [{
        label: 'Inventory',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: chartConfigs.inventory.options
  });

  // Initialize Revenue Chart
  const revenueCtx = document.getElementById('revenueChart').getContext('2d');
  new Chart(revenueCtx, {
    type: chartConfigs.revenue.type,
    data: {
      labels: [],
      datasets: [{
        label: 'Revenue',
        data: [],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }]
    },
    options: chartConfigs.revenue.options
  });
}
