let tarefas = [];
let filtroAtivo = 'todos';
let idEditando = null;

// inicialização + pegar tarefas salvas
function init() {
    const dados = localStorage.getItem('lista_tarefas');
    if (dados) {
        tarefas = JSON.parse(dados);
    }
    renderizarLista();
}

// função para salvar no localstorage
function salvarLocalStorage() {
    localStorage.setItem('lista_tarefas', JSON.stringify(tarefas));
}

// geração de id para tarefas
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// validação do formulário
function validarFormulario() {
    let valido = true;

    const titulo     = document.getElementById('inp-titulo');
    const desc       = document.getElementById('inp-desc');
    const prioridade = document.getElementById('inp-prioridade');

    // tirar erros
    [titulo, desc, prioridade].forEach(el => el.classList.remove('error'));
    ['err-titulo', 'err-desc', 'err-prioridade'].forEach(id => {
        document.getElementById(id).classList.remove('show');
    });

    // título
    if (!titulo.value.trim()) {
        titulo.classList.add('error');
        document.getElementById('err-titulo').classList.add('show');
        valido = false;
    }

    // descrição
    if (!desc.value.trim()) {
        desc.classList.add('error');
        document.getElementById('err-desc').classList.add('show');
        valido = false;
    }

    // prioridade
    if (!prioridade.value) {
        prioridade.classList.add('error');
        document.getElementById('err-prioridade').classList.add('show');
        valido = false;
    }

    return valido;
}

// cadastrar tarefas
function cadastrarTarefa() {
    if (!validarFormulario()) return; // cancela se tiver algum campo inválido

    const novaTarefa = {
        id:         gerarId(),
        titulo:     document.getElementById('inp-titulo').value.trim(),
        descricao:  document.getElementById('inp-desc').value.trim(),
        prioridade: document.getElementById('inp-prioridade').value,
        status:     document.getElementById('inp-status').value
    };

    tarefas.push(novaTarefa);
    salvarLocalStorage();
    limparFormulario();
    renderizarLista();
    exibirNotificacao( 'Tarefa adicionada com sucesso!');
}

// limpar formulário
function limparFormulario() {
    document.getElementById('inp-titulo').value     = '';
    document.getElementById('inp-desc').value       = '';
    document.getElementById('inp-prioridade').value = '';
    document.getElementById('inp-status').value     = 'Pendente';
}

// marcar como concluída ou pendente
function alternarStatus(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    tarefa.status = tarefa.status === 'Concluída' ? 'Pendente' : 'Concluída';

    salvarLocalStorage();
    renderizarLista();
    exibirNotificacao(`Tarefa marcada como ${tarefa.status}.`);
}

// excluir tarefa
function excluirTarefa(id) {
    // confirmação antes de excluir
    if (!confirm('Tem certeza que deseja excluir esta tarefa?')) return;

    // filtra removendo a tarefa pelo ID
    tarefas = tarefas.filter(t => t.id !== id);

    salvarLocalStorage();
    renderizarLista();
    exibirNotificacao('Tarefa excluída.');
}

// modal de edição
function modalEdicao(id) {
    const tarefa = tarefas.find(t => t.id === id);
    if (!tarefa) return;

    idEditando = id; // Guarda o ID que está sendo editado

    // Preenche os campos do modal com os dados atuais
    document.getElementById('edit-titulo').value     = tarefa.titulo;
    document.getElementById('edit-desc').value       = tarefa.descricao;
    document.getElementById('edit-prioridade').value = tarefa.prioridade;
    document.getElementById('edit-status').value     = tarefa.status;

    // Limpa erros anteriores do modal
    ['edit-err-titulo', 'edit-err-desc'].forEach(id => {
        document.getElementById(id).classList.remove('show');
    });
    ['edit-titulo', 'edit-desc'].forEach(id => {
        document.getElementById(id).classList.remove('error');
    });

    document.getElementById('modal').classList.add('open'); // Exibe modal
}

function fecharModal() {
    document.getElementById('modal').classList.remove('open');
    idEditando = null;
}

// salva edição
function salvarEdicao() {
    const titulo = document.getElementById('edit-titulo');
    const desc   = document.getElementById('edit-desc');
    let valido   = true;

    // revalidação dos campos obrigatórios do modal
    if (!titulo.value.trim()) {
        titulo.classList.add('error');
        document.getElementById('edit-err-titulo').classList.add('show');
        valido = false;
    } else {
        titulo.classList.remove('error');
        document.getElementById('edit-err-titulo').classList.remove('show');
    }

    if (!desc.value.trim()) {
        desc.classList.add('error');
        document.getElementById('edit-err-desc').classList.add('show');
        valido = false;
    } else {
        desc.classList.remove('error');
        document.getElementById('edit-err-desc').classList.remove('show');
    }

    if (!valido) return;

    // localiza e atualiza a tarefa no array
    const tarefa = tarefas.find(t => t.id === idEditando);
    if (tarefa) {
        tarefa.titulo     = titulo.value.trim();
        tarefa.descricao  = desc.value.trim();
        tarefa.prioridade = document.getElementById('edit-prioridade').value;
        tarefa.status     = document.getElementById('edit-status').value;
    }

    salvarLocalStorage();
    fecharModal();
    renderizarLista();
    exibirNotificacao( 'Tarefa atualizada!');
}

// aplicar filtros
function aplicarFiltro(filtro, btn) {
    filtroAtivo = filtro;

    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    renderizarLista();
}

// tag de prioridade
function tagPrioridade(prioridade) {
    const tags = { 'Baixa': 'low', 'Média': 'med', 'Alta': 'high' };
    return `<span class="tag tag-${tags[prioridade] || 'pend'}">${prioridade}</span>`;
}

// renderizar tarefas, filtra as tarefas conforme busca e filtro ativos, e atualiza o DOM com os cards correspondentes.
function renderizarLista() {
    const busca  = document.getElementById('inp-busca').value.toLowerCase().trim();
    const lista  = document.getElementById('task-list');
    const empty  = document.getElementById('empty-state');

    // filtra por texto de busca (querySelector + manipulação de valor)
    let resultado = tarefas.filter(t =>
        t.titulo.toLowerCase().includes(busca)
    );

    // filtra por status
    if (filtroAtivo !== 'todos') {
        resultado = resultado.filter(t => t.status === filtroAtivo);
    }

    // atualiza o contador
    document.getElementById('tasks-count').textContent =
        `${resultado.length} tarefa${resultado.length !== 1 ? 's' : ''}`;

    // caso lista vazia
    if (resultado.length === 0) {
        lista.innerHTML = '';
        empty.classList.add('show');
    } else {
        empty.classList.remove('show');

        // criar cards dinamicamente via innerHTML (manipulação do DOM)
        lista.innerHTML = resultado.map(t => {
            const isDone = t.status === 'Concluída';
            return `
        <article class="task-card ${isDone ? 'done' : ''}" id="card-${t.id}">

          <!-- checkbox para marcar como concluída -->
          <div class="task-check ${isDone ? 'checked' : ''}"
               onclick="alternarStatus('${t.id}')"
               role="checkbox"
               aria-checked="${isDone}"
               aria-label="Marcar tarefa como ${isDone ? 'pendente' : 'concluída'}"
               tabindex="0"
               onkeydown="if(event.key==='Enter'||event.key===' ')alternarStatus('${t.id}')">
          </div>

          <!-- conteúdo da tarefa -->
          <div class="task-body">
            <div class="task-meta">
              <span class="task-title">${escaparHTML(t.titulo)}</span>
              ${tagPrioridade(t.prioridade)}
              <span class="badge ${isDone ? 'badge-done' : 'badge-pend'}">${t.status}</span>
            </div>
            <p class="task-description">${escaparHTML(t.descricao)}</p>
          </div>

          <!-- botões  -->
          <div class="task-actions">
            <button class="btn-icon"
                    onclick="modalEdicao('${t.id}')"
                    title="Editar tarefa"
                    aria-label="Editar tarefa: ${escaparHTML(t.titulo)}">Editar</button>
            <button class="btn-icon delete"
                    onclick="excluirTarefa('${t.id}')"
                    title="Excluir tarefa"
                    aria-label="Excluir tarefa: ${escaparHTML(t.titulo)}">Excluir</button>
          </div>

        </article>
      `;
        }).join('');
    }

    // atualiza o header
    atualizarStats();
}

// atualizar resumo do header
function atualizarStats() {
    const total      = tarefas.length;
    const concluidas = tarefas.filter(t => t.status === 'Concluída').length;
    const pendentes  = total - concluidas;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-done').textContent  = concluidas;
    document.getElementById('stat-pend').textContent  = pendentes;
}

// gera a notificação
function exibirNotificacao(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').textContent  = msg;

    toast.classList.add('show');

    // vai ocultar após 2,8 segundos
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// função que previne injeção de HTML nas strings exibidas
function escaparHTML(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// fecha o modal ao clicar fora dele
document.getElementById('modal').addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
});

// inicia
init();