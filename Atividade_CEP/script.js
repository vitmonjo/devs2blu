// Seleção dos elementos DOM
const inputNome = document.querySelector('#nome');
const inputCEP = document.querySelector('#cep');
const inputEstado = document.querySelector('#estado');
const inputCidade = document.querySelector('#cidade');
const inputBairro = document.querySelector('#bairro');
const inputLogradouro = document.querySelector('#logradouro');
const tabela = document.querySelector('#tabela');
const btnAdd = document.querySelector('#btn-add');
const btnUpdate = document.querySelector('#btn-update');
const btnRemove = document.querySelector('#btn-remove');
const btnCancel = document.querySelector('#btn-cancel');

// Variáveis globais
let enderecos = [];
let enderecoEditando = null;
const URL_VIA_CEP = 'https://viacep.com.br/ws/';
const BACKEND_URL = 'http://localhost:3000/enderecos';

// Formatar CEP enquanto o usuário digita
inputCEP.addEventListener('input', () => {
    let value = inputCEP.value.replace(/\D/g, '').slice(0, 8);
    if (value.length > 5) {
        value = value.slice(0, 5) + '-' + value.slice(5);
    }
    inputCEP.value = value;
});

// Validar e buscar CEP quando o usuário sair do campo
inputCEP.addEventListener('blur', () => {
    const cep = inputCEP.value.replace(/\D/g, '');
    if (cep.length < 8) {
        inputCEP.classList.add('error');
        inputCEP.focus();
        return;
    }
    inputCEP.classList.remove('error');
    buscaCep();
});

// Buscar informações do CEP no ViaCEP
const buscaCep = async () => {
    const cep = inputCEP.value.replace(/\D/g, '');

    if (cep != '') {
        // Mostrar loading nos campos
        inputEstado.value = '...';
        inputCidade.value = '...';
        inputBairro.value = '...';
        inputLogradouro.value = '...';

        try {
            const response = await fetch(`${URL_VIA_CEP}${cep}/json/`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.erro == "true") {
                inputCEP.classList.add('error');
                alert('CEP não encontrado');
                return;
            }

            inputCEP.classList.remove('error');
            populaCampos(data);
        } catch (err) {
            console.error('Erro ao buscar CEP: ', err);
            inputCEP.classList.add('error');
            alert('Erro ao buscar CEP');
        }
    }
}

// Preencher campos com dados do CEP
const populaCampos = (data) => {
    inputEstado.value = data.uf;
    inputCidade.value = data.localidade;
    inputBairro.value = data.bairro;
    inputLogradouro.value = data.logradouro;
}

// Buscar todos os endereços do backend
const buscarEnderecos = async () => {
    try {
        const response = await fetch(BACKEND_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        enderecos = data;
        renderizarTabela();
    } catch (err) {
        console.error('Erro ao buscar endereços: ', err);
        // Usar dados simulados se não conseguir conectar ao backend
        enderecos = [];
        renderizarTabela();
    }
}

// Renderizar tabela com os endereços
const renderizarTabela = () => {
    tabela.innerHTML = '';

    if (enderecos.length === 0) {
        tabela.innerHTML = '<tr class="empty-state"><td colspan="8">Nenhum endereço cadastrado ainda</td></tr>';
        return;
    }

    enderecos.forEach((endereco, index) => {
        const linha = tabela.insertRow();
        linha.innerHTML = `
                    <td>${endereco.id}</td>
                    <td>${endereco.nome}</td>
                    <td>${endereco.cep}</td>
                    <td>${endereco.estado}</td>
                    <td>${endereco.cidade}</td>
                    <td>${endereco.bairro}</td>
                    <td>${endereco.logradouro}</td>
                    <td>
                        <button class="select-btn" onclick="selecionar(${index})">Selecionar</button>
                    </td>
                `;
    });
}

// Cadastrar novo endereço
const cadastrar = async () => {
    if (inputNome.value == '' || inputEstado.value == '' || inputEstado.value == '...') {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    const objEndereco = {
        nome: inputNome.value,
        cep: inputCEP.value,
        estado: inputEstado.value,
        cidade: inputCidade.value,
        bairro: inputBairro.value,
        logradouro: inputLogradouro.value
    };

    try {
        const response = await fetch(BACKEND_URL, {
            method: 'POST',
            body: JSON.stringify(objEndereco),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const enderecoSalvo = await response.json();

        enderecos.push(enderecoSalvo);
        renderizarTabela();
        limparCampos();
        alert('Endereço cadastrado com sucesso!');
    } catch (err) {
        console.error('Erro ao cadastrar endereço: ', err);
        // Simular cadastro sem backend
        const novoEndereco = {
            id: Date.now(),
            ...objEndereco
        };
        enderecos.push(novoEndereco);
        renderizarTabela();
        limparCampos();
        alert('Endereço cadastrado com sucesso! (modo simulado)');
    }
}

// Selecionar endereço para edição
const selecionar = (index) => {
    // Remover seleção anterior
    document.querySelectorAll('tbody tr').forEach(tr => tr.classList.remove('selected-row'));

    // Selecionar nova linha
    const linha = tabela.rows[index];
    linha.classList.add('selected-row');

    const endereco = enderecos[index];
    enderecoEditando = index;

    // Preencher campos com dados do endereço selecionado
    inputNome.value = endereco.nome;
    inputCEP.value = endereco.cep;
    inputEstado.value = endereco.estado;
    inputCidade.value = endereco.cidade;
    inputBairro.value = endereco.bairro;
    inputLogradouro.value = endereco.logradouro;

    // Alterar botões visíveis
    btnAdd.style.display = 'none';
    btnUpdate.style.display = 'inline-block';
    btnRemove.style.display = 'inline-block';
    btnCancel.style.display = 'inline-block';
}

// Atualizar endereço selecionado
const atualizar = async () => {
    if (enderecoEditando === null) return;

    if (inputNome.value == '' || inputEstado.value == '' || inputEstado.value == '...') {
        alert('Preencha todos os campos obrigatórios');
        return;
    }

    const enderecoAtualizado = {
        id: enderecos[enderecoEditando].id,
        nome: inputNome.value,
        cep: inputCEP.value,
        estado: inputEstado.value,
        cidade: inputCidade.value,
        bairro: inputBairro.value,
        logradouro: inputLogradouro.value
    };

    try {
        const response = await fetch(`${BACKEND_URL}/${enderecoAtualizado.id}`, {
            method: 'PUT',
            body: JSON.stringify(enderecoAtualizado),
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        enderecos[enderecoEditando] = enderecoAtualizado;
        renderizarTabela();
        cancelar();
        alert('Endereço atualizado com sucesso!');
    } catch (err) {
        console.error('Erro ao atualizar endereço: ', err);
        // Simular atualização sem backend
        enderecos[enderecoEditando] = enderecoAtualizado;
        renderizarTabela();
        cancelar();
        alert('Endereço atualizado com sucesso! (modo simulado)');
    }
}

// Remover endereço selecionado
const remover = async () => {
    if (enderecoEditando === null) return;

    if (!confirm('Tem certeza que deseja remover este endereço?')) return;

    const enderecoId = enderecos[enderecoEditando].id;

    try {
        const response = await fetch(`${BACKEND_URL}/${enderecoId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        enderecos.splice(enderecoEditando, 1);
        renderizarTabela();
        cancelar();
        alert('Endereço removido com sucesso!');
    } catch (err) {
        console.error('Erro ao remover endereço: ', err);
        // Simular remoção sem backend
        enderecos.splice(enderecoEditando, 1);
        renderizarTabela();
        cancelar();
        alert('Endereço removido com sucesso! (modo simulado)');
    }
}

// Cancelar operação e limpar formulário
const cancelar = () => {
    limparCampos();
    enderecoEditando = null;

    // Remover seleção da tabela
    document.querySelectorAll('tbody tr').forEach(tr => tr.classList.remove('selected-row'));

    // Restaurar botões originais
    btnAdd.style.display = 'inline-block';
    btnUpdate.style.display = 'none';
    btnRemove.style.display = 'none';
    btnCancel.style.display = 'none';
}

// Limpar todos os campos do formulário
const limparCampos = () => {
    inputNome.value = '';
    inputCEP.value = '';
    inputEstado.value = '';
    inputCidade.value = '';
    inputBairro.value = '';
    inputLogradouro.value = '';
}

// Inicializar aplicação - buscar endereços ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    buscarEnderecos();
});