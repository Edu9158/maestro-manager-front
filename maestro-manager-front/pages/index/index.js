class IndexPage {

    featuredInstrumentsCardHtml(item) {
        // Recebe um objeto de instrumento e retorna o HTML do cartão
        return `
            <div class="col-md-4 col-lg-3">
                <div class="dashboard-card h-100 text-center">
                    <div class="p-4 border-bottom rounded-top">
                        <i class="bi bi-music-note-beamed fs-1"></i>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title fw-bold">${item.nome}</h5>
                        <p class="card-text text-muted fs-6 mb-3">Estoque: ${item.estoque} unidades</p>
                        <p class="card-text fw-bold fs-5">R$ ${item.preco}</p>
                        
                        <div class="mt-auto d-flex justify-content-center gap-2 pt-2">
                            <button class="btn btn-outline-secondary btn-sm" onclick="visualizarItem(${item.id})">Visualizar</button>
                            <button class="btn btn-maestro btn-sm" onclick="editarItem(${item.id})">Editar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderFeaturedInstruments(dataList) {
        const container = document.getElementById('featured-instruments');
        container.innerHTML = ''; 

        // Corrigido: Usando 'item' para representar cada unidade individual da lista
        dataList.forEach(item => {
            const html = this.featuredInstrumentsCardHtml(item);
            container.insertAdjacentHTML('beforeend', html);
        });
    }
}

// O gatilho que garante que o HTML já está pronto antes de rodar a injeção
document.addEventListener('DOMContentLoaded', () => {

    // Simulated data - in the future will be fetched from the backend
    const data = [
        { 
            id: 1,
            nome: "Violão Acústico", 
            estoque: 12, 
            preco: "450,00" 
        },{ 
            id: 2, 
            nome: "Piano Digital", 
            estoque: 3, 
            preco: "4.200,00" 
        },{ 
            id: 3, 
            nome: "Saxofone Alto", 
            estoque: 5, 
            preco: "2.150,00" 
        },{ 
            id: 4, 
            nome: "Guitarra Les Paul", 
            estoque: 2, 
            preco: "3.500,00" 
        }
    ];

    // Inicializando a página
    const pagina = new IndexPage();
    pagina.renderFeaturedInstruments(data);
    
});