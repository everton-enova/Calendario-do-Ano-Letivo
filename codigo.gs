/**
 * Calendário Letivo 2026 — Redes Municipais da Bahia
 * Recebe respostas do formulário público e grava em duas abas:
 *   - Respostas: registro cru de cada envio
 *   - Acompanhamento: painel dos 417 municípios com status Pendente/Respondido
 *
 * Regra: 1 resposta por município (bloqueia duplicados pelo código IBGE).
 * Após a data-limite, o front bloqueia o envio; o back também trava por segurança.
 */

var SHEET_RESPOSTAS = 'Respostas';
var SHEET_ACOMPANHAMENTO = 'Acompanhamento';
var DEADLINE_ISO = '2026-09-22T23:59:00-03:00';

// -------- Municípios (417 da Bahia com NTE completo) --------
var MUNICIPIOS = [
  {c:"2900108",n:"Abaíra",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2900207",n:"Abaré",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2900306",n:"Acajutiba",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2900355",n:"Adustina",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2900405",n:"Água Fria",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2900603",n:"Aiquara",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2900702",n:"Alagoinhas",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2900801",n:"Alcobaça",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2900900",n:"Almadina",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2901007",n:"Amargosa",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2901106",n:"Amélia Rodrigues",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2901155",n:"América Dourada",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2901205",n:"Anagé",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2901304",n:"Andaraí",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2901353",n:"Andorinha",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2901403",n:"Angical",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2901502",n:"Anguera",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2901601",n:"Antas",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2901700",n:"Antônio Cardoso",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2901809",n:"Antônio Gonçalves",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2901908",n:"Aporá",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2901957",n:"Apuarema",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2902054",n:"Araçás",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2902005",n:"Aracatu",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2902104",n:"Araci",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2902203",n:"Aramari",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2902252",n:"Arataca",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2902302",n:"Aratuípe",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2902401",n:"Aurelino Leal",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2902500",n:"Baianópolis",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2902609",n:"Baixa Grande",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2902658",n:"Banzaê",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2902708",n:"Barra",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2902807",n:"Barra da Estiva",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2902906",n:"Barra do Choça",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2903003",n:"Barra do Mendes",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2903102",n:"Barra do Rocha",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2903201",n:"Barreiras",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2903235",n:"Barro Alto",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2903300",n:"Barro Preto",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2903276",n:"Barrocas",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2903409",n:"Belmonte",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2903508",n:"Belo Campo",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2903607",n:"Biritinga",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2903706",n:"Boa Nova",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2903805",n:"Boa Vista do Tupim",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2903904",n:"Bom Jesus da Lapa",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2903953",n:"Bom Jesus da Serra",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2904001",n:"Boninal",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2904050",n:"Bonito",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2904100",n:"Boquira",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2904209",n:"Botuporã",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2904308",n:"Brejões",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2904407",n:"Brejolândia",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2904506",n:"Brotas de Macaúbas",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2904605",n:"Brumado",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2904704",n:"Buerarema",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2904753",n:"Buritirama",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2904803",n:"Caatiba",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2904852",n:"Cabaceiras do Paraguaçu",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2904902",n:"Cachoeira",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2905008",n:"Caculé",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2905107",n:"Caém",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2905156",n:"Caetanos",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2905206",n:"Caetité",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2905305",n:"Cafarnaum",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2905404",n:"Cairu",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2905503",n:"Caldeirão Grande",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2905602",n:"Camacan",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2905701",n:"Camaçari",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2905800",n:"Camamu",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2905909",n:"Campo Alegre de Lourdes",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2906006",n:"Campo Formoso",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2906105",n:"Canápolis",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2906204",n:"Canarana",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2906303",n:"Canavieiras",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2906402",n:"Candeal",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2906501",n:"Candeias",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2906600",n:"Candiba",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2906709",n:"Cândido Sales",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2906808",n:"Cansanção",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2906824",n:"Canudos",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2906857",n:"Capela do Alto Alegre",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2906873",n:"Capim Grosso",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2906899",n:"Caraíbas",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2906907",n:"Caravelas",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2907004",n:"Cardeal da Silva",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2907103",n:"Carinhanha",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2907202",n:"Casa Nova",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2907301",n:"Castro Alves",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2907400",n:"Catolândia",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2907509",n:"Catu",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2907558",n:"Caturama",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2907608",n:"Central",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2907707",n:"Chorrochó",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2907806",n:"Cícero Dantas",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2907905",n:"Cipó",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2908002",n:"Coaraci",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2908101",n:"Cocos",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2908200",n:"Conceição da Feira",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2908309",n:"Conceição do Almeida",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2908408",n:"Conceição do Coité",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2908507",n:"Conceição do Jacuípe",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2908606",n:"Conde",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2908705",n:"Condeúba",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2908804",n:"Contendas do Sincorá",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2908903",n:"Coração de Maria",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2909000",n:"Cordeiros",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2909109",n:"Coribe",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2909208",n:"Coronel João Sá",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2909307",n:"Correntina",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2909406",n:"Cotegipe",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2909505",n:"Cravolândia",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2909604",n:"Crisópolis",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2909703",n:"Cristópolis",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2909802",n:"Cruz das Almas",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2909901",n:"Curaçá",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2910008",n:"Dário Meira",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2910057",n:"Dias d'Ávila",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2910107",n:"Dom Basílio",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2910206",n:"Dom Macedo Costa",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2910305",n:"Elísio Medrado",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2910404",n:"Encruzilhada",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2910503",n:"Entre Rios",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2900504",n:"Érico Cardoso",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2910602",n:"Esplanada",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2910701",n:"Euclides da Cunha",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2910727",n:"Eunápolis",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2910750",n:"Fátima",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2910776",n:"Feira da Mata",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2910800",n:"Feira de Santana",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2910859",n:"Filadélfia",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2910909",n:"Firmino Alves",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2911006",n:"Floresta Azul",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2911105",n:"Formosa do Rio Preto",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2911204",n:"Gandu",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2911253",n:"Gavião",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2911303",n:"Gentio do Ouro",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2911402",n:"Glória",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2911501",n:"Gongogi",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2911600",n:"Governador Mangabeira",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2911659",n:"Guajeru",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2911709",n:"Guanambi",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2911808",n:"Guaratinga",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2911857",n:"Heliópolis",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2911907",n:"Iaçu",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2912004",n:"Ibiassucê",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2912103",n:"Ibicaraí",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2912202",n:"Ibicoara",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2912301",n:"Ibicuí",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2912400",n:"Ibipeba",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2912509",n:"Ibipitanga",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2912608",n:"Ibiquera",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2912707",n:"Ibirapitanga",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2912806",n:"Ibirapuã",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2912905",n:"Ibirataia",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2913002",n:"Ibitiara",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2913101",n:"Ibititá",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2913200",n:"Ibotirama",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2913309",n:"Ichu",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2913408",n:"Igaporã",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2913457",n:"Igrapiúna",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2913507",n:"Iguaí",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2913606",n:"Ilhéus",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2913705",n:"Inhambupe",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2913804",n:"Ipecaetá",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2913903",n:"Ipiaú",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2914000",n:"Ipirá",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2914109",n:"Ipupiara",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2914208",n:"Irajuba",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2914307",n:"Iramaia",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2914406",n:"Iraquara",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2914505",n:"Irará",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2914604",n:"Irecê",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2914653",n:"Itabela",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2914703",n:"Itaberaba",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2914802",n:"Itabuna",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2914901",n:"Itacaré",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2915007",n:"Itaeté",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2915106",n:"Itagi",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2915205",n:"Itagibá",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2915304",n:"Itagimirim",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2915353",n:"Itaguaçu da Bahia",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2915403",n:"Itaju do Colônia",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2915502",n:"Itajuípe",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2915601",n:"Itamaraju",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2915700",n:"Itamari",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2915809",n:"Itambé",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2915908",n:"Itanagra",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2916005",n:"Itanhém",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2916104",n:"Itaparica",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2916203",n:"Itapé",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2916302",n:"Itapebi",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2916401",n:"Itapetinga",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2916500",n:"Itapicuru",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2916609",n:"Itapitanga",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2916708",n:"Itaquara",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2916807",n:"Itarantim",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2916856",n:"Itatim",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2916906",n:"Itiruçu",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2917003",n:"Itiúba",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2917102",n:"Itororó",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2917201",n:"Ituaçu",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2917300",n:"Ituberá",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2917334",n:"Iuiú",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2917359",n:"Jaborandi",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2917409",n:"Jacaraci",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2917508",n:"Jacobina",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2917607",n:"Jaguaquara",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2917706",n:"Jaguarari",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2917805",n:"Jaguaripe",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2917904",n:"Jandaíra",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2918001",n:"Jequié",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2918100",n:"Jeremoabo",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2918209",n:"Jiquiriçá",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2918308",n:"Jitaúna",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2918357",n:"João Dourado",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2918407",n:"Juazeiro",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2918456",n:"Jucuruçu",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2918506",n:"Jussara",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2918555",n:"Jussari",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2918605",n:"Jussiape",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2918704",n:"Lafaiete Coutinho",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2918753",n:"Lagoa Real",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2918803",n:"Laje",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2918902",n:"Lajedão",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2919009",n:"Lajedinho",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2919058",n:"Lajedo do Tabocal",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2919108",n:"Lamarão",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2919157",n:"Lapão",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2919207",n:"Lauro de Freitas",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2919306",n:"Lençóis",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2919405",n:"Licínio de Almeida",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2919504",n:"Livramento de Nossa Senhora",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2919553",n:"Luís Eduardo Magalhães",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2919603",n:"Macajuba",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2919702",n:"Macarani",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2919801",n:"Macaúbas",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2919900",n:"Macururé",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2919926",n:"Madre de Deus",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2919959",n:"Maetinga",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2920007",n:"Maiquinique",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2920106",n:"Mairi",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2920205",n:"Malhada",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2920304",n:"Malhada de Pedras",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2920403",n:"Manoel Vitorino",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2920452",n:"Mansidão",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2920502",n:"Maracás",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2920601",n:"Maragogipe",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2920700",n:"Maraú",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2920809",n:"Marcionílio Souza",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2920908",n:"Mascote",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2921005",n:"Mata de São João",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2921054",n:"Matina",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2921104",n:"Medeiros Neto",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2921203",n:"Miguel Calmon",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2921302",n:"Milagres",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2921401",n:"Mirangaba",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2921450",n:"Mirante",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2921500",n:"Monte Santo",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2921609",n:"Morpara",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2921708",n:"Morro do Chapéu",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2921807",n:"Mortugaba",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2921906",n:"Mucugê",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2922003",n:"Mucuri",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2922052",n:"Mulungu do Morro",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2922102",n:"Mundo Novo",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2922201",n:"Muniz Ferreira",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2922250",n:"Muquém de São Francisco",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2922300",n:"Muritiba",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2922409",n:"Mutuípe",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2922508",n:"Nazaré",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2922607",n:"Nilo Peçanha",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2922656",n:"Nordestina",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2922706",n:"Nova Canaã",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2922730",n:"Nova Fátima",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2922755",n:"Nova Ibiá",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2922805",n:"Nova Itarana",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2922854",n:"Nova Redenção",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2922904",n:"Nova Soure",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2923001",n:"Nova Viçosa",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2923035",n:"Novo Horizonte",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2923050",n:"Novo Triunfo",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2923100",n:"Olindina",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2923209",n:"Oliveira dos Brejinhos",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2923308",n:"Ouriçangas",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2923357",n:"Ourolândia",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2923407",n:"Palmas de Monte Alto",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2923506",n:"Palmeiras",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2923605",n:"Paramirim",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2923704",n:"Paratinga",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2923803",n:"Paripiranga",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2923902",n:"Pau Brasil",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2924009",n:"Paulo Afonso",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2924058",n:"Pé de Serra",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2924108",n:"Pedrão",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2924207",n:"Pedro Alexandre",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2924306",n:"Piatã",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2924405",n:"Pilão Arcado",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2924504",n:"Pindaí",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2924603",n:"Pindobaçu",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2924652",n:"Pintadas",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2924678",n:"Piraí do Norte",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2924702",n:"Piripá",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2924801",n:"Piritiba",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2924900",n:"Planaltino",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2925006",n:"Planalto",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2925105",n:"Poções",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2925204",n:"Pojuca",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2925253",n:"Ponto Novo",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2925303",n:"Porto Seguro",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2925402",n:"Potiraguá",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2925501",n:"Prado",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2925600",n:"Presidente Dutra",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2925709",n:"Presidente Jânio Quadros",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2925758",n:"Presidente Tancredo Neves",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2925808",n:"Queimadas",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2925907",n:"Quijingue",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2925931",n:"Quixabeira",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2925956",n:"Rafael Jambeiro",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2926004",n:"Remanso",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2926103",n:"Retirolândia",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2926202",n:"Riachão das Neves",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2926301",n:"Riachão do Jacuípe",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2926400",n:"Riacho de Santana",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2926509",n:"Ribeira do Amparo",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2926608",n:"Ribeira do Pombal",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2926657",n:"Ribeirão do Largo",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2926707",n:"Rio de Contas",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2926806",n:"Rio do Antônio",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2926905",n:"Rio do Pires",nte:"NTE 12",s:"Macaúbas",t:"Bacia do Paramirim"},
  {c:"2927002",n:"Rio Real",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2927101",n:"Rodelas",nte:"NTE 24",s:"Paulo Afonso",t:"Itaparica"},
  {c:"2927200",n:"Ruy Barbosa",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2927309",n:"Salinas da Margarida",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2927408",n:"Salvador",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2927507",n:"Santa Bárbara",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2927606",n:"Santa Brígida",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2927705",n:"Santa Cruz Cabrália",nte:"NTE 27",s:"Eunápolis",t:"Costa do Descobrimento"},
  {c:"2927804",n:"Santa Cruz da Vitória",nte:"NTE 08",s:"Itapetinga",t:"Médio Sudoeste da Bahia"},
  {c:"2927903",n:"Santa Inês",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2928059",n:"Santa Luzia",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2928109",n:"Santa Maria da Vitória",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2928406",n:"Santa Rita de Cássia",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2928505",n:"Santa Teresinha",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2928000",n:"Santaluz",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2928208",n:"Santana",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2928307",n:"Santanópolis",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2928604",n:"Santo Amaro",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2928703",n:"Santo Antônio de Jesus",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2928802",n:"Santo Estêvão",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2928901",n:"São Desidério",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2928950",n:"São Domingos",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2929107",n:"São Felipe",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2929008",n:"São Félix",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2929057",n:"São Félix do Coribe",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2929206",n:"São Francisco do Conde",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2929255",n:"São Gabriel",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2929305",n:"São Gonçalo dos Campos",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2929354",n:"São José da Vitória",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2929370",n:"São José do Jacuípe",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2929404",n:"São Miguel das Matas",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2929503",n:"São Sebastião do Passé",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2929602",n:"Sapeaçu",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2929701",n:"Sátiro Dias",nte:"NTE 18",s:"Alagoinhas",t:"Litoral Norte e Agreste Baiano"},
  {c:"2929750",n:"Saubara",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2929800",n:"Saúde",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2929909",n:"Seabra",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2930006",n:"Sebastião Laranjeiras",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2930105",n:"Senhor do Bonfim",nte:"NTE 25",s:"Senhor do Bonfim",t:"Piemonte Norte do Itapicuru"},
  {c:"2930204",n:"Sento Sé",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2930154",n:"Serra do Ramalho",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2930303",n:"Serra Dourada",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2930402",n:"Serra Preta",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2930501",n:"Serrinha",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2930600",n:"Serrolândia",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2930709",n:"Simões Filho",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2930758",n:"Sítio do Mato",nte:"NTE 02",s:"Bom Jesus da Lapa",t:"Velho Chico"},
  {c:"2930766",n:"Sítio do Quinto",nte:"NTE 17",s:"Ribeira do Pombal",t:"Semiárido Nordeste II"},
  {c:"2930774",n:"Sobradinho",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2930808",n:"Souto Soares",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2930907",n:"Tabocas do Brejo Velho",nte:"NTE 23",s:"Santa Maria da Vitória",t:"Bacia do Rio Corrente"},
  {c:"2931004",n:"Tanhaçu",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2931053",n:"Tanque Novo",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2931103",n:"Tanquinho",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2931202",n:"Taperoá",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2931301",n:"Tapiramutá",nte:"NTE 14",s:"Itaberaba",t:"Piemonte do Paraguaçu"},
  {c:"2931350",n:"Teixeira de Freitas",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2931400",n:"Teodoro Sampaio",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2931509",n:"Teofilândia",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2931608",n:"Teolândia",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2931707",n:"Terra Nova",nte:"NTE 19",s:"Feira de Santana",t:"Portal do Sertão"},
  {c:"2931806",n:"Tremedal",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2931905",n:"Tucano",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2932002",n:"Uauá",nte:"NTE 10",s:"Juazeiro",t:"Sertão do São Francisco"},
  {c:"2932101",n:"Ubaíra",nte:"NTE 09",s:"Amargosa",t:"Vale do Jequiriçá"},
  {c:"2932200",n:"Ubaitaba",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2932309",n:"Ubatã",nte:"NTE 22",s:"Jequié",t:"Médio Rio de Contas"},
  {c:"2932408",n:"Uibaí",nte:"NTE 01",s:"Irecê",t:"Irecê"},
  {c:"2932457",n:"Umburanas",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2932507",n:"Una",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2932606",n:"Urandi",nte:"NTE 13",s:"Caetité",t:"Sertão Produtivo"},
  {c:"2932705",n:"Uruçuca",nte:"NTE 05",s:"Itabuna",t:"Litoral Sul"},
  {c:"2932804",n:"Utinga",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2932903",n:"Valença",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2933000",n:"Valente",nte:"NTE 04",s:"Serrinha",t:"Sisal"},
  {c:"2933059",n:"Várzea da Roça",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2933109",n:"Várzea do Poço",nte:"NTE 15",s:"Ipirá",t:"Bacia do Jacuípe"},
  {c:"2933158",n:"Várzea Nova",nte:"NTE 16",s:"Jacobina",t:"Piemonte da Diamantina II"},
  {c:"2933174",n:"Varzedo",nte:"NTE 21",s:"Santo Antônio de Jesus",t:"Recôncavo"},
  {c:"2933208",n:"Vera Cruz",nte:"NTE 26",s:"Salvador",t:"Metropolitana de Salvador"},
  {c:"2933257",n:"Vereda",nte:"NTE 07",s:"Teixeira de Freitas",t:"Extremo Sul"},
  {c:"2933307",n:"Vitória da Conquista",nte:"NTE 20",s:"Vitória da Conquista",t:"Sudoeste Baiano"},
  {c:"2933406",n:"Wagner",nte:"NTE 03",s:"Seabra",t:"Chapada Diamantina"},
  {c:"2933455",n:"Wanderley",nte:"NTE 11",s:"Barreiras",t:"Bacia do Rio Grande"},
  {c:"2933505",n:"Wenceslau Guimarães",nte:"NTE 06",s:"Valença",t:"Baixo Sul"},
  {c:"2933604",n:"Xique-Xique",nte:"NTE 01",s:"Irecê",t:"Irecê"}
];
// ------------------------------------------------------------

function doGet(e) {
  var action = e && e.parameter ? e.parameter.action : '';
  if (action === 'getMunicipiosOcupados') {
    var sheet = getRespostasSheet();
    var dados = sheet.getDataRange().getValues();
    var ocupados = [];
    // Coluna 6 (índice 5) = CodMunicipio — ver cabeçalho em getRespostasSheet
    for (var i = 1; i < dados.length; i++) {
      var c = String(dados[i][5] || '').trim();
      if (c && ocupados.indexOf(c) === -1) ocupados.push(c);
    }
    return jsonResponse({ municipiosOcupados: ocupados });
  }
  return jsonResponse({ status: 'API funcionando' });
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    if (payload.action !== 'enviar') {
      return jsonResponse({ success: false, message: 'Ação inválida.' });
    }

    // Bloqueio por data-limite (defesa em profundidade — o front já bloqueia)
    if (new Date() >= new Date(DEADLINE_ISO)) {
      return jsonResponse({ success: false, message: 'Prazo encerrado em 22/09/2026, às 23h59.' });
    }

    // Sanidade dos campos obrigatórios
    var obrig = ['nome','email','telefone','cargo','codMunicipio','municipio','nteNumero','inicio','fim'];
    for (var k = 0; k < obrig.length; k++) {
      if (!payload[obrig[k]]) {
        return jsonResponse({ success: false, message: 'Campo obrigatório ausente: ' + obrig[k] + '.' });
      }
    }

    // Coerência de datas (2026 e fim > início)
    var ini = new Date(payload.inicio + 'T00:00:00');
    var fim = new Date(payload.fim + 'T00:00:00');
    if (isNaN(ini) || isNaN(fim)) {
      return jsonResponse({ success: false, message: 'Datas inválidas.' });
    }
    if (ini.getFullYear() !== 2026 || fim.getFullYear() !== 2026) {
      return jsonResponse({ success: false, message: 'As datas devem estar no ano de 2026.' });
    }
    if (fim <= ini) {
      return jsonResponse({ success: false, message: 'A data de fim deve ser posterior à de início.' });
    }

    var sheet = getRespostasSheet();
    var dados = sheet.getDataRange().getValues();

    // Bloqueia município já respondido (pelo código IBGE)
    for (var j = 1; j < dados.length; j++) {
      if (String(dados[j][5]).trim() === String(payload.codMunicipio).trim()) {
        return jsonResponse({
          success: false,
          message: 'O município "' + payload.municipio + '" já enviou uma resposta. Para correções, contatar a CAV/DIE/SGINF.'
        });
      }
    }

    var agora = new Date();
    var tz = Session.getScriptTimeZone();
    sheet.appendRow([
      Utilities.formatDate(agora, tz, 'dd/MM/yyyy HH:mm:ss'),
      payload.nome,
      payload.email,
      payload.telefone,
      payload.cargo,
      payload.codMunicipio,
      payload.municipio,
      payload.nteNumero,
      payload.nteSede || '',
      payload.nteTerritorio || '',
      Utilities.formatDate(ini, tz, 'dd/MM/yyyy'),
      Utilities.formatDate(fim, tz, 'dd/MM/yyyy')
    ]);

    atualizarAcompanhamento();
    return jsonResponse({ success: true });
  } catch (err) {
    return jsonResponse({ success: false, message: 'Erro: ' + err.message });
  }
}

function getRespostasSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_RESPOSTAS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_RESPOSTAS);
    var header = ['Data/Hora','Nome','E-mail','Telefone','Cargo','CodMunicipio','Municipio','NTE','Sede NTE','Território','Início Ano Letivo','Fim Ano Letivo'];
    sheet.appendRow(header);
    sheet.getRange(1, 1, 1, header.length)
      .setFontWeight('bold').setBackground('#1a3a8a').setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    var widths = [140, 220, 220, 130, 240, 120, 200, 90, 180, 220, 120, 120];
    for (var i = 0; i < widths.length; i++) sheet.setColumnWidth(i + 1, widths[i]);
  }
  return sheet;
}

function atualizarAcompanhamento() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_ACOMPANHAMENTO);
  if (!sheet) sheet = ss.insertSheet(SHEET_ACOMPANHAMENTO);
  else { sheet.clearContents(); sheet.clearFormats(); }

  // Índice das respostas por código IBGE
  var respostas = getRespostasSheet().getDataRange().getValues();
  var mapa = {};
  for (var i = 1; i < respostas.length; i++) {
    var c = String(respostas[i][5] || '').trim();
    if (!c) continue;
    mapa[c] = {
      inicio: respostas[i][10],
      fim: respostas[i][11],
      respondente: respostas[i][1],
      cargo: respostas[i][4],
      dataResposta: respostas[i][0]
    };
  }

  var pendentes = [];
  var respondidos = [];
  for (var j = 0; j < MUNICIPIOS.length; j++) {
    var m = MUNICIPIOS[j];
    if (mapa[m.c]) {
      var r = mapa[m.c];
      respondidos.push([m.nte, m.n, 'Respondido', r.inicio, r.fim, r.respondente, r.cargo, r.dataResposta]);
    } else {
      pendentes.push([m.nte, m.n, 'Pendente', '-', '-', '-', '-', '-']);
    }
  }

  var header = ['NTE','Município','Status','Início','Fim','Respondente','Cargo','Data da Resposta'];
  sheet.getRange(1, 1, 1, header.length).setValues([header])
    .setFontWeight('bold').setBackground('#1a3a8a').setFontColor('#ffffff');

  // Pendentes primeiro (facilita cobrança), depois respondidos
  var rows = pendentes.concat(respondidos);
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
    for (var p = 0; p < pendentes.length; p++) {
      sheet.getRange(p + 2, 1, 1, header.length).setBackground('#fce8e8');
    }
    for (var q = 0; q < respondidos.length; q++) {
      sheet.getRange(pendentes.length + q + 2, 1, 1, header.length).setBackground('#e8f5e9');
    }
  }

  var totalRow = rows.length + 2;
  sheet.getRange(totalRow, 1, 1, header.length)
    .setValues([['', 'TOTAL: ' + MUNICIPIOS.length + ' municípios',
                 'Pendentes: ' + pendentes.length,
                 'Respondidos: ' + respondidos.length,
                 '', '', '', '']])
    .setFontWeight('bold').setBackground('#e8edf5');

  var widths = [90, 220, 110, 100, 100, 220, 240, 160];
  for (var w = 0; w < widths.length; w++) sheet.setColumnWidth(w + 1, widths[w]);
  sheet.setFrozenRows(1);
}

function atualizarAcompanhamentoManual() {
  atualizarAcompanhamento();
  SpreadsheetApp.getUi().alert('✅ Painel de acompanhamento atualizado.');
}

function onOpen() {
  getRespostasSheet();
  SpreadsheetApp.getUi()
    .createMenu('⚙️ Calendário Letivo')
    .addItem('🔄 Atualizar Acompanhamento', 'atualizarAcompanhamentoManual')
    .addToUi();
}

function onEdit(e) {
  if (!e || !e.source) return;
  if (e.range.getSheet().getName() === SHEET_RESPOSTAS) atualizarAcompanhamento();
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
