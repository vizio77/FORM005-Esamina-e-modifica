sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function(JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function() {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		getTriennioModel: function() {
			var sYear0 = new Date().getFullYear();
			var sYear1 = sYear0 + 1;
			var sYear2 = sYear0 + 2;
			var sYear3 = sYear0 + 3;
			//   var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oTriennio = {
				anno1: sYear1,
				anno2: sYear2,
				anno3: sYear3
			};
			var olocalTriennioModel = new JSONModel(oTriennio);
			olocalTriennioModel.setDefaultBindingMode("TwoWay");
			return olocalTriennioModel;
		},

		getConoVisibilita: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				ZCA_AF_AMMIN: "",
				ZCA_AF_CDR: "",
				ZCA_AF_RAGIONERIA: ""
			};
			var olocalConoVisibilita = new JSONModel(oJSONLocal);
			olocalConoVisibilita.setDefaultBindingMode("TwoWay");
			return olocalConoVisibilita;
		},
		
		getGestTipologicheModel: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {};
			var olocalGestTipologicheModel = new JSONModel(oJSONLocal);
			olocalGestTipologicheModel.setDefaultBindingMode("TwoWay");
			return olocalGestTipologicheModel;
		},
		
		getPosFinSelected: function() {
			var posFinSel = {
				Posfin: ""
			};
			var olocalPosFinSelected = new JSONModel(posFinSel);
			olocalPosFinSelected.setDefaultBindingMode("TwoWay");
			return olocalPosFinSelected;
		},
		
		getModelListaEstesaRidotta: function() {
			var oObj = {
				visible: false
			};
			var olocalModelListaEstesaRidotta = new JSONModel(oObj);
			olocalModelListaEstesaRidotta.setDefaultBindingMode("TwoWay");
			return olocalModelListaEstesaRidotta;
		},
		
		getModelLinkPopUpPF: function() {
			var oObj = {
				visible: false
			};
			var olocalModelLinkPopUpPF = new JSONModel(oObj);
			olocalModelLinkPopUpPF.setDefaultBindingMode("TwoWay");
			return olocalModelLinkPopUpPF;
		},
		
		getModelPageTab: function() {
			var oData = {
				"Posfin": "",
				"IdPosfin": "",
				"IdProposta": "",
				"Nickname": "",
				"Iter": "",
				"sTipo": ""
			};
			var olocalModelPageAut = new JSONModel(oData);
			olocalModelPageAut.setDefaultBindingMode("TwoWay");
			return olocalModelPageAut;
		},

		infoModel: function() {

			var oinfoModel = new JSONModel();

			/*	 var oJSONLocal = {
				"description" : "pippo"
			};
            var oinfoModel = new JSONModel(oJSONLocal);*/
			oinfoModel.setDefaultBindingMode("TwoWay");
			return oinfoModel;
		},
		
		getModelUserSearch: function() {
			var oData = {
				"Cognome": "",
				"Nome": ""
			};
			var olocalModelUserSearch = new JSONModel(oData);
			olocalModelUserSearch.setDefaultBindingMode("TwoWay");
			return olocalModelUserSearch;
		},
		
		getModelTableValidatore: function() {
			var oData = {};
			var olocalModelUserSearch = new JSONModel(oData);
			olocalModelUserSearch.setDefaultBindingMode("TwoWay");
			return olocalModelUserSearch;
		},
		
		getModelPopupReiscrizioni: function() {
			var oData = {};
			var olocalPopupReiscrizioni = new JSONModel(oData);
			olocalPopupReiscrizioni.setDefaultBindingMode("TwoWay");
			return olocalPopupReiscrizioni;
		},

		//Model per valorizzazione il Link di PosFin e Struttura Amministrativa Centrale in testata
		//sulla pag. Nuova PosFin
		getHeaderModelNuovaPosFin: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				AMM: "020",
				DESCAMM: "MINISTERO DELL'ECONOMIA E DELLE FINANZE",
				CDR: "0001",
				DESCCDR: "GABINETTO E UFFICI DI DIRETTA COLLABORAZIONE ALL'OPERA DEL MINISTRO",
				RAG: "0840",
				DESCRAG: "UFFICIO CENTRALE DI BILANCIO DEL MINISTERO DELL'ECONOMIA E DELLE FINANZE",
				MISS: "",
				DESCMISS: "",
				PROG: "",
				DESCPROG: "",
				AZIO: "",
				DESCAZIO: "",
				CAP: "",
				DESCCAP: "",
				PG: "",
				DESCPG: "",
				TIT: "",
				DESCTIT: "",
				CAT: "",
				DESCCAT: "",
				CE2: "",
				DESCCE2: "",
				CE3: "",
				DESCCE3: "",
				MACROAGG: "",
				DESCMACROAGG: "",
				DENOMINAZCAP: "",
				TIPOSPESAPG: "",
				DENOMINAZPG: ""
			};
			var olocalHeaderModelNuovaPosFin = new JSONModel(oJSONLocal);
			olocalHeaderModelNuovaPosFin.setDefaultBindingMode("TwoWay");
			return olocalHeaderModelNuovaPosFin;
		},

		getModelTableCofogNPF: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = [];
			var olocalModelTableCofogNPF = new JSONModel(oJSONLocal);
			olocalModelTableCofogNPF.setDefaultBindingMode("TwoWay");
			return olocalModelTableCofogNPF;
		},
		
		getModelTableRV: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {};
			var olocalModelTableRV = new JSONModel(oJSONLocal);
			olocalModelTableRV.setDefaultBindingMode("TwoWay");
			return olocalModelTableRV;
		},

		//Model per prevalorizzare i campi del cono su Nuova Pos Fin (utile solo per prototipo)
		getModelPreValConoNPF: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				Amm: "A020",
				DescAmm: "MINISTERO DELL'ECONOMIA E DELLE FINANZE",
				CdR: "001",
				DescCdr: "GABINETTO E UFFICI DI DIRETTA COLLABORAZIONE ALL'OPERA DEL MINISTRO",
				Ragioneria: "001",
				DescRag: "RAGIONERIA GENERALE DELLO STATO"
			};
			var olocalModelPreValConoNPF = new JSONModel(oJSONLocal);
			olocalModelPreValConoNPF.setDefaultBindingMode("TwoWay");
			return olocalModelPreValConoNPF;
		},
		
		//Model per salvare tutti i campi di Nuova Pos Fin 
		getModelNPF: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				PosFin: {},
				Cofog: {},
				IdProposta: {}
			};
			var olocalModelNPF = new JSONModel(oJSONLocal);
			olocalModelNPF.setDefaultBindingMode("TwoWay");
			return olocalModelNPF;
		},
		
		getModelPFCapEsistente: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				PosFin: {},
				Cofog: {},
				IdProposta: {}
			};
			var olocalModelPFCapEsistente = new JSONModel(oJSONLocal);
			olocalModelPFCapEsistente.setDefaultBindingMode("TwoWay");
			return olocalModelPFCapEsistente;
		},
		
		getModelCOFOGCapEsistente: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				PosFin: {},
				Cofog: {},
				IdProposta: {}
			};
			var olocalModelCOFOGCapEsistente = new JSONModel(oJSONLocal);
			olocalModelCOFOGCapEsistente.setDefaultBindingMode("TwoWay");
			return olocalModelCOFOGCapEsistente;
		},
		
		getModelPropostaNPF: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				IdProposta: "",
				Iter: "",
				Nickname: "",
				Tipo: ""
			};
			var olocalModelPropostaNPF = new JSONModel(oJSONLocal);
			olocalModelPropostaNPF.setDefaultBindingMode("TwoWay");
			return olocalModelPropostaNPF;
		},

		getModelTableCofogTabID: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {

			};
			var olocalModelTableCofogTabID = new JSONModel(oJSONLocal);
			olocalModelTableCofogTabID.setDefaultBindingMode("TwoWay");
			return olocalModelTableCofogTabID;
		},

		getModelTableFOFPTabID: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {

			};
			var olocalModelTableFOFPTabID = new JSONModel(oJSONLocal);
			olocalModelTableFOFPTabID.setDefaultBindingMode("TwoWay");
			return olocalModelTableFOFPTabID;
		},

		getModelPG80: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				pg80Enable: true,
				pg80btnEnable: true,
				editable: true,
				capCodStd : true
			};
			var oModelPG80 = new JSONModel(oJSONLocal);
			oModelPG80.setDefaultBindingMode("TwoWay");
			return oModelPG80;
		},
		
		getModelChangeControlsStatus: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				Enable: false,
				Visible: false,
				Editable: false,
				Iter: false
			};
			var oModelChangeControlsStatus = new JSONModel(oJSONLocal);
			oModelChangeControlsStatus.setDefaultBindingMode("TwoWay");
			return oModelChangeControlsStatus;
		},
		
		getPreAut: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				ZCOBI_PRSP_CODBLSet: ""
			};
			var olocalgetPreAut = new JSONModel(oJSONLocal);
			olocalgetPreAut.setDefaultBindingMode("TwoWay");
			return olocalgetPreAut;
		},
		
		getModelStrAmm: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {};
			var olocalgetModelStrAmm = new JSONModel(oJSONLocal);
			olocalgetModelStrAmm.setDefaultBindingMode("TwoWay");
			return olocalgetModelStrAmm;
		},
		
		getPreAutInfoPopUp: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {};
			var olocalPreAutInfoPopUp = new JSONModel(oJSONLocal);
			olocalPreAutInfoPopUp.setDefaultBindingMode("TwoWay");
			return olocalPreAutInfoPopUp;
		},
		
		getModelPageAut: function() {
			var oData = {
				"Posfin": "",
				"IdPosfin": "",
				"IdProposta": "",
				"Iter": "",
				"sTipo": ""
			};
			var olocalModelPageAut = new JSONModel(oData);
			olocalModelPageAut.setDefaultBindingMode("TwoWay");
			return olocalModelPageAut;
		},
		
		getModelTimeLineWorkFlow: function() {
			var oData = {
				"Posfin": "",
				"IdPosfin": "",
				"IdProposta": "",
				"Iter": "",
				"sTipo": ""
			};
			var olocalModelTimeLineWorkFlow = new JSONModel(oData);
			olocalModelTimeLineWorkFlow.setDefaultBindingMode("TwoWay");
			return olocalModelTimeLineWorkFlow;
		},
		
		getModelAnagraficaPF: function() {
			var oData = {};
			var olocalModelAnagraficaPF = new JSONModel(oData);
			olocalModelAnagraficaPF.setDefaultBindingMode("TwoWay");
			return olocalModelAnagraficaPF;
		},
		
		getModelAnagraficaFOP: function() {
			var oData = {};
			var olocalModelAnagraficaFOP = new JSONModel(oData);
			olocalModelAnagraficaFOP.setDefaultBindingMode("TwoWay");
			return olocalModelAnagraficaFOP;
		},
		
		getModelAnagraficaCOFOG: function() {
			var oData = {};
			var olocalModelAnagraficaCOFOG = new JSONModel(oData);
			olocalModelAnagraficaCOFOG.setDefaultBindingMode("TwoWay");
			return olocalModelAnagraficaCOFOG;
		},
		
		getModelAnagraficaID: function() {
			var oData = {};
			var olocalModelAnagraficaID = new JSONModel(oData);
			olocalModelAnagraficaID.setDefaultBindingMode("TwoWay");
			return olocalModelAnagraficaID;
		},
		
		getModelCofogDeleted: function() {
			var oData = {};
			var olocalModelCofogDeleted = new JSONModel(oData);
			olocalModelCofogDeleted.setDefaultBindingMode("TwoWay");
			return olocalModelCofogDeleted;
		},
		
		getModelTableGestisciID: function() {
			var oData = {};
			var olocalModelTableGestisciID = new JSONModel(oData);
			olocalModelTableGestisciID.setDefaultBindingMode("TwoWay");
			return olocalModelTableGestisciID;
		},
		
		getModelTableAnagraficaID: function() {
			var oData = {};
			var olocalModelTableAnagraficaID = new JSONModel(oData);
			olocalModelTableAnagraficaID.setDefaultBindingMode("TwoWay");
			return olocalModelTableAnagraficaID;
		},
		
		//Model per prevalorizzare i campi del cono su Nuova Pos Fin (utile solo per prototipo)
		getModelDefaultGeneraIdProposta: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				Fikrs: "S001",
				Anno: "2024",
				Fase: "DLB",
				Reale: "F1D24",
				Versione: "P",
				Prctr: "A020"
			};
			var olocalModel = new JSONModel(oJSONLocal);
			olocalModel.setDefaultBindingMode("TwoWay");
			return olocalModel;
		},
		
		getModelGestisciProposta: function(){
			var oJSONLocal = {
				"Prctr": "A020",
				"Attributo": "S"
			};
			var olocalModelGestisciProposta = new JSONModel(oJSONLocal);
			olocalModelGestisciProposta.setDefaultBindingMode("TwoWay");
			return olocalModelGestisciProposta;
		},
		
		getModelPosizioneFinanziaria: function() {
			var oData = {};
			var olocalModelPageAut = new JSONModel(oData);
			olocalModelPageAut.setDefaultBindingMode("TwoWay");
			return olocalModelPageAut;
		},
		
		getModelDettaglioAnagraficoId: function() {
			var oData = {};
			var olocalModelPage = new JSONModel(oData);
			olocalModelPage.setDefaultBindingMode("TwoWay");
			return olocalModelPage;
		},
		
		getModelDettaglioContabile: function() {
			var oData = {};
			var olocalModelPage = new JSONModel(oData);
			olocalModelPage.setDefaultBindingMode("TwoWay");
			return olocalModelPage;
		},
		
		//Model per prevalorizzare i campi del cono su Nuova Pos Fin (utile solo per prototipo)
		getModelDefaultPosFinToPropostaNav: function() {
			//    var sRootPath = jQuery.sap.getModulePath("PropostaSpesaPropostaSpesa");
			var oJSONLocal = {
				Fikrs: "S001",
				Anno: "2024",
				Fase: "DLB",
				Reale: "F1D24",
				Versione: "P",
				Prctr: "A020"
			};
			var olocalModel = new JSONModel(oJSONLocal);
			olocalModel.setDefaultBindingMode("TwoWay");
			return olocalModel;
		}
		
		
		

	};
});