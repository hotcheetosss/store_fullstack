const API_URL = "http://localhost:5000/api";


async function loadProducts() {
    try {
        console.log("Загрузка товаров...");
        const response = await fetch(`${API_URL}/products`);
        
        if (!response.ok) throw new Error(`Ошибка загрузки: ${response.statusText}`);

        const products = await response.json();
        console.log("Полученные товары:", products);

        const productList = document.getElementById("productList");
        if (!productList) {
            console.error("Элемент #productList не найден!");
            return;
        }

        productList.innerHTML = ""; 

        if (products.length === 0) {
            productList.innerHTML = "<p>Нет товаров</p>";
        } else {
            products.forEach(product => {
                const div = document.createElement("div");
                div.innerHTML = `
                    <h3>${product.name}</h3>
                    <p><strong>Описание:</strong> ${product.description}</p>
                    <p><strong>Цена:</strong> ${product.price} ₸</p>
                    <p><strong>В наличии:</strong> ${product.stock}</p>
                `;
                productList.appendChild(div);
            });
        }

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        alert("Ошибка загрузки товаров!");
    }
}


document.addEventListener("DOMContentLoaded", () => {
    loadProducts();
});




document.getElementById("searchProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    const productId = document.getElementById("searchProductId").value.trim(); 

    if (!productId) {
        alert("Введите ID товара!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);

        if (!response.ok) {
            throw new Error("Товар не найден!");
        }

        const product = await response.json();
        console.log("Полученный товар:", product); 

        
        document.getElementById("productName").textContent = product.name;
        document.getElementById("productDescription").textContent = product.description;
        document.getElementById("productPrice").textContent = `${product.price} ₸`;
        document.getElementById("productStock").textContent = product.stock;

       
        document.getElementById("orderProductId").value = product._id;

        console.log("Данные о товаре загружены, показываем блок");

        
        document.getElementById("productInfo").style.display = "block";

      
        document.getElementById("orderForm").style.display = "block";

    } catch (error) {
        alert(error.message);
        console.log("Ошибка:", error);

     
        document.getElementById("productInfo").style.display = "none";
        document.getElementById("orderForm").style.display = "none";
    }
});





document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userRole", data.user.role);

        console.log("Роль пользователя:", data.user.role); 

        window.location.href = "index.html"; 
    } else {
        alert("Ошибка входа: " + data.message);
    }
});


document.addEventListener("DOMContentLoaded", () => {
    const userName = localStorage.getItem("userName");
    const userRole = localStorage.getItem("userRole"); 
    const token = localStorage.getItem("token");

    const userNameDisplay = document.getElementById("userNameDisplay");
    const logoutButton = document.getElementById("logoutButton");
    const adminPanel = document.getElementById("adminPanel");

    if (token && userName && userNameDisplay) {
        userNameDisplay.textContent = `Привет, ${userName}!`;
        userNameDisplay.style.display = "block";
    }

    if (logoutButton) logoutButton.style.display = "block";
});



document.getElementById("logoutButton")?.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("userRole");
    window.location.reload(); 
});



document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", name);
        localStorage.setItem("userRole", data.user.role);
        window.location.href = "index.html"; 
    } else {
        alert("Ошибка регистрации: " + data.message);
    }
});


function editProduct(id, name, description, price, category, stock, images) {
    document.getElementById("editProductId").value = id;
    document.getElementById("editProductName").value = name;
    document.getElementById("editProductDescription").value = description;
    document.getElementById("editProductPrice").value = price;
    document.getElementById("editProductCategory").value = category;
    document.getElementById("editProductStock").value = stock;
    document.getElementById("editProductImages").value = images;

    document.getElementById("editProductForm").style.display = "block";
}
document.getElementById("addProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Ошибка: Вы не авторизованы!");
        return;
    }

    const name = document.getElementById("productName").value;
    const description = document.getElementById("productDescription").value;
    const price = document.getElementById("productPrice").value;
    const category = document.getElementById("productCategory").value;
    const stock = document.getElementById("productStock").value;
    const images = document.getElementById("productImages").value.split(',');

    try {
        const response = await fetch(`${API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ name, description, price, category, stock, images })
        });

        if (!response.ok) throw new Error(`Ошибка добавления товара: ${response.statusText}`);

        alert("Товар успешно добавлен!");
        document.getElementById("addProductForm").reset(); 
        loadProductsForAdmin();
    } catch (error) {
        console.error(error);
        alert("Ошибка при добавлении товара.");
    }
});





async function loadProductsForAdmin() {
    try {
        const response = await fetch(`${API_URL}/products`, {
            headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
        });

        if (!response.ok) throw new Error(`Ошибка загрузки товаров: ${response.statusText}`);

        const products = await response.json();
        const productList = document.getElementById("productList");
        if (!productList) return console.error("productList не найден!");

        productList.innerHTML = ""; 

        products.forEach(product => {
            const div = document.createElement("div");
            div.innerHTML = `
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Цена: ${product.price}₸</p>
                <button onclick="editProduct('${product._id}', '${product.name}', '${product.description}', '${product.price}', '${product.category}', '${product.stock}', '${product.images}')">Редактировать</button>
                <button onclick="deleteProduct('${product._id}')">Удалить</button>
            `;
            productList.appendChild(div);
        });

    } catch (error) {
        console.error(error);
        alert("Ошибка загрузки товаров!");
    }
}
document.getElementById("editProductForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Ошибка: Вы не авторизованы!");
        return;
    }

    const id = document.getElementById("editProductId").value;
    if (!id) {
        alert("Ошибка: ID товара отсутствует!");
        return;
    }

    const name = document.getElementById("editProductName").value;
    const description = document.getElementById("editProductDescription").value;
    const price = document.getElementById("editProductPrice").value;
    const category = document.getElementById("editProductCategory").value;
    const stock = document.getElementById("editProductStock").value;
    const images = document.getElementById("editProductImages").value.split(',');

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ name, description, price, category, stock, images })
        });

        if (!response.ok) throw new Error(`Ошибка обновления: ${response.statusText}`);

        alert("Товар обновлён!");
        document.getElementById("editProductForm").style.display = "none";
        loadProductsForAdmin();
    } catch (error) {
        console.error(error);
        alert("Ошибка при обновлении товара.");
    }
});
async function deleteProduct(id) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Ошибка: Вы не авторизованы!");
        return;
    }

    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error(`Ошибка удаления товара: ${response.statusText}`);

        alert("Товар удалён!");
        loadProductsForAdmin();
    } catch (error) {
        console.error(error);
        alert("Ошибка при удалении товара.");
    }
}


if (document.getElementById("productList")) {
    loadProductsForAdmin();
}
