const API_BASE_URL = (window.__APP_CONFIG__ && window.__APP_CONFIG__.API_BASE_URL) || 'http://localhost:8000';
const PRODUCTS_ENDPOINT = (window.__APP_CONFIG__ && window.__APP_CONFIG__.PRODUCTS_ENDPOINT) || '/products';

const SAMPLE_PRODUCTS = [
    { id: 1, sku: 'SKU-001', name: 'Violão Acústico', current_stock: 12, price: 450, category: 'Cordas' },
    { id: 2, sku: 'SKU-002', name: 'Piano Digital', current_stock: 3, price: 4200, category: 'Teclas' },
    { id: 3, sku: 'SKU-003', name: 'Saxofone Alto', current_stock: 5, price: 2150, category: 'Sopro' },
    { id: 4, sku: 'SKU-004', name: 'Guitarra Les Paul', current_stock: 2, price: 3500, category: 'Cordas' }
];

function ajax({ url, method = 'GET', data = null }) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState !== 4) return;

            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const parsed = xhr.responseText ? JSON.parse(xhr.responseText) : null;
                    resolve(parsed);
                } catch (error) {
                    resolve(xhr.responseText);
                }
                return;
            }

            let errorPayload = {};
            try {
                errorPayload = xhr.responseText ? JSON.parse(xhr.responseText) : {};
            } catch (error) {
                errorPayload = {};
            }

            reject(
                new Error(
                    errorPayload.detail ||
                    errorPayload.message ||
                    `Erro na requisição (${xhr.status})`
                )
            );
        };

        xhr.send(data ? JSON.stringify(data) : null);
    });
}

function normalizeProduct(item) {
    return {
        id: item?.id || item?._id || '',
        sku: item?.sku || '',
        name: item?.name || item?.nome || '',
        price: item?.price ?? item?.preco ?? 0,
        current_stock: item?.current_stock ?? item?.estoque ?? 0,
        category: item?.category || item?.categoria || ''
    };
}

function extractProducts(payload) {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (Array.isArray(payload?.products)) {
        return payload.products;
    }

    if (Array.isArray(payload?.data)) {
        return payload.data;
    }

    if (payload?.product) {
        return [payload.product];
    }

    return [];
}

class IndexPage {
    constructor() {
        this.container = document.getElementById('featured-instruments');
        this.feedback = document.getElementById('feedback-message');
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(value || 0));
    }

    featuredInstrumentsCardHtml(item) {
        const product = normalizeProduct(item);

        return `
            <div class="col-md-4 col-lg-3">
                <div class="dashboard-card h-100 text-center">
                    <div class="p-4 border-bottom rounded-top">
                        <i class="bi bi-music-note-beamed fs-1"></i>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${product.name || 'Produto'}</h5>
                        <p class="card-text text-muted fs-6 mb-3">SKU: ${product.sku || 'Sem SKU'}</p>
                        <p class="card-text text-muted fs-6 mb-3">Estoque: ${product.current_stock ?? 0} unidades</p>
                        <p class="card-text fw-bold fs-5">${this.formatCurrency(product.price)}</p>
                        <p class="card-text text-muted small">${product.category || 'Sem categoria'}</p>
                        <div class="mt-auto d-flex justify-content-center gap-2 pt-2">
                            <button class="btn btn-outline-secondary btn-sm" type="button">Visualizar</button>
                            <button class="btn btn-maestro btn-sm" type="button">Editar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFeaturedInstruments(dataList) {
        this.container.innerHTML = '';
        dataList.forEach(item => {
            this.container.insertAdjacentHTML('beforeend', this.featuredInstrumentsCardHtml(item));
        });
    }

    showMessage(message, type = 'success') {
        this.feedback.className = `alert alert-${type}`;
        this.feedback.textContent = message;
        this.feedback.classList.remove('d-none');
    }

    hideMessage() {
        this.feedback.className = 'alert d-none';
        this.feedback.textContent = '';
    }

    async loadFeaturedInstruments() {
        try {
            const payload = await ajax({
                url: `${API_BASE_URL}${PRODUCTS_ENDPOINT}`,
                method: 'GET'
            });

            const items = extractProducts(payload);
            this.renderFeaturedInstruments(items.length ? items : SAMPLE_PRODUCTS);
            this.hideMessage();
        } catch (error) {
            console.warn('Usando dados de exemplo:', error);
            this.renderFeaturedInstruments(SAMPLE_PRODUCTS);
            this.showMessage('Backend indisponível; exibindo dados de exemplo.', 'warning');
        }
    }

    async saveProduct(productData) {
        return ajax({
            url: `${API_BASE_URL}${PRODUCTS_ENDPOINT}`,
            method: 'POST',
            data: productData
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const pagina = new IndexPage();

    pagina.loadFeaturedInstruments();

    const form = document.getElementById('product-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const submitButton = form.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            try {
                const productData = {
                    sku: form.sku.value.trim(),
                    name: form.name.value.trim(),
                    price: Number(form.price.value),
                    current_stock: Number(form.current_stock.value),
                    category: form.category.value.trim(),
                    color: '',
                    brand: '',
                    weight: '',
                    unit: 'un'
                };

                if (!productData.sku || !productData.name || Number.isNaN(productData.price) || Number.isNaN(productData.current_stock)) {
                    throw new Error('Preencha SKU, nome, preço e estoque corretamente.');
                }

                const response = await pagina.saveProduct(productData);
                form.reset();

                const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('product-modal'));
                modal.hide();
                await pagina.loadFeaturedInstruments();
                pagina.showMessage(
                    response?.message || 'Produto salvo com sucesso!',
                    'success'
                );
            } catch (error) {
                pagina.showMessage(error.message || 'Não foi possível salvar o produto.', 'danger');
            } finally {
                submitButton.disabled = false;
            }
        });
    }
});