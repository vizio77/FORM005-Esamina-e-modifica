sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function(Controller, BaseController, JSONModel, Fragment, syncStyleClass, MessageBox, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.NuovaPosizioneFinanziaria", {

			/**
			 * Called when a controller is instantiated and its View controls (if available) are already created.
			 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
			 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.NuovaPosizioneFinanziaria
			 */
			onInit: function() {
				this.oRouter = this.getRouter();
				this.oDataModel = this.getModel();
				this.oResourceBundle = this.getResourceBundle();
				this.oNuovaPosFinModel = this.getOwnerComponent().getModel("modelNuovaPosFin");
				// this.oRouter.getRoute("NuovaPosizioneFinanziaria").attachMatched(this._onRouteMatched, this);
				this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
				this.aRowsCofog = [];
			},
			//lt torno indietro e prima di farlo resetto lo pseudo modello
			tornaIndietro: function(oEvent){
				//lt resetto il modello quando torno indietro
				var oView = this.getView();
				oView.byId("idMissioneNPF").setEditable(true);
				oView.byId("idProgrammaNPF").setEditable(true);
				oView.byId("idAzioneNPF").setEditable(true);

				oView.byId("idTitoloNPF").setEditable(true);
				oView.byId("idCategoriaNPF").setEditable(true);
				oView.byId("idCE2NPF").setEditable(true);
				oView.byId("idCE3NPF").setEditable(true);
				this.onNavBack();
			},

			onPressAddRow: function(oEvent) {
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
				var sPosFin = this.getView().byId("idPopPosFin").getText();

				var oLocalModel = this.getOwnerComponent().getModel("modelTableCofogNPF");
				if (sValLiv3) {

					var oTable = this.getView().byId("idTableCofogNPF");
					var oDati = {
						Fikrs: "S001",
						Anno: "",
						Fase: "DLB",
						Reale: "",
						Versione: "P",
						Fipex: sPosFin,
						Eos: "S",

						Codcofogl1: sValLiv1,
						Codcofogl2: sValLiv2,
						Codcofogl3: sValLiv3,
						Descrcofog: sValDescr,
						Codconcatenato: sValIdCofog,
						Perccofog: "",
						Icon: "sap-icon://delete",
						Visible: true
					};
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
				var oTable = this.getView().byId("idTableCofogNPF");
				var oModelTableCofog = this.getView().getModel("modelTableCofogNPF");
				var sPath = oEvt.getSource().getBindingContext("modelTableCofogNPF").getPath();
				sPath = sPath.substring(sPath.lastIndexOf("/") + 1);
				var aObj = oModelTableCofog.getData();
				aObj.splice(sPath, 1);
				oModelTableCofog.setProperty("/", aObj);
				oTable.getBinding("items").refresh();
			},

			onPressShowPopOverHeaderNuovaPosFin: function(e) {
				var sBtn = e.getSource();
				var oView = this.getView();
				var sID = e.getSource().getId();
				var sBtnText = sID.split("--")[1];

				if (!this._PopOverHeader) {
					this._PopOverHeader = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopOverHeaderNuovaPosFinLinks",
						controller: this
					}).then(function(oPopover) {
						oView.addDependent(oPopover);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oPopover);
						return oPopover;
					});
				}

				this._PopOverHeader.then(function(oPopover) {
					// Open ValueHelpDialog filtered by the input's value
					oPopover.openBy(sBtn);
				});
				if (sBtnText === "idPopPosFinSnap" || sBtnText === "idPopPosFin") {
					this.getView().byId("idBoxPosFin").setVisible(true);
					this.getView().byId("idBoxStruttAmmCen").setVisible(false);
					this.getView().byId("idPopHeader").setTitle(this.getView().getModel("i18n").getResourceBundle().getText("TitleHeaderPosFin"));
				}
				if (sBtnText === "idPopStrAmmCenSnap" || sBtnText === "idPopStrAmmCen") {
					this.getView().byId("idBoxPosFin").setVisible(false);
					this.getView().byId("idBoxStruttAmmCen").setVisible(true);
					this.getView().byId("idPopHeader").setTitle(this.getView().getModel("i18n").getResourceBundle().getText("TitleHeaderStruAmmCen"));
				}

			},

			//***********************GESTIONE MENU CAPITOLO************************************************
			onPressOpenMenuCapitolo: function(oEvent) {
				if (this.getView().byId("idCapitoloNPF").getValue()) {
					//alert("Cambiare N. Capitolo? Se si il numero attualmente bloccato viene sbloccato.");
					//MESSAGGIO DI AVVISO SBLOCCO DEL CAPITOLO
					/*sap.m.MessageToast.show(this.getView().getModel("i18n").getResourceBundle().getText("SbloccoNumCap"), {
						duration: 4000,
						width: "35em",
						my: "center center",
						at: "center center",
						autoClose: false
					});*/
					//INSERIRE CODICE PER GESTIRE LO SBLOCCO DEL CAPITOLO
				}
				var oButton = oEvent.getSource();
				var oView = this.getView();
				var that = this;
				// create menu only once
				if (!this._menuCap) {
					this._menuCap = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.MenuCapitoloNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				// ACTIONS REPEATED EVERY TIME
				this._menuCap.then(function(oDialog) {

					var eDock = sap.ui.core.Popup.Dock;
					oDialog.open(that._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

					var oItemMenuItemScegliCapitolo = oDialog.getAggregation("items")[0];
					var oItemMenuItemNuovoCapitolo = oDialog.getAggregation("items")[1];

					oItemMenuItemScegliCapitolo.setVisible(true);
					oItemMenuItemNuovoCapitolo.setVisible(true);
					oDialog.open(oButton);
				});
			},

			handleMenuItemPressCapitolo: function(oEvent) {
				var optionPressed = oEvent.getParameter("item").getText();
				var oButton = oEvent.getSource();
				var oView = this.getView();
				var sCapView = this.getView().byId("idCapitoloNPF").getValue();
				// var sCapPopup = this.getView().byId("idCapitoloNPFPoP").getValue();
				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var that = this;
				//CREA IL DIALOG UNA SOLA VOLTA
				if (!this._optionCap) {
					this._optionCap = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpScegliCapitoloNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
				this._optionCap.then(function(oDialog) {
					//oDialog.getBinding("items");
					// Open ValueHelpDialog filtered by the input's value
					if (optionPressed.toUpperCase() === "SCEGLI CAPITOLO ESISTENTE") {
						if (!sCapView) {
							oView.byId("idCapitoloNPFPoP").setValue("");
							that.getView().byId("idCapitoloNPFPoP").setEditable(true);
							oView.byId("idCapitoloNPFPoP").setShowValueHelp(true);
							oView.byId("idCapitoloNPFPoP").setShowSuggestion(true);

							oView.byId("btnlockNumCap").setText("Scegli");

							oDialog.open(oButton);

						} else {
							MessageBox.warning(that.oResourceBundle.getText("MBCambioNumCap"), {
								icon: MessageBox.Icon.WARNING,
								title: "Cambio Capitolo",
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.NO,
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {
										//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
										//____________
										oView.byId("idCapitoloNPFPoP").setValue("");
										that.getView().byId("idCapitoloNPFPoP").setEditable(true);
										oView.byId("idCapitoloNPFPoP").setShowValueHelp(true);
										oView.byId("idCapitoloNPFPoP").setShowSuggestion(true);

										oView.byId("idCapitoloNPF").setEditable(false);
										oView.byId("idCapitoloNPF").setValue("");
										oView.getModel("modelNuovaPosFin").setProperty("/CAP", "");

										oView.byId("btnlockNumCap").setText("Scegli");

										//PULISCO TUTTI I CAMPI 
										oView.byId("idMissioneNPF").setValue("");
										oView.byId("idProgrammaNPF").setValue("");
										oView.byId("idAzioneNPF").setValue("");

										oView.byId("idPGNPF").setValue("");

										oView.byId("idTitoloNPF").setValue("");
										oView.byId("idCategoriaNPF").setValue("");
										oView.byId("idCE2NPF").setValue("");
										oView.byId("idCE3NPF").setValue("");

										// oView.byId("idTCRCNPF").setValue("");
										// oView.byId("idTCRFNPF").setValue("");

										oView.byId("idMacroAggregatoNPF").setValue("");

										oView.byId("idTipoSpesaCapNPF").setSelectedKey("");
										oView.byId("idDenominazioneCapitoloIntNPF").setValue("");
										oView.byId("idDenominazioneCapitoloRidNPF").setValue("");

										oView.byId("idTipoSpesaPGNPF").setSelectedKey("");
										oView.byId("idDenominazionePGIntNPF").setValue("");
										oView.byId("idDenominazionePGRidNPF").setValue("");

										oView.getModel("modelNuovaPosFin").setProperty("/MISS", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PROG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/AZIO", "");
										oView.getModel("modelNuovaPosFin").setProperty("/TIT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAP", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE2", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE3", "");

										oView.getModel("modelTableCofogNPF").setData("");
										oDialog.open(oButton);
									}
								}

							});
						}
					}
					if (optionPressed.toUpperCase() === "INSERISCI N. CAPITOLO MANUALMENTE") {
						if (!sCapView) {
							oView.byId("idCapitoloNPFPoP").setEditable(true);
							oView.byId("idCapitoloNPFPoP").setValue("");
							oView.byId("idCapitoloNPFPoP").setType("Number");
							oView.byId("idCapitoloNPFPoP").setShowValueHelp(false);
							oView.byId("idCapitoloNPFPoP").setShowSuggestion(false);

							oView.byId("btnlockNumCap").setText("Ok");
							oDialog.open(oButton);
						} else {
							MessageBox.warning(that.oResourceBundle.getText("MBCambioNumCapitolo"), {
								icon: MessageBox.Icon.WARNING,
								title: "Cambio Num. Capitolo",
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.NO,
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {
										// alert("ho cliccato ok");
										//INSERIRE LOGICA DI PULIZIA CAMPI PER CAMBIO CAPITOLO GIA' PRENOTATO
										oView.byId("idCapitoloNPFPoP").setEditable(true);
										oView.byId("idCapitoloNPFPoP").setValue("");
										oView.byId("idCapitoloNPFPoP").setType("Number");
										oView.byId("idCapitoloNPFPoP").setShowValueHelp(false);
										oView.byId("idCapitoloNPFPoP").setShowSuggestion(false);
										

										oView.byId("idCapitoloNPF").setEditable(false);
										oView.byId("idCapitoloNPF").setValue("");

										oView.byId("btnlockNumCap").setText("Ok");

										//PULISCO TUTTI I CAMPI RELATIVI ALLA PF
										oView.byId("idMissioneNPF").setValue("");
										oView.byId("idProgrammaNPF").setValue("");
										oView.byId("idAzioneNPF").setValue("");

										oView.byId("idPGNPF").setValue("");

										oView.byId("idTitoloNPF").setValue("");
										oView.byId("idCategoriaNPF").setValue("");
										oView.byId("idCE2NPF").setValue("");
										oView.byId("idCE3NPF").setValue("");

										// oView.byId("idTCRCNPF").setValue("");
										// oView.byId("idTCRFNPF").setValue("");

										oView.byId("idMacroAggregatoNPF").setValue("");

										oView.byId("idTipoSpesaCapNPF").setSelectedKey("");
										oView.byId("idDenominazioneCapitoloIntNPF").setValue("");
										oView.byId("idDenominazioneCapitoloRidNPF").setValue("");

										oView.byId("idTipoSpesaPGNPF").setSelectedKey("");
										oView.byId("idDenominazionePGIntNPF").setValue("");
										oView.byId("idDenominazionePGRidNPF").setValue("");

										oView.getModel("modelNuovaPosFin").setProperty("/MISS", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PROG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/AZIO", "");
										oView.getModel("modelNuovaPosFin").setProperty("/TIT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAP", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE2", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE3", "");

										oView.getModel("modelTableCofogNPF").setData("");
										oDialog.open(oButton);
									}
								}
							});
						}
					}

					if (optionPressed.toUpperCase() === "GENERA N. CAPITOLO AUTOMATICAMENTE") {
						if (!sCapView) {

							//INSERIRE LOGICA GENERAZIONE CAP AUTOMATICA
							oDataModel.callFunction("/GeneraCapitolo", { // function import name
								method: "GET", // http method
								urlParameters: {
									// CodiceCapitolo : sCapPopup
								}, // function import parameters        
								success: function(oData, oResponse) {
									that._Cap = oResponse.data.CodiceCapitolo;

									that.getView().byId("idCapitoloNPFPoP").setValue(that._Cap); // generato automaticamente dal backend
									that.getView().byId("idCapitoloNPFPoP").setEditable(false);
									that.getView().byId("idCapitoloNPFPoP").setShowValueHelp(false);
									that.getView().byId("idCapitoloNPFPoP").setShowSuggestion(false);

									that.getView().byId("btnlockNumCap").setText("Prenota");

									oDialog.open(oButton);
								}, // callback function for success
								error: function(oError) {
										MessageBox.error(oError.responseText);
									} // callback function for error
							});

						} else {
							MessageBox.warning(that.oResourceBundle.getText("MBCambioNumCapitolo"), {
								icon: MessageBox.Icon.WARNING,
								title: "Cambio Num. Capitolo",
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.NO,
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {

										//LOGICA DI PULIZIA CAMPI PER CAMBIO CAPITOLO GIA' PRENOTATO
										oView.byId("idCapitoloNPFPoP").setEditable(false);
										oView.byId("idCapitoloNPFPoP").setValue("");
										// oView.byId("idCapitoloNPFPoP").setType("Number");
										oView.byId("idCapitoloNPFPoP").setShowValueHelp(false);
										oView.byId("idCapitoloNPFPoP").setShowSuggestion(false);

										oView.byId("idCapitoloNPF").setEditable(false);
										oView.byId("idCapitoloNPF").setValue("");

										oView.byId("btnlockNumCap").setText("Prenota");

										//PULISCO TUTTI I CAMPI RELATIVI ALLA PF
										oView.byId("idMissioneNPF").setValue("");
										oView.byId("idProgrammaNPF").setValue("");
										oView.byId("idAzioneNPF").setValue("");

										oView.byId("idPGNPF").setValue("");

										oView.byId("idTitoloNPF").setValue("");
										oView.byId("idCategoriaNPF").setValue("");
										oView.byId("idCE2NPF").setValue("");
										oView.byId("idCE3NPF").setValue("");

										// oView.byId("idTCRCNPF").setValue("");
										// oView.byId("idTCRFNPF").setValue("");

										oView.byId("idMacroAggregatoNPF").setValue("");

										oView.byId("idTipoSpesaCapNPF").setSelectedKey("");
										oView.byId("idDenominazioneCapitoloIntNPF").setValue("");
										oView.byId("idDenominazioneCapitoloRidNPF").setValue("");

										oView.byId("idTipoSpesaPGNPF").setSelectedKey("");
										oView.byId("idDenominazionePGIntNPF").setValue("");
										oView.byId("idDenominazionePGRidNPF").setValue("");

										oView.getModel("modelNuovaPosFin").setProperty("/MISS", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PROG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/AZIO", "");
										oView.getModel("modelNuovaPosFin").setProperty("/TIT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAT", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CAP", "");
										oView.getModel("modelNuovaPosFin").setProperty("/PG", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE2", "");
										oView.getModel("modelNuovaPosFin").setProperty("/CE3", "");

										oView.getModel("modelTableCofogNPF").setData("");

										//LOGICA GENERAZIONE CAP AUTOMATICA
										oDataModel.callFunction("/GeneraCapitolo", { // function import name
											method: "GET", // http method
											urlParameters: {
												// CodiceCapitolo: sCapPopup
											}, // function import parameters        
											success: function(oData, oResponse) {
												that._Cap = oResponse.data.CodiceCapitolo;

												that.getView().byId("idCapitoloNPFPoP").setValue(that._Cap); // generato automaticamente dal backend
												that.getView().byId("idCapitoloNPFPoP").setEditable(false);
												that.getView().byId("idCapitoloNPFPoP").setShowValueHelp(false);
												that.getView().byId("idCapitoloNPFPoP").setShowSuggestion(false);

												that.getView().byId("btnlockNumCap").setText("Prenota");

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

			onPressLockNumCap: function(e) {
				var sCapitoloSel = this.getView().byId("idCapitoloNPFPoP").getValue();
				// var sCapView = this.getView().byId("idCapitoloNPF").getValue();
				var sBtnPressed = e.getSource().getText();
				// var oButton = e.getSource();
				var oView = this.getView();

				var oLocalModel = oView.getModel("modelPFCapEsistente");
				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

				//CASO SCELTA CAP ESISTENTE
				if (sBtnPressed.toUpperCase() === "SCEGLI") {
					oView.byId("idCapitoloNPF").setValue(sCapitoloSel);
					oView.getModel("modelNuovaPosFin").setProperty("/CAP", sCapitoloSel);
					oView.byId("idCapitoloNPF").setEditable(false);

					//BLOCCO MODIFICHE A TUTTI I CAMPI RELATIVI AL CAP
					oView.byId("idMissioneNPF").setEditable(false);
					oView.byId("idProgrammaNPF").setEditable(false);
					oView.byId("idAzioneNPF").setEditable(false);

					oView.byId("idTitoloNPF").setEditable(false);
					oView.byId("idCategoriaNPF").setEditable(false);
					oView.byId("idCE2NPF").setEditable(true);
					oView.byId("idCE3NPF").setEditable(true);

					oView.byId("idMacroAggregatoNPF").setEditable(false);
					oView.byId("idDenominazioneCapitoloIntNPF").setEditable(false);
					oView.byId("idDenominazioneCapitoloRidNPF").setEditable(false);

					oView.byId("colEliminaNPF").setVisible(false);
					oView.byId("idAggiungiRiga").setEnabled(false);

					// modelCOFOGCapEsistente

					oView.byId("idMissioneNPF").setValue(oLocalModel.getData("/PosFin").Codicemissione);
					oView.getModel("modelNuovaPosFin").setProperty("/MISS", oLocalModel.getData("/PosFin").Codicemissione);
					oView.byId("idProgrammaNPF").setValue(oLocalModel.getData("/PosFin").Codiceprogramma);
					oView.getModel("modelNuovaPosFin").setProperty("/PROG", oLocalModel.getData("/PosFin").Codiceprogramma);
					oView.byId("idAzioneNPF").setValue(oLocalModel.getData("/PosFin").Codiceazione);
					oView.getModel("modelNuovaPosFin").setProperty("/AZIO", oLocalModel.getData("/PosFin").Codiceazione);

					oView.byId("idTitoloNPF").setValue(oLocalModel.getData("/PosFin").Codicetitolo);
					oView.getModel("modelNuovaPosFin").setProperty("/TIT", oLocalModel.getData("/PosFin").Codicetitolo);
					oView.byId("idCategoriaNPF").setValue(oLocalModel.getData("/PosFin").Codicecategoria);
					oView.getModel("modelNuovaPosFin").setProperty("/CAT", oLocalModel.getData("/PosFin").Codicecategoria);

					// oView.byId("idTCRCNPF").setValue(oLocalModel.getData("/PosFin").Numetcrcspe);
					// oView.byId("idTCRFNPF").setValue(oLocalModel.getData("/PosFin").Numetcrfspe);

					oView.byId("idMacroAggregatoNPF").setValue(oLocalModel.getData("/PosFin").Numemacspe);
					oView.byId("idTipoSpesaCapNPF").setValue(oLocalModel.getData("/PosFin").Codicetipospcapspe);
					oView.byId("idDenominazioneCapitoloIntNPF").setValue(oLocalModel.getData("/PosFin").Descrizionecapitolo);
					oView.byId("idDenominazioneCapitoloRidNPF").setValue(oLocalModel.getData("/PosFin").Descrbrevecap);
					oView.byId("NPF_dialogCapitolo").close();

				}

				//CASO SCELTA CAP AUTOMATICA
				if (sBtnPressed.toUpperCase() === "PRENOTA") {

					//METODO CHE GESTISCE IL BLOCCO DEL CAPITOLO SCELTO

					this.getView().byId("idCapitoloNPF").setValue(sCapitoloSel);
					this.getView().byId("idCapitoloNPF").setEditable(false);
					oView.getModel("modelNuovaPosFin").setProperty("/CAP", sCapitoloSel);

					//SBLOCCO MODIFICHE A TUTTI I CAMPI RELATIVI AL CAP
					oView.byId("idMissioneNPF").setEditable(true);
					oView.byId("idProgrammaNPF").setEditable(true);
					oView.byId("idAzioneNPF").setEditable(true);

					oView.byId("idTitoloNPF").setEditable(true);
					oView.byId("idCategoriaNPF").setEditable(true);
					oView.byId("idCE2NPF").setEditable(true);
					oView.byId("idCE3NPF").setEditable(true);

					oView.byId("idMacroAggregatoNPF").setEditable(true);
					oView.byId("idDenominazioneCapitoloIntNPF").setEditable(true);
					oView.byId("idDenominazioneCapitoloRidNPF").setEditable(true);

					oView.byId("colEliminaNPF").setVisible(true);
					oView.byId("idAggiungiRiga").setEnabled(true);

					this.getView().byId("NPF_dialogCapitolo").close();
				}

				var that = this;
				//CASO SCELTA CAP MANUALE
				if (sBtnPressed.toUpperCase() === "OK") {

					if (sCapitoloSel) {
						//LOGICA GENERAZIONE CAP MANUALE
						oDataModel.callFunction("/CreaCapitoloMan", { // function import name
							method: "GET", // http method
							urlParameters: {
								CodiceCapitolo: sCapitoloSel
							}, // function import parameters        
							success: function(oData, oResponse) {
								that._Cap = oResponse.data.CodiceCapitolo;

								that.getView().byId("idCapitoloNPF").setValue(that._Cap); // generato automaticamente dal backend
								that.getView().byId("idCapitoloNPF").setEditable(false);
								that.getView().getModel("modelNuovaPosFin").setProperty("/CAP", sCapitoloSel);

								//SBLOCCO MODIFICHE A TUTTI I CAMPI RELATIVI AL CAP
								oView.byId("idMissioneNPF").setEditable(true);
								oView.byId("idProgrammaNPF").setEditable(true);
								oView.byId("idAzioneNPF").setEditable(true);

								oView.byId("idTitoloNPF").setEditable(true);
								oView.byId("idCategoriaNPF").setEditable(true);
								oView.byId("idCE2NPF").setEditable(true);
								oView.byId("idCE3NPF").setEditable(true);

								oView.byId("idMacroAggregatoNPF").setEditable(true);
								oView.byId("idDenominazioneCapitoloIntNPF").setEditable(true);
								oView.byId("idDenominazioneCapitoloRidNPF").setEditable(true);

								oView.byId("colEliminaNPF").setVisible(true);
								oView.byId("idAggiungiRiga").setEnabled(true);

								that.getView().byId("NPF_dialogCapitolo").close();

							}, // callback function for success
							error: function(oError) {
									MessageBox.error(oError.responseText);
								} // callback function for error
						});
					}
				}
			},

			onPressCloseScegliCapitoloNPF: function() {
				this.getView().byId("NPF_dialogCapitolo").close();
			},
			//***************************INIZIO METODI MENU A TENDINA*************************************

			//***********************GESTIONE MENU PG************************************************

			onPressOpenMenuPG: function(oEvent) {

				if (this.getView().byId("idPGNPF").getValue()) {

					//INSERIRE CODICE PER GESTIRE LO SBLOCCO DEL PG
				}
				var oButton = oEvent.getSource();
				var oView = this.getView();
				var that = this;
				// create menu only once
				if (!this._menuPG) {
					this._menuPG = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.MenuPGNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				// ACTIONS REPEATED EVERY TIME
				this._menuPG.then(function(oDialog) {

					var eDock = sap.ui.core.Popup.Dock;
					oDialog.open(that._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

					// var oItemMenuItemScegliPG = this._menuPG.getAggregation("items")[0];
					var oItemMenuItemNuovoPG = oDialog.getAggregation("items")[0];

					// oItemMenuItemScegliPG.setVisible(true);
					oItemMenuItemNuovoPG.setVisible(true);
					oDialog.open(oButton);
				});
			},

			handleMenuItemPressPG: function(oEvent) {
				var optionPressed = oEvent.getParameter("item").getText();
				var oButton = oEvent.getSource();
				var oView = this.getView();
				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var sPGVal = this.getView().byId("idPGNPF").getValue();
				var that = this;
				//CREA IL DIALOG UNA SOLA VOLTA
				if (!this._optionPG) {
					this._optionPG = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpScegliPGNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
				this._optionPG.then(function(oDialog) {

					if (optionPressed.toUpperCase() === "INSERISCI N. PG MANUALMENTE") {
						if (!sPGVal) {
							oView.byId("idPGNPFPoP").setEditable(true);
							oView.byId("idPGNPFPoP").setValue("");

							oView.byId("btnlockNumPG").setText("Scegli");
							oDialog.open(oButton);
						} else {
							MessageBox.warning(that.oResourceBundle.getText("MBCambioNumPG"), {
								icon: MessageBox.Icon.WARNING,
								title: "Cambio PG",
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.NO,
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {
										//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
										//____________
										oView.byId("idPGNPFPoP").setEditable(true);
										oView.byId("idPGNPFPoP").setValue("");
										oView.byId("idPGNPFPoP").setType("Number");
										oView.byId("idPGNPF").setEditable(false);
										oView.byId("idPGNPF").setValue("");

										oView.byId("btnlockNumPG").setText("Scegli");

										oDialog.open(oButton);
									}
								}
							});
						}
					}
					if (optionPressed.toUpperCase() === "GENERA N. PG AUTOMATICAMENTE") {
						var sCap = oView.byId("idCapitoloNPF").getValue();
						//LOGICA DI CONTROLLO CAMBIO PG GIA' INSERITO
						if (sPGVal === "" || sCap === "") {
							//LOGICA PER GENERARE NUOVO PG AUTOMATICAMENTE
							oDataModel.callFunction("/GeneraPG", { // function import name
								method: "GET", // http method
								urlParameters: {
									"CodiceCapitolo": that.getView().byId("idCapitoloNPF").getValue()
								}, // function import parameters        
								success: function(oData, oResponse) {
									that._PG = oResponse.data.CodicePg;

									that.getView().byId("idPGNPFPoP").setValue(that._PG); // generato automaticamente dal backend
									that.getView().byId("idPGNPFPoP").setEditable(false);

									that.getView().byId("btnlockNumPG").setText("Prenota");

									oDialog.open(oButton);
								}, // callback function for success
								error: function(oError) {
										MessageBox.error(oError.responseText);
									} // callback function for error
							});
						} else {
							MessageBox.warning(that.oResourceBundle.getText("MBCambioNumPG"), {
								icon: MessageBox.Icon.WARNING,
								title: "Cambio PG",
								actions: [MessageBox.Action.YES, MessageBox.Action.NO],
								emphasizedAction: MessageBox.Action.NO,
								onClose: function(oAction) {
									if (oAction === MessageBox.Action.YES) {
										//INSERIRE LOGICA DI SBLOCCO PROPOSTA GIA' PRENOTATO
										//____________
										that.getView().byId("idPGNPFPoP").setValue(""); // generato automaticamente dal backend
										that.getView().byId("idPGNPFPoP").setEditable(false);

										that.getView().byId("idPGNPF").setValue("");
										that.getView().byId("idPGNPF").setEditable(false);

										that.getView().byId("btnlockNumPG").setText("Prenota");
										if (sCap) {
											oDataModel.callFunction("/GeneraPG", { // function import name
												method: "GET", // http method
												urlParameters: {
													"CodiceCapitolo": that.getView().byId("idCapitoloNPF").getValue()
												}, // function import parameters        
												success: function(oData, oResponse) {
													that._PG = oResponse.data.CodicePg;

													that.getView().byId("idPGNPFPoP").setValue(that._PG); // generato automaticamente dal backend
													that.getView().byId("idPGNPFPoP").setEditable(false);

													that.getView().byId("btnlockNumPG").setText("Prenota");

													oDialog.open(oButton);
												}, // callback function for success
												error: function(oError) {
														MessageBox.error(oError.responseText);
													} // callback function for error
											});
										}
									}
								}
							});
						}
					}
				});
			},

			onPressLockNumPG: function(e) {
				var sPGSel = this.getView().byId("idPGNPFPoP").getValue();
				var sBtnPressed = e.getSource().getText();
				// var sPrctr = this.getView().byId("idAmminNPF").getValue();
				// var sPgView = this.getView().byId("idPGNPF");
				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var that = this;

				if (sBtnPressed.toUpperCase() === "SCEGLI") {
					//CASO SCELTA PROPOSTA MANUALE
					var sCap = this.getView().byId("idCapitoloNPF").getValue();
					//LOGICA DI CONTROLLO ID SCELTO
					if (sCap) {
						oDataModel.callFunction("/CreaPGManualmente", { // function import name
							method: "GET", // http method
							urlParameters: {
								"CodicePg": sPGSel,
								"CodiceCapitolo": that.getView().byId("idCapitoloNPF").getValue()
							}, // function import parameters        
							success: function(oData, oResponse) {
								// console.log(oResponse.statusText);
								that._CodicePg = oResponse.data.CodicePg;
								that.getView().byId("idPGNPFPoP").setValue(that._CodicePg); // generato automaticamente dal backend
								that.getView().byId("idPGNPFPoP").setEditable(false);
								// that.getView().getModel("modelNuovaPosFin").setProperty("PG", that._PG);

								that.getView().byId("idPGNPF").setValue(that._CodicePg);
								that.getView().byId("idPGNPF").setEditable(false);
								that.getView().byId("idPGNPFPoP").setValue("");
								that.getView().getModel("modelNuovaPosFin").setProperty("/PG", that._CodicePg);
							}, // callback function for success
							error: function(oError) {
									MessageBox.error(oError.responseText);
								} // callback function for error
						});
						//LOGICA DI BLOCCO PG DA INSERIRE

						this.getView().byId("NPF_dialogScegliPG").close();
					}
				}
				if (sBtnPressed.toUpperCase() === "PRENOTA") {
					var sNumPGCreato = this.getView().byId("idPGNPFPoP").getValue();

					//INSERIRE METODO CHE GESTISCE IL BLOCCO DEL PG SCELTO

					this.getView().byId("idPGNPF").setValue(sNumPGCreato);
					this.getView().byId("idPGNPF").setEditable(false);
					this.getView().getModel("modelNuovaPosFin").setProperty("/PG", sNumPGCreato);

					this.getView().byId("NPF_dialogScegliPG").close();
				}
			},

			onPressCloseScegliPGNPF: function() {
				this.getView().byId("NPF_dialogScegliPG").close();
			},

			//***********************GESTIONE MENU ID PROPOSTA************************************************

			onPressOpenMenuIDNPF: function(oEvent) {

				var oButton = oEvent.getSource();
				var oView = this.getView();
				var that = this;
				// create menu only once
				if (!this._menuIDNPF) {
					this._menuIDNPF = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.MenuIDPropostaNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				// ACTIONS REPEATED EVERY TIME
				this._menuIDNPF.then(function(oDialog) {

					var eDock = sap.ui.core.Popup.Dock;
					oDialog.open(that._bKeyboard, oButton, eDock.BeginTop, eDock.BeginBottom, oButton);

					var oItemMenuItemScegliID = oDialog.getAggregation("items")[0];
					var oItemMenuItemNuovoID = oDialog.getAggregation("items")[1];
					oItemMenuItemScegliID.setVisible(true);
					oItemMenuItemNuovoID.setVisible(true);

					oDialog.open(oButton);
				});
			},

			handleMenuItemPressID: function(oEvent) {
				var optionPressed = oEvent.getParameter("item").getText();
				var sIdProposta = this.getView().byId("idIDPropostaNPF").getValue();

				var oButton = oEvent.getSource();
				var oView = this.getView();
				var oItemTemplateIter;

				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var that = this;

				if (!this._optionIDNPF) {
					this._optionIDNPF = Fragment.load({
						id: oView.getId(),
						name: "zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.fragments.PopUpScegliIDNPF",
						controller: this
					}).then(function(oDialog) {
						oView.addDependent(oDialog);
						syncStyleClass(oView.getController().getOwnerComponent().getContentDensityClass(), oView, oDialog);
						return oDialog;
					});
				}
				//IN QUESTA PARTE VANNO TUTTE LE CONDIZIONI CHE DEVONO ESSERE RIPETUTE TUTTE LE VOLTE CHE SI APRE IL DIALOG
				this._optionIDNPF.then(function(oDialog) {

					if (optionPressed.toUpperCase() === "SCEGLI PROPOSTA ESISTENTE") {
						if (!sIdProposta) {
							oView.byId("idIDNPFPoP").setValue("");
							oView.byId("idIDNPFPoP").setShowValueHelp(true);
							// oView.byId("idIDNPFPoP").setShowSuggestion(true);
							oView.byId("idIDNPFPoP").setEditable(true);
							oView.byId("idIDNPFPoP").setType("Text");

							oView.byId("btnlockIDNPF").setText("Ok");

							/*oView.byId("idTipologiaNPF").setEditable(false);
							oView.byId("idTipologiaNPF").setValue("");

							oView.byId("idIterNPF").setEditable(false);
							oView.byId("idIterNPF").setSelectedKey("");

							oView.byId("idNickNameNPF").setEditable(false);
							oView.byId("idNickNameNPF").setValue("");*/

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
										oView.byId("idIDNPFPoP").setShowValueHelp(true);
										// oView.byId("idIDNPFPoP").setShowSuggestion(true);
										oView.byId("idIDNPFPoP").setValue("");
										oView.byId("idIDNPFPoP").setEditable(true);
										oView.byId("idIDNPFPoP").setType("Text");

										oView.byId("idIDPropostaNPF").setValue("");
										oView.byId("idIDPropostaNPF").setEditable(false);

										oView.byId("idNickNameNPF").setValue("");
										oView.byId("idNickNameNPF").setEditable(false);

										oView.byId("idTipologiaNPF").setEditable(false);
										oView.byId("idTipologiaNPF").setSelectedKey("");

										oView.byId("idIterNPF").setSelectedKey("");
										oView.byId("idIterNPF").setEditable(false);

										oView.byId("btnlockIDNPF").setText("Ok");

										oDialog.open(oButton);
									}
								}
							});
						}
					}
					if (optionPressed.toUpperCase() === "INSERISCI PROPOSTA MANUALMENTE") {
						if (!sIdProposta) {
							oView.byId("idIDNPFPoP").setEditable(true);
							oView.byId("idIDNPFPoP").setType("Number");
							oView.byId("idIDNPFPoP").setValue("");
							oView.byId("idIDNPFPoP").setShowValueHelp(false);

							oView.byId("btnlockIDNPF").setText("Scegli");

							oView.byId("idTipologiaNPF").setEditable(true);
							oView.byId("idTipologiaNPF").setSelectedKey("");
							oView.byId("idTipologiaNPF").setVisible(false);

							oItemTemplateIter = new sap.ui.core.Item({
								text: "Proposta in lavorazione",
								key: "01"
							});
							oView.byId("idIterNPF").addItem(oItemTemplateIter);
							// oView.byId("idIterNPF").bindItems("/ZCA_AF_ITERPROSet", oItemTemplateIter);
							// oView.byId("idIterNPF").setSelectedKey("");
							oView.byId("idIterNPF").setVisible(false);

							oView.byId("idNickNameNPF").setEditable(true);
							oView.byId("idNickNameNPF").setValue("");

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
										oView.byId("idIDNPFPoP").setEditable(true);
										oView.byId("idIDNPFPoP").setType("Number");
										oView.byId("idIDNPFPoP").setValue("");
										oView.byId("idIDNPFPoP").setShowValueHelp(false);

										oView.byId("idIDPropostaNPF").setValue("");

										oView.byId("idNickNameNPF").setValue("");
										oView.byId("idNickNameNPF").setEditable(true);

										oView.byId("idTipologiaNPF").setSelectedKey("");
										oView.byId("idTipologiaNPF").setEditable(false);

										oView.byId("idIterNPF").setSelectedKey("");
										oView.byId("idIterNPF").setEditable(false);

										oView.byId("btnlockIDNPF").setText("Scegli");

										oDialog.open(oButton);
									}
								}
							});
						}
					}
					if (optionPressed.toUpperCase() === "GENERA PROPOSTA AUTOMATICAMENTE") {

						//LOGICA DI CONTROLLO CAMBIO ID GIA' INSERITO
						if (!sIdProposta) {
							//LOGICA PER GENERARE NUOVA ID AUTOMATICAMENTE
							oDataModel.callFunction("/GeneraIdProposta", { // function import name
								method: "GET", // http method
								urlParameters: {
									// "PropostaNum": sPropostaSel
								}, // function import parameters        
								success: function(oData, oResponse) {
									that._Id = oResponse.data.Idproposta;
									// console.log(that._Id);
									that.Keycode = oResponse.data.Keycodepr;
									that.getView().byId("idIDNPFPoP").setValue(that._Id); // generato automaticamente dal backend
									that.getView().byId("idIDNPFPoP").setEditable(false);
									that.getView().byId("btnlockIDNPF").setText("Prenota");

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
										that.getView().byId("idIDNPFPoP").setValue("");
										that.getView().byId("idIDNPFPoP").setEditable(false);
										that.getView().byId("btnlockIDNPF").setText("Prenota");
										that.getView().byId("idIDPropostaNPF").setValue("");
										that.getView().byId("idIDPropostaNPF").setEditable(false);
										that.getView().byId("idNickNameNPF").setValue("");
										that.getView().byId("idNickNameNPF").setEditable(false);
										that.getView().byId("idTipologiaNPF").setValue("");
										that.getView().byId("idTipologiaNPF").setEditable(false);
										that.getView().byId("idTipologiaNPF").setSelectedKey("");
										that.getView().byId("idIterNPF").setEditable(false);
										that.getView().byId("idIterNPF").setSelectedKey("");

										oDataModel.callFunction("/GeneraIdProposta", { // function import name
											method: "GET", // http method
											urlParameters: {
												// "PropostaNum": sPropostaSel
											}, // function import parameters        
											success: function(oData, oResponse) {
												that._Id = oResponse.data.Idproposta;
												that.Keycode = oResponse.data.Keycodepr;
												that.getView().byId("idIDNPFPoP").setValue(that._Id); // generato automaticamente dal backend
												that.getView().byId("idIDNPFPoP").setEditable(false);
												that.getView().byId("btnlockIDNPF").setText("Prenota");

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

			onPressLockIDNPF: function(e) {
				var sIDSel = this.getView().byId("idIDNPFPoP").getValue();
				var sNumIDCreato = this.getView().byId("idIDPropostaNPF").getValue();
				var oItemTemplateIter;

				var oDataModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				var oModelPropostaNPF = this.getView().getModel("modelPropostaNPF");

				var sBtnPressed = e.getSource().getText();
				var oView = this.getView();

				//CASO PROPOSTA AUTOMATICA
				if (sBtnPressed.toUpperCase() === "PRENOTA") {

					sNumIDCreato = this.getView().byId("idIDNPFPoP").getValue();

					//METODO CHE GESTISCE IL BLOCCO DELLA PROPOSTA SCELTA
					// if (sNumIDCreato) {
					// 	MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("BloccoNumIDNPF"));;
					// }

					oView.byId("idIDPropostaNPF").setValue(sNumIDCreato);
					// oView.byId("idIDPropostaNPF").setSelectedKey(sNumIDCreato);
					oView.byId("idIDPropostaNPF").setEditable(false);

					oView.byId("idNickNameNPF").setValue("");
					oView.byId("idNickNameNPF").setEditable(true);

					oView.byId("idTipologiaNPF").setSelectedKey("");
					oView.byId("idTipologiaNPF").setEditable(true);
					oView.byId("idTipologiaNPF").setVisible(false);
					oView.byId("labelTipo").setVisible(false);
					
					oItemTemplateIter = new sap.ui.core.Item({
						text: "Proposta in lavorazione",
						key: "01"
					});
					oView.byId("idIterNPF").addItem(oItemTemplateIter);
					oView.byId("idIterNPF").setVisible(false);
					oView.byId("labelIter").setVisible(false);
					
					//old code iter
					/*
					oView.byId("idIterNPF").setEditable(true);
					oItemTemplateIter = new sap.ui.core.Item({
						text: "{DescIter}",
						key: "{Iter}"
					});
					oView.byId("idIterNPF").bindItems("/ZCA_AF_ITERPROSet", oItemTemplateIter);
					oView.byId("idIterNPF").setSelectedKey("");*/

					oView.byId("idIDNPFPoP").setValue("");
					oView.byId("NPF_dialogScegliProposta").close();
				}

				//CASO PROPOSTA ESISTENTE
				if (sBtnPressed.toUpperCase() === "OK") {

					sNumIDCreato = this.getView().byId("idIDNPFPoP").getValue();

					var sIter = oModelPropostaNPF.getData().Desciter;
					var scodIter = oModelPropostaNPF.getData().Iter;
					var sNickname = oModelPropostaNPF.getData().Nickname;
					var sTipo = oModelPropostaNPF.getData().Tipo;

					oView.byId("idNickNameNPF").setValue(sNickname);
					oView.byId("idNickNameNPF").setEditable(false);

					oView.byId("idTipologiaNPF").setValue(sTipo);
					oView.byId("idTipologiaNPF").setEditable(false);
					oView.byId("idTipologiaNPF").setVisible(true);
					oView.byId("labelTipo").setVisible(true);

					oView.byId("idIterNPF").setValue(sIter);
					oView.byId("idIterNPF").setSelectedKey(scodIter);
					oView.byId("idIterNPF").setEditable(false);
					oView.byId("idIterNPF").setVisible(true);
					oView.byId("labelIter").setVisible(true);

					oView.byId("idIDPropostaNPF").setValue(sNumIDCreato);
					oView.byId("idIDPropostaNPF").setEditable(false);

					oView.byId("idIDNPFPoP").setValue("");
					oView.byId("NPF_dialogScegliProposta").close();
				}

				//CASO SCELTA PROPOSTA MANUALE
				if (sBtnPressed.toUpperCase() === "SCEGLI") {
					var that = this;

					if (!sNumIDCreato) { //INPUT VIEW
						//LOGICA DI CONTROLLO ID SCELTO

						oDataModel.callFunction("/CreaIdPropostaManualmente", { // function import name
							method: "GET", // http method
							urlParameters: {
								"Idproposta": sIDSel
							}, // function import parameters        
							success: function(oData, oResponse) {
								// console.log(oResponse.statusText);
								that._Id = oData.Idproposta;
								that.Keycode = oResponse.data.Keycodepr;
								that.getView().byId("idIDNPFPoP").setValue(that._Id); // generato automaticamente dal backend
								that.getView().byId("idIDNPFPoP").setEditable(false);
								// that.getView().byId("idIDNPFPoP").setShowValueHelp(false);

								that.getView().byId("idIDPropostaNPF").setValue(that._Id);
								that.getView().byId("idIDPropostaNPF").setEditable(false);

								that.getView().byId("btnlockIDNPF").setText("Scegli");

								that.getView().byId("idNickNameNPF").setValue("");
								that.getView().byId("idNickNameNPF").setEditable(true);

								that.getView().byId("idTipologiaNPF").setSelectedKey("");
								that.getView().byId("idTipologiaNPF").setEditable(false);
								that.getView().byId("idTipologiaNPF").setVisible(false);
								that.getView().byId("labelTipo").setVisible(false);
								
								
								oItemTemplateIter = new sap.ui.core.Item({
									text: "Proposta in lavorazione",
									key: "01"
								});
								that.getView().byId("idIterNPF").addItem(oItemTemplateIter);
								that.getView().byId("idIterNPF").setVisible(false);
								that.getView().byId("labelIter").setVisible(false);
							/*	that.getView().byId("idIterNPF").setEditable(true);
								oItemTemplateIter = new sap.ui.core.Item({
									text: "{DescIter}",
									key: "{Iter}"
								});
								that.getView().byId("idIterNPF").bindItems("/ZCA_AF_ITERPROSet", oItemTemplateIter);
								that.getView().byId("idIterNPF").setSelectedKey("");*/

								oView.byId("NPF_dialogScegliProposta").close();
								oView.byId("idIDNPFPoP").setValue("");

							}, // callback function for success
							error: function(oError) {
									MessageBox.error(oError.responseText);
								} // callback function for error
						});
						//LOGICA DI BLOCCO ID DA INSERIRE

					} else {
						oDataModel.callFunction("/CreaIdPropostaManualmente", { // function import name
							method: "GET", // http method
							urlParameters: {
								"Idproposta": sIDSel
							}, // function import parameters        
							success: function(oData, oResponse) {
								// console.log(oResponse);
								that._Id = oData.Idproposta;
								that.Keycode = oResponse.data.Keycodepr;
								that.getView().byId("idIDNPFPoP").setValue(that._Id); // generato automaticamente dal backend
								that.getView().byId("idIDNPFPoP").setEditable(false);
								that.getView().byId("idIDNPFPoP").setShowValueHelp(false);

								that.getView().byId("idIDPropostaNPF").setValue(that._Id);
								that.getView().byId("idIDPropostaNPF").setEditable(false);

								that.getView().byId("btnlockIDNPF").setText("Scegli");

								that.getView().byId("idNickNameNPF").setValue("");
								that.getView().byId("idNickNameNPF").setEditable(true);

								that.getView().byId("idTipologiaNPF").setSelectedKey("");
								that.getView().byId("idTipologiaNPF").setEditable(true);
								that.getView().byId("idTipologiaNPF").setVisible(false);
								that.getView().byId("labelTipo").setVisible(false);
								
								
								oItemTemplateIter = new sap.ui.core.Item({
									text: "Proposta in lavorazione",
									key: "01"
								});
								that.getView().byId("idIterNPF").addItem(oItemTemplateIter);
								that.getView().byId("idIterNPF").setVisible(false);
								that.getView().byId("labelIter").setVisible(false);
								
								/*that.getView().byId("idIterNPF").setEditable(true);
								oItemTemplateIter = new sap.ui.core.Item({
									text: "{DescIter}",
									key: "{Iter}"
								});
								that.getView().byId("idIterNPF").bindItems("/ZCA_AF_ITERPROSet", oItemTemplateIter);
								that.getView().byId("idIterNPF").setSelectedKey("");*/

								oView.byId("NPF_dialogScegliProposta").close();
								oView.byId("idIDNPFPoP").setValue("");

							}, // callback function for success
							error: function(oError) {
									MessageBox.error(oError.responseText);
								} // callback function for error
						});
					}
				}
			},

			onPressCloseScegliIDNPF: function() {
				this.getView().byId("NPF_dialogScegliProposta").close();
			},

			//***************************FINE METODI MENU A TENDINA*************************************

			//GESTIONE SALVATAGGIO DATI AL SALVA DI NPF

			onPressSalvaNPF: function(e) {

				var oView = this.getView();
				var oGlobalModel = oView.getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");

				//POSIZIONE FINANZIARIA
				var sPosFin = oView.byId("idPopPosFin").getText();
				var sAmministrazione = oView.byId("idAmminNPF").getValue();
				var sCdr = oView.byId("idCdRNPF").getValue();
				var sRagioneria = oView.byId("idRagioneriaNPF").getValue();
				var sMissione = oView.byId("idMissioneNPF").getValue();
				var sProgramma = oView.byId("idProgrammaNPF").getValue();
				var sAzione = oView.byId("idAzioneNPF").getValue();
				var sCapitolo = oView.byId("idCapitoloNPF").getValue();
				var sPg = oView.byId("idPGNPF").getValue();
				var sTitolo = oView.byId("idTitoloNPF").getValue();
				var sCategoria = oView.byId("idCategoriaNPF").getValue();
				var sCE2 = oView.byId("idCE2NPF").getValue();
				var sCE3 = oView.byId("idCE3NPF").getValue();
				// var sTCRC = oView.byId("idTCRCNPF").getValue();
				// var sTCRF = oView.byId("idTCRFNPF").getValue();
				var sMAC = oView.byId("idMacroAggregatoNPF").getValue();
				var sTipoSpesaCap = oView.byId("idTipoSpesaCapNPF").getSelectedKey();
				var sDenominazioneCapitoloInt = oView.byId("idDenominazioneCapitoloIntNPF").getValue();
				var sDenominazioneCapitoloRid = oView.byId("idDenominazioneCapitoloRidNPF").getValue();
				var sTipoSpesaPG = oView.byId("idTipoSpesaPGNPF").getSelectedKey();
				var sDenominazionePGInt = oView.byId("idDenominazionePGIntNPF").getValue();
				var sDenominazionePGRid = oView.byId("idDenominazionePGRidNPF").getValue();

				// sAmministrazione = sAmministrazione.splice(0, 1);
				var sAmmin = "020";

				//COFOG
				var aDatiCofog = this.getView().getModel("modelTableCofogNPF").getData();
				// var aCofog = [];
				// console.log(aDatiCofog);
				for (var i = 0; i < aDatiCofog.length; i++) {
					if (aDatiCofog[i].Icon) {
						delete aDatiCofog[i].Icon;
						delete aDatiCofog[i].Visible;
						// aCofog.push(aDatiCofog[i]);
					}
				}

				//PROPOSTA
				var sProposta = oView.byId("idIDPropostaNPF").getValue();
				var sKeycodepr = this.Keycode;
				var sTipo, sIter;
				if(oView.byId("idIterNPF").getVisible()) {
					sTipo = oView.byId("idTipologiaNPF").getValue();
					if(sTipo.toUpperCase() === "COMPENSATIVA") {
						sTipo = "1";
					} else {
						sTipo = "0";
					}
				} else {
					sTipo = "";
				}
				// var sIterDesc = oView.byId("idIterNPF").getValue();
				if(oView.byId("idIterNPF").getVisible()) {
					sIter = oView.byId("idIterNPF").getSelectedKey();
				} else {
					sIter = "01";
				}
				var sNickName = oView.byId("idNickNameNPF").getValue();
				var modelDefaultPosFinToPropostaNav = this.getOwnerComponent().getModel("modelDefaultPosFinToPropostaNav");
				var dataPosFinToPropostaDefault = modelDefaultPosFinToPropostaNav.getData();
				
				var defaultFikrs = dataPosFinToPropostaDefault.Fikrs;
				var defaultAnno = dataPosFinToPropostaDefault.Anno;
				var defaultReale = dataPosFinToPropostaDefault.Reale;
				var defaultFase = dataPosFinToPropostaDefault.Fase;
				var defaultVersione = dataPosFinToPropostaDefault.Versione;
				var defaultPrctr = dataPosFinToPropostaDefault.Prctr;

				var aDatiProp = [{
					Fikrs: defaultFikrs,
					Anno: defaultAnno,
					Fase: defaultFase,
					Versione: defaultVersione,
					Fipex: sPosFin,
					Eos: "S",
					Idproposta: sProposta,
					Keycodepr: sKeycodepr,
					Prctr: defaultPrctr,
					Reale:defaultReale,
					Iter: sIter,
					Nickname: sNickName,
					Tipologiaprop: sTipo
				}];
				
				//CONTROLLO SOMMA PERCENTUALI COFOG = 100
				var aCofogPerc = [];
				for (var b = 0; b < aDatiCofog.length; b++) {
					aCofogPerc.push(aDatiCofog[b].Perccofog);
				}
				var sSommaPercCofog = 0;
				for(var a = 0; a < aCofogPerc.length; a++) {
					sSommaPercCofog	+= +aCofogPerc[a]; 
				}
				
				var that = this;

				if (!sPg || !sMissione || !sProgramma  || !sAzione || 
				!sCapitolo || !sTitolo || !sCategoria || !sCE2 || !sCE3 ||
				!sMAC || !sDenominazioneCapitoloInt || !sDenominazioneCapitoloRid) {
					sap.m.MessageBox.warning(this.oResourceBundle.getText("MBCampiObbligatoriNPF"));
					return;
				}
				if (sSommaPercCofog !== 100) {
						sap.m.MessageBox.warning(that.getView().getModel("i18n").getResourceBundle().getText("MBCofogPercSomma"));
						return;
				}
				if (aDatiCofog.length === 0 || aDatiCofog.length === undefined) {
					sap.m.MessageBox.warning(this.oResourceBundle.getText("MBCofogObbligatorioPF"));
					return;
				} else {

					for (var p = 0; p < aDatiCofog.length; p++) {
						if (aDatiCofog[p].Perccofog === "") {
							sap.m.MessageBox.warning(this.oResourceBundle.getText("MBCofogPercObbligatorioPF"));
							return;
						}
					} //else {
						var oDati = {
							Fikrs: "S001",
							Anno: "",
							Fase: "DLB",
							Reale: "",
							Versione: "P",
							Fipex: sPosFin,
							Eos: "S",

							Prctr: sAmministrazione,
							Codiceammin: sAmmin,
							Codicecdr: sCdr,
							Codiceragioneria: sRagioneria,
							Codicemissione: sMissione,
							Codiceprogramma: sProgramma,
							Codiceazione: sAzione,
							Codicecapitolo: sCapitolo,
							Codicepg: sPg,
							Codicetitolo: sTitolo,
							Codicecategoria: sCategoria,
							Codiceclaeco2: sCE2,
							Codiceclaeco3: sCE3,
							// Numetcrcspe: sTCRC,
							// Numetcrfspe: sTCRF,
							Numemacspe: sMAC,
							Codicetipospcapspe: sTipoSpesaCap,
							Descrizionecapitolo: sDenominazioneCapitoloInt,
							Descrbrevecap: sDenominazioneCapitoloRid,
							Codicetiposppspe: sTipoSpesaPG,
							Descrizionepg: sDenominazionePGInt,
							Descrbrevepg: sDenominazionePGRid,

							PosFinToCofogNav: aDatiCofog,
							PosFinToPropostaNav: aDatiProp
						};
					
				}
				// } else {

				
				oGlobalModel.create("/PosFinSet", oDati, {
					success: function(oData, oResponse) {
						// console.log(oResponse);
						sap.m.MessageBox.success(that.oResourceBundle.getText("MBCreateSuccessPF"));

					},
					error: function(oError) {
						sap.m.MessageBox.error(that.oResourceBundle.getText("MBCreateError"));
					}
				});
			
		},

		//**********************************Metodi filtri*******************************************

		onChange: function(oEvent, inputRef) {
			var sSelectedVal;

			var oModelNuovaPosFin = this.getView().getModel("modelNuovaPosFin");

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroRespFA");
					this._resetInput("AzioneFA");
					this._resetInput("CapitoloFA");
				}
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("CentroRespFA");
				}
			}*/

			if (inputRef === "idMissioneNPF") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					oModelNuovaPosFin.setProperty("/MISS", "");
					this._resetInput("idProgrammaNPF");
					oModelNuovaPosFin.setProperty("/PROG", "");
					this._resetInput("idAzioneNPF");
					oModelNuovaPosFin.setProperty("/AZIO", "");
				}
			}

			if (inputRef === "idProgrammaNPF") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					oModelNuovaPosFin.setProperty("/PROG", "");
					this._resetInput("idAzioneNPF");
					oModelNuovaPosFin.setProperty("/AZIO", "");
				}
			}

			//DA IMPLEMENTARE
			/*if (inputRef === "CapitoloFA") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					this._resetInput("PGFA");
				}
			}*/

			if (inputRef === "idTitoloNPF") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					oModelNuovaPosFin.setProperty("/TIT", "");
					this._resetInput("idCategoriaNPF");
					oModelNuovaPosFin.setProperty("/CAT", "");
					this._resetInput("idCE2NPF");
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
				}
			}

			if (inputRef === "idCategoriaNPF") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					oModelNuovaPosFin.setProperty("/CAT", "");
					this._resetInput("idCE2NPF");
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
				}
			}

			if (inputRef === "idCE2NPF") {
				sSelectedVal = oEvent.getParameters().value;
				if (sSelectedVal === "" || sSelectedVal === undefined) {
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("CE3FA");
					oModelNuovaPosFin.setProperty("/CE3", "");
				}
			}

		},

		onSuggest: function(oEvent, inputRef) {
			var oInput, sTerm, aOrFilters, aAndFilters;
			var sAmminValFb, sMissioneValFb, sProgrammaValFb, sCapitoloValFb, sTitoloValFb, sCategoriaValFb, sCE2ValFb;
			// var aOrFiltersCond, aFilters;

			sAmminValFb = this.getView().byId("idAmminNPF").getValue();
			sMissioneValFb = this.getView().byId("idMissioneNPF").getValue();
			sProgrammaValFb = this.getView().byId("idProgrammaNPF").getValue();
			sCapitoloValFb = this.getView().byId("idCapitoloNPF").getValue();
			sTitoloValFb = this.getView().byId("idTitoloNPF").getValue();
			sCategoriaValFb = this.getView().byId("idCategoriaNPF").getValue();
			sCE2ValFb = this.getView().byId("idCE2NPF").getValue();
			var oFilterAmm, oFilterMiss, oFilterProg, oFilterCap, oFilterTit, oFilterCat, oFilterCe2;

			var aCompoundFilters;

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_AMMIN", "{modelConoVisibilita>Prctr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);
				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_CDR", "{modelConoVisibilita>CodiceCdr}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "RagioneriaFA") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("DescrEstesa", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "modelConoVisibilita>/ZCA_AF_RAGIONERIA", "{modelConoVisibilita>CodiceRagioneria}",
					"{modelConoVisibilita>DescrEstesa}", aAndFilters);
			}*/

			if (inputRef === "idMissioneNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesami", sTerm);
				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_MISSIONESet", "{Codicemissione}", "{Descrestesami}", aAndFilters);
			}

			if (inputRef === "idProgrammaNPF") {
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

			if (inputRef === "idAzioneNPF") {
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

			if (inputRef === "idCapitoloNPFPoP") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrizionecapitolo", sTerm);
				aOrFilters.aFilters.push(this._aOrFiltersCond("Codicecapitolo", sTerm));

				//Filtri in compound
				sAmminValFb = this.getView().byId("idAmminNPF").getValue();
				aCompoundFilters = [];
				oFilterAmm = this._filtersInCompound("Prctr", sAmminValFb);
				aCompoundFilters.push(oFilterAmm);
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CAPITOLOSet", "{Codicecapitolo}", "{Descrizionecapitolo}", aAndFilters);
			}

			if (inputRef === "idTitoloNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrtitolo", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TITOLOSet", "{Codicetitolo}", "{Descrtitolo}", aAndFilters);
			}

			if (inputRef === "idCategoriaNPF") {
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

			if (inputRef === "idCE2NPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrclaesco2", sTerm);

				//Filtri in compound
				aCompoundFilters = [];

				oFilterTit = this._filtersInCompound("Codicetitolo", sTitoloValFb);
				oFilterCat = this._filtersInCompound("Codicecategoria", sCategoriaValFb);

				aCompoundFilters.push(oFilterTit, oFilterCat);
				
				var modelDefaultPosFinToPropostaNav = this.getOwnerComponent().getModel("modelDefaultPosFinToPropostaNav");
				var dataPosFinToPropostaDefault = modelDefaultPosFinToPropostaNav.getData();
				
				var defaultFikrs = dataPosFinToPropostaDefault.Fikrs;
				var defaultAnno = dataPosFinToPropostaDefault.Anno;
				var defaultReale = dataPosFinToPropostaDefault.Reale;
				var defaultFase = dataPosFinToPropostaDefault.Fase;
				var defaultVersione = dataPosFinToPropostaDefault.Versione;
				
				aCompoundFilters.push( new Filter("Fikrs", FilterOperator.EQ, defaultFikrs) );
				aCompoundFilters.push( new Filter("Anno", FilterOperator.EQ, defaultAnno) );
				aCompoundFilters.push( new Filter("Reale", FilterOperator.EQ, defaultReale) );
				aCompoundFilters.push( new Filter("Fase", FilterOperator.EQ, defaultFase) );
				aCompoundFilters.push( new Filter("Versione", FilterOperator.EQ, defaultVersione) );
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CLAECO2Set", "{Codiceclaeco2}", "{Descrclaesco2}", aAndFilters);
			}

			if (inputRef === "idCE3NPF") {
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
				
				var modelDefaultPosFinToPropostaNav = this.getOwnerComponent().getModel("modelDefaultPosFinToPropostaNav");
				var dataPosFinToPropostaDefault = modelDefaultPosFinToPropostaNav.getData();
				
				var defaultFikrs = dataPosFinToPropostaDefault.Fikrs;
				var defaultAnno = dataPosFinToPropostaDefault.Anno;
				var defaultReale = dataPosFinToPropostaDefault.Reale;
				var defaultFase = dataPosFinToPropostaDefault.Fase;
				var defaultVersione = dataPosFinToPropostaDefault.Versione;
				
				aCompoundFilters.push( new Filter("Fikrs", FilterOperator.EQ, defaultFikrs) );
				aCompoundFilters.push( new Filter("Anno", FilterOperator.EQ, defaultAnno) );
				aCompoundFilters.push( new Filter("Reale", FilterOperator.EQ, defaultReale) );
				aCompoundFilters.push( new Filter("Fase", FilterOperator.EQ, defaultFase) );
				aCompoundFilters.push( new Filter("Versione", FilterOperator.EQ, defaultVersione) );
				aAndFilters = this._aAndFiltersCond(aOrFilters, aCompoundFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_CLAECO3Set", "{Codiceclaeco3}", "{Descrclaeco3}", aAndFilters);
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

			if (inputRef === "idTCRCNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				// aOrFilters = this._aOrFiltersCond("Numetcrc", sTerm);
				aOrFilters = this._aOrFiltersCond("Descrestesa", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/ZCOBI_PRSP_POSFINEXTSet", "{Numetcrcspe}", "{Descrestesa}",
					aAndFilters);
			}

			if (inputRef === "idTCRFNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				// aOrFilters = this._aOrFiltersCond("Numetcrc", sTerm);
				aOrFilters = this._aOrFiltersCond("Descrestesa", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TCR_CSet", "{Numetcrcspe}", "{Descrestesa}", aAndFilters);
			}

			if (inputRef === "idTCRFNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				// aOrFilters = this._aOrFiltersCond("Numetcrf", sTerm);
				aOrFilters = this._aOrFiltersCond("Descrestesa", sTerm);

				//Filtri in compound
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "/ZCA_AF_TCR_FSet", "{Numetcrfspe}", "{Descrestesa}", aAndFilters);
			}

			if (inputRef === "idMacroAggregatoNPF") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Descrestesatit", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/ZCOBI_PRSP_POSFINEXTSet", "{Numemacspe}", "{Descrestesatit}",
					aAndFilters);
			}

			if (inputRef === "idIDNPFPoP") {
				oInput = oEvent.getSource();
				sTerm = oEvent.getParameter("suggestValue").toUpperCase();

				//Filtri campo ricerca suggest
				aOrFilters = this._aOrFiltersCond("Nickname", sTerm);

				//Filtri in compound assenti
				aAndFilters = this._aAndFiltersCond(aOrFilters);

				this._onSuggestGeneric(oInput, sTerm, "ZSS4_COBI_PRSP_ESAMOD_SRV>/PropostaSet", "{ZSS4_COBI_PRSP_ESAMOD_SRV>Idproposta}",
					"{ZSS4_COBI_PRSP_ESAMOD_SRV>Nickname}", aAndFilters);
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
			var sInputValue, aOrFiltersCond, aFilters;
			var sAmminVal, sMissioneVal, sProgrammaVal;
			var sTitoloVal, sCategoriaVal, sCE2Val;
			var fAmm, fMiss, fProg, fTit, fCat, fCe2, fCap;
			var sCapitoloVal;
			var oModelConi = this.getView().getModel("modelConoVisibilita");
			var oModelZSS4_COBI_PRSP_ESAMOD_SRV = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var oModelGlobal = this.getView().getModel();
			var arrayProperties = [];
			sInputValue = oEvent.getSource().getValue();

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {

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
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {
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
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "RagioneriaFA") {
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
			}*/

			if (inputRef === "idMissioneNPF") {
				if (!this.idMissioneNPF) {
					this.idMissioneNPF = this.createValueHelpDialog(
						"idMissioneNPF",
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
				this.idMissioneNPF.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idMissioneNPF.open(sInputValue);
			}

			if (inputRef === "idProgrammaNPF") {
				sMissioneVal = this.getView().byId("idMissioneNPF").getValue();

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
				if (!this.idProgrammaNPF) {
					this.idProgrammaNPF = this.createValueHelpTableSelectDialog(
						"idProgrammaNPF",
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
				this.idProgrammaNPF.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idProgrammaNPF.open(sInputValue);
			}

			if (inputRef === "idAzioneNPF") {
				sProgrammaVal = this.getView().byId("idProgrammaNPF").getValue();
				sMissioneVal = this.getView().byId("idMissioneNPF").getValue();
				sAmminVal = this.getView().byId("idAmminNPF").getValue();

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
				if (!this.idAzioneNPF) {
					this.idAzioneNPF = this.createValueHelpTableSelectDialog(
						"idAzioneNPF",
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
				this.idAzioneNPF.getBinding("items").filter(aFilters);
				//Open ValueHelpDialog filtered by the input's value
				this.idAzioneNPF.open(sInputValue);
			}

			if (inputRef === "idCapitoloNPFPoP") {
				sAmminVal = this.getView().byId("idAmminNPF").getValue();

				if (!this.idCapitoloNPFPoP) {
					this.idCapitoloNPFPoP = this.createValueHelpDialog(
						"idCapitoloNPFPoP",
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
				this.idCapitoloNPFPoP.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idCapitoloNPFPoP.open(sInputValue);
			}

			if (inputRef === "idTitoloNPF") {

				if (!this.idTitoloNPF) {
					this.idTitoloNPF = this.createValueHelpDialog(
						"idTitoloNPF",
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
				this.idTitoloNPF.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idTitoloNPF.open(sInputValue);
			}

			if (inputRef === "idCategoriaNPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();
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

				if (!this.idCategoriaNPF) {
					this.idCategoriaNPF = this.createValueHelpTableSelectDialog(
						"idCategoriaNPF",
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
				this.idCategoriaNPF.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idCategoriaNPF.open(sInputValue);
			}

			if (inputRef === "idCE2NPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();
				sCategoriaVal = this.getView().byId("idCategoriaNPF").getValue();
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
				if (!this.idCE2NPF) {
					this.idCE2NPF = this.createValueHelpTableSelectDialog(
						"idCE2NPF",
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
				
				var modelDefaultPosFinToPropostaNav = this.getOwnerComponent().getModel("modelDefaultPosFinToPropostaNav");
				var dataPosFinToPropostaDefault = modelDefaultPosFinToPropostaNav.getData();
				
				var defaultFikrs = dataPosFinToPropostaDefault.Fikrs;
				var defaultAnno = dataPosFinToPropostaDefault.Anno;
				var defaultReale = dataPosFinToPropostaDefault.Reale;
				var defaultFase = dataPosFinToPropostaDefault.Fase;
				var defaultVersione = dataPosFinToPropostaDefault.Versione;
				
				aFilters.aFilters.push( new Filter("Fikrs", FilterOperator.EQ, defaultFikrs) );
				aFilters.aFilters.push( new Filter("Anno", FilterOperator.EQ, defaultAnno) );
				aFilters.aFilters.push( new Filter("Reale", FilterOperator.EQ, defaultReale) );
				aFilters.aFilters.push( new Filter("Fase", FilterOperator.EQ, defaultFase) );
				aFilters.aFilters.push( new Filter("Versione", FilterOperator.EQ, defaultVersione) );
				
				
				this.idCE2NPF.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idCE2NPF.open(sInputValue);
			}

			if (inputRef === "idCE3NPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();
				sCategoriaVal = this.getView().byId("idCategoriaNPF").getValue();
				sCE2Val = this.getView().byId("idCE2NPF").getValue();
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

				if (!this.idCE3NPF) {
					this.idCE3NPF = this.createValueHelpTableSelectDialog(
						"idCE3NPF",
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
				var modelDefaultPosFinToPropostaNav = this.getOwnerComponent().getModel("modelDefaultPosFinToPropostaNav");
				var dataPosFinToPropostaDefault = modelDefaultPosFinToPropostaNav.getData();
				
				var defaultFikrs = dataPosFinToPropostaDefault.Fikrs;
				var defaultAnno = dataPosFinToPropostaDefault.Anno;
				var defaultReale = dataPosFinToPropostaDefault.Reale;
				var defaultFase = dataPosFinToPropostaDefault.Fase;
				var defaultVersione = dataPosFinToPropostaDefault.Versione;
				
				aFilters.aFilters.push( new Filter("Fikrs", FilterOperator.EQ, defaultFikrs) );
				aFilters.aFilters.push( new Filter("Anno", FilterOperator.EQ, defaultAnno) );
				aFilters.aFilters.push( new Filter("Reale", FilterOperator.EQ, defaultReale) );
				aFilters.aFilters.push( new Filter("Fase", FilterOperator.EQ, defaultFase) );
				aFilters.aFilters.push( new Filter("Versione", FilterOperator.EQ, defaultVersione) );
				this.idCE3NPF.getBinding("items").filter(aFilters);
				// Open ValueHelpDialog filtered by the input's value
				this.idCE3NPF.open(sInputValue);
			}

			if (inputRef === "idIDNPFPoP") {

				if (!this.idIDNPFPoP) {
					this.idIDNPFPoP = this.createValueHelpDialog(
						"idIDNPFPoP",
						oModelZSS4_COBI_PRSP_ESAMOD_SRV,
						"ZSS4_COBI_PRSP_ESAMOD_SRV",
						"{i18n>IDProposta}",
						"/PropostaSet",
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
				this.idIDNPFPoP.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idIDNPFPoP.open(sInputValue);
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

			if (inputRef === "idTCRCNPF") {

				if (!this.idTCRCNPF) {
					this.idTCRCNPF = this.createValueHelpDialog(
						"idTCRCNPF",
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
				this.idTCRCNPF.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idTCRCNPF.open(sInputValue);
			}

			if (inputRef === "idTCRFNPF") {

				if (!this.idTCRFNPF) {
					this.idTCRFNPF = this.createValueHelpDialog(
						"idTCRFNPF",
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
				this.idTCRFNPF.getBinding("items").filter(aOrFiltersCond);
				// Open ValueHelpDialog filtered by the input's value
				this.idTCRFNPF.open(sInputValue);
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

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Prctr", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							//new Filter("Codicecdr", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "RagioneriaFA") {

				aOrFiltersCond =
					new Filter({
						filters: [
							// new Filter("CodiceRagioneria", FilterOperator.Contains, sValue),
							new Filter("DescrEstesa", FilterOperator.Contains, sValue)
						],
						and: false
					});
				oEvent.getSource().getBinding("items").filter(aOrFiltersCond);
			}*/

			if (inputRef === "idMissioneNPF") {

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

			if (inputRef === "idProgrammaNPF") {
				sMissioneVal = this.getView().byId("idMissioneNPF").getValue();

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

			if (inputRef === "idAzioneNPF") {
				sProgrammaVal = this.getView().byId("idProgrammaNPF").getValue();
				sMissioneVal = this.getView().byId("idMissioneNPF").getValue();
				sAmminVal = this.getView().byId("idAmminNPF").getValue();

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

			if (inputRef === "idCapitoloNPFPoP") {
				sAmminVal = this.getView().byId("idAmminNPF").getValue();

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

			if (inputRef === "idTitoloNPF") {

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

			if (inputRef === "idCategoriaNPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();

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

			if (inputRef === "idCE2NPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();
				sCategoriaVal = this.getView().byId("idCategoriaNPF").getValue();

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

			if (inputRef === "idCE3NPF") {
				sTitoloVal = this.getView().byId("idTitoloNPF").getValue();
				sCategoriaVal = this.getView().byId("idCategoriaNPF").getValue();
				sCE2Val = this.getView().byId("idCE2NPF").getValue();

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

			if (inputRef === "idIDNPFPoP") {

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

			if (inputRef === "idTCRCNPF") {

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

			if (inputRef === "idTCRFNPF") {

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
		},

		onValueHelpConfirm: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var sMissioneValFA, sProgrammaValFA, sAzioneValFA;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val;

			oSelectedItem = oEvent.getParameter("selectedItem");

			var oModelNuovaPosFin = this.getView().getModel("modelNuovaPosFin");
			var oModelPropostaNPF = this.getView().getModel("modelPropostaNPF");
			var sTipo, sIter, sDescIter, sNickName;

			if (!inputRef) {
				inputRef = oEvent.getParameters().id;
			}

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);
				this.byId("AmmFA").setValue(oSelectedItem.getTitle());
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);
				this.byId("CentroRespFA").setValue(oSelectedItem.getTitle());
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "RagioneriaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					// this._enableInput("Missione", false);
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("RagioneriaFA").setValue(oSelectedItem.getTitle());
			}*/

			if (inputRef === "idMissioneNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);
				this.byId("idMissioneNPF").setValue(oSelectedItem.getTitle());
				oModelNuovaPosFin.setProperty("/MISS", oSelectedItem.getTitle());
			}

			if (inputRef === "idProgrammaNPF") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idMissioneNPF");
					oModelNuovaPosFin.setProperty("/MISS", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				this._fillInput("idMissioneNPF", sMissioneValFA);
				oModelNuovaPosFin.setProperty("/MISS", sMissioneValFA);
				this._fillInput("idProgrammaNPF", sProgrammaValFA);
				oModelNuovaPosFin.setProperty("/PROG", sProgrammaValFA);
			}

			if (inputRef === "idAzioneNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idMissioneNPF");
					oModelNuovaPosFin.setProperty("/MISS", "");
					this._resetInput("idProgrammaNPF");
					oModelNuovaPosFin.setProperty("/PROG", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sMissioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
				sProgrammaValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
				sAzioneValFA = this.getOwnerComponent().getModel().getData(sPath).Codiceazione;
				this._fillInput("idMissioneNPF", sMissioneValFA);
				oModelNuovaPosFin.setProperty("/MISS", sMissioneValFA);
				this._fillInput("idProgrammaNPF", sProgrammaValFA);
				oModelNuovaPosFin.setProperty("/PROG", sProgrammaValFA);
				this._fillInput("idAzioneNPF", sAzioneValFA);
				oModelNuovaPosFin.setProperty("/AZIO", sProgrammaValFA);
			}

			if (inputRef === "idCapitoloNPFPoP") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idPGNPF");
					this.getView().getModel("modelPFCapEsistente").setData("");
					this.getView().getModel("modelCOFOGCapEsistente").setData("");
					return;
				}
				var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				// var oLocalModel = this.getView().getModel("modelPFCapEsistente");
				var sCodCap = oSelectedItem.getTitle();
				var sCodAmm = this.getView().byId("idAmminNPF").getValue();

				var aFilters;
				aFilters = [ // <-- Should be an array, not a Filter instance!
					new Filter({ // required from "sap/ui/model/Filter"
						path: "Codicecapitolo",
						operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
						value1: sCodCap
					}),
					new Filter({ // required from "sap/ui/model/Filter"
						path: "Prctr",
						operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
						value1: sCodAmm
					})
				];

				var that = this;

				oModel.read("/PosFinSet", {
					filters: aFilters,
					urlParameters: {
						"$top": 1,
						"$expand": "PosFinToCofogNav"
					},
					success: function(oData, oResponse) {
						// console.log(oData);

						that.getView().getModel("modelPFCapEsistente").setData(oData.results[0]);
						var oTableCofog = that.getView().getModel("modelTableCofogNPF");
						var aDataCofog = [];
						var aCofog = oData.results[0].PosFinToCofogNav.results;
						for (var i = 0; i < aCofog.length; i++) {
							aDataCofog.push(aCofog[i]);
						}
						oTableCofog.setData(aDataCofog);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});

				this.getView().byId("idCapitoloNPFPoP").setValue(oSelectedItem.getTitle());
				// this.getView().byId("idCapitoloNPF").setValue(oSelectedItem.getTitle());

			}

			if (inputRef === "idTitoloNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.byId("idTitoloNPF").setValue(oSelectedItem.getTitle());
				oModelNuovaPosFin.setProperty("/TIT", oSelectedItem.getTitle());
			}

			if (inputRef === "idCategoriaNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idCE2NPF");
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
			}

			if (inputRef === "idCE2NPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
				this._fillInput("idCE2NPF", sCE2Val);
				oModelNuovaPosFin.setProperty("/CE2", sCE2Val);
			}

			if (inputRef === "idCE3NPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				sCE3Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco3;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
				this._fillInput("idCE2NPF", sCE2Val);
				oModelNuovaPosFin.setProperty("/CE2", sCE2Val);
				this._fillInput("idCE3NPF", sCE3Val);
				oModelNuovaPosFin.setProperty("/CE3", sCE3Val);
			}

			if (inputRef === "idIDNPFPoP") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					oModelPropostaNPF.setProperty("/Iter", "");
					oModelPropostaNPF.setProperty("/DescIter", "");
					oModelPropostaNPF.setProperty("/Tipo", "");
					oModelPropostaNPF.setProperty("/Nickname", "");
					oModelPropostaNPF.setProperty("/Proposta", "");
					that.Keycode = "";
					// this.getView().byId("idIterNPF").setValue("");
					// this.getView().byId("idNickNameNPF").setValue("");
					return;
				}
				sPath = oSelectedItem.getBindingContextPath();
				this.byId("idIDNPFPoP").setValue(oSelectedItem.getTitle());

				// this.byId("idIDPropostaNPF").setValue(oSelectedItem.getTitle());
				sTipo = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Tipologiaprop;
				sIter = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Iter;
				sDescIter = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Desciter;
				sNickName = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Nickname;
				var sKeycode = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Keycodepr;
				// this.getView().byId("idTipologiaNPF").setValue(sTipo);
				if (sTipo === "0") {
					sTipo = "Compensativa";
				} else {
					sTipo = "Non Compensativa";
				}
				oModelPropostaNPF.setProperty("/Proposta", oSelectedItem.getTitle());
				oModelPropostaNPF.setProperty("/Tipo", sTipo);
				oModelPropostaNPF.setProperty("/Iter", sIter);
				oModelPropostaNPF.setProperty("/Desciter", sDescIter);
				oModelPropostaNPF.setProperty("/Nickname", sNickName);
				this.Keycode = sKeycode;
				// this.getView().byId("idIterNPF").setValue(sIter);
				// this.getView().byId("idNickNameNPF").setValue(sNickName);
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

			if (inputRef === "idTCRCNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("idTCRCNPF").setValue(oSelectedItem.getTitle());
			}

			if (inputRef === "idTCRFNPF") {
				// oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				// this._enableInput("Missione", true);
				this.byId("idTCRFNPF").setValue(oSelectedItem.getTitle());
			}

		},

		onValueHelpClose: function(oEvent, inputRef) {},

		onSuggestionItemSelected: function(oEvent, inputRef) {
			var oSelectedItem, sPath;
			var oInputAmm = this.getView().byId("Amministrazione");
			var sMissioneVal, sProgrammaVal, sAzioneVal;
			var sCapitoloVal, sPGVal;
			var sTitoloVal, sCategoriaVal, sCE2Val, sCE3Val;

			var oModelNuovaPosFin = this.getView().getModel("modelNuovaPosFin");

			var oModelPropostaNPF = this.getView().getModel("modelPropostaNPF");
			var sTipo, sIter, sDescIter, sNickName;

			//DA IMPLEMENTARE
			/*if (inputRef === "AmmFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				this.getView().byId("AmmFA").setValue(oSelectedItem.getProperty("text"));
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "CentroRespFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oInputAmm = this.getView().byId("AmmFA");
				if (!oSelectedItem & oInputAmm.getEnabled() === "true") {
					this._resetInput("AmmFA");
				}
			}*/

			//DA IMPLEMENTARE
			/*if (inputRef === "RagioneriaFA") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					return;
				}
				this.getView().byId("RagioneriaFA").setValue(oSelectedItem.getTitle());
			}*/

			if (inputRef === "idMissioneNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					return;
				}
				oModelNuovaPosFin.setProperty("/MISS", oSelectedItem.getProperty("text"));
				this.getView().byId("MissioneFA").setValue(oSelectedItem.getProperty("text"));
			}

			if (inputRef === "idProgrammaNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("idMissioneNPF");
					oModelNuovaPosFin.setProperty("/MISS", "");

				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					this._fillInput("idMissioneNPF", sMissioneVal);
					oModelNuovaPosFin.setProperty("/MISS", sMissioneVal);
					this.getView().byId("idProgrammaNPF").setValue(oSelectedItem.getProperty("text"));
					oModelNuovaPosFin.setProperty("/PROG", oSelectedItem.getProperty("text"));
				}
			}

			if (inputRef === "idAzioneNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				if (!oSelectedItem) {
					this._resetInput("idMissioneNPF");
					oModelNuovaPosFin.setProperty("/MISS", "");
					this._resetInput("idProgrammaNPF");
					oModelNuovaPosFin.setProperty("/PROG", "");
					oModelNuovaPosFin.setProperty("/AZIO", "");
					//this._resetInput("AmmFA");

				} else {
					sPath = oSelectedItem.getBindingContext().getPath();
					sMissioneVal = this.getOwnerComponent().getModel().getData(sPath).Codicemissione;
					sProgrammaVal = this.getOwnerComponent().getModel().getData(sPath).Codiceprogramma;
					this._fillInput("idMissioneNPF", sMissioneVal);
					oModelNuovaPosFin.setProperty("/MISS", sMissioneVal);
					this._fillInput("idProgrammaNPF", sProgrammaVal);
					oModelNuovaPosFin.setProperty("/PROG", sProgrammaVal);
					this.getView().byId("idAzioneNPF").setValue(oSelectedItem.getProperty("text"));
					oModelNuovaPosFin.setProperty("/AZIO", oSelectedItem.getProperty("text"));
					// this._fillInput("Amministrazione", sAmminVal);
				}
			}

			if (inputRef === "idCapitoloNPFPoP") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				// oEvent.getSource().getBinding("items").filter([]);

				if (!oSelectedItem) {
					this._resetInput("idPGNPF");
					this.getView().getModel("modelPFCapEsistente").setData("");
					this.getView().getModel("modelCOFOGCapEsistente").setData("");
					return;
				}
				var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
				// var oLocalModel = this.getView().getModel("modelPFCapEsistente");
				var sCodCap = oSelectedItem.getText();
				var sCodAmm = this.getView().byId("idAmminNPF").getValue();

				var aFilters;
				aFilters = [ // <-- Should be an array, not a Filter instance!
					new Filter({ // required from "sap/ui/model/Filter"
						path: "Codicecapitolo",
						operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
						value1: sCodCap
					}),
					new Filter({ // required from "sap/ui/model/Filter"
						path: "Prctr",
						operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
						value1: sCodAmm
					})
				];

				var that = this;
				oModel.read("/PosFinSet", {
					filters: aFilters,
					urlParameters: {
						"$top": 1,
						"$expand": "PosFinToCofogNav"
					},
					success: function(oData, oResponse) {
						// console.log(oData);

						that.getView().getModel("modelPFCapEsistente").setData(oData.results[0]);
						var oTableCofog = that.getView().getModel("modelTableCofogNPF");
						var aDataCofog = [];
						var aCofog = oData.results[0].PosFinToCofogNav.results;
						for (var i = 0; i < aCofog.length; i++) {
							aDataCofog.push(aCofog[i]);
						}
						oTableCofog.setData(aDataCofog);
					},
					error: function(oError) {
						MessageBox.error(oError.responseText);
					}
				});
				this.getView().byId("idCapitoloNPF").setValue(oSelectedItem.getText());
			}

			if (inputRef === "idTitoloNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					oModelNuovaPosFin.setProperty("/TIT", "");
					return;
				}
				this.getView().byId("idTitoloNPF").setValue(oSelectedItem.getText());
				oModelNuovaPosFin.setProperty("/TIT", oSelectedItem.getText());
			}

			if (inputRef === "idCategoriaNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					oModelNuovaPosFin.setProperty("/CAT", "");
					this._resetInput("idCE2NPF");
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				// var sDescTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Descrtitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				// var sDescCatVal = this.getOwnerComponent().getModel().getData(sPath).Descrcategoria;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
			}

			if (inputRef === "idCE2NPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					oModelNuovaPosFin.setProperty("/CE2", "");
					this._resetInput("idCE3NPF");
					oModelNuovaPosFin.setProperty("/CE3", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
				this._fillInput("idCE2NPF", sCE2Val);
				oModelNuovaPosFin.setProperty("/CE2", sCE2Val);
			}

			if (inputRef === "idCE3NPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					oModelNuovaPosFin.setProperty("/CE3", "");
					return;
				}
				sPath = oSelectedItem.getBindingContext().getPath();
				sTitoloVal = this.getOwnerComponent().getModel().getData(sPath).Codicetitolo;
				sCategoriaVal = this.getOwnerComponent().getModel().getData(sPath).Codicecategoria;
				sCE2Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco2;
				sCE3Val = this.getOwnerComponent().getModel().getData(sPath).Codiceclaeco3;
				this._fillInput("idTitoloNPF", sTitoloVal);
				oModelNuovaPosFin.setProperty("/TIT", sTitoloVal);
				this._fillInput("idCategoriaNPF", sCategoriaVal);
				oModelNuovaPosFin.setProperty("/CAT", sCategoriaVal);
				this._fillInput("idCE2NPF", sCE2Val);
				oModelNuovaPosFin.setProperty("/CE2", sCE2Val);
				this._fillInput("idCE3NPF", sCE3Val);
				oModelNuovaPosFin.setProperty("/CE3", sCE3Val);
			}

			if (inputRef === "idIDNPFPoP") {
				oSelectedItem = oEvent.getParameter("selectedItem");

				if (!oSelectedItem) {
					oModelPropostaNPF.setProperty("/Proposta", "");
					oModelPropostaNPF.setProperty("/Tipo", "");
					oModelPropostaNPF.setProperty("/Iter", "");
					oModelPropostaNPF.setProperty("/Desciter", "");
					oModelPropostaNPF.setProperty("/Nickname", "");
					that.Keycode = "";
					return;
				}
				sPath = oSelectedItem.getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath();
				sIter = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Iter;
				sDescIter = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Desciter;
				sTipo = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Tipologiaprop;
				sNickName = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Nickname;
				var sKeycode = this.getOwnerComponent().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").getData(sPath).Keycode;

				if (sTipo === "0") {
					sTipo = "Non Compensativa";
				} else {
					sTipo = "Compensativa";
				}
				oModelPropostaNPF.setProperty("/Proposta", oSelectedItem.getText());
				oModelPropostaNPF.setProperty("/Tipo", sTipo);
				oModelPropostaNPF.setProperty("/Iter", sIter);
				oModelPropostaNPF.setProperty("/Desciter", sDescIter);
				oModelPropostaNPF.setProperty("/Nickname", sNickName);
				that.Keycode = sKeycode;
				this.byId("idIDNPFPoP").setValue(oSelectedItem.getText());
				// this.byId("idIDPropostaNPF").setValue(oSelectedItem.getText());
				// this.byId("idTipologiaNPF").setValue(sTipo);
				// this.byId("idIterNPF").setValue(sIter);
				// this.byId("idNickNameNPF").setValue(sNickname);
			}

			if (inputRef === "idTCRCNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("idTCRCNPF").setValue(oSelectedItem.getText());
			}

			if (inputRef === "idTCRFNPF") {
				oSelectedItem = oEvent.getParameter("selectedItem");
				oEvent.getSource().getBinding("items").filter([]);
				if (!oSelectedItem) {
					return;
				}
				// sPath = oSelectedItem.getBindingContext().getPath();
				this.byId("idTCRFNPF").setValue(oSelectedItem.getText());
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
			var sPosFin = this.getView().byId("idPopPosFin").getText();
			
			//modelTableCofogNPF

           // var sFipex = this.getView().getModel("modelTestata").getData().Fipex.replaceAll(".", "");
            for (var i = 0; i < aDataSelected.length; i++) {
                var index = aDataSelected[i].split("/")[1];
                var o = {
                    "Codcofogl1": aModelCofog[index].CodCofogL1,
                    "Codcofogl2": aModelCofog[index].CodCofogL2,
                    "Codcofogl3": aModelCofog[index].CodCofogL3,
                    "Descrcofog": aModelCofog[index].Descrizione,
                    "Fikrs": aModelCofog[index].Fikrs,
                    "Fipex": sPosFin, //sFipex
                    "Anno": aModelCofog[index].Anno,
                    "Fase": aModelCofog[index].Fase,
                    "Reale": aModelCofog[index].Reale,
                    "Versione": aModelCofog[index].Versione,
                    "Eos": "S",
                    "CodConcatenato": aModelCofog[index].CodConcatenato,
                    "Livello": aModelCofog[index].Livello, //FORSE QUESTO NON SERVE
                    "Perccofog": "0",
                    "status": "new",
                };
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
        } 

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.NuovaPosizioneFinanziaria
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.NuovaPosizioneFinanziaria
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.NuovaPosizioneFinanziaria
		 */
		//	onExit: function() {
		//
		//	}

	});

});