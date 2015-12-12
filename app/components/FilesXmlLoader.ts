module app.components {
        'use strict';

        declare var X2JS;
        var x2js = new X2JS();

        export function LoadXmlFile(doc: { data: string }, file: IFile){
           var client = x2js.xml_str2json(doc.data).Client;
            console.log(client);
            _budgetFromFile(file,client);
            _assetsFromFile(file,client);
            _revenueFromFile(file,client);
            _developmentFromFile(file,client);
            _clientFromFile(file,client);
        }
        
        function _clientFromFile(file:IFile, client:any){
                file.client.city = client._City;
                file.client.comment = client._Comment;
                file.client.company = client._Company;
                file.client.eMail = client._EMail;
                file.client.mobilNumber = client._MobilNumber;        
                file.client.name = client._Name;
                file.client.prename = client._Prename;
                file.client.street = client._Street;
                file.client.telNumber = client._TelNumber;
                file.client.zipCode = client._ZipCode;
        }
        
        function _budgetElementsFromFile(elements: IHasTotalList<IBudget>, moe: any[]) {
                for (var k = 0; k < moe.length; k++) {
                        var me = moe[k];
                        elements.add()
                        elements[k].name = me._Name;
                        elements[k].frequency = Number(me._Frequency);
                        elements[k].value = Number(me._Value);
                }
        };

        function _budgetFromFile(file: IFile, client: any) {
                for (var i = 0; i < client.Budget.length; i++) {
                        var p = client.Budget[i].CostUnit[0];
                        var n = client.Budget[i].CostUnit[1];
                        file.budgets.add();
                        file.budgets[i].name = client.Budget[i]._Name;
                        for (var j = 0; j < p.CostType.length; j++) {
                                var ct = p.CostType[j];
                                file.budgets[i].positiv.add();
                                file.budgets[i].positiv[j].name = ct._Name;
                                _budgetElementsFromFile(file.budgets[i].positiv[j].elements, ct.MatterOfExpense);
                        }
                        for (var j = 0; j < n.CostType.length; j++) {
                                var ct = n.CostType[j];
                                file.budgets[i].negativ.add();
                                file.budgets[i].negativ[j].name = ct._Name;
                                _budgetElementsFromFile(file.budgets[i].negativ[j].elements, ct.MatterOfExpense);
                        }
                }
        }

        function _assetElementsFromFile(elements: IHasTotalList<IAsset>, moe: any[]) {
                for (var k = 0; k < moe.length; k++) {
                        var me = moe[k];
                        elements.add()
                        elements[k].name = me._Name;
                        elements[k].value = Number(me._Value);
                }
        };

        function _assetsFromFile(file: IFile, client: any) {

                var assets = client.Asset[0];
                var p = assets.AssetUnit[0];
                var n = assets.AssetUnit[1];

                for (var j = 0; j < p.AssetType.length; j++) {
                        var ct = p.AssetType[j];
                        file.assets.positiv.add();
                        file.assets.positiv[j].name = ct._Name;
                        _assetElementsFromFile(file.assets.positiv[j].elements, ct.AssetPoint);
                }
                for (var j = 0; j < n.AssetType.length; j++) {
                        var ct = n.AssetType[j];
                        file.assets.negativ.add();
                        file.assets.negativ[j].name = ct._Name;
                        _assetElementsFromFile(file.assets.negativ[j].elements, ct.AssetPoint);
                }
        }

        function _revenueElementsFromFile(elements: IHasTotalList<IRevenue>, moe: any[]) {
                for (var k = 0; k < moe.length; k++) {
                        var me = moe[k];
                        elements.add()
                        elements[k].name = me._Name;
                        elements[k].year = Number(me._Year);
                        elements[k].value = Number(me._Value);
                }
        };

        function _revenueFromFile(file: IFile, client: any) {

                var assets = client.Asset[1];
                var p = assets.AssetUnit[0];
                var n = assets.AssetUnit[1];

                for (var j = 0; j < p.AssetType.length; j++) {
                        var ct = p.AssetType[j];
                        file.revenue.positiv.add();
                        file.revenue.positiv[j].name = ct._Name;
                        _revenueElementsFromFile(file.revenue.positiv[j].elements, ct.AssetPoint);
                }
                for (var j = 0; j < n.AssetType.length; j++) {
                        var ct = n.AssetType[j];
                        file.revenue.negativ.add();
                        file.revenue.negativ[j].name = ct._Name;
                        _revenueElementsFromFile(file.revenue.negativ[j].elements, ct.AssetPoint);
                }
        }
        
        function _developmentFromFile(file: IFile, client:any){
                file.development.name = client.AssetDevelopment._Name;
                file.development.to = Number(client.AssetDevelopment._UpToYear);
                file.development.from = Number(new Date().getFullYear());
                var ap = client.AssetDevelopment.AssetDevelopmentPoint;
                for(var i = 0; i<ap.length;i++ ){
                        file.development.elements.add();
                        file.development.elements[i].budget = Number(ap[i]._ID);
                        file.development.elements[i].year = Number(ap[i]._Year);
                }
        }
}