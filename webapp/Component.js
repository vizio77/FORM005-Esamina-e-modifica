sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"zsap/com/r3/cobi/s4/esamodModSpesePosFin/model/models"
], function(UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("zsap.com.r3.cobi.s4.esamodModSpesePosFin.Component", {

		metadata: {
			manifest: "json",
			config: {
				fullWidth: true
			}
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
		init: function() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);


			// set the device model
			this.setModel(models.createDeviceModel(), "device");
			
			this.setModel(models.getTriennioModel(), "modelTriennio");
			
			this.setModel(models.getConoVisibilita(), "modelConoVisibilita");
			
			this.setModel(models.infoModel(),"infoModel");
			
			this.setModel(models.getGestTipologicheModel(),"gestTipologicheModel");
			
			this.setModel(models.getModelPageTab(), "modelPageTab");
			
			//POSIZIONE FINANZIARIA
			this.setModel(models.getPosFinSelected(), "modelPosFinSelected");
			this.setModel(models.getModelListaEstesaRidotta(), "modelListaEstesaRidotta");
			
			//DETTAGLIO CONTABILE PF
			this.setModel(models.getModelLinkPopUpPF(), "modelLinkPopUpPF");
			
			//NUOVA POSIZIONE FINANZIARIA
			this.setModel(models.getHeaderModelNuovaPosFin(), "modelNuovaPosFin");
			this.setModel(models.getModelTableCofogNPF(), "modelTableCofogNPF");
			this.setModel(models.getModelPreValConoNPF(), "modelPreValConoNPF");
			this.setModel(models.getModelNPF(), "modelNPF");
			this.setModel(models.getModelPFCapEsistente(), "modelPFCapEsistente");
			this.setModel(models.getModelCOFOGCapEsistente(), "modelCOFOGCapEsistente");
			this.setModel(models.getModelPropostaNPF(), "modelPropostaNPF");
			
			//RIMODULAZIONE VERTICALE
			this.setModel(models.getModelTableCofogTabID(), "modelTableCofogTab");
			this.setModel(models.getModelTableRV(), "modelTableRV");
			
			//TAB
			this.setModel(models.getModelTableFOFPTabID(), "modelTableFOFPTab");
			this.setModel(models.getModelTableFOFPTabID(), "modelPG80");
			this.setModel(models.getPreAut(), "modelPreAut");
			this.setModel(models.getModelStrAmm(), "modelStrAmm");
			this.setModel(models.getPreAutInfoPopUp(), "modelPreAutInfoPopUp");
			this.setModel(models.getModelPageAut(), "modelPageAut");
			this.setModel(models.getModelTimeLineWorkFlow(), "modelTimeLineWorkFlow");
			this.setModel(models.getModelAnagraficaPF(), "modelAnagraficaPf");
			this.setModel(models.getModelAnagraficaFOP(), "modelAnagraficaFOP");
			this.setModel(models.getModelAnagraficaCOFOG(), "modelAnagraficaCofog");
			this.setModel(models.getModelAnagraficaID(), "modelAnagraficaID");
			this.setModel(models.getModelCofogDeleted(), "modelCofogDeleted");
			this.setModel(models.getModelUserSearch(), "modelUserSearch");
			this.setModel(models.getModelTableValidatore(), "modelTableVal");
			this.setModel(models.getModelPopupReiscrizioni(), "modelTableReiscrizioni");
			
			this.setModel(models.getModelPosizioneFinanziaria(), "modelPosizioneFinanziaria");
			
			this.setModel(models.getModelDettaglioAnagraficoId(),  "modelDettaglioAnagraficoId" );
			this.setModel(models.getModelDettaglioContabile(), "modelDettaglioContabile");
			
			//GESTISCI ID + CREA PROPOSTA
			this.setModel(models.getModelChangeControlsStatus(), "modelChangeControlsStatus");
			this.setModel(models.getModelTableGestisciID(), "modelTableGestisciID");
			this.setModel(models.getModelGestisciProposta(), "modelGestisciProposta");
			
			this.setModel(models.getModelDefaultPosFinToPropostaNav(), "modelDefaultPosFinToPropostaNav");
			
			
			
			
			//DETTAGLIO ANAGRAFICO ID
			this.setModel(models.getModelTableAnagraficaID(), "modelTableAnagraficaID");
			
            this.getModel("ZSS4_COBI_PRSP_ESAMOD_SRV").aUrlParams[0] = "sap-language=IT";
			this.getModel().aUrlParams[0] = "sap-language=IT";

			//Mettere sempre alla fine dell'init per non inficiare la corretta visualizzazione dei model globali
			this.getRouter().initialize();
		},
		
		getContentDensityClass : function() {
			if (!this._sContentDensityClass) {
				if (!sap.ui.Device.support.touch) {
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		}
	});
});