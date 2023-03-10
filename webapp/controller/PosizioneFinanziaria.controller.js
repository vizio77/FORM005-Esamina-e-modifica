sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"sap/m/MessageToast",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageBox",
	"sap/ui/export/ExportUtils",
	"../util/formatter"
], function(Controller, BaseController, exportLibrary, Spreadsheet, MessageToast, Filter, FilterOperator, JSONModel, Fragment,
	syncStyleClass, MessageBox, ExportUtils, formatter) {
	"use strict";

	var EdmType = exportLibrary.EdmType;

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.PosizioneFinanziaria", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosizioneFinanziaria
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oDataModel = this.getModel();

			this.oRouter.getRoute("PosizioneFinanziaria").attachMatched(this._onRouteMatched, this);
			this.oRouter.getRoute("appHome").attachMatched(this._onRouteMatched, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

			/* var oModel = new JSONModel({
				enabledButtonPrev:false, 
				enabledButtonNext:false,
				intialValue:-199,
				beginValueM1:0,
				beginValueP1:201,
				finalValue:400
			});
			this.getView().setModel(oModel, "modelIsAfterAvvio"); */
			
			this.createModeButtonTable();
			this._aRowsChecked = [];
		},

		//***********************METODI CONO VISIBILITA'***********************

		_AmminRead: function() {
			var that = this;
			that.getView().byId("AmmFA").setEnabled(true);
			// that.getView().byId("Amministrazione").setEnabled(true);
			// that.getView().byId("idDescAmm").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_AMMIN", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("AmmFA", false, response.results[0].Prctr);
						// that._fillDisableInput("Amministrazione", false, response.results[0].Prctr);
						// that._fillDisableInput("idDescAmm", false, response.results[0].DescrEstesa);
					}
					if (response.results.length > 1) {
						that.getView().getModel("modelConoVisibilita").setProperty("/ZCA_AF_AMMIN", response.results);
					}
				},
				error: function(errorResponse) {
					var sDettagli = that._setErrorMex(errorResponse);
					var oErrorMessage = errorResponse.responseText;
					MessageBox.error(errorResponse, {
						details: sDettagli,
						initialFocus: sap.m.MessageBox.Action.CLOSE,
						styleClass: "sapUiSizeCompact"
					});
					MessageBox.error(oErrorMessage);
					//	MessageBox.error(errorResponse);
				}
			});
		},

		_CdrRead: function() {
			var that = this;
			that.getView().byId("CentroRespFA").setEnabled(true);
			// that.getView().byId("CentroResp").setEnabled(true);
			// that.getView().byId("idDescCdr").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_CDR", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("CentroRespFA", false, response.results[0].CodiceCdr);
						// that._fillDisableInput("CentroResp", false, response.results[0].CodiceCdr);
						// that._fillDisableInput("idDescCdr", false, response.results[0].DescrEstesa);
					} else {
						that.getView().getModel("modelConoVisibilita").setProperty("/ZCA_AF_CDR", response.results);

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
				}
			});
		},

		_RagioneriaRead: function() {
			var that = this;
			that.getView().byId("RagioneriaFA").setEnabled(true);
			// that.getView().byId("Ragioneria").setEnabled(true);
			// that.getView().byId("idDescRag").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_RAGIONERIA", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("RagioneriaFA", false, response.results[0].CodiceRagioneria);
						// that._fillDisableInput("Ragioneria", false, response.results[0].CodiceRagioneria);
						// that._fillDisableInput("idDescRag", false, response.results[0].DescrEstesa);
					} else {
						that.getView().getModel("modelConoVisibilita").setProperty("/ZCA_AF_RAGIONERIA", response.results);

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
				}
			});
		},

		//***********************FINE METODI CONO VISIBILITA'***********************
		
		_clearCheckbox: function() {
			var oTable = this.getView().byId("treeTablePF");
			var aRows = oTable.getRows();
			// var aCheckBox = [];
			for (var n = 0; n < aRows.length; n++) {
					var newPath = aRows[n].getBindingContext("modelTreeTable").getPath();
					var oObjectToUpdate =  this.getView().getModel("modelTreeTable").oData[newPath.slice(1)];
					oObjectToUpdate.SELECTED = false;
					//aRows[n].getCells()[0].setSelected(false);
				}
		},
		
		_onRouteMatched: function() {

			this._AmminRead();
			this._CdrRead();
			this._RagioneriaRead();
			this._gestTipologiche();
			//this._resetCheckbox("modelTreeTable", "treeTablePF");
		},

		onSelectCheckBox: function(oEvent) {
			// this._resetCheckbox("modelTreeTable", this);
            var oEl = oEvent.getSource().getBindingContext("modelTreeTable").sPath;
            var oObjectUpdate = this.getView().getModel("modelTreeTable").oData[oEl.slice(1)];
            if (oObjectUpdate.SELECTED && oObjectUpdate.SELECTED === true) {
                oObjectUpdate.SELECTED = false;
            } else {
                oObjectUpdate.SELECTED = true;
            }
        },
        
        _getSelectedItems: function() {
        	// this._resetCheckbox("modelTreeTable", this);
            var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
            var aData = this.getView().getModel("modelTreeTable").oData;
            var aSelected = [],
                aValResult = [];
            for (var i = 0; i < aObject.length; i++) {
                if (aObject[i].includes("ZES_AVVIOPFSet") && aData[aObject[i]].SELECTED === true) {
                    aSelected.push(aData[aObject[i]]);
                }
            }
           return aSelected;
        },

		//LOGICA PER ESTRARRE RIGA SELEZIONATA TRAMITE CHECKBOX
		_rowSel: function(event) {

            var that = this;


           var aSelected = this._getSelectedItems();

           if (aSelected.length > 0) {
                // mi prendo la proprietà che mi interessa
                var PosFin = [];
               //ricerca per IDposfin
                for (var i = 0; i < aSelected.length; i++) {
                    var sFipex = aSelected[i].Fipex;
                    var sAut = aSelected[i].Autorizzazioni;
                    this.sAnno = aSelected[i].AnnoFipex;
                    this.sFikrs = aSelected[i].Fikrs;
                    this.sFase = aSelected[i].Fase;
                    this.sReale = aSelected[i].Reale;
                    this.sVersione = aSelected[i].Versione;
                    this.sDatbis = aSelected[i].Datbis;
                    this.sFipex = aSelected[i].Fipex;
                    // var sPosFinExtendedDescr = this.getView().getModel().getProperty(aSelectedPath[i]).Posfins4;
                    // inizio modifica G.Modugno
                    var oBj = {
                        PosFin: sFipex,
                        Aut: sAut,
                        Datbis:this.sDatbis
                    };
                    
                   PosFin.push(oBj);
                    //    PosFin.push(sIdPosFin4); --> modificata da G.Modugno per aggiungere la descrizione estesa della posfin
                    // fine modifica G.Modugno
                    that.getView().getModel("modelPosFinSelected").setProperty("/IdPosfin", PosFin);
                    // that.getView().getModel("modelLinkPopUpPF").setData(oObjPopup);
                }
            }
        },
        
	
		//***********************NAVIGAZIONE***********************

		onPressInfo: function(oEvent) {
			var oButton = oEvent.getSource();
			this.getDialogInfo().openBy(oButton);
		},

		getDialogInfo: function() {
			if (this._oDialog) {
				this._oDialog.destroy();
				this._oDialog = null;
			}
			if (!this._oDialog) {
				this._oDialog = sap.ui.xmlfragment(
					"zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopOverInfo",
					this
				);
				this.getView().addDependent(this._oDialog);
			}
			return this._oDialog;
		},

		onCloseInfo: function(oEvent) {
			var oButton = oEvent.getSource();
			this.getDialogInfo().close(oButton);
		},

		onPressNavToHomeLoc: function() {
			var oTreeTablePF = this.getView().byId("treeTablePF");
			//oTreeTablePF.unbindRows();
			this.getRouter().navTo("appHome");
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

		onPressNavToPosFinIdProposta: function() {
			//LOGICA CONTROLLO SELEZIONE 1 O + POSFIN
			var oModelSelPosFin = this.getView().getModel("modelPosFinSelected");
			oModelSelPosFin.setData();
			this._refreshModel(oModelSelPosFin);
			this._rowSel();
			var oPosFinSel = oModelSelPosFin.getData("IdPosfin");
			var aPosFinSel = oPosFinSel.IdPosfin;

			if (aPosFinSel) {
				//this._resetCheckbox("modelTreeTable", "treeTablePF");
				this.oRouter.navTo("PosFin-IdProposta");
			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoGestisciPagePosFinA"));
			}
		},
		
		_crossNavToAps: function() {
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");

				var sHref = (xnavservice && xnavservice.hrefForExternal({
					//questi sono i parametri inerenti l'app dove si vuole atterrare
					target: {
						semanticObject: "Z_S4_APS",
						action: "display"
					},
					//qui si sceglie il filtro da preselezionare nell'app di atterraggio
					params: {
						// "iobjName": this.getView().byId("productInput").getValue()
					}
				})) || "";
				
				var finalUrl = window.location.href.split("#")[0] + sHref;
				// 1° parametro --> apre il collegamento all'url definitivo , 2° parametro boolean true --> new tab / false --> same tab))
				sap.m.URLHelper.redirect(finalUrl, false);
			
		},
		
		_crossNavToBilgen: function() {
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");

				var sHref = (xnavservice && xnavservice.hrefForExternal({
					//questi sono i parametri inerenti l'app dove si vuole atterrare
					target: {
						semanticObject: "Z_S4_BIGEN",
						action: "display"
					},
					//qui si sceglie il filtro da preselezionare nell'app di atterraggio
					params: {
						// "iobjName": this.getView().byId("productInput").getValue()
					}
				})) || "";
				
				var finalUrl = window.location.href.split("#")[0] + sHref;
				// 1° parametro --> apre il collegamento all'url definitivo , 2° parametro boolean true --> new tab / false --> same tab))
				sap.m.URLHelper.redirect(finalUrl, false);
			
		},
		
		_crossNavToEcobil: function() {
			var xnavservice = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService("CrossApplicationNavigation");

				var sHref = (xnavservice && xnavservice.hrefForExternal({
					//questi sono i parametri inerenti l'app dove si vuole atterrare
					target: {
						semanticObject: "Z_S4_ECOBIL",
						action: "display"
					},
					//qui si sceglie il filtro da preselezionare nell'app di atterraggio
					params: {
						// "iobjName": this.getView().byId("productInput").getValue()
					}
				})) || "";
				
				var finalUrl = window.location.href.split("#")[0] + sHref;
				// 1° parametro --> apre il collegamento all'url definitivo , 2° parametro boolean true --> new tab / false --> same tab))
				sap.m.URLHelper.redirect(finalUrl, false);
			
		},

		onPressNavToAPS: function() {
			// this.oRouter.navTo("Aps");
			this._crossNavToAps();
			/*this.oRouter.navTo("MessagePage", {
				viewName: "Aps"
			});*/
		},

		onPressNavToEcoBilancio: function() {
			// this.oRouter.navTo("Ecobilancio");
			this._crossNavToEcobil();
			/*this.oRouter.navTo("MessagePage", {
				viewName: "Ecobilancio"
			});*/
		},

		onPressNavToBilancioDiGenere: function() {
			// this.oRouter.navTo("BilancioDiGenere");
			this._crossNavToBilgen();
			/*this.oRouter.navTo("MessagePage", {
				viewName: "BilancioDiGenere"
			});*/
		},

		onPressNavToDettaglioContabile: function() {
			var oBtn = this.getView().byId("idBtnDettaglioContabile");
			var sID = oBtn.getText();
			//LOGICA PER CONTROLLO: SELEZIONE DI UNA POSFIN / DA MODIFICARE
			var oModelSelPosFin = this.getView().getModel("modelPosFinSelected");
			this._refreshModel(oModelSelPosFin);
			this._rowSel();
			var aRows = oModelSelPosFin.getData().IdPosfin;
			if (aRows === undefined) {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoDettaglioContabile"));
			} else {
				if (aRows.length === 1) {
					this.oRouter.navTo("DettaglioContabile", {
						ID: sID,
						Fikrs: this.sFikrs,
						Anno: this.sAnno,
						Fase: this.sFase,
						Reale: this.sReale,
						Versione: this.sVersione,
						Fipex: this.sFipex,
						Datbis: this.sDatbis
					});
				} else {
					MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoDettaglioContabile"));
				}
			}
		},

		onPressSwitchListaEstesaRidotta: function() {
			var btnText = this.getView().byId("idBtnSwitchListaEstesaRidotta").getText();
			if (btnText.toUpperCase() === "LISTA RIDOTTA") {
				this.getView().byId("idBtnSwitchListaEstesaRidotta").setText(this.getResourceBundle().getText("Lista") + this.getResourceBundle()
					.getText(
						"Estesa"));
				//Codice per mostrare TreeTable Ridotta
				this.getView().getModel("modelListaEstesaRidotta").setProperty("/visible", false);
			} else {
				this.getView().byId("idBtnSwitchListaEstesaRidotta").setText(this.getResourceBundle().getText("Lista") + this.getResourceBundle()
					.getText(
						"Ridotta"));
				//Codice per mostrare TreeTable Estesa
				this.getView().getModel("modelListaEstesaRidotta").setProperty("/visible", true);
			}

		},

		//******************************************EXPORT SPREADSHEET**************************************************
		createColumnConfigNew: function() {
			var oColumnObJ = {};
			var oColumnConfig = [];
			var oTable = this.getView().byId("treeTablePF");
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
				//ESCLUSIONE DI COLONNE
				if (oColumnObJ.label !== "Cronoprogramma" && oColumnObJ.label !== "Seleziona") {
				
				//Escludo momentaneamente anche TCRC, TCRF e COFOG
				// if (oColumnObJ.label !== "Cronoprogramma" && oColumnObJ.label !== "Seleziona" && oColumnObJ.label !== "TCR C" && oColumnObJ.label !== "TCR F" && oColumnObJ.label !== "Cofog" ) {
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
			oTable = this.byId("treeTablePF");
			// var sPath = oTable.getBindingPath('rows');

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
				fileName: 'PosFin_export.xlsx',
				worker: true // We need to disable worker because we are using a MockServer as OData Service
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				MessageToast.show('Export terminato!');
				oSheet.destroy();
			});
		},

		//*********************LOGICHE FILTERBAR: ADATTA FILTRI + CUSTOM POSFIN**************************

		//ONCHANGE
		onChangeT: function(oEvent, idControl) {
			//alert("onChangeT" + idControl);
		},

		onChange: function(oEvent, inputRef) {
			var sSelectedVal;

			if (inputRef === "AmmFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroRespFA");
					this._resetInput("AzioneFA");
					this._resetInput("CapitoloFA");
				}
			}

			if (inputRef === "CentroRespFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroRespFA");
				}
			}

			if (inputRef === "MissioneFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("ProgrammaFA");
					this._resetInput("AzioneFA");
				}
			}

			if (inputRef === "ProgrammaFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("AzioneFA");
				}
			}

			if (inputRef === "CapitoloFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("PGFA");
				}
			}

			if (inputRef === "TitoloFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CategoriaFA");
					this._resetInput("CE2FA");
					this._resetInput("CE3FA");
				}
			}

			if (inputRef === "CategoriaFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CE2FA");
					this._resetInput("CE3FA");
				}
			}

			if (inputRef === "CE2FA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CE3FA");
				}
			}

		},

		//ONSUGGEST
		//LOGICA SUGGESTIONITEMS DINAMICO - NON NELLA VIEW
		//Funzione generica per onSuggest con Input / ListItem in BaseController
		//Funzione generica per Filtri Or e Filtri And in BaseController

		onSuggest: function(oEvent, inputRef) {
			var oInput, sTerm, aOrFilters, aAndFilters;
			var sAmminValFb, sMissioneValFb, sProgrammaValFb, sCapitoloValFb, sTitoloValFb, sCategoriaValFb, sCE2ValFb;
			// var aOrFiltersCond, aFilters;

			sAmminValFb = this.getView().byId("AmmFA").getValue();
			sMissioneValFb = this.getView().byId("MissioneFA").getValue();
			sProgrammaValFb = this.getView().byId("ProgrammaFA").getValue();
			sCapitoloValFb = this.getView().byId("CapitoloFA").getValue();
			sTitoloValFb = this.getView().byId("TitoloFA").getValue();
			sCategoriaValFb = this.getView().byId("CategoriaFA").getValue();
			sCE2ValFb = this.getView().byId("CE2FA").getValue();
			var oFilterAmm, oFilterMiss, oFilterProg, oFilterCap, oFilterTit, oFilterCat, oFilterCe2;

			var aCompoundFilters;

			if (inputRef === "AmmFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_AMMIN", "{modelConoVisibilita>Prctr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "CentroRespFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);
				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_CDR", "{modelConoVisibilita>CodiceCdr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "RagioneriaFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_RAGIONERIA", "{modelConoVisibilita>CodiceRagioneria}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "MissioneFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesami", sTerm);
				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_MISSIONESet", "{Codicemissione}", "{Descrestesami}", aAndFilters);
			}

			if (inputRef === "ProgrammaFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesapr", sTerm);

				//Filtri in compound
				// sMiss = this.getView().byId("MissioneFA").getValue();
				aCompoundFilters = [];
				oFilterMiss = this._filtersInCompound("Codicemissione", sMissioneValFb);
				aCompoundFilters.push(oFilterMiss);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_PROGRAMMASet", "{Codiceprogramma}", "{Descrestesapr}", aAndFilters);
			}

			if (inputRef === "AzioneFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesaaz", sTerm);

				//Filtri in compound
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				oFilterMiss = this._filtersInCompound("Codicemissione", sMissioneValFb);
				oFilterProg = this._filtersInCompound("Codiceprogramma", sProgrammaValFb);
				aCompoundFilters.push(oFilterAmm, oFilterMiss, oFilterProg);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_AZIONESet", "{Codiceazione}", "{Descrestesaaz}", aAndFilters);
			}

			if (inputRef === "CapitoloFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizionecapitolo", sTerm);

				//Filtri in compound
				sAmminValFb = this.getView().byId("AmmFA").getValue();
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				aCompoundFilters.push(oFilterAmm);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CAPITOLOSet", "{Codicecapitolo}", "{Descrizionecapitolo}", aAndFilters);
			}

			if (inputRef === "PGFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizionepg", sTerm);

				//Filtri in compound
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				oFilterCap = this._filtersInCompound("Codicecapitolo", sCapitoloValFb);
				aCompoundFilters.push(oFilterAmm, oFilterCap);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_PIANGESSet", "{Codicepg}", "{Descrizionepg}", aAndFilters);
			}

			if (inputRef === "TitoloFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrtitolo", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TITOLOSet", "{Codicetitolo}", "{Descrtitolo}", aAndFilters);
			}

			if (inputRef === "CategoriaFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrcategoria", sTerm);

				//Filtri in compound
				aCompoundFilters = [];

				oFilterTit = this._filtersInCompound("Codicetitolo", sTitoloValFb);
				aCompoundFilters.push(oFilterTit);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CATEGORIASet", "{Codicecategoria}", "{Descrcategoria}", aAndFilters);
			}

			if (inputRef === "CE2FA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrclaesco2", sTerm);

				//Filtri in compound
				aCompoundFilters = [];

				oFilterTit = this._filtersInCompound("Codicetitolo", sTitoloValFb);
				oFilterCat = this._filtersInCompound("Codicecategoria", sCategoriaValFb);

				aCompoundFilters.push(oFilterTit, oFilterCat);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CLAECO2Set", "{Codiceclaeco2}", "{Descrclaesco2}", aAndFilters);
			}

			if (inputRef === "CE3FA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrclaeco3", sTerm);

				//Filtri in compound
				aCompoundFilters = [];

				oFilterTit = this._filtersInCompound("Codicetitolo", sTitoloValFb);
				oFilterCat = this._filtersInCompound("Codicecategoria", sCategoriaValFb);
				oFilterCe2 = this._filtersInCompound("Codiceclaeco2", sCE2ValFb);

				aCompoundFilters.push(oFilterTit, oFilterCat, oFilterCe2);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CLAECO3Set", "{Codiceclaeco3}", "{Descrclaeco3}", aAndFilters);
			}

			if (inputRef === "IDPropostaFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Nickname", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_PROPOSTASet", "{Idproposta}", "{Nickname}", aAndFilters);
			}

			if (inputRef === "COFOG3FA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizione", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_COFOGSet", "{Codcofogl3}", "{Descrizione}", aAndFilters);
			}

			if (inputRef === "NickNameFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Nickname", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_PROPNICKSet", "{Nickname}", "{Descrestesa}", aAndFilters);
			}

			if (inputRef === "TcrCFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				// aOrFilters = this._aOrFiltersCond("Numetcrc", sTerm);
				aOrFilters = this._aOrFiltersCond("Descrestesa", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TCR_CSet", "{Numetcrcspe}", "{Descrestesa}", aAndFilters);
			}

			if (inputRef === "TcrFFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				// aOrFilters = this._aOrFiltersCond("Numetcrf", sTerm);
				aOrFilters = this._aOrFiltersCond("Descrestesa", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TCR_FSet", "{Numetcrfspe}", "{Descrestesa}", aAndFilters);
			}

			if (inputRef === "NumAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_NUMAUTSet", "{Fincode}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "AnnoAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_ANNOAUTSet", "{Zzanno}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "ArtAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_ARTAUTSet", "{Zzarticolo}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "SubArtAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_SUBARTAUTSet", "{Zzsubarticolo}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "CommaAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_COMMAAUTSet", "{Zzcomma}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "SubCommaAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_SUBCOMMAAUTSet", "{Zzsubcomma}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "LetteraAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_LETTAUTSet", "{Zznumerolettera}", "{Beschr}", aAndFilters);
			}

			if (inputRef === "SubLetteraAutFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_SUBLETTAUTSet", "{Zznumerosublettera}", "{Beschr}", aAndFilters);
			}
		},

		onValueHelpRequest: function(oEvent, inputRef) {
			var sInputValue, aOrFiltersCond, aFilters;
			var sAmminVal, sMissioneVal, sProgrammaVal;
			var sTitoloVal, sCategoriaVal, sCE2Val;
			var fAmm, fMiss, fProg, fTit, fCat, fCe2, fCap;
			var sCapitoloVal;
			var oModelConi = this.getView().getModel("modelConoVisibilita");
			var oModelGlobal = this.getView().getModel();
			var arrayProperties = [];
			sInputValue = oEvent.getSource().getValue();
			// var oView = this.getView();

			if (inputRef === "AmmFA") {

				if (!this.AmministrazioneHelpDialogFA) {
					this.AmministrazioneHelpDialogFA = this.createValueHelpDialog(
						"AmmFA",
						oModelConi,
						"modelConoVisibilita",
						"{i18n>Amministrazione}",
						"/ZCA_AF_AMMIN",
						"Prctr",
						"DescrEstesa");
				}
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Prctr", FilterOperator.Contains, sInputValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.AmministrazioneHelpDialogFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.AmministrazioneHelpDialogFA.open(sInputValue);
			}

			if (inputRef === "CentroRespFA") {
				if (!this.CentroRespFA) {
					this.CentroRespFA = this.createValueHelpDialog(
						"CentroRespFA",
						oModelConi,
						"modelConoVisibilita",
						"{i18n>CentroResp}",
						"/ZCA_AF_CDR",
						"CodiceCdr",
						"DescrEstesa");

				}
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("CodiceCdr", FilterOperator.Contains, sInputValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.CentroRespFA.getBinding("items").filter(aOrFiltersCond);
				this.CentroRespFA.open(sInputValue);
			}

			if (inputRef === "RagioneriaFA") {
				if (!this.RagioneriaFA) {
					this.RagioneriaFA = this.createValueHelpDialog(
						"RagioneriaFA",
						oModelConi,
						"modelConoVisibilita",
						"{i18n>Ragioneria}",
						"/ZCA_AF_RAGIONERIA",
						"CodiceRagioneria",
						"DescrEstesa");
				}

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("CodiceRagioneria", FilterOperator.Contains, sInputValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.RagioneriaFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.RagioneriaFA.open(sInputValue);
			}

			if (inputRef === "MissioneFA") {
				if (!this.MissioneFA) {
					this.MissioneFA = this.createValueHelpDialog(
						"MissioneFA",
						oModelGlobal,
						"",
						"{i18n>Missione}",
						"/ZCA_AF_MISSIONESet",
						"Codicemissione",
						"Descrestesami");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codicemissione", FilterOperator.Contains, sInputValue),
							new Filter("Descrestesami", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.MissioneFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.MissioneFA.open(sInputValue);
			}

			if (inputRef === "ProgrammaFA") {
				sMissioneVal = this.getView().byId("MissioneFA").getValue();

				arrayProperties = [{
					"property": "Codicemissione",
					"label": "{i18n>NumMiss}"
				}, {
					"property": "Descrestesami",
					"label": "{i18n>DescMissione}"
				}, {
					"property": "Codiceprogramma",
					"label": "{i18n>NumProg}"
				}, {
					"property": "Descrestesapr",
					"label": "{i18n>DescProgramma}"
				}];
				if (!this.ProgrammaFA) {
					this.ProgrammaFA = this.createValueHelpTableSelectDialog(
						"ProgrammaFA",
						oModelGlobal,
						"",
						"{i18n>Programma}",
						"/ZCA_AF_PROGRAMMASet",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codiceprogramma", FilterOperator.Contains, sInputValue),
							new Filter("Descrestesapr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sMissioneVal !== undefined && sMissioneVal !== "") {
					fMiss = new Filter("Codicemissione", FilterOperator.EQ, sMissioneVal);
					aFilters.aFilters.push(fMiss);
				}
				this.ProgrammaFA.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.ProgrammaFA.open(sInputValue);
			}

			if (inputRef === "AzioneFA") {
				sProgrammaVal = this.getView().byId("ProgrammaFA").getValue();
				sMissioneVal = this.getView().byId("MissioneFA").getValue();
				sAmminVal = this.getView().byId("AmmFA").getValue();

				arrayProperties = [{
					"property": "Codicemissione",
					"label": "{i18n>NumMiss}"
				}, {
					"property": "Descrestesami",
					"label": "{i18n>DescMissione}"
				}, {
					"property": "Codiceprogramma",
					"label": "{i18n>NumProg}"
				}, {
					"property": "Descrestesapr",
					"label": "{i18n>DescProgramma}"
				}, {
					"property": "Codiceazione",
					"label": "{i18n>NumAzione}"
				}, {
					"property": "Descrestesaaz",
					"label": "{i18n>DescAzione}"
				}];
				if (!this.AzioneFA) {
					this.AzioneFA = this.createValueHelpTableSelectDialog(
						"AzioneFA",
						oModelGlobal,
						"",
						"{i18n>Azione}",
						"/ZCA_AF_AZIONESet",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codiceazione", FilterOperator.Contains, sInputValue),
							new Filter("Descrestesaaz", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				if (sMissioneVal !== undefined && sMissioneVal !== "") {
					fMiss = new Filter("Codicemissione", FilterOperator.EQ, sMissioneVal);
					aFilters.aFilters.push(fMiss);
				}
				if (sProgrammaVal !== undefined && sProgrammaVal !== "") {
					fProg = new Filter("Codiceprogramma", FilterOperator.EQ, sProgrammaVal);
					aFilters.aFilters.push(fProg);
				}
				this.AzioneFA.getBinding("items").filter(aFilters);
				//Open ValueHelpDialog filtered by the input's value
				this.AzioneFA.open(sInputValue);
			}

			if (inputRef === "CapitoloFA") {
				sAmminVal = this.getView().byId("AmmFA").getValue();

				if (!this.CapitoloFA) {
					this.CapitoloFA = this.createValueHelpDialog(
						"CapitoloFA",
						oModelGlobal,
						"",
						"{i18n>Capitolo}",
						"/ZCA_AF_CAPITOLOSet",
						"Codicecapitolo",
						"Descrizionecapitolo");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codicecapitolo", FilterOperator.Contains, sInputValue),
							new Filter("Descrizionecapitolo", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				this.CapitoloFA.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CapitoloFA.open(sInputValue);
			}

			if (inputRef === "PGFA") {
				sAmminVal = this.getView().byId("AmmFA").getValue();
				sCapitoloVal = this.getView().byId("CapitoloFA").getValue();
				arrayProperties = [{
					"property": "Codicecapitolo",
					"label": "{i18n>NumCap}"
				}, {
					"property": "Descrizionecapitolo",
					"label": "{i18n>DescCap}"
				}, {
					"property": "Codicepg",
					"label": "{i18n>NumPG}"
				}, {
					"property": "Descrizionepg",
					"label": "{i18n>DescPg}"
				}];
				// var sTerm = oEvent.getParameter("suggestValue");

				if (!this.PGFA) {
					this.PGFA = this.createValueHelpTableSelectDialog(
						"PGFA",
						oModelGlobal,
						"",
						"{i18n>PG}",
						"/ZES_PIANGEST_SET",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicepg", FilterOperator.Contains, sInputValue),
							new Filter("Descrizionepg", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				// if (sAmm && sCapitolo) {
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				if (sCapitoloVal !== undefined && sCapitoloVal !== "") {
					fCap = new Filter("Codicecapitolo", FilterOperator.EQ, sCapitoloVal);
					aFilters.aFilters.push(fCap);
				}
				this.PGFA.getBinding("items").filter(aFilters);
				this.PGFA.open(sInputValue);
			}

			if (inputRef === "TitoloFA") {

				if (!this.TitoloFA) {
					this.TitoloFA = this.createValueHelpDialog(
						"TitoloFA",
						oModelGlobal,
						"",
						"{i18n>Titolo}",
						"/ZCA_AF_TITOLOSet",
						"Codicetitolo",
						"Descrtitolo");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicetitolo", FilterOperator.Contains, sInputValue),
							new Filter("Descrtitolo", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				this.TitoloFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.TitoloFA.open(sInputValue);
			}

			if (inputRef === "CategoriaFA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();
				arrayProperties = [{
					"property": "Codicetitolo",
					"label": "{i18n>NumTit}"
				}, {
					"property": "Descrtitolo",
					"label": "{i18n>DescTit}"
				}, {
					"property": "Codicecategoria",
					"label": "{i18n>NumCat}"
				}, {
					"property": "Descrcategoria",
					"label": "{i18n>DescCat}"
				}];

				if (!this.CategoriaFA) {
					this.CategoriaFA = this.createValueHelpTableSelectDialog(
						"CategoriaFA",
						oModelGlobal,
						"",
						"{i18n>Categoria}",
						"/ZCA_AF_CATEGORIASet",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicecategoria", FilterOperator.Contains, sInputValue),
							new Filter("Descrcategoria", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				this.CategoriaFA.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CategoriaFA.open(sInputValue);
			}

			if (inputRef === "CE2FA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();
				sCategoriaVal = this.getView().byId("CategoriaFA").getValue();
				arrayProperties = [{
					"property": "Codicetitolo",
					"label": "{i18n>NumTit}"
				}, {
					"property": "Descrtitolo",
					"label": "{i18n>DescTit}"
				}, {
					"property": "Codicecategoria",
					"label": "{i18n>NumCat}"
				}, {
					"property": "Descrcategoria",
					"label": "{i18n>DescCat}"
				}, {
					"property": "Codiceclaeco2",
					"label": "{i18n>NumCE2}"
				}, {
					"property": "Descrclaesco2",
					"label": "{i18n>DescCE2}"
				}];
				if (!this.CE2FA) {
					this.CE2FA = this.createValueHelpTableSelectDialog(
						"CE2FA",
						oModelGlobal,
						"",
						"{i18n>CE2}",
						"/ZCA_AF_CLAECO2Set",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codiceclaeco2", FilterOperator.Contains, sInputValue),
							new Filter("Descrclaesco2", FilterOperator.Contains, sInputValue)
						],
						and: false
					});

				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				if (sCategoriaVal !== undefined && sCategoriaVal !== "") {
					fCat = new Filter("Codicecategoria", FilterOperator.EQ, sCategoriaVal);
					aFilters.aFilters.push(fCat);
				}
				this.CE2FA.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CE2FA.open(sInputValue);
			}

			if (inputRef === "CE3FA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();
				sCategoriaVal = this.getView().byId("CategoriaFA").getValue();
				sCE2Val = this.getView().byId("CE2FA").getValue();
				arrayProperties = [{
					"property": "Codicetitolo",
					"label": "{i18n>NumTit}"
				}, {
					"property": "Descrtitolo",
					"label": "{i18n>DescTit}"
				}, {
					"property": "Codicecategoria",
					"label": "{i18n>NumCat}"
				}, {
					"property": "Descrcategoria",
					"label": "{i18n>DescCat}"
				}, {
					"property": "Codiceclaeco2",
					"label": "{i18n>NumCE2}"
				}, {
					"property": "Descrclaesco2",
					"label": "{i18n>DescCE2}"
				}, {
					"property": "Codiceclaeco3",
					"label": "{i18n>NumCE3}"
				}, {
					"property": "Descrclaeco3",
					"label": "{i18n>DescCE3}"
				}];

				if (!this.CE3FA) {
					this.CE3FA = this.createValueHelpTableSelectDialog(
						"CE3FA",
						oModelGlobal,
						"",
						"{i18n>CE3}",
						"/ZCA_AF_CLAECO3Set",
						arrayProperties);
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codiceclaeco3", FilterOperator.Contains, sInputValue),
							new Filter("Descrclaeco3", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				if (sCategoriaVal !== undefined && sCategoriaVal !== "") {
					fCat = new Filter("Codicecategoria", FilterOperator.EQ, sCategoriaVal);
					aFilters.aFilters.push(fCat);
				}
				if (sCE2Val !== undefined && sCE2Val !== "") {
					fCe2 = new Filter("Codiceclaeco2", FilterOperator.EQ, sCE2Val);
					aFilters.aFilters.push(fCe2);
				}
				this.CE3FA.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CE3FA.open(sInputValue);
			}

			if (inputRef === "IDPropostaFA") {

				if (!this.IDPropostaFA) {
					this.IDPropostaFA = this.createValueHelpDialog(
						"IDPropostaFA",
						oModelGlobal,
						"",
						"{i18n>IDProposta}",
						"/ZCA_AF_PROPOSTASet",
						"Idproposta",
						"Nickname");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Idproposta", FilterOperator.Contains, sInputValue),
							new Filter("Nickname", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.IDPropostaFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.IDPropostaFA.open(sInputValue);
			}

			if (inputRef === "COFOG3FA") {
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

				if (!this.CofogFA) {
					this.CofogFA = this.createValueHelpTableSelectDialog(
						"COFOG3FA",
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
				this.CofogFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.CofogFA.open(sInputValue);
			}

			if (inputRef === "NickNameFA") {

				if (!this.NickNameFA) {
					this.NickNameFA = this.createValueHelpDialog(
						"NickNameFA",
						oModelGlobal,
						"",
						"{i18n>NickName}",
						"/ZCA_AF_PROPNICKSet",
						"Nickname",
						"Descrestesa");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Nickname", FilterOperator.Contains, sInputValue),
							new Filter("Nickname", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.NickNameFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.NickNameFA.open(sInputValue);

			}

			if (inputRef === "TcrCFA") {

				if (!this.TcrCFA) {
					this.TcrCFA = this.createValueHelpDialog(
						"TcrCFA",
						oModelGlobal,
						"",
						"{i18n>TcrC}",
						"/ZCA_AF_TCR_CSet",
						"Numetcrcspe",
						"Descrestesa");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Numetcrcspe", FilterOperator.Contains, sInputValue),
							new Filter("Descrestesa", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.TcrCFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.TcrCFA.open(sInputValue);
			}

			if (inputRef === "TcrFFA") {

				if (!this.TcrFFA) {
					this.TcrFFA = this.createValueHelpDialog(
						"TcrFFA",
						oModelGlobal,
						"",
						"{i18n>TcrF}",
						"/ZCA_AF_TCR_FSet",
						"Numetcrfspe",
						"Descrestesa");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Numetcrfspe", FilterOperator.Contains, sInputValue),
							new Filter("Descrestesa", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.TcrFFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.TcrFFA.open(sInputValue);
			}

			if (inputRef === "NumAutFA") {

				if (!this.NumAutFA) {
					this.NumAutFA = this.createValueHelpDialog(
						"NumAutFA",
						oModelGlobal,
						"",
						"{i18n>NumAut}",
						"/ZCA_AF_NUMAUTSet",
						"Fincode",
						"Beschr");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.NumAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.NumAutFA.open(sInputValue);
			}

			if (inputRef === "AnnoAutFA") {

				if (!this.AnnoAutFA) {
					this.AnnoAutFA = this.createValueHelpDialog(
						"AnnoAutFA",
						oModelGlobal,
						"",
						"{i18n>AnnoAut}",
						"/ZCA_AF_ANNOAUTSet",
						"Zzanno",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.AnnoAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.AnnoAutFA.open(sInputValue);
			}

			if (inputRef === "ArtAutFA") {

				if (!this.ArtAutFA) {
					this.ArtAutFA = this.createValueHelpDialog(
						"ArtAutFA",
						oModelGlobal,
						"",
						"{i18n>ArtAut}",
						"/ZCA_AF_ARTAUTSet",
						"Zzarticolo",
						"Beschr");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.ArtAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.ArtAutFA.open(sInputValue);
			}

			if (inputRef === "SubArtAutFA") {

				if (!this.SubArtAutFA) {
					this.SubArtAutFA = this.createValueHelpDialog(
						"SubArtAutFA",
						oModelGlobal,
						"",
						"{i18n>SubArtAut}",
						"/ZCA_AF_SUBARTAUTSet",
						"Zzsubarticolo",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.SubArtAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.SubArtAutFA.open(sInputValue);
			}

			if (inputRef === "CommaAutFA") {

				if (!this.CommaAutFA) {
					this.CommaAutFA = this.createValueHelpDialog(
						"CommaAutFA",
						oModelGlobal,
						"",
						"{i18n>CommaAut}",
						"/ZCA_AF_COMMAAUTSet",
						"Zzcomma",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.CommaAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.CommaAutFA.open(sInputValue);
			}

			if (inputRef === "SubCommaAutFA") {

				if (!this.SubCommaAutFA) {
					this.SubCommaAutFA = this.createValueHelpDialog(
						"SubCommaAutFA",
						oModelGlobal,
						"",
						"{i18n>SubCommaAut}",
						"/ZCA_AF_SUBCOMMAAUTSet",
						"Zzsubcomma",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.SubCommaAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.SubCommaAutFA.open(sInputValue);
			}

			if (inputRef === "LetteraAutFA") {

				if (!this.LetteraAutFA) {
					this.LetteraAutFA = this.createValueHelpDialog(
						"LetteraAutFA",
						oModelGlobal,
						"",
						"{i18n>LetteraAut}",
						"/ZCA_AF_LETTAUTSet",
						"Zznumerolettera",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.LetteraAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.LetteraAutFA.open(sInputValue);
			}

			if (inputRef === "SubLetteraAutFA") {

				if (!this.SubLetteraAutFA) {
					this.SubLetteraAutFA = this.createValueHelpDialog(
						"SubLetteraAutFA",
						oModelGlobal,
						"",
						"{i18n>SubLetteraAut}",
						"/ZCA_AF_SUBLETTAUTSet",
						"Zznumerosublettera",
						"Beschr");
				}

				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.SubLetteraAutFA.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.SubLetteraAutFA.open(sInputValue);
			}
		},

		onValueHelpSearch: function(oEvent, inputRef) {
			var sValue, aOrFiltersCond, aFilters;
			sValue = oEvent.getParameter("value");
			var sAmminVal, sMissioneVal, sProgrammaVal, sTitoloVal, sCategoriaVal, sCE2Val, sCapitoloVal;
			var fAmm, fMiss, fProg, fCap, fTit, fCat, fCE2;
			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			if (inputRef === "AmmFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Prctr", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "CentroRespFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicecdr", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "RagioneriaFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("CodiceRagioneria", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "MissioneFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codicemissione", FilterOperator.Contains, sValue),
							new Filter("Descrestesami", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "ProgrammaFA") {
				sMissioneVal = this.getView().byId("MissioneFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codiceprogramma", FilterOperator.Contains, sValue),
							new Filter("Descrestesapr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sMissioneVal !== undefined && sMissioneVal !== "") {
					fMiss = new Filter("Codicemissione", FilterOperator.EQ, sMissioneVal);
					aFilters.aFilters.push(fMiss);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "AzioneFA") {
				sProgrammaVal = this.getView().byId("ProgrammaFA").getValue();
				sMissioneVal = this.getView().byId("MissioneFA").getValue();
				sAmminVal = this.getView().byId("AmmFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Codiceazione", FilterOperator.Contains, sValue),
							new Filter("Descrestesaaz", FilterOperator.Contains, sValue)
						],
						and: false
					});

				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				if (sMissioneVal !== undefined && sMissioneVal !== "") {
					fMiss = new Filter("Codicemissione", FilterOperator.EQ, sMissioneVal);
					aFilters.aFilters.push(fMiss);
				}
				if (sProgrammaVal !== undefined && sProgrammaVal !== "") {
					fProg = new Filter("Codiceprogramma", FilterOperator.EQ, sProgrammaVal);
					aFilters.aFilters.push(fProg);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "CapitoloFA") {
				sAmminVal = this.getView().byId("AmmFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicecapitolo", FilterOperator.Contains, sValue),
							new Filter("Descrizionecapitolo", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "PGFA") {
				sAmminVal = this.getView().byId("AmmFA").getValue();
				sCapitoloVal = this.getView().byId("CapitoloFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicepg", FilterOperator.Contains, sValue),
							new Filter("Descrizionepg", FilterOperator.Contains, sValue)
						],
						and: false
					});
				// if (sAmm && sCapitolo) {	
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sAmminVal !== undefined && sAmminVal !== "") {
					fAmm = new Filter("Prctr", FilterOperator.EQ, sAmminVal);
					aFilters.aFilters.push(fAmm);
				}
				if (sCapitoloVal !== undefined && sCapitoloVal !== "") {
					fCap = new Filter("Codicecapitolo", FilterOperator.EQ, sCapitoloVal);
					aFilters.aFilters.push(fCap);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "TitoloFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicetitolo", FilterOperator.Contains, sValue),
							new Filter("Descrtitolo", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "CategoriaFA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicecategoria", FilterOperator.Contains, sValue),
							new Filter("Descrcategoria", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "CE2FA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();
				sCategoriaVal = this.getView().byId("CategoriaFA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codiceclaeco2", FilterOperator.Contains, sValue),
							new Filter("Descrclaesco2", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				if (sCategoriaVal !== undefined && sCategoriaVal !== "") {
					fCat = new Filter("Codicecategoria", FilterOperator.EQ, sCategoriaVal);
					aFilters.aFilters.push(fCat);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "CE3FA") {
				sTitoloVal = this.getView().byId("TitoloFA").getValue();
				sCategoriaVal = this.getView().byId("CategoriaFA").getValue();
				sCE2Val = this.getView().byId("CE2FA").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codiceclaeco3", FilterOperator.Contains, sValue),
							new Filter("Descrclaeco3", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sTitoloVal !== undefined && sTitoloVal !== "") {
					fTit = new Filter("Codicetitolo", FilterOperator.EQ, sTitoloVal);
					aFilters.aFilters.push(fTit);
				}
				if (sCategoriaVal !== undefined && sCategoriaVal !== "") {
					fCat = new Filter("Codicecategoria", FilterOperator.EQ, sCategoriaVal);
					aFilters.aFilters.push(fCat);
				}
				if (sCE2Val !== undefined && sCE2Val !== "") {
					fCE2 = new Filter("Codiceclaeco2", FilterOperator.EQ, sCE2Val);
					aFilters.aFilters.push(fCE2);
				}
				oEvent.getSource().getBinding("items").filter([aFilters]);
			}

			if (inputRef === "IDPropostaFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Idproposta", FilterOperator.Contains, sValue),
							new Filter("Nickname", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "COFOG3FA") {

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

			if (inputRef === "NickNameFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Nickname", FilterOperator.Contains, sValue),
							new Filter("Nickname", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "TcrCFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Numetcrcspe", FilterOperator.Contains, sValue),
							new Filter("Descrestesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "TcrFFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("Numetcrfspe", FilterOperator.Contains, sValue),
							new Filter("Descrestesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "NumAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "AnnoAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "ArtAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "SubArtAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "CommaAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "SubCommaAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "LetteraAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

			if (inputRef === "SubLetteraAutFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}

		},

		onValueHelpConfirm: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var sMissioneValFA, sProgrammaValFA, sAzioneValFA;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val;

			oSelectedItem = oEvent.getParameter("selectedItem");

			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			if (inputRef === "AmmFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("AmmFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "CentroRespFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("CentroRespFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "RagioneriaFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					// this._enableInput("Missione", false);
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("RagioneriaFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "MissioneFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("MissioneFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "ProgrammaFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("MissioneFA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				this._fillInput("MissioneFA", sMissioneValFA);
				this._fillInput("ProgrammaFA", sProgrammaValFA);
			}

			if (inputRef === "AzioneFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("MissioneFA");
					this._resetInput("ProgrammaFA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				sAzioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceazione;
				this._fillInput("MissioneFA", sMissioneValFA);
				this._fillInput("ProgrammaFA", sProgrammaValFA);
				this._fillInput("AzioneFA", sAzioneValFA);
			}

			if (inputRef === "CapitoloFA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("PGFA");
					return;
				}
				this.byId("CapitoloFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "PGFA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CapitoloFA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				var sCapitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicecapitolo;
				var sPGVal = this.getOwnerComponent().getModel().getData(sPath).Codicepg;
				this._fillInput("CapitoloFA", sCapitoloVal);
				this._fillInput("PGFA", sPGVal);
			}

			if (inputRef === "TitoloFA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("TitoloFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "CategoriaFA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE2FA");
					this._resetInput("CE3FA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
			}

			if (inputRef === "CE2FA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE3FA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
				this._fillInput("CE2FA", sCE2Val);
			}

			if (inputRef === "CE3FA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				sCE3Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco3;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
				this._fillInput("CE2FA", sCE2Val);
				this._fillInput("CE3FA", sCE3Val);
			}

			if (inputRef === "IDPropostaFA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("IDPropostaFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "COFOG3FA") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				// var sCofogFAL1 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl1;
				// var sCofogFAL2 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl2;
				// var sCofogFAL3 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl3;
				var sCofogFAID = this.getOwnerComponent().getModel().getData(sPath).Codconcatenato;
				this.byId("COFOG3FA").setValue(sCofogFAID);
			}

			if (inputRef === "NickNameFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("NickNameFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "TcrCFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("TcrCFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "TcrFFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("TcrFFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "NumAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("NumAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "AnnoAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("AnnoAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "ArtAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("ArtAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubArtAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("SubArtAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "CommaAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("CommaAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubCommaAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("SubCommaAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "LetteraAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("LetteraAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubLetteraAutFA") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("SubLetteraAutFA").setValue(oSelectedItem.getTitle());
			}
		},

		onValueHelpClose: function(oEvent, inputRef) {},

		onSuggestionItemSelected: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var oInputAmm = this.getView().byId("Amministrazione");
			var sMissioneVal, sProgrammaVal, sAzioneVal;
			var sCapitoloVal, sPGVal;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val;
			if (inputRef === "AmmFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				this.byId("AmmFA").setValue(oSelectedItem.getProperty("text"));
			}

			if (inputRef === "CentroRespFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oInputAmm = this.getView().byId("AmmFA");
				if (!oSelectedItem & oInputAmm.getEnabled() === "true") {
					this._resetInput("AmmFA");
				}
			}

			if (inputRef === "RagioneriaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("RagioneriaFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "MissioneFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				//this.byId("MissioneFA").setValue(oSelectedItem.getProperty("text"));	
			}

			if (inputRef === "ProgrammaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("MissioneFA");
				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					this._fillInput("MissioneFA", sMissioneVal);
				}
			}

			if (inputRef === "AzioneFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("MissioneFA");
					this._resetInput("ProgrammaFA");
					//this._resetInput("AmmFA");

				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					sProgrammaVal = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
					this._fillInput("MissioneFA", sMissioneVal);
					this._fillInput("ProgrammaFA", sProgrammaVal);
					// this._fillInput("Amministrazione", sAmminVal);
				}
			}

			if (inputRef === "CapitoloFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("PGFA");
					// this._resetInput("idDescrPgFA");
					return;
				}
				this.byId("CapitoloFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "PGFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					//this._resetInput("Amministrazione");
					this._resetInput("CapitoloFA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sCapitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicecapitolo;
				sPGVal = this.getOwnerComponent().getModel().getData(sPath).Codicepg;
				this._fillInput("CapitoloFA", sCapitoloVal);
				this._fillInput("PGFA", sPGVal);
			}

			if (inputRef === "TitoloFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("TitoloFA").setValue(oSelectedItem.getText());
			}

			if (inputRef === "CategoriaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE2FA");
					this._resetInput("CE3FA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				// var sDescTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Descrtitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				// var sDescCatVal = this.getOwnerComponent().getModel().getData(sPath).Descrcategoria;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
			}

			if (inputRef === "CE2FA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE3FA");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
				this._fillInput("CE2FA", sCE2Val);
			}

			if (inputRef === "CE3FA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				sCE3Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco3;
				this._fillInput("TitoloFA", sTitoloVal);
				this._fillInput("CategoriaFA", sCategoriaVal);
				this._fillInput("CE2FA", sCE2Val);
				this._fillInput("CE3FA", sCE3Val);
			}

			if (inputRef === "IDPropostaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("IDPropostaFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "NickNameFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("NickNameFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "TcrCFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("TcrCFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "TcrFFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("TcrFFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "DenominazCapFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("DenominazCapFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "COFOG3FA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				// var sCofogFAL3 = this.getOwnerComponent().getModel().getData(sPath).Codcofogl3;
				var sCofogID = this.getOwnerComponent().getModel().getData(sPath).Codconcatenato;
				this.byId("COFOG3FA").setValue(sCofogID);
			}

			if (inputRef === "DenominazPGFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("DenominazPGFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "NumAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("NumAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "AnnoAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("AnnoAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "ArtAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("ArtAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubArtAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("SubArtAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "CommaAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("CommaAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubCommaAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("SubCommaAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "LetteraAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("LetteraAutFA").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "SubLetteraAutFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("SubLetteraAutFA").setValue(oSelectedItem.getTitle());
			}

		},

		//*********************FINE LOGICHE FILTERBAR: ADATTA FILTRI + CUSTOM POSFIN**************************

		//*********************ONSEARCH FILTERBAR - RIEMPIMENTO TABELLA - LOGICA DINAMICA IN BASE CONTROLLER**********************************

		onSearch: function() {
			this.onSearchTreeTable(true,0);
		},

		onClear: function(oEvent) {
			this._onClearInput(oEvent);
			var oTreeTablePF = this.getView().byId("treeTablePF");
			oTreeTablePF.unbindRows();
		},
		
		onPressPrevTreeTable: function(oEvent){
			var filterMaxRows=	this.filterMaxRows;
			if (filterMaxRows >200){
				this.filterMaxRows = filterMaxRows -200
			}
			this.onSearchTreeTable(false,-200);
		},
		onPressNextTreeTable: function(oEvent){
			var filterMaxRows=	this.filterMaxRows;
			this.filterMaxRows = filterMaxRows  + 200;			
			this.onSearchTreeTable(false, 200);
		},

		/* 
		lt nuova logica fornita da Erminio

		onPressPrevTreeTable: function(oEvent) {
            var filterMaxRows = this.filterMaxRows;
            if (filterMaxRows > 200) {
                this.filterMaxRows = parseInt(filterMaxRows) - 200                
				this.onSearch(false, -200);
            }
        },
        onPressNextTreeTable: function(oEvent) {
            var filterMaxRows = this.filterMaxRows;
            this.filterMaxRows = parseInt(filterMaxRows) + 200;
            this.onSearch(false, 200);
        }, */
        createModeButtonTable: function() {
            var oModel = new JSONModel({
                enabledButtonPrev: false,
                enabledButtonNext: false,
                intialValue: -199,
                beginValueM1: 0,
                beginValueP1: 201,
                finalValue: 400            });
            this.getView().setModel(oModel, "modelIsAfterAvvio");
        },
			
		
		onSearchTreeTable: function(isAvvioButton, pointer){
			var sIdTreeTable="treeTablePF";
			var sIdFilterbar="filterBarPF";
			var sTreeTableBindingPath = "modelTreeTable>/ZES_AVVIOPFSet";
			var oTreeTable = this.getView().byId(sIdTreeTable);
			var oFilterBar = this.getView().byId(sIdFilterbar);
			var aFilterItems = oFilterBar.getFilterGroupItems();
			var aFilters = [];
			//QUANDO SARA' PRONTO IL SERVIZIO, BASTA CHIAMARE IL NAME DI OGNI FILTERGROUPITEM COME LA RELATIVA  
			//PROPRIETA' NELL'ENTITY CHE COMPONE LA TREETABLE PER CREARE PIU' AGEVOLEMNTE I FILTRI DA PASSARE
			aFilters = aFilterItems.map(function(oFilterItem) {
				var sFilterName = oFilterItem.getName();
				var oControl = oFilterBar.determineControlByFilterItem(oFilterItem);
				var sValue;
				if (oControl.getMetadata().getName() === "sap.m.Select") {
					sValue = oControl.getSelectedKey();
				} else if (oControl.getMetadata().getName() === "sap.m.Input") {
					sValue = oControl.getValue();
				} else if (oControl.getMetadata().getName() === "zsap.com.r3.cobi.s4.custposfin.z_s4_zposfin.controls.InputPosizioneFinanziaria") {
					sValue = oControl.getValue();
				} else if (oControl.getMetadata().getName() === "sap.m.ComboBox") {
					sValue = oControl.getSelectedKey("");
				} else if (oControl.getMetadata().getName() === "sap.m.CheckBox") {
					if(oControl.getSelected("")) {
						sValue = "1";
					} else {
						sValue = "0";
					}
				}
				if (sValue !== undefined /* & sValue !== "" */) {
					var oFilter;
					switch(sValue){
						case "":
							if(sFilterName === "FlagCronoprogramma"){
								oFilter = new sap.ui.model.Filter(sFilterName, "EQ", "ALL");
								break;
							};
							return oFilter
							
						default: 
							oFilter = new sap.ui.model.Filter(sFilterName, "EQ", sValue);
							break;
					}
					return oFilter;
					
				}
			});
			// console.log(aFilters);
			this._remove(aFilters, undefined);
			
			if(isAvvioButton){
				this.filterMaxRows=200;
			}
		
			var oFilterRows = new sap.ui.model.Filter("Maxrows", "EQ", this.filterMaxRows);

			aFilters.push(oFilterRows);
	

			oTreeTable.bindRows({
				path: sTreeTableBindingPath,
				parameters: {
					countMode: "Inline",
					collapseRecursive: false,
					operationMode: "Client", // necessario per ricostruire la gerarchia lato client
					// se le annotazioni sono gestite su FE tramite treeAnnotationProperties
					treeAnnotationProperties: {
						hierarchyLevelFor: "HierarchyLevel",
						hierarchyNodeFor: "Node",
						hierarchyParentNodeFor: "ParentNodeId",
						hierarchyDrillStateFor: "DrillState"
					},
					useServersideApplicationFilters: true // necessario in combinazione con operationMode : 'Client' per inviare i filtri al BE ($filter)
				},
				filters: [aFilters]
			});

			var previewModel = this.getView().getModel("modelIsAfterAvvio").oData;

			if(isAvvioButton){
				previewModel.enabledButtonPrev = false;
				previewModel.enabledButtonNext = true;
				previewModel.intialValue = -199;
				previewModel.beginValueM1 = 0;
				previewModel.beginValueP1 = 201;
				previewModel.finalValue = 400;
			}else{
				previewModel.intialValue = previewModel.intialValue+pointer;
				previewModel.beginValueM1 = previewModel.beginValueM1+pointer;
				previewModel.beginValueP1 = previewModel.beginValueP1+pointer;
				previewModel.finalValue = previewModel.finalValue+pointer;
				if(previewModel.intialValue === -199){
					previewModel.enabledButtonPrev = false;
					previewModel.enabledButtonNext = true;
				
				}else{
					previewModel.enabledButtonPrev = true;
					previewModel.enabledButtonNext = true;
				}
			}
			
			
			var oModelData = new JSONModel({
				enabledButtonPrev:previewModel.enabledButtonPrev, 
				enabledButtonNext:previewModel.enabledButtonNext,
				intialValue:previewModel.intialValue,
				beginValueM1:previewModel.beginValueM1,
				beginValueP1:previewModel.beginValueP1,
				finalValue:previewModel.finalValue
				});
			//var oModelAvvio=this.getView().getModel("modelIsAfterAvvio");
			this.getView().setModel(oModelData,"modelIsAfterAvvio")
			//oModelAvvio.setData(oModelData);
			//oModelAvvio.refresh();
			
			
			
			//Azzera la selezione delle righe
			var oItems = oTreeTable.getRows();
			for (var j = 0; j < oItems.length; j++) {
				oItems[j].getAggregation("cells")[0].setSelected(false);
			}
		},

		onSearchTreeTableNew: async function(isAvvioButton, pointer) {
            //this._onSearchFbTreeT("treeTableID", "filterBar2", "modelTreeTable>/ZES_AVVIOIDSet");            
			var oTreeTable = this.getView().byId("treeTableID");
            var oFilterBar = this.getView().byId("idBar");
            var aFilters = [];
            aFilters = this.getFilter(aFilters);
            aFilters = this.addCheckFilter(aFilters);
            if (isAvvioButton) {
                this.filterMaxRows = "200";
            }
            var oFilterRows = new sap.ui.model.Filter("Maxrows", sap.ui.model.FilterOperator.BT, "200", (parseInt(this.filterMaxRows) - 200).toString());
            aFilters.push(oFilterRows);
            BusyIndicator.show();
            try {
                // var aRes = await this.readFromDb("4", "/ZES_AVVIOIDSet", aFilters, [], "");                
				// this.getView().setModel(new JSONModel(aRes),"modelTreeTableProposta");                
				oTreeTable.bindRows({
                    path: "modelTreeTableProposta>/ZES_AVVIOIDSet",
                    parameters: {
                        countMode: "Inline",
                        collapseRecursive: false,
                        operationMode: "Client",// necessario per ricostruire la gerarchia lato client                        
						// se le annotazioni sono gestite su FE tramite treeAnnotationProperties                        
						treeAnnotationProperties: {
                            hierarchyLevelFor: "HierarchyLevel",
                            hierarchyNodeFor: "Node",
                            hierarchyParentNodeFor: "ParentNodeId",
                            hierarchyDrillStateFor: "DrillState"                        },
                        useServersideApplicationFilters: true,
                    },
                    filters: [aFilters],
                    events: {
                        dataReceived: function(oParameters) {
                            BusyIndicator.hide();
                        }.bind(this)
                    }
                });
                var previewModel = this.getView().getModel("modelIsAfterAvvio").oData;
                if (isAvvioButton) {
                    previewModel.enabledButtonPrev = false;
                    previewModel.enabledButtonNext = true;
                    previewModel.intialValue = -199;
                    previewModel.beginValueM1 = 0;
                    previewModel.beginValueP1 = 201;
                    previewModel.finalValue = 400;
                } else {
                    previewModel.intialValue = previewModel.intialValue + pointer;
                    previewModel.beginValueM1 = previewModel.beginValueM1 + pointer;
                    previewModel.beginValueP1 = previewModel.beginValueP1 + pointer;
                    previewModel.finalValue = previewModel.finalValue + pointer;
                    if (previewModel.intialValue === -199) {
                        previewModel.enabledButtonPrev = false;
                        previewModel.enabledButtonNext = true;
                    } else {
                        previewModel.enabledButtonPrev = true;
                        previewModel.enabledButtonNext = true;
                    }
                }
                this.getView().getModel("modelIsAfterAvvio").refresh();
            } catch (e) {
            }
        }

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosizioneFinanziaria
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosizioneFinanziaria
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.PosizioneFinanziaria
		 */
		//	onExit: function() {
		//
		//	}

	});

});