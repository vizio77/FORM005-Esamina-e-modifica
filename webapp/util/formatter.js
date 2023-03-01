sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/format/NumberFormat"
], function(DateFormat, NumberFormat) {
	"use strict";
	return {

		//CONVERT TIMESTAMP IN DATE STRING AND FORMAT
		dateFormatter: function(sDataInput) {
			if (sDataInput !== "" && sDataInput !== null && sDataInput !== undefined) {
				var date = new Date(sDataInput.replace(
					/^(\d{4})(\d\d)(\d\d)(\d\d)(\d\d)(\d\d)$/, "$4:$5:$6 $2/$3/$1"
				));
				sDataInput = date.toString();
				sDataInput = DateFormat.getDateInstance({
					pattern: "dd/MM/yyyy HH:mm"
				}).format(new Date());
			}
			return sDataInput;
		},
		
		//Nuovo formatter per convertire Timestamp in format locale
		newDateFormatter: function (sDataInput){
			if (sDataInput !== "" && sDataInput !== null && sDataInput !== undefined) {
				var dateString = sDataInput;
				var date = new Date(dateString);
				var options = {
				    hour: '2-digit', 
				    minute: '2-digit' 
				};
				var newDateString = date.toLocaleDateString() + " " + date.toLocaleTimeString(undefined, options);
			}
			return newDateString;
		},

		numberFormatter: function(sVal) {
			var oFormatOptions = {
				maxFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			};
			if (sVal !== "" && sVal !== undefined) {
				var oFloatFormat = NumberFormat.getFloatInstance(oFormatOptions);
				oFloatFormat.format(sVal);
			}
			return sVal;
		},

		/*dataCreazione: function(data, ora) {
			if(data && ora) {
			var oDate = new Date(data);
			oDate.setTime(ora.ms);
			// oDate.toLocaleDateString().replaceAll('/', '.');
			return oDate;
			}*/

		dataCreazione: function(ora) {
			if (ora) {
				var oDate = new Date();
				oDate.setTime(ora.ms);
				// oDate.toLocaleDateString().replaceAll('/', '.');
				return (oDate.getHours() < 10 ? '0' : '') + oDate.getHours() + ':' + (oDate.getMinutes() < 10 ? '0' : '') + oDate.getMinutes() + ':' +
					(oDate.getSeconds() < 10 ? '0' : '') + oDate.getSeconds();
			}
		},

		//Toglie i punti alla pos fin
		formatterPosFin: function(sValue) {
			if (sValue === "" || sValue === null || sValue === undefined) {
				return "";
			} else {
				return sValue.replaceAll(".", "");
			}
		},

		formatterDatbis: function(sValue) {
			if (sValue === "" || sValue === null || sValue === undefined) {
				return "";
			} else {
				return sValue.replaceAll("-", "");
			}
		},

		formatterFlag: function(hierarchyLevel, property) {
			if (hierarchyLevel === "1") {
				if (property === "") {
					return "NO";
				} else {
					return "SI";
				}
			} else {
				return "";
			}
		},

		formatterIrap: function(hierarchyLevel, property) {
			if (hierarchyLevel === "0") {
				if (property === "2") {
					return "SI";
				} else {
					return "NO";
				}
			} else {
				return "";
			}
		},

		formatterNoiPA: function(hierarchyLevel, property) {
			if (hierarchyLevel === "0") {
				if (property === "1") {
					return "SI";
				} else {
					return "NO";
				}
			} else {
				return "";
			}
		},

		formatterTCR: function(hierarchyLevel, property) {
			if (hierarchyLevel === "0") {
				if (property !== "00") {
					return property;
				} else {
					return "";
				}
			} else {
				return "";
			}
		},

		formatterCOFOG: function(hierarchyLevel, property) {
			if (hierarchyLevel === "0") {
				if (property !== "0000") {
					return property;
				} else {
					return "";
				}
			} else {
				return "";
			}
		},
		
		formatterInt: function(sValue){
			return parseInt(sValue).toString();
		}

	};
});