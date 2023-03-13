sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./BaseController",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"../util/formatter"
], function(Controller, MessageBox, BaseController, MessageToast, Filter, FilterOperator,  formatter) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.DettaglioContabile", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioContabile
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oResourceBundle = this.getResourceBundle();
			// this.oRouter.getRoute("DettaglioContabile").attachPatternMatched(this._onObjectMatched, this);

			this.oRouter.getRoute("DettaglioContabile").attachMatched(this._onRouteMatched, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		onNavBackDettaglio: function() {
			this.getView().byId("idLinkPosFinSnap").setText('');
			this.getView().byId("idLinkPosFin").setText('');
			var oFrame = this.getView().byId("linkSac");
			var oFrameContent = oFrame.$()[0];
			oFrameContent.setAttribute("src", "");

			if (this.sourcePage === 'PosizioneFinanziaria') {
				this.oRouter.navTo("PosizioneFinanziaria");
			}

			if (this.sourcePage === 'IdProposta') {
				this.oRouter.navTo("IdProposta");
			}
			this.onPressNavToHome();
		},

		onPressInformationsLocal: function(event) {
			if (this.sourcePage === 'PosizioneFinanziaria') {
				this.onPressInformations(event, 'dettContPosFin');
			} else {
				this.onPressInformations(event, 'dettContIdProposta');
			}

		},

		_onRouteMatched: async function() {

			var oModelPosFin = this.getOwnerComponent().getModel("modelDettaglioContabile");

			var contabileModel = this.getOwnerComponent().getModel("contabileModel")
			var contabileData;
			if(contabileModel) contabileData = contabileModel.getData();


			this.Anno = contabileData.Anno;
			this.Fase = contabileData.Fase;
			this.Reale =contabileData.Reale;
			this.Versione = contabileData.Versione;
			this.Fipex =contabileData.Fipex;
			this.Datbis = contabileData.Datbis;

			if (this.Fipex) {
				this.Fipex = this.Fipex.replaceAll(".", "");
			}

			if (this.Datbis) {
				this.Datbis = this.Datbis.replaceAll("-", "");
			}

			var posFin = await this._getDatiAnagrafica(contabileData)

			this.getView().getModel("modelPosFinSelected").setData(posFin[0]);

			this.getView().byId("idLinkPosFinSnap").setProperty("anno", this.Anno);
			this.getView().byId("idLinkPosFinSnap").setProperty("fikrs", this.Fikrs);
			this.getView().byId("idLinkPosFinSnap").setProperty("fase", this.Fase);
			this.getView().byId("idLinkPosFinSnap").setProperty("reale", this.Reale);
			this.getView().byId("idLinkPosFinSnap").setProperty("versione", this.Versione);
			this.getView().byId("idLinkPosFinSnap").setProperty("fipex", this.Fipex);
			this.getView().byId("idLinkPosFinSnap").setProperty("datbis", this.Datbis);

			this.getView().byId("idLinkPosFin").setProperty("anno", this.Anno);
			this.getView().byId("idLinkPosFin").setProperty("fikrs", this.Fikrs);
			this.getView().byId("idLinkPosFin").setProperty("fase", this.Fase);
			this.getView().byId("idLinkPosFin").setProperty("reale", this.Reale);
			this.getView().byId("idLinkPosFin").setProperty("versione", this.Versione);
			this.getView().byId("idLinkPosFin").setProperty("fipex", this.Fipex);
			this.getView().byId("idLinkPosFin").setProperty("datbis", this.Datbis);

			//if (e.getParameters().arguments.ID === "Dettaglio Contabile") {
				// this.sourcePage = "PosizioneFinanziaria";
				// this._dettaglioContPosFin();
			//} else if (e.getParameters().arguments.ID === "Contabile Proposta") {
				this.sourcePage = "IdProposta";
				this._dettaglioContIDProposta();
			//}
		},

		_getDatiAnagrafica: async function(contabileData) {
			var sKeycodepr, sFikrs,sAnno, sFase, sReale,sVersione, sEos ;
						
			var sPathPF = "/PosFinSet(Fikrs='" + contabileData.Fikrs + "',Anno='" + contabileData.Anno + "',Fase='" + contabileData.Fase + "',Reale='" + contabileData.Reale + "',Versione='" +
			contabileData.Versione + "',Fipex='" + contabileData.Fipex + "',Eos='" + contabileData.Eos + "')";
			
			var aFilters =[new Filter("Fipex", FilterOperator.EQ, contabileData.Fipex)];
			
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var that = this;

			try {
				
			var aRes = await this.readFromDb("4", "/ZES_AVVIOPF_IDSet", aFilters, [], []);
			//var aRes = await this.readFromDb("4", sPathPF, [], [], ["PosFinToCofogNav", "PosFinToFoFpNav"]);

			if(aRes && aRes.length > 0){
				return aRes;
			}
			return []

			} catch (e) {
				MessageBox.error(e.responseText);
			}



		},

		_dettaglioContPosFin: function() {
			var oModelPosFin = this.getView().getModel("modelPosFinSelected");
			var oselectedPosFinSel = this.getView().getModel("modelPosFinSelected").getData();
			var oExpTitle = this.getView().byId("idExpTitle");
			var oSnapTitle = this.getView().byId("idSnapTitle");
			var oObjStatusPosFin = this.getView().byId("idTextPosFin");
			var oObjStatusPosFinSnap = this.getView().byId("idTextPosFinSnap");
			var oObjStatusIDProposta = this.getView().byId("idTextIDProposta");
			var oObjStatusIDPropostaSnap = this.getView().byId("idTextIDPropostaSnap");
			var oLinkPosFin = this.getView().byId("idLinkPosFin");
			var oLinkPosFinSnap = this.getView().byId("idLinkPosFinSnap");
			var sTitle = this.oResourceBundle.getText("title");
			var sSubTitle = this.oResourceBundle.getText("DettaglioContabile");
			oExpTitle.setText(sTitle + " > " + sSubTitle);
			oSnapTitle.setText(sTitle + " > " + sSubTitle);

			oObjStatusPosFin.setVisible(true);
			oObjStatusIDProposta.setVisible(false);
			oLinkPosFin.setVisible(true);
			oObjStatusPosFinSnap.setVisible(true);
			oObjStatusIDPropostaSnap.setVisible(false);
			oLinkPosFinSnap.setVisible(true);

			//LOGICA APERTURA SCHEDA SAC
			var that = this;
			this.urlSac = "";
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			var sPosfin = oselectedPosFinSel.IdPosfin[0].PosFin;
			var sAut = oselectedPosFinSel.IdPosfin[0].Aut;
			oLinkPosFin.setText(sPosfin);
			oLinkPosFinSnap.setText(sPosfin);

			// var sPosFinDescrEstesa = oselectedPosFinSel.IdPosfin[0].descr;
			// this._getPosFinFullData(sPosFinDescrEstesa);
			// this.getView().byId('idLinkPosFinSnap').setText(sPosFinDescrEstesa);
			// this.getView().byId('idLinkPosFin').setText(sPosFinDescrEstesa);
			if (sAut === undefined) {
				sAut = "";
			}
			var sIdProp = "";
			var oDati = {
				"PosFin": sPosfin,
				"IdProposta": sIdProp,
				"Autorizzazione": sAut,
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "DETT_POSFIN"
			};

			if (oModelPosFin) {
				oGlobalModel.create("/SacUrlSet", oDati, {
					success: function(oData) {
						//sap.m.MessageBox.success(oResourceBundle.getText(""));
						var oFrame = that.getView().byId("linkSac");
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

		},
		_refresh: function() {
			var urlSac = this.urlSac;
			window.frames[0].location = urlSac + (new Date());
		},

		_dettaglioContIDProposta: function() {
			var oExpTitle = this.getView().byId("idExpTitle");
			var oSnapTitle = this.getView().byId("idSnapTitle");
			var oObjStatusPosFin = this.getView().byId("idTextPosFin");
			var oObjStatusPosFinSnap = this.getView().byId("idTextPosFinSnap");
			var oObjStatusIDProposta = this.getView().byId("idTextIDProposta");
			var oObjStatusIDPropostaSnap = this.getView().byId("idTextIDPropostaSnap");
			var oLinkPosFin = this.getView().byId("idLinkPosFin");
			var oLinkPosFinSnap = this.getView().byId("idLinkPosFinSnap");
			var sTitle = this.oResourceBundle.getText("title");
			var sSubTitle = this.oResourceBundle.getText("ContabileProp");

			oExpTitle.setText(sTitle + " > " + sSubTitle);
			oSnapTitle.setText(sTitle + " > " + sSubTitle);
			oObjStatusPosFin.setVisible(false);
			oObjStatusIDProposta.setVisible(true);
			oLinkPosFin.setVisible(false);
			oObjStatusPosFinSnap.setVisible(false);
			oObjStatusIDPropostaSnap.setVisible(true);
			oLinkPosFinSnap.setVisible(false);

			var that = this;
			this.urlSac = "";
			var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			
			var oModelPosFin = this.getOwnerComponent().getModel("modelPosFinSelected");
			//var sIdProp = oModelPosFin.getData()[0].IdProposta;
			var sIdProp = oModelPosFin.getData().Key_Code;
			//var oModelPageAut = this.getOwnerComponent().getModel("modelPageAut");
			var sPosFin = oModelPosFin.getData().Fipex;
			var sAut = oModelPosFin.getData().Autorizzazioni;

			this.getView().byId('idTextIDProposta').setText(sIdProp);
			this.getView().byId('idLinkPosFin').setText(sIdProp);

			var oDati = {
				"PosFin": sPosFin,
				"IdProposta": sIdProp,
				"Autorizzazione": sAut,
				"SemanticObject": "ESAMINA_MOD",
				"Schermata": "DETT_ID_PROP"
			};

			if (oModelPosFin) {
				oGlobalModel.create("/SacUrlSet", oDati, {
					success: function(oData) {
						//sap.m.MessageBox.success(oResourceBundle.getText(""));
						var oFrame = that.getView().byId("linkSac");
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

		},
		onPressShowPosFin: function(oEvent) {
			var oButton = oEvent.getSource();
			this._oDialogUff = sap.ui.xmlfragment(
				"zsap.com.r3.cobi.s4.propostadispesaZ_S4_PROPOSTADISPESA.view.fragments.PopOverPosizioneFinanziaria", this);
			this.getView().addDependent(this._oDialogUff); // --> questa fa si che i model globali siano visibili sul fragment
			this._oDialogUff.openBy(oButton);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioContabile
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioContabile
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioContabile
		 */
		//	onExit: function() {
		//
		//	}

	});

});