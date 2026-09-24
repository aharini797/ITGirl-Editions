import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import {
    firebaseConfig
} from "../firebase-config.js";


// ========================================
// FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ========================================
// CLOUDINARY
// ========================================

const CLOUDINARY_CLOUD_NAME = "ft80xg8n";

const CLOUDINARY_UPLOAD_PRESET = "ml_default";


// ========================================
// HTML ELEMENTS
// ========================================

const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const loginMessage =
    document.getElementById("loginMessage");

const logoutBtn =
    document.getElementById("logoutBtn");

const categoryForm =
    document.getElementById("categoryForm");

const categoryNameInput =
    document.getElementById("categoryName");

const categoryList =
    document.getElementById("categoryList");

const productForm =
    document.getElementById("productForm");

const productNameInput =
    document.getElementById("productName");

const productPriceInput =
    document.getElementById("productPrice");

const discountPriceInput =
    document.getElementById("discountPrice");

const productDescriptionInput =
    document.getElementById("productDescription");

const productCategoryInput =
    document.getElementById("productCategory");

const productStockInput =
    document.getElementById("productStock");

const newArrivalInput =
    document.getElementById("newArrival");

const offerInput =
    document.getElementById("offer");

const productImageInput =
    document.getElementById("productImage");

const uploadStatus =
    document.getElementById("uploadStatus");

const productList =
    document.getElementById("productList");

const productCount =
    document.getElementById("productCount");

const categoryCount =
    document.getElementById("categoryCount");


// ========================================
// VARIABLES
// ========================================

let categories = [];

let products = [];

let editingCategoryId = null;

let editingProductId = null;

let editingProductImageUrl = "";


// ========================================
// LOGIN
// ========================================

loginForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;

        loginMessage.textContent =
            "Logging in...";

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            loginMessage.textContent = "";

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginMessage.textContent =
                getLoginErrorMessage(
                    error.code
                );
        }
    }
);


// ========================================
// LOGIN ERROR MESSAGE
// ========================================

function getLoginErrorMessage(
    errorCode
) {

    switch (errorCode) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/invalid-email":
            return "Please enter a valid email.";

        case "auth/too-many-requests":
            return "Too many attempts. Please try again later.";

        case "auth/user-disabled":
            return "This admin account is disabled.";

        default:
            return "Login failed. Please try again.";
    }
}


// ========================================
// AUTH STATE
// ========================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            loginSection?.classList.add(
                "hidden"
            );

            dashboardSection?.classList.remove(
                "hidden"
            );

            await loadCategories();

            await loadProducts();

        } else {

            loginSection?.classList.remove(
                "hidden"
            );

            dashboardSection?.classList.add(
                "hidden"
            );
        }
    }
);


// ========================================
// LOGOUT
// ========================================

logoutBtn?.addEventListener(
    "click",
    async () => {

        try {

            await signOut(auth);

        } catch (error) {

            console.error(
                "Logout error:",
                error
            );
        }
    }
);


// ========================================
// LOAD CATEGORIES
// ========================================

async function loadCategories() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "categories"
                )
            );

        categories = [];

        snapshot.forEach(
            (categoryDoc) => {

                categories.push({

                    id: categoryDoc.id,

                    ...categoryDoc.data()
                });
            }
        );

        displayCategories();

        updateCategorySelect();

        updateCounts();

    } catch (error) {

        console.error(
            "Category loading error:",
            error
        );

        showError(
            "Unable to load categories."
        );
    }
}


// ========================================
// ADD / EDIT CATEGORY
// ========================================

categoryForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            categoryNameInput.value.trim();

        if (!name) {

            alert(
                "Please enter category name."
            );

            return;
        }

        try {

            if (editingCategoryId) {

                await updateDoc(
                    doc(
                        db,
                        "categories",
                        editingCategoryId
                    ),
                    {
                        name: name,
                        updatedAt:
                            serverTimestamp()
                    }
                );

                alert(
                    "Category updated successfully!"
                );

            } else {

                await addDoc(
                    collection(
                        db,
                        "categories"
                    ),
                    {
                        name: name,
                        createdAt:
                            serverTimestamp()
                    }
                );

                alert(
                    "Category added successfully!"
                );
            }

            editingCategoryId = null;

            categoryForm.reset();

            const button =
                categoryForm.querySelector(
                    "button"
                );

            if (button) {

                button.textContent =
                    "Add Category";
            }

            await loadCategories();

        } catch (error) {

            console.error(
                "Category save error:",
                error
            );

            alert(
                "Unable to save category."
            );
        }
    }
);


// ========================================
// DISPLAY CATEGORIES
// ========================================

function displayCategories() {

    if (!categoryList) return;

    categoryList.innerHTML = "";

    if (categories.length === 0) {

        categoryList.innerHTML = `
            <p>
                No categories added yet.
            </p>
        `;

        return;
    }

    categories.forEach(
        (category) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "category-item";

            item.innerHTML = `

                <span class="category-name">
                    ${escapeHTML(
                        category.name
                    )}
                </span>

                <div class="category-actions">

                    <button
                        type="button"
                        class="edit-btn"
                        data-edit-category="${category.id}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="delete-btn"
                        data-delete-category="${category.id}"
                    >
                        Delete
                    </button>

                </div>
            `;

            categoryList.appendChild(
                item
            );
        }
    );


    categoryList
        .querySelectorAll(
            "[data-edit-category]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editCategory(
                            button.dataset.editCategory
                        );
                    }
                );
            }
        );


    categoryList
        .querySelectorAll(
            "[data-delete-category]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteCategory(
                            button.dataset.deleteCategory
                        );
                    }
                );
            }
        );
}


// ========================================
// EDIT CATEGORY
// ========================================

function editCategory(
    categoryId
) {

    const category =
        categories.find(
            (item) =>
                item.id ===
                categoryId
        );

    if (!category) return;

    editingCategoryId =
        categoryId;

    categoryNameInput.value =
        category.name;

    const button =
        categoryForm.querySelector(
            "button"
        );

    if (button) {

        button.textContent =
            "Update Category";
    }

    categoryNameInput.focus();
}


// ========================================
// DELETE CATEGORY
// ========================================

async function deleteCategory(
    categoryId
) {

    const category =
        categories.find(
            (item) =>
                item.id ===
                categoryId
        );

    if (!category) return;

    const confirmed =
        confirm(
            `Delete "${category.name}" category?`
        );

    if (!confirmed) return;

    try {

        await deleteDoc(
            doc(
                db,
                "categories",
                categoryId
            )
        );

        alert(
            "Category deleted successfully!"
        );

        await loadCategories();

    } catch (error) {

        console.error(
            "Category delete error:",
            error
        );

        alert(
            "Unable to delete category."
        );
    }
}


// ========================================
// CATEGORY SELECT
// ========================================

function updateCategorySelect() {

    if (!productCategoryInput)
        return;

    productCategoryInput.innerHTML = `
        <option value="">
            Select Category
        </option>
    `;

    categories.forEach(
        (category) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category.id;

            option.textContent =
                category.name;

            productCategoryInput.appendChild(
                option
            );
        }
    );
}


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(
                    db,
                    "products"
                )
            );

        products = [];

        snapshot.forEach(
            (productDoc) => {

                products.push({

                    id: productDoc.id,

                    ...productDoc.data()
                });
            }
        );

        displayProducts();

        updateCounts();

    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        showError(
            "Unable to load products."
        );
    }
}


// ========================================
// PRODUCT FORM
// ========================================

productForm?.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const name =
            productNameInput.value.trim();

        const price =
            Number(
                productPriceInput.value
            );

        const discountPrice =
            Number(
                discountPriceInput.value ||
                0
            );

        const description =
            productDescriptionInput.value.trim();

        const categoryId =
            productCategoryInput.value;

        const stock =
            Number(
                productStockInput.value
            );

        const newArrival =
            newArrivalInput.checked;

        const offer =
            offerInput.checked;

        const imageFile =
            productImageInput.files[0];


        if (!name) {

            alert(
                "Please enter product name."
            );

            return;
        }


        if (
            !Number.isFinite(price) ||
            price < 0
        ) {

            alert(
                "Please enter a valid price."
            );

            return;
        }


        if (!categoryId) {

            alert(
                "Please select a category."
            );

            return;
        }


        if (
            !Number.isFinite(stock) ||
            stock < 0
        ) {

            alert(
                "Please enter valid stock."
            );

            return;
        }


        if (
            discountPrice > 0 &&
            discountPrice >= price
        ) {

            alert(
                "Discount price should be lower than original price."
            );

            return;
        }


        try {

            let imageUrl =
                editingProductImageUrl;


            // Upload new image
            if (imageFile) {

                uploadStatus.textContent =
                    "Uploading image...";

                imageUrl =
                    await uploadImageToCloudinary(
                        imageFile
                    );

                uploadStatus.textContent =
                    "Image uploaded successfully.";
            }


            // New product requires image
            if (
                !editingProductId &&
                !imageUrl
            ) {

                alert(
                    "Please select a product image."
                );

                return;
            }


            const category =
                categories.find(
                    (item) =>
                        item.id ===
                        categoryId
                );


            const productData = {

                name: name,

                price: price,

                discountPrice:
                    discountPrice,

                description:
                    description,

                categoryId:
                    categoryId,

                categoryName:
                    category
                        ? category.name
                        : "Accessories",

                stock: stock,

                newArrival:
                    newArrival,

                offer:
                    offer,

                imageUrl:
                    imageUrl
            };


            if (editingProductId) {

                productData.updatedAt =
                    serverTimestamp();


                await updateDoc(
                    doc(
                        db,
                        "products",
                        editingProductId
                    ),
                    productData
                );


                alert(
                    "Product updated successfully!"
                );

            } else {

                productData.createdAt =
                    serverTimestamp();


                await addDoc(
                    collection(
                        db,
                        "products"
                    ),
                    productData
                );


                alert(
                    "Product added successfully!"
                );
            }


            resetProductForm();

            await loadProducts();

        } catch (error) {

            console.error(
                "Product save error:",
                error
            );

            uploadStatus.textContent =
                "";

            alert(
                "Unable to save product. Please try again."
            );
        }
    }
);


// ========================================
// CLOUDINARY IMAGE UPLOAD
// ========================================

async function uploadImageToCloudinary(
    file
) {

    const url =
        `https://api.cloudinary.com/v1_1/` +
        `${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const formData =
        new FormData();


    formData.append(
        "file",
        file
    );


    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const response =
        await fetch(
            url,
            {
                method: "POST",
                body: formData
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "Cloudinary error:",
            data
        );

        throw new Error(
            data.error?.message ||
            "Cloudinary upload failed."
        );
    }


    return data.secure_url;
}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts() {

    if (!productList) return;

    productList.innerHTML = "";


    if (products.length === 0) {

        productList.innerHTML = `
            <p>
                No products added yet.
            </p>
        `;

        return;
    }


    products.forEach(
        (product) => {

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "admin-product-card";


            const price =
                Number(
                    product.price ||
                    0
                );


            const discountPrice =
                Number(
                    product.discountPrice ||
                    0
                );


            const finalPrice =
                discountPrice > 0 &&
                discountPrice < price
                    ? discountPrice
                    : price;


            card.innerHTML = `

                <img
                    src="${escapeHTML(
                        product.imageUrl ||
                        "https://via.placeholder.com/500x500?text=Product"
                    )}"
                    alt="${escapeHTML(
                        product.name ||
                        "Product"
                    )}"
                >


                <div class="admin-product-info">

                    <h3>
                        ${escapeHTML(
                            product.name ||
                            "Product"
                        )}
                    </h3>


                    <p>
                        Category:
                        ${escapeHTML(
                            product.categoryName ||
                            "Accessories"
                        )}
                    </p>


                    <p>
                        Stock:
                        ${Number(
                            product.stock ||
                            0
                        )}
                    </p>


                    <div class="admin-product-price">

                        ₹${finalPrice}

                        ${
                            discountPrice > 0 &&
                            discountPrice < price
                                ? `
                                    <span
                                        style="
                                            text-decoration:line-through;
                                            color:#806c70;
                                            font-size:13px;
                                            margin-left:6px;
                                        "
                                    >
                                        ₹${price}
                                    </span>
                                `
                                : ""
                        }

                    </div>


                    ${
                        product.newArrival
                            ? `
                                <p>
                                    ✨ New Arrival
                                </p>
                            `
                            : ""
                    }


                    ${
                        product.offer
                            ? `
                                <p>
                                    🏷️ Offer
                                </p>
                            `
                            : ""
                    }


                    <div
                        class="admin-product-actions"
                    >

                        <button
                            type="button"
                            class="edit-btn"
                            data-edit-product="${product.id}"
                        >
                            Edit
                        </button>


                        <button
                            type="button"
                            class="delete-btn"
                            data-delete-product="${product.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;


            productList.appendChild(
                card
            );
        }
    );


    productList
        .querySelectorAll(
            "[data-edit-product]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        editProduct(
                            button.dataset.editProduct
                        );
                    }
                );
            }
        );


    productList
        .querySelectorAll(
            "[data-delete-product]"
        )
        .forEach(
            (button) => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteProduct(
                            button.dataset.deleteProduct
                        );
                    }
                );
            }
        );
}


// ========================================
// EDIT PRODUCT
// ========================================

function editProduct(
    productId
) {

    const product =
        products.find(
            (item) =>
                item.id ===
                productId
        );


    if (!product) return;


    editingProductId =
        productId;


    editingProductImageUrl =
        product.imageUrl ||
        "";


    productNameInput.value =
        product.name ||
        "";


    productPriceInput.value =
        product.price ||
        "";


    discountPriceInput.value =
        product.discountPrice ||
        "";


    productDescriptionInput.value =
        product.description ||
        "";


    productCategoryInput.value =
        product.categoryId ||
        "";


    productStockInput.value =
        product.stock ||
        0;


    newArrivalInput.checked =
        product.newArrival ===
        true;


    offerInput.checked =
        product.offer ===
        true;


    productImageInput.required =
        false;


    uploadStatus.textContent =
        "Current image will be kept if you don't select a new image.";


    const button =
        productForm.querySelector(
            "button[type='submit']"
        );


    if (button) {

        button.textContent =
            "Update Product";
    }


    productForm.scrollIntoView({
        behavior: "smooth"
    });
}


// ========================================
// DELETE PRODUCT
// ========================================

async function deleteProduct(
    productId
) {

    const product =
        products.find(
            (item) =>
                item.id ===
                productId
        );


    if (!product) return;


    const confirmed =
        confirm(
            `Delete "${product.name}"?`
        );


    if (!confirmed) return;


    try {

        await deleteDoc(
            doc(
                db,
                "products",
                productId
            )
        );


        alert(
            "Product deleted successfully!"
        );


        await loadProducts();

    } catch (error) {

        console.error(
            "Product delete error:",
            error
        );

        alert(
            "Unable to delete product."
        );
    }
}


// ========================================
// RESET PRODUCT FORM
// ========================================

function resetProductForm() {

    editingProductId =
        null;

    editingProductImageUrl =
        "";

    productForm.reset();

    productImageInput.required =
        true;

    uploadStatus.textContent =
        "";

    const button =
        productForm.querySelector(
            "button[type='submit']"
        );


    if (button) {

        button.textContent =
            "Add Product";
    }
}


// ========================================
// UPDATE COUNTS
// ========================================

function updateCounts() {

    if (productCount) {

        productCount.textContent =
            products.length;
    }


    if (categoryCount) {

        categoryCount.textContent =
            categories.length;
    }
}


// ========================================
// ERROR MESSAGE
// ========================================

function showError(
    message
) {

    console.error(
        message
    );
}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}
