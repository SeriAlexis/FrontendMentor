let cart = [];

// ---- Обновление кнопок на карточках ----
function updateProductControl(productId) {
    const productCard = document.querySelector(`.product-card[data-id='${productId}']`);
    if (!productCard) return;
    const productImg = productCard.querySelector('.product-img');
    const addToCartBtn = productCard.querySelector('.add-to-cart');
    const productControl = productCard.querySelector('.product-control');
    const qtySpan = productControl.querySelector('.item-qty');
    const cartItem = cart.find(item => item.id === productId);
    const quantity = cartItem ? cartItem.quantity : 0;
    if (quantity > 0) {
        addToCartBtn.style.display = 'none';
        productControl.style.display = 'flex';
        qtySpan.textContent = quantity;
        productImg.classList.add('in-cart');
    } else {
        addToCartBtn.style.display = 'block';
        productControl.style.display = 'none';
        productImg.classList.remove('in-cart');
    }
}

// ---- ГЛАВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ КОРЗИНЫ ----
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartCountSpan = document.getElementById('cart-count');
    const cartTotalSpan = document.getElementById('cart-total-price');
    const cartFooter = document.querySelector('.cart-footer');

    // 1. Случай: Корзина ПУСТАЯ (cart.length === 0)
    if (cart.length === 0) {
        // Показываем картинку и текст
        cartItemsContainer.innerHTML = `
            <img src="assets/images/illustration-empty-cart.svg" alt="Empty cart" class="icon-empty">
            <p class="empty-cart-message">Your cart is empty.</p>
        `;
        cartCountSpan.textContent = '0';
        if (cartTotalSpan) cartTotalSpan.textContent = '$0.00';
        if (cartFooter) cartFooter.style.display = 'none'; // Скрываем футер
        // Сбрасываем кнопки на карточках
        document.querySelectorAll('.product-card').forEach(card => {
            updateProductControl(card.dataset.id);
        });
        return;
    }

    // 2. Случай: Корзина НЕ ПУСТАЯ
    // Показываем футер
    if (cartFooter) cartFooter.style.display = 'block';

    let total = 0;
    let totalItems = 0;
    let itemsHtml = '';

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        totalItems += item.quantity;
        itemsHtml += `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item-info">
                    <div class="cart-item-title">${item.name}</div>
                    <div class="cart-item-details">
                        <span class="cart-item-quantity">${item.quantity}x</span>
                        @ $${item.price.toFixed(2)}
                        <span class="cart-item-price">$${itemTotal.toFixed(2)}</span>
                    </div>
                </div>
                <button class="remove-item" data-id="${item.id}"><img src="assets/images/icon-remove-item.svg" alt="Remove" class="icon-remove"></button>
            </div>
        `;
    });

    cartItemsContainer.innerHTML = itemsHtml;
    cartCountSpan.textContent = totalItems;
    if (cartTotalSpan) cartTotalSpan.textContent = `$${total.toFixed(2)}`;

    // Обновляем кнопки на карточках
    document.querySelectorAll('.product-card').forEach(card => {
        updateProductControl(card.dataset.id);
    });

    // Обработчики для кнопок УДАЛЕНИЯ из корзины
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', function() {
            const id = this.dataset.id;
            const index = cart.findIndex(item => item.id === id);
            if (index !== -1) cart.splice(index, 1);
            updateCartDisplay(); // Перерисовываем корзину
        });
    });
}

// ---- ДОБАВЛЕНИЕ ТОВАРА ----
function addToCart(id, name, price, category) {
    const existingItem = cart.find(item => item.id === id);
    if (existingItem) existingItem.quantity += 1;
    else cart.push({ id, name, price, category, quantity: 1 });
    updateCartDisplay();
}

// ---- ИЗМЕНЕНИЕ КОЛИЧЕСТВА ЧЕРЕЗ +/- КНОПКИ ----
function changeQuantity(id, delta) {
    const item = cart.find(item => item.id === id);
    if (item) {
        const newQuantity = item.quantity + delta;
        if (newQuantity <= 0) {
            const index = cart.findIndex(i => i.id === id);
            if (index !== -1) cart.splice(index, 1);
        } else item.quantity = newQuantity;
        updateCartDisplay();
    }
}

// ---- ЗАГРУЗКА СТРАНИЦЫ И ОБРАБОТЧИКИ ----
document.addEventListener('DOMContentLoaded', function() {

    // 1. Кнопки "Add to Cart"
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.product-card');
            const id = productCard.dataset.id;
            const name = productCard.querySelector('.product-name').innerText;
            const category = productCard.querySelector('.product-category').innerText;
            const priceText = productCard.querySelector('.product-price').innerText;
            const price = parseFloat(priceText.replace('$', ''));
            addToCart(id, name, price, category);
        });
    });

    // 2. Кнопки +/-
    document.querySelector('.products-grid').addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (!productCard) return;
        const id = productCard.dataset.id;
        if (e.target.classList.contains('increase-qty')) changeQuantity(id, 1);
        if (e.target.classList.contains('decrease-qty')) changeQuantity(id, -1);
    });

    // 3. Модальное окно
    const modal = document.getElementById('modal');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');
    const closeModalBtn = document.getElementById('modal-close-btn');

    if (confirmOrderBtn) {
        confirmOrderBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Your cart is empty.');
                return;
            }
            // Заполняем модалку
            const modalList = document.querySelector('.modal-list');
            modalList.innerHTML = '';
            let modalTotal = 0;
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                modalTotal += itemTotal;
                modalList.innerHTML += `
                    <div class="modal-item">
                        <img src="assets/images/image-${item.category.toLowerCase().replace(/é|è|ê|ë/g, 'e').replace(/û/g, 'u').replace(/ /g, '-')}-thumbnail.jpg" alt="${item.name}" class="modal-item-img">
                            <div class="modal-item-name">${item.name}</div>
                            <div class="modal-item-info">
                            <div class="modal-item-quantity">${item.quantity}x</div>
                            <div class="modal-item-price">@ $${item.price.toFixed(2)}</div>
                            </div>
                        <div class="modal-item-total">$${itemTotal.toFixed(2)}</div>
                    </div>
                `;
            });
            modalList.innerHTML += `
            <div class=modal-total>
            <p>Order Total</p>
            <strong>$${modalTotal.toFixed(2)}</strong>
            </div>
            `;
            modal.classList.remove('modal-hidden');
            modal.classList.add('modal-show');
        });
    }

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', function() {
            cart = [];
            updateCartDisplay();
            modal.classList.remove('modal-show');
            modal.classList.add('modal-hidden');
        });
    }

    // 4. Начальная отрисовка корзины (покажет картинку "empty")
    updateCartDisplay();
});