sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/m/SelectDialog",
	"sap/m/TableSelectDialog",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"../util/formatter"
], function(Controller, History, SelectDialog, TableSelectDialog, JSONModel, Filter, FilterOperator, MessageBox, formatter) {
	"use strict";

	return Controller.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.BaseController", {

		formatter: formatter,

		getRouter: function() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		insertRecord: function(sDbSource, sEntitySet, oRecord) {
			var aReturn = this._getDbOperationReturn();
			var oModel = this._getDbModel(sDbSource);
			return new Promise(function(resolve, reject) {
				oModel.create(sEntitySet, oRecord, {
					success: function(oData) {
						if (sEntitySet === "/SacUrlSet") {
							return resolve(oData);
						} else {
							aReturn.returnStatus = true;
							return resolve(aReturn.returnStatus);
						}
					},
					error: function(e) {
						/* if (oData.Belnr) {
							return oData.Belnr;
						} else { */
						aReturn.returnStatus = false;
						aReturn.message = JSON.parse(e.responseText).error.message.value;
						return reject(aReturn);
						/* } */
					}
				});
			});
		},
		/* __getAnnoFaseProcessoMacroFase: function () {
            let modelTopologiche = this.getOwnerComponent().getModel("ZSS4_CO_GEST_TIPOLOGICHE_SRV")  
            var that = this;
            return new Promise((resolve, reject) => {
              modelTopologiche.read("/ZES_CAL_FIN_SET",{
                  filters: [new Filter("FASE", FilterOperator.EQ, "F")],
                  success: (oData) => {
                    
                    that.getOwnerComponent().setModel(new JSONModel({
                        ANNO : oData.results[0].ANNO,
                        DDTEXT : oData.results[0].FASE === "F" ? "Formazione" : oData.results[0].DDTEXT,
                        STAT_FASE : oData.results[0].STAT_FASE === "0" ? "Disegno di legge di bilancio" : "Note di variazione",
                    }), "globalModel")
                    resolve(true)
                  },
                  error: (err) => {
                      reject(err)
                  }
              })
            })
          }, */
		//lt codice cross
		readFromDb: function(sDbSource, sEntitySet, aFilters, aSorters, sExpand) {
			var aReturn = this._getDbOperationReturn();
			var oModel = this._getDbModel(sDbSource);
			var sUrlParamtersExpand = sExpand === "" ? {} : {
				"$expand": sExpand
			};

			return new Promise(function(resolve, reject) {
				oModel.read(sEntitySet, {
					filters: aFilters,
					sorters: aSorters,
					urlParameters: sUrlParamtersExpand,
					success: function(oData) {
						aReturn.returnStatus = true;
						if (oData.results === undefined) {
							aReturn.data = oData;
						} else {
							aReturn.data = oData.results;
						}

						resolve(aReturn.data);
						// return resolve(aReturn.data);
					},
					error: function(e) {
						aReturn.returnStatus = false;
						reject(e);
						// return reject(e);
					}
				});
			});
		},

		_getDbOperationReturn: function() {
			return {
				returnStatus: false,
				data: []
			};
		},

		_getDbModel: function(sDbSource) {

			switch (sDbSource) {
				case "1":
					return this.getOwnerComponent().getModel("modelGestTipologicheSRV");
				case "2":
					return this.getOwnerComponent().getModel("AmministrazioneOdata");
				case "3":
					return this.getOwnerComponent().getModel("modelSapReadTree");
				case "4":
					return this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			}
		},

		onPressInformations: function(event, view) {
			var oButton = event.getSource();
			var oInfoModel = this.getOwnerComponent().getModel("infoModel");
			var sRootPath = jQuery.sap.getModulePath("zsap.com.r3.cobi.s4.esamodModSpesePosFin");
			var filepath;

			if (view === 'competenza') {
				filepath = sRootPath + "/data/infoCompentenza.json";
				oInfoModel.loadData(filepath, false);
			}
			if (view === 'cassa') {
				filepath = sRootPath + "/data/infoCassa.json";
				oInfoModel.loadData(filepath, false);
			}
			if (view === 'dettContPosFin') {
				filepath = sRootPath + "/data/infoDettaglioContPF.json";
				oInfoModel.loadData(filepath, false);
			}
			if (view === 'dettContIdProposta') {
				filepath = sRootPath + "/data/infoDettaglioContID.json";
				oInfoModel.loadData(filepath, false);
			}

			if (!this._oDialogInfo) {
				this._oDialogInfo = sap.ui.xmlfragment(
					"zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.Information", this);
				//	this._oDialogUff.bindElement("localModel");  INUTILE
				this.getView().addDependent(this._oDialogInfo); // --> questa fa si che i model globali siano visibili sul fragment
			}
			this._oDialogInfo.openBy(oButton);

		},

		onPressChiudiInfoPopOver: function() {
			var oPopover = sap.ui.getCore().byId("InfoPopover");
			oPopover.close();
		},

		createValueHelpTableSelectDialog: function(id, model, modelName, title, aggragationBinding, arrayProperties) {
			var oTableSelectDialog = {};
			var oCell = [];
			var _sAggreBinding, _spropertyBinding;
			var that = this;

			if (modelName !== '') {
				_sAggreBinding = modelName + '>' + aggragationBinding;
			} else {
				_sAggreBinding = aggragationBinding;
			}
			oTableSelectDialog = new TableSelectDialog(id, {
				title: title,
				noDataText: "{i18n>Nessundatodisponibile}",
				search: [that.onValueHelpSearch, that],
				confirm: [that.onValueHelpConfirm, that],
				cancel: [that.onValueHelpClose, that]
			});
			if (modelName !== '') {
				oTableSelectDialog.setModel(model, modelName);
			} else {
				oTableSelectDialog.setModel(model);
			}
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n");
			oTableSelectDialog.setModel(this._oResourceBundle, "i18n");
			for (var i = 0; i < arrayProperties.length; i++) {
				if (modelName !== '') {
					_spropertyBinding = '{' + modelName + '>' + arrayProperties[i].property + '}';
				} else {
					_spropertyBinding = '{' + arrayProperties[i].property + '}';
				}

				var oColumn = new sap.m.Column({
					width: "auto",
					header: new sap.m.Text({
						text: arrayProperties[i].label
					})
				});
				oTableSelectDialog.addColumn(oColumn);
				var cell1 = new sap.m.Text({
					text: _spropertyBinding
				});
				oCell.push(cell1);
			}
			var aColList = new sap.m.ColumnListItem({
				cells: oCell
			});
			oTableSelectDialog.bindItems(_sAggreBinding, aColList);
			return oTableSelectDialog;
		},

		createValueHelpDialog: function(id, model, modelName, title, binding, titleBinding, descriptionBinding) {
			var oSelectDialog = {};
			var _sAggreBinding, _titleBinding, _descriptionBinding;
			var that = this;
			var sId = id;
			if (modelName !== '') {
				_sAggreBinding = modelName + '>' + binding;
				if (titleBinding !== '') {
					_titleBinding = '{' + modelName + '>' + titleBinding + '}';
				}
				if (descriptionBinding !== '') {
					_descriptionBinding = '{' + modelName + '>' + descriptionBinding + '}';
				}
			} else {
				_sAggreBinding = binding;
				if (titleBinding !== '') {
					_titleBinding = '{' + titleBinding + '}';
				}
				if (descriptionBinding !== '') {
					_descriptionBinding = '{' + descriptionBinding + '}';
				}
			}

			oSelectDialog = new SelectDialog(sId, {
				title: title,
				search: [that.onValueHelpSearch, that],
				confirm: [that.onValueHelpConfirm, that],
				cancel: [that.onValueHelpClose, that]
			});
			model.refresh();
			if (modelName !== '') {

				oSelectDialog.setModel(model, modelName);
			} else {
				oSelectDialog.setModel(model);
			}
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n");
			oSelectDialog.setModel(this._oResourceBundle, "i18n");

			var oTemplateStandardListItem = new sap.m.StandardListItem({
				title: _titleBinding,
				description: _descriptionBinding
			});
			oSelectDialog.bindAggregation("items", _sAggreBinding, oTemplateStandardListItem);
			return oSelectDialog;
		},

		/*	onValueHelpSearchDinam: function(oEvent) {
			var id = oEvent.getParameters().id;
                    alert(id);
		},*/

		getModel: function() {
			return this.getOwnerComponent().getModel();
		},

		getTriennioModel: function() {
			return this.getOwnerComponent().getModel("modelTriennio");
		},

		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		onNavBack: function(oEvent) {
			var oHistory, sPreviousHash;
			oHistory = History.getInstance();
			sPreviousHash = oHistory.getPreviousHash();
			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("appHome", {}, true /*no history*/ );
			}
		},

		onPressNavToHome: function(Evt) {
			/*var oTreeTablePF = sap.ui.getCore().byId("__xmlview2--treeTablePFID");
			var oTreeTablePFID = sap.ui.getCore().byId("treeTablePFID");
			if(oTreeTablePF) {
				oTreeTablePF.bindRows({path: ""});
			}
			if(oTreeTablePFID) {
				//oTreeTablePFID.filter(column, null);
			}*/

			this.oRouter.navTo("appHome");
		},

		// FILTRO AMMNINISTRAZIONE
		handleValueHelp: async function(sId, Prctr) {
			// this._openBusyDialog();
			var oView = this.oView,
				myTemplate,
				myPath,
				searchField = [],
				that = this,
				aFilter = [];
			switch (sId) {
				case 'Amm':
					var arrDassSet = await this.readFromDb("2", "/ZCA_AF_AMMIN", [], [], "");
					this.getView().setModel(new JSONModel(arrDassSet), "oMatchCodeModelTable");
					var oObjectList = this._setObjectList("Prctr", "DescBreve");
					var sTitleDialog = "{i18nL>cercaAmministrazione}";
					break;
				case 'Note':
					var aFilter = [];
					//var sAmmin = sap.ui.getCore().getModel("modelAnagraficaPf").getData().Prctr;
					var sAmmin = this.getView().getModel("modelAnagraficaPf").getData().Prctr;
					aFilter.push(new Filter("Prctr", sap.ui.model.FilterOperator.EQ, sAmmin));
					aFilter.push(new Filter("Attributo", sap.ui.model.FilterOperator.EQ, "S"));
					aFilter.push(new Filter("Attributo", sap.ui.model.FilterOperator.EQ, "G"));
					var arrDassSet = await this.readFromDb("4", "/ZES_ELENCO_NOTE", aFilter, [], "");
					this.getView().setModel(new JSONModel(arrDassSet), "oMatchCodeModelTable");
					var oObjectList = this._setObjectList("IdNota", "TestoNota");
					var sTitleDialog = "{i18nL>cercaNota}";
			}

			this.getView().setModel(new JSONModel(oObjectList), "oMatchcodeModel");

			myPath = "oMatchcodeModel>/";
			searchField.push("Valore", "Descrizione");
			myTemplate = new sap.m.StandardListItem({
				title: "{oMatchcodeModel>Valore}",
				description: "{oMatchcodeModel>Descrizione}"
			});

			var oValueHelpDialog = new sap.m.SelectDialog({

				title: sTitleDialog,

				items: {
					path: myPath,
					template: myTemplate
				},

				contentHeight: "60%",
				confirm: function(oConfirm) {
					var titolo = oConfirm.getParameter("selectedItem").getTitle();

					switch (sId) {
						case 'Amm':
							var oModelAdattaFiltri = that.oView.getModel("modelAdattaFiltri");
							var aDataModelAdattaFiltri = oModelAdattaFiltri.getData();
							aDataModelAdattaFiltri.CodiceAmmin = titolo;
							oModelAdattaFiltri.refresh();
							break;
						case 'Note':
							var sIdNota = oConfirm.getParameter("selectedItem").getTitle();
							var sInputNota = that.getView().byId("idInputScegliNoteIDProposta");
							sInputNota.setValue(sIdNota);
							var sTestoNota = oConfirm.getParameter("selectedItem").getDescription();
							var sTextArea = that.getView().byId("idNota");
							sTextArea.setValue(sTestoNota);
							that.getView().byId("idNota").setEditable(false);
							break;
					}

				},
				search: function(oEvent) {
					switch (sId) {
						case 'Amm':
							var aVal = "Descrizione";
							break;
						case 'Note':
							var aVal = "TestoNota";
							break;
					}

					var sString = oEvent.getParameter("value");

					var oFilter = new Filter(aVal, FilterOperator.Contains, sString);
					oEvent.getSource().getBinding("items").filter(oFilter);

				},
				cancel: function(oCancel) {},

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

		_setObjectList: function(sTitolo, sDesc) {
			var aData = this.getView().getModel("oMatchCodeModelTable").getData(),
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

		_onClearInput: function(oEvent) {
			//this._onClearInput();
			var aSelectionsSets = oEvent.getParameters().selectionSet;
			//lt setto il valore della posizione finanziaria a "" così da resettare il valore
			this.byId("filterBarPosFin").setValue("")
			//this.clearGlobalModel();
			for (var i = 0; i < aSelectionsSets.length; i++) {
				var oControl = this.getView().byId(aSelectionsSets[i].getId());
				//oControl.setValue("");
				if (oControl.getMetadata().getName() === "sap.m.ComboBox") {
					oControl.setSelectedKey("");
				}

				if (oControl.getMetadata().getName() === "sap.m.Input" & aSelectionsSets[i].getEnabled()) {
					oControl.setValue("");
				}

				if (oControl.getMetadata().getName() === "sap.m.CheckBox") {
					oControl.setSelected(false);
				}
			}
		},

		_queryNote: async function(CRUDOp, tipo_variazione, ip_proposta, posizione_finanziaria, autorizzazione, oView) {
			var oGlobalModel = this.getModel();
			var oNoteModel = this.getOwnerComponent().getModel("noteModel");
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			oView.setBusy(true);
			if (CRUDOp === 'GET') {
				var getPath = "/ZES_GESTIONE_NOTE_SET(Fase='',IdProposta='" + ip_proposta + "',IdPosfin='" + posizione_finanziaria +
					"',IdStAmmResp='',CodiFincode='" + autorizzazione + "',TipoVariazione='" + tipo_variazione +
					"',Sottostrumento='',AnnoFase='',Scenario='',Configurazione='')";
				oNoteModel.setProperty('/note', '');
				oGlobalModel.read(getPath, {
					success: function(Response) {
						oNoteModel.setProperty('/note', Response.Nota);
						oView.setBusy(false);
					},
					error: function(errorResponse) {
						MessageBox.error(errorResponse);
						oView.setBusy(false);
					}
				});
			}
			if (CRUDOp === 'POST') {
				var sNoteText = oNoteModel.getProperty('/note');
				var oNote = {
					"Fase": "",
					"IdProposta": ip_proposta,
					"IdPosfin": posizione_finanziaria,
					"IdStAmmResp": "",
					"CodiFincode": autorizzazione,
					"TipoVariazione": tipo_variazione,
					"Sottostrumento": "",
					"AnnoFase": "",
					"Scenario": "",
					"Configurazione": "",
					"Nota": sNoteText
				};
				var that = this;
				oGlobalModel.create("/ZES_GESTIONE_NOTE_SET", oNote, {
					success: function(Response) {
						MessageBox.success(oResourceBundle.getText("notaSalvata"));
						oView.setBusy(false);
					},
					error: function(errorResponse) {
						oView.setBusy(false);
						var sDettagli = that._setErrorMex(errorResponse);
						var oErrorMessage = errorResponse.responseText;
						MessageBox.error(oErrorMessage, {
							details: sDettagli,
							initialFocus: sap.m.MessageBox.Action.CLOSE,
							styleClass: "sapUiSizeCompact"
						});
						//	MessageBox.error(oErrorMessage);
					}
				});
			}

		},

		/*onChangeNota: function(oEvent) {
			var oInputNote = this.getView().byId("idInputScegliNote").getSelectedItem();

			if (oInputNote) {
				var sInputNoteVal = oInputNote.getText();
				this.getView().getModel("noteModel").setProperty('/note', sInputNoteVal);
				//	this.getView().byId("idCreaNota").setValue(sInputNoteVal);
			} else {
				this.getView().getModel("noteModel").setProperty('/note', "");
				//	this.getView().byId("idCreaNota").setValue("");
			}
		},*/

		_getPosFinFullData: function(sPosFinVal) {
			var oGlobalModel = this.getModel();
			var oModelPopUpPosFin = this.getView().getModel("modelPopUpPosFin");
			this._refreshModel(oModelPopUpPosFin);
			//		var sPosFinVal = this.getView().byId("idLinkPosfin").getText();
			var oFilter = new Filter("Posfins4", FilterOperator.EQ, sPosFinVal);

			oGlobalModel.read("/ZES_POSFINEXT_SET", {
				filters: [oFilter],
				success: function(Response) {
					var oData = Response.results[0];
					oModelPopUpPosFin.setData(oData);
				},
				error: function(errorResponse) {
					MessageBox.error(errorResponse);
				}
			});
		},

		_getTriennio: function() {
			/*var sStanzCassa = "Stanziamento di Cassa ";
			var sStanzComp = "Stanziamento di Competenza ";

			var sVarPropostaCassa = "Variazione Proposta Cassa Totale ";
			var sPropostaCompetenza = "Variazione Proposta Competenza Totale ";

			var sYear0 = new Date().getFullYear();
			var sYear1 = sYear0 + 1;
			var sYear2 = sYear0 + 2;
			var sYear3 = sYear0 + 3;
			var sStanzCassa1 = sStanzCassa + sYear1;
			var sStanzCassa2 = sStanzCassa + sYear2;
			var sStanzCassa3 = sStanzCassa + sYear3;
			var sStanzComp1 = sStanzComp + sYear1;
			var sStanzComp2 = sStanzComp + sYear2;
			var sStanzComp3 = sStanzComp + sYear3;
			var sVarPropostaCassa1 = sVarPropostaCassa + sYear1;
			var sVarPropostaCassa2 = sVarPropostaCassa + sYear2;
			var sVarPropostaCassa3 = sVarPropostaCassa + sYear3;
			var sPropostaCompetenza1 = sPropostaCompetenza + sYear1;
			var sPropostaCompetenza2 = sPropostaCompetenza + sYear2;
			var sPropostaCompetenza3 = sPropostaCompetenza + sYear3;

			var dataTriennio = {
				StanzCassa1: sStanzCassa1,
				StanzCassa2: sStanzCassa2,
				StanzCassa3: sStanzCassa3,
				StanzComp1: sStanzComp1,
				StanzComp2: sStanzComp2,
				StanzComp3: sStanzComp3,
				VarPropostaCassa1: sVarPropostaCassa1,
				VarPropostaCassa2: sVarPropostaCassa2,
				VarPropostaCassa3: sVarPropostaCassa3,
				PropostaCompetenza1: sPropostaCompetenza1,
				PropostaCompetenza2: sPropostaCompetenza2,
				PropostaCompetenza3: sPropostaCompetenza3

			};

			var oLocalModelTriennio = this.getTriennioModel();
			oLocalModelTriennio.setData(dataTriennio);*/
		},

		//**************INIZIO metodi interni per gestire i suggestion item**********************
		_resetInput: function(id) {
			this.getView().byId(id).setSelectedItem("");
			this.getView().byId(id).setValue("");
		},

		_resetEnableInput: function(id, bool) {
			this.getView().byId(id).setEnabled(bool);
			this.getView().byId(id).setSelectedItem("");
			this.getView().byId(id).setValue("");
		},

		_fillInput: function(id, sVal) {

			this.getView().byId(id).setSelectedItem(sVal);
			this.getView().byId(id).setValue(sVal);
		},

		_fillDisableInput: function(id, bool, sVal) {
			this.getView().byId(id).setEnabled(bool);
			this.getView().byId(id).setSelectedItem(sVal);
			this.getView().byId(id).setValue(sVal);
			if (bool === true) {
				// se un campo va disabilitato puliamo anche il contenuto
				this.getView().byId(id).setValue("");
			}
		},
		//**************FINE metodi interni per gestire i suggestion item**********************

		_setErrorMex: function(error) {
			var messaggio;
			try {
				//messaggio JSON
				var errorObj = JSON.parse(error.responseText);
				messaggio = errorObj.error.message.value;
			} catch (e) {
				try {
					//messaggio XML
					var oXmlData = error.responseText;
					var oXMLModel = new sap.ui.model.xml.XMLModel();
					oXMLModel.setXML(oXmlData);
					var tabMex = oXMLModel.getData().all;
					for (var i = 0; i < tabMex.length; i++) {
						var value = tabMex[i];
						if (value.tagName === "h1") {
							messaggio = value.innerHTML;
						}
					}
					if (!messaggio) {
						for (var j = 0; j < tabMex.length; j++) {
							var value = tabMex[j];
							if (value.tagName === "message") {
								messaggio = value.innerHTML;
							}
						}
					}
					//	messaggio = this.XMLerror(error.responseText);
				} catch (e2) {
					messaggio = this.getResourceBundle().getText("error");
				}
			}
			return messaggio;
		},

		_refreshModel: function(oModel) {
			oModel.setData([]);
		},
		
		//***********LOGICA GENERICA INPUT SUGGEST + FILTRI IN COMPOUND*********
		
		_filtersInCompound: function(sProperty, sVal) {
			if (sVal !== undefined && sVal !== "") {
					var sFilter = new Filter(sProperty, FilterOperator.EQ, sVal);
				}
			return sFilter;
		},
		
		_filtersOperatorContains: function(sProperty, sVal) {
			if (sVal !== undefined && sVal !== "") {
					var sFilter = new Filter(sProperty, FilterOperator.Contains, sVal);
				}
			return sFilter;
		},
		
		_aOrFiltersCond: function(sProperty, sTerm) {
					var aOrFiltersCond = new Filter({
						filters: [
							new Filter(sProperty, FilterOperator.Contains, sTerm)
						],
						and: false
					});
				return aOrFiltersCond;
		},
		
		_aAndFiltersCond: function(aOrFilters, aCompoundFilters) {
			var aAndFiltersCond = new Filter({
					filters: [
						aOrFilters
					],
					and: true
				});
				if (aCompoundFilters) {
					for (var i = 0; i < aCompoundFilters.length; i++) {
						aAndFiltersCond.aFilters.push(aCompoundFilters[i]);
					}
				}
				return aAndFiltersCond;
		},
		
		_onSuggestGeneric : function(oInput, sTerm, sPath, sText, sAddText, aAndFilters) {
			if (!oInput.getSuggestionItems().length) {
					oInput.bindAggregation("suggestionItems", {
						path: sPath,
						template: new sap.ui.core.ListItem({
							text: sText,
							additionalText: sAddText
						})
					});
				}
				oInput.getBinding("suggestionItems").filter(aAndFilters);
			},
		
		//***********FINE LOGICA GENERICA INPUT SUGGEST + FILTRI IN COMPOUND*********
		
		//*********************ONSEARCH FILTERBAR - RIEMPIMENTO TABELLA DINAMICO**********************************
		_remove: function(arr, what) {
			var found = arr.indexOf(what);

			while (found !== -1) {
				arr.splice(found, 1);
				found = arr.indexOf(what);
			}
		},

		_onSearchFbTreeT: function(sIdTreeTable, sIdFilterbar, sTreeTableBindingPath) {

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
			if (sValue !== undefined & sValue !== "") {
					var oFilter = new sap.ui.model.Filter(sFilterName, "EQ", sValue);
					return oFilter;
				}
			});
			// console.log(aFilters);
			this._remove(aFilters, undefined);

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
			
			//Azzera la selezione delle righe
			var oItems = oTreeTable.getRows();
			for (var j = 0; j < oItems.length; j++) {
			oItems[j].getAggregation("cells")[0].setSelected(false);
			}
		},
		
		//************************LOGICA PER ESTRARRE RIGA SELEZIONATA DELLA TREETABLE*******************
			//CHECK NOMI PROPRIETA' DELL'ENTITY
			_rowSel: function(event) {
			var that = this;
			var oTable = this.getView().byId("treeTablePFID");
			var aSelectedPath = [];
			var oItems = oTable.getRows();
			for (var j = 0; j < oItems.length; j++) {
				var bCheckboxStatus = oItems[j].getAggregation("cells")[0].getSelected();
				if (bCheckboxStatus) {
					if(oItems[j].getBindingContext()){
						aSelectedPath.push(oItems[j].getBindingContext().getPath());
					}
				}
			}

			if (aSelectedPath.length > 0) {
				// mi prendo la proprietà che mi interessa
				var aRows = [];
				for (var i = 0; i < aSelectedPath.length; i++) {
					var sPosFin = this.getView().getModel().getProperty(aSelectedPath[i]).Posfin;
					var sIdPosFin = this.getView().getModel().getProperty(aSelectedPath[i]).IdPosfin;
					var sIdProposta = this.getView().getModel().getProperty(aSelectedPath[i]).Id;
					var sCodiFincode = this.getView().getModel().getProperty(aSelectedPath[i]).CodiFincode;
					var sIter = this.getView().getModel().getProperty(aSelectedPath[i]).Iter;
					var sTipo = this.getView().getModel().getProperty(aSelectedPath[i]).Tipo;
					var sNickname = this.getView().getModel().getProperty(aSelectedPath[i]).Nickname;
					var oData = {
						"IdPosfin": sIdPosFin,
						"IdProposta": sIdProposta,
						"CodiFincode": sCodiFincode,
						"Posfin": sPosFin,
						"Iter": sIter,
						"Tipo": sTipo,
						"Nickname": sNickname
					};
					aRows.push(oData);
					that.getView().getModel("modelPageTab").setData(aRows);
				}
			}
		},
		
	/*	_resetCheckbox: function(sModel, oTable) {
            var aObject = Object.keys(this.getView().getModel(sModel).oData);
            var aData = this.getView().getModel(sModel).oData;
           if(aObject.length > 0) {
           for (var i = 0; i < aObject.length; i++) {
                // aData[aObject[i]].SELECTED = false;
                if(aData[aObject[i]].SELECTED) {
                this.getView().getModel(sModel).setProperty(aData[aObject[i]].SELECTED, false);
                }
            }
           }
           //this.getView().byId(oTable).clearSelection();
        },*/
         _resetCheckbox: function(sModel) {
            var aObject = Object.keys(this.getView().getModel(sModel).oData);
            var aData = this.getView().getModel(sModel).oData;

           for (var i = 0; i < aObject.length; i++) {
                aData[aObject[i]].SELECTED = false
            }

           this.getView().getModel(sModel).refresh();
        },
        
        _gestTipologiche: function() {
				var that = this; 
				var oDataModel = this.getView().getModel("modelGestTipologicheSRV");
				oDataModel.read("/ZES_FOTO_ANNO_SET(TYPE_KEY='SCH_AMM')", {
				success: function(response) {
				// console.log(response);
				that.getView().getModel("gestTipologicheModel").setData(response);
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
			
			_convertStringTime: function(str) {
			  var date = new Date(str),
			    mnth = ("0" + (date.getMonth() + 1)).slice(-2),
			    day = ("0" + date.getDate()).slice(-2);
			  return [date.getFullYear(), mnth, day].join("-");
			},
			
			onlyInteger: function (oEvent) {
	            var value = oEvent.getSource().getValue().replace(/[^\d]/g, '');
	            oEvent.getSource().setValue(value);
			}
			
	});
});