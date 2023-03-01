sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageBox",
	"../util/formatter"
], function(Controller, BaseController, Filter, FilterOperator, MessageBox, formatter) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.DettaglioAnagraficoID", {
		formatter: formatter,
		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioAnagraficoID
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this._oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

			this.oRouter.getRoute("DettaglioAnagraficoID").attachMatched(this._onRouteMatched, this);

			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},

		_getTableData: function() {
			var oGlobalModel = this.getView().getModel("ZSS4_COBI_PRSP_ESAMOD_SRV");
			// var sIdProposta = this.getView().byId("idTextIDPropostaSnap").getText();
			
			
			var oModelPosFin = this.getOwnerComponent().getModel("modelDettaglioAnagraficoId");
			//var sIdProp = oModelPosFin.getData()[0].IdProposta;
			var sKeycodepr = oModelPosFin.getData()[0].Key_Code;
			
			
			var aFilters;
				aFilters = [ // <-- Should be an array, not a Filter instance!
					new Filter({ // required from "sap/ui/model/Filter"
						path: "Idproposta",
						operator: FilterOperator.EQ, // required from "sap/ui/model/FilterOperator"
						value1: sKeycodepr
					})
				];
			// var sPathID = "/PropostaSet(Keycodepr='" + sKeycodepr + "')";
			var that = this;
			oGlobalModel.read("/PosFinPropostaSet", {
				filters: aFilters,
				success: function(oData, oResponse) {
					that.getView().getModel("modelTableAnagraficaID").setData(oData.results);
				},
				error: function(oError) {
					MessageBox.error(oError);
				}
			});
		},
		
		_onRouteMatched: function() {
			this._getTableData();
		}
		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioAnagraficoID
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioAnagraficoID
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.DettaglioAnagraficoID
		 */
		//	onExit: function() {
		//
		//	}

	});

});