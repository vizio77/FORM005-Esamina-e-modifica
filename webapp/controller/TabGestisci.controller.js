sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/core/syncStyleClass",
	"../util/formatter",
	"sap/ui/core/BusyIndicator",
], function(Controller, BaseController, JSONModel, Fragment, Filter, FilterOperator, MessageBox, syncStyleClass, formatter,BusyIndicator) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.TabGestisci", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.TabGestisci
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			this.oRouter.getRoute("TabGestisci").attachMatched(this._onRouteMatched, this);

			// this.oRouter.getRoute("TabGestisci").attachPatternMatched(this._onObjectMatched, this);
		},

		_onRouteMatched: async function(oEvent) {
			this.oRouter = this.getRouter();
			this.oDataModel = this.getModel();
			this._oResourceBundle = this.getResourceBundle();
			this.aRowsCofog = [];
			this.aRowsFOFP = [];
			this.aCofogDeleted = [];

			this.sRouterParameter = oEvent.getParameters().arguments.Page;
			//LOGICA PER GESTIONE MODIFICA/SOLO VISUALIZZAZIONE DEL TAB ANAGRAFICA
			this.oModelPG80 = this.getView().getModel("modelPG80");
			this._bloccaModificheAnagrafiche();
			//LOGICA GESTIONE VARIAZIONE ANAGRAFICA SU PROPOSTA GIA' ESISTENTE
			this._checkVariazioneAnagraficaProposta();
			this._setTestata();
			await this._gestTipologiche();
			this.getView().byId("idIconTabBar").setSelectedKey("Anagrafica");
			await this._getDatiAnagrafica();
			await this._AutRead();
			//this._getDatiStrAmm();
			this.getView().byId("TextAnno").setText(new Date().getFullYear() + 1);

			//lt salvo un modello generico della testata
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			if(isEmptyOData){
				sPosfin = this.getOwnerComponent().getModel("modelPageAut").getData()[0].IdPosfin;
			}else{
				sPosfin = oDataModPodFin[0].Fipex;
			}
			var oModelTestata = new JSONModel({Fipex: sPosfin});
			//this.getView().setModel(oModelTestata, "modelTestata");
			this.getView().getModel("modelPageAut").setProperty('/Fipex', sPosfin);

			//LOGICA PER GESTIONE BTN INVIO/REVOCA VALIDAZIONE da rivedere
			var sButtonInviaRevocaValidazione = this.getView().byId("btnInvioRevocaValidazione");

			var sIterVal = this.getView().byId("idIterTabID").getText();
			if (sIterVal.toUpperCase() === "INVIATO ALLA VALIDAZIONE") {
				sButtonInviaRevocaValidazione.setText(this._oResourceBundle.getText("RevocaValid"));
			} else {
				
				sButtonInviaRevocaValidazione.setText(this._oResourceBundle.getText("InvioValid"));
			}

			
			var dataModelInLavorazione={value:true};
			if(sIterVal.toUpperCase()!=="PROPOSTA IN LAVORAZIONE" && sIterVal.toUpperCase()!=="PROPOSTA IN LAVORAZIONE PRESSO UCB" ){
				dataModelInLavorazione.value=false;
			}else{
				dataModelInLavorazione.value=true;
			}
			var oModel = new JSONModel(dataModelInLavorazione);
			this.getView().setModel(oModel, "modelInLavorazione");
			
			
			var oDataModPodFin = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData();
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sProposta;
			if(!isEmptyOData){
				var oModel = this.getView().getModel("modelPageAut");
			}
			 
		},

		_setTestata: function() {
			this.getView().setModel(new JSONModel(sap.ui.getCore().getModel("modelPageAut").getData()[0]), "modelTestata");
		},
		/* _AutRead: function() {
			var that = this;
			this.oDataAut = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			this.getView().byId("idAutorizz").setEnabled(true);

			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			if(isEmptyOData){
				sPosfin = this.getOwnerComponent().getModel("modelPageAut").getData()[0].IdPosfin;
			}else{
				sPosfin = oDataModPodFin[0].Fipex;
			}

			var aFilters;
			aFilters = [ // <-- Should be an array, not a Filter instance!
				new Filter({ // required from "sap/ui/model/Filter"
					path: "Fipex",
					operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
					value1: sPosfin
				})
			];
			this.oDataAut.read("/ZCOBI_PRSP_CODBLSet", {
				filters: aFilters,
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("idAutorizz", false, response.results[0].Beschr);
						that.getOwnerComponent().getModel("modelPageAut").getData().CodiFincode = response.results[0].Fincode;
						that.getOwnerComponent().getModel("modelPreAut").setProperty("/ZCOBI_PRSP_CODBLSet", response.results);
						that.getView().getModel("modelPreAutInfoPopUp").setData(response.results[0]);
						that._fillInfoPopUp();
					}
					if (response.results.length > 1) {
						that.getView().getModel("modelPreAut").setProperty("/ZCOBI_PRSP_CODBLSet", response.results);
						that.getView().getModel("modelPreAutInfoPopUp").setData(response.results[0]);
						that.getView().byId("idAutorizz").setValue("");
					}
				},
				error: function(errorResponse) {
					var sDettagli = that._setErrorMex(errorResponse);
					var oErrorMessage = errorResponse.responseText;
					MessageBox.error(oErrorMessage, {
						details: sDettagli,
						initialFocus: sap.m.MessageBox.Action.CLOSE,
						styleClass: "sapUiSizeCompact"
					});
					MessageBox.error(oErrorMessage);
					MessageBox.error(oErrorMessage.responseText);
				}
			});
		}, */

		_AutRead: async function() {
			var that = this;

			var aModelPosFin = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData();

			var isEmptyOData = Object.keys(aModelPosFin).length == 0;
			var sPosfin;
			if (isEmptyOData) {
				sPosfin = this.getOwnerComponent().getModel("modelPageAut").getData()[0].IdPosfin;
			} else {
				sPosfin = aModelPosFin[0].Fipex;
			}

			var aFilters;
			aFilters = [ // <-- Should be an array, not a Filter instance!
				new Filter({ // required from "sap/ui/model/Filter"
					path: "Fipex",
					operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
					value1: sPosfin
				})
			];
			try {
				var aRes = await this.readFromDb("4", "/ZCOBI_PRSP_CODBLSet", aFilters, [], "");
				if (aRes.length === 1) {
					// this.getOwnerComponent().getModel("modelPageAut").getData().CodiFincode = aRes[0].Fincode;
					//this.getView().setModel(new JSONModel(aRes[0]), "modelPageAut");
					this.getView().setModel(new JSONModel(aRes[0]), "modelPreAutInfoPopUp");

				}
				if (aRes.length > 1) {
					this.getView().setModel(new JSONModel(aRes[0]), "modelPreAutInfoPopUp");
					//this.getView().setModel(new JSONModel(aRes[0]), "modelPageAut");

				}

				/*  -------------LOGICA VECCHIA
				if (response.results.length === 1) {
						that._fillDisableInput("idAutorizz", false, response.results[0].Beschr);
						that.getOwnerComponent().getModel("modelPageAut").getData().CodiFincode = response.results[0].Fincode;
						that.getOwnerComponent().getModel("modelPreAut").setProperty("/ZCOBI_PRSP_CODBLSet", response.results);
						that.getView().getModel("modelPreAutInfoPopUp").setData(response.results[0]);
						that._fillInfoPopUp();
					}
					if (response.results.length > 1) {
						that.getView().getModel("modelPreAut").setProperty("/ZCOBI_PRSP_CODBLSet", response.results);
						that.getView().getModel("modelPreAutInfoPopUp").setData(response.results[0]);
						that.getView().byId("idAutorizz").setValue("");
					} */
			} catch (e) {
				var sDettagli = that._setErrorMex(e);
				var oErrorMessage = e.responseText;
				MessageBox.error(oErrorMessage, {
					details: sDettagli,
					initialFocus: sap.m.MessageBox.Action.CLOSE,
					styleClass: "sapUiSizeCompact"
				});

			}

		},

		_fillInfoPopUp: function() {
			//var oInputAut = this.getView().byId("idAutorizz");

			var oDatiAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAut").getProperty("/ZCOBI_PRSP_CODBLSet/0");
			var oModelAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAutInfoPopUp");
			oModelAutInfoPopUp.setData("");
			oModelAutInfoPopUp.setData(oDatiAutInfoPopUp);

		},

		_refresh: function() {
			var urlSac = this.urlSac;
			window.frames[0].location = urlSac + (new Date());
		},

		onPressIconTabBar: async function(oEvent) {
			var sSelectedTab = oEvent.getParameters().selectedKey;

			switch (sSelectedTab) {
				case 'Cassa':
					this.getView().byId('btnInfoCassaTabID').setVisible(true);
					this.getView().byId('btnInfoCompetenzaTabID').setVisible(false);
					await this._getSchedaSacCassa();
					break;
				case 'Workflow':
					await this._TimelineCompiler();
					break;
				case 'Anagrafica':
					//await this._getDatiAnagrafica();
					//await this._AutRead();
					break;
				case 'Note':
					await this._getNota();
					break;
				case 'Competenza':
					this.getView().byId('btnInfoCassaTabID').setVisible(false);
					this.getView().byId('btnInfoCompetenzaTabID').setVisible(true);
					await this._dataAuto();
					break;

			}

		},
		_dataAuto: async function() {
			try {
				var aFilters = [];
				var aData = this.getView().getModel("modelTestata").getData();
				aFilters.push(new Filter("Fikrs", FilterOperator.EQ, aData.Fikrs));
				// var oFilterEos = new Filter("Eos", FilterOperator.EQ, sEos);
				aFilters.push(new Filter("Anno", FilterOperator.EQ, aData.AnnoFipex));
				aFilters.push(new Filter("Reale", FilterOperator.EQ, aData.Reale));
				aFilters.push(new Filter("Fase", FilterOperator.EQ, aData.Fase));
				aFilters.push(new Filter("Versione", FilterOperator.EQ, aData.Versione));
				aFilters.push(new Filter("Fipex", FilterOperator.EQ, aData.Fipex));
				var aRes = await this.readFromDb("4", "/ZCOBI_PRSP_ASSAUTSet", aFilters, [], "");
				this.getView().setModel(new JSONModel(aRes), "modelAnagraficaAuto");
			} catch (e) {
				MessageBox.error(e);
			}
		},
		_getSchedaSacCassa: async function() {

			var that = this;
			this.urlSac = "";
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var sPg = this.getView().getModel("modelAnagraficaPf").getData().Codicepg
			var oLocalModel;
			var sPosfin, sIdProp, sAut;
			var oDati = {};

			oLocalModel = this.getView().getModel("modelPageAut").getData();

			sPosfin = oLocalModel.IdPosfin;
			sIdProp = this.getView().getModel("modelTestata").getData().Key_Code;

			oDati = {
				"PosFin": oLocalModel.Fipex,
				"IdProposta": sIdProp,
				"Autorizzazione": "",
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "CASSA",
				"Pg": sPg

			};

			if (oLocalModel) {
				try {
					var aRes = await this.insertRecord("4", "/SacUrlSet", oDati);
					var oFrame = this.getView().byId("linkSacCassa");
					this.urlSac = aRes.URL;
					var oFrameContent = oFrame.$()[0];
					oFrameContent.setAttribute("src", that.urlSac);
					this._refresh();
				} catch (e) {
					MessageBox.error(oResourceBundle.getText("MBCreateErrorPageAut"), {
						id: "messER",
						title: "Error",
						actions: [MessageBox.Action.OK],
					});
					sap.ui.getCore().byId("messER").getButtons()[0].setType("Emphasized");
				}

			} else {
				MessageBox.warning(oResourceBundle.getText("MBTastoCassaPagePosFinId"), {
					id: "messWA",
					title: "Warning",
					actions: [MessageBox.Action.OK],
				});
				sap.ui.getCore().byId("messWA").getButtons()[0].setType("Emphasized");
			}

		},

		/* _getSchedaSac: function() {

			this.getView().byId("idBoxAut").setVisible(false);
			var that = this;
			this.urlSac = "";
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oLocalModel;
			var sPosfin, sIdProp, sAut;
			var oDati = {};

			oLocalModel = this.getOwnerComponent().getModel("modelPageAut").getData();

			sPosfin = oLocalModel[0].IdPosfin;
			sIdProp = oLocalModel[0].Keycodepr;
			sAut = "";
			oDati = {
				"PosFin": sPosfin,
				"IdProposta": sIdProp,
				"Autorizzazione": sAut,
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "CASSA"
			};

			if (oLocalModel) {

				oGlobalModel.create("/SacUrlSet", oDati, {
					success: function(oData) {
						//sap.m.MessageBox.success(oResourceBundle.getText(""));
						var oFrame = that.getView().byId("linkSacCassa");
						that.urlSac = oData.URL;
						var oFrameContent = oFrame.$()[0];
						oFrameContent.setAttribute("src", that.urlSac);
						that._refresh();
					},
					error: function(oError) {
						sap.m.MessageBox.error(oResourceBundle.getText("MBCreateErrorPageAut"));
					}
				});

			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoCassaPagePosFinId"));
			}

		}, */

		_getSchedaCompetenza: function() {
			this.getView().byId("idBoxAut").setVisible(true);

			var that = this;
			this.urlSac = "";
			var oFrame = that.getView().byId("linkSacCompetenza");
			var oFrameContent = oFrame.$()[0];
			oFrameContent.setAttribute("src", that.urlSac);

			// var sValAutInput = this.getView().byId("idAutorizz").getSelectedKey();
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oDataPageAut = this.getOwnerComponent().getModel("modelPageAut").getData();

			var sPosfin = oDataPageAut[0].IdPosfin;
			var sIdProp = oDataPageAut[0].Keycodepr;
			var sValAutInput = oDataPageAut[0].CodiFincode;

			var oDati = {
				"PosFin": sPosfin,
				"IdProposta": sIdProp,
				"Autorizzazione": sValAutInput,
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "COMPETENZA"
			};

			if (sValAutInput) {

				oGlobalModel.create("/SacUrlSet", oDati, {
					success: function(oData) {
						//sap.m.MessageBox.success(oResourceBundle.getText(""));
						//console.log(oData);
						that.oFrame = that.getView().byId("linkSac");
						that.urlSac = oData.URL;
						that.oFrameContent = oFrame.$()[0];
						that.oFrameContent.setAttribute("src", that.urlSac);
						that._refresh();
					},
					error: function(oError) {
						sap.m.MessageBox.error(oResourceBundle.getText("MBCreateErrorPageAut"));
					}
				});

			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoAvvioPageAut"));
			}

		},

		_TimelineCompiler: async function() {

			var oLocalModel = this.getView().getModel("modelPageAut");

			var oDataModPodFin = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData();
			var isEmptyOData = Object.keys(oDataModPodFin).length == 0;
			var sProposta;
			if (isEmptyOData) {
				sProposta = oLocalModel.getData()[0].IdProposta;
			} else {
				sProposta = oDataModPodFin[0].IdProposta;
			}

			var sEos = "S";
			var sAmm = this.getOwnerComponent().getModel("gestTipologicheModel").getData().Prctr;
			var aFilters = [];
			aFilters = [
				new Filter({
					path: "IdProposta",
					operator: FilterOperator.EQ,
					value1: sProposta
				}),
				new Filter({
					path: "Eos",
					operator: FilterOperator.EQ,
					value1: sEos
				}),
				new Filter({
					path: "Amministrazione",
					operator: FilterOperator.EQ,
					value1: sAmm
				})
			];

			try {
				var aRes = await this.readFromDb("4", "/WorkFlowSet", aFilters, [], "");
				this.getView().setModel(new JSONModel(aRes), "modelTimeLineWorkFlow")
			} catch (errorResponse) {

				MessageBox.error(this.getResourceBundle().getText("NessunDato"));

			}

		},

		_getDatiAnagrafica: async function() {
			var sFipex = this.getView().byId("idLinkPosfinTab").getText();
			// var sIdProposta = this.getView().byId("idPropostaTabID").getText();
			var sKeycodepr, sFikrs,sAnno, sFase, sReale,sVersione, sEos ;

			
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			if(isEmptyOData){
				 sKeycodepr = this.getView().getModel("modelPageAut").getData()[0].Keycodepr;
				 sFikrs = this.getView().getModel("modelPageAut").getData()[0].Fikrs;
				 sAnno = this.getView().getModel("modelPageAut").getData()[0].AnnoFipex;
				 sFase = this.getView().getModel("modelPageAut").getData()[0].Fase;
				 sReale = this.getView().getModel("modelPageAut").getData()[0].Reale;
				 sVersione = this.getView().getModel("modelPageAut").getData()[0].Versione;
				 sEos = this.getView().getModel("modelPageAut").getData()[0].Eos;
			}else{
				sFipex = oDataModPodFin[0].Fipex;
				sPosfin = oDataModPodFin[0].Fipex;
				sKeycodepr = oDataModPodFin[0].Key_Code;
				 sFikrs = oDataModPodFin[0].Fikrs;
				 sAnno = oDataModPodFin[0].AnnoFipex;
				 sFase = oDataModPodFin[0].Fase;
				 sReale = oDataModPodFin[0].Reale;
				 sVersione = oDataModPodFin[0].Versione;
				 sEos = oDataModPodFin[0].Eos;
			}
			
			/*if(sFipex) {
				sFipex = sFipex.replaceAll(".", "");
			}*/
			var aFilters;
			aFilters = [ // <-- Should be an array, not a Filter instance!
				new Filter({ // required from "sap/ui/model/Filter"
					path: "Fipex",
					operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
					value1: sFipex
				})
				/*,
									new Filter({ // required from "sap/ui/model/Filter"
										path: "Keycodepr",
										operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
										value1: sKeycodepr
									})*/
			];

			var sPathPF = "/PosFinSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
				sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "')";

			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var that = this;

			try {
			var aRes = await this.readFromDb("4", sPathPF, [], [], ["PosFinToCofogNav", "PosFinToFoFpNav"]);
			that.getView().getModel("modelAnagraficaPf").setData(aRes);

			if (aRes.Codifofpspe !== "") {
				this.Editable = false;
			} else {
				this.Editable = true;
			}

			that.getView().getModel("modelAnagraficaFOP").setData(aRes.PosFinToFoFpNav.results);
			var oTableCofog = that.getView().getModel("modelAnagraficaCofog");
					var aDataCofog = [];
					var aCofog = aRes.PosFinToCofogNav.results;
					for (var i = 0; i < aCofog.length; i++) {
						aDataCofog.push(aCofog[i]);
					}
					oTableCofog.setData(aDataCofog);
			} catch (e) {
				MessageBox.error(e.responseText);
			}

			try {
				var aRes = await this.readFromDb("4", "/PropostaSet(Keycodepr='" + sKeycodepr + "')", [], [], [, ]);
				that.getView().getModel("modelAnagraficaID").setData(aRes)
				} catch (e) {
					MessageBox.error(e.responseText);
				}


			/* oGlobalModel.read(sPathPF, {
				// filters: aFilters,
				urlParameters: {
					// "$top": 1,
					"$expand": ["PosFinToCofogNav", "PosFinToFoFpNav"]

				},
				success: function(oData, oResponse) {
					that.getView().getModel("modelAnagraficaPf").setData(oData);
					that.getView().getModel("modelAnagraficaFOP").setData(oData.PosFinToFoFpNav.results);

					var oTableCofog = that.getView().getModel("modelAnagraficaCofog");
					var aDataCofog = [];
					var aCofog = oData.PosFinToCofogNav.results;
					for (var i = 0; i < aCofog.length; i++) {
						aDataCofog.push(aCofog[i]);
					}
					oTableCofog.setData(aDataCofog);
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			}); */

			// var aFoFp = [];

			/* var sPathID = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";
			oGlobalModel.read(sPathID, {
				success: function(oData, oResponse) {
					that.getView().getModel("modelAnagraficaID").setData(oData);
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			}); */
		},

		/* _getDatiStrAmm: function() {
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oLocalModel = this.getView().getModel("modelStrAmm");

			var sFipex, sFikrs, sAnno,sFase,sReale, sVersione, sEos;
			
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			if(isEmptyOData){
				sFipex = this.getView().byId("idLinkPosfinTab").getText();
			// var sKeycodepr = this.getView().getModel("modelPageAut").getData()[0].Keycodepr;
				sFikrs = this.getView().getModel("modelPageAut").getData()[0].Fikrs;
				 sAnno = this.getView().getModel("modelPageAut").getData()[0].AnnoFipex;
				 sFase = this.getView().getModel("modelPageAut").getData()[0].Fase;
				 sReale = this.getView().getModel("modelPageAut").getData()[0].Reale;
				 sVersione = this.getView().getModel("modelPageAut").getData()[0].Versione;
				 sEos = this.getView().getModel("modelPageAut").getData()[0].Eos;
			}else{

				sFipex = oDataModPodFin[0].Fipex;
				sFikrs = oDataModPodFin[0].Fikrs;
				 sAnno = oDataModPodFin[0].AnnoFipex;
				 sFase = oDataModPodFin[0].Fase;
				 sReale = oDataModPodFin[0].Reale;
				 sVersione = oDataModPodFin[0].Versione;
				 sEos = oDataModPodFin[0].Eos;
			}

			var sPathPF = "/PosFinSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
				sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "')";

			var that = this;
			oGlobalModel.read(sPathPF, {
				// filters: aFilters,
				urlParameters: {
					// "$top": 1,
					// "$expand": ["PosFinToCofogNav", "PosFinToFoFpNav"]
				},
				success: function(oData, oResponse) {
					// console.log(oData);
					oLocalModel.setData(oData);
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		}, */

		onPressShowPopupStrAmm: function(e) {
			var sBtn = e.getSource();
			var oView = this.getView();

			if (!this._PopupStrAmm) {
				this._PopupStrAmm = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopupStrAmmTabGestisci",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oPopover);
					return oPopover;
				});
			}

			this._PopupStrAmm.then(function(oPopover) {
				// Open ValueHelpDialog filtered by the input's value
				oPopover.openBy(sBtn);
			});
		},

		_getReiscrizioni: function() {
			var nReiscrizioni = this.getView().getModel("modelPreAutInfoPopUp").getData().Reiscrizioni;
			if (nReiscrizioni === "0.000" || nReiscrizioni === undefined || nReiscrizioni === "") {
				this.getView().byId("idBoxReiscrizioni").setVisible(false);
			} else {
				this.getView().byId("idBoxReiscrizioni").setVisible(true);
			}
		},
		
		_getDatiReiscrizioni: function() {
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			
			var sAuthDescr = this.getView().byId("idAutorizz").getValue();
			
			var sAutorizzazione = this.getView().getModel("modelPreAut").getData().ZCOBI_PRSP_CODBLSet.find(item => {return item.Beschr === sAuthDescr});
			
			//this.getView().getModel("modelPreAut").getData().Fincode;
			
			var aFilters = [];
			var that = this;

			aFilters.push(new Filter("Autorizzazione", FilterOperator.EQ, sAutorizzazione.Fincode));
			
			//aFilters.push(new Filter("Autorizzazione", FilterOperator.EQ, "1639"));
			
			oDataModel.read("/ReiscrizioniSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					// console.log(oData.results);
					that.getView().getModel("modelTableReiscrizioni").setData(oData.results);
					var somma = 0;
					oData.results.forEach(element => {
						somma += Number(element.ImportoReiscrizioni);
					});
					that.getView().byId("idFooterImporto").setText(somma.toFixed(2));
				},
				error: function(errorResponse) {
					var sDettagli = that._setErrorMex(errorResponse);
					var oErrorMessage = errorResponse.responseText;
					MessageBox.error(oErrorMessage, {
						details: sDettagli,
						initialFocus: sap.m.MessageBox.Action.CLOSE,
						styleClass: "sapUiSizeCompact"
					});
					MessageBox.error(oErrorMessage);
				}
			});
		},

		onPressShowReiscrizioni: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();
			
			this._getDatiReiscrizioni();
			
			if (!this.popupShowReiscrizioni) {
				this.popupShowReiscrizioni = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopupShowReiscrizioni",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this.popupShowReiscrizioni.then(function(oPopover) {
				//oPopover.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				oPopover.openBy(sBtn);
			});
		},

		onPressAvvio: function() {
			this._getSchedaCompetenza();
		},

		/* _getNota: function() {
			var oLocalModel = this.getView().getModel("modelPageAut");
			var sKeycode;
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			if(isEmptyOData){
				sKeycode = oLocalModel.getData()[0].Keycodepr;
			}else{
				sKeycode = oDataModPodFin[0].Keycodepr;
			}

			this.getView().bindElement({
				path: "/PropostaSet(Keycodepr='" + sKeycode + "')",
				model: "ZSS4_COBI_PRSP_ESAMOD_SRV"
			});

		}, */

		_getNota: async function() {
            var aData = this.getView().getModel("modelTestata").getData();
            try {
                var aRes = await this.readFromDb("4", "/PropostaSet(Keycodepr='" + aData.Key_Code + "')", [], [], "");
                this.getView().setModel(new JSONModel(aRes), "modelNote")
                if (aRes.Idnota !== "0000000000") {
                    this.getView().byId("idInputScegliNoteIDProposta").setValue(aRes.Idnota);
                    this.getView().byId("idNota").setEditable(false);
                } else if (aRes.Idnota === "0000000000" && aRes.Testonota.length === 0) {
                    this.getView().byId("idInputScegliNoteIDProposta").setEditable(true);
                    this.getView().byId("idInputScegliNoteIDProposta").setValue("");
                } else {
                    this.getView().byId("idInputScegliNoteIDProposta").setEditable(false);
                    this.getView().byId("idInputScegliNoteIDProposta").setValue("");
                }
                var aRes = await this.readFromDb("4", "/ZES_NOTE_IDSet", [], [], "");
                this.getView().setModel(new JSONModel(aRes), "modelListaIdNote");
            } catch (e) {}
        },
		
		/*onBeforeRendering: function(){},*/

		

		// _onObjectMatched: function(oEvent) {},

		onNavBackToPreviousPage: function() {
			if (this.sRouterParameter === "IdProposta") {
				this.oRouter.navTo("IdProposta");
			} else if (this.sRouterParameter === "PosFin-IdProposta") {
				this._resetCheckbox("modelTreeTable", "treeTablePFID");
				this.oRouter.navTo("PosFin-IdProposta");
			}
		},

		_checkVariazioneAnagraficaProposta: function() {
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			var sFipex,sKeycodepr,sFikrs,sAnno,sFase,sReale,sVersione,sEos;
			if(isEmptyOData){
				 sFipex = this.getView().byId("idLinkPosfinTab").getText();
				 sKeycodepr = this.getView().getModel("modelPageAut").getData()[0].Keycodepr;
				 sFikrs = this.getView().getModel("modelPageAut").getData()[0].Fikrs;
				 sAnno = this.getView().getModel("modelPageAut").getData()[0].AnnoFipex;
				 sFase = this.getView().getModel("modelPageAut").getData()[0].Fase;
				 sReale = this.getView().getModel("modelPageAut").getData()[0].Reale;
				 sVersione = this.getView().getModel("modelPageAut").getData()[0].Versione;
				 sEos = this.getView().getModel("modelPageAut").getData()[0].Eos;
			}else{
				sPosfin = oDataModPodFin[0].Fipex;
				sFipex = oDataModPodFin[0].Fipex;
				 sKeycodepr = oDataModPodFin[0].Key_Code;
				 sFikrs = oDataModPodFin[0].Fikrs;
				 sAnno = oDataModPodFin[0].AnnoFipex;
				 sFase = oDataModPodFin[0].Fase;
				 sReale = oDataModPodFin[0].Reale;
				 sVersione = oDataModPodFin[0].Versione;
				 sEos = oDataModPodFin[0].Eos;
			}


			var aFilters = [];

			var fFipex = new Filter("Fipex", FilterOperator.EQ, sFipex);
			var fFikrs = new Filter("Fikrs", FilterOperator.EQ, sFikrs);
			var fAnno = new Filter("Anno", FilterOperator.EQ, sAnno);
			var fFase = new Filter("Fase", FilterOperator.EQ, sFase);
			var fReale = new Filter("Reale", FilterOperator.EQ, sReale);
			var fVersione = new Filter("Versione", FilterOperator.EQ, sVersione);
			var fEos = new Filter("Eos", FilterOperator.EQ, sEos);
			var fFlagana = new Filter("Flagana", FilterOperator.EQ, "X");

			aFilters.push(fFipex, fFikrs, fAnno, fFase, fReale, fVersione, fEos, fFlagana);

			var that = this;

			oGlobalModel.read("/PropostaSet", {
				filters: aFilters,
				urlParameters: {},
				success: function(oData, oResponse) {
					if (oData.results !== undefined && oData.results.length > 0) {
						that.sKeycodeprConVarAna = oData.results[0].Keycodepr;
						if (that.sKeycodeprConVarAna !== undefined && that.sKeycodeprConVarAna !== sKeycodepr) {
							that.checkVarEsistente = "X";
							that.oModelPG80.setProperty("/capCodStd", false);
							that.getView().byId("btnSalvaModificheAnagrafiche").setVisible(false);
							MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("MBVarAnaEsistente").replaceAll("{0}",oData.results[0].Fipex).replaceAll("{1}",that.sKeycodeprConVarAna));
						} else {
							that.oModelPG80.setProperty("/capCodStd", true);
							that.getView().byId("btnSalvaModificheAnagrafiche").setVisible(true);
						}
					} else {
						that.oModelPG80.setProperty("/capCodStd", true);
						that.getView().byId("btnSalvaModificheAnagrafiche").setVisible(true);
					}
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});
		},

		attivaDisattiva: function(oEvent){
			var modelAnagraficaPf = this.getView().getModel("modelAnagraficaPf")

			var status = modelAnagraficaPf.getProperty("/Statstatus")
			
			/* if(status === "1"){
				status = "3"
			}else{
				status = "1"
			} */
			var status = modelAnagraficaPf.getProperty("/Attivo")
			
			if(status === "X"){
				status = ""
			}else{
				status = "X"
			}
			
			modelAnagraficaPf.setProperty("/Attivo", status)

		},

		//LOGICA PER BLOCCARE MODIFICHE ANAGRAFICHE SE PG >=80
		_bloccaModificheAnagrafiche: function() {
			var oButtonSalvaModifiche = this.getView().byId("btnSalvaModificheAnagrafiche");
			var oBtnAttivaDisattiva = this.getView().byId("idSwitchSnapID");
			var sCodCap = this.getView().byId("idCodCap");

			var sSelectedPosFinVal = this.getView().byId("idLinkPosfinTab").getText();
			var sPgVal = sSelectedPosFinVal.substring(8, sSelectedPosFinVal.indexOf("."));

			if (sPgVal >= "80") {
				this.oModelPG80.setProperty("/pg80Enable", false);
				this.oModelPG80.setProperty("/pg80btnEnable", false);
				this.oModelPG80.setProperty("/capCodStd", false);
				oButtonSalvaModifiche.setVisible(false);
			}

			if (sCodCap.getValue().toUpperCase() === "STANDARD") {
				this.oModelPG80.setProperty("/capCodStd", false);
			}
		},
		
		onPressAssociaAut: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.AssociaAut) {
				this.AssociaAut = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.AssociaAutorizzazionePopOver",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this.AssociaAut.then(function(oPopover) {
				oPopover.openBy(sBtn);
			});

			/*	this.oRouter.navTo("MessagePage", {
					viewName: "AssociaAutorizzazione"
				});*/
		},

		onPressChiudiAssAut: function() {

			var oPopover = this.getView().byId("AssociaAutPopover");
			oPopover.close();
		},

		onPressOkAssAut: async function() {

			var aDataAnag = this.getView().getModel("modelAnagraficaPf").getData();
			var aCheckAnagrafica = this.Editable;
			var sFincode = this.byId("AutorizzazioniMCD").getAutorizzazione().FINCODE
			if (aCheckAnagrafica === true) {
				var oEntry = {
					"Fipex": aDataAnag.Fipex,
					"Fikrs": aDataAnag.Fikrs,
					"Anno": aDataAnag.Anno,
					"Fase": aDataAnag.Fase,
					"Reale": aDataAnag.Reale,
					"Versione": aDataAnag.Versione,
					"Fictr": this.getView().getModel("modelTestata").getData().Fictr,
					"Fincode": sFincode
				};
				try {
					await this.insertRecord("4", "/ZCOBI_PRSP_ASSAUTSet", oEntry);

					MessageBox.success(this.getResourceBundle().getText("AUTOOK"), {
						id: "messSU",
						title: "Success",
						actions: [MessageBox.Action.OK],
					});
					sap.ui.getCore().byId("messSU").getButtons()[0].setType("Emphasized");
					this.onPressChiudiAssAut();
					this.getView().getModel("modelAnagraficaPf").refresh();
					aCheckAnagrafica = true;
					await this._getDatiAnagrafica();
					await this._dataAuto();
				} catch (e) {

				}
			} else {
				MessageBox.warning(this.getResourceBundle().getText("ERRORFOFP"), {
					id: "messWA",
					title: "Warning",
					actions: [MessageBox.Action.OK],
				});
				sap.ui.getCore().byId("messWA").getButtons()[0].setType("Emphasized");

			}

		},

		handleAddCOFOG: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.CofogPopUp) {
				this.CofogPopUp = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpAggiungiCofog",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			this.CofogPopUp.then(function(oDialog) {
				//oDialog.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sBtn);
			});
		},

		//Aggiungi riga COFOG in tabella
		onPressOk: function(oEvent) {
			var sValLiv1 = this.getView().byId("idCofogLiv1").getValue();
			var sValLiv2 = this.getView().byId("idCofogLiv2").getValue();
			var sValLiv3 = this.getView().byId("idCofogLiv3").getValue();
			var sValDescr = this.getView().byId("idDescrCofog").getValue();
			var sValIdCofog = this.getView().byId("idCofogLiv3").getSelectedKey();
			var sPosFin = this.getView().byId("idLinkPosfinTab").getText();

			var oLocalModel = this.getOwnerComponent().getModel("modelAnagraficaCofog");

			if (sValLiv3) {
				var oTable = this.getView().byId("TableCofogTab-Id");
				var oDati = {
					Codcofogl1: sValLiv1,
					Codcofogl2: sValLiv2,
					Codcofogl3: sValLiv3,
					Descrcofog: sValDescr,
					Codconcatenato: sValIdCofog,
					Perccofog: "",
					Icon: "sap-icon://delete"
				};
				this.aRowsCofog = [];
				var aTableCofog = oLocalModel.getData();
				for (var i = 0; i < aTableCofog.length; i++) {
					this.aRowsCofog.push(aTableCofog[i]);
				}
				this.aRowsCofog.push(oDati);
				oLocalModel.setData(this.aRowsCofog);
				oTable.getBinding("items").refresh();
				this.getView().byId("idCofogLiv1").setValue("");
				this.getView().byId("idCofogLiv2").setValue("");
				this.getView().byId("idCofogLiv3").setValue("");
				this.getView().byId("idDescrCofog").setValue("");
			}
		},

		onPressChiudiCofog: function() {
			var oDialog = this.getView().byId("idFragCofog");
			oDialog.close();
		},

		onPressDeleteRow: function(oEvt) {
			var oTable = this.getView().byId("TableCofogTab-Id");
			var oModelTableCofog = this.getView().getModel("modelAnagraficaCofog");
			var oModelCofogDeleted = this.getView().getModel("modelCofogDeleted");
			var sPath = oEvt.getSource().getBindingContext("modelAnagraficaCofog").getPath();
			sPath = sPath.substring(sPath.lastIndexOf("/") + 1);
			var aObj = oModelTableCofog.getData();
			if (aObj.length === 1) {
				MessageBox.warning(this._oResourceBundle.getText("MBUpdateErrorLastCofogTab"));
			} else {
				var oItemDeleted = aObj.splice(sPath, 1);
				if (!oItemDeleted.Fikrs) {
					if (this.aCofogDeleted.length !== 0) {
						for (var l = 0; l < this.aCofogDeleted.length; l++) {
							if (this.aCofogDeleted[l].includes(oItemDeleted) === true) {
								return;
							} else {
								this.aCofogDeleted.push(oItemDeleted);
							}
						}
					} else {
						this.aCofogDeleted.push(oItemDeleted);
					}
				}
				oModelCofogDeleted.setData(this.aCofogDeleted);
				oModelTableCofog.setProperty("/", aObj);
				oTable.getBinding("items").refresh();
			}
		},

		//******************LOGICHE GESTIONE PANEL FOFP*********************
		handleAddFOFP: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.FOFPPopUp) {
				this.FOFPPopUp = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpAggiungiFOFP",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			this.FOFPPopUp.then(function(oDialog) {
				//oDialog.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				oDialog.open(sBtn);
			});
		},

		//Aggiungi riga FOFP in tabella
		onPressOkAggiungiFOFP: function(oEvent) {
			var sAutVal = this.getView().byId("idInputAutTab").getValue();
			var sFOFPVal = this.getView().byId("idRBGroupFoFp").getSelectedButton();
			var sFO, sFP;

			if (sFOFPVal.getIdForLabel().split("--")[1] === "FO") {
				sFO = "SI";
				sFP = "NO";
			} else {
				sFO = "NO";
				sFP = "SI";
			}
			var oLocalModelFOFP = this.getOwnerComponent().getModel("modelTableFOFPTab");
			if (sFOFPVal) {
				var oTable = this.getView().byId("TableFOFPTabID");
				var oDati = {
					Aut: sAutVal,
					FO: sFO,
					FP: sFP
				};
				this.aRowsFOFP.push(oDati);
				oLocalModelFOFP.setData(this.aRowsFOFP);
				oTable.getBinding("items").refresh();
				this.onPressChiudiFOFP();

				this.getView().byId("idInputAutTab").setValue("");
				this.getView().byId("FO").setSelected(false);
				this.getView().byId("FP").setSelected(false);
			}
		},

		onPressChiudiFOFP: function() {
			var oDialog = this.getView().byId("idFragFOFPTab");
			oDialog.close();
		},
		
		onPressNavToRV: function() {
			this.getRouter().navTo("CreaRimodulazioneVerticale");
			/*this.oRouter.navTo("MessagePage", {
				viewName: "CreaRimodulazioneVerticale"
			});*/
		},

		onPressNavToNuovaPosizione: function() {
			this.oRouter.navTo("NuovaPosizioneFinanziaria");
			/*this.oRouter.navTo("MessagePage", {
				viewName: "NuovaPosizioneFinanziaria"
			});*/
		},

		//******************************LOGICA GESTION POPUP INFO AUTORIZZAZIONE**************************
		onPressInfo: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.InfoAut) {
				this.InfoAut = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.InfoAutPopOver",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this.InfoAut.then(function(oPopover) {
				//oPopover.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				oPopover.openBy(sBtn);
			});
		},

		onPressChiudiInfoAutPopOver: function() {
			var oPopupInfo = this.getView().byId("InfoAutPopOver");
			oPopupInfo.close();
		},
		
		

		//************************LOGICA FILTRO AUTORIZZAZIONE*******************************************
		onChange: function(oEvent, inputRef) {

			if (inputRef === "idAutorizz") {

				var sCodiFincode = oEvent.getSource().getProperty("selectedKey");
				var oDataPageAut = this.getOwnerComponent().getModel("modelPageAut").getData()[0];
				oDataPageAut.CodiFincode = sCodiFincode;

			}
		},

		onSuggest: function(oEvent, inputRef) {
			var oInput, sTerm, aOrFilters, aAndFilters;

			if (inputRef === "idAutorizz") {
				oInput = oEvent.getSource();

				sTerm = oEvent.getParameter("suggestValue");

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);
				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelPreAut>/ZCOBI_PRSP_CODBLSet", "{modelPreAut>Beschr}", "", aAndFilters);
			}

			if (inputRef === "idAutorizzPop") {
				//Filtri chiave
				var oLocalModel = this.getView().getModel("modelPageAut");
				var sFikrs = oLocalModel.getData("/0")[0].Fikrs;
				// var sEos = oLocalModel.getData("/0")[0].Eos;
				var sAnno = oLocalModel.getData("/0")[0].AnnoFipex;
				var sReale = oLocalModel.getData("/0")[0].Reale;
				var sFase = oLocalModel.getData("/0")[0].Fase;
				var sVersione = oLocalModel.getData("/0")[0].Versione;
				var sFipex = oLocalModel.getData("/0")[0].Fipex;

				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue");

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				var aCompoundFilters = [];
				var oFilterFikrs = this._filtersInCompound("Fikrs", sFikrs);
				// var oFilterEos = this._filtersInCompound("Eos", sEos);
				var oFilterAnno = this._filtersInCompound("Anno", sAnno);
				var oFilterReale = this._filtersInCompound("Reale", sReale);
				var oFilterFase = this._filtersInCompound("Fase", sFase);
				var oFilterVersione = this._filtersInCompound("Versione", sVersione);
				var oFilterFipex = this._filtersInCompound("Fipex", sFipex);
				aCompoundFilters.push(oFilterFikrs, oFilterAnno, oFilterReale, oFilterFase, oFilterVersione, oFilterFipex);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/ZCOBI_PRSP_ASSAUTSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Beschr}", "",
					aAndFilters);
			}

			if (inputRef === "idCofogLiv3") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizione", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_COFOGSet", "{Codcofogl3}", "{Descrizione}", aAndFilters);
			}
		},

		onValueHelpRequest: function(oEvent, inputRef) {
			var sInputValue, oView, aOrFiltersCond, aFilters;
			var arrayProperties = [];
			var oModelGlobal = this.getView().getModel();
			var oModelPreAut = this.getView().getModel("modelPreAut");
			var oModelAssAut = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sPosfin = this.getOwnerComponent().getModel("modelPageAut").getData()[0].IdPosfin;

			//Filtri chiave
			var oLocalModel = this.getView().getModel("modelPageAut");
			var sFikrs = oLocalModel.getData("/0")[0].Fikrs;
			// var sEos = oLocalModel.getData("/0")[0].Eos;
			var sAnno = oLocalModel.getData("/0")[0].AnnoFipex;
			var sReale = oLocalModel.getData("/0")[0].Reale;
			var sFase = oLocalModel.getData("/0")[0].Fase;
			var sVersione = oLocalModel.getData("/0")[0].Versione;
			var sFipex = oLocalModel.getData("/0")[0].Fipex;

			sInputValue = oEvent.getSource().getValue();
			oView = this.getView();

			if (inputRef === "idAutorizzPop") {
				if (!this.AutorizzPop) {
					this.AutorizzPop = this.createValueHelpDialog(
						"idAutorizzPop",
						oModelAssAut,
						"ZSS4_COBI_PRSP_ESAMOD_SRV",
						"{i18n>Autorizzazione}",
						"/ZCOBI_PRSP_ASSAUTSet",
						"Beschr",
						"");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				var oFilterFikrs = new Filter("Fikrs", FilterOperator.EQ, sFikrs);
				// var oFilterEos = new Filter("Eos", FilterOperator.EQ, sEos);
				var oFilterAnno = new Filter("Anno", FilterOperator.EQ, sAnno);
				var oFilterReale = new Filter("Reale", FilterOperator.EQ, sReale);
				var oFilterFase = new Filter("Fase", FilterOperator.EQ, sFase);
				var oFilterVersione = new Filter("Versione", FilterOperator.EQ, sVersione);
				var oFilterFipex = new Filter("Fipex", FilterOperator.EQ, sFipex);

				aFilters.aFilters.push(oFilterFikrs, oFilterAnno, oFilterReale, oFilterFase, oFilterVersione, oFilterFipex);

				this.AutorizzPop.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.AutorizzPop.open(sInputValue);
			}

			if (inputRef === "idAutorizz") {
				if (!this.Autorizz) {
					this.Autorizz = this.createValueHelpDialog(
						"idAutorizz",
						oModelPreAut,
						"modelPreAut",
						"{i18n>Autorizzazione}",
						"/ZCOBI_PRSP_CODBLSet",
						"Beschr",
						"");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				aFilters =
					new Filter({
						filters: [
							aOrFiltersCond,
							new Filter("Fipex", FilterOperator.EQ, sPosfin)
						],
						and: true

					});
				this.Autorizz.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.Autorizz.open(sInputValue);
			}

			if (inputRef === "idCofogLiv3") {
				arrayProperties = [{
					"property": "Codcofogl1",
					"label": "{i18n>COFOG1}"
				}, {
					"property": "Codcofogl2",
					"label": "{i18n>COFOG2}"
				}, {
					"property": "Codcofogl3",
					"label": "{i18n>COFOG3}"
				}, {
					"property": "Descrizione",
					"label": "{i18n>DescrCofog}"
				}];

				if (!this.idCofogLiv3) {
					this.idCofogLiv3 = this.createValueHelpTableSelectDialog(
						"idCofogLiv3",
						oModelGlobal,
						"",
						"{i18n>Cofog}",
						"/ZCA_AF_COFOGSet",
						arrayProperties);
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("NumeLiv3", FilterOperator.Contains, sInputValue),
							new Filter("Descrizione", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.idCofogLiv3.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idCofogLiv3.open(sInputValue);
			}
		},

		onValueHelpSearch: function(oEvent, inputRef) {
			var sValue, aOrFiltersCond, aFilters;
			var sPosfin = this.getOwnerComponent().getModel("modelPageAut").getData()[0].IdPosfin;
			sValue = oEvent.getParameter("value");
			
			//Filtri chiave
			var oLocalModel = this.getView().getModel("modelPageAut");
			var sFikrs = oLocalModel.getData("/0")[0].Fikrs;
			// var sEos = oLocalModel.getData("/0")[0].Eos;
			var sAnno = oLocalModel.getData("/0")[0].AnnoFipex;
			var sReale = oLocalModel.getData("/0")[0].Reale;
			var sFase = oLocalModel.getData("/0")[0].Fase;
			var sVersione = oLocalModel.getData("/0")[0].Versione;
			var sFipex = oLocalModel.getData("/0")[0].Fipex;
			
			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}
			if (inputRef === "idAutorizzPop") {
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("DescNew", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				var oFilterFikrs = new Filter("Fikrs", FilterOperator.EQ, sFikrs);
				// var oFilterEos = new Filter("Eos", FilterOperator.EQ, sEos);
				var oFilterAnno = new Filter("Anno", FilterOperator.EQ, sAnno);
				var oFilterReale = new Filter("Reale", FilterOperator.EQ, sReale);
				var oFilterFase = new Filter("Fase", FilterOperator.EQ, sFase);
				var oFilterVersione = new Filter("Versione", FilterOperator.EQ, sVersione);
				var oFilterFipex = new Filter("Fipex", FilterOperator.EQ, sFipex);

				aFilters.aFilters.push(oFilterFikrs, oFilterAnno, oFilterReale, oFilterFase, oFilterVersione, oFilterFipex);

				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "idAutorizz") {
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters =
					new Filter({
						filters: [
							aOrFiltersCond,
							new Filter("Fipex", FilterOperator.EQ, sPosfin)
						],
						and: true

					});
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "idCofogLiv3") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("IdProposta", FilterOperator.Contains, sValue),
							new Filter("Descrizione", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}
		},

		onValueHelpConfirm: function(oEvent, inputRef) {
			var oSelectedItem;
			oSelectedItem = oEvent.getParameter("selectedItem");
			//var that = this;

			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}
			if (inputRef === "idAutorizzPop") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				var sPath = oSelectedItem.getBindingContextPath("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var sFipex, sFincode, sKeycodepr;
				
				//LOGICA ASSOCIA AUT A PROPOSTA-POSFIN
				var oLocalModel = this.getView().getModel("modelPageAut");
				sFipex = oLocalModel.getData("/0")[0].Fipex;
				sKeycodepr = oLocalModel.getData("/0")[0].Keycodepr;
				sFincode = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty(sPath).Fincode;
				this.sKeycodeprAssAut = sKeycodepr;
				this.sFipexAssAut = sFipex;
				this.sFincodeAssAut = sFincode;
				
				this.getView().byId("idAutorizzPop").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "idAutorizz") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				sPath = oSelectedItem.getBindingContext("modelPreAut").getPath();
				var sCodiFincode = this.getOwnerComponent().getModel("modelPreAut").getProperty(sPath).Fincode;
				var oDataPageAut = this.getOwnerComponent().getModel("modelPageAut").getData()[0];
				oDataPageAut.CodiFincode = sCodiFincode;

				//Prendo i dati per compilare popup info autorizzazione
				var oDatiAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAut").getProperty(sPath);
				var oModelAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAutInfoPopUp");
				oModelAutInfoPopUp.setData(oDatiAutInfoPopUp);
				
				//LOGICA VISUALIZZAZIONE BOX REISCRIZIONI
				this._getReiscrizioni();
				
				this.getView().byId("idAutorizz").setSelectedKey(sCodiFincode);
				this.getView().byId("idAutorizz").setValue(oSelectedItem.getTitle());
				
				//LOGICA VISUALIZZAZIONE BOX REISCRIZIONI
				this._getReiscrizioni();
				
				//LOGICA PER COMPILARE POPUP REISCRIZIONI
				this._getDatiReiscrizioni();

			}

			if (inputRef === "idCofogLiv3") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				var sCofogFAL1 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl1;
				var sCofogFAL2 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl2;
				var sCofogFAL3 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl3;
				var sDescCofog = this.getOwnerComponent().getModel().getData(sPath).Descrizione;
				var sCofogID = this.getOwnerComponent().getModel().getData(sPath).Codconcatenato;
				this.byId("idCofogLiv3").setSelectedKey(sCofogID);
				this.getView().byId("idCofogLiv1").setValue(sCofogFAL1);
				this.getView().byId("idCofogLiv2").setValue(sCofogFAL2);
				this.getView().byId("idCofogLiv3").setValue(sCofogFAL3);
				this.getView().byId("idDescrCofog").setValue(sDescCofog);
				// this.getView().getModel("modelTableCofogNPF").setProperty("/CofogID", sCofogID);
			}
		},

		onValueHelpClose: function(oEvent, inputRef) {},

		onSuggestionItemSelected: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			if (inputRef === "idAutorizzPop") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				//	oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				
				sPath = oSelectedItem.getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath();
				var sFipex, sFincode, sKeycodepr;
				
				//LOGICA ASSOCIA AUT A PROPOSTA-POSFIN
				var oLocalModel = this.getView().getModel("modelPageAut");
				sFipex = oLocalModel.getData("/0")[0].Fipex;
				sKeycodepr = oLocalModel.getData("/0")[0].Keycodepr;
				sFincode = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty(sPath).Fincode;
				this.sKeycodeprAssAut = sKeycodepr;
				this.sFipexAssAut = sFipex;
				this.sFincodeAssAut = sFincode;
				
				this.getView().byId("idAutorizzPop").setValue(oSelectedItem.getText());
			}

			if (inputRef === "idAutorizz") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				//	oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext("modelPreAut").getPath();
				var sCodiFincode = this.getOwnerComponent().getModel("modelPreAut").getProperty(sPath).Fincode;
				var oDataPageAut = this.getOwnerComponent().getModel("modelPageAut").getData()[0];
				oDataPageAut.CodiFincode = sCodiFincode;

				//Prendo i dati per compilare info autorizzazione e reiscrizione
				var oDatiAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAut").getProperty(sPath);
				var oModelAutInfoPopUp = this.getOwnerComponent().getModel("modelPreAutInfoPopUp");
				oModelAutInfoPopUp.setData(oDatiAutInfoPopUp);

				this.getView().byId("idAutorizz").setSelectedKey(sCodiFincode);
				this.getView().byId("idAutorizz").setValue(oSelectedItem.getText());
				
				//LOGICA VISUALIZZAZIONE BOX REISCRIZIONI
				this._getReiscrizioni();
				
				//LOGICA PER COMPILARE POPUP REISCRIZIONI
				this._getDatiReiscrizioni();
			}

			if (inputRef === "idCofogLiv3") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				var sCofogFAL1 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl1;
				var sCofogFAL2 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl2;
				var sCofogFAL3 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl3;
				var sDescCofog = this.getOwnerComponent().getModel().getData(sPath).Descrizione;
				var sCofogID = this.getOwnerComponent().getModel().getData(sPath).Codconcatenato;
				this.byId("idCofogLiv3").setSelectedKey(sCofogID);
				this.getView().byId("idCofogLiv1").setValue(sCofogFAL1);
				this.getView().byId("idCofogLiv2").setValue(sCofogFAL2);
				this.getView().byId("idCofogLiv3").setValue(sCofogFAL3);
				this.getView().byId("idDescrCofog").setValue(sDescCofog);
				// this.getView().getModel("modelTableCofogNPF").setProperty("/CofogID", sCofogID);
			}
		},

		//****************************LOGICHE GESTIONE NOTE*****************************

		onPressSalvaNotaTabGestisci: function(oEvt) {
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sBtnText = oEvt.getSource().getText();
			var sTestoNuovaNota = this.getView().byId("idCreaNotaIDPF").getValue();
			var sProposta = this.getView().byId("idPropostaTabID").getText();
			var sFipex = this.getView().byId("idLinkPosfinTab").getText();
			// var sKeycode, sAnno, sFase, sReale, sVersione;

			var oLocalModel = this.getView().getModel("modelPageAut");
			// var oModelWorkFlow = this.getView().getModel("modelTimeLineWorkFlow");

			var sFikrs = oLocalModel.getData("/0")[0].Fikrs;
			var sEos = oLocalModel.getData("/0")[0].Eos;
			var sAnno = oLocalModel.getData("/0")[0].AnnoFipex;
			var sReale = oLocalModel.getData("/0")[0].Reale;
			var sFase = oLocalModel.getData("/0")[0].Fase;
			var sVersione = oLocalModel.getData("/0")[0].Versione;
			var sKeycodepr = oLocalModel.getData("/0")[0].Keycodepr;

			if (sBtnText.toUpperCase() === "SALVA NOTA" || sBtnText.toUpperCase() === "MODIFICA NOTA") {
				if (sTestoNuovaNota) {

					var oEntry = {
						Fikrs: sFikrs,
						Anno: sAnno,
						Fase: sFase,
						Reale: sReale,
						Versione: sVersione,
						Fipex: sFipex,
						Eos: sEos,
						Idproposta: sProposta,
						Testonota: sTestoNuovaNota,
						Keycodepr: sKeycodepr
					};
					//Concatena con risultati get treetable(da portare sul model locale)
					var sPath = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";

					//CREATE NUOVA NOTA A BE
					var that = this;
					oModel.update(sPath, oEntry, {
						success: function(oResponse, oData) {
							MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBCreateSuccessPagTabNota"));
						},
						error: function(oError) {
							MessageBox.error(oError.responseText);
						}
					});
				} else {
					MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("MBCreateTestoMancantePagTabNota"));
				}
			}
		},

		onChangeNota: function(oEvt) {
			var oView = this.getView();
			var oSelectedItem = oView.byId("idInputScegliNoteIDProposta").getSelectedItem();
			var sNotaStandard = oSelectedItem.getText();
			if (oSelectedItem) {
				if (sNotaStandard) {
					// oView.byId("idCreaNotaIDPF").setEditable(false);
					oView.byId("idCreaNotaIDPF").setValue(sNotaStandard);
					oView.byId("idBtnSalvaNota").setText(this._oResourceBundle.getText("Modifica") + " " + this._oResourceBundle.getText("Nota"));
				}
			} else {
				// oView.byId("idCreaNotaIDPF").setEditable(true);
				oView.byId("idCreaNotaIDPF").setValue("");
				oView.byId("idBtnSalvaNota").setText(this._oResourceBundle.getText("Salva") + " " + this._oResourceBundle.getText("Nota"));
			}
		},

		onLiveChangeCreaNota: function() {
			var oView = this.getView();
			var oTestoNota = oView.byId("idCreaNotaIDPF").getValue();
			var oNotaStandard = oView.byId("idInputScegliNoteIDProposta");
			if (!oTestoNota) {
				oNotaStandard.setSelectedKey("");
			}
			/*else {
				oView.byId("idBtnSalvaNota").setText("Modifica Nota");
			}*/
		},

		onSelectionFO: function(oEvent) {
			var oCheckboxFp = this.getView().byId("checkboxFP");
			var state = oEvent.getParameter("selected");
			if(state==true){
				oCheckboxFp.setSelected(false);
			}
		},

		onSelectionFP: function(oEvent) {
			var oCheckboxFo = this.getView().byId("checkboxFO");
			var state = oEvent.getParameter("selected");
			if(state==true){
				oCheckboxFo.setSelected(false);
			}
		},

		//LOGICHE SALVATAGGIO VARIAZIONE ANAGRAFICA
		onPressSalva: function() {
			//BusyIndicator.show(0);
			var oDatiAnagraficaPF = this.getView().getModel("modelAnagraficaPf").getData();
			// var oDatiAnagraficaID = this.getView().getModel("modelAnagraficaID").getData();
			var aDatiAnagraficaCOFOG = this.getView().getModel("modelAnagraficaCofog").getData();
			var aDatiAnagraficaFOFP = this.getView().getModel("modelAnagraficaFOP").getData();
			var oTableFOFP = this.getView().byId("TableFOFPTabID");
			//var aSelItems = oTableFOFP.getItems();
			var sPathSelItem, oObjSelItem;

			// console.log(aDatiAnagraficaFOFP);
			var oView = this.getView();

			var oGlobalModel = oView.getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			
			
			
			var oDataModPodFin  = this.getOwnerComponent().getModel("modelPosizioneFinanziaria").getData() ;
			var isEmptyOData  = Object.keys(oDataModPodFin).length == 0;
			var sPosfin;
			var sFipex,sKeycodepr,sFikrs,sAnno,sFase,sReale,sVersione,sEos;
			var sKeycodepr, sFikrs, sAnno, sFase, sReale, sVersione, sVersione, sEos, sFipex;
			if(isEmptyOData){
				 sKeycodepr = this.getView().getModel("modelPageAut").getData()[0].Keycodepr;
			 sFikrs = this.getView().getModel("modelPageAut").getData()[0].Fikrs;
			 sAnno = this.getView().getModel("modelPageAut").getData()[0].AnnoFipex;
			 sFase = this.getView().getModel("modelPageAut").getData()[0].Fase;
			 sReale = this.getView().getModel("modelPageAut").getData()[0].Reale;
			 sVersione = this.getView().getModel("modelPageAut").getData()[0].Versione;
			 sEos = this.getView().getModel("modelPageAut").getData()[0].Eos;
			 sFipex = this.getView().getModel("modelPageAut").getData()[0].Fipex;
			}else{
				sPosfin = oDataModPodFin[0].Fipex;
				sFipex = oDataModPodFin[0].Fipex;
				 sKeycodepr = oDataModPodFin[0].Key_Code;
				 sFikrs = oDataModPodFin[0].Fikrs;
				 sAnno = oDataModPodFin[0].AnnoFipex;
				 sFase = oDataModPodFin[0].Fase;
				 sReale = oDataModPodFin[0].Reale;
				 sVersione = oDataModPodFin[0].Versione;
				 sEos = oDataModPodFin[0].Eos;
			}

			// var sFipexCofog = this.getView().getModel("modelPageAut").getData()[0].Fipex;
			// var sFincode = this.getView().getModel("modelPageAut").getData()[0].Fincode;
			
			var oCheckboxFp = this.getView().byId("checkboxFP");
			var stateFP = oCheckboxFp.getSelected();
			var oCheckboxFo = this.getView().byId("checkboxFO");
			var stateFo = oCheckboxFo.getSelected();
			
			var stateFoFpFinal= (stateFP == true) ? "FP" : (stateFo == true ? "FO": "" );

			this.getView().getModel("modelAnagraficaPf").setProperty("/Codifofpspe",stateFoFpFinal)

			if (sFipex) {
				sFipex = sFipex.replaceAll(".", "");
			}

			var sCodStdCap = oView.byId("idCodStdCap");
			var sDenIntCap = oView.byId("idDenIntCap");
			var sDenRidCap = oView.byId("idDenRidCap");
			var sDenIntPG = oView.byId("idDenIntPG");
			var sDenRidPG = oView.byId("idDenRidPG");

			if (sCodStdCap === "000" && sDenIntCap.getValue() !== "" && sDenIntCap.getValue() !== undefined && sDenRidCap.getValue() !== "" &&
				sDenRidCap.getValue() !== undefined && sDenIntPG.getValue() !== "" && sDenIntPG.getValue() !== undefined && sDenRidPG.getValue() !==
				"" && sDenRidPG.getValue() !== undefined) {
				MessageBox.error(this._oResourceBundle.getText("MBErrorCodCapStd"));
			}
			if (sCodStdCap.getValue().toUpperCase() === 'STANDARD') {
				this.oModelPG80.setProperty("/capCodStd", false);
			}

			//LOGICA UPDATE POSFIN
			var sPathPF = "/PosFinSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
				sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "')";

			// for (var i = 0; i < oDatiAnagraficaPF.length; i++) {
			if (oDatiAnagraficaPF.PosFinToFoFpNav) {
				delete oDatiAnagraficaPF.PosFinToFoFpNav;
			}
			if (oDatiAnagraficaPF.PosFinToCofogNav) {
				delete oDatiAnagraficaPF.PosFinToCofogNav;
			}
			if (oDatiAnagraficaPF.PosFinToPropostaNav) {
				delete oDatiAnagraficaPF.PosFinToPropostaNav;
			}
			// }	

			var that = this;

			//LOGICA SALVATAGGIO E DELETE COFOG
			/*var format = new sap.ui.model.odata.type.Decimal({
				preserveDecimals: true
			}, {
				precision: 5,
				scale: 2,
				nullable: true
			});*/

			//PULISCO L'ARRAY DEI COFOG PRIMA DI CREATE7UPDATE E DELETE COFOG
			var aCofogPerc = [];
			for (var i = 0; i < aDatiAnagraficaCOFOG.length; i++) {
				if (aDatiAnagraficaCOFOG[i].Icon) {
					delete aDatiAnagraficaCOFOG[i].Icon;
				}
			}

			//CONTROLLI A FE PER IL SALVATAGGIO

			//CONTROLLO SOMMA PERCENTUALI COFOG = 100
			for (var b = 0; b < aDatiAnagraficaCOFOG.length; b++) {
				aCofogPerc.push(aDatiAnagraficaCOFOG[b].Perccofog);
			}
			var sSommaPercCofog = 0;
			for (var a = 0; a < aCofogPerc.length; a++) {
				sSommaPercCofog += +aCofogPerc[a];
			}

			if (aDatiAnagraficaCOFOG.length === 0) {
				MessageBox.warning(this.getResourceBundle().getText("MBUpdateErrorCofogVuotoTab"));
				return;
			} else {

				//LOGICA CREATE POSFIN
				oGlobalModel.update(sPathPF, oDatiAnagraficaPF, {
					success: function(oResponse, oData) {
						BusyIndicator.hide();
						// that.getView().byId("btnInvioRevocaValidazione").setEnabled(true);
						MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBPFSalvataSuccessPagTab"));
					},
					error: function(oError) {
						BusyIndicator.hide();
						MessageBox.error(oError.responseText);
					}
				});

				for (var p = 0; p < aDatiAnagraficaCOFOG.length; p++) {

					if (aDatiAnagraficaCOFOG[p].Perccofog === "") {
						sap.m.MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("MBCofogPercObbligatorioPF"));
						return;
					}

					if (sSommaPercCofog !== 100) {
						sap.m.MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("MBCofogPercSomma"));
						return;
					}
					
					
					

					/* //LOGICA CREATE POSFIN
					oGlobalModel.update(sPathPF, oDatiAnagraficaPF, {
						success: function(oResponse, oData) {
							BusyIndicator.hide();
							// that.getView().byId("btnInvioRevocaValidazione").setEnabled(true);
							MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBPFSalvataSuccessPagTab"));
						},
						error: function(oError) {
							BusyIndicator.hide();
							MessageBox.error(oError.responseText);
						}
					}); */

					oGlobalModel.setUseBatch(false);
					if (aDatiAnagraficaCOFOG[p].Fipex === "" || aDatiAnagraficaCOFOG[p].Fipex === undefined) {
						aDatiAnagraficaCOFOG[p].Fikrs = sFikrs;
						aDatiAnagraficaCOFOG[p].Anno = sAnno;
						aDatiAnagraficaCOFOG[p].Fase = sFase;
						aDatiAnagraficaCOFOG[p].Reale = sReale;
						aDatiAnagraficaCOFOG[p].Versione = sVersione;
						aDatiAnagraficaCOFOG[p].Versione = sVersione;
						aDatiAnagraficaCOFOG[p].Eos = sEos;
						aDatiAnagraficaCOFOG[p].Fipex = sFipex;
						// aDatiAnagraficaCOFOG[p].Fipex = sFipexCofog;

						//LOGICA CREATE COFOG
						oGlobalModel.create("/CofogSet", aDatiAnagraficaCOFOG[p], {
							
							success: function(oResponse, oData) {
								BusyIndicator.hide();
								// MessageBox.success(that._oResourceBundle.getText(""));
							},
							error: function(oError) {
								BusyIndicator.hide();
								MessageBox.error(oError.responseText);
							}
						});
					} else {
						var sCodcofogl1 = aDatiAnagraficaCOFOG[p].Codcofogl1;
						var sCodcofogl2 = aDatiAnagraficaCOFOG[p].Codcofogl2;
						var sCodcofogl3 = aDatiAnagraficaCOFOG[p].Codcofogl3;
						var sPathCOFOG = "/CofogSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
							sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "',Codcofogl1='" + sCodcofogl1 + "',Codcofogl2='" + sCodcofogl2 +
							"',Codcofogl3='" + sCodcofogl3 + "')";

						//LOGICA UPDATE COFOG	
						oGlobalModel.update(sPathCOFOG, aDatiAnagraficaCOFOG[p], {
							success: function(oResponse, oData) {
								BusyIndicator.hide();
								// MessageBox.success(that._oResourceBundle.getText(""));
							},
							error: function(oError) {
								BusyIndicator.hide();
								MessageBox.error(oError.responseText);
							}
						});

					}
				}
			}

			//LOGICA UPDATE PROPOSTA
			var oDatiProposta = {
				Fipex: sFipex,
				Flagana: "X"
			};
			var sPathProposta = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";
			oGlobalModel.update(sPathProposta, oDatiProposta, {
				success: function(oResponse, oData) {
					BusyIndicator.hide();
					// MessageBox.success(that._oResourceBundle.getText(""));
				},
				error: function(oError) {
					BusyIndicator.hide();
					MessageBox.error(oError.responseText);
				}
			});

			//LOGICA DELETE COFOG
			if (this.aCofogDeleted.length !== 0) {
				for (var s = 0; s < this.aCofogDeleted.length; s++) {
					sCodcofogl1 = this.aCofogDeleted[s][0].Codcofogl1;
					sCodcofogl2 = this.aCofogDeleted[s][0].Codcofogl2;
					sCodcofogl3 = this.aCofogDeleted[s][0].Codcofogl3;

					sPathCOFOG = "/CofogSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
						sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "',Codcofogl1='" + sCodcofogl1 + "',Codcofogl2='" + sCodcofogl2 +
						"',Codcofogl3='" + sCodcofogl3 + "')";

					oGlobalModel.remove(sPathCOFOG, {
						success: function(oResponse, oData) {
							that.aCofogDeleted = [];
							BusyIndicator.hide();
							// MessageBox.success(that._oResourceBundle.getText(""));
						},
						error: function(oError) {
							BusyIndicator.hide();
							MessageBox.error(oError.responseText);
						}
					});
				}
			}

			//LOGICA UPDATE FOFP
			// for (var x = 0; x < aSelItems.length; x++) {

			// 	if (aSelItems[x].getCells()[1].getSelected() === true) {
			// 		sPathSelItem = aSelItems[x].getBindingContextPath();

			// 		oObjSelItem = this.getView().getModel("modelAnagraficaFOP").getData()[sPathSelItem.replace("/", "")];
			// 		oObjSelItem.Fop = "FO";
			// 	}

			// 	if (aSelItems[x].getCells()[2].getSelected() === true) {
			// 		sPathSelItem = aSelItems[x].getBindingContextPath();

			// 		oObjSelItem = this.getView().getModel("modelAnagraficaFOP").getData()[sPathSelItem.replace("/", "")];
			// 		oObjSelItem.Fop = "FP";
			// 	}
			// }
			
			//
			

			// for (var c = 0; c < aDatiAnagraficaFOFP.length; c++) {
			// 	sFikrs = aDatiAnagraficaFOFP[c].Fikrs;
			// 	sAnno = aDatiAnagraficaFOFP[c].Anno;
			// 	sFase = aDatiAnagraficaFOFP[c].Fase;
			// 	sReale = aDatiAnagraficaFOFP[c].Reale;
			// 	sVersione = aDatiAnagraficaFOFP[c].Versione;
			// 	sFipex = aDatiAnagraficaFOFP[c].Fipex;
			// 	sEos = aDatiAnagraficaFOFP[c].Eos;
			// 	var sFincode = aDatiAnagraficaFOFP[c].Fincode;

			// 	var sPathFOFP = "/FoFpSet(Fikrs='" + sFikrs + "',Anno='" + sAnno + "',Fase='" + sFase + "',Reale='" + sReale + "',Versione='" +
			// 		sVersione + "',Fipex='" + sFipex + "',Eos='" + sEos + "',Fincode='" + sFincode + "')";
			// 	oGlobalModel.update(sPathFOFP, aDatiAnagraficaFOFP[c], {
			// 		success: function(oResponse, oData) {
			// 			// MessageBox.success(oError.responseText);
			// 			BusyIndicator.hide();
			// 		},
			// 		error: function(oError) {
			// 			MessageBox.error(oError.responseText);
			// 			BusyIndicator.hide();
			// 		}
			// 	});
			// }

		},


		//LOGICHE INVIO ALLA VALIDAZIONE
		onPressNavToInvioAllaValidazione: function(oEvt) {
			var sBtnText = oEvt.getSource().getText();
			var sIdProposta = this.getView().byId("idPropostaTabID").getText();
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			var that = this;
			if (sBtnText.toUpperCase() === this.getView().getModel("i18n").getResourceBundle().getText("RevocaValid").toUpperCase()) {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTestoPopupRevocaValid"), {
					icon: MessageBox.Icon.WARNING,
					title: this.getView().getModel("i18n").getResourceBundle().getText("RevocaValid"),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.NO,
					onClose: function(oAction) {
						if (oAction === MessageBox.Action.YES) {
							oDataModel.callFunction("/RevocaValidazione", { // function import name
								method: "GET", // http method
								urlParameters: {
									"IdProposta": sIdProposta
								}, // function import parameters        
								success: function(oData, oResponse) {
									MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBRevocaValidSuccessPagTab"));
									var sIter = oData.Iter;
									if (sIter === "01") {
										sIter = "Proposta in lavorazione";
									}
									if (sIter === "02") {
										sIter = "Proposta inviata alla validazione";
									}
									that.getView().getModel("modelPageAut").setProperty("/0/Iter", sIter);
									that.getView().byId("btnInvioRevocaValidazione").setText(that.getView().getModel("i18n").getResourceBundle().getText(
										"InvioValid"));
								}, // callback function for success
								error: function(oError) {
										MessageBox.error(oError.responseText);
									} // callback function for error
							});
						}
					}
				});
			}
			if (sBtnText.toUpperCase() === this.getView().getModel("i18n").getResourceBundle().getText("InvioValid").toUpperCase()) {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTestoPopupInvioValid"), {
					icon: MessageBox.Icon.WARNING,
					title: this.getView().getModel("i18n").getResourceBundle().getText("InvioValid"),
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.NO,
					onClose: function(oAction) {
						if (oAction === MessageBox.Action.YES) {
							
							//SCELTA VALIDATORE
							var oView = that.getView();
							if (!that.popupSceltaValidatore) {
								that.popupSceltaValidatore = Fragment.load({
									id: oView.getId(),
									name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopupSceltaValidatore",
									controller: that
								}).then(function(oDialog) {
									oView.addDependent(oDialog);
									syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
									return oDialog;
								});
							}
							that.popupSceltaValidatore.then(function(oDialog) {
								//oDialog.getBinding("items");
								// Open ValueHelpDialog filtered by the input's value
								oDialog.open(oAction);
							});
						}
					}
				});
			}
		},

		onSearchUser: function() {
			var oDataModel = this.getView().getModel("modelSearchValidatore");
			var sNome = this.getView().getModel("modelUserSearch").getData().Nome.toUpperCase();
			var sCognome = this.getView().getModel("modelUserSearch").getData().Cognome.toUpperCase();

			// if(sNome || sCognome) {
			var aFilters = [];
			var that = this;

			aFilters.push(new Filter("McNamefir", FilterOperator.StartsWith, sNome));
			aFilters.push(new Filter("McNamelas", FilterOperator.StartsWith, sCognome));
			oDataModel.read("/ZES_RICERCA_VALIDATORESet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					// console.log(oData.results);
					that.getView().getModel("modelTableVal").setData(oData.results);
				},
				error: function(errorResponse) {
					var sDettagli = that._setErrorMex(errorResponse);
					var oErrorMessage = errorResponse.responseText;
					MessageBox.error(oErrorMessage, {
						details: sDettagli,
						initialFocus: sap.m.MessageBox.Action.CLOSE,
						styleClass: "sapUiSizeCompact"
					});
					MessageBox.error(oErrorMessage);
				}
			});
			// }
		},

		onPressConfermaValidazione: function() {
			var sIdProposta = this.getView().byId("idPropostaTabID").getText();
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sValidatore = this.getView().byId("idTableRisultatiRicercaValidatore").getSelectedItem().getBindingContext("modelTableVal").getProperty(
				"Bname");

			var that = this;
			oDataModel.callFunction("/InvioValidazione", { // function import name
				method: "GET", // http method
				urlParameters: {
					"IdProposta": sIdProposta,
					"Validatore": sValidatore
				}, // function import parameters        
				success: function(oData, oResponse) {
					MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBInvioValidSuccessPagTab"));

					var sIter = oData.Iter;
					if (sIter === "01") {
						sIter = "Proposta in lavorazione";
					}
					if (sIter === "02") {
						sIter = "Proposta inviata alla validazione";
					}
					that.getView().getModel("modelPageAut").setProperty("/0/Iter", sIter);
					that.getView().byId("btnInvioRevocaValidazione").setText(that.getView().getModel("i18n").getResourceBundle().getText(
						"RevocaValid"));
					that.onCloseDialogVal();
				}, // callback function for success
				error: function(oError) {
						MessageBox.error(oError.responseText);
					} // callback function for error 
			});
		},

		onPressShowAttributiProposta: function(oEvent) {
			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.popupAttributiProposta) {
				this.popupAttributiProposta = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopupAttributiProposta",
					controller: this
				}).then(function(oPopover) {
					oView.addDependent(oPopover);
					return oPopover;
				});
			}
			this.popupAttributiProposta.then(function(oPopover) {
				//oPopover.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				oPopover.openBy(sBtn);
			});
		},

		onCloseDialogVal: function() {
			var oDataVal = {
				"Nome": "",
				"Cognome": ""
			};
			this.getView().getModel("modelUserSearch").setData(oDataVal);
			this.getView().getModel("modelTableVal").setData();
			this.getView().byId("idPopupSceltaValidatore").close();
		},
		
		changeToInt:function(oEvent){
			var oInput =oEvent.getSource();
			var sValue = oInput.getValue();
			var newValue =  parseInt(sValue).toString();
			
			var path = oEvent.getSource().getBindingContext("modelAnagraficaCofog").getPath();
			this.getView().getModel("modelAnagraficaCofog").setProperty( path +"/Perccofog", newValue);
			//oInput.setValue(newValue);
		},
		onShowCofog: async function() {
            var aRes = await this.readFromDb("4", "/ZET_GET_COFOGSet", [], [], "");
            this._oDialog = sap.ui.xmlfragment(
                "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.TabCofog",
                this);
            this._oDialog.setModel(new JSONModel(aRes), "modelCofog");
            this.getView().addDependent(this._oDialog);
            this._oDialog.open();
        },
        onAddCofog: function() {

			
            var oTable = sap.ui.getCore().byId("tableCafog");
            var aDataSelected = oTable.getSelectedContextPaths();
            var aModelCofog = this._oDialog.getModel("modelCofog").getData();
            var aModelCofogTable = this.getView().getModel("modelAnagraficaCofog").getData();
            var sFipex = this.getView().getModel("modelTestata").getData().Fipex.replaceAll(".", "");
            for (var i = 0; i < aDataSelected.length; i++) {
                var index = aDataSelected[i].split("/")[1];
                var o = {
                    "Codcofogl1": aModelCofog[index].CodCofogL1,
                    "Codcofogl2": aModelCofog[index].CodCofogL2,
                    "Codcofogl3": aModelCofog[index].CodCofogL3,
                    "Descrcofog": aModelCofog[index].Descrizione,
                    /* "Fikrs": aModelCofog[index].Fikrs,
                    "Fipex": sFipex,
                    "Anno": aModelCofog[index].Anno,
                    "Fase": aModelCofog[index].Fase,
                    "Reale": aModelCofog[index].Reale,
                    "Versione": aModelCofog[index].Versione,
                    "Eos": "S", */
                    "Codconcatenato": aModelCofog[index].CodConcatenato,
                    //"Livello": aModelCofog[index].Livello, //FORSE QUESTO NON SERVE
                    //"Perccofog": "0",
                    "Perccofog": "", //lt da capire se posso inserirlo a 0
                    //"status": "new",
					"Icon": "sap-icon://delete"
                };

				/* var oDati = {
					Codcofogl1: sValLiv1,
					Codcofogl2: sValLiv2,
					Codcofogl3: sValLiv3,
					Descrcofog: sValDescr,
					Codconcatenato: sValIdCofog,
					Perccofog: "",
					Icon: "sap-icon://delete"
				}; */
                aModelCofogTable.push(o);
            }
            this.getView().getModel("modelAnagraficaCofog").refresh();
            this.onClose();
        },
        onClose: function() {
            this._oDialog.close();
            this._oDialog.destroy();
            this._oDialog = undefined;
        },
        onDeleteCofog: async function(oEvent) {
            var aData = this.getView().getModel("modelAnagraficaCofog").getData();
            if (aData.length === 1) {
                MessageBox.warning(this.getResourceBundle().getText("WCOFOG"));
            } else {
                var oItemSelected = oEvent.getSource().getBindingContext("modelAnagraficaCofog").sPath;
                var iIndex = oItemSelected.split("/")[1];
                try {
                    var oToDelete = aData.splice(iIndex, 1);
                    this.getView().setModel(new JSONModel(oToDelete), "modelCogofDelete");
                    this.getView().getModel("modelAnagraficaCofog").refresh()
                } catch (e) {}
            }
        },
        _formOBJ: function(oObj) {
            var sFipex = this.getView().getModel("modelTestata").getData().Fipex.replaceAll(".", "");
            var newOBJ = {
                "Fikrs": oObj.Fikrs,
                "Anno": oObj.Anno,
                "Fase": oObj.Fase,
                "Reale": oObj.Reale,
                "Versione": oObj.Versione,
                "Fipex": sFipex,
                "Eos": oObj.Eos,
                "Codcofogl1": oObj.Codcofogl1,
                "Codcofogl2": oObj.Codcofogl2,
                "Codcofogl3": oObj.Codcofogl3,
                "Codconcatenato": oObj.CodConcatenato,
                "Perccofog": oObj.Perccofog,
                "Descrcofog": oObj.Descrcofog
            };
            if (!newOBJ.Codconcatenato) {
                newOBJ.Codconcatenato = oObj.Codconcatenato
            }
            return newOBJ;
        },
        onSave: async function() {
            var iSum = 0;
            var aData = this.getView().getModel("modelAnagraficaCofog").getData();
            var aDataAnag = this.getView().getModel("modelAnagraficaPf").getData();
            if (aData.length === 1 && aData.Perccofog === "0") {
                MessageBox.warning(this.getResourceBundle().getText("WCOFOG0PERC"));
                return;
            } else {
                for (var i = 0; i < aData.length; i++) {
                    iSum = iSum + parseInt(aData[i].Perccofog);
                    if (iSum > 100) {
                        MessageBox.warning(this.getResourceBundle().getText("WCOFOGMORED"));
                        return;
                    }
                }
                if (iSum === 100) {
                    if (this.getView().getModel("modelCogofDelete")) {
                        var sModelCofog = this.getView().getModel("modelCogofDelete").getData();
                        for (var j = 0; j < sModelCofog.length; j++) {
                            var sEntity = "/CofogSet(Fikrs='" + aDataAnag.Fikrs + "',Anno='" + aDataAnag.Anno + "',Fase='" + aDataAnag.Fase + "',Reale='" +
                                aDataAnag.Reale + "',Versione='" + aDataAnag.Versione + "',Fipex='" + sModelCofog[j].Fipex.replaceAll(".", "") +
                                "',Eos='S',Codcofogl1='" + sModelCofog[j].Codcofogl1 + "',Codcofogl2='" + sModelCofog[j].Codcofogl2 + "',Codcofogl3='" +
                                sModelCofog[j].Codcofogl3 +
                                "')";
                            try {
                                await this.deleteRecord("4", sEntity);
                            } catch (e) {
                                MessageBox.warning(this.getResourceBundle().getText("NOSAVE"));
                                return;
                            }
                        }
                    }
                    for (var i = 0; i < aData.length; i++) {
                        var oObject = this._formOBJ(aData[i]);
                        if (aData[i].status && aData[i].status === "new") {
                            try {
                                await this.insertRecord("4", "/CofogSet", oObject);
                                aData[i].status = "";
                            } catch (e) {
                                MessageBox.warning(this.getResourceBundle().getText("NOSAVE"));
                                return;
                            }
                        } else {
                            var sEntity = "/CofogSet(Fikrs='" + aDataAnag.Fikrs + "',Anno='" + aDataAnag.Anno + "',Fase='" + aDataAnag.Fase + "',Reale='" +
                                aDataAnag.Reale + "',Versione='" + aDataAnag.Versione + "',Fipex='" + oObject.Fipex + "',Eos='S',Codcofogl1='" + oObject.Codcofogl1 +
                                "',Codcofogl2='" + oObject.Codcofogl2 + "',Codcofogl3='" + oObject.Codcofogl3 +
                                "')";
                            try {
                                await this.modifyRecord("4", sEntity, oObject);
                            } catch (e) {
                                MessageBox.warning(this.getResourceBundle().getText("NOSAVE"));
                                return;
                            }
                        }
                    }
                } else {
                    MessageBox.warning(this.getResourceBundle().getText("WCOFOGMORED"));
                    return;
                }
                MessageBox.success(this.getResourceBundle().getText("SAVE"));
                if (this.getView().getModel("modelCogofDelete")) {
                    this.getView().getModel("modelCogofDelete").setData({});
                }
            }
        },

		onPressAvvioComp: async function() {

			var that = this;
			this.urlSac = "";
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var sPg = this.getView().getModel("modelAnagraficaPf").getData().Codicepg
			var oLocalModel;
			var sPosfin, sIdProp, sAut;
			var oDati = {};

			oLocalModel = this.getView().getModel("modelPageAut").getData();

			sPosfin = oLocalModel.IdPosfin;
			sIdProp = this.getView().getModel("modelTestata").getData().Key_Code;
			var sValAutInput = this.getView().getModel("modelTestata").getData().Fincode;
			oDati = {
				"PosFin": oLocalModel.Fipex,
				"IdProposta": sIdProp,
				"Autorizzazione": sValAutInput,
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "COMPETENZA",
				"Pg": sPg
			};

			if (oLocalModel) {
				try {
					var aRes = await this.insertRecord("4", "/SacUrlSet", oDati);
					var oFrame = this.getView().byId("linkSacCompetenza");
					this.urlSac = aRes.URL;
					var oFrameContent = oFrame.$()[0];
					oFrameContent.setAttribute("src", that.urlSac);
					this._refresh();
				} catch (e) {
					MessageBox.error(oResourceBundle.getText("MBCreateErrorPageAut"), {
						id: "messER",
						title: "Error",
						actions: [MessageBox.Action.OK],
					});
					sap.ui.getCore().byId("messER").getButtons()[0].setType("Emphasized");

				}

			} else {
				MessageBox.warning(oResourceBundle.getText("MBTastoCassaPagePosFinId"), {
					id: "messWA",
					title: "Warning",
					actions: [MessageBox.Action.OK],
				});
				sap.ui.getCore().byId("messWA").getButtons()[0].setType("Emphasized");

			}

		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.TabGestisci
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.TabGestisci
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.TabGestisci
		 */
		//	onExit: function() {
		//
		//	}

	});

});