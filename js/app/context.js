var ApplicationContext = (function(){
	var account = {};
	var assets = [];

	function getAssetsList() {
		return Object.keys(assets).map(function (key) {
			return assets[key];
		});
	}

	function putAsset(issueTransaction) {
		var currency = Currency.create({
			id: issueTransaction.assetId,
			displayName: issueTransaction.name,
			precision: issueTransaction.decimals
		});
		var asset = {
			currency: currency,
			description: issueTransaction.description,
			timestamp: issueTransaction.timestamp,
			sender: issueTransaction.sender,
			totalTokens: Money.fromCoins(issueTransaction.quantity, currency)
		};
		var balance;

		if (angular.isDefined(assets[currency.id])) {
			balance = assets[currency.id].balance;
		} else {
			balance = new Money(0, currency);
		}

		asset.balance = balance;

		assets[currency.id] = asset;
	}

	function updateAsset(assetId, balance, reissuable, totalTokens) {
		var asset = assets[assetId];
		if (asset) {
			asset.balance = Money.fromCoins(balance, asset.currency);
			asset.totalTokens = Money.fromCoins(totalTokens, asset.currency);
			asset.reissuable = reissuable;
		}
	}

	return {
		account: account,
		cache: {
			assets: assets,
			getAssetsList: getAssetsList,
			putAsset: putAsset,
			updateAsset: updateAsset
		}
	}
})();
