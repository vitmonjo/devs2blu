const urlBase = 'http://localhost:3000';
let editingId = null;

function listar() {
    document.getElementById('tableContainer').innerHTML = '<div class="loading">Carregando...</div>';

    fetch(urlBase)
        .then(res => res.json())
        .then(data => {
            renderTable(data);
            console.table(data);
        })
        .catch(e => {
            document.getElementById('tableContainer').innerHTML = '<div class="loading">Erro ao carregar dados</div>';
            console.error(e);
        });
}

function renderTable(data) {
    const container = document.getElementById('tableContainer');

    if (!data || data.length === 0) {
        container.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhuma pessoa cadastrada</h3>
                        <p>Adicione a primeira pessoa usando o formulário acima</p>
                    </div>
                `;
        return;
    }

    const table = `
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nome</th>
                            <th>Idade</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(pessoa => `
                            <tr id="row-${pessoa.id}">
                                <td>${pessoa.id}</td>
                                <td id="nome-${pessoa.id}">${pessoa.nome}</td>
                                <td id="idade-${pessoa.id}">${pessoa.idade}</td>
                                <td>
                                    <button class="btn btn-edit" onclick="editarPessoa(${pessoa.id}, '${pessoa.nome}', ${pessoa.idade})">
                                        ✏️ Editar
                                    </button>
                                    <button class="btn btn-delete" onclick="confirmarDelecao(${pessoa.id}, '${pessoa.nome}')">
                                        🗑️ Deletar
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    container.innerHTML = table;
}

function adicionar() {
    const nome = document.getElementById('addNome').value.trim();
    const idade = parseInt(document.getElementById('addIdade').value);

    if (!nome || !idade) {
        alert('⚠️ Nome e idade são obrigatórios');
        return;
    }

    if (idade < 0) {
        alert('⚠️ Idade deve ser um número positivo');
        return;
    }

    fetch(urlBase, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, idade }),
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao adicionar');
            return res.json();
        })
        .then(data => {
            alert('✅ Pessoa adicionada com sucesso!');
            listar();
            document.getElementById('addNome').value = '';
            document.getElementById('addIdade').value = '';
        })
        .catch(e => alert('❌ ' + e.message));
}

function editarPessoa(id, nome, idade) {
    if (editingId !== null) {
        cancelarEdicao();
    }

    editingId = id;

    const nomeCell = document.getElementById(`nome-${id}`);
    const idadeCell = document.getElementById(`idade-${id}`);
    const row = document.getElementById(`row-${id}`);

    nomeCell.innerHTML = `<input type="text" class="edit-input" id="edit-nome-${id}" value="${nome}">`;
    idadeCell.innerHTML = `<input type="number" class="edit-input" id="edit-idade-${id}" value="${idade}" min="0">`;

    const actionsCell = row.querySelector('td:last-child');
    actionsCell.innerHTML = `
                <button class="btn btn-save" onclick="salvarEdicao(${id})">
                    💾 Salvar
                </button>
                <button class="btn btn-cancel" onclick="cancelarEdicao()">
                    ❌ Cancelar
                </button>
            `;
}

function salvarEdicao(id) {
    const nome = document.getElementById(`edit-nome-${id}`).value.trim();
    const idade = parseInt(document.getElementById(`edit-idade-${id}`).value);

    if (!nome || !idade) {
        alert('⚠️ Nome e idade são obrigatórios');
        return;
    }

    if (idade < 0) {
        alert('⚠️ Idade deve ser um número positivo');
        return;
    }

    fetch(`${urlBase}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, idade }),
    })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao atualizar');
            return res.json();
        })
        .then(data => {
            alert('✅ Pessoa atualizada com sucesso!');
            editingId = null;
            listar();
        })
        .catch(e => alert('❌ ' + e.message));
}

function cancelarEdicao() {
    editingId = null;
    listar();
}

function confirmarDelecao(id, nome) {
    if (confirm(`🗑️ Tem certeza que deseja deletar "${nome}"?`)) {
        deletarPessoa(id);
    }
}

function deletarPessoa(id) {
    fetch(`${urlBase}/${id}`, { method: 'DELETE' })
        .then(res => {
            if (!res.ok) throw new Error('Erro ao deletar');
            return res.json();
        })
        .then(data => {
            alert('✅ Pessoa deletada com sucesso!');
            listar();
        })
        .catch(e => alert('❌ ' + e.message));
}

// Carrega a lista ao iniciar
listar();