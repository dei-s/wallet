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

(function () {
	'use strict';

	var WAVES_ASSET_ID = 'WAVES',
		WAVES_PRECISION = 8;

	function denormalizeId(id) {
		return id === WAVES_ASSET_ID ? '' : id;
	}

	function normalizeId(id) {
		return id ? id : WAVES_ASSET_ID;
	}

	function MatcherApiService(rest, utilityService, cryptoService, validateService) {
		var apiRoot = rest.all('matcher');
		var orderbookRoot = apiRoot.all('orderbook');

		this.createOrder = function (signedOrderRequest) {
			return orderbookRoot.post(signedOrderRequest);
		};

		this.cancelOrder = function (firstAssetId, secondAssetId, signedCancelRequest) {
			return orderbookRoot
				.all(normalizeId(firstAssetId))
				.all(normalizeId(secondAssetId))
				.all('cancel')
				.post(signedCancelRequest);
		};

		this.deleteOrder = function (firstAssetId, secondAssetId, signedCancelRequest) {
			return orderbookRoot
				.all(normalizeId(firstAssetId))
				.all(normalizeId(secondAssetId))
				.all('delete')
				.post(signedCancelRequest);
		};

		this.orderStatus = function (firstAssetId, secondAssetId, orderId) {
			return orderbookRoot
				.all(normalizeId(firstAssetId))
				.all(normalizeId(secondAssetId))
				.get(orderId);
		};

		this.loadMatcherKey = function () {
			return apiRoot.get('');
		};

		this.loadOrderbook = function (firstAssetId, secondAssetId) {
			return orderbookRoot.all(normalizeId(firstAssetId)).get(normalizeId(secondAssetId))
				.then(function (response) {
					response.pair.amountAsset = denormalizeId(response.pair.amountAsset);
					response.pair.priceAsset = denormalizeId(response.pair.priceAsset);

					return response;
				});
		};

		function buildLoadUserOrdersSignature(timestamp, sender) {
			validateService.validateSender(sender);

			var publicKeyBytes = utilityService.base58StringToByteArray(sender.publicKey),
				timestampBytes = utilityService.longToByteArray(timestamp),
				signatureData = [].concat(publicKeyBytes, timestampBytes),

				privateKeyBytes = cryptoService.base58.decode(sender.privateKey);

			return cryptoService.nonDeterministicSign(privateKeyBytes, signatureData);
		}

		this.loadUserOrders = function (amountAsset, priceAsset, sender) {
			var timestamp = Date.now(),
				signature = buildLoadUserOrdersSignature(timestamp, sender);

			return orderbookRoot
				.all(normalizeId(amountAsset))
				.all(normalizeId(priceAsset))
				.all('publicKey')
				.get(sender.publicKey, {}, {
					Timestamp: timestamp,
					Signature: signature
				});
		};

		this.loadAllMarkets = function () {
			return orderbookRoot.get('').then(function (response) {
				var pairs = [];
				_.forEach(response.markets, function (market) {
					var id = normalizeId(market.amountAsset) + '/' + normalizeId(market.priceAsset);
					var pair = {
						id: id,
						amountAssetInfo: market.amountAssetInfo,
						amountAsset: Currency.create({
							id: denormalizeId(market.amountAsset),
							displayName: market.amountAssetName,
							precision: market.amountAssetInfo ? market.amountAssetInfo.decimals : WAVES_PRECISION
						}),
						priceAssetInfo: market.priceAssetInfo,
						priceAsset: Currency.create({
							id: denormalizeId(market.priceAsset),
							displayName: market.priceAssetName,
							precision: market.priceAssetInfo ? market.priceAssetInfo.decimals : WAVES_PRECISION
						}),
						created: market.created
					};
					pairs.push(pair);
				});

				return pairs;
			});
		};

		this.getTradableBalance = function (amountAsset, priceAsset, address) {
			var normAmountAsset = normalizeId(amountAsset),
				normPriceAsset = normalizeId(priceAsset);

			return orderbookRoot
				.all(normAmountAsset)
				.all(normPriceAsset)
				.all('tradableBalance')
				.get(address)
				.then(function (response) {
					var result = {};
					result[denormalizeId(normAmountAsset)] = response[normAmountAsset];
					result[denormalizeId(normPriceAsset)] = response[normPriceAsset];
					return result;
				});
		};
	}

	MatcherApiService.$inject = ['MatcherRestangular', 'utilityService', 'cryptoService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('matcherApiService', MatcherApiService);
})();

(function () {
	'use strict';

	var SELL_ORDER_TYPE = 'sell';

	function MatcherRequestService(signService, utilityService, validateService) {
		function buildCreateOrderSignatureData(order, senderPublicKey) {
			return [].concat(
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getPublicKeyBytes(order.matcherKey),
				signService.getAssetIdBytes(order.price.amountAsset.id),
				signService.getAssetIdBytes(order.price.priceAsset.id),
				signService.getOrderTypeBytes(order.orderType === SELL_ORDER_TYPE),
				signService.getAmountBytes(order.price.toBackendPrice()),
				signService.getAmountBytes(order.amount.toCoins()),
				signService.getTimestampBytes(order.time),
				signService.getTimestampBytes(order.expiration),
				signService.getFeeBytes(order.fee.toCoins())
			);
		}

		this.buildCreateOrderRequest = function (order, sender) {
			validateService.validateSender(sender);

			var currentTimeMillis = utilityService.getTime();
			order.time = order.time || currentTimeMillis;

			var date = new Date(currentTimeMillis);
			order.expiration = order.expiration || date.setDate(date.getDate() + 20);

			var signatureData = buildCreateOrderSignatureData(order, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				orderType: order.orderType,
				assetPair: {
					amountAsset: order.price.amountAsset.id,
					priceAsset: order.price.priceAsset.id
				},
				price: order.price.toBackendPrice(),
				amount: order.amount.toCoins(),
				timestamp: order.time,
				expiration: order.expiration,
				matcherFee: order.fee.toCoins(),
				matcherPublicKey: order.matcherKey,
				senderPublicKey: sender.publicKey,
				signature: signature
			};
		};

		function buildCancelOrderSignatureData(orderId, senderPublicKey) {
			return [].concat(
				signService.getPublicKeyBytes(senderPublicKey),
				signService.getOrderIdBytes(orderId)
			);
		}

		this.buildCancelOrderRequest = function (orderId, sender) {
			validateService.validateSender(sender);

			if (!orderId) {
				throw new Error('orderId hasn\'t been set');
			}

			var signatureData = buildCancelOrderSignatureData(orderId, sender.publicKey);
			var signature = signService.buildSignature(signatureData, sender.privateKey);

			return {
				sender: sender.publicKey,
				orderId: orderId,
				signature: signature
			};
		};
	}

	MatcherRequestService.$inject = ['signService', 'utilityService', 'validateService'];

	angular
		.module('waves.core.services')
		.service('matcherRequestService', MatcherRequestService);
})();

var OrderPrice = (function () {

	var MATCHER_SCALE = 1e8;

	function OrderPrice(price, pair) {
		this.amountAsset = pair.amountAsset;
		this.priceAsset = pair.priceAsset;
		this.price = roundToPriceAsset(price, pair);
	}

	OrderPrice.prototype.toTokens = function () {
		return this.price.toNumber();
	};

	OrderPrice.prototype.toCoins = function () {
		return this.toTokens() * Math.pow(10, this.priceAsset.precision - this.amountAsset.precision);
	};

	OrderPrice.prototype.toBackendPrice = function () {
		return Math.round(this.toCoins() * MATCHER_SCALE);
	};

	function roundToPriceAsset(price, pair) {
		return new Decimal(new Decimal(price).toFixed(pair.priceAsset.precision, Decimal.ROUND_FLOOR));
	}

	function normalizePrice(price, pair) {
		return new Decimal(price)
			.div(MATCHER_SCALE)
			.div(Math.pow(10, pair.priceAsset.precision - pair.amountAsset.precision));
	}

	return {
		fromTokens: function (price, pair) {
			return new OrderPrice(price, pair);
		},

		fromBackendPrice: function (price, pair) {
			var normalizedPrice = normalizePrice(price, pair);

			return new OrderPrice(normalizedPrice, pair);
		}
	};
})();
