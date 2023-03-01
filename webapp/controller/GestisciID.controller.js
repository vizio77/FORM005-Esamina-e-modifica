sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageBox",
	"../util/formatter",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/BusyIndicator",
	"zsap/com/r3/cobi/s4/esamodModSpesePosFin/model/models",
	"zsap/com/r3/cobi/s4/custposfin/z_s4_zposfinlink/controls/LinkPosizioneFinanziaria"
], function(Controller, BaseController, Fragment, Filter, FilterOperator, syncStyleClass, MessageBox, formatter, JSONModel, BusyIndicator,
	models, LinkPosizioneFinanziaria) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.GestisciID", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.GestisciID
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("GestisciID").attachPatternMatched(this._onRouteMatched, this);
			this.oDataModel = this.getModel();
			this.oResourceBundle = this.getResourceBundle();
			this.Keycode = "";

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		_onRouteMatched: function(oEvent) {

			if (oEvent.getParameters().arguments.ID.toUpperCase() === "GESTISCIPROPOSTA") {
				this._gestisciID();
			} else if (oEvent.getParameters().arguments.ID.toUpperCase() === "ASSOCIAPROPOSTA") {
				this._associaID();
			} else if (oEvent.getParameters().arguments.ID.toUpperCase() === "CREAPROPOSTA" ||
				oEvent.getParameters().arguments.ID.toUpperCase() === "RIMODULAZIONIVERTICALI") {
				this._creaID();
			}

			//reset dei campi
			var inputProposta = this.getView().byId("InputNoEdit");
			if (inputProposta) {
				inputProposta.setValue("");
			}
			//this._resetInput("idNickName");
			var inputIdNickName = this.getView().byId("idNickName");
			if (inputIdNickName) {
				inputIdNickName.setValue("");
			}
			//this._resetInput("idIter");
			var inputIdIter = this.getView().byId("idIter");
			if (inputIdIter) {
				inputIdIter.setValue("");
			}
			//this._resetInput("idNota");
			var inputIdNota = this.getView().byId("idNota");
			if (inputIdNota) {
				inputIdNota.setValue("");
			}

			var hashRouting = this.getRouter().getHashChanger().hash;
			var btnEliminaProp = this.getView().byId("btnEliminaProposta");
			if (hashRouting === "GestisciID/GestisciProposta") {
				btnEliminaProp.setVisible(true);
			} else if (hashRouting === "GestisciID/CreaProposta") {
				btnEliminaProp.setVisible(false);
			}
		},

		_gestisciID: function() {
			var oPanel = this.getView().byId("idPanelForm");
			oPanel.setHeaderText("Gestisci Proposta");
			var oColTogli = this.getView().byId("colTogli");
			oColTogli.setVisible(true);
		},

		_associaID: function() {
			var oPanel = this.getView().byId("idPanelForm");
			oPanel.setHeaderText("Associa Proposta");
			var oColTogli = this.getView().byId("colTogli");
			oColTogli.setVisible(false);
			var oBtnAggiungi = this.getView().byId("idBtnAggiungi");
			oBtnAggiungi.setVisible(true);
		},

		_creaID: function() {
			var oPanel = this.getView().byId("idPanelForm");
			oPanel.setHeaderText("Crea Proposta");
			var oColTogli = this.getView().byId("colTogli");
			oColTogli.setVisible(true);
		},
		//***********************METODI CONO VISIBILITA'***********************

		_AmminRead: function() {
			var that = this;
			that.getView().byId("Amministrazione").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_AMMIN", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("Amministrazione", false, response.results[0].Prctr);
					}
					if (response.results.length > 1) {
						that.getView().getModel("modelConoVisibilita").setProperty("/ZCA_AF_AMMIN", response.results);
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
					//	MessageBox.error(errorResponse);
				}
			});
		},

		_CdrRead: function() {
			var that = this;
			that.getView().byId("CentroResp").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_CDR", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("CentroResp", false, response.results[0].CodiceCdr);
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
			that.getView().byId("Ragioneria").setEnabled(true);
			this.oDataModel.read("/ZCA_AF_RAGIONERIA", {
				success: function(response) {
					if (response.results.length === 1) {
						that._fillDisableInput("Ragioneria", false, response.results[0].CodiceRagioneria);
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

		onPressAggiungiPosFin: function(oEvent) {
			var oData = this.getView().getModel("modelConoVisibilita").getData();

			var sBtn = oEvent.getSource();
			var oView = this.getView();

			if (!this.idDialogGestisciIDPosFinFrag) {
				this.idDialogGestisciIDPosFinFrag = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.GestisciIDPosFin",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			this.idDialogGestisciIDPosFinFrag.then(function(oDialog) {
				//oDialog.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value

				oDialog.open(sBtn);
			});
			// oView.addDependent(this.idDialogGestisciIDPosFinFrag);
			if (oData.ZCA_AF_AMMIN === "" || oData.ZCA_AF_CDR === "" || oData.ZCA_AF_RAGIONERIA === "") {
				this._AmminRead();
				this._CdrRead();
				this._RagioneriaRead();
			} else {
				return;
			}
		},

		onCloseGestisciIDPosFin: function() {
			var oDialog = this.getView().byId("idDialogGestisciIDPosFin");
			oDialog.close();
		},

		//*******************************LOGICA PER AGGIUNGERE POSFIN************************************
		_remove: function(arr, what) {
			var found = arr.indexOf(what);

			while (found !== -1) {
				arr.splice(found, 1);
				found = arr.indexOf(what);
			}
		},

		onSearch: function() {
			var oTable = this.getView().byId("idTableRisultatiRicercaPosFin");
			var oFilterBar = this.getView().byId("idfilterBarFragAggiungiPFGestisciId");
			// var oTemplate = this.getView().byId("idColTemplateFrag").clone();
			var aFilterItems = oFilterBar.getFilterGroupItems();
			var aFilters = [];

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
				}
				/*else if (oControl.getMetadata().getName() === "sap.m.CheckBox") {
					if(oControl.getSelected("")) {
						sValue = "1";
					} else {
						sValue = "0";
					}
				}*/
				if (sValue !== undefined & sValue !== "") {
					var oFilter = new sap.ui.model.Filter(sFilterName, "EQ", sValue);
					return oFilter;
				}
			});
			// console.log(aFilters);
			this._remove(aFilters, undefined);

			var sPath = "ZSS4_COBI_PRSP_ESAMOD_SRV>/ZES_POSIZIONE_FINANZIARIASet";

			// var that = this;
			var oTemplate = new sap.m.ColumnListItem({
				vAlign: "Middle",
				cells: [
					new LinkPosizioneFinanziaria({
						text: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Fipex}",
						// id:"idLinkPosfinRV",
						fikrs: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Fikrs}",
						anno: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Anno}",
						fase: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Fase}",
						reale: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Reale}",
						versione: "{ZSS4_COBI_PRSP_ESAMOD_SRV>Versione}",
						fipex: "{= ${ZSS4_COBI_PRSP_ESAMOD_SRV>Fipex}.replaceAll('.', '')}",
						datbis: "{= ${ZSS4_COBI_PRSP_ESAMOD_SRV>Datbis}.replaceAll('-', '')}"
					})
				]
			});
			// oTable.bindAggregation("items", sPath, oTemplate, aFilters);
			oTable.bindAggregation("items", {
				path: sPath,
				template: oTemplate,
				filters: aFilters
			});

			//PER USARE IL TEMPLATE NELLA VIEW --> QUANDO SI USA IL CLONE()
			/*if(!this.oTemplate){
			this.oTemplate = this.getView().byId("idColTemplateFrag").clone();}
			var sPath = "ZSS4_COBI_PRSP_ESAMOD_SRV>/ZES_POSIZIONE_FINANZIARIASet";

			oTable.bindAggregation("items", {
				path: sPath,
				template: this.oTemplate,
				templateShareable: true,
				filters: aFilters
			});
			*/
		},

		onClear: function(oEvent) {
			this._onClearInput(oEvent);
			var oTable = this.getView().byId("idTableRisultatiRicercaPosFin");
			oTable.unbindAggregation("items");

		},

		//****************TRASPORTO POSFIN SELEZIONATE NELLA TABELLA DELLA PAGINA************************

		onPressSelezionaPosFin: function() {
			var oTableFrag = this.getView().byId("idTableRisultatiRicercaPosFin");
			var itemIndex = oTableFrag.indexOfItem(oTableFrag.getSelectedItem());
			var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");

			var aPosFin = [];
			if (itemIndex !== -1) {

				var oItems = oTableFrag.getSelectedItems();
				for (var i = 0; i < oItems.length; i++) {
					var sAnno = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Anno");
					var sFikrs = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Fikrs");
					var sFase = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Fase");
					var sReale = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Reale");
					var sVersione = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Versione");
					var sFipex = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Fipex");
					var sDatbis = oItems[i].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getProperty("Datbis");

					/*if(sFipex) {
						sFipex = sFipex.replaceAll(".", "");
					}*/
					if (sDatbis) {
						sDatbis = this._convertStringTime(sDatbis);
						sDatbis = sDatbis.replaceAll("-", "");
					}

					var oObj = {
						Anno: sAnno,
						Fikrs: sFikrs,
						Fase: sFase,
						Reale: sReale,
						Versione: sVersione,
						Fipex: sFipex,
						Datbis: sDatbis,
						Visible: true
					};
					aPosFin.push(oObj);
					var oldDataPosFin = oModelTablePageGestisciID.getData();
					var newDataPosFin = [];
					if (oldDataPosFin.length > 0) {
						newDataPosFin = oldDataPosFin;
						var found, newElem, oldElem;
						for (var cont = 0; cont < aPosFin.length; cont++) {
							found = false;
							newElem = aPosFin[cont];
							for (var j = 0; j < oldDataPosFin.length; j++) {
								oldElem = oldDataPosFin[j];
								if (oldElem.Fipex === newElem.Fipex) {
									found = true;
								}
							}
							if (!found) {
								newDataPosFin.push(newElem);
							}
						}
					} else {
						newDataPosFin = aPosFin;
					}

					oModelTablePageGestisciID.setData(newDataPosFin);
					oModelTablePageGestisciID.refresh();

					//COSTRUISCO DINAMICAMENTE LA TABELLA DELLA VIEW
					var oTablePage = this.getView().byId("idTablePosFinGestisciID");
					var that = this;
					var oTemplate = new sap.m.ColumnListItem({
						vAlign: "Middle",
						cells: [
							new LinkPosizioneFinanziaria({
								text: "{modelTableGestisciID>Fipex}",
								// id:"idLinkPosfinRV",
								fikrs: "{modelTableGestisciID>Fikrs}",
								anno: "{modelTableGestisciID>Anno}",
								fase: "{modelTableGestisciID>Fase}",
								reale: "{modelTableGestisciID>Reale}",
								versione: "{modelTableGestisciID>Versione}",
								fipex: "{modelTableGestisciID>Fipex}",
								datbis: "{modelTableGestisciID>Datbis}"
							}),
							new sap.m.Button({
								type: "Transparent",
								tooltip: "{i18n>Elimina}",
								icon: "sap-icon://delete",
								press: [that.onPressEliminaPFGestisciID, that],
								visible: "{modelTableGestisciID>Visible}"
							})
						]
					});
					oTablePage.bindAggregation("items", "modelTableGestisciID>/", oTemplate);
					this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", true);
					//Pulisco la table e i filtri
					this._onClearInputFrag();
					oTableFrag.unbindAggregation("items");
					this.onCloseGestisciIDPosFin();
				}
			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaPFGestisciID"));
			}
		},

		_onClearInputFrag: function(oEvent) {
			//this._onClearInput();
			var aSelectionsSets = this.getView().byId("idfilterBarFragAggiungiPFGestisciId").getFilterGroupItems();
			//this.clearGlobalModel();
			for (var i = 0; i < aSelectionsSets.length; i++) {
				var oControl = this.getView().byId(aSelectionsSets[i].getControl().getId());
				// ;
				//oControl.setValue("");
				if (oControl.getMetadata().getName() === "sap.m.ComboBox") {
					oControl.setSelectedKey("");
				}

				if (oControl.getMetadata().getName() === "sap.m.Input") {
					oControl.setValue("");
				}

				if (oControl.getMetadata().getName() === "sap.m.CheckBox") {
					oControl.setSelected(false);
				}
			}
		},

		onPressEliminaPFGestisciID: function(e) {
			var oTable = this.getView().byId("idTablePosFinGestisciID");
			var oModel = this.getOwnerComponent().getModel("modelTableGestisciID");
			var sPath = e.getSource().getBindingContext("modelTableGestisciID").getPath();
			sPath = sPath.substring(sPath.lastIndexOf("/") + 1);

			var aObj = oModel.getData();
			aObj.splice(sPath, 1);
			// oModel.setProperty("RIMHTORIMI.results", aObj);
			oTable.getBinding("items").refresh();
			if (aObj.length === 0) {
				this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", false);
				// this.getView().byId("idPropostaCreaRV").setValue("");
				// this.getView().byId("idPropostaCreaRV").setEnabled(true);
				// this.getView().byId("idAnnoCreaRV").setValue("");
				// this.getView().byId("idAnnoCreaRV").setEnabled(true);
			}
			var listTable = oTable.getBinding("items").oList;
		},

		//**************************BTN CREA NOTA********************************************

		handlePressResettaNota: function() {
			this.getView().byId("idInputScegliNoteIDProposta").setValue(null);
				this.getView().byId("idInputScegliNoteIDProposta").setEditable(true);
			this.getView().byId("idNota").setEditable(true).setValue("");
			this.getView().byId("idNota").setEnabled(true);

		},
		onLiveWriteNota: function(oEvent) {
			var sText = oEvent.getParameter("newValue");
			if (sText.length > 0) {
				this.getView().byId("idInputScegliNoteIDProposta").setValue(null);
				this.getView().byId("idInputScegliNoteIDProposta").setEditable(false);

			}
		},

		//*************************VALUEHELPREQUEST SCEGLI NOTA******************************

		handleValueHelpScegliNota: function(oEvent) {
			var oView = this.oView,
				myTemplate,
				myPath,
				searchField = [],
				that = this,
				aFilter = [];

			var sAmmin = this.getView().getModel("modelGestisciProposta").getData().Prctr;
			var sInputValue = oEvent.getSource().getValue();
			aFilter.push(new Filter("Prctr", sap.ui.model.FilterOperator.EQ, sAmmin));
			aFilter.push(new Filter("TestoNota", sap.ui.model.FilterOperator.Contains, sInputValue));
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			//this.getView().setModel(new JSONModel(oDataModel), "oMatchCodeModelTable");
			var sTitleDialog = "{i18nL>cercaNota}";
			oDataModel.read("/ZES_ELENCO_NOTE", {
				filters: aFilter,
				success: function(response) {
					var oListaOggetti = response.results;
					this.getView().setModel(new JSONModel(oListaOggetti), "oMatchcodeModel");
				}.bind(this),
				error: function(errorResponse) {
					MessageBox.error(errorResponse);

				}
			});

			myPath = "oMatchcodeModel>/";
			searchField.push("IdNota", "TestoNota");
			myTemplate = new sap.m.StandardListItem({
				title: "{oMatchcodeModel>IdNota}",
				description: "{oMatchcodeModel>TestoNota}"
			});

			var oValueHelpDialog = new sap.m.SelectDialog({
				title: sTitleDialog,
				items: {
					path: myPath,
					template: myTemplate
				},
				contentHeight: "60%",
				confirm: function(oConfirm) {
					var sIdNota = oConfirm.getParameter("selectedItem").getTitle();
					var sInputNota = that.getView().byId("idInputScegliNoteIDProposta");
					sInputNota.setValue(sIdNota);
					var sTestoNota = oConfirm.getParameter("selectedItem").getDescription();
					var sTextArea = that.getView().byId("idNota");
					sTextArea.setValue(sTestoNota);
					that.getView().byId("idNota").setEnabled(false);
				},
				search: function(oEvent) {
					var sString = oEvent.getParameter("value");
					var aVal = "TestoNota";
					var oFilter = new Filter(aVal, FilterOperator.Contains, sString);
					oEvent.getSource().getBinding("items").filter(oFilter);
				},
				cancel: function(oCancel) {}

			});

			//gestione emphasized dei bottoni
			var oButton = oValueHelpDialog.getAggregation("_dialog").getEndButton();
			if (oButton) {
				sap.ui.getCore().byId(oButton.sId).setType("Emphasized");
			}
			var oButton = oValueHelpDialog.getAggregation("_dialog").getBeginButton();
			if (oButton) {
				sap.ui.getCore().byId(oButton.sId).setType("Emphasized");
			}
			oView.addDependent(oValueHelpDialog);
			// this._closeBusyDialog();
			oValueHelpDialog.open();
		},
		_getObjectList: function(sTitolo, sDesc) {
			var aData = this.getView().getModel("oDataModel").getData(),
				aObject = [];
			for (var i = 0; i < aData.length; i++) {
				var oObject = {
					"Valore": aData[i][sTitolo],
					"Descrizione": aData[i][sDesc]
				};
				aObject.push(oObject);
			}
			return aObject;
		},

		//**************************SUBMIT SCEGLI NOTA***************************************

		onSubmitIdNota: function() {
			var sIdNota = this.getView().byId("idInputScegliNoteIDProposta").getValue();
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			if (sIdNota !== "") {
				var aFilters = [];
				var fIdNota = new Filter("IdNota", FilterOperator.EQ, sIdNota);
				aFilters.push(fIdNota);
				oDataModel.read("/ZES_ELENCO_NOTE", {
					filters: aFilters,
					success: function(response) {
						if (response.results.length > 0) {
							var sTestoNota = response.results[0].TestoNota;
							var sTextArea = this.getView().byId("idNota");
							sTextArea.setValue(sTestoNota);
							sTextArea.setEditable(false);
						} else {
							MessageBox.error("Codice non presente");
							var sTextArea = this.getView().byId("idNota");
							sTextArea.setValue("");
							sTextArea.setEditable(false);
						}
					}.bind(this),
					error: function(errorResponse) {
						MessageBox.error(errorResponse);
					}
				});
			} else {
				MessageBox.error("Inserire un codice");
				var sTextArea = this.getView().byId("idNota");
				sTextArea.setValue("");
				sTextArea.setEditable(false);
			}
		},

		/*
		//**************************BINDING SCEGLI ID NOTA***********************************

		onSelectionIdNota: function() {
			var sIdNota = this.getView().byId("idInputScegliNoteIDProposta").getSelectedItem().getProperty("key");
			var aFilters = [];
			var fIdNota = new Filter("IdNota", FilterOperator.EQ, sIdNota);
			aFilters.push(fIdNota);
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			oDataModel.read("/ZES_ELENCO_NOTE", {
				filters: aFilters,
				success: function(response) {
					var sTestoNota = response.results[0].TestoNota;
					var sTextArea = this.getView().byId("idNota");
					sTextArea.setValue(sTestoNota);
					sTextArea.setEditable(false);
				}.bind(this),
				error: function(errorResponse) {
					MessageBox.error(errorResponse);
				}
			});
		},
		*/

		//**************************ELIMINA PROPOSTA*********************************************

		onPressEliminaProposta: function() {
			var oModelGestisciProposta = {};
			oModelGestisciProposta = this.getView().getModel("modelPathGestisciPropostaView").getData("dataGestisciProposta").dataGestisciProposta;
			var sKeycodepr = oModelGestisciProposta.Keycode;
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sIdProposta = this.getView().byId("InputNoEdit").getValue();
			MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoEliminaProposta").replaceAll("{0}",
				sIdProposta), {
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK,
				onClose: function(sAction) {
					if (sAction === MessageBox.Action.OK) {
						oModel.remove("/PropostaSet('" + sKeycodepr + "')", {
							method: "DELETE",
							success: function(data) {
								MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("MessagePropostaEliminataSuccess"), {
									onClose: function() {
										this.onNavBack();
										//refresh dei modelli
										var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
										oModelTablePageGestisciID.setData([]);
										oModelTablePageGestisciID.refresh();
									}.bind(this)
								});
							},
							error: function(oError) {
								MessageBox.error(oError.responseText);
							}
						});
					}

				}
			});
		},

		//***************************LOGICA SALVA ***********************************************

		onPressSalva: function() {
			BusyIndicator.show(0);

			var oTable = this.getView().byId("idTablePosFinGestisciID");
			var aItems = oTable.getItems();
			var aFipex = [];
			var actualPositions = [];
			for (var i = 0; i < aItems.length; i++) {
				var sFipex = aItems[i].getBindingContext("modelTableGestisciID").getProperty("Fipex");
				var dataPos = aItems[i].getBindingContext("modelTableGestisciID").getModel().getData();
				actualPositions = actualPositions.concat(dataPos);
				var oObjPosFin = {
					Fipex: sFipex
				};
				aFipex.push(oObjPosFin);
			}

			//'GestisciID/CreaProposta'
			var hashRouting = this.getRouter().getHashChanger().hash;

			if (aItems.length >= 1) {

				if (hashRouting === "GestisciID/GestisciProposta") {
					this._onPressSalvaGestisciProposta(aFipex);
				} else if (hashRouting === "GestisciID/CreaProposta") {
					this._onPressSalvaCreaProposta(aFipex);
				}

			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaPagGestisciID"));
			}
		},

		_onPressSalvaGestisciProposta: function(aFipex) {
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			BusyIndicator.show(0);
			var sIdProposta = this.getView().byId("InputNoEdit").getValue();
			var sNickname = this.getView().byId("idNickName").getValue();

			var sTestoNota = this.getView().byId("idNota").getValue();
			var oModelGestisciProposta = {};

			oModelGestisciProposta = this.getView().getModel("modelPathGestisciPropostaView").getData("dataGestisciProposta").dataGestisciProposta;
			var oldPositions = this.getView().getModel("modelPathGestisciPropostaView").getData("dataGestisciProposta").aPosFin;
			//if(!!oModelGestisciProposta){
			// aFipex

			var sCodIter = oModelGestisciProposta.Iter;
			var sKeycodepr = oModelGestisciProposta.Keycode;
			//LOGICA POST SALVATAGGIO
			var oObjGestisci = {
				Eos: "S",
				Idproposta: sIdProposta,
				Keycodepr: sKeycodepr,
				Nickname: sNickname,
				Iter: sCodIter,
				Testonota: sTestoNota,
				GestPropToPosFinNav: []
			};

			var managedPositions = this._managePositions(aFipex, oldPositions);
			oObjGestisci.GestPropToPosFinNav = managedPositions;

			var oModelGenIdpro = models.getModelDefaultGeneraIdProposta();
			var oData = oModelGenIdpro.getData();
			oObjGestisci.Fikrs = oData.Fikrs;
			oObjGestisci.Anno = oData.Anno;
			oObjGestisci.Fase = oData.Fase;
			oObjGestisci.Reale = oData.Reale;
			oObjGestisci.Versione = oData.Versione;
			oObjGestisci.Prctr = oData.Prctr;
			//(Keycodepr='" + sKeycodepr + "')
			oModel.create("/GestisciPropSet", oObjGestisci, {
				//filters: aFilters,
				success: function(oDati, oResponse) {
					BusyIndicator.hide();
					this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", false);

					MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaSuccessPagGestisciID"), {
						onClose: function() {
							this.onNavBack();
							var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
							oModelTablePageGestisciID.setData([]);
							oModelTablePageGestisciID.refresh();
						}.bind(this)
					});

				}.bind(this),
				error: function(errorResponse) {
					BusyIndicator.hide();
					MessageBox.error(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaErrorPagGestisciID"), {
						onClose: function() {
							this.onNavBack();
							var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
							oModelTablePageGestisciID.setData([]);
							oModelTablePageGestisciID.refresh();
						}.bind(this)
					});
				}.bind(this)
			});
		},

		_managePositions: function(actualPositions, oldPositions) {
			var newArr = [],
				found, actual, old;
			for (var i = 0; i < actualPositions.length; i++) {
				actual = actualPositions[i];
				found = false;
				for (var j = 0; j < oldPositions.length; j++) {
					old = oldPositions[j];
					if (actual.Fipex === old.Fipex) {
						found = true;
					}
				}
				if (!found) {
					var newItem = {};
					newItem.Flmod = "I";
					newItem.Fipex = actual.Fipex;
					newArr.push(newItem);
				}
			}

			for (var i = 0; i < oldPositions.length; i++) {
				old = oldPositions[i];
				found = false;
				for (var j = 0; j < actualPositions.length; j++) {
					actual = actualPositions[j];
					if (actual.Fipex === old.Fipex) {
						found = true;
					}
				}
				if (!found) {
					var newItem = {};
					newItem.Flmod = "D";
					newItem.Fipex = old.Fipex;
					newArr.push(newItem);
				}
			}

			return newArr;
		},

		_onPressSalvaCreaProposta: function(aFipex) {
			BusyIndicator.show(0);
			var sIdProposta = this.getView().byId("InputNoEdit").getValue();
			var sNickname = this.getView().byId("idNickName").getValue();
			var sCodIter = this.getView().byId("idIter").getSelectedKey();
			var idNotaStandard = this.getView().byId("idInputScegliNoteIDProposta").getSelectedKey();
			var sTestoNota = this.getView().byId("idNota").getValue();
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			var oObj = {
				Eos: "S",
				Idproposta: sIdProposta,
				Keycodepr: this.Keycode,
				Nickname: sNickname,
				Iter: sCodIter,
				Testonota: sTestoNota,
				Idnota: idNotaStandard
			};
			//AGGIUNGERE DEEP PER POSFIN APPENA PRONTO ODATA
			oObj.PropostaToPosFinNav = aFipex;
			var oModelGenIdpro = models.getModelDefaultGeneraIdProposta();
			var oData = oModelGenIdpro.getData();
			oObj.Fikrs = oData.Fikrs;
			oObj.Anno = oData.Anno;
			oObj.Fase = oData.Fase;
			oObj.Reale = oData.Reale;
			oObj.Versione = oData.Versione;
			oObj.Prctr = oData.Prctr;

			oModel.create("/PropostaSet", oObj, {
				success: function(oDati, oResponse) {
					BusyIndicator.hide();
					//console.log(oDati);
					MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaSuccessPagGestisciID"), {
						onClose: function() {
							this.onNavBack();
							var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
							oModelTablePageGestisciID.setData([]);
							oModelTablePageGestisciID.refresh();
						}.bind(this)
					});
					this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", false);
				}.bind(this),
				error: function(errorResponse) {
					BusyIndicator.hide();
					MessageBox.error(that.getView().getModel("i18n").getResourceBundle().getText("MBTastoSalvaErrorPagGestisciID"), {
						onClose: function() {
							this.onNavBack();
							var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
							oModelTablePageGestisciID.setData([]);
							oModelTablePageGestisciID.refresh();
						}.bind(this)
					});
				}.bind(this)
			});
		},

		//***********************GESTIONE MENU PROPOSTA************************************************

		handlePressOpenMenu: function(oEvent) {
			if (this.getView().byId("InputNoEdit").getValue()) {
				//alert("Cambiare Proposta? Se si la proposta attualmente bloccato viene sbloccata.");
			}
			var oButton = oEvent.getSource();
			var oView = this.getView();
			var that = this;
			// create menu only once
			if (!this._menu) {
				this._menu = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.GestisciID_idPropostaMenu",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			// ACTIONS REPEATED EVERY TIME
			this._menu.then(function(oDialog) {
				//oDialog.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value
				var eDock = sap.ui.core.Popup.Dock;
				oDialog.open(that._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

				var sTitle = that.getView().byId("idPanelForm").getHeaderText();
				var oItemMenuIdEsistente = oDialog.getAggregation("items")[0];
				var oItemMenuIdNuovo = oDialog.getAggregation("items")[1];
				if (sTitle.toUpperCase() === "CREA PROPOSTA") {
					oItemMenuIdEsistente.setVisible(false);
					oItemMenuIdNuovo.setVisible(true);
				}
				if (sTitle.toUpperCase() === "ASSOCIA PROPOSTA") {
					oItemMenuIdEsistente.setVisible(true);
					oItemMenuIdNuovo.setVisible(true);
				}
				if (sTitle.toUpperCase() === "GESTISCI PROPOSTA") {
					oItemMenuIdEsistente.setVisible(true);
					oItemMenuIdNuovo.setVisible(false);
				}
				oDialog.open(oButton);
			});
		},

		handleMenuItemPress: function(oEvent) {
			var optionPressed = oEvent.getParameter("item").getText();
			var oButton = oEvent.getSource();
			var oView = this.getView();
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sIdProposta = this.getView().byId("InputNoEdit").getValue();
			var that = this;
			//CREA IL DIALOG UNA SOLA VOLTA
			if (!this._optionIdProposta) {
				this._optionIdProposta = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.GestisciID_inputIDProposta",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
			this._optionIdProposta.then(function(oDialog) {
				//oDialog.getBinding("items");
				// Open ValueHelpDialog filtered by the input's value

				if (optionPressed.toUpperCase() === "SCEGLI PROPOSTA ESISTENTE") {
					if (!sIdProposta) {
						that.getView().byId("IdProposta").setValue("");
						that.getView().byId("IdProposta").setShowValueHelp(true);
						that.getView().byId("IdProposta").setEnabled(true);
						that.getView().byId("btnlockId").setText("Ok");
						oDialog.open(oButton);
					} else {
						MessageBox.warning(that.oResourceBundle.getText("MBCambioNumProposta"), {
							icon: MessageBox.Icon.WARNING,
							title: "Cambio Proposta",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.NO,
							onClose: function(oAction) {
								if (oAction === MessageBox.Action.YES) {
									//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
									//____________
									that.getView().byId("IdProposta").setValue("");
									that.getView().byId("IdProposta").setShowValueHelp(true);
									that.getView().byId("IdProposta").setEnabled(true);
									that.getView().byId("btnlockId").setText("Ok");

									oDialog.open(oButton);
								}
							}
						});
					}
				}
				if (optionPressed.toUpperCase() === "INSERISCI PROPOSTA MANUALMENTE") {
					if (!sIdProposta) {
						that.getView().byId("IdProposta").setEnabled(true);
						that.getView().byId("IdProposta").setValue("");
						that.getView().byId("IdProposta").setShowValueHelp(false);
						that.getView().byId("btnlockId").setText("Scegli");
						oDialog.open(oButton);
					} else {
						MessageBox.warning(that.oResourceBundle.getText("MBCambioNumProposta"), {
							icon: MessageBox.Icon.WARNING,
							title: "Cambio Proposta",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.NO,
							onClose: function(oAction) {
								if (oAction === MessageBox.Action.YES) {
									//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
									//____________
									that.getView().byId("InputNoEdit").setValue("");
									that.getView().byId("idNickName").setValue("");
									that.getView().byId("idNota").setValue("");
									that.getView().byId("idIter").setSelectedItem(null);
									that.getView().byId("idTablePosFinGestisciID").unbindAggregation("items");
									that.getView().byId("btnlockId").setText("Scegli");

									oDialog.open(oButton);
								}
							}
						});
					}
				}
				if (optionPressed.toUpperCase() === "GENERA PROPOSTA AUTOMATICAMENTE") {
					var oModel = models.getModelDefaultGeneraIdProposta();
					var oData = oModel.getData();
					// var listFilters = [];
					// listFilters.push(new Filter("Fikrs", FilterOperator.EQ, oData.Fikrs));
					// listFilters.push(new Filter("Anno", FilterOperator.EQ, oData.Anno));
					// listFilters.push(new Filter("Fase", FilterOperator.EQ, oData.Fase));
					// listFilters.push(new Filter("Reale", FilterOperator.EQ, oData.Reale));
					// listFilters.push(new Filter("Versione", FilterOperator.EQ, oData.Versione));
					// listFilters.push(new Filter("Prctr", FilterOperator.EQ, oData.Prctr));
					var newPrctr = "'" + oData.Prctr + "'";
					//LOGICA DI CONTROLLO CAMBIO ID GIA' INSERITO
					if (!sIdProposta) {
						//LOGICA PER GENERARE NUOVA ID AUTOMATICAMENTE
						oDataModel.read("/GeneraIdProposta", { // function import name
							method: "GET", // http method
							urlParameters: {
								"Prctr": newPrctr
							},
							success: function(oData, oResponse) {
								that._Id = oResponse.data.Idproposta;
								that.Keycode = oResponse.data.Keycodepr;
								// console.log(that._Id);
								that.getView().byId("IdProposta").setValue(that._Id); // generato automaticamente dal backend
								that.getView().byId("IdProposta").setEnabled(false);
								that.getView().byId("IdProposta").setShowValueHelp(false);
								that.getView().byId("btnlockId").setText("Prenota");

								oDialog.open(oButton);
							}, // callback function for success
							error: function(oError) {
									MessageBox.error(oError.responseText);
								} // callback function for error
						});
					} else {
						MessageBox.warning(that.oResourceBundle.getText("MBCambioNumProposta"), {
							icon: MessageBox.Icon.WARNING,
							title: "Cambio Proposta",
							actions: [MessageBox.Action.YES, MessageBox.Action.NO],
							emphasizedAction: MessageBox.Action.NO,
							onClose: function(oAction) {
								if (oAction === MessageBox.Action.YES) {
									//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
									//____________
									that.getView().byId("InputNoEdit").setValue("");
									that.getView().byId("idNickName").setValue("");
									that.getView().byId("idNota").setValue("");
									that.getView().byId("idIter").setSelectedItem(null);
									that.getView().byId("idTablePosFinGestisciID").unbindAggregation("items");

									var oModel = models.getModelDefaultGeneraIdProposta();
									var oData = oModel.getData();

									var newPrctr = "'" + oData.Prctr + "'";
									//LOGICA DI CONTROLLO CAMBIO ID GIA' INSERITO

									oDataModel.callFunction("/GeneraIdProposta", { // function import name
										method: "GET", // http method
										urlParameters: {
											"Prctr": newPrctr
										},
										success: function(oData, oResponse) {
											that._Id = oResponse.data.Idproposta;
											that.Keycode = oResponse.data.Keycodepr;
											that.getView().byId("IdProposta").setValue(that._Id); // generato automaticamente dal backend
											// that.getView().byId("IdProposta").setEditable(false);
											that.getView().byId("IdProposta").setShowValueHelp(false);
											that.getView().byId("btnlockId").setText("Prenota");
											oDialog.open(oButton);
										}, // callback function for success
										error: function(oError) {
												MessageBox.error(oError.responseText);
											} // callback function for error
									});
								}
							}
						});
					}
				}
			});
		},

		lockId: function(oEvt) {
			var sBtnText = oEvt.getSource().getText();
			var sIdPropostaInserito = this.getView().byId("IdProposta").getValue();
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var that = this;

			if (sBtnText === "Ok") {
				this.getView().byId("InputNoEdit").setValue(sIdPropostaInserito);
				this.getView().byId("idFragment_GestisciID_InputIdProposta").close();
				this.getView().byId("IdProposta").setValue("");

				var oModelGestisciProposta = this.getView().getModel("modelPathGestisciPropostaView").getData("dataGestisciProposta").dataGestisciProposta;
				if (!!oModelGestisciProposta) {
					var oKeyCode = oModelGestisciProposta.Keycode;

					//GET testo Nota
					var aFilters = [new Filter("Idproposta", FilterOperator.EQ, oKeyCode)];
					oDataModel.read("/PropostaSet", { // function import name
						filters: aFilters, // function import parameters        
						success: function(oData, oResponse) {
							var oNota = "";
							if (oData.results.length > 0) {
								oNota = oData.results[0].Testonota;
							}

							//Gestione Input
							var oNickname = oModelGestisciProposta.Nickname;
							this.getView().byId("idNickName").setValue(oNickname);
							this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", true);
							this.getView().byId("idNickName").setEditable(true);
							var oIter = oModelGestisciProposta.Iter;
							this.getView().byId("idIter").setValue(oIter);
							this.getView().byId("idNota").setValue(oNota);

							this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", true);

							aFilters = [];
							aFilters.push(new Filter("Idproposta", FilterOperator.EQ, oKeyCode));

							oDataModel.read("/PosFinPropostaSet", {
								filters: aFilters,
								success: function(oData, oResponse) {
									var listResults = oData.results;
									var aPosFin = [];
									var oModelTablePageGestisciID = this.getView().getModel("modelTableGestisciID");
									oModelTablePageGestisciID.setData([]);
									oModelTablePageGestisciID.refresh();
									for (var i = 0; i < listResults.length; i++) {
										var sAnno = listResults[i].Anno;
										var sFikrs = listResults[i].Fikrs;
										var sFase = listResults[i].Fase;
										var sReale = listResults[i].Reale;
										var sVersione = listResults[i].Versione;
										var sFipex = listResults[i].Fipex;
										var sDatbis = listResults[i].Datbis;

										if (sDatbis) {
											sDatbis = this._convertStringTime(sDatbis);
											sDatbis = sDatbis.replaceAll("-", "");
										}

										var oObj = {
											Anno: sAnno,
											Fikrs: sFikrs,
											Fase: sFase,
											Reale: sReale,
											Versione: sVersione,
											Fipex: sFipex,
											Datbis: sDatbis,
											Visible: true
										};

										aPosFin.push(oObj);
										oModelTablePageGestisciID.setData(aPosFin);
										oModelTablePageGestisciID.refresh();

										//COSTRUISCO DINAMICAMENTE LA TABELLA DELLA VIEW
										var oTablePage = this.getView().byId("idTablePosFinGestisciID");
										var oTemplate = new sap.m.ColumnListItem({
											vAlign: "Middle",
											cells: [
												new LinkPosizioneFinanziaria({
													text: "{modelTableGestisciID>Fipex}",
													// id:"idLinkPosfinRV",

													fikrs: "{modelTableGestisciID>Fikrs}",
													anno: "{modelTableGestisciID>Anno}",
													fase: "{modelTableGestisciID>Fase}",
													reale: "{modelTableGestisciID>Reale}",
													versione: "{modelTableGestisciID>Versione}",
													fipex: "{modelTableGestisciID>Fipex}",
													datbis: "{modelTableGestisciID>Datbis}"
												}),
												new sap.m.Button({
													type: "Transparent",
													tooltip: "{i18n>Elimina}",
													icon: "sap-icon://delete",
													press: [this.onPressEliminaPFGestisciID, this],
													visible: "{modelTableGestisciID>Visible}"
												})
											]
										});
										oTablePage.bindAggregation("items", "modelTableGestisciID>/", oTemplate);
										this.getView().getModel("modelChangeControlsStatus").setProperty("/Visible", true);

									}
									var oModelGestisci = this.getView().getModel("modelPathGestisciPropostaView");
									var oDataGestisci = oModelGestisci.getData();
									var strNewArr = JSON.stringify(aPosFin);
									var newArr = JSON.parse(strNewArr);
									oDataGestisci.aPosFin = newArr;
									oModelGestisci.setData(oDataGestisci);
									oModelGestisci.refresh();
								}.bind(this),
								error: function(oError) {
									MessageBox.error(JSON.parse(oError.responseText).error.message.value);
									this.getView().byId("InputNoEdit").setValue("");
									this.getView().byId("IdProposta").setValue("");
									this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", false);
									this.getView().getModel("modelChangeControlsStatus").setProperty("/Editable", false);
								}.bind(this)
							});

						}.bind(this), // callback function for success
						error: function(oError) {
								MessageBox.error(JSON.parse(oError.responseText).error.message.value);
								this.getView().byId("InputNoEdit").setValue("");
								this.getView().byId("IdProposta").setValue("");
								this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", false);
								this.getView().getModel("modelChangeControlsStatus").setProperty("/Editable", false);
							}.bind(this) // callback function for error
					});

					//this.getView().byId("idNota").setEditable(true);

				}
			}

			if (sBtnText === "Prenota") {
				//CASO SCELTA PROPOSTA AUTOMATICA
				//LOGICA DI BLOCCO ID DA INSERIRE
				this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", true);
				this.getView().getModel("modelChangeControlsStatus").setProperty("/Editable", true);

				this.getView().byId("IdProposta").setValue("");
				this.getView().byId("InputNoEdit").setValue(sIdPropostaInserito);

				//GESTIONE ITER IN LAVORAZIONE (STATO DEFAULT) 
				this.getView().getModel("modelChangeControlsStatus").setProperty("/Iter", false);
				this.getView().byId("idIter").setValue("Proposta in lavorazione");
				this.getView().byId("idIter").setSelectedKey("01");

				this.getView().byId("idFragment_GestisciID_InputIdProposta").close();

			}

			if (sBtnText === "Scegli") {
				//CASO SCELTA PROPOSTA MANUALE
				//LOGICA DI CONTROLLO ID SCELTO
				if (sIdPropostaInserito) {
					oDataModel.callFunction("/CreaIdPropostaManualmente", { // function import name
						method: "GET", // http method
						urlParameters: {
							"Idproposta": sIdPropostaInserito
						}, // function import parameters        
						success: function(oData, oResponse) {
							// console.log(oResponse.statusText);
							that._Id = oResponse.data.Idproposta;
							that.Keycode = oResponse.data.Keycodepr;
							that.getView().byId("InputNoEdit").setValue(that._Id); // generato automaticamente dal backend
							// that.getView().byId("IdProposta").setEditable(false);

							that.getView().byId("IdProposta").setShowValueHelp(false);
							//LOGICA DI BLOCCO ID DA INSERIRE
							this.getView().byId("InputNoEdit").setValue(sIdPropostaInserito);
							this.getView().byId("IdProposta").setValue(sIdPropostaInserito);
							this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", true);
							this.getView().getModel("modelChangeControlsStatus").setProperty("/Editable", true);

							//GESTIONE ITER IN LAVORAZIONE (STATO DEFAULT) 
							this.getView().getModel("modelChangeControlsStatus").setProperty("/Iter", false);
							this.getView().byId("idIter").setValue("Proposta in lavorazione");
							this.getView().byId("idIter").setSelectedKey("01");
						}.bind(this), // callback function for success
						error: function(oError) {
								MessageBox.error(JSON.parse(oError.responseText).error.message.value);
								this.getView().byId("InputNoEdit").setValue("");
								this.getView().byId("IdProposta").setValue("");
								this.getView().getModel("modelChangeControlsStatus").setProperty("/Enable", false);
								this.getView().getModel("modelChangeControlsStatus").setProperty("/Editable", false);
							} // callback function for error
					});

					this.getView().byId("idFragment_GestisciID_InputIdProposta").close();
				}

			}
			//GESTIRE LOGICA CAMBIO ID SE GIA' INSERITO --> prenderla da gestione capitolo anagrafica
			/*var oModelChangeControlsStatus = this.getView().getModel("modelChangeControlsStatus");
			if (sIdProposta) {
				oModelChangeControlsStatus.setProperty("/Enable", true);
				oModelChangeControlsStatus.setProperty("/Visible", true);
				oModelChangeControlsStatus.setProperty("/Editable", true);
				// this.getView().byId("openMenu").setEnabled(true);

				// this.getView().byId("InputNoEdit").setValue(sIdPropostaInserito);
				// this.getView().byId("idFragment_GestisciID_InputIdProposta").close();
				this.getView().byId("IdProposta").setValue("");
			} else {
				oModelChangeControlsStatus.setProperty("/Enable", false);
				oModelChangeControlsStatus.setProperty("/Visible", false);
				oModelChangeControlsStatus.setProperty("/Editable", false);
				// this.getView().byId("openMenu").setEnabled(true);
			}*/

		},

		close: function() {
			var sIdProposta = this.getView().byId("InputNoEdit").getValue();
			var oModelChangeControlsStatus = this.getView().getModel("modelChangeControlsStatus");
			if (sIdProposta) {
				oModelChangeControlsStatus.setProperty("/Enable", true);
				oModelChangeControlsStatus.setProperty("/Visible", true);
				oModelChangeControlsStatus.setProperty("/Editable", true);
				this.getView().byId("openMenu").setEnabled(true);

			} else {
				oModelChangeControlsStatus.setProperty("/Enable", false);
				oModelChangeControlsStatus.setProperty("/Visible", false);
				oModelChangeControlsStatus.setProperty("/Editable", false);
				this.getView().byId("openMenu").setEnabled(true);
			}
			this.getView().byId("idFragment_GestisciID_InputIdProposta").close();
			this.getView().byId("IdProposta").setValue("");
			this.getView().byId("InputNoEdit").setValue("");
		},

		//***********************FINE GESTIONE MENU PROPOSTA************************************************

		//*********************LOGICHE FILTERBAR: ADATTA FILTRI + CUSTOM POSFIN**************************

		//ONCHANGE
		onChangeT: function(oEvent, idControl) {
			//alert("onChangeT" + idControl);
		},

		onChange: function(oEvent, inputRef) {
			var sSelectedVal;

			if (inputRef === "Amministrazione") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroResp");
					this._resetInput("Azione");
					this._resetInput("Capitolo");
				}
			}

			if (inputRef === "CentroResp") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroResp");
				}
			}

			if (inputRef === "Missione") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("Programma");
					this._resetInput("Azione");
				}
			}

			if (inputRef === "Programma") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("Azione");
				}
			}

			if (inputRef === "Capitolo") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("PG");
				}
			}

			if (inputRef === "Titolo") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("Categoria");
					this._resetInput("CE2");
					this._resetInput("CE3");
				}
			}

			if (inputRef === "Categoria") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CE2");
					this._resetInput("CE3");
				}
			}

			if (inputRef === "CE2FA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CE3");
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

			sAmminValFb = this.getView().byId("Amministrazione").getValue();
			sMissioneValFb = this.getView().byId("Missione").getValue();
			sProgrammaValFb = this.getView().byId("Programma").getValue();
			sCapitoloValFb = this.getView().byId("Capitolo").getValue();
			sTitoloValFb = this.getView().byId("Titolo").getValue();
			sCategoriaValFb = this.getView().byId("Categoria").getValue();
			sCE2ValFb = this.getView().byId("CE2").getValue();
			var oFilterAmm, oFilterMiss, oFilterProg, oFilterCap, oFilterTit, oFilterCat, oFilterCe2;

			var aCompoundFilters;

			if (inputRef === "Amministrazione") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_AMMIN", "{modelConoVisibilita>Prctr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "CentroResp") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);
				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_CDR", "{modelConoVisibilita>CodiceCdr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "Ragioneria") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_RAGIONERIA", "{modelConoVisibilita>CodiceRagioneria}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}

			if (inputRef === "Missione") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesami", sTerm);
				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_MISSIONESet", "{Codicemissione}", "{Descrestesami}", aAndFilters);
			}

			if (inputRef === "Programma") {
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

			if (inputRef === "Azione") {
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

			if (inputRef === "Capitolo") {
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

			if (inputRef === "PG") {
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

			if (inputRef === "Titolo") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrtitolo", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TITOLOSet", "{Codicetitolo}", "{Descrtitolo}", aAndFilters);
			}

			if (inputRef === "Categoria") {
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

			if (inputRef === "CE2") {
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

			if (inputRef === "CE3") {
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

			if (inputRef === "Amministrazione") {

				if (!this.AmministrazioneHelpDialog) {
					this.AmministrazioneHelpDialog = this.createValueHelpDialog(
						"Amministrazione",
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
				this.AmministrazioneHelpDialog.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.AmministrazioneHelpDialog.open(sInputValue);
			}

			if (inputRef === "CentroResp") {
				if (!this.CentroResp) {
					this.CentroResp = this.createValueHelpDialog(
						"CentroResp",
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
				this.CentroResp.getBinding("items").filter(aOrFiltersCond);
				this.CentroResp.open(sInputValue);
			}

			if (inputRef === "Ragioneria") {
				if (!this.Ragioneria) {
					this.Ragioneria = this.createValueHelpDialog(
						"Ragioneria",
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
				this.Ragioneria.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.Ragioneria.open(sInputValue);
			}

			if (inputRef === "Missione") {
				if (!this.Missione) {
					this.Missione = this.createValueHelpDialog(
						"Missione",
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
				this.Missione.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.Missione.open(sInputValue);
			}

			if (inputRef === "Programma") {
				sMissioneVal = this.getView().byId("Missione").getValue();

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
				if (!this.Programma) {
					this.Programma = this.createValueHelpTableSelectDialog(
						"Programma",
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
				this.Programma.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.Programma.open(sInputValue);
			}

			if (inputRef === "Azione") {
				sProgrammaVal = this.getView().byId("Programma").getValue();
				sMissioneVal = this.getView().byId("Missione").getValue();
				sAmminVal = this.getView().byId("Amministrazione").getValue();

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
				if (!this.Azione) {
					this.Azione = this.createValueHelpTableSelectDialog(
						"Azione",
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
				this.Azione.getBinding("items").filter(aFilters);
				//Open ValueHelpDialog filtered by the input's value
				this.Azione.open(sInputValue);
			}

			if (inputRef === "Capitolo") {
				sAmminVal = this.getView().byId("Amministrazione").getValue();

				if (!this.Capitolo) {
					this.Capitolo = this.createValueHelpDialog(
						"Capitolo",
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
				this.Capitolo.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.Capitolo.open(sInputValue);
			}

			if (inputRef === "PG") {
				sAmminVal = this.getView().byId("Amministrazione").getValue();
				sCapitoloVal = this.getView().byId("Capitolo").getValue();
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

				if (!this.PG) {
					this.PG = this.createValueHelpTableSelectDialog(
						"PG",
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
				this.PG.getBinding("items").filter(aFilters);
				this.PG.open(sInputValue);
			}

			if (inputRef === "Titolo") {

				if (!this.Titolo) {
					this.Titolo = this.createValueHelpDialog(
						"Titolo",
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
				this.Titolo.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.Titolo.open(sInputValue);
			}

			if (inputRef === "Categoria") {
				sTitoloVal = this.getView().byId("Titolo").getValue();
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

				if (!this.Categoria) {
					this.Categoria = this.createValueHelpTableSelectDialog(
						"Categoria",
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
				this.Categoria.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.Categoria.open(sInputValue);
			}

			if (inputRef === "CE2") {
				sTitoloVal = this.getView().byId("Titolo").getValue();
				sCategoriaVal = this.getView().byId("Categoria").getValue();
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
				if (!this.CE2) {
					this.CE2 = this.createValueHelpTableSelectDialog(
						"CE2",
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
				this.CE2.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CE2.open(sInputValue);
			}

			if (inputRef === "CE3") {
				sTitoloVal = this.getView().byId("Titolo").getValue();
				sCategoriaVal = this.getView().byId("Categoria").getValue();
				sCE2Val = this.getView().byId("CE2").getValue();
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

				if (!this.CE3) {
					this.CE3 = this.createValueHelpTableSelectDialog(
						"CE3",
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
				this.CE3.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.CE3.open(sInputValue);
			}

			if (inputRef === "IdProposta") {
				//
				if (!this.PropostaDialog) {
					this.PropostaDialog = this.createValueHelpDialog(
						"IdProposta",
						oModelGlobal,
						"",
						"{i18n>IDProposta}",
						"/ZCA_AF_PROPOSTASet",
						"Idproposta",
						"Nickname");
				}

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("CodiceRagioneria", FilterOperator.Contains, sInputValue),
							new Filter("Nickname", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				this.PropostaDialog.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.PropostaDialog.open(sInputValue);
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

			if (inputRef === "Amministrazione") {

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

			if (inputRef === "CentroResp") {

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

			if (inputRef === "Ragioneria") {

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

			if (inputRef === "Missione") {

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

			if (inputRef === "Programma") {
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

			if (inputRef === "Azione") {
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

			if (inputRef === "Capitolo") {
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

			if (inputRef === "PG") {
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

			if (inputRef === "Titolo") {

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

			if (inputRef === "Categoria") {
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

			if (inputRef === "CE2") {
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

			if (inputRef === "CE3") {
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

			if (inputRef === "IdProposta") {

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
		},

		onValueHelpConfirm: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var sMissioneVal, sProgrammaVal, sAzioneVal;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val, sIDProposta;

			oSelectedItem = oEvent.getParameter("selectedItem");

			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			if (inputRef === "Amministrazione") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("Amministrazione").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "CentroResp") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("CentroResp").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Ragioneria") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					// this._enableInput("Missione", false);
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("Ragioneria").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Missione") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				this.byId("Missione").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Programma") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("Missione");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaVal = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				this._fillInput("Missione", sMissioneVal);
				this._fillInput("ProgrammaFA", sProgrammaVal);
			}

			if (inputRef === "Azione") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("Missione");
					this._resetInput("Programma");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaVal = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				sAzioneVal = this.getOwnerComponent().getModel().getData(sPath).Codiceazione;
				this._fillInput("Missione", sMissioneVal);
				this._fillInput("Programma", sProgrammaVal);
				this._fillInput("Azione", sAzioneVal);
			}

			if (inputRef === "Capitolo") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("PG");
					return;
				}
				this.byId("Capitolo").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "PG") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("Capitolo");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				var sCapitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicecapitolo;
				var sPGVal = this.getOwnerComponent().getModel().getData(sPath).Codicepg;
				this._fillInput("Capitolo", sCapitoloVal);
				this._fillInput("PG", sPGVal);
			}

			if (inputRef === "Titolo") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("Titolo").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Categoria") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE2");
					this._resetInput("CE3");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
			}

			if (inputRef === "CE2") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE3");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
				this._fillInput("CE2", sCE2Val);
			}

			if (inputRef === "CE3") {
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
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
				this._fillInput("CE2", sCE2Val);
				this._fillInput("CE3", sCE3Val);
			}

			if (inputRef === "IdProposta") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				//this.byId("IDProposta").setValue(oSelectedItem.getTitle());
				var sData = this.getOwnerComponent().getModel().getData(sPath);
				sIDProposta = this.getOwnerComponent().getModel().getData(sPath).Idproposta;
				this._fillInput("IdProposta", sIDProposta);
				var oModel = new JSONModel({
					dataGestisciProposta: sData
				});
				this.getView().setModel(oModel, "modelPathGestisciPropostaView");

			}
		},

		onValueHelpClose: function(oEvent, inputRef) {},

		onSuggestionItemSelected: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var oInputAmm = this.getView().byId("Amministrazione");
			var sMissioneVal, sProgrammaVal;
			var sCapitoloVal, sPGVal;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val;

			if (inputRef === "Amministrazione") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				this.byId("Amministrazione").setValue(oSelectedItem.getProperty("text"));
			}

			if (inputRef === "CentroResp") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oInputAmm = this.getView().byId("Amministrazione");
				if (!oSelectedItem & oInputAmm.getEnabled() === "true") {
					this._resetInput("Amministrazione");
				}
			}

			if (inputRef === "Ragioneria") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("Ragioneria").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Missione") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// this.byId("Missione").setValue(oSelectedItem.getProperty("text"));	
			}

			if (inputRef === "Programma") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("Missione");
				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					this._fillInput("Missione", sMissioneVal);
				}
			}

			if (inputRef === "Azione") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("Missione");
					this._resetInput("Programma");

				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					sProgrammaVal = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
					this._fillInput("Missione", sMissioneVal);
					this._fillInput("Programma", sProgrammaVal);
				}
			}

			if (inputRef === "Capitolo") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("PG");
					return;
				}
				this.byId("Capitolo").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "PG") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					//this._resetInput("Amministrazione");
					this._resetInput("Capitolo");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sCapitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicecapitolo;
				sPGVal = this.getOwnerComponent().getModel().getData(sPath).Codicepg;
				this._fillInput("Capitolo", sCapitoloVal);
				this._fillInput("PG", sPGVal);
			}

			if (inputRef === "Titolo") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("Titolo").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "Categoria") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE2");
					this._resetInput("CE3");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				// var sDescTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Descrtitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				// var sDescCatVal = this.getOwnerComponent().getModel().getData(sPath).Descrcategoria;
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
			}

			if (inputRef === "CE2") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CE3");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
				this._fillInput("CE2", sCE2Val);
			}

			if (inputRef === "CE3") {
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
				this._fillInput("Titolo", sTitoloVal);
				this._fillInput("Categoria", sCategoriaVal);
				this._fillInput("CE2", sCE2Val);
				this._fillInput("CE3", sCE3Val);
			}

			if (inputRef === "IdProposta") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("IdProposta").setValue(oSelectedItem.getTitle());
			}
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.GestisciID
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.GestisciID
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.GestisciID
		 */
		//	onExit: function() {
		//
		//	}

	});

});