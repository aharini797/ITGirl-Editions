import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";


// ========================================
// FIREBASE SETUP
// ========================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ========================================
// IT GIRL EDITIONS WHATSAPP NUMBER
// ========================================

const WHATSAPP_NUMBER = "917904268967";


// ========================================
// WEBSITE DATA
// ========================================

let products = [];
let categories = [];

let cart =
    JSON.parse(localStorage.getItem("itGirlCart")) || [];

let wishlist =
    JSON.parse(localStorage.getItem("itGirlWishlist")) || [];

let currentFilter = "all";


// ========================================
// HTML ELEMENTS
// ========================================

const productContainer =
    document.getElementById("productContainer");

const categoryContainer =
    document.getElementById("categoryContainer");

const offerContainer =
    document.getElementById("offerContainer");

const searchInput =
    document.getElementById("searchInput");

const cartCount =
    document.getElementById("cartCount");

const cartSidebar =
    document.getElementById("cartSidebar");

const wishlistSidebar =
    document.getElementById("wishlistSidebar");

const overlay =
    document.getElementById("overlay");

const cartItems =
    document.getElementById("cartItems");

const wishlistItems =
    document.getElementById("wishlistItems");

const cartTotal =
    document.getElementById("cartTotal");


// ========================================
// PRODUCT DETAILS MODAL ELEMENTS
// ========================================

const productDetailsModal =
    document.getElementById("productDetailsModal");

const closeProductDetails =
    document.getElementById("closeProductDetails");

const detailsProductImage =
    document.getElementById("detailsProductImage");

const detailsProductCategory =
    document.getElementById("detailsProductCategory");

const detailsProductName =
    document.getElementById("detailsProductName");

const detailsProductPrice =
    document.getElementById("detailsProductPrice");

const detailsOriginalPrice =
    document.getElementById("detailsOriginalPrice");

const detailsProductDescription =
    document.getElementById("detailsProductDescription");

const detailsProductStock =
    document.getElementById("detailsProductStock");

const detailsAddToCart =
    document.getElementById("detailsAddToCart");

const detailsWishlistBtn =
    document.getElementById("detailsWishlistBtn");

const detailsWhatsappBtn =
    document.getElementById("detailsWhatsappBtn");

let selectedProductId = null;


// ========================================
// LOAD PRODUCTS
// ========================================

async function loadProducts() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "products")
            );

        products = [];

        snapshot.forEach((doc) => {

            products.push({
                id: doc.id,
                ...doc.data()
            });

        });

        displayProducts();

        displayOffers();

        console.log(
            "Products loaded:",
            products.length
        );

    } catch (error) {

        console.error(
            "Products loading error:",
            error
        );

        if (productContainer) {

            productContainer.innerHTML = `
                <div class="empty-products">

                    <div class="empty-icon">♡</div>

                    <h3>Unable to Load Products</h3>

                    <p>
                        Please try again later.
                    </p>

                </div>
            `;
        }
    }
}


// ========================================
// LOAD CATEGORIES
// ========================================

async function loadCategories() {

    try {

        const snapshot =
            await getDocs(
                collection(db, "categories")
            );

        categories = [];

        snapshot.forEach((doc) => {

            categories.push({
                id: doc.id,
                ...doc.data()
            });

        });

        displayCategories();

        console.log(
            "Categories loaded:",
            categories.length
        );

    } catch (error) {

        console.error(
            "Categories loading error:",
            error
        );
    }
}


// ========================================
// DISPLAY CATEGORIES
// ========================================

function displayCategories() {

    if (!categoryContainer) return;

    categoryContainer.innerHTML = "";


    const allCard =
        document.createElement("div");

    allCard.className =
        "category-card";

    allCard.innerHTML = `
        <div class="category-icon">
            ✨
        </div>

        <h3>
            All Accessories
        </h3>

        <button
            class="category-btn"
            data-category="all"
        >
            View Products
        </button>
    `;

    categoryContainer.appendChild(
        allCard
    );


    categories.forEach((category) => {

        const card =
            document.createElement("div");

        card.className =
            "category-card";

        card.innerHTML = `
            <div class="category-icon">
                ♡
            </div>

            <h3>
                ${escapeHTML(
                    category.name ||
                    "Category"
                )}
            </h3>

            <button
                class="category-btn"
                data-category="${escapeHTML(
                    category.id
                )}"
            >
                View Products
            </button>
        `;

        categoryContainer.appendChild(
            card
        );
    });


    document
        .querySelectorAll(".category-btn")
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    const categoryId =
                        button.dataset.category;


                    if (
                        categoryId === "all"
                    ) {

                        currentFilter =
                            "all";

                        displayProducts(
                            products
                        );

                    } else {

                        const filtered =
                            products.filter(
                                (product) =>
                                    product.categoryId ===
                                    categoryId
                            );

                        displayProducts(
                            filtered
                        );
                    }


                    document
                        .getElementById(
                            "products"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });
                }
            );
        });
}


// ========================================
// DISPLAY PRODUCTS
// ========================================

function displayProducts(
    productList = null
) {

    if (!productContainer) return;


    const list =
        productList !== null
            ? productList
            : getFilteredProducts();


    if (list.length === 0) {

        productContainer.innerHTML = `
            <div class="empty-products">

                <div class="empty-icon">
                    ♡
                </div>

                <h3>
                    No Products Found
                </h3>

                <p>
                    Products will appear here
                    when they are added.
                </p>

            </div>
        `;

        return;
    }


    productContainer.innerHTML = "";


    list.forEach((product) => {

        const card =
            document.createElement("div");

        card.className =
            "product-card";


        const price =
            Number(
                product.price || 0
            );


        const discountPrice =
            Number(
                product.discountPrice || 0
            );


        const hasDiscount =
            discountPrice > 0 &&
            discountPrice < price;


        const finalPrice =
            hasDiscount
                ? discountPrice
                : price;


        const stock =
            Number(
                product.stock || 0
            );


        const categoryName =
            product.categoryName ||
            getCategoryName(
                product.categoryId
            );


        const isOutOfStock =
            stock <= 0;


        card.innerHTML = `

            ${
                hasDiscount
                    ? `
                        <div class="discount-badge">
                            OFFER
                        </div>
                    `
                    : ""
            }


            <button
                class="wishlist-product-btn"
                data-id="${escapeHTML(
                    product.id
                )}"
                title="Wishlist"
            >
                ${
                    wishlist.includes(
                        product.id
                    )
                        ? "♥"
                        : "♡"
                }
            </button>


            <img
                src="${escapeHTML(
                    product.imageUrl || ""
                )}"
                alt="${escapeHTML(
                    product.name ||
                    "Accessory"
                )}"
                class="product-image clickable-product"
                data-id="${escapeHTML(
                    product.id
                )}"
                onerror="this.src='https://via.placeholder.com/500x500?text=IT+Girl+Editions'"
            >


            <div class="product-info">

                <div class="product-category">
                    ${escapeHTML(
                        categoryName
                    )}
                </div>


                <h3
                    class="product-name clickable-product-name"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >
                    ${escapeHTML(
                        product.name ||
                        "Accessory"
                    )}
                </h3>


                <p class="product-description">
                    ${escapeHTML(
                        product.description ||
                        ""
                    )}
                </p>


                <div class="product-price">

                    <span class="current-price">
                        ₹${finalPrice}
                    </span>

                    ${
                        hasDiscount
                            ? `
                                <span class="old-price">
                                    ₹${price}
                                </span>
                            `
                            : ""
                    }

                </div>


                ${
                    isOutOfStock
                        ? `
                            <div class="stock-status">
                                Out of Stock
                            </div>
                        `
                        : `
                            <div class="stock-status">
                                ${stock} available
                            </div>
                        `
                }


                <div class="product-buttons">

                    <button
                        class="add-cart-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                        ${
                            isOutOfStock
                                ? "disabled"
                                : ""
                        }
                    >
                        ${
                            isOutOfStock
                                ? "Out of Stock"
                                : "Add to Cart"
                        }
                    </button>


                    <button
                        class="buy-whatsapp-btn"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >
                        WhatsApp
                    </button>

                </div>

            </div>
        `;


        productContainer.appendChild(
            card
        );
    });


    attachProductEvents();
}


// ========================================
// PRODUCT BUTTON EVENTS
// ========================================

function attachProductEvents() {

    // Product image click
    document
        .querySelectorAll(
            ".clickable-product"
        )
        .forEach((element) => {

            element.addEventListener(
                "click",
                () => {

                    openProductDetails(
                        element.dataset.id
                    );
                }
            );
        });


    // Product name click
    document
        .querySelectorAll(
            ".clickable-product-name"
        )
        .forEach((element) => {

            element.addEventListener(
                "click",
                () => {

                    openProductDetails(
                        element.dataset.id
                    );
                }
            );
        });


    // Add to cart
    document
        .querySelectorAll(
            ".add-cart-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    addToCart(
                        button.dataset.id
                    );
                }
            );
        });


    // WhatsApp
    document
        .querySelectorAll(
            ".buy-whatsapp-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    orderSingleProduct(
                        button.dataset.id
                    );
                }
            );
        });


    // Wishlist
    document
        .querySelectorAll(
            ".wishlist-product-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    toggleWishlist(
                        button.dataset.id
                    );
                }
            );
        });
}


// ========================================
// PRODUCT DETAILS
// ========================================

function openProductDetails(
    productId
) {

    const product =
        products.find(
            (item) =>
                item.id === productId
        );


    if (!product) return;


    selectedProductId =
        productId;


    const price =
        Number(
            product.price || 0
        );


    const discountPrice =
        Number(
            product.discountPrice || 0
        );


    const hasDiscount =
        discountPrice > 0 &&
        discountPrice < price;


    const finalPrice =
        hasDiscount
            ? discountPrice
            : price;


    const stock =
        Number(
            product.stock || 0
        );


    const categoryName =
        product.categoryName ||
        getCategoryName(
            product.categoryId
        );


    if (detailsProductImage) {

        detailsProductImage.src =
            product.imageUrl ||
            "https://via.placeholder.com/500x500?text=IT+Girl+Editions";

        detailsProductImage.alt =
            product.name ||
            "Accessory";
    }


    if (detailsProductCategory) {

        detailsProductCategory.textContent =
            categoryName;
    }


    if (detailsProductName) {

        detailsProductName.textContent =
            product.name ||
            "Accessory";
    }


    if (detailsProductPrice) {

        detailsProductPrice.textContent =
            `₹${finalPrice}`;
    }


    if (detailsOriginalPrice) {

        if (hasDiscount) {

            detailsOriginalPrice.textContent =
                `₹${price}`;

            detailsOriginalPrice.style.display =
                "inline";

        } else {

            detailsOriginalPrice.textContent =
                "";

            detailsOriginalPrice.style.display =
                "none";
        }
    }


    if (detailsProductDescription) {

        detailsProductDescription.textContent =
            product.description ||
            "Beautiful accessory from IT Girl Editions.";
    }


    if (detailsProductStock) {

        if (stock <= 0) {

            detailsProductStock.textContent =
                "Out of Stock";

            detailsProductStock.classList.add(
                "out-of-stock"
            );

        } else {

            detailsProductStock.textContent =
                `${stock} available`;

            detailsProductStock.classList.remove(
                "out-of-stock"
            );
        }
    }


    if (detailsAddToCart) {

        detailsAddToCart.dataset.id =
            product.id;

        if (stock <= 0) {

            detailsAddToCart.disabled =
                true;

            detailsAddToCart.textContent =
                "Out of Stock";

        } else {

            detailsAddToCart.disabled =
                false;

            detailsAddToCart.textContent =
                "Add to Cart";
        }
    }


    if (detailsWishlistBtn) {

        detailsWishlistBtn.dataset.id =
            product.id;

        updateDetailsWishlistButton(
            product.id
        );
    }


    if (detailsWhatsappBtn) {

        detailsWhatsappBtn.dataset.id =
            product.id;
    }


    productDetailsModal?.classList.add(
        "active"
    );

    overlay?.classList.add(
        "active"
    );
}


// ========================================
// CLOSE PRODUCT DETAILS
// ========================================

function closeProductDetailsModal() {

    productDetailsModal?.classList.remove(
        "active"
    );

    overlay?.classList.remove(
        "active"
    );

    selectedProductId =
        null;
}


closeProductDetails?.addEventListener(
    "click",
    closeProductDetailsModal
);


// ========================================
// PRODUCT DETAILS ADD TO CART
// ========================================

detailsAddToCart?.addEventListener(
    "click",
    () => {

        const productId =
            detailsAddToCart.dataset.id;

        if (!productId) return;


        const product =
            products.find(
                (item) =>
                    item.id === productId
            );


        if (!product) return;


        const stock =
            Number(
                product.stock || 0
            );


        if (stock <= 0) {

            alert(
                "Sorry, this product is out of stock."
            );

            return;
        }


        addToCart(productId);

        closeProductDetailsModal();
    }
);


// ========================================
// PRODUCT DETAILS WISHLIST
// ========================================

detailsWishlistBtn?.addEventListener(
    "click",
    () => {

        const productId =
            detailsWishlistBtn.dataset.id;

        if (!productId) return;

        toggleWishlist(productId);

        updateDetailsWishlistButton(
            productId
        );
    }
);


// ========================================
// UPDATE DETAILS WISHLIST BUTTON
// ========================================

function updateDetailsWishlistButton(
    productId
) {

    if (!detailsWishlistBtn) return;


    if (
        wishlist.includes(
            productId
        )
    ) {

        detailsWishlistBtn.textContent =
            "♥ Remove from Wishlist";

    } else {

        detailsWishlistBtn.textContent =
            "♡ Add to Wishlist";
    }
}


// ========================================
// PRODUCT DETAILS WHATSAPP
// ========================================

detailsWhatsappBtn?.addEventListener(
    "click",
    () => {

        const productId =
            detailsWhatsappBtn.dataset.id;

        if (!productId) return;

        orderSingleProduct(
            productId
        );
    }
);


// ========================================
// SEARCH
// ========================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            const search =
                searchInput.value
                    .trim()
                    .toLowerCase();


            if (!search) {

                displayProducts();

                return;
            }


            const filtered =
                products.filter(
                    (product) => {

                        const name =
                            String(
                                product.name ||
                                ""
                            ).toLowerCase();


                        const description =
                            String(
                                product.description ||
                                ""
                            ).toLowerCase();


                        const category =
                            String(
                                product.categoryName ||
                                getCategoryName(
                                    product.categoryId
                                ) ||
                                ""
                            ).toLowerCase();


                        return (
                            name.includes(
                                search
                            ) ||
                            description.includes(
                                search
                            ) ||
                            category.includes(
                                search
                            )
                        );
                    }
                );


            displayProducts(
                filtered
            );
        }
    );
}


// ========================================
// FILTER BUTTONS
// ========================================

document
    .querySelectorAll(".filter-btn")
    .forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(
                        ".filter-btn"
                    )
                    .forEach((btn) =>
                        btn.classList.remove(
                            "active"
                        )
                    );


                button.classList.add(
                    "active"
                );


                currentFilter =
                    button.dataset.filter;


                displayProducts();
            }
        );
    });


// ========================================
// FILTER PRODUCTS
// ========================================

function getFilteredProducts() {

    if (
        currentFilter ===
        "new"
    ) {

        return products.filter(
            (product) =>
                product.newArrival ===
                true
        );
    }


    if (
        currentFilter ===
        "offer"
    ) {

        return products.filter(
            (product) =>
                product.offer ===
                    true ||
                Number(
                    product.discountPrice ||
                    0
                ) > 0
        );
    }


    return products;
}


// ========================================
// DISPLAY OFFERS
// ========================================

function displayOffers() {

    if (!offerContainer) return;


    const offers =
        products.filter(
            (product) =>
                product.offer ===
                    true ||
                Number(
                    product.discountPrice ||
                    0
                ) > 0
        );


    if (offers.length === 0) {

        offerContainer.innerHTML = `
            <div class="empty-products">

                <div class="empty-icon">
                    💗
                </div>

                <h3>
                    Special Offers
                </h3>

                <p>
                    Exclusive offers will
                    appear here.
                </p>

            </div>
        `;

        return;
    }


    offerContainer.innerHTML = "";


    offers.forEach((product) => {

        const card =
            createSimpleProductCard(
                product
            );

        offerContainer.appendChild(
            card
        );
    });


    // Offer card image/name click
    offerContainer
        .querySelectorAll(
            ".offer-clickable-product"
        )
        .forEach((element) => {

            element.addEventListener(
                "click",
                () => {

                    openProductDetails(
                        element.dataset.id
                    );
                }
            );
        });
}


// ========================================
// OFFER PRODUCT CARD
// ========================================

function createSimpleProductCard(
    product
) {

    const card =
        document.createElement("div");

    card.className =
        "product-card";


    const price =
        Number(
            product.price || 0
        );


    const discountPrice =
        Number(
            product.discountPrice || 0
        );


    const finalPrice =
        discountPrice > 0 &&
        discountPrice < price
            ? discountPrice
            : price;


    card.innerHTML = `

        <div class="discount-badge">
            OFFER
        </div>


        <img
            src="${escapeHTML(
                product.imageUrl || ""
            )}"
            alt="${escapeHTML(
                product.name ||
                "Accessory"
            )}"
            class="product-image offer-clickable-product"
            data-id="${escapeHTML(
                product.id
            )}"
            onerror="this.src='https://via.placeholder.com/500x500?text=IT+Girl+Editions'"
        >


        <div class="product-info">

            <div class="product-category">
                ${escapeHTML(
                    product.categoryName ||
                    getCategoryName(
                        product.categoryId
                    )
                )}
            </div>


            <h3
                class="product-name offer-clickable-product"
                data-id="${escapeHTML(
                    product.id
                )}"
            >
                ${escapeHTML(
                    product.name ||
                    ""
                )}
            </h3>


            <div class="product-price">

                <span class="current-price">
                    ₹${finalPrice}
                </span>

                ${
                    discountPrice > 0 &&
                    discountPrice < price
                        ? `
                            <span class="old-price">
                                ₹${price}
                            </span>
                        `
                        : ""
                }

            </div>

        </div>
    `;


    return card;
}


// ========================================
// ADD TO CART
// ========================================

function addToCart(
    productId
) {

    const product =
        products.find(
            (item) =>
                item.id ===
                productId
        );


    if (!product) return;


    const stock =
        Number(
            product.stock || 0
        );


    if (stock <= 0) {

        alert(
            "Sorry, this product is out of stock."
        );

        return;
    }


    const existing =
        cart.find(
            (item) =>
                item.id ===
                productId
        );


    if (existing) {

        if (
            existing.quantity >=
            stock
        ) {

            alert(
                `Only ${stock} item(s) available in stock.`
            );

            return;
        }


        existing.quantity += 1;

    } else {

        const price =
            Number(
                product.discountPrice ||
                product.price ||
                0
            );


        cart.push({

            id: product.id,

            name:
                product.name,

            price:
                price,

            imageUrl:
                product.imageUrl ||
                "",

            quantity: 1
        });
    }


    saveCart();

    updateCartUI();

    openCart();
}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "itGirlCart",
        JSON.stringify(cart)
    );
}


// ========================================
// UPDATE CART
// ========================================

function updateCartUI() {

    if (cartCount) {

        const count =
            cart.reduce(
                (total, item) =>
                    total +
                    item.quantity,
                0
            );


        cartCount.textContent =
            count;
    }


    if (!cartItems) return;


    if (cart.length === 0) {

        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;


        if (cartTotal) {

            cartTotal.textContent =
                "₹0";
        }

        return;
    }


    cartItems.innerHTML = "";


    let total = 0;


    cart.forEach((item) => {

        total +=
            item.price *
            item.quantity;


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "cart-item";


        div.innerHTML = `

            <img
                src="${escapeHTML(
                    item.imageUrl
                )}"
                alt="${escapeHTML(
                    item.name
                )}"
                onerror="this.src='https://via.placeholder.com/100x100?text=Product'"
            >


            <div class="cart-item-info">

                <h4>
                    ${escapeHTML(
                        item.name
                    )}
                </h4>

                <p>
                    ₹${item.price}
                    × ${item.quantity}
                </p>

            </div>


            <button
                class="remove-item-btn"
                data-id="${escapeHTML(
                    item.id
                )}"
            >
                ×
            </button>
        `;


        cartItems.appendChild(
            div
        );
    });


    if (cartTotal) {

        cartTotal.textContent =
            `₹${total}`;
    }


    document
        .querySelectorAll(
            ".remove-item-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    removeFromCart(
                        button.dataset.id
                    );
                }
            );
        });
}


// ========================================
// REMOVE CART ITEM
// ========================================

function removeFromCart(
    productId
) {

    cart =
        cart.filter(
            (item) =>
                item.id !==
                productId
        );


    saveCart();

    updateCartUI();
}


// ========================================
// WISHLIST
// ========================================

function toggleWishlist(
    productId
) {

    if (
        wishlist.includes(
            productId
        )
    ) {

        wishlist =
            wishlist.filter(
                (id) =>
                    id !==
                    productId
            );

    } else {

        wishlist.push(
            productId
        );
    }


    localStorage.setItem(
        "itGirlWishlist",
        JSON.stringify(
            wishlist
        )
    );


    displayProducts();

    displayWishlist();

    updateDetailsWishlistButton(
        productId
    );
}


// ========================================
// DISPLAY WISHLIST
// ========================================

function displayWishlist() {

    if (!wishlistItems) return;


    const wishlistProducts =
        products.filter(
            (product) =>
                wishlist.includes(
                    product.id
                )
        );


    if (
        wishlistProducts.length ===
        0
    ) {

        wishlistItems.innerHTML = `
            <p class="empty-cart">
                Your wishlist is empty.
            </p>
        `;

        return;
    }


    wishlistItems.innerHTML = "";


    wishlistProducts.forEach(
        (product) => {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "wishlist-item";


            const price =
                Number(
                    product.discountPrice > 0 &&
                    product.discountPrice < product.price
                        ? product.discountPrice
                        : product.price || 0
                );


            div.innerHTML = `

                <img
                    src="${escapeHTML(
                        product.imageUrl ||
                        ""
                    )}"
                    alt="${escapeHTML(
                        product.name ||
                        ""
                    )}"
                    class="wishlist-clickable"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >


                <div class="wishlist-item-info">

                    <h4
                        class="wishlist-clickable"
                        data-id="${escapeHTML(
                            product.id
                        )}"
                    >
                        ${escapeHTML(
                            product.name ||
                            ""
                        )}
                    </h4>

                    <p>
                        ₹${price}
                    </p>

                </div>


                <button
                    class="remove-item-btn"
                    data-id="${escapeHTML(
                        product.id
                    )}"
                >
                    ×
                </button>
            `;


            wishlistItems.appendChild(
                div
            );
        }
    );


    document
        .querySelectorAll(
            "#wishlistItems .remove-item-btn"
        )
        .forEach((button) => {

            button.addEventListener(
                "click",
                () => {

                    toggleWishlist(
                        button.dataset.id
                    );
                }
            );
        });


    document
        .querySelectorAll(
            "#wishlistItems .wishlist-clickable"
        )
        .forEach((element) => {

            element.addEventListener(
                "click",
                () => {

                    closeWishlist();

                    openProductDetails(
                        element.dataset.id
                    );
                }
            );
        });
}


// ========================================
// CART SIDEBAR
// ========================================

function openCart() {

    closeWishlist();

    cartSidebar?.classList.add(
        "open"
    );

    overlay?.classList.add(
        "active"
    );
}


function closeCart() {

    cartSidebar?.classList.remove(
        "open"
    );

    if (
        !wishlistSidebar?.classList.contains(
            "open"
        ) &&
        !productDetailsModal?.classList.contains(
            "active"
        )
    ) {

        overlay?.classList.remove(
            "active"
        );
    }
}


// ========================================
// WISHLIST SIDEBAR
// ========================================

function openWishlist() {

    closeCart();

    displayWishlist();

    wishlistSidebar?.classList.add(
        "open"
    );

    overlay?.classList.add(
        "active"
    );
}


function closeWishlist() {

    wishlistSidebar?.classList.remove(
        "open"
    );

    if (
        !cartSidebar?.classList.contains(
            "open"
        ) &&
        !productDetailsModal?.classList.contains(
            "active"
        )
    ) {

        overlay?.classList.remove(
            "active"
        );
    }
}


// ========================================
// SIDEBAR BUTTONS
// ========================================

document
    .getElementById("cartBtn")
    ?.addEventListener(
        "click",
        openCart
    );


document
    .getElementById("closeCart")
    ?.addEventListener(
        "click",
        closeCart
    );


document
    .getElementById("wishlistBtn")
    ?.addEventListener(
        "click",
        openWishlist
    );


document
    .getElementById("closeWishlist")
    ?.addEventListener(
        "click",
        closeWishlist
    );


// ========================================
// OVERLAY
// ========================================

overlay?.addEventListener(
    "click",
    () => {

        closeCart();

        closeWishlist();

        closeProductDetailsModal();
    }
);


// ========================================
// SINGLE PRODUCT WHATSAPP ORDER
// ========================================

function orderSingleProduct(
    productId
) {

    const product =
        products.find(
            (item) =>
                item.id ===
                productId
        );


    if (!product) return;


    const price =
        Number(
            product.discountPrice ||
            product.price ||
            0
        );


    const message =
        `Hi IT Girl Editions! 👋\n\n` +
        `I'm interested in buying this product.\n\n` +
        `Product: ${product.name}\n` +
        `Price: ₹${price}\n\n` +
        `Please share details and availability. ` +
        `I would like to purchase this product.`;


    const url =
        `https://wa.me/${WHATSAPP_NUMBER}` +
        `?text=${encodeURIComponent(
            message
        )}`;


    window.open(
        url,
        "_blank"
    );
}


// ========================================
// CART WHATSAPP ORDER
// ========================================

document
    .getElementById(
        "whatsappOrderBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            if (
                cart.length ===
                0
            ) {

                alert(
                    "Your cart is empty."
                );

                return;
            }


            let message =
                "Hi IT Girl Editions! 👋\n\n" +
                "I would like to order these products:\n\n";


            let total = 0;


            cart.forEach(
                (item) => {

                    const itemTotal =
                        item.price *
                        item.quantity;


                    total +=
                        itemTotal;


                    message +=
                        `• ${item.name}` +
                        ` × ${item.quantity}` +
                        ` - ₹${itemTotal}\n`;
                }
            );


            message +=
                `\nTotal: ₹${total}` +
                `\n\nPlease share availability and order details.`;


            const url =
                `https://wa.me/${WHATSAPP_NUMBER}` +
                `?text=${encodeURIComponent(
                    message
                )}`;


            window.open(
                url,
                "_blank"
            );
        }
    );


// ========================================
// NEW ARRIVALS
// ========================================

document
    .getElementById(
        "newArrivalBtn"
    )
    ?.addEventListener(
        "click",
        () => {

            currentFilter =
                "new";


            document
                .querySelectorAll(
                    ".filter-btn"
                )
                .forEach(
                    (btn) =>
                        btn.classList.remove(
                            "active"
                        )
                );


            document
                .querySelector(
                    '[data-filter="new"]'
                )
                ?.classList.add(
                    "active"
                );


            displayProducts();


            document
                .getElementById(
                    "products"
                )
                ?.scrollIntoView({
                    behavior: "smooth"
                });
        }
    );


// ========================================
// WHATSAPP CONTACT
// ========================================

document
    .getElementById(
        "whatsappContact"
    )
    ?.addEventListener(
        "click",
        (event) => {

            event.preventDefault();


            const message =
                "Hi IT Girl Editions! 👋\n\n" +
                "I would like to know more about your accessories.";


            const url =
                `https://wa.me/${WHATSAPP_NUMBER}` +
                `?text=${encodeURIComponent(
                    message
                )}`;


            window.open(
                url,
                "_blank"
            );
        }
    );


// ========================================
// GET CATEGORY NAME
// ========================================

function getCategoryName(
    categoryId
) {

    const category =
        categories.find(
            (item) =>
                item.id ===
                categoryId
        );


    return category
        ? category.name
        : "Accessories";
}


// ========================================
// HTML SAFETY
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


// ========================================
// START WEBSITE
// ========================================

async function initializeWebsite() {

    console.log(
        "IT Girl Editions website starting..."
    );


    updateCartUI();


    await loadCategories();


    await loadProducts();


    displayWishlist();


    console.log(
        "IT Girl Editions Firebase connected successfully! 💗"
    );
}


initializeWebsite();