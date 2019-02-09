/******************************************************************************
 * Copyright © 2016 The Waves Developers.                                     *
 *                                                                            *
 * See the LICENSE files at                                                   *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE      *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function() {
	'use strict';

	angular
		.module('app.shared', []);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.constant('constants.tooltip', {
			contentAsHTML: false,
			delay: 1000
		});
})();

(function () {
	'use strict';

	// TODO : move to the future `appState` service.

	var predefinedAssets = [
		Currency.LBR
	];

	angular
		.module('app.shared')
		.factory('assetStoreFactory', [
			'$q', 'apiService', 'matcherApiService', function ($q, apiService, matcherApiService) {
				function AssetStore(address) {
					this.address = address;
					this.balances = {};
					this.promise = $q.when();
				}

				AssetStore.prototype._getBalances = function () {
					var self = this;
					this.promise = this.promise
						.then(function () {
							return apiService.assets.balance(self.address);
						})
						.then(function (response) {
							response.balances.forEach(function (asset) {
								console.log('AssetStore.prototype._getBalances', asset.issueTransaction.name, asset.issueTransaction.name);
								self.balances[asset.assetId] = Money.fromCoins(asset.balance, Currency.create({
									id: asset.assetId,
									displayName: asset.issueTransaction.name,
									shortName: asset.issueTransaction.name,
									precision: asset.issueTransaction.decimals
								}));
							});
						})
						.then(apiService.address.balance.bind(apiService.address, self.address))
						.then(function (response) {
							self.balances[Currency.MIR.id] = Money.fromCoins(response.balance, Currency.MIR);
						});
				};

				AssetStore.prototype._getPredefined = function () {
					var self = this;
					this.promise = this.promise
						.then(function () {
							predefinedAssets.forEach(function (asset) {
								if (!self.balances[asset.id]) {
									self.balances[asset.id] = Money.fromCoins(0, asset);
								}
							});
						});
				};

				AssetStore.prototype._getTradedAssets = function () {
					var self = this;
					this.promise = this.promise
						.then(matcherApiService.loadAllMarkets)
						.then(function (markets) {
							markets.forEach(function (market) {
								var amountAsset = market.amountAsset;
								if (!self.balances[amountAsset.id]) {
									self.balances[amountAsset.id] = Money.fromCoins(0, amountAsset);
								}

								var priceAsset = market.priceAsset;
								if (!self.balances[priceAsset.id]) {
									self.balances[priceAsset.id] = Money.fromCoins(0, priceAsset);
								}
							});
						});
				};

				AssetStore.prototype.getAll = function () {
					var self = this;

					self._getBalances();
					self._getPredefined();
					self._getTradedAssets();
					self.promise = self.promise.then(function () {
						return Object.keys(self.balances).map(function (key) {
							return self.balances[key];
						});
					});

					return self.promise;
				};

				AssetStore.prototype.syncGet = function (id) {
					return this.balances[id];
				};

				AssetStore.prototype.syncGetAsset = function (id) {
					var item = this.syncGet(id);
					if (item && item.currency) {
						return item.currency;
					}
				};

				AssetStore.prototype.syncGetBalance = function (id) {
					var item = this.syncGet(id);
					if (item && item.amount) {
						return item.amount.toNumber();
					} else {
						return 0;
					}
				};

				var stores = {};

				return {
					createStore: function (address) {
						if (!stores[address]) {
							stores[address] = new AssetStore(address);
						}
						return stores[address];
					}
				};
			}
		]);
})();

(function () {
	'use strict';

	var allowedParams = ['amount', 'label', 'message'];

	angular
		.module('app.shared')
		.service('lbrUriService', [function () {

			this.generate = function (address, params) {

				if (!address || typeof address !== 'string') {
					return '';
				}

				var uri = 'lbr:' + address,
					keys = Object.keys(params || {});

				if (keys.length) {
					uri += keys.reduce(function (queryString, key) {
						if (allowedParams.indexOf(key) > -1) {
							return queryString + key + '=' + params[key] + '&';
						} else {
							return queryString;
						}
					}, '?');
					uri = uri.slice(0, -1); // Remove trailing '&'
				}

				return uri;

			};

			// this.validate = function (uri) {};

		}]);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.service('dialogService', ['$document', function ($document) {
			this.open = function (elementAccessor, options) {
				angular.element(elementAccessor).modal(options);
			};

			this.openNonCloseable = function (elementAccessor) {
				this.open(elementAccessor, {
					escapeClose: false,
					clickClose: false,
					showClose: false
				});
			};

			this.close = function () {
				angular.element.modal.close();
			};

			/**
				jquery.modal pollutes document body with copied modal dialog divs
				This creates several items with the same "id" and dialogService opens
				dialogs with outdated data
			 */
			this.cleanup = function () {
				var result = $document.find('body > div.modal.recyclable');
				_.forEach(result, function (divNode) {
					divNode.remove();
				});
			};
		}]);
})();

(function () {
	'use strict';

	var prefix = 'Mir';

	angular
		.module('app.shared')
		.service('documentTitleService', [function () {
			this.set = function (title) {
				document.title = prefix + (title ? ' | ' + title : '');
			};
		}]);
})();

(function () {
	'use strict';

	var DELAY = 500;

	function debounce(notifier) {
		var lastCalls = {};
		return function (message) {
			var now = Date.now();
			lastCalls[message] = lastCalls[message] || 0;
			if (lastCalls[message] + DELAY < now) {
				lastCalls[message] = now;
				notifier(message);
			}
		};
	}

	angular
		.module('app.shared')
		.service('notificationService', [function () {
			this.notice = debounce(function (message) {
				angular.element.growl.notice({message : message});
			});

			this.error = debounce(function (message) {
				angular.element.growl.error({message : message});
			});

			this.warning = debounce(function (message) {
				angular.element.growl.warning({message : message});
			});
		}]);
})();

(function () {
	'use strict';

	var spamAssets = {
	};
	var hasBeenUpdated = false; // set this to false to update asset list from github
	var isPendingUpdate = false;
	var SPAM_ASSET_LIST_URL = 'https://raw.githubusercontent.com/wavesplatform/waves-community/' +
		'master/Scam%20tokens%20according%20to%20the%20opinion%20of%20Waves%20Community.csv';

	angular
		.module('app.shared')
		.service('spamAssetService', ['$http', function ($http) {
			var self = this;

			this.parseAssetList = function (communityContent) {
				var lines = communityContent.split('\n');
				var result = {};
				_.forEach(lines, function (line) {
					var parts = line.split(',');
					if (parts.length > 0) {
						var assetId = parts[0].trim();
						if (assetId) {
							result[assetId] = true;
						}
					}
				});

				return result;
			};

			this.isSpam = function (assetId) {
				if (!assetId) {
					return false;
				}

				var result = !!spamAssets[assetId];

				if (!hasBeenUpdated && !isPendingUpdate) {
					isPendingUpdate = true;
					$http.get(SPAM_ASSET_LIST_URL).then(function (response) {
						spamAssets = self.parseAssetList(response.data);
					}).catch(function () {
						// do nothing
					}).then(function () {
						// if we failed to update spam asset list, there is no need to try again
						isPendingUpdate = false;
						hasBeenUpdated = true;
					});
				}

				return result;
			};
		}]);
})();

(function () {
	'use strict';

	var DEFAULT_ASSET_ID_FIELD_NAME = 'assetId';

	function AntiSpamFilter(spamAssetService) {
		return function filterInput(input, fieldName) {
			if (!input) {
				return [];
			}

			fieldName = fieldName || DEFAULT_ASSET_ID_FIELD_NAME;

			return _.filter(input, function (tx) {
				return !spamAssetService.isSpam(tx[fieldName]);
			});
		};
	}

	AntiSpamFilter.$inject = ['spamAssetService'];

	angular
		.module('app.shared')
		.filter('antiSpam', AntiSpamFilter);
})();

(function () {
	'use strict';

	function PadderFilter() {
		return function filterInput(input, maxLength) {
			var spaces = '',
				i = input.length;

			while (i++ < maxLength) {
				spaces +=  '&nbsp;';
			}

			return spaces + input;
		};
	}

	angular
		.module('app.shared')
		.filter('padder', PadderFilter);
})();

(function () {
	'use strict';

	function PageController($attrs, documentTitleService) {
		// documentTitleService.set($attrs.pageTitle); // TODO : uncomment this when all pages are using that component.
	}

	PageController.$inject = ['$attrs', 'documentTitleService'];

	angular
		.module('app.shared')
		.component('wavesPage', {
			controller: PageController,
			bindings: {
				pageTitle: '@'
			}
		});
})();

(function () {
	'use strict';

	var BACKGROUND = '#fff',
		FOREGROUND = '#000',
		SIZE = 150;

	function QrCodeController($element) {

		var ctrl = this,
			canvas = $element.children('canvas'),
			qr = new QRious({
				element: canvas.get(0),
				size: ctrl.size || SIZE
			});

		ctrl.setCode = function () {
			ctrl.removeCode();
			if (ctrl.value) {
				qr.background = ctrl.background || BACKGROUND;
				qr.foreqround = ctrl.foreground || FOREGROUND;
				qr.size = ctrl.size || SIZE;
				qr.value = ctrl.value;
				canvas.removeClass('hidden');
			}
		};

		ctrl.removeCode = function () {
			canvas.addClass('hidden');
		};

		ctrl.$onInit = ctrl.setCode.bind(ctrl);

		ctrl.$onChanges = function (changes) {
			if (changes.value) {
				ctrl.setCode();
			}
		};

	}

	angular
		.module('app.shared')
		.component('wavesQrCode', {
			controller: QrCodeController,
			bindings: {
				size: '<',
				background: '<',
				foreground: '<',
				value: '<'
			},
			template: '<canvas class="hidden"></canvas>'
		});
})();

(function () {
	'use strict';

	function ScrollboxController() {}

	angular
		.module('app.shared')
		.component('wavesScrollbox', {
			controller: ScrollboxController,
			transclude: true,
			template: '<div ng-transclude></div>'
		});
})();

(function () {
	'use strict';

	function WavesDialogController($scope, dialogService) {
		var defaults = {
			isError: false,
			cancelButtonVisible: true,
			closeable: true,
			showButtons: true,
			okButtonCaption: 'OK',
			okButtonEnabled: true,
			cancelButtonCaption: 'CANCEL'
		};

		_.defaults($scope, defaults);

		var imageSuffix = $scope.isError ? '-danger' : '';
		$scope.image = 'modal-header' + imageSuffix;
		if (!$scope.closeable) {
			$scope.image = 'modal-header-round';
		}

		$scope.image += '.svg';

		$scope.onOk = function () {
			var shouldClose;

			if ($scope.dialogOk) {
				shouldClose = $scope.dialogOk();
			}

			if (angular.isUndefined(shouldClose) || shouldClose !== false) {
				dialogService.close();
			}
		};

		$scope.onCancel = function () {
			if ($scope.dialogCancel) {
				$scope.dialogCancel();
			}

			dialogService.close();
		};
	}

	function WavesDialogLink(scope, element) {
		element.addClass('basePop');

		if (!scope.global) {
			element.addClass('recyclable');
		}
	}

	angular
		.module('app.shared')
		.directive('wavesDialog', function WavesDialogDirective() {

			return {
				restrict: 'A',
				controller: ['$scope', 'dialogService', WavesDialogController],
				transclude: true,
				scope: {
					closeable: '=?',
					cancelButtonVisible: '=?',
					showButtons: '=?',
					tooltip: '=?',
					dialogOk: '&onDialogOk',
					dialogCancel: '&onDialogCancel',
					okButtonCaption: '@',
					okButtonEnabled: '=?',
					cancelButtonCaption: '@',
					isError: '=?',
					global: '=?',
					noSupportLink: '=?'
				},
				link: WavesDialogLink,
				templateUrl: 'shared/dialog.directive'
			};
		});
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.directive('focusMe', ['$timeout', function WavesFocusDirective($timeout) {
			return {
				restrict: 'A',
				link: function (scope, element, attributes) {
					scope.$watch(attributes.focusMe, function (newValue) {
						$timeout(function () {
							return newValue && element[0].focus();
						});
					}, true);
				}
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.directive('tooltipster', ['constants.tooltip', function WavesTooltipsterDirective(constants) {

			return {
				restrict: 'A',
				link: function (scope, element, attributes) {
					var text;
					if (angular.isDefined(attributes.title))
						text = attributes.title;
					else if (angular.isDefined(attributes.tooltipTitle))
						text = attributes.tooltipTitle;

					if (angular.isUndefined(text))
						throw new Error('Tooltip text is undefined. ' +
							'Tooltipster directive is unnecessary for element: ' + element);

					var tooltipOptions = _.clone(constants);
					if (angular.isDefined(attributes.tooltipTheme))
						tooltipOptions.theme = attributes.tooltipTheme;
					tooltipOptions.content = text;

					if (angular.isDefined(attributes.tooltipHtml) || attributes.tooltipHtml === true)
						tooltipOptions.contentAsHTML = true;

					element.tooltipster(tooltipOptions);

					scope.$on('$destroy', function DestroyTooltip() {
						element.tooltipster('destroy');
					});
				}
			};
		}]);
})();

(function () {
	'use strict';

	function WavesTransactionLoadingService($q, constants, apiService) {
		var self = this;

		// returns promise that loads and merges unconfirmed and confirmed transactions
		this.loadTransactions = function (account, limit) {
			var unconfirmed;
			return apiService.transactions.unconfirmed()
				.then(function (response) {
					unconfirmed = response;

					return apiService.transactions.list(account.address, limit);
				})
				.then(function (response) {
					// FIXME : redo this when the API is fixed.
					if (response[0] instanceof Array) {
						response = response[0];
					}

					return self.mergeTransactions(account, unconfirmed, response);
				});
		};

		this.refreshAssetCache = function (cache, transactions) {
			var sequence = $q.resolve();
			_.forEach(transactions, function (tx) {
				var assetId;
				if (tx.assetId) {
					assetId = tx.assetId;
				} else if (tx.order1 && tx.order1.assetPair.amountAsset) {
					assetId = tx.order1.assetPair.amountAsset;
				}
				var feeAssetId;
				if (tx.feeAsset) {
					feeAssetId = tx.feeAsset;
				}

				var cached;

				if (assetId) {
					cached = cache.assets[assetId];
					if (!cached) {
						sequence = sequence
							.then(function () {
								return apiService.transactions.info(assetId);
							})
							.then(function (response) {
								cache.putAsset(response);
							});
					}
				}

				if (feeAssetId) {
					cached = cache.assets[feeAssetId];
					if (!cached) {
						sequence = sequence
							.then(function () {
								return apiService.transactions.info(feeAssetId);
							})
							.then(function (response) {
								cache.putAsset(response);
							});
					}
				}
			});

			return sequence;
		};

		// TODO : refactor with a map.
		this.mergeTransactions = function (account, unconfirmed, confirmed) {
			var rawAddress = account.address;
			unconfirmed = _.filter(unconfirmed, function (transaction) {
				if (transaction.type === constants.EXCHANGE_TRANSACTION_TYPE) {
					return transaction.order1.senderPublicKey === account.keyPair.public ||
						transaction.order2.senderPublicKey === account.keyPair.public ||
						transaction.sender === rawAddress;
				} else {
					return (transaction.sender === rawAddress || transaction.recipient === rawAddress);
				}
			});
			var unconfirmedSignatures = _.map(unconfirmed, function (transaction) {
				return transaction.signature;
			});
			confirmed = _.filter(confirmed, function (transaction) {
				return unconfirmedSignatures.indexOf(transaction.signature) === -1;
			});
			unconfirmed = _.map(unconfirmed, function (transaction) {
				transaction.unconfirmed = true;

				return transaction;
			});

			return _.union(unconfirmed, confirmed);
		};
	}

	WavesTransactionLoadingService.$inject = ['$q', 'constants.transactions', 'apiService'];

	angular
		.module('app.shared')
		.service('transactionLoadingService', WavesTransactionLoadingService);
})();

(function () {
	'use strict';

	function TransactionFilter(constants, applicationContext, formattingService) {
		var TRANSACTION_SPEC = {};
		TRANSACTION_SPEC[constants.PAYMENT_TRANSACTION_TYPE] = {
			type: 'Payment',
			processor: processPaymentTransaction
		};
		TRANSACTION_SPEC[constants.ASSET_ISSUE_TRANSACTION_TYPE] = {
			type: 'Asset Issue',
			processor: processAssetIssueTransaction
		};
		TRANSACTION_SPEC[constants.ASSET_TRANSFER_TRANSACTION_TYPE] = {
			type: 'Transfer',
			processor: processAssetTransferTransaction
		};
		TRANSACTION_SPEC[constants.ASSET_REISSUE_TRANSACTION_TYPE] = {
			type: 'Asset Reissue',
			processor: processAssetReissueTransaction
		};
		TRANSACTION_SPEC[constants.START_LEASING_TRANSACTION_TYPE] = {
			type: 'Start Leasing',
			processor: processStartLeasingTransaction
		};
		TRANSACTION_SPEC[constants.CANCEL_LEASING_TRANSACTION_TYPE] = {
			type: 'Cancel Leasing',
			processor: processCancelLeasingTransaction
		};
		TRANSACTION_SPEC[constants.CREATE_ALIAS_TRANSACTION_TYPE] = {
			type: 'Create Alias',
			processor: processCreateAliasTransaction
		};
		TRANSACTION_SPEC[constants.EXCHANGE_TRANSACTION_TYPE] = {
			type: '',
			processor: processExchangeTransaction
		};
		TRANSACTION_SPEC[constants.MASS_PAYMENT_TRANSACTION_TYPE] = {
			type: 'Mass Payment',
			processor: processMassPaymentTransaction
		};

		function buildTransactionType (number) {
			var spec = TRANSACTION_SPEC[number];

			return spec ? spec.type : '';
		}

		function transformAddress(rawAddress) {
			var result = angular.isDefined(rawAddress) ? rawAddress : 'n/a';

			if (result === applicationContext.account.address) {
				result = 'You';
			}

			return result;
		}

		function processTransaction(transaction) {
			var spec = TRANSACTION_SPEC[transaction.type];
			if (angular.isUndefined(spec) || angular.isUndefined(spec.processor)) {
				return;
			}

			spec.processor(transaction);
		}

		function processPaymentTransaction(transaction) {
			transaction.formatted.amount = Money.fromCoins(transaction.amount, Currency.MIR).formatAmount();
			transaction.formatted.asset = Currency.MIR.displayName;
		}

		function processAssetIssueTransaction(transaction) {
			console.log('processAssetIssueTransaction', transaction);
			var asset = Currency.create({
				id: transaction.id,
				displayName: transaction.name,
				precision: transaction.decimals
			});
			transaction.formatted.amount = Money.fromCoins(transaction.quantity, asset).formatAmount();
			transaction.formatted.asset = asset.displayName;
		}

		function processCreateAliasTransaction(transaction) {
			transaction.formatted.asset = Currency.MIR.displayName;
		}

		function processAssetTransferTransaction(transaction) {
			var currency;
			if (transaction.assetId) {
				var asset = applicationContext.cache.assets[transaction.assetId];
				if (asset) {
					currency = asset.currency;
				}
			} else {
				currency = Currency.MIR;
			}

			if (!currency) {
				return;
			}

			transaction.formatted.amount = Money.fromCoins(transaction.amount, currency).formatAmount();
			transaction.formatted.asset = currency.displayName;
		}

		function processAssetReissueTransaction(transaction) {
			var asset = applicationContext.cache.assets[transaction.assetId];
			if (angular.isUndefined(asset)) {
				return;
			}

			transaction.formatted.amount = Money.fromCoins(transaction.quantity, asset.currency).formatAmount();
			transaction.formatted.asset = asset.currency.displayName;
		}

		function processStartLeasingTransaction(transaction) {
			transaction.formatted.amount = Money.fromCoins(transaction.amount, Currency.MIR).formatAmount();
			transaction.formatted.asset = Currency.MIR.displayName;
		}

		function processCancelLeasingTransaction(transaction) {
			transaction.formatted.asset = Currency.MIR.displayName;
		}

		function processMassPaymentTransaction(transaction) {
			var currency = Currency.MIR;
			var assetId = transaction.assetId;
			if (assetId) {
				var asset = applicationContext.cache.assets[assetId];
				if (asset) {
					currency = asset.currency;
				}
			}

			transaction.formatted.asset = currency.displayName;
			transaction.formatted.amount = Money.fromCoins(transaction.totalAmount, currency).formatAmount();
		}

		function processExchangeTransaction(transaction) {
			var type = 'Exchange';

			var buyOrder = transaction.order1;
			var assetId = buyOrder.assetPair.amountAsset;
			var totalFee = 0;
			if (buyOrder.senderPublicKey === applicationContext.account.keyPair.public) {
				type = type + ' ' + 'Buy';
				totalFee += transaction.buyMatcherFee;
			}

			var sellOrder = transaction.order2;
			if (sellOrder.senderPublicKey === applicationContext.account.keyPair.public) {
				type = type + ' ' + 'Sell';
				totalFee += transaction.sellMatcherFee;
			}

			transaction.formatted.type = type;
			transaction.formatted.fee = Money.fromCoins(totalFee, Currency.MIR).formatAmount(true);

			var currency;
			if (assetId) {
				var asset = applicationContext.cache.assets[assetId];
				if (asset) {
					currency = asset.currency;
				}
			} else {
				currency = Currency.MIR;
			}

			if (currency) {
				transaction.formatted.asset = currency.displayName;
				transaction.formatted.amount = Money.fromCoins(transaction.amount, currency).formatAmount();
			}
		}

		function formatFee(transaction) {
			var currency = Currency.MIR;
			var assetId = transaction.feeAsset;
			if (assetId) {
				var asset = applicationContext.cache.assets[assetId];
				if (asset) {
					currency = asset.currency;
				}
			}

			return Money.fromCoins(transaction.fee, currency).formatAmount(true);
		}

		function getFeeAsset(transaction) {
			var currency = Currency.MIR;
			var assetId = transaction.feeAsset;
			if (assetId) {
				var asset = applicationContext.cache.assets[assetId];
				if (asset) {
					currency = asset.currency;
				}
			}

			return currency;
		}

		function formatTransaction(transaction) {
			// in the future currency should be a part of transaction itself
			var currentAddress = applicationContext.account.address;
			var type = transaction.sender === currentAddress ? 'Outgoing' : 'Incoming';

			transaction.formatted = {
				type: type + ' ' + buildTransactionType(transaction.type),
				datetime: formattingService.formatTimestamp(transaction.timestamp),
				isOutgoing: transaction.sender === currentAddress,
				sender: transformAddress(transaction.sender),
				recipient: transformAddress(transaction.recipient),
				amount: 'N/A',
				fee: formatFee(transaction),
				feeAsset: getFeeAsset(transaction),
				asset: 'Loading'
			};

			processTransaction(transaction);

			return transaction;
		}

		return function filterInput(input) {
			return _.map(input, formatTransaction);
		};
	}

	TransactionFilter.$inject = ['constants.transactions', 'applicationContext', 'formattingService'];

	angular
		.module('app.shared')
		.filter('transaction', TransactionFilter);
})();

(function () {
	'use strict';

	var DEFAULT_STRIP_ZEROES = true;
	var DEFAULT_USE_THOUSANDS_SEPARATOR = true;

	function MoneyShortFilter() {
		return function filterInput(input, stripZeroes, useThousandsSeparator) {
			if (!input || !input.formatAmount) {
				return '';
			}

			if (angular.isUndefined(stripZeroes)) {
				stripZeroes = DEFAULT_STRIP_ZEROES;
			}

			if (angular.isUndefined(useThousandsSeparator)) {
				useThousandsSeparator = DEFAULT_USE_THOUSANDS_SEPARATOR;
			}

			return input.formatAmount(stripZeroes, useThousandsSeparator);
		};
	}

	angular
		.module('app.shared')
		.filter('moneyShort', MoneyShortFilter);
})();

(function () {
	'use strict';

	var DEFAULT_STRIP_ZEROES = false;
	var DEFAULT_USE_THOUSANDS_SEPARATOR = true;

	function MoneyLongFilter() {
		return function filterInput(input, stripZeroes, useThousandsSeparator) {
			if (!input || !input.formatAmount) {
				return '';
			}

			if (angular.isUndefined(stripZeroes)) {
				stripZeroes = DEFAULT_STRIP_ZEROES;
			}

			if (angular.isUndefined(useThousandsSeparator)) {
				useThousandsSeparator = DEFAULT_USE_THOUSANDS_SEPARATOR;
			}

			var result = input.formatAmount(stripZeroes, useThousandsSeparator);
			var currency = input.currency.shortName ? input.currency.shortName : input.currency.displayName;

			return result + ' ' + currency;
		};
	}

	angular
		.module('app.shared')
		.filter('moneyLong', MoneyLongFilter);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.factory('autocomplete.fees', function AutocompleteFeesFactory() {
			var result = {
				fees: [
					{
						amount: 0.001,
						displayText: '0.001 WAVE (Economic)'
					},
					{
						amount: 0.0015,
						displayText: '0.0015 WAVE (Standard)'
					},
					{
						amount: 0.002,
						displayText: '0.002 WAVE (Premium)'
					}
				],
				selectedFee: undefined,
				searchText: undefined
			};

			result.getFeeAmount = function() {
				return result.selectedFee ?
					result.selectedFee.amount :
					result.searchText;
			};

			result.defaultFee = function (feeAmount) {
				var feeIndex = 0;

				if (angular.isNumber(feeAmount)) {
					var index = _.findIndex(result.fees, function (fee) {
						return fee.amount === feeAmount;
					});

					if (index >= 0) {
						feeIndex = index;
					}
				}

				result.selectedFee = result.fees[feeIndex];
			};

			result.querySearch = function (searchText) {
				if (!searchText) {
					return result.fees;
				}

				return _.filter(result.fees, function (item) {
					return item.amount.toString().indexOf(searchText) !== -1;
				});
			};

			return result;
		})
		.factory('autocomplete.assets', function AutocompleteAssetsFactory() {
			function createAutocomplete() {
				var result = {
					assets: [],
					selectedAsset: undefined,
					searchText: undefined
				};

				result.querySearch = function (searchText) {
					if (!searchText) {
						return result.assets.slice(0, 10);
					}

					var searchTextLC = searchText.toLowerCase(),
						list = [],
						ids = {};

					// Adding assets which match by name.
					list = list.concat(result.assets.filter(function (asset) {
						ids[asset.id] = asset.displayName.toLowerCase().indexOf(searchTextLC) > -1;
						return ids[asset.id];
					}));

					// Adding assets which match by ID.
					list = list.concat(result.assets.filter(function (asset) {
						if (ids[asset.id] === true) {
							return false;
						} else {
							ids[asset.id] = asset.id.indexOf(searchText) > -1;
							return ids[asset.id];
						}
					}));

					return list;
				};

				return result;
			}

			return {
				create: function () {
					return createAutocomplete();
				}
			};
		});
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.factory('transactionBroadcast', ['notificationService', function (notificationService) {
			function Instance(method, successCallback) {
				var self = this;
				var transaction;

				this.pending = false;
				this.setTransaction = function (value) {
					transaction = value;
				};

				this.broadcast = function () {
					// checking if transaction was saved
					if (angular.isUndefined(transaction)) {
						return;
					}

					// prevent method execution when there is a pending request
					if (self.pending) {
						return;
					}

					// start pending request
					self.pending = true;

					method(transaction).then(function (response) {
						successCallback(transaction, response);
					}, function (response) {
						if (response.data) {
							notificationService.error('Error:' + response.data.error + ' - ' + response.data.message);
						} else {
							notificationService.error('Request failed. Status: ' + response.status + ' - ' +
								response.statusText);
						}
					}).finally(function () {
						self.pending = false;
						transaction = undefined;
					});
				};
			}

			return {
				instance: Instance
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.directive('decimalInputRestrictor', [function WavesDecimalInputRestrictorDirective() {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function (scope, element, attributes, ngModelController) {
					var pattern = /[^0-9.]+/g;

					function fromUser (text) {
						if (!text)
							return text;

						var transformedInput = text.replace(pattern, '');
						if (transformedInput !== text) {
							ngModelController.$setViewValue(transformedInput);
							ngModelController.$render();
						}

						return transformedInput;
					}

					ngModelController.$parsers.push(fromUser);
				}
			};
		}]);
})();

(function () {
	'use strict';

	angular
		.module('app.shared')
		.directive('integerInputRestrictor', [function WavesIntegerInputRestrictorDirective() {
			return {
				restrict: 'A',
				require: 'ngModel',
				link: function (scope, element, attributes, ngModelController) {
					var pattern = /[^0-9]+/g;

					function fromUser (text) {
						if (!text)
							return text;

						var transformedInput = text.replace(pattern, '');
						if (transformedInput !== text) {
							ngModelController.$setViewValue(transformedInput);
							ngModelController.$render();
						}

						return transformedInput;
					}

					ngModelController.$parsers.push(fromUser);
				}
			};
		}]);
})();

(function () {
	'use strict';

	var url = 'mir.one/client';

	function SupportLinkController() {}

	angular
		.module('app.shared')
		.component('wavesSupportLink', {
			controller: SupportLinkController,
			template: '<a href="http://' + url + '" target="_blank">' + url + '</a>'
		});
})();

(function () {
	'use strict';

	var ADDRESS_STUB = 'n/a';

	function TransactionMenuController($scope, constants, events, notificationService) {
		var ctrl = this;

		ctrl.idCopied = idCopied;
		ctrl.dataCopied = dataCopied;
		ctrl.fullTransactionData = fullTransactionData;
		ctrl.hasRecipient = hasRecipient;
		ctrl.addressCopied = addressCopied;
		ctrl.isLeasing = isLeasing;
		ctrl.cancelLeasing = cancelLeasing;

		function addressCopied () {
			return notificationService.notice('Address has been copied');
		}

		function idCopied () {
			notificationService.notice('Transaction ID has been copied');
		}

		function dataCopied () {
			notificationService.notice('Full transaction data have been copied');
		}

		function hasRecipient () {
			return !!ctrl.transaction.recipient;
		}

		function isLeasing () {
			return ctrl.transaction.type === constants.START_LEASING_TRANSACTION_TYPE;
		}

		function cancelLeasing () {
			$scope.$emit(events.LEASING_CANCEL, {
				startLeasingTransaction: ctrl.transaction
			});
		}

		function fullTransactionData () {
			var recipient = hasRecipient() ? ctrl.transaction.recipient : ADDRESS_STUB;
			var attachment = '';
			if (ctrl.transaction.attachment) {
				attachment = ' | ATTACHMENT: ' + ctrl.transaction.attachment;
			}

			return 'TX ID: ' + ctrl.transaction.id +
				' | TYPE: ' + ctrl.transaction.formatted.type +
				' | DATE: ' + ctrl.transaction.formatted.datetime +
				' | SENDER ADDRESS: ' + ctrl.transaction.sender +
				' | TX AMOUNT: ' + ctrl.transaction.formatted.amount + ' ' + ctrl.transaction.formatted.asset +
				' | RECIPIENT ADDRESS: ' + recipient +
				' | TX FEE: ' + ctrl.transaction.formatted.fee + ' ' + ctrl.transaction.formatted.feeAsset.displayName +
				(ctrl.transaction.formatted.feeAsset.id ? ' (' + ctrl.transaction.formatted.feeAsset.id + ')' : '') +
				attachment;
		}
	}

	TransactionMenuController.$inject = ['$scope', 'constants.transactions', 'ui.events', 'notificationService'];

	angular
		.module('app.shared')
		.component('txMenu', {
			controller: TransactionMenuController,
			bindings: {
				transaction: '<'
			},
			templateUrl: 'shared/transaction.menu.component'
		});
})();

(function () {
	'use strict';

	var FEE_CURRENCY = Currency.MIR;
	var DEFAULT_ERROR_MESSAGE = 'The Internet connection is lost';

	// TODO : add the `exceptField` attribute or a list of all the needed fields.

	function WavesTransactionHistoryController($scope, events, constants, applicationContext, apiService, leasingRequestService, notificationService, dialogService) {
		var ctrl = this;
		var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

		ctrl.cancelLeasing = cancelLeasing;
		ctrl.confirm = {
			fee: minimumFee
		};

		$scope.$on(events.LEASING_CANCEL, function (event, eventData) {
			ctrl.startLeasingTransaction = eventData.startLeasingTransaction;

			ctrl.confirm.recipient = ctrl.startLeasingTransaction.recipient;
			ctrl.confirm.amount = ctrl.startLeasingTransaction.formatted.amount;
			ctrl.confirm.asset = ctrl.startLeasingTransaction.formatted.asset;

			dialogService.open('#cancel-leasing-confirmation');
		});

		function cancelLeasing () {
			var cancelLeasing = {
				startLeasingTransactionId: ctrl.startLeasingTransaction.id,
				fee: minimumFee
			};

			var sender = {
				publicKey: applicationContext.account.keyPair.public,
				privateKey: applicationContext.account.keyPair.private
			};

			var transaction = leasingRequestService.buildCancelLeasingRequest(cancelLeasing, sender);

			apiService.leasing.cancel(transaction)
				.then(function () {
					notificationService.notice('Leasing transaction of ' +
						ctrl.startLeasingTransaction.formatted.amount + ' ' +
						ctrl.startLeasingTransaction.formatted.asset + ' has been cancelled.');
				})
				.catch(function (exception) {
					if (exception) {
						if (exception.data) {
							notificationService.error(exception.data.message);
						} else if (exception.message) {
							notificationService.error(exception.message);
						} else if (exception.statusText) {
							notificationService.error(exception.statusText);
						} else {
							notificationService.error(DEFAULT_ERROR_MESSAGE);
						}
					} else {
						notificationService.error(DEFAULT_ERROR_MESSAGE);
					}

					dialogService.close();
				});

			return true;
		}
	}

	WavesTransactionHistoryController.$inject = ['$scope', 'ui.events', 'constants.ui', 'applicationContext', 'apiService', 'leasingRequestService', 'notificationService', 'dialogService'];

	angular
		.module('app.shared')
		.component('wavesTransactionHistory', {
			controller: WavesTransactionHistoryController,
			bindings: {
				heading: '@',
				transactions: '<',
				limitTo: '<'
			},
			templateUrl: 'shared/transaction.history.component'
		});
})();
