const urlUF = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados'
const estados = document.getElementById('uf');
const cidade = document.getElementById('cidade');

estados.addEventListener('click', async () => {
    const urlCidades = `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estados.value}/municipios`
    const request = await fetch(urlCidades);
    const response = await request.json();
    let options = ''

    response.forEach((cidades) => {
        options += `<option>${cidades.nome}</option>`
    })
    cidade.innerHTML = options
});

window.addEventListener('load', async () => {
    const request = await fetch(urlUF);
    const response = await request.json();

    let todosOsUf = [];

    response.forEach((uf) => {
        todosOsUf.push(uf.sigla);
    });

    let ufOrganizado = todosOsUf.sort();
    let optionsHtml = "";

    ufOrganizado.forEach((uf) => {
        optionsHtml += `<option>${uf}</option>`;
    });
    
    estados.innerHTML += optionsHtml;
});

const mascaraCelular = document.getElementById('celular');

mascaraCelular.addEventListener('input', () => {

    const limparValor = mascaraCelular.value.replace(/\D/g, '').substring(0, 11);

    const numerosArray = limparValor.split('');
    let numeroFormatado = '';

    if (numerosArray.length > 0) {
        numeroFormatado += `(${numerosArray.slice(0, 2).join('')})`;
    }

    if (numerosArray.length > 2) {
        numeroFormatado += ` ${numerosArray.slice(2, 7).join('')}`;
    }

    if (numerosArray.length > 7) {
        numeroFormatado += `-${numerosArray.slice(7, 11).join('')}`;
    }

    mascaraCelular.value = numeroFormatado;
});

const getLocalStorage = () => JSON.parse(localStorage.getItem('db_cliente')) ?? [];
const setLocalStorage = (dbCliente) => localStorage.setItem('db_cliente', JSON.stringify(dbCliente));

const criarCliente = (cliente) => {
    const dbCliente = getLocalStorage();
    dbCliente.push(cliente);
    setLocalStorage(dbCliente);
}

const atualizarCliente = (index, cliente) => {
    const dbCliente = getLocalStorage();
    dbCliente[index] = cliente;
    setLocalStorage(dbCliente);
}

const deletarCliente = (index) => {
    const dbCliente = getLocalStorage();
    dbCliente.splice(index, 1);
    setLocalStorage(dbCliente);
}

const camposValidos = () => {
    return document.getElementById('form').reportValidity()
}

const salvarModal = () => {
    if (camposValidos()) {
        const cliente = {
            nome: document.getElementById('nome').value,
            email: document.getElementById('email').value,
            celular: document.getElementById('celular').value,
            cidade: document.getElementById('cidade').value,
            uf: document.getElementById('uf').value
        }
        const index = document.getElementById('nome').dataset.index
        if (index == 'new') {
            criarCliente(cliente);
        } else {
            atualizarCliente(index, cliente);
            atualizarTabela();
        }
    }
}

const criarLinha = (cliente, index) => {
    const novaLinha = document.createElement('tr');
    novaLinha.innerHTML = `
        <td>${cliente.nome}</td>
        <td>${cliente.email}</td>
        <td>${cliente.celular}</td>
        <td>${cliente.uf} - ${cliente.cidade}</td>
        <td>
            <button id="editar-${index}" class="btn btn-success" data-bs-toggle="modal" data-bs-target="#modal">
                <iconify-icon icon="akar-icons:edit"></iconify-icon>
            </button>
            <button id="deletar-${index}" class="btn btn-danger">
                <iconify-icon icon="ic:baseline-delete"></iconify-icon>
            </button>
        </td>
    `
    document.querySelector('#tabela>tbody').appendChild(novaLinha);
}

const limparTabela = () => {
    const linhas = document.querySelectorAll('#tabela>tbody tr');
    linhas.forEach(linha => linha.parentNode.removeChild(linha));
}

const atualizarTabela = () => {
    const dbCliente = getLocalStorage();
    limparTabela();
    dbCliente.forEach(criarLinha);
}

const tituloModal = document.querySelector('.modal-title');

const limparCampos = () => {
    const campos = document.querySelectorAll('.campos');
    campos.forEach(campo => campo.value = "");
    estados.value = "UF";
    cidade.innerHTML = `<option disabled selected>Cidades</option>`;
    tituloModal.innerHTML = 'Novo Cliente';
}

const preencherCampos = (cliente) => {
    document.getElementById('nome').value = cliente.nome;
    document.getElementById('email').value = cliente.email;
    document.getElementById('celular').value = cliente.celular;
    document.getElementById('uf').value = cliente.uf;
    cidade.innerHTML += `<option>${cliente.cidade}</option>`;
    document.getElementById('cidade').value = cliente.cidade;
    document.getElementById('nome').dataset.index = cliente.index;
}

const editarCliente = (index) => {
    const cliente = getLocalStorage()[index];
    cliente.index = index;
    tituloModal.innerHTML = 'Editar Cliente';
    preencherCampos(cliente);
}

const editarDeletarCliente = (evento) => {
    if (evento.target.type == 'submit') {
        const [action, index] = evento.target.id.split('-');

        if (action == 'editar') {
            editarCliente(index);
        } else {
            const cliente = getLocalStorage()[index];
            const response = confirm(`Deseja realmente excluir o cliente ${cliente.nome}?`);
            if (response) {
                deletarCliente(index);
                atualizarTabela();
            }
        }
    }
}

atualizarTabela();

document.getElementById('botaoSalvar').addEventListener('click', salvarModal);
document.querySelector('#tabela>tbody').addEventListener('click', editarDeletarCliente);