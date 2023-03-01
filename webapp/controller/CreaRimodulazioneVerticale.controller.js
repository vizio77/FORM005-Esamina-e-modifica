sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageBox",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/BusyIndicator"
], function(Controller, BaseController, Fragment, Filter, FilterOperator, JSONModel, MessageBox, syncStyleClass, BusyIndicator) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.CreaRimodulazioneVerticale", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.CreaRimodulazioneVerticale
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			//this.aRows = [];
			this.aCheckCedente = [];
			this._oModelTableRimodulazione = new sap.ui.model.json.JSONModel();
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			// this.oRouter.getRoute("CreaRimodulazioneVerticale").attachMatched(this._onRouteMatched, this);
		},

		/*_onRouteMatched: function(oEvent) {
		// this.sRouterParameter = oEvent.getParameters().arguments.Page;
		this._gestTipologiche();
		},*/

		onPressNavToCreaId: function(oEvt) {
			var oPage = this.getView().getModel("i18n").getResourceBundle().getText("titleCreaRV");
			oPage = oPage.replace(" ", "");
			this.oRouter.navTo("GestisciID", {
				ID: oPage
			});
		},

		onPressMenuScegliProposta: function(oEvent) {
			if (this.getView().byId("idPropostaCreaRV").getValue()) {
				//alert("Cambiare id proposta? Se si il numero viene attualmente bloccato viene sbloccato.");
				/*sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SbloccoID"), {
					duration: 4000,
					width: "35em",
					my: "center center",
					at: "center center",
					autoClose: false
				});*/
			}
			var oButton = oEvent.getSource();
			var oView = this.getView();

			var that = this;
			// create menu only once
			if (!this._menuIDPropostaRV) {
				this._menuIDPropostaRV = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.MenuIDPropostaRV",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			// ACTIONS REPEATED EVERY TIME
			this._menuIDPropostaRV.then(function(oDialog) {
				var eDock = sap.ui.core.Popup.Dock;
				oDialog.open(that._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

				var oItemMenuIdEsistente = oDialog.getAggregation("items")[0];
				oItemMenuIdEsistente.setVisible(true);
				var oItemMenuIdNuovo = oDialog.getAggregation("items")[1];
				oItemMenuIdNuovo.setVisible(true);

				oDialog.open(oButton);
			});
		},

		handleMenuItemPressIdPropostaRV: function(oEvent) {
			var optionPressed = oEvent.getParameter("item").getText();
			var oButton = oEvent.getSource();
			var oView = this.getView();
			var sIdPropostaView = oView.byId("idPropostaCreaRV").getValue();

			//CREA IL DIALOG UNA SOLA VOLTA
			if (!this._IdPropostaRV) {
				this._IdPropostaRV = Fragment.load({
					id: oView.getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.idPropostaInputRV",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}
			//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
			this._IdPropostaRV.then(function(oDialog) {

				if (optionPressed.toUpperCase() === "SCEGLI ID PROPOSTA ESISTENTE") {
					if (!sIdPropostaView) {
						oView.byId("IdPropostaRV").setValue("");
						oView.byId("IdPropostaRV").setShowValueHelp(true);
						oView.byId("IdPropostaRV").setEditable(true);
					}
				}
				oDialog.open(oButton);
			});
		},

		lockId: function() {
			var sPath = this._sPathSelectedProp;
			var oTableModelRV = this.getView().getModel("modelTableRV");
			oTableModelRV.setData(null);
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			BusyIndicator.show(0);

			oGlobalModel.read(sPath, {
				urlParameters: {
					"$expand": ["PosFinRimVertSet"]

				},
				success: function(oData, oResponse) {
					if (oData.Keycodepr !== "" && oData.Idproposta !== "") {
						oTableModelRV.setData(oData);
						this.getView().byId("idPropostaCreaRV").setSelectedKey(oData.Keycodepr);
						this.getView().byId("idPropostaCreaRV").setValue(oData.Idproposta);
						if (oData.Annomin === "" || oData.Annomin === "0000") {
							this.getView().byId("idAnnoCreaRV").setEditable(true);
						}
						this.getView().byId("idBtnScegliPosFin").setEnabled(true);
						if (oTableModelRV.getData().PosFinRimVertSet.results.length > 0) {
							this._fillTable();
						} else {
							this.getView().byId("idBtnVisualizza").setVisible(false);
							this.getView().byId("idBtnAvvio").setVisible(true);
							this.getView().byId("idBtnScegliPosFin").setVisible(true);
						}
						var oFrame = this.getView().byId("linkSac");
						this.urlSac = "";
						var oFrameContent = oFrame.$()[0];
						oFrameContent.setAttribute("src", this.urlSac);

						BusyIndicator.hide();
						this.closeInputProposta();
					}
				}.bind(this),
				error: function(oError) {
					MessageBox.error(oError.responseText);
					BusyIndicator.hide();
				}
			});
		},

		closeInputProposta: function() {
			//this.getView().byId("idPropostaCreaRV").setValue("");
			if (this.getView().byId("dialogIdPropostaRV")) {
				this.getView().byId("dialogIdPropostaRV").close();
			}

		},

		_fillTable: function() {
			var oTable = this.getView().byId("idTableCreaRV");
			var oTemplate;
			var that = this;

			oTemplate = new sap.m.ColumnListItem({
				vAlign: "Middle",
				cells: [
					new zsap.com.r3.cobi.s4.custposfin.z_s4_zposfinlink.controls.LinkPosizioneFinanziaria({
						text: "{modelTableRV>Fipex}",
						fikrs: "{modelTableRV>Fikrs}",
						anno: "{modelTableRV>Anno}",
						fase: "{modelTableRV>Fase}",
						reale: "{modelTableRV>Reale}",
						versione: "{modelTableRV>Versione}",
						fipex: "{modelTableRV>Fipex}",
						datbis: "{= ${modelTableRV>Datbis}.replaceAll('-', '')}"
					}),
					new sap.m.Text({
						text: "{modelTableRV>Fincode}",
						width: "22em"
					}),
					new sap.m.Text({
						text: "{modelTableRV>Beschr}",
						width: "22em"
					}),
					new sap.m.Text({
						text: "{= ${modelTableRV>Cedric}.toUpperCase()}"
					})
				]
			});

			oTable.bindAggregation("items", "modelTableRV>/PosFinRimVertSet/results", oTemplate);
			//Logica bottoni SAP
			var oBtnVisualizza = this.getView().byId("idBtnVisualizza");
			var sIter = this.getView().getModel("modelTableRV").getData().Iter;
			var oBtnAvvio = this.getView().byId("idBtnAvvio");
			var oBtnScegliCedRic = this.getView().byId("idBtnScegliPosFin");
			if (sIter.toUpperCase() !== "01") {
				oBtnVisualizza.setVisible(true);
				oBtnAvvio.setVisible(false);
				oBtnScegliCedRic.setVisible(false);
			} else {
				oBtnVisualizza.setVisible(false);
				oBtnAvvio.setVisible(true);
				oBtnScegliCedRic.setVisible(true);
			}
		},

		onPressOnOffTable: function(oEvent) {
			if (oEvent.getSource().getPressed()) {
				this.getView().byId("idTableCreaRV").setVisible(true);
			} else {
				this.getView().byId("idTableCreaRV").setVisible(false);
			}
		},

		onPressScegliPF: function(oEvent) {
			//verifico se esiste già un CEDENTE in tabella
			var oModelTableRV = this.getOwnerComponent().getModel("modelTableRV");
			var sPath;
			var aDatiTabella = oModelTableRV.getData(sPath).PosFinRimVertSet.results;
			var sCedente = "";
			for (var i = 0; i < aDatiTabella.length; i++) {
				if (aDatiTabella[i].Cedric.toUpperCase() === "CEDENTE") {
					sCedente = aDatiTabella[i].Cedric;
				}
			}

			var oView = this.getView();
			var sValIDProposta = this.getView().byId("idPropostaCreaRV").getValue();
			var sValAnno = this.getView().byId("idAnnoCreaRV").getValue();
			var that = this;
			if (sValIDProposta && sValAnno !== "" && sValAnno !== "0000") {
				if (!this._oDialogPF) {
					this._oDialogPF = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpScegliPFPageRV",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oPopover);
						return oPopover;
					});
				}
				this._oDialogPF.then(function(oPopover) {
					if (sCedente) {
						that.getView().byId("idCedente").setSelected(false);
						that.getView().byId("idCedente").setEditable(false);
						that.getView().byId("idRicevente").setSelected(true);
					} else {
						that.getView().byId("idCedente").setSelected(true);
						that.getView().byId("idCedente").setEditable(true);
						that.getView().byId("idRicevente").setSelected(false);
					}
					oPopover.open();

				});
			} else {
				MessageBox.warning("Per scegliere un cedente selezionare ID Proposta ed Anno di riferimento.");
			}
			//se esiste già un cedente rendo il radiobutton CEDENTE non editabile e sposto automaticamente la selezione su RICEVENTE
			/*if (sCedente) {
				this.getView().byId("idCedente").setSelected(false);
				this.getView().byId("idCedente").setEditable(false);
				this.getView().byId("idRicevente").setSelected(true);
			} else {
				this.getView().byId("idCedente").setSelected(true);
				this.getView().byId("idCedente").setEditable(true);
				this.getView().byId("idRicevente").setSelected(false);
			}*/
		},

		//riempimento tabella con nuovi cedenti/riceventi
		onPressOkPopupScegliPF: function(oEvent) {
			var aTableRows = this.getOwnerComponent().getModel("modelTableRV").getData().PosFinRimVertSet.results;
			var sValIDProposta = this.getView().byId("idPropostaCreaRV").getValue();
			var sValAnno = this.getView().byId("idAnnoCreaRV").getValue();
			var sValPF = this.getView().byId("idInputPFRV").getValue();
			var sValCodifincode = this.getView().byId("idInputAutRV").getSelectedKey();
			var sValAut = this.getView().byId("idInputAutRV").getValue();
			var sRadioSel;
			if (this.getView().byId("idRicevente").getSelected()) {
				sRadioSel = "Ricevente";
			} else {
				sRadioSel = "Cedente";
			}

			if (sValIDProposta && sValPF && sValAnno && sValAut && sRadioSel) {
				var oData = {
					"Idproposta": sValIDProposta,
					"Fipex": sValPF,
					"IdStAmmResp": "",
					"Fincode": sValCodifincode,
					"Beschr": sValAut,
					"Cedric": sRadioSel,
					"AggiuntaUtente": true
				};

				if (sRadioSel === "Cedente") {
					for (var i = 0; i < aTableRows.length; i++) {

						if (aTableRows[i].Cedric.toUpperCase() === "CEDENTE") {
							this.aCheckCedente.push(aTableRows[i]);
						}
					}
					if (this.aCheckCedente.length >= 1) {
						MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBMax1Cedente"));
					} else {
						aTableRows.push(oData);
						this.getOwnerComponent().getModel("modelTableRV").setProperty("PosFinRimVertSet.results", aTableRows);
					}
				} else {
					//CHECK SE RICEVENTE SCELTO NON SIA GIA' PRESENTE COME CEDENTE
					for (var x = 0; x < aTableRows.length; x++) {

						if (aTableRows[x].Fipex === sValPF && aTableRows[x].Fincode === sValCodifincode) {
							MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBMaxRiceventeUgualeCedente"));
							return;
						} else {
							this.aCheckCedente.push(aTableRows[i]);
						}
					}
					aTableRows.push(oData);
					this.getOwnerComponent().getModel("modelTableRV").setProperty("PosFinRimVertSet.results", aTableRows);
				}
				var oTable = this.getView().byId("idTableCreaRV");

				var oTemplate;
				var that = this;

				oTemplate = new sap.m.ColumnListItem({
					vAlign: "Middle",
					cells: [
						new zsap.com.r3.cobi.s4.custposfin.z_s4_zposfinlink.controls.LinkPosizioneFinanziaria({
							text: "{modelTableRV>Fipex}",
							fikrs: "{modelTableRV>Fikrs}",
							anno: "{modelTableRV>Anno}",
							fase: "{modelTableRV>Fase}",
							reale: "{modelTableRV>Reale}",
							versione: "{modelTableRV>Versione}",
							fipex: "{modelTableRV>Fipex}",
							datbis: "{= ${modelTableRV>Datbis}.replaceAll('-', '')}"
						}),
						new sap.m.Text({
							text: "{modelTableRV>Fincode}",
							width: "22em"
						}),
						new sap.m.Text({
							text: "{modelTableRV>Beschr}"
						}),
						new sap.m.Text({
							text: "{= ${modelTableRV>Cedric}.toUpperCase()}"
						}),
						new sap.m.Button({
							type: "Transparent",
							tooltip: "{i18n>Annulla}",
							icon: "sap-icon://undo",
							press: [that.onPressDeleteRow, that],
							visible: "{= ${modelTableRV>AggiuntaUtente} ? true : false}"
						})
					]
				});

				oTable.bindAggregation("items", "modelTableRV>/PosFinRimVertSet/results", oTemplate);

				this.getView().byId("idInputPFRV").setValue("");
				this.getView().byId("idInputAutRV").setValue("");
				this.getView().byId("idInputAutRV").setEnabled(false);
				//this.getView().byId("idAnnoCreaRV").setEnabled(false);
				this.getView().byId("idRicevente").setSelected(true);
				this.onPressChiudiPopupScegliPF();
			}
		},

		onPressDeleteRow: function(e) {
			var oTable = this.getView().byId("idTableCreaRV");
			var oModel = this.getOwnerComponent().getModel("modelTableRV");
			var sPath = e.getSource().getBindingContext("modelTableRV").getPath();
			sPath = sPath.substring(sPath.lastIndexOf("/") + 1);

			var aObj = oModel.getData().PosFinRimVertSet.results;
			aObj.splice(sPath, 1);
			oModel.setProperty("PosFinRimVertSet.results", aObj);
			oTable.getBinding("items").refresh();
			if (aObj.length === 0) {
				// this.getView().byId("idPropostaCreaRV").setValue("");
				// this.getView().byId("idPropostaCreaRV").setEnabled(true);
				// this.getView().byId("idAnnoCreaRV").setValue("");
				// this.getView().byId("idAnnoCreaRV").setEnabled(true);
			}
		},

		onChoosePF: function(oEvent) {
			this.getView().byId("idInputPFRV").setValue(oEvent.getParameter("rowContext").getObject().Fipex);
			this.getView().byId("idInputAutRV").setEnabled(true);
			this.onPressChiudiPopupScegliPFRV();
		},

		onPressChiudiPopupScegliPF: function(oEvent) {
			var oDialogPF = this.getView().byId("idPopupScegliPF");
			this.getView().byId("idInputPFRV").setValue("");
			this.getView().byId("idInputAutRV").setValue("");
			oDialogPF.close();
		},

		onPressChiudiPopupScegliPFRV: function(oEvent) {
			var oDialogPF = this.getView().byId("idPopupScegliPFRV");
			this.getView().byId("CapitoloRV").setValue("");
			this.getView().byId("PGRV").setValue("");
			oDialogPF.close();
		},

		_getTableData: function() {
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oTableModel = this.getView().getModel("modelTableRV");
			var aItems = oTableModel.getData().PosFinRimVertSet.results;

			var aItemData = [];

			for (var iRowIndex = 0; iRowIndex < aItems.length; iRowIndex++) {
				var sKeycodepr = this.getView().byId("idPropostaCreaRV").getSelectedKey();
				// var sKeycodepr = aItems[iRowIndex].Keycodepr;
				// var sAnnomin = aItems[iRowIndex].Annomin;
				var sFipex = aItems[iRowIndex].Fipex;
				var sFincode = aItems[iRowIndex].Fincode;
				var sBeschr = aItems[iRowIndex].Beschr;
				var sCedric = aItems[iRowIndex].Cedric;

				//ITEMS PER ROW
				aItemData.push({
					Idproposta: sKeycodepr,
					Anno: "",
					PosFin: sFipex,
					Autorizzazione: sFincode,
					Beschr: sBeschr,
					Cedric: sCedric.toUpperCase()
				});
			}
			return [oGlobalModel, aItemData];
		},

		_refresh: function() {
			var urlSac = this.urlSac;
			window.frames[0].location = urlSac + (new Date());
		},

		_getSchedaSac: function() {
			var aValues = this._getTableData();
			var oGlobalModel = aValues[0];
			var aEntries = aValues[1];

			var that = this;
			this.urlSac = "";

			oGlobalModel.setUseBatch(false);

			var sKeycodepr = this.getView().byId("idPropostaCreaRV").getSelectedKey();

			oGlobalModel.create("/Avvio_RimVertSet", {
				"Idproposta": sKeycodepr,
				"PosFin": "DELETE"
			}, {
				success: function(oData, oResponse) {
					for (var i = 0; i < aEntries.length; i++) {
						var sAnno = that.getView().byId("idAnnoCreaRV").getValue();
						sAnno = new Date(sAnno).getFullYear().toString();
						aEntries[i].Anno = sAnno;

						oGlobalModel.create("/Avvio_RimVertSet", aEntries[i], {
							success: function(oData, oResponse) {
								that.urlSac = oData.Url;
								var oFrame = that.getView().byId("linkSac");
								var oFrameContent = oFrame.$()[0];
								oFrameContent.setAttribute("src", that.urlSac);
								that._refresh();
							},
							error: function(oError) {
								MessageBox.error(oError.responseText);
							}
						});
					}
				},
				error: function(oError) {
					MessageBox.error(oError.responseText);
				}
			});

		},

		onPressAvvioSac: function(oEvt) {
			var aCedenti = [];
			var aRiceventi = [];

			var aTableItems = this.getView().byId("idTableCreaRV").getItems();
			if (aTableItems.length !== 0) {

				for (var i = 0; i < aTableItems.length; i++) {
					if (aTableItems[i].getBindingContext("modelTableRV").getModel().getData().PosFinRimVertSet.results[i].Cedric.toUpperCase() ===
						"CEDENTE") {
						aCedenti.push(aTableItems[i]);
					} else if (aTableItems[i].getBindingContext("modelTableRV").getModel().getData().PosFinRimVertSet.results[i].Cedric.toUpperCase() ===
						"RICEVENTE") {
						aRiceventi.push(aTableItems[i]);
					}
				}
				if (aCedenti.length === 1 && aRiceventi.length > 0) {
					this._getSchedaSac();
				} else {
					MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MSGRVAvvioErrorCedRic"));
				}
			} else {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MSGRVAvvioError"));
			}
		},

		onPressResetta: function() {
			this.getView().byId("idPropostaCreaRV").setValue("");
			this.getView().byId("idPropostaCreaRV").setEnabled(true);
			this.getView().byId("idAnnoCreaRV").setValue("");
			this.getView().byId("idAnnoCreaRV").setEditable(false);
			var oTable = this.getView().byId("idTableCreaRV");
			var oModel = this.getOwnerComponent().getModel("modelTableRV");
			var aObjData = [];
			oModel.setData(aObjData);
			if (oTable.getItems().length > 0) {
				oTable.getBinding("items").refresh();
			}
			this.aRows = [];
			var oFrame = this.getView().byId("linkSac");
			var oFrameContent = oFrame.$()[0];
			oFrameContent.setAttribute("src", "");
		},

		onPressChoosePosFin: function(oEvent) {
			var that = this;
			var oView = this.getView();
			var sInputIdProp = this.getView().byId("idPropostaCreaRV").getValue();
			var fIdprop;
			var aFilters = [];
			if (sInputIdProp !== undefined && sInputIdProp !== "") {
				fIdprop = new Filter("Keycodepr", FilterOperator.EQ, sInputIdProp);
				aFilters.push(fIdprop);
			}

			if (!this._ChoosePFRV) {
				this._ChoosePFRV = Fragment.load({
					id: that.getView().getId(),
					name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpScegliPFRVWithFilters",
					controller: this
				}).then(function(oDialog) {
					oView.addDependent(oDialog);
					syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
					return oDialog;
				});
			}

			//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
			this._ChoosePFRV.then(function(oDialog) {
				that.getView().byId("TablePosFinRV").getBinding("rows").filter(aFilters);
				oDialog.open();
			});
		},

		//METODI FILTRI INPUT

		onChange: function(oEvent, inputRef) {
			if (inputRef === "idInputPFRV") {
				var sInputPosFin = this.getView().byId("idInputPFRV").getValue();
				if (sInputPosFin) {
					this.getView().byId("idInputAutRV").setEnabled(true);
				} else {
					this.getView().byId("idInputAutRV").setEnabled(false);
				}
			}
			var sSelectedVal;
			if (inputRef === "CapitoloRV") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("PGRV");
				}
			}
			if (inputRef === "PGRV") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("PGRV");
				}
			}
		},

		onChangeInputIdPropostaCreaRV: function(oEvent) {
			var oInput = this.getView().byId("idPropostaCreaRV");
			var sInputIdProposta = this.getView().byId("idPropostaCreaRV").getValue();
			if (sInputIdProposta) {
				this.getView().byId("idBtnScegliPosFin").setEnabled(true);
				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var sIdproposta = oDataModel.getData(this._sPathSelectedProp).Idproposta;
				this.byId("idPropostaCreaRV").setValue(sIdproposta);
				this.lockId();
			} else {
				this.getView().byId("idBtnScegliPosFin").setEnabled(false);
			}
		},

		onSuggest: function(oEvent, inputRef) {
			var oInput, sTerm, aOrFilters, aAndFilters;
			var aCompoundFilters;
			var oFilterProposta, oFilterPosFin;
			var sPropostaValue, sPosFinValue;

			if (inputRef === "idInputPFRV") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Fipex", sTerm);

				//Filtri in compound
				sPropostaValue = this.getView().byId("idPropostaCreaRV").getValue();
				aCompoundFilters = [];

				oFilterProposta = this._filtersInCompound("Idproposta", sPropostaValue);
				aCompoundFilters.push(oFilterProposta);

				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/PosFinRimVertSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Fipex}", "",
					aAndFilters);
			}

			if (inputRef === "idInputAutRV") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Beschr", sTerm);

				//Filtri in compound
				sPosFinValue = this.getView().byId("idInputPFRV").getValue();
				aCompoundFilters = [];

				oFilterPosFin = this._filtersInCompound("Fipex", sPosFinValue);
				aCompoundFilters.push(oFilterPosFin);

				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/Auth_RimVertSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Beschr}",
					"", aAndFilters);
			}

			var sAmminValFb, oFilterAmm;
			if (inputRef === "CapitoloRV") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizionecapitolo", sTerm);

				//Filtri in compound
				sAmminValFb = this.getView().byId("Amministrazione").getText();
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				aCompoundFilters.push(oFilterAmm);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CAPITOLOSet", "{Codicecapitolo}", "{Descrizionecapitolo}", aAndFilters);
			}
			if (inputRef === "PGRV") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizionepg", sTerm);

				//Filtri in compound
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				var sCapitoloValFb = this.getView().byId("CapitoloRV").getValue();
				var oFilterCap = this._filtersInCompound("Codicecapitolo", sCapitoloValFb);
				aCompoundFilters.push(oFilterAmm, oFilterCap);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_PIANGESSet", "{Codicepg}", "{Descrizionepg}", aAndFilters);
			}
		},

		onSuggestIdPropostaCreaRV: function(oEvent) {
			var oInput, sTerm, aOrFilters, aAndFilters;
			oInput = oEvent.getSource();
			sTerm = oEvent.getParameter("suggestValue").toUpperCase();
			//Filtri campo ricerca suggest
			aOrFilters = this._aOrFiltersCond("Nickname", sTerm);
			//Filtri in compound assenti
			aAndFilters = this._aAndFiltersCond(aOrFilters);
			this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/PropostaRimVertSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Idproposta}",
				"{ZSS4_COBI_PRSP_ESAMOD_SRV>Nickname}", aAndFilters);
		},

		onSuggestIdPropostaRV: function(oEvent) {
			var oInput = oEvent.getSource();
			var sTerm = oEvent.getParameter("suggestValue").toUpperCase();

			//Filtri campo ricerca suggest
			var aOrFilters = this._aOrFiltersCond("Nickname", sTerm);

			//Filtri in compound assenti
			var aAndFilters = this._aAndFiltersCond(aOrFilters);

			this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/PropostaRimVertSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Idproposta}",
				"{ZSS4_COBI_PRSP_ESAMOD_SRV>Nickname}", aAndFilters);

		},

		onValueHelpRequest: function(oEvent, inputRef) {
			var sInputValue, oView, aOrFiltersCond, aFilters, arrayProperties;
			var oModelGlobal = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oModelAF = this.getView().getModel();
			var sInputIDProposta, sInputPosFin;
			var fIdProposta, fPosFin;

			sInputValue = oEvent.getSource().getValue();
			oView = this.getView();

			if (inputRef === "idInputPFRV") {
				sInputIDProposta = this.getView().byId("idPropostaCreaRV").getValue();

				if (!this.idInputPFRV) {
					this.idInputPFRV = this.createValueHelpDialog(
						"idInputPFRV",
						oModelGlobal,
						"ZSS4_COBI_PRSP_ESAMOD_SRV",
						"{i18n>PosFin}",
						"/PosFinRimVertSet",
						"Fipex",
						"");
				}
				// Create a filter for the binding
				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Fipex", FilterOperator.Contains, sInputValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sInputIDProposta !== undefined && sInputIDProposta !== "") {
					fIdProposta = new Filter("Idproposta", FilterOperator.EQ, sInputIDProposta);
					aFilters.aFilters.push(fIdProposta);
				}
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				this.idInputPFRV.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idInputPFRV.open(sInputValue);
			}

			if (inputRef === "idInputAutRV") {
				sInputPosFin = this.getView().byId("idInputPFRV").getValue();
				if (!this.idInputAutRV) {
					this.idInputAutRV = this.createValueHelpDialog(
						"idInputAutRV",
						oModelGlobal,
						"ZSS4_COBI_PRSP_ESAMOD_SRV",
						"{i18n>PosFin}",
						"/Auth_RimVertSet",
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
				if (sInputPosFin !== undefined && sInputPosFin !== "") {
					fPosFin = new Filter("Fipex", FilterOperator.EQ, sInputPosFin);
					aFilters.aFilters.push(fPosFin);
				}
				// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
				this.idInputAutRV.getBinding("items").filter(aFilters);
				this.idInputAutRV.open(sInputValue);
			}

			var sAmminVal;
			var fAmm;
			if (inputRef === "CapitoloRV") {
				sAmminVal = this.getView().byId("Amministrazione").getText();

				if (!this.Capitolo) {
					this.Capitolo = this.createValueHelpDialog(
						"CapitoloRV",
						oModelAF,
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

			if (inputRef === "PGRV") {
				sAmminVal = this.getView().byId("Amministrazione").getText();
				var sCapitoloVal = this.getView().byId("CapitoloRV").getValue();
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
						"PGRV",
						oModelAF,
						"",
						"{i18n>PG}",
						"/ZCA_AF_PIANGESSet",
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
					var fCap = new Filter("Codicecapitolo", FilterOperator.EQ, sCapitoloVal);
					aFilters.aFilters.push(fCap);
				}
				this.PG.getBinding("items").filter(aFilters);
				this.PG.open(sInputValue);
			}
		},

		onValueHelpRequestIdPropostaCreaRV: function(oEvent) {
			var sInputValue, aOrFiltersCond, arrayProperties;
			var oModelGlobal = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			sInputValue = oEvent.getSource().getValue();
			arrayProperties = [{
				"property": "Idproposta",
				"label": "{i18n>Proposta}"
			}, {
				"property": "Nickname",
				"label": "{i18n>NickName}"
			}, {
				"property": "Desciter",
				"label": "{i18n>Iter}"
			}, {
				"property": "Desctipolpro",
				"label": "{i18n>Tipologia}"
			}, {
				"property": "Zbilch279Key",
				"label": "{i18n>RimodVertEsistente}"
			}];
			if (!this.IdPropostaRV) {
				this.IdPropostaRV = this.createValueHelpTableSelectDialog(
					"idPropostaCreaRV",
					oModelGlobal,
					"ZSS4_COBI_PRSP_ESAMOD_SRV",
					"{i18n>Proposta}",
					"/PropostaRimVertSet",
					arrayProperties);
			}
			// Create a filter for the binding
			aOrFiltersCond =
				new Filter({
					filters: [
						new Filter("Idproposta", FilterOperator.Contains, sInputValue)
					],
					and: false
				});
			// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
			this.IdPropostaRV.getBinding("items").filter(aOrFiltersCond);
			// Open ValueHelpDialog filtered by the input's value
			this.IdPropostaRV.open(sInputValue);
		},

		onValueHelpRequestIdPropostaRV: function(oEvent) {
			var sInputValue, oView, aOrFiltersCond, aFilters, arrayProperties;
			var oModelGlobal = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oModelAF = this.getView().getModel();
			var sInputIDProposta, sInputPosFin;
			var fIdProposta, fPosFin;

			sInputValue = oEvent.getSource().getValue();
			oView = this.getView();
			arrayProperties = [{
				"property": "Idproposta",
				"label": "{i18n>Proposta}"
			}, {
				"property": "Nickname",
				"label": "{i18n>NickName}"
			}, {
				"property": "Desciter",
				"label": "{i18n>Iter}"
			}, {
				"property": "Desctipolpro",
				"label": "{i18n>Tipologia}"
			}, {
				"property": "Zbilch279Key",
				"label": "{i18n>RimodVertEsistente}"
			}];
			if (!this.IdPropostaRV) {
				this.IdPropostaRV = this.createValueHelpTableSelectDialog(
					"IdPropostaRV",
					oModelGlobal,
					"ZSS4_COBI_PRSP_ESAMOD_SRV",
					"{i18n>Proposta}",
					"/PropostaRimVertSet",
					arrayProperties);
			}
			// Create a filter for the binding
			aOrFiltersCond =
				new Filter({
					filters: [
						new Filter("Idproposta", FilterOperator.Contains, sInputValue)
					],
					and: false
				});
			// non dovrebbe succedere ma evita il dump su BE nel caso fosse null
			this.IdPropostaRV.getBinding("items").filter(aOrFiltersCond);
			// Open ValueHelpDialog filtered by the input's value
			this.IdPropostaRV.open(sInputValue);
		},

		onValueHelpSearch: function(oEvent, inputRef) {
			var sValue, aOrFiltersCond, aFilters;
			sValue = oEvent.getParameter("value");
			var sInputIdProp, sInputPosFin;
			var fIdprop, fPosFin;
			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			if (inputRef === "idPropostaCreaRV") {

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

			if (inputRef === "idInputPFRV") {
				sInputIdProp = this.getView().byId("idPropostaCreaRV").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Fipex", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sInputIdProp !== undefined && sInputIdProp !== "") {
					fIdprop = new Filter("Idproposta", FilterOperator.EQ, sInputIdProp);
					aFilters.aFilters.push(fIdprop);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			if (inputRef === "idInputAutRV") {
				sInputPosFin = this.getView().byId("idInputPFRV").getValue();

				aOrFiltersCond =
					new Filter({
						filters: [
							new Filter("Beschr", FilterOperator.Contains, sValue)
						],
						and: false
					});
				aFilters = new Filter({
					filters: [
						aOrFiltersCond
					],
					and: true
				});
				if (sInputPosFin !== undefined && sInputPosFin !== "") {
					fPosFin = new Filter("Fipex", FilterOperator.EQ, sInputPosFin);
					aFilters.aFilters.push(fPosFin);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}

			var sAmminVal, fAmm;
			if (inputRef === "CapitoloRV") {
				sAmminVal = this.getView().byId("Amministrazione").getText();

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

			if (inputRef === "PGRV") {
				sAmminVal = this.getView().byId("Amministrazione").getValue();
				var sCapitoloVal = this.getView().byId("CapitoloRV").getValue();

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
					var fCap = new Filter("Codicecapitolo", FilterOperator.EQ, sCapitoloVal);
					aFilters.aFilters.push(fCap);
				}
				oEvent.getSource().getBinding("items").filter(aFilters);
			}
		},

		onValueHelpConfirm: function(oEvent, inputRef) {
			var oSelectedItem, sPath;

			oSelectedItem = oEvent.getParameter("selectedItem");

			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			if (inputRef === "IdPropostaRV") {
				this._onValueHelpConfirmIdPropostaRV(oEvent);
			}

			if (inputRef === "idPropostaCreaRV") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					this._sPathSelectedProp = "";
					return;
				}
				this._sPathSelectedProp = oSelectedItem.getBindingContextPath();
				var sIdproposta = oDataModel.getData(this._sPathSelectedProp).Idproposta;
				this.byId("idPropostaCreaRV").setValue(sIdproposta);
			}

			if (inputRef === "idInputPFRV") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContextPath();
				var sFipex = oDataModel.getData(sPath).Fipex;
				this.getView().byId("idInputPFRV").setValue(sFipex);
				this.getView().byId("idInputAutRV").setEnabled(true);
				// this._AutRead();
			}

			if (inputRef === "idInputAutRV") {
				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContextPath();
				var sFincode = oDataModel.getData(sPath).Fincode;
				var sAut = oDataModel.getData(sPath).Beschr;
				this.getView().byId("idInputAutRV").setSelectedKey(sFincode);
				this.getView().byId("idInputAutRV").setValue(sAut);
			}

			if (inputRef === "CapitoloRV") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("PGRV");
					return;
				}
				this.byId("CapitoloRV").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "PGRV") {
				// var oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("CapitoloRV");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				var sCapitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicecapitolo;
				var sPGVal = this.getOwnerComponent().getModel().getData(sPath).Codicepg;
				this._fillInput("CapitoloRV", sCapitoloVal);
				this._fillInput("PGRV", sPGVal);
			}
		},

		_onValueHelpConfirmIdPropostaRV: function(oEvent) {
			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oSelectedItem = oEvent.getParameter("selectedItem");

			if (!oSelectedItem) {
				this._sPathSelectedProp = "";
				return;
			}
			this._sPathSelectedProp = oSelectedItem.getBindingContextPath();
			var sIdproposta = oDataModel.getData(this._sPathSelectedProp).Idproposta;
			this.byId("IdPropostaRV").setValue(sIdproposta);
		},

		onValueHelpClose: function(oEvent, inputRef) {},

		onSuggestionItemSelected: function(oEvent, inputRef) {
			var oSelectedItem, sPath;

			var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oTableModelRV = this.getView().getModel("modelTableRV");

			if (inputRef === "idInputPFRV") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					return;
				}
				this.getView().byId("idInputAutRV").setEnabled(true);
				this.byId("idInputPFRV").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "idInputAutRV") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath();
				var sFincode = oDataModel.getData(sPath).Fincode;
				this.getView().byId("idInputAutRV").setSelectedKey(sFincode);
				this.getView().byId("idInputAutRV").setValue(oSelectedItem.getTitle());
			}
		},

		onSuggestionItemSelectedIdPropostaCreaRV: function(oEvent) {
			var oSelectedItem, sPath;
			var oTableModelRV = this.getView().getModel("modelTableRV");
			oSelectedItem = oEvent.getParameter("selectedItem");

			if (!oSelectedItem) {
				oTableModelRV.setData({});
				return;
			}
			this._sPathSelectedProp = oSelectedItem.getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath();
			this.byId("idPropostaCreaRV").setValue(oSelectedItem.getText());
		},

		onSuggestionItemSelectedIdPropostaRV: function(oEvent) {
			var oSelectedItem;
			var oTableModelRV = this.getView().getModel("modelTableRV");
			oSelectedItem = oEvent.getParameter("selectedItem");

			if (!oSelectedItem) {
				oTableModelRV.setData({});
				return;
			}
			this._sPathSelectedProp = oSelectedItem.getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath();
			this.byId("IdPropostaRV").setValue(oSelectedItem.getText());
		},

		onFilter: function(oEvent) {
			var sCapitolo = this.getView().byId("CapitoloRV").getValue();
			var sPG = this.getView().byId("PGRV").getValue();

			var aFilter = [];

			if (sCapitolo !== "") {
				aFilter.push(new Filter("Codicecapitolo", FilterOperator.EQ, sCapitolo));
			}
			if (sPG !== "") {
				aFilter.push(new Filter("Codicepg", FilterOperator.EQ, sPG));
			}
			aFilter.push(new Filter("Idproposta", FilterOperator.EQ, this.getView().byId("idPropostaCreaRV").getSelectedKey()));

			this.getView().byId("TablePosFinRV").getBinding("rows").filter(aFilter);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.CreaRimodulazioneVerticale
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.CreaRimodulazioneVerticale
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.CreaRimodulazioneVerticale
		 */
		//	onExit: function() {
		//
		//	}

	});

});