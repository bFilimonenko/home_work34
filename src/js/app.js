import { categories } from "@js/data";
import { generateSliderLayout, initializeSlider } from "@js/slider";
import "../css/style.css";
import Swal from "sweetalert2";

let selectedProduct;
let order = [];
document.addEventListener("DOMContentLoaded", () => {
  showCategories();
});

document.querySelector(".categories").addEventListener("click", (event) => {
  if (
    event.target.tagName === "DIV" &&
    event.target.classList.contains("category")
  ) {
    document.querySelector(".product_info").innerHTML = "";

    const categoryId = event.target.getAttribute("data-id");

    document.querySelector(".products").setAttribute("data-category-id", categoryId);

    showProductsByCategory(categoryId);
  }
});

document.querySelector(".products").addEventListener("click", (event) => {
  if (
    event.target.tagName === "DIV" &&
    event.target.classList.contains("product")
  ) {
    const selectedCategoryId = event.target.parentNode.getAttribute("data-category-id");
    const productId = event.target.getAttribute("data-id");

    const selectedCategory = categories.find(category => category.id === selectedCategoryId);

    selectedProduct = selectedCategory.items.find(item => item.id === productId);
    showProductInfo(selectedProduct);
  }
});

document.querySelector(".order-btn").addEventListener("click", showOrderForm);

document.querySelector(".background").addEventListener("click", () => {
  document.querySelector(".order_form").classList.add("hidden");
  document.querySelector(".background").classList.add("hidden");
});

function showCategories() {
  showEntities(".categories", "category", categories);
}

function showProductsByCategory(categoryId) {
  const myCategory = categories.find((category) => category.id === categoryId);
  const products = myCategory.items;
  showEntities(".products", "product", products);
}

//Output of objects to the page
function showEntities(
  parentSelector,
  elementClassName,
  entities
) {
  const parentElement = document.querySelector(parentSelector);
  parentElement.innerHTML = "";

  for (let entity of entities) {
    const element = document.createElement("div");
    // element.textContent = entity.name;
    element.classList.add(elementClassName);
    element.setAttribute("data-id", entity.id);
    element.innerHTML = `<h2>${entity.name}</h2>`;

    parentElement.appendChild(element);
  }
}

function addProductToOrder(selectedProduct, quantity) {
  const existingProduct = order.find(item => item.product === selectedProduct.name);

  if (existingProduct) {
    existingProduct.amount += quantity;
  } else {
    order.push({
      product: selectedProduct.name,
      price: selectedProduct.price,
      amount: quantity
    });
  }

  //add product to html
}

function initializeReceipt() {
  const receipt = document.querySelector(".receipt");

  order.forEach(product => {
    const item = document.createElement("div");
    item.innerHTML = `
    <h3>${product.product}</h3>
    <p>$ ${product.price}</p>
    <span>${product.amount}</span>
    `;

    receipt.appendChild(item);
  });
}

function autocalculation(order) {
  const result = order.reduce((accumulator, currentValue) => accumulator + (currentValue.price * currentValue.amount),
    0);
  document.getElementById("autocalculation").textContent = `$${result}`;
}

function showProductInfo(product) {
  if (!product) {
    return;
  }

  const parent = document.querySelector(".product_info");

  parent.innerHTML = `
    <div class="product_info_list">
    <h2>${product.name}</h2>
    <p>$${product.price}</p>
    <p>${product.description}</p>
    <div class="wrapper">
    <span class="minus">-</span>
    <span class="num">1</span>
    <span class="plus">+</span>
    </div>
    <button type="button">Придбати</button>
    </div>
  `;

  parent.innerHTML += generateSliderLayout();
  initializeSlider(product.images);

  //Product quantity
  let quantity = 1;

  document.querySelector(".plus").addEventListener("click", () => {
    document.querySelector(".num").innerText = ++quantity;
  });
  document.querySelector(".minus").addEventListener("click", () => {
    if (quantity > 1) {
      document.querySelector(".num").innerText = --quantity;
    }
  });

  const buyBtn = document.querySelector(".product_info .product_info_list button");
  buyBtn.addEventListener("click", () => {

    const label = document.querySelector(".amount");
    const digit = parseInt(label.textContent);
    label.innerHTML = `${digit + quantity}`;

    addProductToOrder(selectedProduct, quantity);
  });
}

async function showOrderForm() {
  initializeReceipt();
  autocalculation(order);

  document.querySelector(".order_form").classList.remove("hidden");
  document.querySelector(".background").classList.remove("hidden");
}

document.querySelector("#finishOrder").addEventListener("click", () => {

  if (order.length === 0) {
    showWarningNotification("Your cart is empty");
    return;
  }

  if (dataCollection()) {
    showSuccessNotification();
  } else {
    showWarningNotification("Please fill in all fields correctly");
  }
});

function dataCollection() {
  const name = document.forms.order.name.value.trim();
  const phone = document.forms.order.phone.value.trim();

  //Validation
  const namePattern = /^[A-Za-zА-Яа-яЁёІіЇїЄє]{2,25} ?[A-Za-zА-Яа-яЁёІіЇїЄє]{2,25}?$/;
  const phonePattern = /^\+?3?8?(0[\s-]?\d{2}[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2})$/;
  if (
    !name || !namePattern.test(name) ||
    !phone || !phonePattern.test(phone) ||
    isNaN(parseInt(phone)) ||
    phone.length < 13) {
    return false;
  }

  //Saving data
  const clientData = {
    name: name,
    phone: phone
  };
  localStorage.setItem("clientData", JSON.stringify(clientData));

  return true;
}

function showWarningNotification(message) {
  Swal.fire({
    position: "center",
    icon: "warning",
    title: `${message}`,
    showConfirmButton: false,
    timer: 2500
  });
}

function showSuccessNotification() {
  Swal.fire({
    position: "center",
    icon: "success",
    title: "Congrats! You bought product",
    showConfirmButton: false,
    timer: 3000
  });

  setTimeout(() => {
    document.querySelector(".order_form").classList.add("hidden");
    document.querySelector(".background").classList.add("hidden");
  }, 3000);
}

