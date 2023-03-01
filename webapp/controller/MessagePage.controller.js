sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./BaseController"
], function(Controller, BaseController) {
	"use strict";

	return BaseController.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.controller.MessagePage", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.MessagePage
		 */
		onInit: function() {
			this.oRouter = this.getRouter();
			this.oRouter.getRoute("MessagePage").attachPatternMatched(this._onObjectMatched, this);
		},

		_onObjectMatched: function(oEvent) {
			this.viewName = oEvent.getParameters().arguments.viewName;
			this._setDescription(this.viewName);
		},

		_onNavBack: function() {
			this.onNavBack();
		},

		_setDescription: function(viewName) {
			var sDescription;
			if (viewName === 'NuovaPosizioneFinanziaria') {
				sDescription = "La pagina permetterà la creazione di una nuova posizione finanziaria";
			}
			if (viewName === 'Anagrafica') {
				sDescription = "La pagina permetterà la modifica e l'aggiornamento dell'anagrafica di una posizione finanziaria.";
			}
			if (viewName === 'CreaRimodulazioneVerticale') {
				sDescription = "La pagina permetterà la creazione di una rimodulazione verticale";
			}
			if (viewName === 'GestisciID') {
				sDescription =
					"La pagina permetterà la gestione dell'id proposta, ovvero l'aggiunta e la rimozione di posizioni finanziarie all'id proposta selezionato.";
			}
			if (viewName === 'CreaId') {
				sDescription =
					"La pagina permetterà la creazione di un nuovo id proposta nonché l'associazione di posizioni finanziarie ad esso.";
			}
			if (viewName === 'AssociaID') {
				sDescription =
					"La pagina permetterà di associare un id proposta alle posizioni finanziarie selezionate nella schermata precedente.";
			}

			if (viewName === 'DettaglioAnagraficoID') {
				sDescription =
					"La pagina permetterà la visualizzazione del dettaglio anagrafico dell'id proposta selezionato.";
			}
			if (viewName === 'DettaglioContabileID') {
				sDescription =
					"La pagina permetterà la visualizzazione del dettaglio contabile dell'id proposta selezionato.";
			}
			if (viewName === 'DettaglioAnagrafico') {
				sDescription =
					"La pagina permetterà la visualizzazione del dettaglio anagrafico della posizione finanziaria selezionata.";
			}

			if (viewName === 'EsitoControlli') {
				sDescription =
					"La pagina permetterà la visualizzazione dell'esito dei controlli effettuati dal sistema fino al momento dell'apertura della pagina.";
			}
			if (viewName === 'AssociaAutorizzazione') {
				sDescription =
					"La popup permetterà, tramite scelta da lista di una autorizzazione esistente, di associarla alla posizione finanziaria scelta nella pagina precedente.";
			}
			
			if (viewName === 'UC') {
				sDescription =
					"Funzionalità in corso di sviluppo";
			}
			
			if (viewName === 'Aps') {
				sDescription =
					"Funzionalità in corso di definizione";
			}
			
			if (viewName === 'Ecobilancio') {
				sDescription =
					"Funzionalità in corso di definizione";
			}
			
			if (viewName === 'BilancioDiGenere') {
				sDescription =
					"Funzionalità in corso di definizione";
			}

			if (sDescription === '') {
				sDescription = 'Funzionalità in corso di definizione';
			}
			this.getView().byId("messagePageId").setDescription(sDescription);
		}

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.MessagePage
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.MessagePage
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf zsap.com.r3.cobi.s4.esamodModSpesePosFin.view.MessagePage
		 */
		//	onExit: function() {
		//
		//	}

	});

});