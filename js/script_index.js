const bodyListarTabela = document.getElementById('body-listar-tabela');

//Funções para ler arquivo json e buscar dados dos funcionarios e placas
const getFuncionariosLista = async () => {
    const funcionariosJson = await fetch("./dados/funcionarios.json");
    const funcionarios = await funcionariosJson.json();

    return funcionarios;
    
};

const getPlacasLista = async () => {
    const placasJson = await fetch("./dados/placas.json");
    const placas = await placasJson.json();

    return placas;
};

//Função para consultar API do ibge e buscar cidades do RN e PB
const getCidadesLista = async () => {
    const cidadesLista = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados/24|25/municipios');
    const cidades = await cidadesLista.json();

    return cidades;
};

//Funções para criar elementos e renderizar dados do Form
const criarElementosHtml = (tag, innerText='', innerHtml='') => {
    const element = document.createElement(tag);

    if(innerText) {
        element.innerText = innerText;
    }

    if(innerHtml) {
        element.innerHTML = innerHtml;
    }
  
    return element;
};

const renderizarElementosOptionsForm = async () => {
    const selectFuncionarios = document.getElementById('select-funcionario');
    const selectPlacas = document.getElementById('select-placa-veiculo');
    const selectMotoristas = document.getElementById('select-motorista');
    const selectAjudantes = document.getElementById('select-ajudantes');
    const selectCidades = document.getElementById('select-cidades');

    const funcionariosLista = await getFuncionariosLista();
    const placasLista = await getPlacasLista();
    const cidadesLista = await getCidadesLista();

    funcionariosLista.forEach(element => {
        const option = criarElementosHtml('option');
        
        if(element['funcao'] == 'adm') {
            option.value = element['nome'].toUpperCase();
            option.innerText = element['nome'].toUpperCase();

            selectFuncionarios.appendChild(option);
        }

        if(element['funcao'] == 'motorista') {
            option.value = element['nome'].toUpperCase();
            option.innerText = element['nome'].toUpperCase();

            selectMotoristas.appendChild(option);
        }

        if(element['funcao'] == 'ajudante') {
            option.value = element['nome'].toUpperCase();
            option.innerText = element['nome'].toUpperCase();

            selectAjudantes.appendChild(option);
        }
    });

    placasLista.forEach(element => {
        const option = criarElementosHtml('option');

        option.value = element['placa'].toUpperCase();
        option.innerText = element['placa'].toUpperCase();

        selectPlacas.appendChild(option);
    });

    cidadesLista.forEach(element => {
        const option = criarElementosHtml('option');

        option.value = element['nome'].toUpperCase();
        option.innerText = element['nome'].toUpperCase();
        
        selectCidades.appendChild(option);
    });

};

//Funções de crud para os dados da tabela
const adicionarDados = () => {
    const placa  = document.getElementById('select-placa-veiculo');
    const motorista = document.getElementById('select-motorista');
    const ajudantes = gerarArrayDadosSelect(document.getElementById('select-ajudantes'));
    const diaria = document.getElementById('input-diaria');
    const peso = document.getElementById('input-peso');
    const carregamentos = document.getElementById('input-carregamentos');
    const cidades = gerarArrayDadosSelect(document.getElementById('select-cidades'));

    const dadosPlanilha = {
        id: gerarIdAleatorio(1000, 9999),
        placa: validarCampos('placa', placa.value),
        motorista: validarCampos('motorista', motorista.value),
        ajudantes: ajudantes,
        diaria: validarCampos('diaria', diaria.value),
        peso: validarCampos('peso', peso.value),
        carregamentos: validarCampos('carregamentos', carregamentos.value),
        cidades: cidades
    }; 

    const dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];
    
    dadosPlanilhaLocalStorage.push(dadosPlanilha);
    localStorage.setItem('dadosPlanilha', JSON.stringify(dadosPlanilhaLocalStorage));
    
    placa.options.length = 0;
    motorista.options.length = 0;
    document.getElementById('select-ajudantes').options.length = 0;
    diaria.value = "";
    peso.value = "";
    carregamentos.value = "";
    document.getElementById('select-cidades').options.length = 0;

    placa.appendChild(criarElementosHtml('option'));
    motorista.appendChild(criarElementosHtml('option'));

    renderizarElementosOptionsForm();
    renderizarDadosTabela();
};

const deletarDados = (id) => {
    let dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    dadosPlanilhaLocalStorage = dadosPlanilhaLocalStorage.filter((value) => {
        return value.id != id;
    });

    localStorage.setItem('dadosPlanilha', JSON.stringify(dadosPlanilhaLocalStorage));

    renderizarDadosTabela();
};

const renderizarDadosTabela = () => {
    const dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    bodyListarTabela.innerHTML = '';

    if(dadosPlanilhaLocalStorage.length === 0) {
        const p = criarElementosHtml('p', 'TABELA VAZIA!!!');

        p.classList.add('text-center');
        bodyListarTabela.appendChild(p);
    }else {
        const divRowCabecalho = criarElementosHtml('div');
        const divColCabecalho = criarElementosHtml('div');
        const img = criarElementosHtml('img');
        const br = criarElementosHtml('br');
        const h5Cabecalho = criarElementosHtml('h5');
        const divRowConteudo = criarElementosHtml('div');
        const divColConteudo = criarElementosHtml('div');
        const table = criarElementosHtml('table');
        const thead = criarElementosHtml('thead');
        const tbody = criarElementosHtml('tbody');
        const trValorTotal = criarElementosHtml('tr', '', `<td colspan="6"><b>VALOR TOTAL:</b> R$ ${somarValorTotalDiarias()}</td>`);
        const divRowAssinaturaFuncionario = criarElementosHtml('div');
        const divColAssinaturaFuncionario = criarElementosHtml('div');
        const pLinha = criarElementosHtml('p');
        const pNomeFuncionario = criarElementosHtml('p');

        divRowCabecalho.classList.add('row');
        divColCabecalho.classList.add('col-md-12', 'text-center');

        img.src = "./img/logo_oficial_grupo_vicunha.png";
        img.classList.add('img-fluid');
        img.alt = "Logo Grupo Vicunha";
        img.width = "200";
        img.height = "200";

        h5Cabecalho.classList.add('h5-cabecalho');
        h5Cabecalho.innerHTML = `PLANILHA DE ROTA - ${validaCampoDataPlanilha()}`;

        divRowConteudo.classList.add('row');
        divColConteudo.classList.add('col-md-12', 'table-responsive');
        
        table.classList.add('table', 'table-bordered', 'table-listar');

        divRowAssinaturaFuncionario.classList.add('row', 'row-assinatura');
        divColAssinaturaFuncionario.classList.add('col-md-12', 'text-center');

        pLinha.innerText = '__________________________________________________________';
        pNomeFuncionario.innerText = validaCampoNomeFuncionario();

        divColAssinaturaFuncionario.appendChild(pLinha);
        divColAssinaturaFuncionario.appendChild(pNomeFuncionario);
        divRowAssinaturaFuncionario.appendChild(divColAssinaturaFuncionario);

        divColCabecalho.appendChild(img);
        divColCabecalho.appendChild(br);
        divColCabecalho.appendChild(h5Cabecalho);
        divRowCabecalho.appendChild(divColCabecalho);
        bodyListarTabela.appendChild(divRowCabecalho);

        thead.appendChild(criarRowsThead(true));
        table.appendChild(thead);

        dadosPlanilhaLocalStorage.forEach((dados) => {
            tbody.appendChild(criarRowsTbody(dados, true));
        });

        table.appendChild(tbody);  
        table.appendChild(trValorTotal);  
        divColConteudo.appendChild(table);
        divRowConteudo.appendChild(divColConteudo);
        bodyListarTabela.appendChild(divRowConteudo);
        bodyListarTabela.appendChild(divRowAssinaturaFuncionario);

    }
};

//Função para gerar os arrays de dados de ajudantes e cidades / gerar id
const gerarArrayDadosSelect = (dadosSelect) => {
    const listaDados = [];

    for(let index = 0; index < dadosSelect.length; index++) {
        if(dadosSelect.options[index].selected) {
            listaDados.push(dadosSelect.options[index].value);
        }
    }

    return listaDados;
};

const gerarIdAleatorio = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min+'0'+Math.floor(Math.random() * (max - min + 1)) + (max);
};

//Funções para gerar rows tabela 
const criarRowsThead = (estadoHead) => {
    const tr = criarElementosHtml('tr');
    const thDiaria = criarElementosHtml('th', 'R$ DIÁRIAS');
    const thMotoristaCarregamentos = criarElementosHtml('th', 'MOTORISTA / CARREGAMENTOS');
    const thPlaca = criarElementosHtml('th', 'PLACA');
    const thAjudantes = criarElementosHtml('th', 'AJUDANTES');
    const thCidades = criarElementosHtml('th', 'CIDADES ROTA');
    const thAcoes = criarElementosHtml('th');

    tr.classList.add('text-center');

    thDiaria.classList.add('thDiaria');
    thMotoristaCarregamentos.classList.add('thMotoristaCarregamentos');
    thPlaca.classList.add('thPlaca');
    thAjudantes.classList.add('thAjudantes');
    thCidades.classList.add('thCidades');
    thAcoes.classList.add('thAcoes');

    if(estadoHead) {

        tr.appendChild(thDiaria);
        tr.appendChild(thMotoristaCarregamentos);
        tr.appendChild(thPlaca);
        tr.appendChild(thAjudantes);
        tr.appendChild(thCidades);
        tr.appendChild(thAcoes);

        return tr;

    }else {

        tr.appendChild(thDiaria);
        tr.appendChild(thMotoristaCarregamentos);
        tr.appendChild(thPlaca);
        tr.appendChild(thAjudantes);
        tr.appendChild(thCidades);

        return tr;
    }
};

const criarRowsTbody = (dados, estadoBody) => {
    const tr = criarElementosHtml('tr');
    const tdDiaria = criarElementosHtml('td');
    const tdMotoristaCarregamentos = criarElementosHtml('td');
    const tdPlaca = criarElementosHtml('td');
    const tdAcoes = criarElementosHtml('td');
    const pMotorista = criarElementosHtml('p');
    const pCarregamentos = criarElementosHtml('p');
    const pPeso = criarElementosHtml('p');
    const btnDeletar = criarElementosHtml('button', '', `<span class="material-symbols-outlined">delete</span>`);
    const btnVizualizar = criarElementosHtml('button', '', `<span class="material-symbols-outlined">file_open</span>`);

    tdDiaria.classList.add('text-center');
    tdMotoristaCarregamentos.classList.add('text-justify');
    tdPlaca.classList.add('text-center');
    tdAcoes.classList.add('text-center');

    pCarregamentos.classList.add('pRowsMotoristaCarregamentos');
    pPeso.classList.add('pRowsMotoristaCarregamentos');

    btnDeletar.type = "button";
    btnVizualizar.type = "button";

    btnDeletar.classList.add('btn', 'btn-link', 'btn-lg', 'btnsAcoes');
    btnVizualizar.classList.add('btn', 'btn-link', 'btn-lg', 'btnsAcoes');

    btnDeletar.addEventListener('click', () => {
        deletarDados(dados['id']);
    });

    pMotorista.innerText = dados['motorista'];
    pCarregamentos.innerText = dados['carregamentos'];
    pPeso.innerText = `${dados['peso']} KG`;
    
    tdDiaria.innerText = `R$ ${dados['diaria']}`;
    tdPlaca.innerText = dados['placa'];

    tdMotoristaCarregamentos.appendChild(pMotorista);
    tdMotoristaCarregamentos.appendChild(pCarregamentos);
    tdMotoristaCarregamentos.appendChild(pPeso);
    tdAcoes.appendChild(btnVizualizar);
    tdAcoes.appendChild(btnDeletar);
    
    if(estadoBody) {
        tr.appendChild(tdDiaria);
        tr.appendChild(tdMotoristaCarregamentos);
        tr.appendChild(tdPlaca);
        tr.appendChild(renderizarRowAjudantes(dados['ajudantes']));
        tr.appendChild(renderizarRowCidades(dados['cidades']));
        tr.appendChild(tdAcoes);

        return tr;

    }else {
        tr.appendChild(tdDiaria);
        tr.appendChild(tdMotoristaCarregamentos);
        tr.appendChild(tdPlaca);
        tr.appendChild(renderizarRowAjudantes(dados['ajudantes']));
        tr.appendChild(renderizarRowCidades(dados['cidades']));

        return tr;
    }
    
};

const renderizarRowAjudantes = (ajudantes) => {
    const td = criarElementosHtml('td');
    
    if(ajudantes.length === 0) {
        const p = criarElementosHtml('p', '(vazio)');

        p.classList.add('pRowsAjudantes');

        td.appendChild(p);

        return td;

    }else {
        for (let index = 0; index < ajudantes.length; index++) {
            const p = criarElementosHtml('p', '', `${ajudantes[index]}`);
            
            p.classList.add('pRowsAjudantes');

            td.appendChild(p);
        }

        return td;
    }

};

const renderizarRowCidades = (cidades) => {
    const td = criarElementosHtml('td');

    if(cidades.length === 0) {
        const p = criarElementosHtml('p', '(vazio)');

        td.appendChild(p);

        return td;

    }else {
        let retorno = '';

        for (let index = 0; index < cidades.length; index++) {
            retorno += cidades[index]+', ';
            
        }

        td.innerText = retorno.slice(0, retorno.length-2);

        return td;
    }
};

//Funções para validar campos data relatorio, nome funcionario e demais campos
const validaCampoDataPlanilha = () => {
    const data = document.getElementById('input-data-planilha').value;

    if(data === '') {
        const dataHora = new Date().toLocaleString("pt-br", {
            timeZone: "America/Fortaleza"
        });

        return dataHora.slice(0, 10);

    }else {
        return data.match(/^[0-9]{4}\-[0-9]{2}\-[0-9]{2}/)[0].split('-').reverse().join('/');

    }
};

const validaCampoNomeFuncionario = () => {
    const funcionario = document.getElementById('select-funcionario').value;

    if(funcionario === '') {
        return 'JOSE RICARDO PEREIRA DE LIMA';
    }else {
        return funcionario;
    }
};

const validarCampos = (campo, valor) => {
    let placa = '(vazio)';
    let motorista = '(vazio)';
    let diaria = '0,00';
    let peso = '0.000';
    let carregamentos = '(vazio)';

    switch (campo) {
        case 'placa':
            if(valor != '') {
                placa = valor;
            }

            return placa;

            break;

        case 'diaria':
            if(valor != '') {
                diaria = valor;
            }

            return diaria;

            break;

        case 'motorista':
            if(valor != '') {
                motorista = valor;
            }

            return motorista;
            break;

        case 'peso':
            if(valor != '') {
                peso = valor;
            }

            return peso;
            break;
        
        case 'carregamentos':
            if(valor != '') {
                carregamentos = valor;
            }

            return carregamentos;
            break;
    };
};

//Funções para formatar campo peso e valor 
const formatarCampoValor = () => {
    const campo = document.getElementById('input-diaria');

    let retorno = campo.value.replace(/\D/g,'');
    retorno = (retorno/100).toFixed(2) + '';
    retorno = retorno.replace(".", ",");
    retorno = retorno.replace(/(\d)(\d{3})(\d{3}),/g, "$1.$2.$3,");
    retorno = retorno.replace(/(\d)(\d{3}),/g, "$1.$2,");

    campo.value = retorno;
};

const formatarCampoPeso = () => {
    const campo = document.getElementById('input-peso');

    let retorno = campo.value, integer = retorno.split('.')[0];
    retorno = retorno.replace(/\D/g, "");
    retorno = retorno.replace(/^[0]+/, "");

    if(retorno.length <= 3 || !integer) {
        if (retorno.length === 1) retorno = '0.00' + retorno;

		if (retorno.length === 2) retorno = '0.0' + retorno;

		if (retorno.length === 3) retorno = '0.' + retorno;
    }else {
        retorno = retorno.replace(/^(\d{1,})(\d{3})$/, "$1.$2");
    }

    campo.value = retorno;
};

//Função somar valor total das diarias 
const somarValorTotalDiarias = () => {
    const dadosPlanilha = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];
    let valorTotal = '0,00';
    
    for (let index = 0; index < dadosPlanilha.length; index++) {
        let valor = '0,00';

        if(dadosPlanilha[index]['diaria'] !== '') {
            valor = dadosPlanilha[index]['diaria'];
        }

        const resultado = (parseInt(valorTotal.replace(/[^\d]+/g,'')) + parseInt(valor.replace(/[^\d]+/g,''))) / 100;
        valorTotal = resultado.toLocaleString('pt-br', {minimumFractionDigits: 2});
    }

    return valorTotal;
};

document.getElementById('input-diaria').addEventListener('keyup', formatarCampoValor);
document.getElementById('input-peso').addEventListener('keyup', formatarCampoPeso);

document.getElementById('btn-adicionar').addEventListener('click', adicionarDados);

renderizarElementosOptionsForm();
renderizarDadosTabela();





