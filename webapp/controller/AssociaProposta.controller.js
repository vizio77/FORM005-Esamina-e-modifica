sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/core/Fragment",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageBox",
	"../util/formatter",
	"sap/ui/core/routing/History",
	"sap/ui/model/json/JSONModel"
], function(Controller, BaseController, Fragment, Filter, FilterOperator, syncStyleClass, MessageBox, formatter,History,JSONModel) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.AssociaProposta", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.GestisciID
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			//this.oRouter.getRoute("AssociaProposta").attachPatternMatched(this._onObjectMatched, this);
			//this.oRouter.getRoute("AssociaProposta").attachMatched(this._onRouteMatched, this);
			this.oDataModel = this.getModel();
			this.oResourceBundle = this.getResourceBundle();
			this.Keycode = "";

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
			//var oTable = this.getView().byId("tableAssociaProposta");
			//var oModel=this.getOwnerComponent().getModel("selPosModel");
			//this.getView().setModel(oModel,"selPosModel");
			//this._getAvvioAssociaProposta();
			
			this.oRouter.getRoute("AssociaProposta").attachMatched(this._onRouteMatched, this);
		},
		
		_onRouteMatched: function(oEvent) {
			this._resetCheckbox("modelTreeTable", this);
			this.sRouterParameter = oEvent.getParameters().name;

			this._getAvvioAssociaProposta();
			this._onLoadTreeTable("treeTableID", "modelTreeTable>/ZES_AVVIOIDSet");
		},
		
		_onLoadTreeTable: function(sIdTreeTable, sTreeTableBindingPath) {

			var oTreeTable = this.getView().byId(sIdTreeTable);
			var aFilters = [];

			aFilters.push( new Filter("Iter", FilterOperator.EQ, "01"))
			
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
		
		onSelectCheckBox: function(oEvent) {
			this._resetCheckbox("modelTreeTable", this);
            var oEl = oEvent.getSource().getBindingContext("modelTreeTable").sPath;
            var oObjectUpdate = this.getView().getModel("modelTreeTable").oData[oEl.slice(1)];
			var oModel = new JSONModel(oObjectUpdate);
			this.getView().setModel(oModel, "propostaSelectedModel");
            /* if (oObjectUpdate.SELECTED && oObjectUpdate.SELECTED === true) {
                oObjectUpdate.SELECTED = false;
            } else {
                oObjectUpdate.SELECTED = true;
            } */
        },
        
        _getSelectedItems: function() {
        	
            var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
            var aData = this.getView().getModel("modelTreeTable").oData;
            var aSelected = [],
                aValResult = [];
            for (var i = 0; i < aObject.length; i++) {
                if (aData[aObject[i]].SELECTED === true) {
                    aSelected.push(aData[aObject[i]]);
                }
            }
           return aSelected;
        },
		
	
		
		_getAvvioAssociaProposta: function() {
			var oTable = this.getView().byId("tableAssociaProposta");

			//filtri per IDposfin
			var oIdPosFinSel = this.getView().getModel("modelPosFinSelected").getData().IdPosfin;
			//var aPosFinSel = oIdPosFinSel.IdPosfin;
			//var aPosFinSel = oIdPosFinSel.IdPosfin;
			var oModel = new JSONModel(oIdPosFinSel);
			this.getView().setModel(oModel, "modelPosFinToAssociate");
			//var viewModel=this.getView().getModel("modelPosFinToAssociate");
			var tableModel = new sap.ui.model.json.JSONModel();
			tableModel.setData(oIdPosFinSel);
			this.getView().setModel(tableModel);
			oTable.bindRows("/");

		
			
			// var aFilters = new Filter({
			// 	filters: [],
			// 	and: false
			// });
			// if (aPosFinSel) {
			// 	for (var i = 0; i < aPosFinSel.length; i++) {
			// 		var fil = new Filter("Fipex", FilterOperator.EQ, aPosFinSel[i].PosFin);
			// 		// var fil = new Filter("Fipex", FilterOperator.EQ, aPosFinSel[i].PosFin.replaceAll(".", ""));
			// 		aFilters.aFilters.push(fil);
			// 	}
			// }

			/*
			oTable.bindRows({
				path: "modelTreeTable>/ZES_AVVIOPF_IDSet",
				parameters: {
					countMode: 'Inline',
					operationMode: 'Client', // necessario per ricostruire la gerarchia lato client
					// se le annotazioni sono gestite su FE tramite treeAnnotationProperties
					useServersideApplicationFilters: true // necessario in combinazione con operationMode : 'Client' per inviare i filtri al BE ($filter)
				},

				filters: [aFilters]
			});*/
			//Azzera la selezione delle righe
			/*var oItems = oTreeTable.getRows();
			for (var j = 0; j < oItems.length; j++) {
				oItems[j].getAggregation("cells")[0].setSelected(false);
			}*/
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
		onPressNavToNuovaPosizione: function() {
			this.oRouter.navTo("NuovaPosizioneFinanziaria");
			/*this.oRouter.navTo("MessagePage", {
				viewName: "NuovaPosizioneFinanziaria"
			});*/
		},
		onPressNavToRV: function() {
			this.getRouter().navTo("CreaRimodulazioneVerticale");
			/*this.oRouter.navTo("MessagePage", {
				viewName: "CreaRimodulazioneVerticale"
			});*/
		},
		
		onPressBack: function(){
			var oHistory = History.getInstance();
			var sPreviousHash = oHistory.getPreviousHash();

			if (sPreviousHash !== undefined) {
				window.history.go(-1);
			} else {
				var oRouter = this.getOwnerComponent().getRouter();
				oRouter.navTo("overview", {}, true);
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
		
		onPressNavToHomeLoc: function() {
			// var oTreeTablePF = this.getView().byId("treeTablePF");
			// oTreeTablePF.unbindRows();
			this.getRouter().navTo("appHome");
		},
		
		onPressAssocia:function(){
		
			
			var oModelPageAut = this.getView().getModel("modelPageAut");
			this._refreshModel(oModelPageAut);
			//this._rowSelProps();
			// var sPage = this.getView().getModel("i18n").getResourceBundle().getText("subtitlePosFinIdProposta");
			var propostaSelectedModel = this.getView().getModel("propostaSelectedModel");
			var propostaSelected = propostaSelectedModel.getData();

			if(!propostaSelected){
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoCompetenzaPageIDProposta"));
				return;
			}

			this._resetCheckbox("modelTreeTable", this);
				this._associaProps(propostaSelected);
			//var aRows = oModelPageAut.getData();
			//var aRows = [propostaSelected];
			/* if (aRows.length === 0) {
				MessageBox.warning(this.getView().getModel("i18n").getResourceBundle().getText("MBTastoCompetenzaPageIDProposta"));
			} else {
				this._resetCheckbox("modelTreeTable", this);
				this._associaProps(propostaSelected);
			} */
		},
		
		_associaProps:function(prop){
			
			
			//set use batch
			//oModel.setUseBatch(false);
			var positions = this.getView().getModel("modelPosFinSelected").getData().IdPosfin;
			//var prop=props[0];
			
			this._recursiveUpdateModel(positions,prop);
			
			// var aPromCreate = [];
			// var sIdProposta=prop.IdProposta;
			// var sKeycodepr=prop.Keycodepr;
			// for(var i=0; i< positions.length; i++){
			// 	var sFipex=positions[i].Fipex;
			// 	var oEntry = {
			// 			Fipex: sFipex,
			// 			Idproposta: sIdProposta
			// 		};
			// 	var sPath = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";

			// 	//update proposta
			// 	var that = this;
			// 	var promCreate = new Promise(function(resolve, reject) {
			// 		oModel.update(sPath, oEntry, {
			// 			success: function(oData) {
			// 				var inEsito = "OK";
			// 				resolve(inEsito);
			// 			},
			// 			error: function(e) {
			// 				// errore creazione
			// 				var inEsito = JSON.parse(e.responseText).error.message.value;
			// 				reject(inEsito);
			// 			}
			// 		});
			// 	});
			// 	aPromCreate.push(promCreate);
			// }
			
			// Promise.allSettled(aPromCreate)
			// .then(function(res) {
			// 	MessageBox.success(that.getView().getModel("i18n").getResourceBundle().getText("MBCreateSuccessAssociaProposta"));
			// }).
			// catch(function(oError) {
			// 	MessageBox.error(oError);
			// });
			
			
			
			
			//oModel.setUseBatch(true);
			},
			
		
		_recursiveUpdateModel: function(positions,prop){
			var sRow = positions.shift();
            var aPromises = [];
            if(!!sRow) {
                aPromises.push(this.updateModel(sRow,prop));
            }
    
            Promise.all(aPromises)
            .then(function () {
                if(positions.length > 0) {
                    return this._recursiveUpdateModel(positions, prop);
                }
                MessageBox.success(this.getView().getModel("i18n").getResourceBundle().getText("MBCreateSuccessAssociaProposta"));
                this._setUseBatch(true);
            }.bind(this))
  
            .catch(function(e){
            	console.error(e);
            	this._setUseBatch(true);
            }.bind(this)
            );	
		},
		
		_setUseBatch:function(bUseBatch){
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			oModel.setUseBatch(bUseBatch);
		},
			
		updateModel: function(position,prop){
			var sIdProposta=prop.IdProposta;
			var sKeycodepr=prop.Key_Code;
			//var sKeycodepr=prop.Keycodepr;
			var oModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			var sFipex=position.Fipex;
			var oEntry = {
					Fipex: sFipex,
					Idproposta: sIdProposta
				};
			var sPath = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";
				
			oModel.update(sPath, oEntry);

		},
		
			
		
		_rowSelProps: function(event) {
			var that = this;
			/*var oTable = this.getView().byId("treeTableID");
			var aSelectedPath = [];
			var oItems = oTable.getRows();
			for (var j = 0; j < oItems.length; j++) {
				var bCheckboxStatus = oItems[j].getAggregation("cells")[0].getSelected();
				if (bCheckboxStatus) {
					if (oItems[j].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV")) {
						aSelectedPath.push(oItems[j].getBindingContext("ZSS4_COBI_PRSP_ESAMOD_SRV").getPath());
					}
				}
			}*/
			
			var aSelected = this._getSelectedItemsProps();

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
					var sEsitoControllo = aSelected[i].EsitoControlli;
					var sNickname = aSelected[i].Nickname;
					var sAut = aSelected[i].Autorizzazioni;
					
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
					
					var oData = {
						"IdPosfin": sIdPosFin,
						"IdProposta": sIdProposta,
						// "CodiFincode": sCodiFincode,
						// "Posfin": sPosFin,
						"CodiceIter": sCodIter,
						"Iter": sIter,
						"Tipo": sTipo,
						"EsitoControlli": sEsitoControllo,
						"Nickname": sNickname,
						"Aut": sAut,
						"Fikrs": sFikrs,
						"AnnoFipex": sAnnoFipex,
						"Fase": sFase,
						"Reale": sReale,
						"Versione": sVersione,
						"Eos": sEos,
						"CodiceAmmin": sCodiceAmmin,
						"Keycodepr": sKeycodepr,
						"Datbis": sDatbis,
						"Fipex": sFipex
					};
					aRows.push(oData);
					that.getView().getModel("modelPageAut").setData(aRows);
					/*that.getView().getModel("modelPageAut").setProperty("/Posfin", sPosFin);
					that.getView().getModel("modelPageAut").setProperty("/IdPosfin", sIdPosFin);
					that.getView().getModel("modelPageAut").setProperty("/IdProposta", sIdProposta);
					that.getView().getModel("modelPageAut").setProperty("/Iter", sIter);
					that.getView().getModel("modelPageAut").setProperty("/Tipo", sTipo);*/
				}
			}
		},
		
		 _getSelectedItemsProps: function() {
        	
            var aObject = Object.keys(this.getView().getModel("modelTreeTable").oData);
            var aData = this.getView().getModel("modelTreeTable").oData;
            var aSelected = [],
                aValResult = [];
            for (var i = 0; i < aObject.length; i++) {
                if (aData[aObject[i]].SELECTED === true) {
                    aSelected.push(aData[aObject[i]]);
                }
            }
           return aSelected;
        },
        onPressNavToCreaID: function(oEvt) {
			var oBtn = this.getView().byId("idBtnCreaProposta");
			var sID = oBtn.getId().split("--")[1].split("idBtn")[1];
			this.oRouter.navTo("GestisciID", {
				ID: sID
			});

			/*this.oRouter.navTo("MessagePage", {
				viewName: "CreaId"
			});*/
		}
	});

});