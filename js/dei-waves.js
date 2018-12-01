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

/**
 * @requires {decimal.js}
 */

var Currency = (function () {
    var currencyCache = {};

    function Currency(data) {
        data = data || {};

        this.id = data.id; // base58 encoded asset id of the currency
        this.displayName = data.displayName;
        this.shortName = data.shortName || data.displayName;
        this.precision = data.precision; // number of decimal places after a decimal point
        this.verified = data.verified || false;

        if (data.roundingMode !== undefined) {
            this.roundingMode = data.roundingMode;
        } else {
            this.roundingMode = Decimal.ROUND_HALF_UP;
        }

        return this;
    }

    Currency.prototype.toString = function () {
        if (this.shortName)
            return this.shortName;

        return this.displayName;
    };

    var WAVES = new Currency({
        id: '',
        displayName: 'Waves',
        shortName: 'WAVES',
        precision: 8,
        verified: true
    });

    var BTC = new Currency({
        id: '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS',
        displayName: 'Bitcoin',
        shortName: 'BTC',
        precision: 8,
        verified: true
    });

    var USD = new Currency({
        id: 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck',
        displayName: 'US Dollar',
        shortName: 'USD',
        precision: 2,
        verified: true
    });

    var EUR = new Currency({
        id: 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU',
        displayName: 'Euro',
        shortName: 'EUR',
        precision: 2,
        verified: true
    });

	var DEIP = new Currency({
		id: '8Wj49jM8y9qfFx2QG6HxQXbiaxdnTt8EGm8mEqXJWFL4',
		displayName: 'Platform',
		shortName: 'DEIP',
		precision: 2,
		verified: true
	});

	var LIBRE = new Currency({
		id: '8qqoeygkNFqSjqf8JrB1LtzkCPTS3zJPe3LHDotTJvdH',
		displayName: 'Libre',
		shortName: 'LIBRE',
		precision: 1,
		verified: true
	});

	var MIR = new Currency({
		id: 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ',
		displayName: 'МИР',
		shortName: 'MIR',
		precision: 8,
		verified: true
	});

    function isCached(assetId) {
        return currencyCache.hasOwnProperty(assetId);
    }

    function invalidateCache() {
        currencyCache = {};

        currencyCache[WAVES.id] = WAVES;
        currencyCache[BTC.id] = BTC;
        currencyCache[USD.id] = USD;
        currencyCache[EUR.id] = EUR;
		currencyCache[DEIP.id] = DEIP;
		currencyCache[LIBRE.id] = LIBRE;
        currencyCache[MIR.id] = MIR;
    }

    invalidateCache();

    return {
        create: function (data) {
            // if currency data.id is not set - it's a temporary instance
            if (!_.has(data, 'id')) {
                return new Currency(data);
            }

            if (!currencyCache[data.id]) {
                currencyCache[data.id] = new Currency(data);
            }

            return currencyCache[data.id];
        },
        invalidateCache: invalidateCache,
        isCached: isCached,
        WAVES: WAVES,
        BTC: BTC,
        USD: USD,
        EUR: EUR,
		DEIP: DEIP,
		LIBRE: LIBRE,
        MIR: MIR
    };
})();

var Money = function(amount, currency) {
    var DECIMAL_SEPARATOR = '.';
    var THOUSANDS_SEPARATOR = ',';

    if (amount === undefined)
        throw Error('Amount is required');

    if (currency === undefined)
        throw Error('Currency is required');

    this.amount = new Decimal(amount)
        .toDecimalPlaces(currency.precision, Decimal.ROUND_FLOOR);
    this.currency = currency;

    var integerPart = function (value) {
        return value.trunc();
    };

    var fractionPart = function (value) {
        return value.minus(integerPart(value));
    };

    var format = function (value) {
        return value.toFixed(currency.precision, currency.roundingMode);
    };

    var validateCurrency = function (expected, actual) {
        if (expected.id !== actual.id)
            throw new Error('Currencies must be the same for operands. Expected: ' +
                expected.displayName + '; Actual: ' + actual.displayName);
    };

    var fromTokensToCoins = function (valueInTokens, currencyPrecision) {
        return valueInTokens.mul(Math.pow(10, currencyPrecision)).trunc();
    };

    var fromCoinsToTokens = function (valueInCoins, currencyPrecision) {
        return valueInCoins.trunc().div(Math.pow(10, currencyPrecision));
    };

    // in 2016 Safari doesn't support toLocaleString()
    // that's why we need this method
    var formatWithThousandsSeparator = function (formattedAmount) {
        var parts = formattedAmount.split(DECIMAL_SEPARATOR);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, THOUSANDS_SEPARATOR);

        return parts.join(DECIMAL_SEPARATOR);
    };

    this.formatAmount = function (stripZeroes, useThousandsSeparator) {
        var result = stripZeroes ?
            this.toTokens().toFixed(this.amount.decimalPlaces()) :
            format(this.amount);

        return useThousandsSeparator ? formatWithThousandsSeparator(result) : result;
    };

    this.formatIntegerPart = function () {
        return integerPart(this.amount).toFixed(0);
    };

    this.formatFractionPart = function () {
        var valueWithLeadingZero = format(fractionPart(this.amount));

        return valueWithLeadingZero.slice(1); // stripping the leading zero
    };

    this.toTokens = function () {
        var result = fromCoinsToTokens(fromTokensToCoins(this.amount, this.currency.precision),
            this.currency.precision);

        return result.toNumber();
    };

    this.toCoins = function () {
        return fromTokensToCoins(this.amount, this.currency.precision).toNumber();
    };

    this.plus = function (money) {
        validateCurrency(this.currency, money.currency);

        return new Money(this.amount.plus(money.amount), this.currency);
    };

    this.minus = function (money) {
        validateCurrency(this.currency, money.currency);

        return new Money(this.amount.minus(money.amount), this.currency);
    };

    this.greaterThan = function (other) {
        validateCurrency(this.currency, other.currency);

        return this.amount.greaterThan(other.amount);
    };

    this.greaterThanOrEqualTo = function (other) {
        validateCurrency(this.currency, other.currency);

        return this.amount.greaterThanOrEqualTo(other.amount);
    };

    this.lessThan = function (other) {
        validateCurrency(this.currency, other.currency);

        return this.amount.lessThan(other.amount);
    };

    this.lessThanOrEqualTo = function (other) {
        validateCurrency(this.currency, other.currency);

        return this.amount.lessThanOrEqualTo(other.amount);
    };

    this.multiply = function (multiplier) {
        if (!_.isNumber(multiplier))
            throw new Error('Number is expected');

        if (isNaN(multiplier))
            throw new Error('Multiplication by NaN is not supported');

        return new Money(this.amount.mul(multiplier), this.currency);
    };

    this.toString = function () {
        return this.formatAmount(false, true) + ' ' + this.currency.toString();
    };

    return this;
};

Money.fromTokens = function (amount, currency) {
    return new Money(amount, currency);
};

Money.fromCoins = function (amount, currency) {
    currency = currency || {};
    if (currency.precision === undefined)
        throw new Error('A valid currency must be provided');

    amount = new Decimal(amount);
    amount = amount.div(Math.pow(10, currency.precision));

    return new Money(amount, currency);
};

// set up decimal to format 0.00000001 as is instead of 1e-8
Decimal.config({toExpNeg: -(Currency.WAVES.precision + 1)});




// ==== waves.core ====

(function() {
    'use strict';

    angular.module('waves.core', [
        'waves.core.services',
        'waves.core.constants',
        'waves.core.filter',
        'waves.core.directives'
    ]);
})();

// ==== waves.core.constants ====

(function() {
    'use strict';

    angular
        .module('waves.core.constants', [])
        .constant('constants.network', {
            NETWORK_NAME: 'devel', // 'devnet', 'testnet', 'mainnet'
            ADDRESS_VERSION: 1,
            NETWORK_CODE: 'T',
            INITIAL_NONCE: 0
        });

    angular
        .module('waves.core.constants')
        .constant('constants.address', {
            RAW_ADDRESS_LENGTH : 35,
            ADDRESS_PREFIX: '1W',
            MAINNET_ADDRESS_REGEXP: /^[a-zA-Z0-9]{35}$/
        });

    angular
        .module('waves.core.constants')
        .constant('constants.features', {
            ALIAS_VERSION: 2
        });

    angular
        .module('waves.core.constants')
        .constant('constants.ui', {
            MINIMUM_PAYMENT_AMOUNT : 1e-8,
            MINIMUM_TRANSACTION_FEE : 0.001,
            AMOUNT_DECIMAL_PLACES : 8,
            JAVA_MAX_LONG: 9223372036854775807,
            MAXIMUM_ATTACHMENT_BYTE_SIZE: 140
        });

    angular
        .module('waves.core.constants')
        .constant('constants.transactions', {
            PAYMENT_TRANSACTION_TYPE : 2,
            ASSET_ISSUE_TRANSACTION_TYPE: 3,
            ASSET_TRANSFER_TRANSACTION_TYPE: 4,
            ASSET_REISSUE_TRANSACTION_TYPE: 5,
            ASSET_BURN_TRANSACTION_TYPE: 6,
            EXCHANGE_TRANSACTION_TYPE: 7,
            START_LEASING_TRANSACTION_TYPE: 8,
            CANCEL_LEASING_TRANSACTION_TYPE: 9,
            CREATE_ALIAS_TRANSACTION_TYPE: 10,
            MASS_PAYMENT_TRANSACTION_TYPE: 11
        });
})();
