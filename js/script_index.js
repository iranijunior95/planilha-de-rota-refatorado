const bodyListarTabela = document.getElementById('body-listar-tabela');
const footerImprimir = document.getElementById('footer-imprimir');

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

const renderizarSelectFuncionarios = async () => {
    const selectFuncionarios = document.getElementById('select-funcionario');
    const funcionariosLista = await getFuncionariosLista();

    funcionariosLista.forEach(element => {
        const option = criarElementosHtml('option');

        if(element['funcao'] == 'adm') {
            option.value = element['nome'].toUpperCase();
            option.innerText = element['nome'].toUpperCase();

            selectFuncionarios.appendChild(option);
        }
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
    footerImprimir.innerHTML = '';

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
        const btnImprimir = criarElementosHtml('button', '', '<i class="fa fa-print" aria-hidden="true"></i> <b>IMPRIMIR</b>');

        divRowCabecalho.classList.add('row', 'row-cabecalho');
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

        pNomeFuncionario.classList.add('pNomeFuncionario');

        btnImprimir.type = "button";
        btnImprimir.classList.add('btn', 'btn-link', 'btn-sm', 'btn-imprimir');
        btnImprimir.addEventListener('click', imprimirDadosPlanilha);

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

        footerImprimir.appendChild(btnImprimir);

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

//Função para aplicar dados data e funcionario na tabela
const aplicarDados = () => {
    const dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    if(dadosPlanilhaLocalStorage.length !== 0) {
        const cabecalhoData = document.getElementsByClassName('h5-cabecalho');
        const assinaturaFuncionario = document.getElementsByClassName('pNomeFuncionario');

        cabecalhoData[0].innerText = `PLANILHA DE ROTA - ${validaCampoDataPlanilha()}`;
        assinaturaFuncionario[0].innerText = validaCampoNomeFuncionario();
    }
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
        thCidades.classList.remove('thCidades');
        thCidades.classList.add('thCidadesConteudo');

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

    btnDeletar.classList.add('btn', 'btn-link', 'btn-sm', 'btnsAcoes');
    btnVizualizar.classList.add('btn', 'btn-link', 'btn-sm', 'btnsAcoes');

    btnDeletar.addEventListener('click', () => {
        deletarDados(dados['id']);
    });

    btnVizualizar.addEventListener('click', () => {
        imprimirPlanilhaIndividual(dados['id']);
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

//Funçoes para imprimir planilha e renderizar os dados a serem impressos
const imprimirDadosPlanilha = () => {
    const dadosPlanilhaLocalStorage = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    const head = document.querySelector('head');
    const conteudoCabecalho = document.getElementsByClassName('row-cabecalho');
    const thead = criarElementosHtml('thead');
    const tbody = criarElementosHtml('tbody');
    const conteudoAssinatura = document.getElementsByClassName('row-assinatura');

    thead.appendChild(criarRowsThead(false));

    dadosPlanilhaLocalStorage.forEach((dados) => {
        tbody.appendChild(criarRowsTbody(dados, false));
    });
    
    const conteudoHtml = `<!DOCTYPE html>
                          <html lang="pt-br">
                            ${head.innerHTML}
                            <body style="background-color: #FFFFFF;">
                                <div class="container-fluid">
                                    <div class="row">
                                        ${conteudoCabecalho[0].innerHTML}
                                    </div>

                                    <div class="row">
                                        <div class="col-md-12 table-responsive">
                                            <table class="table table-bordered table-listar">
                                                <thead>
                                                ${thead.innerHTML}
                                                </thead>

                                                <tbody>
                                                ${tbody.innerHTML}
                                                <tr>
                                                    <td colspan="6"><b>VALOR TOTAL:</b> R$ ${somarValorTotalDiarias()}</td>
                                                </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <div class="row row-assinatura">
                                        ${conteudoAssinatura[0].innerHTML}
                                    </div>
                                    
                                </div>

                                <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
                                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
                                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
                                <script src="https://cdn.jsdelivr.net/npm/select2@4.0.13/dist/js/select2.min.js" integrity="sha256-AFAYEOkzB6iIKnTYZOdUf9FFje6lOTYdwRJKwTN5mks=" crossorigin="anonymous"></script>
                            </body>
                          </html>`;
                          
    const win = window.open('', '', 'height=800, width=1200');

    win.document.write(conteudoHtml);

    setTimeout(function(){ 
        win.print()
        win.close()
    }, 1000);
    
};

const imprimirPlanilhaIndividual = (id) => {
    const dadosPlanilha = retornaConteudoVizualizar(id);
    const divImg = criarElementosHtml('div');
    const img = criarElementosHtml('img');
    const divTableMotorista = criarElementosHtml('div');
    const tableMotorista = criarElementosHtml('table');
    const divTableAjudante01 = criarElementosHtml('div');
    const tableAjudante01 = criarElementosHtml('table');
    const theadAjudante01 = criarElementosHtml('thead');
    const trTheadAjudante01 = criarElementosHtml('tr', '', '<th colspan="4">ADIANTAMENTO PARA DESPESAS DE VIAGEM</th>');
    const divTableAjudante02 = criarElementosHtml('div');
    const tableAjudante02 = criarElementosHtml('table');
    const theadAjudante02 = criarElementosHtml('thead');
    const trTheadAjudante02 = criarElementosHtml('tr', '', '<th colspan="4">ADIANTAMENTO PARA DESPESAS DE VIAGEM</th>');
    const theadMotorista = criarElementosHtml('thead');
    const trTheadMotorista = criarElementosHtml('tr', '', '<th colspan="4">ADIANTAMENTO PARA DESPESAS DE VIAGEM</th>');
    const tbodyMotorista = criarElementosHtml('tbody');
    const tbodyAjudante01 = criarElementosHtml('tbody');
    const tbodyAjudante02 = criarElementosHtml('tbody');
    const trNomeMotorista = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">MOTORISTA</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['motorista']}</td>`);
    const trPlaca = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">PLACA</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['placa']}</td>`);
    const trCarregamentos = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">Nº CARREGO</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['carregamentos']}</td>`);
    const trData = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DATA</td><td style="width: 70%;" class="text-center">${validaCampoDataPlanilha()}</td>`);
    const trDiariaMotorista = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DIÁRIA</td><td style="width: 70%;" class="text-center">R$ ${dadosPlanilha['valorDiarias']}</td>`);
    const trChapa = criarElementosHtml('tr', '', '<td style="width: 30%; font-weight: bold;" class="text-left">CHAPA</td><td style="width: 70%;" class="text-center"></td>');
    const trBorracharia = criarElementosHtml('tr', '', '<td style="width: 30%; font-weight: bold;" class="text-left">BORRACHARIA</td><td style="width: 70%;" class="text-center"></td>');
    const trGratificacao = criarElementosHtml('tr', '', '<td style="width: 30%; font-weight: bold;" class="text-left">GRATIFICAÇÃO</td><td style="width: 70%;" class="text-center"></td>');
    const trCombustivel = criarElementosHtml('tr', '', '<td style="width: 30%; font-weight: bold;" class="text-left">COMBUSTÍVEL</td><td style="width: 70%;" class="text-center"></td>');
    const trNomeAjudante01 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">AJUDANTE</td><td style="width: 70%;" class="text-center">${dadosPlanilha['ajudante01']['nome']}</td>`);
    const trPlacaAjudante01 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">PLACA</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['placa']}</td>`);
    const trCarregamentosAjudante01 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">Nº CARREGO</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['carregamentos']}</td>`);
    const trDataAjudante01 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DATA</td><td style="width: 70%;" class="text-center">${validaCampoDataPlanilha()}</td>`);
    const trDiariaAjudante01 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DIÁRIA</td><td style="width: 70%;" class="text-center">R$ ${dadosPlanilha['ajudante01']['diaria']}</td>`);
    const trNomeAjudante02 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">AJUDANTE</td><td style="width: 70%;" class="text-center">${dadosPlanilha['ajudante02']['nome']}</td>`);
    const trPlacaAjudante02 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">PLACA</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['placa']}</td>`);
    const trCarregamentosAjudante02 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">Nº CARREGO</td><td style="width: 70%;" class="text-center">${dadosPlanilha['dados'][0]['carregamentos']}</td>`);
    const trDataAjudante02 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DATA</td><td style="width: 70%;" class="text-center">${validaCampoDataPlanilha()}</td>`);
    const trDiariaAjudante02 = criarElementosHtml('tr', '', `<td style="width: 30%; font-weight: bold;" class="text-left">DIÁRIA</td><td style="width: 70%;" class="text-center">R$ ${dadosPlanilha['ajudante02']['diaria']}</td>`);

    img.src = "./img/logo_oficial_grupo_vicunha.png";
    img.classList.add('img-fluid');
    img.alt = "Logo Grupo Vicunha";
    img.width = "200";
    img.height = "200";

    divImg.appendChild(img);

    tableMotorista.classList.add('table', 'table-bordered');
    tableAjudante01.classList.add('table', 'table-bordered');
    tableAjudante02.classList.add('table', 'table-bordered');

    trTheadMotorista.classList.add('text-center');
    trTheadAjudante01.classList.add('text-center');
    trTheadAjudante02.classList.add('text-center');
    
    theadMotorista.appendChild(trTheadMotorista);
    theadAjudante01.appendChild(trTheadAjudante01);
    theadAjudante02.appendChild(trTheadAjudante02);

    tbodyMotorista.appendChild(trNomeMotorista);
    tbodyMotorista.appendChild(trPlaca);
    tbodyMotorista.appendChild(trCarregamentos);
    tbodyMotorista.appendChild(trData);
    tbodyMotorista.appendChild(trDiariaMotorista);
    tbodyMotorista.appendChild(trChapa);
    tbodyMotorista.appendChild(trBorracharia);
    tbodyMotorista.appendChild(trGratificacao);
    tbodyMotorista.appendChild(trCombustivel);

    tbodyAjudante01.appendChild(trNomeAjudante01);
    tbodyAjudante01.appendChild(trPlacaAjudante01);
    tbodyAjudante01.appendChild(trCarregamentosAjudante01);
    tbodyAjudante01.appendChild(trDataAjudante01);
    tbodyAjudante01.appendChild(trDiariaAjudante01);

    tbodyAjudante02.appendChild(trNomeAjudante02);
    tbodyAjudante02.appendChild(trPlacaAjudante02);
    tbodyAjudante02.appendChild(trCarregamentosAjudante02);
    tbodyAjudante02.appendChild(trDataAjudante02);
    tbodyAjudante02.appendChild(trDiariaAjudante02);

    tableMotorista.appendChild(theadMotorista);
    tableMotorista.appendChild(tbodyMotorista);

    tableAjudante01.appendChild(theadAjudante01);
    tableAjudante01.appendChild(tbodyAjudante01);

    tableAjudante02.appendChild(theadAjudante02);
    tableAjudante02.appendChild(tbodyAjudante02);

    divTableMotorista.appendChild(tableMotorista);
    divTableAjudante01.appendChild(tableAjudante01);
    divTableAjudante02.appendChild(tableAjudante02);

    const conteudoHtml = `<!DOCTYPE html>
                          <html lang="pt-br">
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                                <link rel="shortcut icon" href="./img/favicon_vicunha_icon.ico" type="image/x-icon" />

                                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
                                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ttskch/select2-bootstrap4-theme/dist/select2-bootstrap4.min.css">
                                <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />

                                <style>
                                    .table td, .table th {
                                        padding: 5px;
                                        border: 1px solid #95999d;
                                    }

                                </style>

                                <title>PLANILHA DE ROTA</title>
                            </head>
                            <body>
                                <div class="container">

                                    <div class="row">
                                        <div class="col-md-12 text-center">
                                            ${divImg.innerHTML}                       
                                        </div>
                                    </div>

                                    <br>

                                    <div class="row">
                                        <div class="col-md-2"></div>

                                        <div class="col-md-8">
                                            ${divTableMotorista.innerHTML}
                                        </div>

                                        <div class="col-md-2"></div>
                                    </div>

                                    <br>

                                    <div class="row" style="margin-top: 25px;">
                                        <div class="col-md-12 text-center">
                                            <p>________________________________________________________________________</p>
                                            <p style="margin-top: -15px; font-weight: bold;">MOTORISTA: ${dadosPlanilha['dados'][0]['motorista']}</p>
                                        </div>
                                    </div>

                                    <br><br><br><br>

                                    <div class="row">
                                        <div class="col-md-6">
                                            ${divTableAjudante01.innerHTML}

                                            <br>

                                            <div class="row" style="margin-top: 30px;">
                                                <div class="col-md-12 text-center">
                                                    <p>_______________________________________________________</p>
                                                    <p style="margin-top: -15px; font-weight: bold;">AJUDANTE: ${dadosPlanilha['ajudante01']['nome']}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            ${divTableAjudante02.innerHTML}

                                            <br>

                                            <div class="row" style="margin-top: 30px;">
                                                <div class="col-md-12 text-center">
                                                    <p>_______________________________________________________</p>
                                                    <p style="margin-top: -15px; font-weight: bold;">AJUDANTE: ${dadosPlanilha['ajudante02']['nome']}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <br><br><br>
                            
                                    <div class="row">
                                        <div class="col-md-12">
                                            <table class="table table-bordered">
                                                <thead>
                                                    <tr style="border: 1px solid #000">
                                                        <th></th>
                                                        <th colspan="2" class="text-center">MANHÃ</th>
                                                        <th colspan="2" class="text-center">TARDE</th>
                                                        <th colspan="2" class="text-center">EXTRA</th>
                                                    </tr>

                                                    <tr>
                                                        <th class="text-center" style="width: 16%;">DATA</th>
                                                        <th class="text-center" style="width: 14%;">ENTRADA</th>
                                                        <th class="text-center" style="width: 14%;">SAÍDA</th>
                                                        <th class="text-center" style="width: 14%;">ENTRADA</th>
                                                        <th class="text-center" style="width: 14%;">SAÍDA</th>
                                                        <th style="width: 14%;"></th>
                                                        <th style="width: 14%;"></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr height="32px">
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <tr height="32px">
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>

                                                    <tr height="32px">
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                        <td></td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    <br>

                                    <p class="font-weight-bold">Km SAÍDA:</p>
                                    <p class="font-weight-bold">Km CHEGADA:</p>

                                </div>

                                <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
                                <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
                                <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
                            </body>
                          </html>`;

    const win = window.open('', '', 'height=800, width=1200');

    win.document.write(conteudoHtml);

    setTimeout(function(){ 
        win.print()
        win.close()
    }, 1000);
};

const retornaConteudoVizualizar = (id) => {
    let dadosPlanilha = JSON.parse(localStorage.getItem('dadosPlanilha')) ?? [];

    dadosPlanilha = dadosPlanilha.filter(function(value) {

        return value.id == id;
    });

    let qtdAjudantes = 0;

    let ajudante01 = {
        nome: '',
        diaria: '0,00'
    };

    let ajudante02 = {
        nome: '',
        diaria: '0,00'
    };

    let valorDiarias = '0,00';

    if(dadosPlanilha[0]['ajudantes'].length == 0){
        qtdAjudantes = 0;
    }

    if(dadosPlanilha[0]['ajudantes'].length == 1){
        qtdAjudantes = 1;
        ajudante01 = {
            nome: dadosPlanilha[0]['ajudantes'][0],
            diaria: '0,00'
        };
    }

    if(dadosPlanilha[0]['ajudantes'].length == 2){
        qtdAjudantes = 2;
        ajudante01 = {
            nome: dadosPlanilha[0]['ajudantes'][0],
            diaria: '0,00'
        };
        ajudante02 = {
            nome: dadosPlanilha[0]['ajudantes'][1],
            diaria: '0,00'
        };
    }

    if(dadosPlanilha[0]['diaria'] === '' || dadosPlanilha[0]['diaria'] === '0,00') {
        valorDiarias = '0,00';

    }else {
        const dividirPor = qtdAjudantes + 1;
        const result = (parseInt(dadosPlanilha[0]['diaria'].replace(/[^\d]+/g,'')) / dividirPor) / 100;

        valorDiarias = result.toLocaleString('pt-br', {minimumFractionDigits: 2});

        if(qtdAjudantes == 1) {
            ajudante01 = {
                nome: dadosPlanilha[0]['ajudantes'][0],
                diaria: valorDiarias
            };
        }

        if(qtdAjudantes == 2) {
            ajudante01 = {
                nome: dadosPlanilha[0]['ajudantes'][0],
                diaria: valorDiarias
            };

            ajudante02 = {
                nome: dadosPlanilha[0]['ajudantes'][1],
                diaria: valorDiarias
            };
        }

    }

    return {
        dados: dadosPlanilha,
        ajudante01: ajudante01,
        ajudante02: ajudante02,
        valorDiarias: valorDiarias
    };
};

document.getElementById('input-diaria').addEventListener('keyup', formatarCampoValor);
document.getElementById('input-peso').addEventListener('keyup', formatarCampoPeso);

document.getElementById('btn-aplicar').addEventListener('click', aplicarDados);
document.getElementById('btn-adicionar').addEventListener('click', adicionarDados);

renderizarSelectFuncionarios();
renderizarElementosOptionsForm();
renderizarDadosTabela();


