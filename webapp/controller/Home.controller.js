sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController",
	"sap/m/MessageBox"
], function(Controller, BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.Home", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.Home
		 */
			onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("appHome").attachMatched(this._onRouteMatched, this);
			},
			
			_onRouteMatched: function() {
				this._gestTipologiche();
			},
		
			
			onPressTile1: function() {
				
				this.oRouter.navTo("PosizioneFinanziaria", {
						View_From: "Home"
					});
				window.location.reload();
			},
			
			onPressTile2: function() {
				this.oRouter.navTo("IdProposta", {
						View_From: "Home"
					});
				window.location.reload();
			},
			
			onPressTile3: function() {
				this.oRouter.navTo("CreaRimodulazioneVerticale", {
						View_From: "Home"
					});
				window.location.reload();
					
				/*this.oRouter.navTo("MessagePage", {
				viewName: "CreaRimodulazioneVerticale"
				});*/
			}


		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.Home
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.Home
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.Home
		 */
		//	onExit: function() {
		//
		//	}

	});

});