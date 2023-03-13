sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"sap/ui/export/Spreadsheet",
	"sap/ui/export/ExportUtils",
	"sap/m/MessageToast",
	"../util/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator"
], function(Controller, BaseController, Filter, FilterOperator, MessageBox, Spreadsheet, ExportUtils, MessageToast, formatter, JSONModel, BusyIndicator) {
	"use strict";

	// var EdmType = exportLibrary.EdmType;

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.PosFin-IdProposta", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosFin-IdProposta
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("PosFin-IdProposta").attachMatched(this._onRouteMatched, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		//************************LOGICA PER ESTRARRE RIGA SELEZIONATA DELLA TREETABLE*******************

		onSelectCheckBox: function(oEvent) {
			//this._resetCheckbox("modelTreeTable", this);
			var oEl = oEvent.getSource().getBindingContext("modelTreeTable").sPath;
			var oObjectUpdate = this.getView().getModel("modelTreeTable").oData[oEl.slice(1)];
			if (oObjectUpdate.SELECTED && oObjectUpdate.SELECTED === true) {
				oObjectUpdate.SELECTED = false;
			} else {
				oObjectUpdate.SELECTED = true;
			}
		},

		_getSelectedItems: function() {

			var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
			var aData = this.getView().getModel("modelTreeTable").oData;
			var aSelected = [],
				aValResult = [];
			for (var i = 0; i < aObject.length; i++) {
				if ( aObject[i].includes("ZES_AVVIOPF_IDSet") && aData[aObject[i]].SELECTED === true) {
					aSelected.push(aData[aObject[i]]);
				}
			}
			return aSelected;
		},
		
		_setAllSelectedToFalse: function() {

			var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
			var aData = this.getView().getModel("modelTreeTable").oData;
			var aSelected = [],
				aValResult = [];
			for (var i = 0; i < aObject.length; i++) {
				if ( aObject[i].includes("ZES_AVVIOPF_IDSet") && aData[aObject[i]].SELECTED === true) {
					aData[aObject[i]].SELECTED=false;
				}
			}
			return aSelected;
		},

	/* 	_setAllSelectedChecked: function() {

			var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
			var aData = this.getView().getModel("modelTreeTable").oData;
			var oTable = this.getView().byId("treeTablePFID")
			var aSelected = []
			for (var i = 0; i < aObject.length; i++) {
				if ( aObject[i].includes("ZES_AVVIOPF_IDSet") && aData[aObject[i]].SELECTED === true) {
					oTable.mAggregations.rows[i].mAggregations.cells[0].setSelected(true)
					aSelected.push(aData[aObject[i]])
				}
			}
			this.getView().setModel(new JSONModel(aSelected), "filteredTreeTable")
		}, */

		_rowSel: function(event) {
			var that = this;

			var aSelected = this._getSelectedItems();

			if (aSelected.length > 0) {
				// mi prendo la proprietà che mi interessa
				var aRows = [];
				for (var i = 0; i < aSelected.length; i++) {
					// var sPosFin = this.getView().getModel().getProperty(aSelectedPath[i]).Posfin;
					var sIdPosFin = aSelected[i].Fipex;
					var sIdProposta = aSelected[i].IdProposta;
					// var sCodiFincode = this.getView().getModel().getProperty(aSelectedPath[i]).Fincode;
					var sIter = aSelected[i].Iter;
					var sCodIter = aSelected[i].CodIter;
					var sTipo = aSelected[i].TipologiaProposta;
					var sNickname = aSelected[i].Nickname;

					var sFikrs = aSelected[i].Fikrs;
					var sAnnoFipex = aSelected[i].AnnoFipex;
					var sFase = aSelected[i].Fase;
					var sReale = aSelected[i].Reale;
					var sVersione = aSelected[i].Versione;
					var sEos = aSelected[i].Eos;
					var sCodiceAmmin = aSelected[i].Prctr;
					var sKeycodepr = aSelected[i].Key_Code;
					var sDatbis = aSelected[i].Datbis;
					var sFipex = aSelected[i].Fipex;
					var sAut = aSelected[i].Autorizzazioni;
					var sKey_code = aSelected[i].Key_Code;
					var sFictr = aSelected[i].Fictr

					var oData = {
						"IdPosfin": sIdPosFin,
						"IdProposta": sIdProposta,
						// "CodiFincode": sCodiFincode,
						// "Posfin": sPosFin,
						"CodiceIter": sCodIter,
						"Iter": sIter,
						"Tipo": sTipo,
						"Nickname": sNickname,
						"Fikrs": sFikrs,
						"AnnoFipex": sAnnoFipex,
						"Fase": sFase,
						"Reale": sReale,
						"Versione": sVersione,
						"Eos": sEos,
						"CodiceAmmin": sCodiceAmmin,
						"Keycodepr": sKeycodepr,
						"Datbis": sDatbis,
						"Fipex": sFipex,
						"Key_Code": sKey_code,
						"Fictr": sFictr,
						PosFin: sFipex,
						Aut: sAut,
						Idproposta: sIdProposta
					};
					aRows.push(oData);

				}
				that.getView().getModel("modelPageAut").setData(aRows);
				that.getView().getModel("modelPosFinSelected").setProperty("/IdPosfin", aRows);
			}
		},

		_getAvvioPfId: function() {
			var oTreeTable = this.getView().byId("treeTablePFID");

			//Deleto le precedenti row prima di inserire le nuove
			oTreeTable.unbindRows();

			//filtri per IDposfin
			var oIdPosFinSel = this.getView().getModel("modelPosFinSelected").getData();
			var aPosFinSel = oIdPosFinSel.IdPosfin;
			var oSet = {
				one:false,
				enabled:true
			};
			
			if(aPosFinSel.length === 1){
				oSet = {
					one:true,
					enabled:false
				};
			}

			this.getView().setModel(new JSONModel(oSet),"modelOneRow");
			var aFilters = new Filter({
				filters: [],
				and: false
			});
			if (aPosFinSel) {
				for (var i = 0; i < aPosFinSel.length; i++) {
					var filFipex = new Filter("Fipex", FilterOperator.EQ, aPosFinSel[i].PosFin);
					aFilters.aFilters.push(filFipex);
				}
			}
			
			//oTreeTable.getBinding("rows").attachEvent("dataReceived", this.testFunction, this);
			BusyIndicator.show(0);
			//this.getView().byId("treeTablePFID").unbindRows();
			
		
			oTreeTable.bindRows({
				path: "modelTreeTable>/ZES_AVVIOPF_IDSet",
				parameters: {
					countMode: 'Inline',
					collapseRecursive: false,
					operationMode: 'Client', // necessario per ricostruire la gerarchia lato client
					// se le annotazioni sono gestite su FE tramite treeAnnotationProperties
					treeAnnotationProperties: {
						hierarchyLevelFor: 'HierarchyLevel',
						hierarchyNodeFor: 'Node',
						hierarchyParentNodeFor: 'ParentNodeId',
						hierarchyDrillStateFor: 'DrillState'
					},
					useServersideApplicationFilters: true // necessario in combinazione con operationMode : 'Client' per inviare i filtri al BE ($filter)
				},
				filters: [aFilters],
				events:{
					dataReceived : this.onDataReceived.bind(this)
				}
			});
		
		},
		
		onDataReceived:function(oEvent) {
			var isSingleRow= this.getView().getModel("modelOneRow").getData().one;
			var oModelTreeTable = this.getView().getModel("modelTreeTable");
			var oTable = this.getView().byId("treeTablePFID")
			if(isSingleRow){
				if(oEvent.getParameter("data")){
					if(!!oEvent.getParameter("data").results[0]){
						var path = oEvent.getParameter("data").results[0].__metadata.uri.split("/").pop();
						oModelTreeTable.oData[path].SELECTED = true;
						oTable.mAggregations.rows[0].mAggregations.cells[0].setSelected(true);
						oTable.mAggregations.rows[0].mAggregations.cells[0].setEnabled(false);
					}
					
				}
			}
			BusyIndicator.hide();
		},

		_onRouteMatched: function(oEvent) {
			this.sRouterParameter = oEvent.getParameters().name;
			this._getAvvioPfId();
		},

		//***********************NAVIGAZIONE***********************
		onNavBackToPosFin: function() {
			
			var isSingleRow= this.getView().getModel("modelOneRow").getData().one;
			if(isSingleRow){
				var oTable = this.getView().byId("treeTablePFID")
				oTable.mAggregations.rows[0].mAggregations.cells[0].setSelected(false)
				oTable.mAggregations.rows[0].mAggregations.cells[0].setEnabled(true)
			}
			
			
			//this._resetCheckbox("modelTreeTable", "treeTablePFID");
			this.oRouter.navTo("PosizioneFinanziaria");
		},

		onPressNavToTabGestisci: function() {
			//verifica nomi delle proprietà dell'entity della treetable
			var sPage = this.sRouterParameter;
			var oModelPageTab = this.getView().getModel("modelPosFinSelected");
			this._refreshModel(oModelPageTab);
			
			
			if(this._getSelectedItems().length > 1){	
				MessageBox.warning("Non è possibile gestire più di una posizione finanziaria. Selezionare una sola riga.");
				return;
			}

			var conProposta = $.grep(this._getSelectedItems(), function (n, i) {
				return n.IdProposta !== "";
			});

			if(conProposta.length === 0){
				MessageBox.warning("Non è possibile gestire più di una posizione finanziaria. Selezionare una sola riga.");
				return;
			}

			this._rowSel();

			var aRows = oModelPageTab.getData().IdPosfin;
			if (aRows === undefined || aRows.length === 0) {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoGestisciPagePosFinA"));
			} else {

				var oModelAut = sap.ui.getCore().setModel(new JSONModel(aRows), "modelPageAut");
				this.oRouter.navTo("TabGestisci", {
					Page: sPage
				});
			}
		},

		onPressNavToAssociaID: function(oEvt) {

			var oModelSelPosFin = this.getView().getModel("modelPosFinSelected");
			oModelSelPosFin.setData();
			this._refreshModel(oModelSelPosFin);
			this._rowSel();
			var oPosFinSel = oModelSelPosFin.getData("IdPosfin");
			var aPosFinSel = oPosFinSel.IdPosfin;

			if(aPosFinSel){
				for (var i = 0; i < aPosFinSel.length; i++) {
					if (aPosFinSel[i]["Idproposta"] !== '0') {
						MessageBox.warning("Posizioni con proposte già associate. Non è possibile procedere.");
						return;
					}
				}
			} else {
				MessageBox.warning("Selezionare una Posizione.");
				return;
			}
			

			if (aPosFinSel) {
				this.oRouter.navTo("AssociaProposta");

			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoGestisciPagePosFinA"));
			}
		},

		onPressNavToRV: function() {
			this.getRouter().navTo("CreaRimodulazioneVerticale");
		},

		onPressNavToNuovaPosizione: function() {
			this.oRouter.navTo("NuovaPosizioneFinanziaria");
		},

		//******************************************EXPORT SPREADSHEET**************************************************
		createColumnConfigNew: function() {
			var oColumnObJ = {};
			var oColumnConfig = [];
			var oTable = this.getView().byId("treeTablePFID");
			oTable.getColumns().forEach(function(column) {
				// get label
				if (column.getBindingInfo('label')) {
					oColumnObJ.label = column.getBindingInfo('label').binding.oValue;
				} else if (column.getBindingInfo('text')) {
					oColumnObJ.label = column.getBindingInfo('text').binding.oValue;
				} else if (column.getAggregation('label')) {
					if (column.getAggregation('label').getBindingInfo('text').binding.oValue) {
						oColumnObJ.label = column.getAggregation('label').getBindingInfo('text').binding.oValue;
					} else {
						for (var j = 0; j < column.getAggregation('label').getBindingInfo('text').binding.aValues.length; j++) {
							if (oColumnObJ.label === undefined) {
								oColumnObJ.label = '';
							}
							oColumnObJ.label = oColumnObJ.label + ' ' + column.getAggregation('label').getBindingInfo('text').binding.aValues[j];
						}
					}
				}
				// get proprietà
				if (oColumnObJ.label !== "Cronoprogramma" && oColumnObJ.label !== "Seleziona") {
					if (column.getTemplate().getBindingInfo('visible')) {
						oColumnObJ.property = column.getTemplate().getBindingInfo('visible').parts[0].path;
					} else if (column.getTemplate().getBindingInfo('text')) {
						oColumnObJ.property = column.getTemplate().getBindingInfo('text').parts[0].path;
					} else if (column.getTemplate().getBindingInfo('number')) {
						oColumnObJ.property = column.getTemplate().getBindingInfo('number').parts[0].path;
						oColumnObJ.type = sap.ui.export.EdmType.Number;
						oColumnObJ.delimiter = true;
						oColumnObJ.width = 10;
					}

					oColumnConfig.push(oColumnObJ);
				}
				oColumnObJ = {};
			});
			return oColumnConfig;
		},
		
		onPressExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;
			oTable = this.byId("treeTablePFID");
			var sPath = oTable.getBindingPath('rows');

			// var dataToExport = this.getOwnerComponent().getModel().getData(sPath);
			// this.getView().getModel().getData(oTable.getBindingPath('rows'))
			oRowBinding = oTable.getBinding("rows");
			//	aCols = this.createColumnConfig("ZSS4_PROP_SPE_SRV.ZET_POSFINAUT");
			aCols = this.createColumnConfigNew();
			var serviceUrl = oRowBinding.getModel().sServiceUrl;
			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: "HierarchyLevel"
				},
				dataSource: {
					type: "OData",
					useBatch: true,
					serviceUrl: serviceUrl,
					headers: oRowBinding.getModel().getHeaders(),
					dataUrl: oRowBinding.getDownloadUrl(), // includes the $expand param.
					count: oRowBinding.getLength(), // trovare metodo per calcolare gli inserimenti della tabella
					size: 1000
				},
				fileName: 'PosFin-IdProposta_export.xlsx',
				worker: true // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				MessageToast.show('Export terminato!');
				oSheet.destroy();
			});
		},

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosFin-IdProposta
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosFin-IdProposta
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosFin-IdProposta
		 */
		//	onExit: function() {
		//
		//	}

	});

});