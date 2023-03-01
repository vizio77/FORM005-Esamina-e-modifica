sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	'sap/m/MessageToast',
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/ui/core/syncStyleClass",
	"sap/m/MessageBox"
], function(Controller, BaseController, MessageToast, Filter, FilterOperator, JSONModel, Fragment, syncStyleClass, MessageBox) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.EsitoControlli", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.EsitoControlli
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oDataModel = this.getModel();

			// this.oRouter.getRoute("EsitoControlli").attachMatched(this._onRouteMatched, this);
			// this.oRouter.getRoute("EsitoControlli").attachPatternMatched(this._onObjectMatched, this);
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		},
		
		/*_onObjectMatched: function(oEvent) {
			this.sRouterParameter = oEvent.getParameters().name;
		},*/
		
		//***************************NAVIGAZIONE*******************************+
		

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.EsitoControlli
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.EsitoControlli
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.EsitoControlli
		 */
		//	onExit: function() {
		//
		//	}

	});

});