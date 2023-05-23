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
        id: "",
        placa: placa.value,
        motorista: motorista.value,
        ajudantes: ajudantes,
        diaria: diaria.value,
        peso: peso.value,
        carregamentos: carregamentos.value,
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
};

const deletarDados = (id) => {
    const dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    dadosPlanilhaLocalStorage = dadosPlanilhaLocalStorage.filter((value) => {
        return value.id != id;
    });

    localStorage.setItem('dadosPlanilha', JSON.stringify(dadosPlanilhaLocalStorage));
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
        const tr = criarElementosHtml('tr');
        const thDiaria = criarElementosHtml('th', 'R$ DIÁRIAS');
        const thMotoristaCarregamentos = criarElementosHtml('th', 'MOTORISTA / CARREGAMENTOS');
        const thPlaca = criarElementosHtml('th', 'PLACA');
        const thAjudantes = criarElementosHtml('th', 'AJUDANTES');
        const thCidades = criarElementosHtml('th', 'CIDADES ROTA');
        const thAcoes = criarElementosHtml('th');
        const tbody = criarElementosHtml('tbody');
        
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

        tr.classList.add('text-center');

        thDiaria.classList.add('thDiaria');
        thMotoristaCarregamentos.classList.add('thMotoristaCarregamentos');
        thPlaca.classList.add('thPlaca');
        thAjudantes.classList.add('thAjudantes');
        thCidades.classList.add('thCidades');
        thAcoes.classList.add('thAcoes');

        divColCabecalho.appendChild(img);
        divColCabecalho.appendChild(br);
        divColCabecalho.appendChild(h5Cabecalho);
        divRowCabecalho.appendChild(divColCabecalho);
        bodyListarTabela.appendChild(divRowCabecalho);

        tr.appendChild(thDiaria);
        tr.appendChild(thMotoristaCarregamentos);
        tr.appendChild(thPlaca);
        tr.appendChild(thAjudantes);
        tr.appendChild(thCidades);
        tr.appendChild(thAcoes);

        thead.appendChild(tr);
        table.appendChild(thead);

        dadosPlanilhaLocalStorage.forEach((dados) => {
            tbody.appendChild(criarRowsTabela(dados));
        });

        table.appendChild(tbody);    
        divColConteudo.appendChild(table);
        divRowConteudo.appendChild(divColConteudo);
        bodyListarTabela.appendChild(divRowConteudo);

        console.log(bodyListarTabela);
    }
};

//Função para gerar os arrays de dados de ajudantes e cidades criar row tabela
const gerarArrayDadosSelect = (dadosSelect) => {
    const listaDados = [];

    for(let index = 0; index < dadosSelect.length; index++) {
        if(dadosSelect.options[index].selected) {
            listaDados.push(dadosSelect.options[index].value);
        }
    }

    return listaDados;
};

const criarRowsTabela = (dados) => {
    const tr = criarElementosHtml('tr');
    const tdDiaria = criarElementosHtml('td');
    const tdMotoristaCarregamentos = criarElementosHtml('td');
    const tdPlaca = criarElementosHtml('td');
    const tdAjudantes = criarElementosHtml('td');
    const tdCidades = criarElementosHtml('td');
    const tdAcoes = criarElementosHtml('td');

    tdDiaria.classList.add('text-center');
    tdMotoristaCarregamentos.classList.add('text-justify');
    tdPlaca.classList.add('text-center');
    tdAcoes.classList.add('text-center');

    tr.appendChild(tdDiaria);
    tr.appendChild(tdMotoristaCarregamentos);
    tr.appendChild(tdPlaca);
    tr.appendChild(tdAjudantes);
    tr.appendChild(tdCidades);
    tr.appendChild(tdAcoes);

    return tr;
};

//Funções para validas campos data relatorio e nome funcionario
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

document.getElementById('input-diaria').addEventListener('keyup', formatarCampoValor);
document.getElementById('input-peso').addEventListener('keyup', formatarCampoPeso);

document.getElementById('btn-adicionar').addEventListener('click', adicionarDados);

renderizarElementosOptionsForm();





