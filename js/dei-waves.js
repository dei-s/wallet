/******************************************************************************
 * Copyright Â© 2016 The Waves Developers.                                *
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


(function() {
    'use strict';

    angular.module('waves.core', [
        'waves.core.services',
        'waves.core.constants',
        'waves.core.filter',
        'waves.core.directives'
    ]);
})();

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

(function () {
    'use strict';
    angular.module('waves.core.directives', []);
})();

(function() {
    'use strict';

    angular.module('waves.core.services', ['waves.core', 'restangular'])
        .config(function () {
            if (!String.prototype.startsWith) {
                Object.defineProperty(String.prototype, 'startsWith', {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: function(searchString, position) {
                        position = position || 0;
                        return this.lastIndexOf(searchString, position) === position;
                    }
                });
            }

            if (typeof String.prototype.endsWith !== 'function') {
                String.prototype.endsWith = function(suffix) {
                    return this.indexOf(suffix, this.length - suffix.length) !== -1;
                };
            }
        });
})();

/**
 * @author BjÃ¶rn Wenzel
 */
(function () {
    'use strict';
    angular.module('waves.core.filter', []);
})();

//https://github.com/bitcoin/bips/blob/master/bip-0039/bip-0039-wordlists.md
(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .constant('wordList', [
            'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access',
            'accident', 'account', 'accuse', 'achieve', 'acid', 'acoustic', 'acquire', 'across', 'act', 'action',
            'actor', 'actress', 'actual', 'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
            'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'age', 'agent', 'agree', 'ahead', 'aim', 'air',
            'airport', 'aisle', 'alarm', 'album', 'alcohol', 'alert', 'alien', 'all', 'alley', 'allow', 'almost',
            'alone', 'alpha', 'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount', 'amused',
            'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal', 'ankle', 'announce', 'annual',
            'another', 'answer', 'antenna', 'antique', 'anxiety', 'any', 'apart', 'apology', 'appear', 'apple',
            'approve', 'april', 'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor', 'army', 'around',
            'arrange', 'arrest', 'arrive', 'arrow', 'art', 'artefact', 'artist', 'artwork', 'ask', 'aspect', 'assault',
            'asset', 'assist', 'assume', 'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract',
            'auction', 'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado', 'avoid', 'awake',
            'aware', 'away', 'awesome', 'awful', 'awkward', 'axis', 'baby', 'bachelor', 'bacon', 'badge', 'bag',
            'balance', 'balcony', 'ball', 'bamboo', 'banana', 'banner', 'bar', 'barely', 'bargain', 'barrel', 'base',
            'basic', 'basket', 'battle', 'beach', 'bean', 'beauty', 'because', 'become', 'beef', 'before', 'begin',
            'behave', 'behind', 'believe', 'below', 'belt', 'bench', 'benefit', 'best', 'betray', 'better', 'between',
            'beyond', 'bicycle', 'bid', 'bike', 'bind', 'biology', 'bird', 'birth', 'bitter', 'black', 'blade', 'blame',
            'blanket', 'blast', 'bleak', 'bless', 'blind', 'blood', 'blossom', 'blouse', 'blue', 'blur', 'blush',
            'board', 'boat', 'body', 'boil', 'bomb', 'bone', 'bonus', 'book', 'boost', 'border', 'boring', 'borrow',
            'boss', 'bottom', 'bounce', 'box', 'boy', 'bracket', 'brain', 'brand', 'brass', 'brave', 'bread', 'breeze',
            'brick', 'bridge', 'brief', 'bright', 'bring', 'brisk', 'broccoli', 'broken', 'bronze', 'broom', 'brother',
            'brown', 'brush', 'bubble', 'buddy', 'budget', 'buffalo', 'build', 'bulb', 'bulk', 'bullet', 'bundle',
            'bunker', 'burden', 'burger', 'burst', 'bus', 'business', 'busy', 'butter', 'buyer', 'buzz', 'cabbage',
            'cabin', 'cable', 'cactus', 'cage', 'cake', 'call', 'calm', 'camera', 'camp', 'can', 'canal', 'cancel',
            'candy', 'cannon', 'canoe', 'canvas', 'canyon', 'capable', 'capital', 'captain', 'car', 'carbon', 'card',
            'cargo', 'carpet', 'carry', 'cart', 'case', 'cash', 'casino', 'castle', 'casual', 'cat', 'catalog', 'catch',
            'category', 'cattle', 'caught', 'cause', 'caution', 'cave', 'ceiling', 'celery', 'cement', 'census',
            'century', 'cereal', 'certain', 'chair', 'chalk', 'champion', 'change', 'chaos', 'chapter', 'charge',
            'chase', 'chat', 'cheap', 'check', 'cheese', 'chef', 'cherry', 'chest', 'chicken', 'chief', 'child',
            'chimney', 'choice', 'choose', 'chronic', 'chuckle', 'chunk', 'churn', 'cigar', 'cinnamon', 'circle',
            'citizen', 'city', 'civil', 'claim', 'clap', 'clarify', 'claw', 'clay', 'clean', 'clerk', 'clever', 'click',
            'client', 'cliff', 'climb', 'clinic', 'clip', 'clock', 'clog', 'close', 'cloth', 'cloud', 'clown', 'club',
            'clump', 'cluster', 'clutch', 'coach', 'coast', 'coconut', 'code', 'coffee', 'coil', 'coin', 'collect',
            'color', 'column', 'combine', 'come', 'comfort', 'comic', 'common', 'company', 'concert', 'conduct',
            'confirm', 'congress', 'connect', 'consider', 'control', 'convince', 'cook', 'cool', 'copper', 'copy',
            'coral', 'core', 'corn', 'correct', 'cost', 'cotton', 'couch', 'country', 'couple', 'course', 'cousin',
            'cover', 'coyote', 'crack', 'cradle', 'craft', 'cram', 'crane', 'crash', 'crater', 'crawl', 'crazy',
            'cream', 'credit', 'creek', 'crew', 'cricket', 'crime', 'crisp', 'critic', 'crop', 'cross', 'crouch',
            'crowd', 'crucial', 'cruel', 'cruise', 'crumble', 'crunch', 'crush', 'cry', 'crystal', 'cube', 'culture',
            'cup', 'cupboard', 'curious', 'current', 'curtain', 'curve', 'cushion', 'custom', 'cute', 'cycle', 'dad',
            'damage', 'damp', 'dance', 'danger', 'daring', 'dash', 'daughter', 'dawn', 'day', 'deal', 'debate',
            'debris', 'decade', 'december', 'decide', 'decline', 'decorate', 'decrease', 'deer', 'defense', 'define',
            'defy', 'degree', 'delay', 'deliver', 'demand', 'demise', 'denial', 'dentist', 'deny', 'depart', 'depend',
            'deposit', 'depth', 'deputy', 'derive', 'describe', 'desert', 'design', 'desk', 'despair', 'destroy',
            'detail', 'detect', 'develop', 'device', 'devote', 'diagram', 'dial', 'diamond', 'diary', 'dice', 'diesel',
            'diet', 'differ', 'digital', 'dignity', 'dilemma', 'dinner', 'dinosaur', 'direct', 'dirt', 'disagree',
            'discover', 'disease', 'dish', 'dismiss', 'disorder', 'display', 'distance', 'divert', 'divide', 'divorce',
            'dizzy', 'doctor', 'document', 'dog', 'doll', 'dolphin', 'domain', 'donate', 'donkey', 'donor', 'door',
            'dose', 'double', 'dove', 'draft', 'dragon', 'drama', 'drastic', 'draw', 'dream', 'dress', 'drift', 'drill',
            'drink', 'drip', 'drive', 'drop', 'drum', 'dry', 'duck', 'dumb', 'dune', 'during', 'dust', 'dutch', 'duty',
            'dwarf', 'dynamic', 'eager', 'eagle', 'early', 'earn', 'earth', 'easily', 'east', 'easy', 'echo', 'ecology',
            'economy', 'edge', 'edit', 'educate', 'effort', 'egg', 'eight', 'either', 'elbow', 'elder', 'electric',
            'elegant', 'element', 'elephant', 'elevator', 'elite', 'else', 'embark', 'embody', 'embrace', 'emerge',
            'emotion', 'employ', 'empower', 'empty', 'enable', 'enact', 'end', 'endless', 'endorse', 'enemy', 'energy',
            'enforce', 'engage', 'engine', 'enhance', 'enjoy', 'enlist', 'enough', 'enrich', 'enroll', 'ensure',
            'enter', 'entire', 'entry', 'envelope', 'episode', 'equal', 'equip', 'era', 'erase', 'erode', 'erosion',
            'error', 'erupt', 'escape', 'essay', 'essence', 'estate', 'eternal', 'ethics', 'evidence', 'evil', 'evoke',
            'evolve', 'exact', 'example', 'excess', 'exchange', 'excite', 'exclude', 'excuse', 'execute', 'exercise',
            'exhaust', 'exhibit', 'exile', 'exist', 'exit', 'exotic', 'expand', 'expect', 'expire', 'explain', 'expose',
            'express', 'extend', 'extra', 'eye', 'eyebrow', 'fabric', 'face', 'faculty', 'fade', 'faint', 'faith',
            'fall', 'false', 'fame', 'family', 'famous', 'fan', 'fancy', 'fantasy', 'farm', 'fashion', 'fat', 'fatal',
            'father', 'fatigue', 'fault', 'favorite', 'feature', 'february', 'federal', 'fee', 'feed', 'feel', 'female',
            'fence', 'festival', 'fetch', 'fever', 'few', 'fiber', 'fiction', 'field', 'figure', 'file', 'film',
            'filter', 'final', 'find', 'fine', 'finger', 'finish', 'fire', 'firm', 'first', 'fiscal', 'fish', 'fit',
            'fitness', 'fix', 'flag', 'flame', 'flash', 'flat', 'flavor', 'flee', 'flight', 'flip', 'float', 'flock',
            'floor', 'flower', 'fluid', 'flush', 'fly', 'foam', 'focus', 'fog', 'foil', 'fold', 'follow', 'food',
            'foot', 'force', 'forest', 'forget', 'fork', 'fortune', 'forum', 'forward', 'fossil', 'foster', 'found',
            'fox', 'fragile', 'frame', 'frequent', 'fresh', 'friend', 'fringe', 'frog', 'front', 'frost', 'frown',
            'frozen', 'fruit', 'fuel', 'fun', 'funny', 'furnace', 'fury', 'future', 'gadget', 'gain', 'galaxy',
            'gallery', 'game', 'gap', 'garage', 'garbage', 'garden', 'garlic', 'garment', 'gas', 'gasp', 'gate',
            'gather', 'gauge', 'gaze', 'general', 'genius', 'genre', 'gentle', 'genuine', 'gesture', 'ghost', 'giant',
            'gift', 'giggle', 'ginger', 'giraffe', 'girl', 'give', 'glad', 'glance', 'glare', 'glass', 'glide',
            'glimpse', 'globe', 'gloom', 'glory', 'glove', 'glow', 'glue', 'goat', 'goddess', 'gold', 'good', 'goose',
            'gorilla', 'gospel', 'gossip', 'govern', 'gown', 'grab', 'grace', 'grain', 'grant', 'grape', 'grass',
            'gravity', 'great', 'green', 'grid', 'grief', 'grit', 'grocery', 'group', 'grow', 'grunt', 'guard', 'guess',
            'guide', 'guilt', 'guitar', 'gun', 'gym', 'habit', 'hair', 'half', 'hammer', 'hamster', 'hand', 'happy',
            'harbor', 'hard', 'harsh', 'harvest', 'hat', 'have', 'hawk', 'hazard', 'head', 'health', 'heart', 'heavy',
            'hedgehog', 'height', 'hello', 'helmet', 'help', 'hen', 'hero', 'hidden', 'high', 'hill', 'hint', 'hip',
            'hire', 'history', 'hobby', 'hockey', 'hold', 'hole', 'holiday', 'hollow', 'home', 'honey', 'hood', 'hope',
            'horn', 'horror', 'horse', 'hospital', 'host', 'hotel', 'hour', 'hover', 'hub', 'huge', 'human', 'humble',
            'humor', 'hundred', 'hungry', 'hunt', 'hurdle', 'hurry', 'hurt', 'husband', 'hybrid', 'ice', 'icon', 'idea',
            'identify', 'idle', 'ignore', 'ill', 'illegal', 'illness', 'image', 'imitate', 'immense', 'immune',
            'impact', 'impose', 'improve', 'impulse', 'inch', 'include', 'income', 'increase', 'index', 'indicate',
            'indoor', 'industry', 'infant', 'inflict', 'inform', 'inhale', 'inherit', 'initial', 'inject', 'injury',
            'inmate', 'inner', 'innocent', 'input', 'inquiry', 'insane', 'insect', 'inside', 'inspire', 'install',
            'intact', 'interest', 'into', 'invest', 'invite', 'involve', 'iron', 'island', 'isolate', 'issue', 'item',
            'ivory', 'jacket', 'jaguar', 'jar', 'jazz', 'jealous', 'jeans', 'jelly', 'jewel', 'job', 'join', 'joke',
            'journey', 'joy', 'judge', 'juice', 'jump', 'jungle', 'junior', 'junk', 'just', 'kangaroo', 'keen', 'keep',
            'ketchup', 'key', 'kick', 'kid', 'kidney', 'kind', 'kingdom', 'kiss', 'kit', 'kitchen', 'kite', 'kitten',
            'kiwi', 'knee', 'knife', 'knock', 'know', 'lab', 'label', 'labor', 'ladder', 'lady', 'lake', 'lamp',
            'language', 'laptop', 'large', 'later', 'latin', 'laugh', 'laundry', 'lava', 'law', 'lawn', 'lawsuit',
            'layer', 'lazy', 'leader', 'leaf', 'learn', 'leave', 'lecture', 'left', 'leg', 'legal', 'legend', 'leisure',
            'lemon', 'lend', 'length', 'lens', 'leopard', 'lesson', 'letter', 'level', 'liar', 'liberty', 'library',
            'license', 'life', 'lift', 'light', 'like', 'limb', 'limit', 'link', 'lion', 'liquid', 'list', 'little',
            'live', 'lizard', 'load', 'loan', 'lobster', 'local', 'lock', 'logic', 'lonely', 'long', 'loop', 'lottery',
            'loud', 'lounge', 'love', 'loyal', 'lucky', 'luggage', 'lumber', 'lunar', 'lunch', 'luxury', 'lyrics',
            'machine', 'mad', 'magic', 'magnet', 'maid', 'mail', 'main', 'major', 'make', 'mammal', 'man', 'manage',
            'mandate', 'mango', 'mansion', 'manual', 'maple', 'marble', 'march', 'margin', 'marine', 'market',
            'marriage', 'mask', 'mass', 'master', 'match', 'material', 'math', 'matrix', 'matter', 'maximum', 'maze',
            'meadow', 'mean', 'measure', 'meat', 'mechanic', 'medal', 'media', 'melody', 'melt', 'member', 'memory',
            'mention', 'menu', 'mercy', 'merge', 'merit', 'merry', 'mesh', 'message', 'metal', 'method', 'middle',
            'midnight', 'milk', 'million', 'mimic', 'mind', 'minimum', 'minor', 'minute', 'miracle', 'mirror', 'misery',
            'miss', 'mistake', 'mix', 'mixed', 'mixture', 'mobile', 'model', 'modify', 'mom', 'moment', 'monitor',
            'monkey', 'monster', 'month', 'moon', 'moral', 'more', 'morning', 'mosquito', 'mother', 'motion', 'motor',
            'mountain', 'mouse', 'move', 'movie', 'much', 'muffin', 'mule', 'multiply', 'muscle', 'museum', 'mushroom',
            'music', 'must', 'mutual', 'myself', 'mystery', 'myth', 'naive', 'name', 'napkin', 'narrow', 'nasty',
            'nation', 'nature', 'near', 'neck', 'need', 'negative', 'neglect', 'neither', 'nephew', 'nerve', 'nest',
            'net', 'network', 'neutral', 'never', 'news', 'next', 'nice', 'night', 'noble', 'noise', 'nominee',
            'noodle', 'normal', 'north', 'nose', 'notable', 'note', 'nothing', 'notice', 'novel', 'now', 'nuclear',
            'number', 'nurse', 'nut', 'oak', 'obey', 'object', 'oblige', 'obscure', 'observe', 'obtain', 'obvious',
            'occur', 'ocean', 'october', 'odor', 'off', 'offer', 'office', 'often', 'oil', 'okay', 'old', 'olive',
            'olympic', 'omit', 'once', 'one', 'onion', 'online', 'only', 'open', 'opera', 'opinion', 'oppose',
            'option', 'orange', 'orbit', 'orchard', 'order', 'ordinary', 'organ', 'orient', 'original', 'orphan',
            'ostrich', 'other', 'outdoor', 'outer', 'output', 'outside', 'oval', 'oven', 'over', 'own', 'owner',
            'oxygen', 'oyster', 'ozone', 'pact', 'paddle', 'page', 'pair', 'palace', 'palm', 'panda', 'panel', 'panic',
            'panther', 'paper', 'parade', 'parent', 'park', 'parrot', 'party', 'pass', 'patch', 'path', 'patient',
            'patrol', 'pattern', 'pause', 'pave', 'payment', 'peace', 'peanut', 'pear', 'peasant', 'pelican', 'pen',
            'penalty', 'pencil', 'people', 'pepper', 'perfect', 'permit', 'person', 'pet', 'phone', 'photo', 'phrase',
            'physical', 'piano', 'picnic', 'picture', 'piece', 'pig', 'pigeon', 'pill', 'pilot', 'pink', 'pioneer',
            'pipe', 'pistol', 'pitch', 'pizza', 'place', 'planet', 'plastic', 'plate', 'play', 'please', 'pledge',
            'pluck', 'plug', 'plunge', 'poem', 'poet', 'point', 'polar', 'pole', 'police', 'pond', 'pony', 'pool',
            'popular', 'portion', 'position', 'possible', 'post', 'potato', 'pottery', 'poverty', 'powder', 'power',
            'practice', 'praise', 'predict', 'prefer', 'prepare', 'present', 'pretty', 'prevent', 'price', 'pride',
            'primary', 'print', 'priority', 'prison', 'private', 'prize', 'problem', 'process', 'produce', 'profit',
            'program', 'project', 'promote', 'proof', 'property', 'prosper', 'protect', 'proud', 'provide', 'public',
            'pudding', 'pull', 'pulp', 'pulse', 'pumpkin', 'punch', 'pupil', 'puppy', 'purchase', 'purity', 'purpose',
            'purse', 'push', 'put', 'puzzle', 'pyramid', 'quality', 'quantum', 'quarter', 'question', 'quick', 'quit',
            'quiz', 'quote', 'rabbit', 'raccoon', 'race', 'rack', 'radar', 'radio', 'rail', 'rain', 'raise', 'rally',
            'ramp', 'ranch', 'random', 'range', 'rapid', 'rare', 'rate', 'rather', 'raven', 'raw', 'razor', 'ready',
            'real', 'reason', 'rebel', 'rebuild', 'recall', 'receive', 'recipe', 'record', 'recycle', 'reduce',
            'reflect', 'reform', 'refuse', 'region', 'regret', 'regular', 'reject', 'relax', 'release', 'relief',
            'rely', 'remain', 'remember', 'remind', 'remove', 'render', 'renew', 'rent', 'reopen', 'repair', 'repeat',
            'replace', 'report', 'require', 'rescue', 'resemble', 'resist', 'resource', 'response', 'result', 'retire',
            'retreat', 'return', 'reunion', 'reveal', 'review', 'reward', 'rhythm', 'rib', 'ribbon', 'rice', 'rich',
            'ride', 'ridge', 'rifle', 'right', 'rigid', 'ring', 'riot', 'ripple', 'risk', 'ritual', 'rival', 'river',
            'road', 'roast', 'robot', 'robust', 'rocket', 'romance', 'roof', 'rookie', 'room', 'rose', 'rotate',
            'rough', 'round', 'route', 'royal', 'rubber', 'rude', 'rug', 'rule', 'run', 'runway', 'rural', 'sad',
            'saddle', 'sadness', 'safe', 'sail', 'salad', 'salmon', 'salon', 'salt', 'salute', 'same', 'sample', 'sand',
            'satisfy', 'satoshi', 'sauce', 'sausage', 'save', 'say', 'scale', 'scan', 'scare', 'scatter', 'scene',
            'scheme', 'school', 'science', 'scissors', 'scorpion', 'scout', 'scrap', 'screen', 'script', 'scrub', 'sea',
            'search', 'season', 'seat', 'second', 'secret', 'section', 'security', 'seed', 'seek', 'segment', 'select',
            'sell', 'seminar', 'senior', 'sense', 'sentence', 'series', 'service', 'session', 'settle', 'setup',
            'seven', 'shadow', 'shaft', 'shallow', 'share', 'shed', 'shell', 'sheriff', 'shield', 'shift', 'shine',
            'ship', 'shiver', 'shock', 'shoe', 'shoot', 'shop', 'short', 'shoulder', 'shove', 'shrimp', 'shrug',
            'shuffle', 'shy', 'sibling', 'sick', 'side', 'siege', 'sight', 'sign', 'silent', 'silk', 'silly', 'silver',
            'similar', 'simple', 'since', 'sing', 'siren', 'sister', 'situate', 'six', 'size', 'skate', 'sketch', 'ski',
            'skill', 'skin', 'skirt', 'skull', 'slab', 'slam', 'sleep', 'slender', 'slice', 'slide', 'slight', 'slim',
            'slogan', 'slot', 'slow', 'slush', 'small', 'smart', 'smile', 'smoke', 'smooth', 'snack', 'snake', 'snap',
            'sniff', 'snow', 'soap', 'soccer', 'social', 'sock', 'soda', 'soft', 'solar', 'soldier', 'solid',
            'solution', 'solve', 'someone', 'song', 'soon', 'sorry', 'sort', 'soul', 'sound', 'soup', 'source', 'south',
            'space', 'spare', 'spatial', 'spawn', 'speak', 'special', 'speed', 'spell', 'spend', 'sphere', 'spice',
            'spider', 'spike', 'spin', 'spirit', 'split', 'spoil', 'sponsor', 'spoon', 'sport', 'spot', 'spray',
            'spread', 'spring', 'spy', 'square', 'squeeze', 'squirrel', 'stable', 'stadium', 'staff', 'stage', 'stairs',
            'stamp', 'stand', 'start', 'state', 'stay', 'steak', 'steel', 'stem', 'step', 'stereo', 'stick', 'still',
            'sting', 'stock', 'stomach', 'stone', 'stool', 'story', 'stove', 'strategy', 'street', 'strike', 'strong',
            'struggle', 'student', 'stuff', 'stumble', 'style', 'subject', 'submit', 'subway', 'success', 'such',
            'sudden', 'suffer', 'sugar', 'suggest', 'suit', 'summer', 'sun', 'sunny', 'sunset', 'super', 'supply',
            'supreme', 'sure', 'surface', 'surge', 'surprise', 'surround', 'survey', 'suspect', 'sustain', 'swallow',
            'swamp', 'swap', 'swarm', 'swear', 'sweet', 'swift', 'swim', 'swing', 'switch', 'sword', 'symbol',
            'symptom', 'syrup', 'system', 'table', 'tackle', 'tag', 'tail', 'talent', 'talk', 'tank', 'tape', 'target',
            'task', 'taste', 'tattoo', 'taxi', 'teach', 'team', 'tell', 'ten', 'tenant', 'tennis', 'tent', 'term',
            'test', 'text', 'thank', 'that', 'theme', 'then', 'theory', 'there', 'they', 'thing', 'this', 'thought',
            'three', 'thrive', 'throw', 'thumb', 'thunder', 'ticket', 'tide', 'tiger', 'tilt', 'timber', 'time', 'tiny',
            'tip', 'tired', 'tissue', 'title', 'toast', 'tobacco', 'today', 'toddler', 'toe', 'together', 'toilet',
            'token', 'tomato', 'tomorrow', 'tone', 'tongue', 'tonight', 'tool', 'tooth', 'top', 'topic', 'topple',
            'torch', 'tornado', 'tortoise', 'toss', 'total', 'tourist', 'toward', 'tower', 'town', 'toy', 'track',
            'trade', 'traffic', 'tragic', 'train', 'transfer', 'trap', 'trash', 'travel', 'tray', 'treat', 'tree',
            'trend', 'trial', 'tribe', 'trick', 'trigger', 'trim', 'trip', 'trophy', 'trouble', 'truck', 'true',
            'truly', 'trumpet', 'trust', 'truth', 'try', 'tube', 'tuition', 'tumble', 'tuna', 'tunnel', 'turkey',
            'turn', 'turtle', 'twelve', 'twenty', 'twice', 'twin', 'twist', 'two', 'type', 'typical', 'ugly',
            'umbrella', 'unable', 'unaware', 'uncle', 'uncover', 'under', 'undo', 'unfair', 'unfold', 'unhappy',
            'uniform', 'unique', 'unit', 'universe', 'unknown', 'unlock', 'until', 'unusual', 'unveil', 'update',
            'upgrade', 'uphold', 'upon', 'upper', 'upset', 'urban', 'urge', 'usage', 'use', 'used', 'useful', 'useless',
            'usual', 'utility', 'vacant', 'vacuum', 'vague', 'valid', 'valley', 'valve', 'van', 'vanish', 'vapor',
            'various', 'vast', 'vault', 'vehicle', 'velvet', 'vendor', 'venture', 'venue', 'verb', 'verify', 'version',
            'very', 'vessel', 'veteran', 'viable', 'vibrant', 'vicious', 'victory', 'video', 'view', 'village',
            'vintage', 'violin', 'virtual', 'virus', 'visa', 'visit', 'visual', 'vital', 'vivid', 'vocal', 'voice',
            'void', 'volcano', 'volume', 'vote', 'voyage', 'wage', 'wagon', 'wait', 'walk', 'wall', 'walnut', 'want',
            'warfare', 'warm', 'warrior', 'wash', 'wasp', 'waste', 'water', 'wave', 'way', 'wealth', 'weapon', 'wear',
            'weasel', 'weather', 'web', 'wedding', 'weekend', 'weird', 'welcome', 'west', 'wet', 'whale', 'what',
            'wheat', 'wheel', 'when', 'where', 'whip', 'whisper', 'wide', 'width', 'wife', 'wild', 'will', 'win',
            'window', 'wine', 'wing', 'wink', 'winner', 'winter', 'wire', 'wisdom', 'wise', 'wish', 'witness', 'wolf',
            'woman', 'wonder', 'wood', 'wool', 'word', 'work', 'world', 'worry', 'worth', 'wrap', 'wreck', 'wrestle',
            'wrist', 'write', 'wrong', 'yard', 'year', 'yellow', 'you', 'young', 'youth', 'zebra', 'zero', 'zone', 'zoo'
        ]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('passPhraseService', ['wordList', '$window', function (wordList, $window) {
            this.generate = function () {
                var crypto = $window.crypto || $window.msCrypto;
                var bits = 160;
                var wordCount = wordList.length;
                var log2FromWordCount = Math.log(wordCount) / Math.log(2);
                var wordsInPassPhrase = Math.ceil(bits / log2FromWordCount);
                var random = new Uint16Array(wordsInPassPhrase);
                var passPhrase;

                crypto.getRandomValues(random);

                var i = 0,
                    index,
                    words = [];

                for (; i < wordsInPassPhrase; i++) {
                    index = random[i] % wordCount;
                    words.push(wordList[index]);
                }

                passPhrase = words.join(' ');

                crypto.getRandomValues(random);

                return passPhrase;
            };
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('accountService', ['storageService', '$q', function (storageService, $q) {
            var stateCache;

            function removeByIndex(state, index) {
                state.accounts.splice(index, 1);

                return state;
            }

            function getState() {
                if (angular.isUndefined(stateCache)) {
                    return storageService.loadState().then(function (state) {
                        state = state || {};
                        if (!state.accounts)
                            state.accounts = [];

                        stateCache = state;

                        return stateCache;
                    });
                }

                return $q.when(stateCache);
            }

            this.addAccount = function (accountInfo) {
                return getState()
                    .then(function (state) {
                        state.accounts.push(accountInfo);

                        return state;
                    })
                    .then(storageService.saveState);
            };

            this.removeAccountByIndex = function (index) {
                return getState()
                    .then(function (state) {
                        return removeByIndex(state, index);
                    })
                    .then(storageService.saveState);
            };

            this.removeAccount = function (account) {
                return getState()
                    .then(function (state) {
                        var index = _.findIndex(state.accounts, {
                            address: account.address
                        });
                        return removeByIndex(state, index);
                    })
                    .then(storageService.saveState);
            };

            this.getAccounts = function () {
                return getState()
                    .then(function (state) {
                        return state.accounts;
                    });
            };
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('addressService', ['constants.address', function (constants) {
            this.cleanupOptionalPrefix = function(displayAddress) {
                if (displayAddress.length <= 30) {
                    // Don't change aliases
                    return displayAddress;
                }

                var address = displayAddress,
                    prefixLen = constants.ADDRESS_PREFIX.length;

                if (address.length > constants.RAW_ADDRESS_LENGTH || address.startsWith(constants.ADDRESS_PREFIX)) {
                    address = address.substr(prefixLen, address.length - prefixLen);
                }

                return address;
            };

            this.validateAddress = function(address) {
                var cleanAddress = this.cleanupOptionalPrefix(address);
                return constants.MAINNET_ADDRESS_REGEXP.test(cleanAddress);
            };
        }]);
})();

/**
 * @requires {blake2b-256.js}
 * @requires {Base58.js}
 */
(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('cryptoService', ['constants.network', '$window', function(constants, window) {

            // private version of getNetworkId byte in order to avoid circular dependency
            // between cryptoService and utilityService
            var getNetworkIdByte = function() {
                return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
            };

            var appendUint8Arrays = function(array1, array2) {
                var tmp = new Uint8Array(array1.length + array2.length);
                tmp.set(array1, 0);
                tmp.set(array2, array1.length);
                return tmp;
            };

            var appendNonce = function (originalSeed) {
                // change this is when nonce increment gets introduced
                var nonce = new Uint8Array(converters.int32ToBytes(constants.INITIAL_NONCE, true));

                return appendUint8Arrays(nonce, originalSeed);
            };

            // sha256 accepts messageBytes as Uint8Array or Array
            var sha256 = function (message) {
                var bytes;
                if (typeof(message) == 'string')
                    bytes = converters.stringToByteArray(message);
                else
                    bytes = message;

                var wordArray = converters.byteArrayToWordArrayEx(new Uint8Array(bytes));
                var resultWordArray = CryptoJS.SHA256(wordArray);

                return converters.wordArrayToByteArrayEx(resultWordArray);
            };

            var prepareKey = function (key) {
                var rounds = 1000;
                var digest = key;
                for (var i = 0; i < rounds; i++) {
                    digest = converters.byteArrayToHexString(sha256(digest));
                }

                return digest;
            };

            // blake2b 256 hash function
            this.blake2b = function (input) {
                return blake2b(input, null, 32);
            };

            // keccak 256 hash algorithm
            this.keccak = function(messageBytes) {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                return keccak_256.array(messageBytes);
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            };

            this.sha256 = sha256;

            this.hashChain = function(noncedSecretPhraseBytes) {
                return this.keccak(this.blake2b(new Uint8Array(noncedSecretPhraseBytes)));
            };

            // Base68 encoding/decoding implementation
            this.base58 = {
                encode: function (buffer) {
                    return Base58.encode(buffer);
                },
                decode: function (string) {
                    return Base58.decode(string);
                }
            };

            this.buildAccountSeedHash = function(seedBytes) {
                var data = appendNonce(seedBytes);
                var seedHash = this.hashChain(data);

                return sha256(Array.prototype.slice.call(seedHash));
            };

            this.buildKeyPair = function(seedBytes) {
                var accountSeedHash = this.buildAccountSeedHash(seedBytes);
                var p = axlsign.generateKeyPair(accountSeedHash);

                return {
                    public: this.base58.encode(p.public),
                    private: this.base58.encode(p.private)
                };
            };

            this.buildPublicKey = function (seedBytes) {
                return this.buildKeyPair(seedBytes).public;
            };

            this.buildPrivateKey = function (seedBytes) {
                return this.buildKeyPair(seedBytes).private;
            };

            this.buildRawAddress = function (encodedPublicKey) {
                var publicKey = this.base58.decode(encodedPublicKey);
                var publicKeyHash = this.hashChain(publicKey);

                var prefix = new Uint8Array(2);
                prefix[0] = constants.ADDRESS_VERSION;
                prefix[1] = getNetworkIdByte();

                var unhashedAddress = appendUint8Arrays(prefix, publicKeyHash.slice(0, 20));
                var addressHash = this.hashChain(unhashedAddress).slice(0, 4);

                return this.base58.encode(appendUint8Arrays(unhashedAddress, addressHash));
            };

            this.buildRawAddressFromSeed = function (secretPhrase) {
                var publicKey = this.getPublicKey(secretPhrase);

                return this.buildRawAddress(publicKey);
            };

            //Returns publicKey built from string
            this.getPublicKey = function(secretPhrase) {
                return this.buildPublicKey(converters.stringToByteArray(secretPhrase));
            };

            //Returns privateKey built from string
            this.getPrivateKey = function(secretPhrase) {
                return this.buildPrivateKey(converters.stringToByteArray(secretPhrase));
            };

            //Returns key pair built from string
            this.getKeyPair = function (secretPhrase) {
                return this.buildKeyPair(converters.stringToByteArray(secretPhrase));
            };

            // function accepts buffer with private key and an array with dataToSign
            // returns buffer with signed data
            // 64 randoms bytes are added to the signature
            // method falls back to deterministic signatures if crypto object is not supported
            this.nonDeterministicSign = function(privateKey, dataToSign) {
                var crypto = window.crypto || window.msCrypto;
                var random;
                if (crypto) {
                    random = new Uint8Array(64);
                    crypto.getRandomValues(random);
                }

                var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign), random);

                return this.base58.encode(signature);
            };

            // function accepts buffer with private key and an array with dataToSign
            // returns buffer with signed data
            this.deterministicSign = function(privateKey, dataToSign) {
                var signature = axlsign.sign(privateKey, new Uint8Array(dataToSign));

                return this.base58.encode(signature);
            };

            this.verify = function(senderPublicKey, dataToSign, signatureBytes) {
                return axlsign.verify(senderPublicKey, dataToSign, signatureBytes);
            };

            // function returns base58 encoded shared key from base58 encoded a private
            // and b public keys
            this.getSharedKey = function (aEncodedPrivateKey, bEncodedPublicKey) {
                var aPrivateKey = this.base58.decode(aEncodedPrivateKey);
                var bPublicKey = this.base58.decode(bEncodedPublicKey);
                var sharedKey = axlsign.sharedKey(aPrivateKey, bPublicKey);

                return this.base58.encode(sharedKey);
            };

            // function can be used for sharedKey preparation, as recommended in: https://github.com/wavesplatform/curve25519-js
            this.prepareKey = function (key) {
                return prepareKey(key);
            };

            this.encryptWalletSeed = function (seed, key) {
                var aesKey = prepareKey(key);

                return CryptoJS.AES.encrypt(seed, aesKey);
            };

            this.decryptWalletSeed = function (cipher, key, checksum) {
                var aesKey = prepareKey(key);
                var data = CryptoJS.AES.decrypt(cipher, aesKey);

                var actualChecksum = this.seedChecksum(converters.hexStringToByteArray(data.toString()));
                if (actualChecksum === checksum)
                    return converters.hexStringToString(data.toString());
                else
                    return false;
            };

            this.seedChecksum = function (seed) {
                return converters.byteArrayToHexString(sha256(seed));
            };
        }]);
})();

(function () {
    'use strict';

    function AssetService(signService, validateService, utilityService, cryptoService) {
        function buildId(transactionBytes) {
            var hash = cryptoService.blake2b(new Uint8Array(transactionBytes));
            return cryptoService.base58.encode(hash);
        }

        function buildCreateAssetSignatureData (asset, tokensQuantity, senderPublicKey) {
            return [].concat(
                signService.getAssetIssueTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetNameBytes(asset.name),
                signService.getAssetDescriptionBytes(asset.description),
                signService.getAssetQuantityBytes(tokensQuantity),
                signService.getAssetDecimalPlacesBytes(asset.decimalPlaces),
                signService.getAssetIsReissuableBytes(asset.reissuable),
                signService.getFeeBytes(asset.fee.toCoins()),
                signService.getTimestampBytes(asset.time)
            );
        }

        this.createAssetIssueTransaction = function (asset, sender) {
            validateService.validateAssetIssue(asset);
            validateService.validateSender(sender);

            asset.time = asset.time || utilityService.getTime();
            asset.reissuable = angular.isDefined(asset.reissuable) ? asset.reissuable : false;
            asset.description = asset.description || '';

            var assetCurrency = Currency.create({
                displayName: asset.name,
                precision: asset.decimalPlaces
            });

            var tokens = new Money(asset.totalTokens, assetCurrency);
            var signatureData = buildCreateAssetSignatureData(asset, tokens.toCoins(), sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                name: asset.name,
                description: asset.description,
                quantity: tokens.toCoins(),
                decimals: Number(asset.decimalPlaces),
                reissuable: asset.reissuable,
                timestamp: asset.time,
                fee: asset.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };

        function buildCreateAssetTransferSignatureData(transfer, senderPublicKey) {
            return [].concat(
                signService.getAssetTransferTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetIdBytes(transfer.amount.currency.id),
                signService.getFeeAssetIdBytes(transfer.fee.currency.id),
                signService.getTimestampBytes(transfer.time),
                signService.getAmountBytes(transfer.amount.toCoins()),
                signService.getFeeBytes(transfer.fee.toCoins()),
                signService.getRecipientBytes(transfer.recipient),
                signService.getAttachmentBytes(transfer.attachment)
            );
        }

        this.createAssetTransferTransaction = function (transfer, sender) {
            validateService.validateAssetTransfer(transfer);
            validateService.validateSender(sender);

            transfer.time = transfer.time || utilityService.getTime();
            transfer.attachment = transfer.attachment || [];
            transfer.recipient = utilityService.resolveAddressOrAlias(transfer.recipient);

            var signatureData = buildCreateAssetTransferSignatureData(transfer, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                recipient: transfer.recipient,
                timestamp: transfer.time,
                assetId: transfer.amount.currency.id,
                amount: transfer.amount.toCoins(),
                fee: transfer.fee.toCoins(),
                feeAssetId: transfer.fee.currency.id,
                senderPublicKey: sender.publicKey,
                signature: signature,
                attachment: cryptoService.base58.encode(transfer.attachment)
            };
        };

        function buildCreateAssetReissueSignatureData(reissue, senderPublicKey) {
            return [].concat(
                signService.getAssetReissueTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAssetIdBytes(reissue.totalTokens.currency.id, true),
                signService.getAssetQuantityBytes(reissue.totalTokens.toCoins()),
                signService.getAssetIsReissuableBytes(reissue.reissuable),
                signService.getFeeBytes(reissue.fee.toCoins()),
                signService.getTimestampBytes(reissue.time)
            );
        }

        this.createAssetReissueTransaction = function (reissue, sender) {
            validateService.validateAssetReissue(reissue);
            validateService.validateSender(sender);

            reissue.reissuable = angular.isDefined(reissue.reissuable) ? reissue.reissuable : false;
            reissue.time = reissue.time || utilityService.getTime();

            var signatureData = buildCreateAssetReissueSignatureData(reissue, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                id: buildId(signatureData),
                assetId: reissue.totalTokens.currency.id,
                quantity: reissue.totalTokens.toCoins(),
                reissuable: reissue.reissuable,
                timestamp: reissue.time,
                fee: reissue.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    AssetService.$inject = ['signService', 'validateService', 'utilityService', 'cryptoService'];

    angular
        .module('waves.core.services')
        .service('assetService', AssetService);
})();

(function () {
    'use strict';

    function AliasRequestService(signService, utilityService, validateService) {
        function buildCreateAliasSignatureData (alias, senderPublicKey) {
            return [].concat(
                signService.getCreateAliasTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getAliasBytes(alias.alias),
                signService.getFeeBytes(alias.fee.toCoins()),
                signService.getTimestampBytes(alias.time)
            );
        }

        this.buildCreateAliasRequest = function (alias, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            alias.time = alias.time || currentTimeMillis;

            var signatureData = buildCreateAliasSignatureData(alias, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                alias: alias.alias,
                timestamp: alias.time,
                fee: alias.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    AliasRequestService.$inject = ['signService', 'utilityService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('aliasRequestService', AliasRequestService);
})();

(function () {
    'use strict';

    function LeasingRequestService(signService, utilityService, validateService) {
        function buildStartLeasingSignatureData (startLeasing, senderPublicKey) {
            return [].concat(
                signService.getStartLeasingTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getRecipientBytes(startLeasing.recipient),
                signService.getAmountBytes(startLeasing.amount.toCoins()),
                signService.getFeeBytes(startLeasing.fee.toCoins()),
                signService.getTimestampBytes(startLeasing.time)
            );
        }

        this.buildStartLeasingRequest = function (startLeasing, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            startLeasing.time = startLeasing.time || currentTimeMillis;
            startLeasing.recipient = utilityService.resolveAddressOrAlias(startLeasing.recipient);

            var signatureData = buildStartLeasingSignatureData(startLeasing, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                recipient: startLeasing.recipient,
                amount: startLeasing.amount.toCoins(),
                timestamp: startLeasing.time,
                fee: startLeasing.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };

        function buildCancelLeasingSignatureData (cancelLeasing, senderPublicKey) {
            return [].concat(
                signService.getCancelLeasingTxTypeBytes(),
                signService.getPublicKeyBytes(senderPublicKey),
                signService.getFeeBytes(cancelLeasing.fee.toCoins()),
                signService.getTimestampBytes(cancelLeasing.time),
                signService.getTransactionIdBytes(cancelLeasing.startLeasingTransactionId)
            );
        }

        this.buildCancelLeasingRequest = function (cancelLeasing, sender) {
            validateService.validateSender(sender);

            var currentTimeMillis = utilityService.getTime();
            cancelLeasing.time = cancelLeasing.time || currentTimeMillis;

            var signatureData = buildCancelLeasingSignatureData(cancelLeasing, sender.publicKey);
            var signature = signService.buildSignature(signatureData, sender.privateKey);

            return {
                txId: cancelLeasing.startLeasingTransactionId,
                timestamp: cancelLeasing.time,
                fee: cancelLeasing.fee.toCoins(),
                senderPublicKey: sender.publicKey,
                signature: signature
            };
        };
    }

    LeasingRequestService.$inject = ['signService', 'utilityService', 'validateService'];

    angular
        .module('waves.core.services')
        .service('leasingRequestService', LeasingRequestService);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('apiService', ['Restangular', 'cryptoService', function (rest, cryptoService) {
            var blocksApi = rest.all('blocks');

            this.blocks = {
                height: function() {
                    return blocksApi.get('height');
                },
                last: function() {
                    return blocksApi.get('last');
                },
                list: function (startHeight, endHeight) {
                    return blocksApi.one('seq', startHeight).all(endHeight).getList();
                }
            };

            var addressApi = rest.all('addresses');
            var consensusApi = rest.all('consensus');
            this.address = {
                balance: function (address) {
                    return addressApi.one('balance', address).get();
                },
                effectiveBalance: function (address) {
                    return addressApi.one('effectiveBalance', address).get();
                },
                generatingBalance: function (address) {
                    return consensusApi.one('generatingbalance', address).get();
                }
            };

            var transactionApi = rest.all('transactions');

            var request;
            var timer;
            this.transactions = {
                unconfirmed: function () {
                    if (!request) {
                        request = transactionApi.all('unconfirmed').getList();
                    } else {
                        if (!timer) {
                            timer = setTimeout(function () {
                                request = transactionApi.all('unconfirmed').getList();
                                request.finally(function () {
                                    timer = null;
                                });
                            }, 10000);
                        }
                    }
                    return request;
                },
                list: function (address, max) {
                    max = max || 50;
                    return transactionApi.one('address', address).one('limit', max).getList();
                },
                info: function (transactionId) {
                    return transactionApi.one('info', transactionId).get();
                }
            };

            var leasingApi = rest.all('leasing').all('broadcast');
            this.leasing = {
                lease: function (signedStartLeasingTransaction) {
                    return leasingApi.all('lease').post(signedStartLeasingTransaction);
                },
                cancel: function (signedCancelLeasingTransaction) {
                    return leasingApi.all('cancel').post(signedCancelLeasingTransaction);
                }
            };

            var aliasApi = rest.all('alias');
            this.alias = {
                create: function (signedCreateAliasTransaction) {
                    return aliasApi.all('broadcast').all('create').post(signedCreateAliasTransaction);
                },
                getByAddress: function (address) {
                    return aliasApi.all('by-address').get(address).then(function (response) {
                        return response.map(function (alias) {
                            return alias.slice(8);
                        });
                    });
                }
            };

            var assetApi = rest.all('assets');
            var assetBroadcastApi = assetApi.all('broadcast');
            this.assets = {
                balance: function (address, assetId) {
                    var rest = assetApi.all('balance');
                    if (assetId)
                        return rest.all(address).get(assetId);
                    else
                        return rest.get(address);
                },
                issue: function (signedAssetIssueTransaction) {
                    return assetBroadcastApi.all('issue').post(signedAssetIssueTransaction);
                },
                reissue: function (signedAssetReissueTransaction) {
                    return assetBroadcastApi.all('reissue').post(signedAssetReissueTransaction);
                },
                transfer: function (signedAssetTransferTransaction) {
                    return assetBroadcastApi.all('transfer').post(signedAssetTransferTransaction);
                },
                massPay: function (signedTransactions) {
                    return assetBroadcastApi.all('batch-transfer').post(signedTransactions);
                },
                makeAssetNameUnique: function (signedMakeAssetNameUniqueTransaction) {
                    return assetApi
                        .all('broadcast')
                        .all('make-asset-name-unique')
                        .post(signedMakeAssetNameUniqueTransaction);
                },
                isUniqueName: function (assetName) {
                    assetName = cryptoService.base58.encode(converters.stringToByteArray(assetName));
                    return assetApi
                        .all('asset-id-by-unique-name')
                        .get(assetName)
                        .then(function (response) {
                            // FIXME : temporary fix for the API format
                            if (typeof response !== 'object') {
                                response = {assetId: response};
                            }

                            return response.assetId;
                        });
                }
            };
        }]);
})();

(function () {
    'use strict';

    var BASE58_REGEX = new RegExp('^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{0,}$');

    angular
        .module('waves.core.services')
        .service('utilityService', ['constants.network', 'cryptoService', function (constants, cryptoService) {
            var self = this;

            self.getNetworkIdByte = function () {
                return constants.NETWORK_CODE.charCodeAt(0) & 0xFF;
            };

            // long to big-endian bytes
            self.longToByteArray = function (value) {
                var bytes = new Array(7);
                for (var k = 7; k >= 0; k--) {
                    bytes[k] = value & (255);
                    value = value / 256;
                }

                return bytes;
            };

            // short to big-endian bytes
            self.shortToByteArray = function (value) {
                return converters.int16ToBytes(value, true);
            };

            self.base58StringToByteArray = function (base58String) {
                var decoded = cryptoService.base58.decode(base58String);
                var result = [];
                for (var i = 0; i < decoded.length; ++i) {
                    result.push(decoded[i] & 0xff);
                }

                return result;
            };

            self.stringToByteArrayWithSize = function (string) {
                var bytes = converters.stringToByteArray(string);
                return self.byteArrayWithSize(bytes);
            };

            self.byteArrayWithSize = function (byteArray) {
                var result = self.shortToByteArray(byteArray.length);
                return result.concat(byteArray);
            };

            self.booleanToBytes = function (flag) {
                return flag ? [1] : [0];
            };

            self.endsWithWhitespace = function (value) {
                return /\s+$/g.test(value);
            };

            self.getTime = function() {
                return Date.now();
            };

            self.isValidBase58String = function (input) {
                return BASE58_REGEX.test(input);
            };

            // Add a prefix in case of alias
            self.resolveAddressOrAlias = function (string) {
                if (string.length <= 30) {
                    return 'alias:' + constants.NETWORK_CODE + ':' + string;
                } else {
                    return string;
                }
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('chromeStorageService', ['$q', function ($q) {
            var $key = 'WavesAccounts';
            var self = this;

            self.saveState = function (state) {
                var deferred = $q.defer();
                var json = {};
                json[$key] = state;

                chrome.storage.local.set(json, function () {
                    deferred.resolve();
                });

                return deferred.promise;
            };

            self.loadState = function () {
                var deferred = $q.defer();

                self.loadSyncState().then(function (syncState) {
                    if (syncState) {
                        self.saveState(syncState)
                            .then(function () {
                                return self.clearSyncState();
                            })
                            .then(function () {
                                deferred.resolve(syncState);
                            });
                    } else {
                        chrome.storage.local.get($key, function (data) {
                            deferred.resolve(data[$key]);
                        });
                    }
                });

                return deferred.promise;
            };

            self.loadSyncState = function () {
                var deferred = $q.defer();

                chrome.storage.sync.get($key, function (data) {
                    deferred.resolve(data[$key]);
                });

                return deferred.promise;
            };

            self.clearSyncState = function () {
                var deferred = $q.defer();

                chrome.storage.sync.clear(function () {
                    deferred.resolve();
                });

                return deferred.promise;
            };
        }]);
})();

(function() {
    'use strict';

    angular
        .module('waves.core.services')
        .service('html5StorageService', ['constants.network', '$window', '$q', function(constants, window, $q) {
            if (angular.isUndefined(constants.NETWORK_NAME))
                throw new Error('Network name hasn\'t been configured');

            var $key = 'Waves' + constants.NETWORK_NAME;

            this.saveState = function(state) {
                var serialized = angular.toJson(state);

                window.localStorage.setItem($key, serialized);

                return $q.when();
            };

            this.loadState = function() {
                var data;
                var serialized = window.localStorage.getItem($key);

                if (serialized) {
                    data = angular.fromJson(serialized);
                }

                return $q.when(data);
            };

            this.clear = function() {
                window.localStorage.removeItem($key);

                return $q.when();
            };
        }]);
})();

(function() {
    'use strict';

    var STORAGE_STRUCTURE_VERSION = 1;

    angular
        .module('waves.core.services')
        .provider('storageService', [function () {
            function getStorageVersion () {
                return STORAGE_STRUCTURE_VERSION;
            }

            function isLocalStorageEnabled(window) {
                var storage, fail, uid;
                try {
                    uid = String(new Date());
                    (storage = window.localStorage).setItem(uid, uid);
                    fail = storage.getItem(uid) != uid;
                    if (!fail)
                        storage.removeItem(uid);
                    else
                        storage = false;
                }
                catch (exception) {
                }
                return storage;
            }

            this.$get = ['$window', 'chromeStorageService', 'html5StorageService',
                function($window, chromeStorageService, html5StorageService) {
                    var result = isLocalStorageEnabled($window) ? html5StorageService : chromeStorageService;
                    result.getStorageVersion = getStorageVersion;

                    return result;
                }];
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('formattingService', ['$window', '$filter', function (window, $filter) {

            var LOCALE_DATE_FORMATS = {
                'ar-SA': 'dd/MM/yy',
                'bg-BG': 'dd.M.yyyy',
                'ca-ES': 'dd/MM/yyyy',
                'zh-TW': 'yyyy/M/d',
                'cs-CZ': 'd.M.yyyy',
                'da-DK': 'dd-MM-yyyy',
                'de-DE': 'dd.MM.yyyy',
                'el-GR': 'd/M/yyyy',
                'en-US': 'M/d/yyyy',
                'fi-FI': 'd.M.yyyy',
                'fr-FR': 'dd/MM/yyyy',
                'he-IL': 'dd/MM/yyyy',
                'hu-HU': 'yyyy. MM. dd.',
                'is-IS': 'd.M.yyyy',
                'it-IT': 'dd/MM/yyyy',
                'ja-JP': 'yyyy/MM/dd',
                'ko-KR': 'yyyy-MM-dd',
                'nl-NL': 'd-M-yyyy',
                'nb-NO': 'dd.MM.yyyy',
                'pl-PL': 'yyyy-MM-dd',
                'pt-BR': 'd/M/yyyy',
                'ro-RO': 'dd.MM.yyyy',
                'ru-RU': 'dd.MM.yyyy',
                'hr-HR': 'd.M.yyyy',
                'sk-SK': 'd. M. yyyy',
                'sq-AL': 'yyyy-MM-dd',
                'sv-SE': 'yyyy-MM-dd',
                'th-TH': 'd/M/yyyy',
                'tr-TR': 'dd.MM.yyyy',
                'ur-PK': 'dd/MM/yyyy',
                'id-ID': 'dd/MM/yyyy',
                'uk-UA': 'dd.MM.yyyy',
                'be-BY': 'dd.MM.yyyy',
                'sl-SI': 'd.M.yyyy',
                'et-EE': 'd.MM.yyyy',
                'lv-LV': 'yyyy.MM.dd.',
                'lt-LT': 'yyyy.MM.dd',
                'fa-IR': 'MM/dd/yyyy',
                'vi-VN': 'dd/MM/yyyy',
                'hy-AM': 'dd.MM.yyyy',
                'az-Latn-AZ': 'dd.MM.yyyy',
                'eu-ES': 'yyyy/MM/dd',
                'mk-MK': 'dd.MM.yyyy',
                'af-ZA': 'yyyy/MM/dd',
                'ka-GE': 'dd.MM.yyyy',
                'fo-FO': 'dd-MM-yyyy',
                'hi-IN': 'dd-MM-yyyy',
                'ms-MY': 'dd/MM/yyyy',
                'kk-KZ': 'dd.MM.yyyy',
                'ky-KG': 'dd.MM.yy',
                'sw-KE': 'M/d/yyyy',
                'uz-Latn-UZ': 'dd/MM yyyy',
                'tt-RU': 'dd.MM.yyyy',
                'pa-IN': 'dd-MM-yy',
                'gu-IN': 'dd-MM-yy',
                'ta-IN': 'dd-MM-yyyy',
                'te-IN': 'dd-MM-yy',
                'kn-IN': 'dd-MM-yy',
                'mr-IN': 'dd-MM-yyyy',
                'sa-IN': 'dd-MM-yyyy',
                'mn-MN': 'yy.MM.dd',
                'gl-ES': 'dd/MM/yy',
                'kok-IN': 'dd-MM-yyyy',
                'syr-SY': 'dd/MM/yyyy',
                'dv-MV': 'dd/MM/yy',
                'ar-IQ': 'dd/MM/yyyy',
                'zh-CN': 'yyyy/M/d',
                'de-CH': 'dd.MM.yyyy',
                'en-GB': 'dd/MM/yyyy',
                'es-MX': 'dd/MM/yyyy',
                'fr-BE': 'd/MM/yyyy',
                'it-CH': 'dd.MM.yyyy',
                'nl-BE': 'd/MM/yyyy',
                'nn-NO': 'dd.MM.yyyy',
                'pt-PT': 'dd-MM-yyyy',
                'sr-Latn-CS': 'd.M.yyyy',
                'sv-FI': 'd.M.yyyy',
                'az-Cyrl-AZ': 'dd.MM.yyyy',
                'ms-BN': 'dd/MM/yyyy',
                'uz-Cyrl-UZ': 'dd.MM.yyyy',
                'ar-EG': 'dd/MM/yyyy',
                'zh-HK': 'd/M/yyyy',
                'de-AT': 'dd.MM.yyyy',
                'en-AU': 'd/MM/yyyy',
                'es-ES': 'dd/MM/yyyy',
                'fr-CA': 'yyyy-MM-dd',
                'sr-Cyrl-CS': 'd.M.yyyy',
                'ar-LY': 'dd/MM/yyyy',
                'zh-SG': 'd/M/yyyy',
                'de-LU': 'dd.MM.yyyy',
                'en-CA': 'dd/MM/yyyy',
                'es-GT': 'dd/MM/yyyy',
                'fr-CH': 'dd.MM.yyyy',
                'ar-DZ': 'dd-MM-yyyy',
                'zh-MO': 'd/M/yyyy',
                'de-LI': 'dd.MM.yyyy',
                'en-NZ': 'd/MM/yyyy',
                'es-CR': 'dd/MM/yyyy',
                'fr-LU': 'dd/MM/yyyy',
                'ar-MA': 'dd-MM-yyyy',
                'en-IE': 'dd/MM/yyyy',
                'es-PA': 'MM/dd/yyyy',
                'fr-MC': 'dd/MM/yyyy',
                'ar-TN': 'dd-MM-yyyy',
                'en-ZA': 'yyyy/MM/dd',
                'es-DO': 'dd/MM/yyyy',
                'ar-OM': 'dd/MM/yyyy',
                'en-JM': 'dd/MM/yyyy',
                'es-VE': 'dd/MM/yyyy',
                'ar-YE': 'dd/MM/yyyy',
                'en-029': 'MM/dd/yyyy',
                'es-CO': 'dd/MM/yyyy',
                'ar-SY': 'dd/MM/yyyy',
                'en-BZ': 'dd/MM/yyyy',
                'es-PE': 'dd/MM/yyyy',
                'ar-JO': 'dd/MM/yyyy',
                'en-TT': 'dd/MM/yyyy',
                'es-AR': 'dd/MM/yyyy',
                'ar-LB': 'dd/MM/yyyy',
                'en-ZW': 'M/d/yyyy',
                'es-EC': 'dd/MM/yyyy',
                'ar-KW': 'dd/MM/yyyy',
                'en-PH': 'M/d/yyyy',
                'es-CL': 'dd-MM-yyyy',
                'ar-AE': 'dd/MM/yyyy',
                'es-UY': 'dd/MM/yyyy',
                'ar-BH': 'dd/MM/yyyy',
                'es-PY': 'dd/MM/yyyy',
                'ar-QA': 'dd/MM/yyyy',
                'es-BO': 'dd/MM/yyyy',
                'es-SV': 'dd/MM/yyyy',
                'es-HN': 'dd/MM/yyyy',
                'es-NI': 'dd/MM/yyyy',
                'es-PR': 'dd/MM/yyyy',
                'am-ET': 'd/M/yyyy',
                'tzm-Latn-DZ': 'dd-MM-yyyy',
                'iu-Latn-CA': 'd/MM/yyyy',
                'sma-NO': 'dd.MM.yyyy',
                'mn-Mong-CN': 'yyyy/M/d',
                'gd-GB': 'dd/MM/yyyy',
                'en-MY': 'd/M/yyyy',
                'prs-AF': 'dd/MM/yy',
                'bn-BD': 'dd-MM-yy',
                'wo-SN': 'dd/MM/yyyy',
                'rw-RW': 'M/d/yyyy',
                'qut-GT': 'dd/MM/yyyy',
                'sah-RU': 'MM.dd.yyyy',
                'gsw-FR': 'dd/MM/yyyy',
                'co-FR': 'dd/MM/yyyy',
                'oc-FR': 'dd/MM/yyyy',
                'mi-NZ': 'dd/MM/yyyy',
                'ga-IE': 'dd/MM/yyyy',
                'se-SE': 'yyyy-MM-dd',
                'br-FR': 'dd/MM/yyyy',
                'smn-FI': 'd.M.yyyy',
                'moh-CA': 'M/d/yyyy',
                'arn-CL': 'dd-MM-yyyy',
                'ii-CN': 'yyyy/M/d',
                'dsb-DE': 'd. M. yyyy',
                'ig-NG': 'd/M/yyyy',
                'kl-GL': 'dd-MM-yyyy',
                'lb-LU': 'dd/MM/yyyy',
                'ba-RU': 'dd.MM.yy',
                'nso-ZA': 'yyyy/MM/dd',
                'quz-BO': 'dd/MM/yyyy',
                'yo-NG': 'd/M/yyyy',
                'ha-Latn-NG': 'd/M/yyyy',
                'fil-PH': 'M/d/yyyy',
                'ps-AF': 'dd/MM/yy',
                'fy-NL': 'd-M-yyyy',
                'ne-NP': 'M/d/yyyy',
                'se-NO': 'dd.MM.yyyy',
                'iu-Cans-CA': 'd/M/yyyy',
                'sr-Latn-RS': 'd.M.yyyy',
                'si-LK': 'yyyy-MM-dd',
                'sr-Cyrl-RS': 'd.M.yyyy',
                'lo-LA': 'dd/MM/yyyy',
                'km-KH': 'yyyy-MM-dd',
                'cy-GB': 'dd/MM/yyyy',
                'bo-CN': 'yyyy/M/d',
                'sms-FI': 'd.M.yyyy',
                'as-IN': 'dd-MM-yyyy',
                'ml-IN': 'dd-MM-yy',
                'en-IN': 'dd-MM-yyyy',
                'or-IN': 'dd-MM-yy',
                'bn-IN': 'dd-MM-yy',
                'tk-TM': 'dd.MM.yy',
                'bs-Latn-BA': 'd.M.yyyy',
                'mt-MT': 'dd/MM/yyyy',
                'sr-Cyrl-ME': 'd.M.yyyy',
                'se-FI': 'd.M.yyyy',
                'zu-ZA': 'yyyy/MM/dd',
                'xh-ZA': 'yyyy/MM/dd',
                'tn-ZA': 'yyyy/MM/dd',
                'hsb-DE': 'd. M. yyyy',
                'bs-Cyrl-BA': 'd.M.yyyy',
                'tg-Cyrl-TJ': 'dd.MM.yy',
                'sr-Latn-BA': 'd.M.yyyy',
                'smj-NO': 'dd.MM.yyyy',
                'rm-CH': 'dd/MM/yyyy',
                'smj-SE': 'yyyy-MM-dd',
                'quz-EC': 'dd/MM/yyyy',
                'quz-PE': 'dd/MM/yyyy',
                'hr-BA': 'd.M.yyyy.',
                'sr-Latn-ME': 'd.M.yyyy',
                'sma-SE': 'yyyy-MM-dd',
                'en-SG': 'd/M/yyyy',
                'ug-CN': 'yyyy-M-d',
                'sr-Cyrl-BA': 'd.M.yyyy',
                'es-US': 'M/d/yyyy'
            };

            var LANG = window.navigator.userLanguage || window.navigator.language;
            var LOCALE_DATE_FORMAT = LOCALE_DATE_FORMATS[LANG] || 'dd/MM/yyyy';
            var settings = {
                '24_hour_format': '1'
            };

            this.formatTimestamp = function (timestamp, dateOnly, isAbsoluteTime) {
                var date;
                if (typeof timestamp == 'object') {
                    date = timestamp;
                } else if (isAbsoluteTime) {
                    date = new Date(timestamp);
                } else {
                    date = new Date(timestamp);
                }

                var format = LOCALE_DATE_FORMAT;
                if (!dateOnly) {
                    var timeFormat = 'H:mm:ss';

                    if (settings['24_hour_format'] === '0')
                        timeFormat = 'h:mm:ss a';

                    format += ' ' + timeFormat;
                }

                return $filter('date')(date, format);
            };
        }]);
})();

/**
 * @author BjÃ¶rn Wenzel
 */
(function () {
    'use strict';
    angular.module('waves.core.filter')
        .filter('formatting', ['formattingService', function (formattingService) {
            return function(timestamp, dateOnly) {
                if (angular.isUndefined(dateOnly)) {
                    dateOnly = false;
                }

                return formattingService.formatTimestamp(timestamp, dateOnly);
            };
        }]);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('coinomatCurrencyMappingService', [function () {
            function unsupportedCurrency(currency) {
                throw new Error('Unsupported currency: ' + currency.displayName);
            }

            /**
             * Currency codes for Waves Platform
             * @param {Currency} currency
             * @returns {string} currency code
             */
            this.platformCurrencyCode = function (currency) {
                switch (currency.id) {
                    case Currency.BTC.id:
                        return 'WBTC';

                    case Currency.WAVES.id:
                        return 'WAVES';
                }

                unsupportedCurrency(currency);
            };

            /**
             * Currency codes for Coinomat gateway
             * @param {Currency} currency
             * @returns {string} currency code
             */
            this.gatewayCurrencyCode = function (currency) {
                switch (currency.id) {
                    case Currency.BTC.id:
                        return 'BTC';

                    case Currency.WAVES.id:
                        return 'WAVES';
                }

                unsupportedCurrency(currency);
            };
        }]);
})();

(function () {
    'use strict';

    var LANGUAGE = 'ru_RU';

    function ensureTunnelCreated(response) {
        if (!response.ok) {
            console.log(response);
            throw new Error('Failed to create tunnel: ' + response.error);
        }
    }

    function ensureTunnelObtained(response) {
        if (!response.tunnel) {
            console.log(response);
            throw new Error('Failed to get tunnel: ' + response.error);
        }
    }

    function CoinomatService(rest, mappingService) {
        var apiRoot = rest.all('api').all('v1');

        /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
        function loadPaymentDetails(currencyCodeFrom, currencyCodeTo, recipientAddress) {
            return apiRoot.get('create_tunnel.php', {
                currency_from: currencyCodeFrom,
                currency_to: currencyCodeTo,
                wallet_to: recipientAddress
            }).then(function (response) {
                ensureTunnelCreated(response);

                return {
                    id: response.tunnel_id,
                    k1: response.k1,
                    k2: response.k2
                };
            }).then(function (tunnel) {
                return apiRoot.get('get_tunnel.php', {
                    xt_id: tunnel.id,
                    k1: tunnel.k1,
                    k2: tunnel.k2,
                    history: 0,
                    lang: LANGUAGE
                });
            }).then(function (response) {
                ensureTunnelObtained(response);

                // here only BTC wallet is returned
                // probably for other currencies more requisites are required
                return {
                    address: response.tunnel.wallet_from,
                    attachment: response.tunnel.attachment
                };
            });
        }
        /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */

        this.getDepositDetails = function (sourceCurrency, targetCurrency, wavesRecipientAddress) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(sourceCurrency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(targetCurrency);

            return loadPaymentDetails(gatewayCurrencyCode, platformCurrencyCode, wavesRecipientAddress);
        };

        this.getWithdrawDetails = function (currency, recipientAddress) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

            return loadPaymentDetails(platformCurrencyCode, gatewayCurrencyCode, recipientAddress);
        };

        this.getWithdrawRate = function (currency) {
            var gatewayCurrencyCode = mappingService.gatewayCurrencyCode(currency);
            var platformCurrencyCode = mappingService.platformCurrencyCode(currency);

            return apiRoot.get('get_xrate.php', {
                f: platformCurrencyCode,
                t: gatewayCurrencyCode,
                lang: LANGUAGE
            });
        };
    }

    CoinomatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

    angular
        .module('waves.core.services')
        .service('coinomatService', CoinomatService);
})();

(function () {
    'use strict';

    function CoinomatFiatService(rest, currencyMappingService) {
        var apiRoot = rest.all('api').all('v2').all('indacoin');

        this.getLimits = function (address, fiatCurrency, cryptoCurrency) {
            return apiRoot.get('limits.php', {
                address: address,
                fiat: fiatCurrency,
                crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
            });
        };

        this.getRate = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
            return apiRoot.get('rate.php', {
                address: address,
                fiat: fiatCurrency,
                amount: fiatAmount,
                crypto: currencyMappingService.gatewayCurrencyCode(cryptoCurrency)
            });
        };

        this.getMerchantUrl = function (address, fiatAmount, fiatCurrency, cryptoCurrency) {
            return apiRoot.all('buy.php').getRequestedUrl() +
                '?address=' + address +
                '&fiat=' + fiatCurrency +
                '&amount=' + fiatAmount +
                '&crypto=' + currencyMappingService.gatewayCurrencyCode(cryptoCurrency);
        };
    }

    CoinomatFiatService.$inject = ['CoinomatRestangular', 'coinomatCurrencyMappingService'];

    angular
        .module('waves.core.services')
        .service('coinomatFiatService', CoinomatFiatService);
})();

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

    var MINUTE = 60 * 1000,
        DEFAULT_FRAME = 30,
        DEFAULT_LIMIT = 50;

    function serializeId(id) {
        return id === '' ? 'WAVES' : id;
    }

    function DatafeedApiService(rest) {
        var self = this,
            apiRoot = rest.all('api');

        self.getSymbols = function () {
            return apiRoot.get('symbols');
        };

        self.getCandles = function (pair, from, to, frame) {
            frame = frame || DEFAULT_FRAME;
            to = to || Date.now();
            from = from || to - 50 * frame * MINUTE;

            return apiRoot
                .all('candles')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(frame)
                .all(from)
                .get(to);
        };

        self.getLastCandles = function (pair, limit, frame) {
            frame = frame || DEFAULT_FRAME;
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('candles')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(frame)
                .get(limit);
        };

        self.getTrades = function (pair, limit) {
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('trades')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .get(limit);
        };

        self.getTradesByAddress = function (pair, address, limit) {
            limit = limit || DEFAULT_LIMIT;

            return apiRoot
                .all('trades')
                .all(serializeId(pair.amountAsset.id))
                .all(serializeId(pair.priceAsset.id))
                .all(address)
                .get(limit);
        };
    }

    DatafeedApiService.$inject = ['DatafeedRestangular'];

    angular
        .module('waves.core.services')
        .service('datafeedApiService', DatafeedApiService);
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

(function () {
    'use strict';

    function SignService(txConstants, featureConstants, cryptoService, utilityService) {
        var self = this;

        // Transaction types

        self.getAssetIssueTxTypeBytes = function () {
            return [txConstants.ASSET_ISSUE_TRANSACTION_TYPE];
        };

        self.getAssetReissueTxTypeBytes = function () {
            return [txConstants.ASSET_REISSUE_TRANSACTION_TYPE];
        };

        self.getAssetTransferTxTypeBytes = function () {
            return [txConstants.ASSET_TRANSFER_TRANSACTION_TYPE];
        };

        self.getStartLeasingTxTypeBytes = function () {
            return [txConstants.START_LEASING_TRANSACTION_TYPE];
        };

        self.getCancelLeasingTxTypeBytes = function () {
            return [txConstants.CANCEL_LEASING_TRANSACTION_TYPE];
        };

        self.getCreateAliasTxTypeBytes = function () {
            return [txConstants.CREATE_ALIAS_TRANSACTION_TYPE];
        };

        // Keys

        self.getPublicKeyBytes = function (publicKey) {
            return utilityService.base58StringToByteArray(publicKey);
        };

        self.getPrivateKeyBytes = function (privateKey) {
            return cryptoService.base58.decode(privateKey);
        };

        // Data fields

        self.getNetworkBytes = function () {
            return [utilityService.getNetworkIdByte()];
        };

        self.getTransactionIdBytes = function (tx) {
            return utilityService.base58StringToByteArray(tx);
        };

        self.getRecipientBytes = function (recipient) {
            if (recipient.slice(0, 6) === 'alias:') {
                return [].concat(
                    [featureConstants.ALIAS_VERSION],
                    [utilityService.getNetworkIdByte()],
                    utilityService.stringToByteArrayWithSize(recipient.slice(8)) // Remove leading 'asset:W:'
                );
            } else {
                return utilityService.base58StringToByteArray(recipient);
            }
        };

        self.getAssetIdBytes = function (assetId, mandatory) {
            if (mandatory) {
                return utilityService.base58StringToByteArray(assetId);
            } else {
                return assetId ? [1].concat(utilityService.base58StringToByteArray(assetId)) : [0];
            }
        };

        self.getAssetNameBytes = function (assetName) {
            return utilityService.stringToByteArrayWithSize(assetName);
        };

        self.getAssetDescriptionBytes = function (assetDescription) {
            return utilityService.stringToByteArrayWithSize(assetDescription);
        };

        self.getAssetQuantityBytes = function (assetQuantity) {
            return utilityService.longToByteArray(assetQuantity);
        };

        self.getAssetDecimalPlacesBytes = function (assetDecimalPlaces) {
            return [assetDecimalPlaces];
        };

        self.getAssetIsReissuableBytes = function (assetIsReissuable) {
            return utilityService.booleanToBytes(assetIsReissuable);
        };

        self.getAmountBytes = function (amount) {
            return utilityService.longToByteArray(amount);
        };

        self.getFeeAssetIdBytes = function (feeAssetId) {
            return self.getAssetIdBytes(feeAssetId);
        };

        self.getFeeBytes = function (fee) {
            return utilityService.longToByteArray(fee);
        };

        self.getTimestampBytes = function (timestamp) {
            return utilityService.longToByteArray(timestamp);
        };

        self.getAttachmentBytes = function (attachment) {
            return utilityService.byteArrayWithSize(attachment);
        };

        self.getAliasBytes = function (alias) {
            return utilityService.byteArrayWithSize([].concat(
                [featureConstants.ALIAS_VERSION],
                [utilityService.getNetworkIdByte()],
                utilityService.stringToByteArrayWithSize(alias)
            ));
        };

        self.getOrderTypeBytes = function (orderType) {
            return utilityService.booleanToBytes(orderType);
        };

        self.getOrderIdBytes = function (orderId) {
            return utilityService.base58StringToByteArray(orderId);
        };

        // Signatures

        self.buildSignature = function (bytes, privateKey) {
            var privateKeyBytes = self.getPrivateKeyBytes(privateKey);
            return cryptoService.nonDeterministicSign(privateKeyBytes, bytes);
        };
    }

    SignService.$inject = ['constants.transactions', 'constants.features', 'cryptoService', 'utilityService'];

    angular
        .module('waves.core.services')
        .service('signService', SignService);
})();

(function () {
    'use strict';

    angular
        .module('waves.core.services')
        .service('validateService', function () {
            var self = this;

            self.validateSender = function (sender) {
                if (!sender) {
                    throw new Error('Sender hasn\'t been set');
                }

                if (!sender.publicKey) {
                    throw new Error('Sender account public key hasn\'t been set');
                }

                if (!sender.privateKey) {
                    throw new Error('Sender account private key hasn\'t been set');
                }
            };

            self.validateAssetIssue = function (issue) {
                if (angular.isUndefined(issue.name)) {
                    throw new Error('Asset name hasn\'t been set');
                }

                if (angular.isUndefined(issue.totalTokens)) {
                    throw new Error('Total tokens amount hasn\'t been set');
                }

                if (angular.isUndefined(issue.decimalPlaces)) {
                    throw new Error('Token decimal places amount hasn\'t been set');
                }

                if (issue.fee.currency !== Currency.WAVES) {
                    throw new Error('Transaction fee must be nominated in Waves');
                }
            };

            self.validateAssetTransfer = function (transfer) {
                if (angular.isUndefined(transfer.recipient)) {
                    throw new Error('Recipient account hasn\'t been set');
                }

                if (angular.isUndefined(transfer.fee)) {
                    throw new Error('Transaction fee hasn\'t been set');
                }

                if (angular.isUndefined(transfer.amount)) {
                    throw new Error('Transaction amount hasn\'t been set');
                }
            };

            self.validateAssetReissue = function (reissue) {
                if (reissue.totalTokens.currency === Currency.WAVES) {
                    throw new Error('Reissuing Waves is not allowed.');
                }

                if (angular.isUndefined(reissue.totalTokens)) {
                    throw new Error('Total tokens amount hasn\'t been set');
                }

                if (angular.isUndefined(reissue.fee)) {
                    throw new Error('Transaction fee hasn\'t been set');
                }

                if (reissue.fee.currency !== Currency.WAVES) {
                    throw new Error('Transaction fee must be nominated in Waves');
                }
            };
        });
})();

(function() {
    'use strict';

    angular
        .module('app.ui', [])
        .constant('ui.events', {
            SPLASH_COMPLETED: 'splash-completed',
            LOGIN_SUCCESSFUL: 'login-successful',
            LEASING_CANCEL: 'leasing-cancel'
        });

    angular
        .module('app.ui')
        // actual values are set in the application config phase
        .constant('constants.application', {
            CLIENT_VERSION: '',
            NODE_ADDRESS: '',
            COINOMAT_ADDRESS: ''
        });
})();

(function () {
    'use strict';

    angular
        .module('app.ui')
        .service('utilsService', ['constants.network', function (networkConstants) {
            this.isTestnet = function () {
                return networkConstants.NETWORK_NAME === 'devel' || networkConstants.NETWORK_NAME === 'testnet';
            };

            this.testnetSubstitutePair = function (pair) {
                var realIds = {};
                realIds[Currency.BTC.id] = '8LQW8f7P5d5PZM7GtZEBgaqRPGSzS3DfPuiXrURJ4AJS';
                realIds[Currency.USD.id] = 'Ft8X1v1LTa1ABafufpaCWyVj8KkaxUWE6xBhW6sNFJck';
                realIds[Currency.EUR.id] = 'Gtb1WRznfchDnTh37ezoDTJ4wcoKaRsKqKjJjy7nm2zU';
                realIds[Currency.CNY.id] = 'DEJbZipbKQjwEiRjx2AqQFucrj5CZ3rAc4ZvFM8nAsoA';

                return {
                    amountAsset: {id: realIds[pair.amountAsset.id] || ''},
                    priceAsset: {id: realIds[pair.priceAsset.id] || realIds[Currency.BTC.id]}
                };
            };
        }]);
})();

(function () {
    'use strict';

    function ApplicationContextFactory(constants) {

        var assets = {};

        return {
            account: {},
            cache: {
                assets: assets,
                updateAsset: function (assetId, balance, reissuable, totalTokens) {
                    var asset = assets[assetId];
                    if (asset) {
                        asset.balance = Money.fromCoins(balance, asset.currency);
                        asset.totalTokens = Money.fromCoins(totalTokens, asset.currency);
                        asset.reissuable = reissuable;
                    }
                },
                putAsset: function (issueTransaction) {
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
                },
                getAssetsList: function () {
                    return Object.keys(assets).map(function (key) {
                        return assets[key];
                    });
                }
            }
        };
    }

    ApplicationContextFactory.$inject = ['constants.transactions'];

    angular
        .module('app.ui')
        .factory('applicationContext', ApplicationContextFactory);
})();

(function () {
    'use strict';

    function CoinomatRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.COINOMAT_ADDRESS);
        });
    }

    function DatafeedRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.DATAFEED_ADDRESS);
        });
    }

    function MatcherRestangularFactory(constants, rest) {
        return rest.withConfig(function(configurer) {
            configurer.setBaseUrl(constants.MATCHER_ADDRESS);
        });
    }

    CoinomatRestangularFactory.$inject = ['constants.application', 'Restangular'];
    DatafeedRestangularFactory.$inject = ['constants.application', 'Restangular'];
    MatcherRestangularFactory.$inject = ['constants.application', 'Restangular'];

    angular
        .module('app.ui')
        .factory('CoinomatRestangular', CoinomatRestangularFactory)
        .factory('DatafeedRestangular', DatafeedRestangularFactory)
        .factory('MatcherRestangular', MatcherRestangularFactory);
})();

(function () {
    'use strict';

    var SCREENS = {
        splash: 'splash-screen',
        accounts: 'accounts-screen',
        main: 'main-screen'
    };

    function HomeController($scope, $window, events, applicationConstants, utilsService,
                            dialogService, applicationContext, notificationService, apiService) {

        $scope.isTestnet = utilsService.isTestnet;

        var home = this;
        home.screen = SCREENS.splash;
        home.featureUnderDevelopment = featureUnderDevelopment;
        home.logout = logout;

        var titlePrefix = utilsService.isTestnet() ? 'TESTNET ' : '';
        home.title = titlePrefix + 'Waves Blockchain';
        home.version = applicationConstants.CLIENT_VERSION;

        $scope.$on(events.SPLASH_COMPLETED, function () {
            home.screen = SCREENS.accounts;
        });

        $scope.clipboardOk = function (message) {
            message = message || 'Address copied successfully';
            notificationService.notice(message);
        };

        $scope.$on(events.LOGIN_SUCCESSFUL, function (event, account) {
            // putting the current account to the app context
            applicationContext.account = account;

            NProgress.start();
            apiService.assets.balance(applicationContext.account.address)
                .then(function (response) {
                    _.forEach(response.balances, function (balanceItem) {
                        applicationContext.cache.putAsset(balanceItem.issueTransaction);
                    });
                })
                .finally(function () {
                    home.screen = SCREENS.main;
                    NProgress.done();
                });
        });

        function featureUnderDevelopment() {
            dialogService.open('#feat-not-active');
        }

        function logout() {
            if ($window.chrome && $window.chrome.runtime && typeof $window.chrome.runtime.reload === 'function') {
                $window.chrome.runtime.reload();
            } else {
                $window.location.reload();
            }
        }
    }

    HomeController.$inject = ['$scope', '$window', 'ui.events', 'constants.application', 'utilsService',
        'dialogService', 'applicationContext', 'notificationService', 'apiService'];

    angular
        .module('app.ui')
        .controller('homeController', HomeController);
})();

(function () {
    'use strict';

    angular
        .module('app.ui')
        .controller('splashController', ['$scope', '$timeout', 'ui.events', function ($scope, $timeout, events) {
            NProgress.start();

            $timeout(function () {
                NProgress.done();
                $scope.$emit(events.SPLASH_COMPLETED);
            }, 1);
        }]);
})();

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
        Currency.BTC,
        Currency.USD,
        Currency.EUR,
        Currency.CNY,
        Currency.WCT,
        Currency.MRT
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
                            self.balances[Currency.WAVES.id] = Money.fromCoins(response.balance, Currency.WAVES);
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
        .service('bitcoinUriService', [function () {

            this.generate = function (address, params) {

                if (!address || typeof address !== 'string') {
                    return '';
                }

                var uri = 'bitcoin:' + address,
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

    var prefix = 'Waves Blockchain';

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
        '2udT6qcXrYNdkwAqY8ZLGUJtL9UCno6bWsx5YoHpcnqo': true,
        'J1yTiGyAd8eJHyZfP8DgNS8mdLgtNx7XFSTVrYPb3jn8': true,
        'FL5GP3bHr5BuCrLGjvFGwkBJgny6JYfqwjg626HUEDZU': true,
        'AM8mTdrytkFYHKuLSJRkoW27ak91pZKH6e9FLVvSCsEe': true,
        'J9BFrBzftppntpaXcM1XvXVZAh57KYv9hJkDh5cu1Cwi': true,
        '5sjbUm4XnKqTvZXg7YiCXMCv1C4DMpZHYEpKBPjj7N9R': true,
        '4dtQEjtBEeQtn9UvUp8SbJfxn28QCFK9yyo76kzq6dRf': true,
        '36WSpKD32i8UGv1Zsrtk2Q2iy3kKq2vwDypxvXmo4xkX': true,
        'A2w8MWXaC65B8Hohc4c3nAuRGuXabsxpogfHFyzm1AjF': true,
        'HVebepPof3vKwbr1LbYVd7oDZFWK37XzLjeQ9xkZka3t': true,
        '2VejsfXiZMipddxfUJk8am5x8RaBJs8MSu7fBhRefciV': true,
        'GMCTEsxAVpbN6Nfch47hEkTEDkbDS7Hztt9L53wv4FEr': true,
        'HsspRGd6LAQNcKRSmNrxezn5y5z8mb2r8hJPzXajKYk1': true,
        'Bc1E1gvmfHNunxUJu7KUw5QHpb7iUpJbPtdzSnoejpiU': true,
        'D8WtEC7ZhE9MFtaHWDuYHCKgk5g4QbnJHrmMXcDJMA4i': true,
        'EZA5TwraueJXAYtJkmAMC7ZLYMXtPtGu1wheysFLWok4': true,
        'HuentKys2G44YqPX9uGQSoVkHFdfEKwhXXAKU8o3jned': true,
        '7sXztNhcBzGpg5PY4nLMwyBh5tZL2Ld4Eenm9TFrTgm5': true,
        'BFP4XuHU3UFiMf3dqE8Awvvry16N85JjG1mwdr3eC8wa': true,
        'SgrQWEjtLZ9C8HiYT1UsygW9q3RyhxZ7n4b3Qjhmih7': true,
        'GABEkA51DqYAEmTcEGNMEnv2ZR2cLLJ7eHG22r1ryA6m': true,
        '4o9fUYVMpXqCCgN5hSpyePLW3T8RpLo3J2KJp3r9Eg7E': true,
        '2bdYJZUSePx3VD2TfCzUju1vhDJRHHFXEGcvH1X24XDw': true,
        'edJWD73LCcnGWqtHdmAXx28V7KeNa5LLRV3tePQFW5u': true,
        'Fa1KnaevGEmVspj8oeZYiNZ3VU9UPo5Kmw7GBXP7s4iy': true,
        '3nBCib3iNrgNTzXhVAT9uyo68RyZonQKwatYKAgp2J8e': true,
        'HAAGD8CJpRaSaSev7FVeViaqY7FPvPoc6iEPVnG5PZ6h': true,
        '2dqKaLYS8fGBckLmuyULHiNnYNWQxBkB8ehnfJ69EXa4': true,
        'DoHN1xUDX8NkArj9b55XN74c11YZmHfTuqsufsRhn8a1': true,
        'Dj392miTh3HvZ8W45XqENeS64bgjeHp6QV9NC6MDC11x': true,
        'GUBasJovm6Gfx4xiVAJGWpQT6VZLCnvf12RFeZMqCe1w': true,
        'H9TEXfm8fAEGf7LuR7x9yVF3FzdDSVrT7Zgkus72MELH': true,
        'HscfxGu6vFkBudY8qJcU18cN3jcizRxuYTgGMNcCMJ3G': true,
        'JBFbyB6mTqtPQjRspX8DukCTmVyeTT3CAzxLBixu4S6T': true,
        'GwbYtXg3CguBnTQQWrpaSe8DJVFA2gwBwqDaKom3b5EB': true,
        'EVnho8p7jwKdDUY4UBHknwaF4QVxYCMDNCNJNweShnYZ': true,
        'CbqcrpSt38A66guCVKnaqZrccc4k94zHudZWEiuEgk1s': true,
        'FhbGXSd34aGdBBEeyS2xNQKWT67tdH5rKtDLMhohACXT': true,
        '5e2e5jSTrdrBteCinSEMnE83bfZMUdkX8GYC7ngs8QJ8': true,
        'd8hq5dJER5rQSQYJn1n5YSm9PqoihkW4uZAutEKxgBo': true,
        'C6vVwAqtk9Ewqh8BkxG7kR7bnz1MocUXiPQ9DxrTyydQ': true,
        'HmAF5UKu5DeALjJBb4tKeAaCTHMAVTEKkURjpZbESf9Q': true,
        'E56U1YKyPMBFFxxNZdnVXox6WTrS3MBtz38gLAwJj3mR': true,
        'H9fSnpiDLVMM4E6wR3RbnFDd9zVyVSCRipxYamEy3dtS': true,
        '2QiYn7J3BSJFybQMH7GLEx3oaWBCwopCHnQvJ8FetGkF': true,
        'DAxfPrTeLw1zsbrqyxFEe7rB1zHxU4hYwnvAqfRnVUvB': true,
        '8NPsVsbMRR7TJFVsmnnwC3UXrgtRbu4NXSPxebUqYFhE': true,
        '5AAvv98XDTJork9PNqytcmEaGrAAFn2rf3PqshMsaFud': true,
        '7ZvCXvjtwW9CmtYRfsKwpSEsT8XL88SYVH68y5xvWvBs': true,
        '4ngdLTkAxvRMe9jBnso8KEJFKZZyN2uWoPqSmmgt9LSA': true,
        '7Zg4Uice9dEL5vVbZzesoXybUEsnG2u8bk1jqpbh7HQp': true,
        '9mWVEyzsFw5Z4rSLWMFGGj6hEEa7PZoqdndo9xEMjKsW': true,
        'Gt1LemMvUn6WhsuX3XH1wAh3t3bC6vheaZTVA6b5zW7D': true,
        '7q8DjdQw2tpc27mos3LZJNpmCcNbXDsrqLdSpZgdq1tA': true,
        'BqXQXTZB31MxX9PdRnv3Jhy3NfAB4c7mgGui6EVvQ2cT': true,
        '45E1gAaWwiV8aWb78QYTBZezcZbvkwsYeghcGNwsLL4w': true,
        'F2i5DSN3Q3RxTCcPTYrKAjULMtGssZBuLBZgQ2AzPBZh': true,
        'FxNkh3gT1aKyFGkodw2cHfF2enqxkus1wnwRYT9QZaY2': true,
        '9S5jTZjeKqTTknyzJgJa3XJRck5Asbtk7D3HgS38SG4C': true,
        'H25E6Ri2Gq8hpbuGaLSySp3EZocmztbwug5qiAfhXH7E': true,
        '9pe8xstegAXTPfp2rRCwHQMQDQzDqQvFZMm239sBsxYi': true,
        'Hgr6MREJ4TcGwYRgmtbDWme9cA4Me9hspJn5ZZyqDRwT': true,
        'BiBP3YT9Y58WcCJchKAci5VoVHKvDbokMUbyaGCYXJQc': true,
        '53FqdPPTummNhGi6UKCdcu4iK5Dg3NRgPHmeUJwPuUdL': true,
        'DgpNjwKJe2BRkGS6ciuXAZStRhpnt9nAAoMfN6qamfP6': true,
        '13KhAFU5UzKmh4eyzgggsN5i2b86Sm95dMM2XNAsccbq': true,
        'FaJ3k94SpAVhjqjbe2gsHUAV8eL7HsYYCJZ1vFAmDtuZ': true,
        'Aa5Y5qrE8gUPdt6gPMxKdZ1daQ3EkfFpKsvMt7YpHDeP': true,
        'AkzHbD4bdUUW58hELrwMU8GrCrvaMhECvM2i39YVSf7p': true,
        '5zEwJpdKZpnJ4tyNeH8Z8nizDREcHqsTr4z4bfob4ths': true,
        'ABzFAmjJnN7DMd4M3QiXZjv7jFFPDMxsm4CGcpUaHhdj': true,
        'FW4xm522Vn2PFEUHajbrYaRkf1Gz2oFsvzzaXevqhHiY': true,
        '7W27LPKgZ7mJ1ieKQqi4LbeServHHqN34QCgkYYrhMD1': true,
        '9ErgdZqQoR6kfAJVdKtFNCGJ9EYddva9MdPbow2CY24x': true,
        '94YZDcqjDUJF9DFJA8uj2kzKGKx1ExVgWyzCJsxWFE7g': true,
        '4MMY1wpeK615BVXp4gyPxJzacCeJCwr8cDUFzJTYhqKr': true,
        'CEH3nW4JnJJJi7xm4THizhHU1aPNBf9XBFnKXWBJ11Vs': true,
        '3AmuunR3hCh5JqiRC5zyJiVGCJWooNxVuKMBhmgDMX47': true,
        'DBfjT5YhQTpoRV7dWjq1Sex8JCkdkDtZNorQpXrJ8anV': true,
        '8FqFiEf6jJFtWZKtgR9UVpF7Pn2jG2t3YwBtXfkd2DVC': true,
        'r1SgTEYZzLRfL1JPGAMQNn4Fir7aM1gf7XHbjNm66Tx': true,
        'CeFjjLBxhpj1vsF832KC6SXEHicc1a2gUJMzaAZGHUJ7': true,
        '5ZUsD93EbK1SZZa2GXYZx3SjhcXWDvMKqzWoJZjNGkW8': true,
        '5Wkidywwzdbig7YXMVXrjSSahjqUsrLtHXEB9ukHYmU9': true,
        'G8VbM7B6Zu8cYMwpfRsaoKvuLVsy8p1kYP4VvSdwxWfH': true,
        '7kGHHwajmBXYRAzxbh4Luy8HpZ4eCcEfuq7oXaiQfyYR': true,
        'Abx3qz6CLsnLdM9aiq2YmePbJb5mmPbG7rnKDgNr8hbU': true,
        'BVfprn4fUKcCTyuX8RTCfF4gTQWWSx5otjC25n2AbpBe': true,
        '98SM9GE27QtXoWyaFzjXKQvk8kXcix2mw31RCWUxSiMN': true,
        '4s5RC4Ghrkbu22v6JTM7ypnBJNMp8TtpCnoDjEbhuukU': true,
        '23d3HjQ81cM2JDTCHyc7egj75xEYfEW1d5YAcE5oRgiY': true,
        '4kVGzDz6VkdbiXy71Ee4LKmHDSzgKCC8qxSsTfTXqptW': true,
        '618LWpYBbSTv5cQWok9duszHNma532L6r6JbH9R39SQz': true,
        '984mPD35vrA5Pfcuadqg8BUFNFjcUDpU3iadUWVt9t28': true,
        'E4ip4jzTc4PCvebYn1818T4LNoYBVL3Y4Y4dMPatGwa9': true,
        'TMrsMupcScG8KNosP7L5fndan4se2jqywB7ArTDzVfJ': true,
        '6xbMnPgBv9urTkFTvU9vn5CxJPCpNtdWQ2GFYxqNboXP': true,
        '82Rn4aTBeLdAesgBtTCoQDA2N9NRReqBdC4M6REPo32P': true,
        'Ea8CopxHo5cuxZW7HwfYq9cwmpFpty73xtA3yCaAMnn1': true,
        'ArHwzvvBpyrZKXomB47TRmK3ZT9nZ5zaVK6fwUALqjTe': true,
        'CbK9GtTpwnQoia2bkuNopWybLA3vabmV95Lp1bLznVfr': true,
        '8A4PwMaQDMHqEtHNQMkK7skVnNp2AWTK4fW3kyNcNk94': true,
        '6AnChL44kugXpJKEf2AKvYPumvmEjqjKSTiAHfvtu9C4': true,
        '27xw1ADnQogqHyN8AB5a72EF1RjDpFVQPZBWGF23ohbu': true,
        'CZy399EhWWsPbDpNWWxpYUiJsdA72CrL5M9Nj13j2SBP': true,
        '4CSDbpzLgjT4xQKeQhjAY3nUTfX6UkujBKohLGqifDzS': true,
        '2kpFVHhYosCiGg4Z6r5TzMVn1R2v8EkNFexEN8cRfiHm': true,
        '2p8fSvttcmeZsL6GNqm1GvhubmkEstjjr6dS3wzqGTdj': true,
        '8XSL9XppR3xd4wqUcHjvhWK98Jkh7B21qd4ksR7hNanh': true,
        'F22NRdfLAdfypzn3h8tXzmwdLCCuxqWZ7gEqEbapyBGE': true,
        'A9noc212nU4YFXENQjoEkLAmYg6vSrNHRte5PzRqnTHT': true,
        '9ieyUBh5d4HEzGkj2ZB8cUR5xcaTofGs8wgSLQh46LFU': true,
        'E6tDdYmbBs62buDXpTg51VsD443Z4uALre1Do5w95Q8a': true,
        'B4PaRFQUTRBFu1DbNPuRxxTvBEwTJjAvRQZuNMnQeMjQ': true,
        '6R1s2mvUmfYoggfGTJd5hnH27XmvsEt8MAS9bSmP4pjZ': true,
        '6o4RBdBs7Xvc1EcwaZb6U5MXJtbLCEbAv5ozMJcCGTEy': true,
        '2awpJzkVFVQ4eZTo7aMKZtJiwUY1xeWmXpafctzsXtdM': true,
        '3CTXiTYt3KdS7an6GZvCMpjPjVDiCc8xyxXEYcKBKMdh': true,
        '5usJF87fbTWxKrm3xfpwhdCJteNWSJVDxTUbfJGf4wJ': true,
        'CQcPZDo16QWom2meUhJ5TfZXKYidK4bDNvcG58DWUNgQ': true,
        'BCubnnUvYbW8p4QfiT1Kn9cPbmGe2pFP2PUWo64T825': true,
        '7k7U6JMMuGVn87vRiFnhBTApYieBmSrh8L1t8mdoLTmR': true,
        '2Z77ZxPQJcJRCvBUJzcpSFpzngMfMUhLq6vjpCFcSW1t': true,
        '4bA2jqSidTATvrb1a18c7E3sXa6RP4t62B3VWLQ6hWPM': true,
        '5EBSLu5s2EvaV4PErmG5XaTMhJVDn7FhUt3R8WBRUQH4': true,
        '3jMsUtXbx98S2b51H3qzZrRfULB6TwAsJLiji4LyDTNF': true,
        'A1DX3CnM6GNYnWh9Yp3hnwGTM88ztN5pXPDAFT4ihmxS': true,
        'Ba9WAmZf3fcshpcwbVwC2gub6Y87Y9D5TJ8HrBexjtzP': true,
        'C88YAd1K9TW8t61oi7S4PghhWpBviUrr8PVUGPdoGAdP': true,
        'Gysdrp9KJaPDEQMdCPcz7Vdhha1ff6xJ9uEeZPfQSxQp': true,
        'Ftim86CXM6hANxArJXZs2Fq7XLs3nJvgBzzEwQWwQn6N': true,
        'TrhDxSdzxaypDx5ac9RnqSieVY8BURsLyLte2GaSCXW': true,
        'DptxnwX74V11CehAq8PCUg6ZqCZhTkDiyU5QJfbEwR7C': true,
        'FKoSoRwGt8UTcL6y2fMDUcJnXic2PqLsoTYi6JsLZGU8': true,
        '2haBKobL2CznBwMZ9DUxNk3JExYwKVdimW9yGdGBp11C': true,
        'BuaJGc3GFjZWLphrhNse2CC6jkqnFpZbQJn5ytMsCmY8': true,
        '7GokiT6g5skTMu5dpYkRJ5AsNgzciPmiqKsr3a9rQDLS': true,
        'AnTc35anQ94S1ygg9GymJPkwCjC7uwje8yVT61Ai8mm4': true,
        'ECHXaaLKcXJbAeuWBMx1W7NoF76jMmj8qVGLLxsA7BxG': true,
        '8eoweAfo4xwrMpMNiAygTyn7JKKKxDn9d9PM1Hrm6L6m': true,
        'EjroAQsBbaN7cgzsKAchrHDMWsDJZJrNgus2CHRtAFhw': true,
        'J1kYLiTPZkW3bueJQfKLRMJAnfqgSJVYhvAPN6phcRZN': true,
        'RRBqh2XxcwAdLYEdSickM589Vb4RCemBCPH5mJaWhU9': true,
        'FhPhNDMAtdrJC5pje2ZVRRj3AcuFaVwdqJewwgaNxBAk': true,
        '2B13hryog6P8g6serJ5Pw81SC5qoNECtzM4foQKq9Dbu': true,
        'DVzKWstk8E5Fcf4bN7dgYFjQruuNPaqRPEKpzAjEWfM6': true,
        '3CdDG8gxiCzwyAhS1LNGJ2SUNiCbk159sjZyALUe81gb': true,
        'NbhtQy9C2i8m33ThC8X2hSxVKrYeWDWZUVhiuusrLAn': true,
        '7kP18R4fW2nXMiLJXdmnzJCwm24RXHCWFcYATdmjF8sY': true,
        '8YYT4rrvsSjF9PTTLFEiHNCr2Pfe9vgHJe1AkAfnXtCt': true,
        'CNiExygxbLWX8ifvVThSDkj2C4rMRd4cn1T8jUVN8AgF': true,
        'FaxojP788y5oub4K89BYGuA9P8RBLR3N9dTXa5uyFSfG': true,
        'ce1BgQHYH1ett8iNaXU8EKeEvkGkQwbrwLmdEMzdtk3': true,
        'EV7xE17gbrpLqkJAFdEhTNmWz8aknEqwEsRAummLgVbh': true,
        'BK4UZCpgR4UTctD8sJufZVc7WPr2aSDi2Yt8BR1myQKf': true,
        '2U7bioBT2AGaLLAiSx8eQHZy9LZaK9GinZvZotdQtHaG': true,
        '2tfu2wEfR8JU3hdQiNRjFCo6GJHf2zv1oxJ9CKNQ63qD': true,
        '4rmhfoscYcjz1imNDvtz45doouvrQqDpbX7xdfLB4guF': true,
        '7erq7o4yig7eor3Gm6gZ3MiFxQr6oTrcUAt1UhybajWQ': true,
        '284SCnUHpJ1Ru8cYJgDwhF1jgUcJYf2G7MiHY3g3Aaks': true,
        '4pvo1VazbQb8jvvgaAbrXH7NeqfS75PyHB77e2Pozjrf': true,
        'ATaS9qMBvJEGjfk2cAUtu8h7tfi6JYJiV3yKWZAYzBaf': true,
        '7DN9UQqNsfB81ukenGhjC7XTQNByXSqfNemRvmr6Y9Ux': true,
        'ggYRzdUdHLKz5jTitc8DsQcevzDJoyoHT8yEvf4tMdU': true,
        '3MGjhVaEq8A4kBqRPXmaAowk4qYpukkYp31vkMSTYDDp': true,
        'FkSy91PYXmXNEqUrhJYiLVH79dU1hZUyNX2Sc9nJj4vv': true,
        'F8C2EQgNXSf2U7rT72Xtj91Z42rLi26zBcb7xzjJH9cA': true,
        '4WBVEVCxmjopWH9vZKW2kbR5nEwx83fGs8rqRAg7RYbA': true,
        'Fr3KR5z7QMwzP3TsMhbM8P11JgPAE5dL3et1E5QVuL69': true,
        '47F7ct1QiM5FSfULa1DHaTLpp2fWAgvFACqE6LqpCVRi': true,
        'Gt36LiY98qGxxMcT4iHffNiGNSbMQ11qLpcYtmHSoh8D': true,
        '5qX8MgTsZeWY34Wk2vuSTjhkMQGdQBbym8dhtHsfAZxq': true,
        'DMzADx7biq8mgQbaFUootHHnZ4SzKDDnK5CLLQLffuwN': true,
        '4kthdn2D1teJNVSt7yZ72pHcTtLkTXZdGzjTudLZ5fsV': true,
        '762Xf2moiCSWtDuUUfarFd4uwPifa7KDgFdm4EYdCdya': true,
        'CPz844BEEvC8zvdpE5sGzw78tK79CkCkhvW2Hb2X1eAq': true,
        '3y7oak8nrFNWnjWVsH7TKL8poXK4oBEUE24UxKdFwpyX': true,
        'BDtHo2RAh46LnmW9UkTdi6m58Rf6wE1xSq4Q36rLUKom': true,
        'FK5T4YN9RsJ2zgRybgC4h4eNzrppf4iS8R6CWi2ZEhmS': true,
        'ENuguodn2fgKSPvHWoePfMwib8bbkg5mYB2VQxsuFxkh': true,
        '9KFLbN1jQRxVeizvtLuFpugKQD1BBLt7LuA4xgegzzyP': true,
        '59WwhjU5cmm9F41scmUhipaPhCYKvLERgk2vuXT3wjWa': true,
        '7eECraBBEHpjLBNorjSK7onjMoQQ9KVE3xWC1Yqz7V9K': true,
        'DcctQ3GbmBuQjroVHZXWF84r7pNDiyTX6V1bLnvR31sg': true,
        'FWSHXde2wofyRTwwtY9dNKVCLD6ABQ3y7uHHdGHJnNFw': true,
        'HStEjmHZA8S99vffbnKiAAntmWeNLUokM6avx1YGSJD4': true,
        '9Ebw71pBk3SdQpsZ1ppskT3ZiQacpMc4WrRVFFYbNfA7': true,
        '938xsv5inqVVGyeSHhpyp3vyp8yZjEjYG28LCSb7MoZK': true,
        'FvHBG5X8mNRhqB8STVTqFxfzdFn53wSPbLbbPSDiiWBy': true,
        '7ZitWTsLt9nB7a6Wtv9E7a9t4LwPTAz49HwfY3rvCx4i': true,
        '6VQjo7V6Yn1QYhPw3KfK1AqzpyZfja2DkL893qV6gSBf': true,
        'CFtqsFFVM4Jtffe7Sg8LQ5SBvfuq6pWutVyNYeRKBCRX': true,
        'FYzutmZvxpmKifdXEnd51gG89BRqjEkmb6foKeyxumXP': true,
        'ECjtb2bmdEigJnZZF8Kc2Lw9cwL1wNnrmdcEMHqcX9aa': true,
        'FRDc7YX4e2dDxPa5vET1SxJHvcYnvB3euPTedfu7r3QG': true,
        '2xBtifskYbf9ZmTiRY6LDwvj2UqkLmcfAE88XSGJRebP': true,
        '4Aw6NnmkAELqK6FqQVj5nYB5PPt39TSccpFhgFKNYVAQ': true,
        'DxWNidoTpYpDWWxUtotDswdt7BZb8siRGBtK2axUuc5i': true,
        'G6F52cNqSi7v2kuj2anzyKkYgbhsijWvCJDD3WvKzjLH': true,
        'H33ty6LcgkLddm3f6SUSBoWoheqxbAa5jp4egxsjYK4X': true,
        '2sLrLJFr2GF7e9F3HzdFfXDP72tH7zTVEpp7WjB2WjSH': true,
        'GDVd1ohGt2epqUtSyCtQcDsrnVCroe5z6Ab6Ym7jnP5z': true,
        'ChGWDATrVe9X4r8gGBjkgWoDNcSETJenTgUpx3gpDUFL': true,
        'ELDKufAbaqWHWDesrcMFZHriRh3u8ksrCAdzLkPSp852': true,
        'CmTTRrXt537yMjwCkkbJfhX5PF2CYpAkNJgHXmCPvEwT': true,
        'Dap4XoYVF66AY6ectjXR91uqnii3SKQ5DzRSWKxAG3pA': true,
        'CMoidzVwJPEubf8hdKY3hq5MfEgDMLkozKyTewft2BKm': true,
        '3rQqMUxKbvzYRJEGhw9tGRyCChQ3N2cNCmnh1dVpWrHg': true,
        '14BMpn5yg2tCqvfukEFhJLy1Ec9Cus1itCj9eRNX9YR3': true,
        'AbbPHHY3633fmSyyrpuq1HZfUoAPLuZRQfCK4rmbYH8q': true,
        'DrAEzt5tPUxNMKAbEjKVaA4aqYZMjCXGJjw6kmd5M9wz': true,
        '7hDLzmx1jWtSnRAaNntmTJMe6Wj4yy11NAQcZE8ttQit': true,
        '3nrQSCkEtMn4MnDuMk1XLvVfiTbRcmHh16Eywfdighwp': true,
        '83M1Q7H6oaCfYuDbSU7rugjwbPsymJnXuRJiExJKzz9': true,
        'HHYrArLvMQkk7mbDRD6iAkSoAqdoittPBn2wX2JrA7DQ': true,
        '2YEksqZBsVfeJKb4xWb56ABy3KpmSZiuHaMV7Y4qMMeU': true,
        '7zDKXCvmtohw1ULwg1cBARdBytjoCauq7GfdzVag6mCB': true,
        '7YJPyzH6gAmA1J2qNLzWJrm1SV6jESpa3SVEHqcTRaQQ': true,
        '5HpVAmraqK5Qr2bx6SrozVHeWBSugeGQGGvsZ7xMwsh7': true,
        'B1cPEBCzazmyDpnBvt1gZDpnBKRSZzT6BwysgdE4RwFa': true,
        'BWdNqJPXjbVrnFPfhSr5Hgm8f5dbeGXJR86DUiPfwU7m': true,
        '3eHMbKMuHnTnCdBCqBfghKt9V8Ysi2ak6rCTK3gjoFTp': true,
        'H6Pkbr9ca79TkvFPgVyYa2rhsdZ5tLPSARtRWETecDof': true,
        'FFXeqkMviCb4y59G1FBeNAeXjZQkLuvKHJhGXj3Tsi1Y': true,
        '3338Vc9WtTL2TixE7icwb3KQrmHaXDsiSgGbWXrbr83g': true,
        'CZ3bSP7TvtRndoDwGVuhRaLZ5w1sVuxekGu2TNd5vkMX': true,
        '51AsLR7gC8GCRaDhtLXFLk4NFagvRU6unoVCc4HZgRUs': true,
        'GgMWuUPdpFyXgLrbNckoFXSBLYnVQyqqRDtKDS6u1LfC': true,
        '3RSAvjnSj83sFBDZnRZ8LFVivUs4R14fgFbtBHe7jqK5': true,
        '4qL6SW2C2oQCj9cTz4BpPekfo3NwdFJ735cMZHaXTJkV': true,
        '6xR3qMnJxaw3QCHwws9XnN3SY1ra5gGsLwcZiShkPUrf': true,
        'wEThpzq1sLqM6MUSk5fmRNpPRWmpV2u5dnPb1L6PyaC': true,
        '8jhxq3tZYyBWQZVdnckFCPTDQB9tUdNZdjesRJfbb6Tc': true,
        '6NESa2i4GMzrddvGurhvoefj94oH2CWw9L8ysfMDtNns': true,
        'DLN1qvsHDrKCbkXwgQn3yxwekGk4qq6KWpWa63REoz8T': true,
        'QKoBdkNhToPv7hA6KvAcELwabDsRZcuZRWenh7uHxZA': true,
        'EwL8Uxq61R3yqrQbdbbJ9S9g7kQ2ERqnuMnJYV2zDfBg': true,
        '4VobSzRSoU5JujJGovkFErSAGdG3NQwgCzZhRZ85LVRY': true,
        '9WPyeawo8V7vfkrJLF4ykKukagVHLSqXRBJzCu6y6fxi': true,
        'L2MS7xSSPSdQjKLfEP6vjvaxPT9fEskCXfRXRmG9u4x': true,
        '6k3HV5X5oPE64iJgP5S8t4pYuWEiTqWd3ExS42ofiLTe': true,
        '2Rmp4Sjggq5EbKCJjA64KWDeDma2snppsMNa5hd8KKi9': true,
        'DuHV9BnzvPNNrWgunVn2tDarAr2ydPorzz4eCf5sGqbo': true,
        'CzTvYPp6fDteeMGU8VPcwRCAohywugR9TevuAVDLTbEY': true,
        'F1PXUDxQPEzJCFhtfRbesqUZebcm9gVfkea97yYxN5hn': true,
        '4Kwg64q6A1PJg8sraB32ZUu1qPf4VtkehFQS581qkHPD': true,
        'EhhKFkKkPZTEdgCrtJ99qTfy2ZcXHt1rgWeAsg1KY4gQ': true,
        '5CMFniqub5P9SHhMTygH1LQgQ9fLhJtQCxc5RkuU2qkq': true,
        '65e8K8j8RDVh7TS3UBx4s6wXQ79kwFYfDNpFUBEaX88z': true,
        '4AgedbNpeP8dCTCgq2D3kxWtovAVtSj1QApvAhvnTEiJ': true,
        'ADE1YTdFhGjSePcRuDR4jANn1xsGGeSjMC9fK11DE3gs': true,
        'DTpfJ1nvSz5FuLX3J15qh2YSNT8CF1s8rA2E7818TtUg': true,
        '7rCm5e8xzVGWaicxEu764YHKkmG2P3uzLzTwGo7LBgQe': true,
        'AaXozPq8h6q2WopUpA47bhzpMqVDveLzVsb8vfMh3FVc': true,
        'kBthTtTjaKWbPsnKfYyfMcea6fxogYy4wti9QtZfYpV': true,
        '4kuVghXXw8SHqZADPwsekQgV5EnVpVRCVXXLta5ZWuRH': true,
        'AsJLDXxfaFPQKLpiS3XyYGyebeBMxjpEdwTi1VNkQuAf': true,
        '8Yiktau4mPvqBZpWJyCVm6D93jtzB2XVDiEvbzMffFzi': true,
        'HzmLuJiC41AA7uxQJGbvxM5cvpa861pz7iJZwvhhJZ1T': true,
        'FLvk5dSJyPQDK1eVY4fZA1J5yv4THXuUSFGWnta9SBLq': true,
        '9w6jWUPPsjES4yzDR7hN72iWC7Zy5H8hT4jQd4pQzWax': true,
        '9ikpj3HNoTtpx5odmo7KxPhPp65xxVQsgNBpWMXqB9Dh': true,
        'FVtVAEAe5upQULdJrBaLegUK48kCy7nEHtPKMPgfPLE8': true,
        '3KsC9VUPsr5eUuXeDfy2yPNUVdXZcgH3S5dL29U8ersA': true,
        'CuXu8PJHritjGVFpQqmCwnkSfyx1zQgDRunGrLMHNnE4': true,
        'GsCwtr8azHvyuR121fjbzgccpQe1wYtA6uSgz6mJnoVB': true,
        'AN4ZCiYWAWMsn95JP6MxDkcW9iWU8ujbywKPa2kaSNwj': true,
        '54fRzZXwohFqJrm2pe4CW6nWPuMYh112pwPCmHf9a4bs': true,
        'BQ95okgVxvsg6y7BXbRkAjn1hFhCuDRw4F4DSDmzde2G': true,
        'DzeopXc5NCCKARfmAs6cW1Vo5cgVsKg1qJwWwcmm5RmG': true,
        '5Bjya4SiCxv6TeSoiVZmFSddzAVGmmVP4VLLJueYiSnB': true,
        'CwKmdsKYaUDf7s2NSND14i49XZ3mKqtD6ZeHLD582KJ5': true,
        'CVJCJfMuDtwS57ocStDpMWKta7pBSTUpG2Sdr8GvhaWh': true,
        '8E6kvNwyTDc62VRGscGafE2r6B4khBgKvUbbuV8oPZSd': true,
        '2kmcJyhHtcyr1nR4rnkTZ7ktFQqRPZxZKR1JUWjYC9o2': true,
        'G22K585GtGyEptwf35Aj4oWF9cSAZdoTKiEyE4Ppd2WF': true,
        'BrafgsLjbqyJCJ1ZzsAELa5Wu5gqgJBYwR6rwCpGqfT3': true,
        'AeMh3MMygHU8hUMaZJ5MM3DnPknX4JVZXr66GUY5cwUe': true,
        '2G7BzEHv6EmmGst5Kq2YHsommFaK6M8yXz7aG1s6mn5o': true,
        '92aoAFtLUmVBBbpusYoUi6WRM9d2omjyZPCxMkfuDgFu': true,
        '6f3B3JQpXjUKeZw86ncYJuVT44MvVxnkmTxe5SBXqiyY': true,
        'DKnjxjKiLvPU9CnxM5qgKRPsxdWpsmJvdpPDPaTQXy7n': true,
        '3GQ46snnXXkS7ryZ25tXRnxbMjYEGA8UsJcQ9Bs1U8LE': true,
        '8gRMKMYV5ySie1M3kNZmRCCE61Qi8yQgSwxt93xrxDWK': true,
        'HmV1tmRZscQEFgHHmuRCbNosvjaASkXEEPbL18VYQGP3': true,
        '6qHntKymoioQsrNiKGB1EC6QcxmoGLbC5Lvzncq7dnXP': true,
        'CXU4VpVJBcBwP3gPaGfY6Ypt84ki6R1JuNALTXsVMWv6': true,
        'dFhQv5EpMC16hftpAN8wSeHCXVsZa5qPFtjSKTWEwbK': true,
        '8ZYoRPex5tM3iFGWgaizgetDcSnCemSiVk7g3DPTbJtE': true,
        '4UbHcB9CzSuXDnBzTg4FpRTfSmxKrqM8Zb9waDY3g9h2': true,
        '8GRsvYHwQQnc9DpBVKMnRFpvNTnnorFVUnhBRCwTTdSB': true,
        '8kULCTSG9TLdJMqsr3U99nh2z39yFTrRMMxZFyWr6JPa': true,
        '5tm9dpPGnjg5pUeqL3Cb8k1VmtstZm9Yhp2kugzSkrXr': true,
        '45DQRGyhmFArEuXysXRg8U5YdKiAFQoS5mDnXeMbZMzL': true,
        '2HZFzC6kXQGjqnaePE4sPhcLwkn6EvjWKZaNtDCd7BjP': true,
        '8Umd4LUPogBMPs1yfkUYVAunxVmZBYCrSY6yQsJvaaWH': true,
        '8m2Qc7acokKd7kxXr2hJccDSu41WsV8mXR6TywgtobZg': true,
        '5x9cNZFLb3GjqKb2zr85NcX5EMT7Xsh3yE4D2774XYfR': true,
        'DyJR4jNoACaVb188X2qjy3fug6UpZbiHNTmAanRA9wnw': true,
        'AZywKKmtpE3zdLgocXUcHWbadGmZBTs68hAvg7UanCRu': true,
        '8YY9sXXcXRFSg5c656QW6SMJJbHD5uFUv5myY56Q94bq': true,
        'BseqUtiiaA993VJ8TC1FNuzwoRBtTq6vjNnG2eV12Aum': true,
        '5LmQ6W6RafuuuVj4WfSWgRhVKtkBJx4tN5fgpsbL8M9J': true,
        '4o6tETqCTLtrD4jaepshqpiWySCTAMoHRJoDJ7RaJPwA': true,
        'HsmGEc2KrpYgGuR9n3YhrbS8CM3oGH4jgSHe88kZhLdP': true,
        '4jqzW9gNKftMBq9LAsUDQuH4XHCBXKitaUmZ2GJvGUqX': true,
        'F3SmqcYqPj2PMfBXgDoLQfzNGBWbvy394FkVFgwPveQq': true,
        '2BC3B8VKaLBNhWpDd5TaQbCZBRXQk7NraiCkoNW12sV8': true,
        'FjVmnRUyojzT5habjpf1Y5YPQXK52Y19UjtvuD4TwN3h': true,
        'EVigPsELAVYtejvWHVkPXMxjcHEDCUouptdLTPn6FdqB': true,
        'FikYCX1fqYxgWTeRP9X9zYVh2qFr3FjEK5HdQc6eBV6m': true,
        '63M6iPAnbskeXQkvM6y9DR1yB14Usf3XbN1JzzKhgdDh': true,
        '4aFcMPbUpwbfB5q4CxGnd6ZhpHn9ek34xg4PDJVHfQU5': true,
        '4S4SY9uQfbiz8ZvoiQmLJZJ7nE2yygRgdKeWdbEA6yF2': true,
        '8EA6q1y23Je7r35e7M5DnmQ4aW7ceochYaVwxj8AqCeQ': true,
        '4UZLZ68kCc15wv6u2jyDmqek561UpR9fUvoTX8GKXhsb': true,
        'BTCwPHCA1cZYhPjc9VQU5uVc6sT3VTrSvXxyLFpbxj61': true,
        'AkBbcnVqLoCjM1TAf1NHGP27tPUkiWQH2PFFtgenZvvv': true,
        'Ck3G6iRDbDYkeCUMxUeWiBkgeRHwPdHdyXMPWuCZ3JLE': true,
        '24Z1HAkS3My457KncHZPQCsGMXh4oRVUkJqY2rbScPYj': true,
        'ECkogwYXjJ1MGE5LbVNJEZTjAvDB7GEV4ghtjo9eiAx1': true,
        '79N82V1JZQiTEtMtzpYh9wbqLVDTMWWTEmtbgN7bGNZW': true,
        'FjZt3A28NJDAHSzJ8vH81Uv2majBSL6cAf3yJHWppbXa': true,
        '8eD9EvCz2Lnqk3yjnNxojgHP9L43VEFFBDCqFCg6PP5m': true,
        'BawPvKBi82fLKyQNkuD1Ac79FnZnsfUHSgaXXsBXTpas': true,
        '4qNfjr25WAN3qWF48WNDeorZuDzTCKaL94tFeeXaLxTF': true,
        'ETB4yZdb76CCnEMALQ4mGAdQXRJXtbpwpfmra1sB2Abk': true,
        '25aX2wn5ur3SQAkHZfYwsyMaA7mstXduK5dmrrstM3pk': true,
        'NR1bQ1q559BY6So7eGMdxQcAcrqAvgnYAbkK2xdupkP': true,
        'BGN5utHuYxAdbv7hNbgiUxAyJLCzoPT3CQfXVRk8bQJi': true,
        '8YFejBsdbC1NFWvWCMuCSuqqUGJHR4RMF1ZLjJFTb6kX': true,
        '5xi45kwiF6BCLxXv9uwpFX45o72ayFzb3oCmDZWr2xPx': true,
        'DB42qpez9wKAeHuSCztX1orE1aya6RxLdE2gemygpmQE': true,
        'ESZaiCiK8pUZoNzMXky97DqSgMcawYhWUtwTujMUCMLx': true,
        'BcnNZWEqd4SYspfJQaUKuSAWHV2g7vh22xxTrtw3V71e': true,
        'CtpBTD8yAYbtMM7qBRnxGumCUn8oZ1B8sGF9Xt3eRZV': true,
        '64Zqoq7g3kGTMx7DtUS4ZFokufvyxWk3qgEPWGpDrDYB': true,
        '8juYABzCQpA84eroW3WDKzBzNCpNsXihFssqPyWqKjH2': true,
        '9PXWZBeaHu2N5GKNApgRLPobJ9udemtdVU3eFThSi7ii': true,
        'GdAXytdT2TJJsFo3rMJSqk1gi7bo52GLkyUV8sxhhVbJ': true,
        'A3zN326ah5MLukZUqK4YuSxAeEJTFDr6LGdJAc9FLWVH': true,
        '4yJ5mHMu64379qBvB6Sf6RAGuh4wXcKXEX4LcYsE247E': true,
        'HaeLwF1GPHazEX32EF8PR5KgaWH9B4x5wLWnoVZ2pm9w': true,
        '3iAkinWXVwMnDygWvoqvnEDjX4y53dmrqCLwxX5dUy4C': true,
        'N3aWpiMw2iBS8mL28bmQHqAu7gPasagDfsRPicJrFBf': true,
        'AMDYBdHhZBavGio8vmT178RWMcWwPvUBNsFgCfbEda7v': true,
        'EtP6GKtTDbMAuGVPd4cJAsBCBZVQUsyFcHZpcnGdXTBy': true,
        '2vLcSiDBxyJsuqnCqEYSoVZxqxCasLeTxLaqEPySNpAZ': true,
        'CPJTmp9eeZEuv8JynUMdPAsYfWC17yECRtJ8VC7mfocK': true,
        '53QrmBjYtfPvBTpeJN2aFw6ByM5psqMmbH7BoMmUJMCt': true,
        '6ezXJBRhEGR8QySyYgXsNxJs6dKe2KfgAesRkAXttAnk': true,
        '8AA9BtosinXWMcG9ntUFntBqL7LznTGU2vKX8uzAWkpV': true,
        '8cNhFKTjEzLpweYfzwVG2La1ZURki6TgMDtAxFfngykQ': true,
        'CCDWzevXR3k35daPnBWg1owyt5NTteXJEWEJCRzQyEH9': true,
        'AtJS2j3y2D6jvBvY5wqoU9EyYrWt8ekR6G77r8PEAZWM': true,
        '8Y849L5GYT8FRk6uQrGmMcsxXLTtwdnRWeURSX9iFXEL': true,
        '9yTNgraB8y9uR7J2WR4cjBJDC8rCNYRrUMDhfRLvYJkD': true,
        'GRNKxpo287KXo3vWr4wtwZT19KtcXDi1o2saiJUnoZf8': true,
        '7jPsR9No3pjYKfSkhDcafsx5fUKmMGnUpTkte47DwErJ': true,
        'FRhQ4qFRVBJZ9J5s2QtokencnG6niZcFo6ynqbos3eVz': true,
        'GS8HXp1JGaex6R5CASyTya5CLgj5G3qbSko7K4iEY2Yi': true,
        '9PDs1rPDG7znPKrehNcGhnQTTp1Rr46kBQGeETY7YJuq': true,
        'BjLyRMXRNG46yVapUCUqd7BMMzxPx6HzD6C5nJF8kWBq': true,
        '3PXj2KgUw2W2jRPq9fVzZ6wTafs1u26dNa7HREyQXQfb': true,
        'AfUeX3n34282E4jjvhyfccUpTe4VKi8LADX3GLMXMdX': true,
        '2v4WgVzFjaMcqxFw4Jn2cdvjdtxHitEwdY4pkdvRhsLc': true,
        '3XE2en8pq6nWWDjqMiAVoZoGWB8iGK71c8ne7iAvZe5B': true,
        '9d6v1jgQxm75CmcLjwSH5gio6WLd2M3f33q7gzdLP4Xz': true,
        'CEyya9MBD7wMDfj8VWc5RAGkarYXcVrdnfXtutatDQRh': true,
        'CypyDg9G3Z8kvo8ixPWD1gFMUrLFsyvCVbFqvz9Ktji2': true,
        '9GPTDbDxHy56PHSEXdzz83yGZA8sNH3yBMRiDnLw2h5i': true,
        '75nEPbGsvA2LHCdy6xRdSekA4QpNnhgfvX8FaZemg8UN': true,
        'EekUhPpdUJfj3sCMFpYQBWfBfTuTkErkX7m9oq4h5e1R': true,
        'E6ssaiq2mypp5P9eNtwugYADuie5asnshUFqibW9cWmf': true,
        '9ojuFxP8rF9JFZjbdzP4VyME2BBGsd35d6i1AqPeFSXW': true,
        'FZ8Nq79xTgv7Hw3bbAr1dZUVYGZdHtx2yJfVrzX4sUJy': true,
        'DJSbRpERx9TyLo1KGSE2bYSZtTjTaUi68ExCpcjrdsJa': true,
        'BR6PM4xpcpDsHpH49hdq91tW8fLa5mQQC5n4S2MRkhss': true,
        'DJXgVEJQBYZK6rSYs1xNeBsdVDnk3SZ7o7cxocdTzDHM': true,
        'Ad8QQyqu6x8wvKxYCXk8djj7XqG6GNAbhrGbsxv4Ffpn': true,
        'EYFFwWnmEEWYoWgBSqAJFtQxgihMBa5ssntxMsWfDy9B': true,
        'Gh3TZFkQxXBZY4eDyFpZ9eJ6huyJNsRQbb9dPhMv5mzG': true,
        '2yobffsFG2DZz76tFkvdtpFKJhLa5EPv8vhx4qJdYx8n': true,
        '9t4W5bzhskanmwb3Jnm4hHpYJ9HU4Li3JrDw62bV46dF': true,
        'D4pAgd6U95wYbYkniAPdCXCWYjeux5haKSAhnsbJdsCj': true,
        'BkCeh4rnQXL63o5rBu4tm4yMymYi92maofSjuJRPwDFC': true,
        '76TeMjdvpczkZmdDAgWtRB7ezA48AU8GngzQG2Smowc5': true,
        'J3QMS1NAHvJEq8sqdoy23N7JESs3zwM3Yo2CVQrkbJS1': true,
        '3BHW9qoeFyVzgn21pEsVarchKSEDwpPAyF4CAgnTyS8C': true,
        '9Ty1rAYVkWuMrY1168RpCjZBpPwUKC7MxPf5japecqRR': true,
        'FxYZ1rBEFMYRxrT5oBsDvSwa1p4exdy6WSYt1EuZqCHQ': true,
        'BHGaKaRhBuUyHhoFCVbSr5yL2TgAEi2CMU4njZKTh77U': true,
        'BD71JKjgnBWgg46iuBHabj5qgdRPF1LwdLASdpcFFDsi': true,
        '582dBFucANfTGi9xTa5WHuGnBMYYuLKAV29RbpvkYr9s': true,
        'BS8xBiXUbqTwdSmRzHMMioCFPS8t5XoBSaDLNuB5HVjL': true,
        '3PyivxvigMTVhUgh6krJGA3cZuWMm8kXdAGQkDQRXySM': true,
        '7dnm69bRuhfcb6KMdFpgKAN4yByUPC3invELg7wA5W9n': true,
        '8iyXX4HJkTSvVK3KDgL4D9Jcs2b1qbChndXyb172zyvn': true,
        'kncU4RiaZ518gLifVvauuqLEWwPZ8vvehQ564RJ1mG4': true,
        '8CWcfrBeFNkq5tKTpopMGNAm9Vxgu47xeoPkTSH413W7': true,
        'GBPsaqusvnbYLTKYT34ZNN3Ngwa5fNrinRZzkCz3DzLf': true,
        '9qKwneeCP7GoKm1w57hqSjZATsaC4RbYeGnsehGCCDwY': true,
        'CAyBTqxngcwR4X1cyhcZBTwEhrmFAPu7A4jdx1Eiq6pp': true,
        'EeLMX9YyjMNr1gEkZm96Tow9niQezWUVXFWSgWhjFbQs': true,
        '9yxKYyL1TcYrLJkwwKuRa26eQLHVXfFpatqnw8YKpXdL': true,
        '4vV2ZSC8hzADa8Ed4f6mUuSCkreJrCCRksc6NaXhmiYW': true,
        '2q2e8HDAo8LCrwzyhBqfSqcVCnrktfLtf1eo4Tv4kHbz': true,
        'CkzpLpPjJQVDgv9KiNgFCDdPB5RnNrFf28k7F1KD1Cdd': true,
        '4CCMKig8mBwf8XWqr8ibTiai9dRXrYz9Zg335rdNHpvx': true,
        'CkMdwaxgEF4bJgtSAjdPtrhAVkATMrJ8nx7WdGoFW9gp': true,
        'AZmgwcv5Qsi5kDW3aMpDFvc5z45uuTZzL5aCV3Zh6R3C': true,
        'ExSRWiZmjev1doProTiDRCZ6AXBw2fRY46EkMFYkpiTT': true,
        '4VYiGvXMa65aLabxp7QQJ5XghtT4xNKuupDcNBWYmFqv': true,
        '9FJJ33bAFGfM9GNtjnwo9DcxXj2wbTLtTy6jtEXLUzaG': true,
        '6YRA9bgzDyAJsUeqkvedFrYWRDTH66nFocUQpNXN6ouh': true,
        'AvetvbDroZZCRFVfPrZu7Vw8F35ixX78UY8tXY2cpxY4': true,
        'GwBzMfGgdEWV4qQpExBDiq6SYciXy49CjhN4yEmPboon': true,
        'DJrjGjAn1S5RXmgEdsNmKRzydbiieoMHiuEwhDAZJQTM': true,
        '27j711w3gJQ6CWuhanJ3hHmfUAVw3vyKC7J2UwASkBbM': true,
        'GzRFyN9R2rERRPwLXtsGQkua8C5KcyRBGpev6KfZDNTJ': true,
        '9gYMNKegYCCrP83ZPbBUNgSFp5js316tR9DEApqYDkcM': true,
        '9n4jVrNkGgXuFGVBHi2FKoNtrRku8c4Vb1VeKUMny3Rm': true,
        '21WbwYtzzbyVwZFQCvtAfeQjqfeFaDiQUHc7UXvpuphz': true,
        'HaP4xBeFRxqsnr6cCCy4vg41tBFz88KR5pbkv5i797a6': true,
        'GmgQy1b5mPZjP7WQBif11FFLEvtDZhYS4rWMJkpienRR': true,
        'Aq3tcyHnDGB9f147gizQNHxU7Gv5DvniFcBZ2Pg2vu6L': true,
        'HdXCZGiE6w46N1qUsxVrafyzcaW5v8nJLS5DPVLH7hEM': true,
        '7muQiHac3MnmfFPdYZ3ZLnMTQPiZo9JdsfMSf9qmxR44': true,
        'EYDbAbA3mtZ26tbd2fD8eK4BVGw8kYV9jgaHMjEWdBby': true,
        '3fFSVbRJwoYdDG5B2ZHmsBK1Ysnp7J4DRU1HUrFp4jNd': true,
        'ABeFqmHC6KZZ44xPphsNVRq9uTh4Hvr4N3ym59ub9eHo': true,
        '6284oD9Aky3gZwwwqCFEZzvyx5qeeswAbYEtCHcMyKUR': true,
        '44E4VkJiRpsWr2DjKaKuGkZ9vx53tSKkoK2s1BuoQn8h': true,
        'BY3RTSMfzsJ5DhHuQt8JT79r4Aiu5wGotjL8qndsvS6z': true,
        '9X6QhMjKAHtJKbG5HVht5SHZwEkSEynH7FpX4L8q55uf': true,
        '3jTbFG86f7zrg9kfks489AH6Dx7gQsttBndEQzEwFVfL': true,
        'zSyE5dLS8u5fY7WTCcuf7QBZdDLBYjRx6xQC6ttxDmv': true,
        '4DUXpnZgdsCzcKoEZA8FjPV49pQ3PMd6TAMGy6e4PpSk': true,
        'DPtte3bqCoFZj1zvvrqU7jWzYxUwwiWTqiBjhQrHhP2s': true,
        '4uj97MarwtrD4Mi3EU7Bo6FNSaTu1ArXJjgEyAMFncEo': true,
        'AyigM5nzcFXFUDg7m77Z5TpevaSsNSoTKPfBS6GGSfsw': true,
        '6hMyeSHXCGUHv9c9u28NYwkunCU3sGmnwFMnYMoaEpdv': true,
        '7iuKMcC6TKnwipSMZFRTQNh5kwpEU2F8h8wB569qhekf': true,
        '8MNhGjc8cWfQZHNdFigUApW8od33MEyWd2t3bX5Cjyws': true,
        'AvCtgrg8WViE1F2ujqVSp7KKX6B88FAycJjerLNoKiNi': true,
        '9WxewW4u1eqAZYbm97yh3vmixrnCVKyNwjNk7xbUBZum': true,
        'DxGtRvGDwjaDvmKpVHoxbD7tFoouKAqmMRgEEULv4Wh2': true,
        'E5dkwE4Cd8edDMSGWvo1evpaDva2UR1NBEhN1idxfjoj': true,
        '2aN5sxTbjtoZziX9iCAyanrtDhCfNcPyRqdpnEHNppdN': true,
        'HPT9S4y7tJ2JxS39GMm1cwqA9F9qZGZH3TxFpHkZMLo5': true,
        '3rMkXpCzDBRztrrB95cksc6F3bAafDBzavJe4efDHMbe': true,
        '5TZm9rMrzxK1Nj5cQysCYwN3DWQVziXfrwuttWCdVeoN': true,
        '4mUMzSQCkxggoZDVHMWYAPvMW5hqt4eMgiQXM86kHpys': true,
        'UDQtzGA1UYknXoyiRRgvMN9SEQ5hrH6j9h5MdxcofsL': true,
        'C4og3xw7CFHunvR6Mn5zNqVm9VRgQsNinSboHszHJ3JD': true,
        '2XBKnxY3FZQ2vWZvKowN6Mzvgc3rNcMJQHwoGLtvXb19': true,
        '2jrrxnt44pjtuqajaDio1ZT4rkQ9BAtUNMAAmey9tWyK': true,
        '91amqWUR2FFEo6a9qL8MybLPB2sQNeJinbKWFnwWD93P': true,
        '95RNmqEUPYpQ7tzSVCFxRnGCCgYU2BASsHzLAuaJMKhz': true,
        '6y6s2YYVqV4hHCuSfowKj25WDeap6vpKWFHRbC2sCqLR': true,
        'FWNNWyw8GGbKT1E21UrRs6cnnkSGwXqUXrZsEkbTvFiY': true,
        '4AZYFaeNEV6yphs7n4f3EgE66upsUkXhYBXjNyRb1oX8': true,
        'ETamRzLxgNVkVAa7BQ75rruEEzknGyLhUfNu2ZRE4Mxi': true,
        '6K5BmMrRpXNZkFwMNizF6FLVNVuy9aooyL33PkYaQe9t': true,
        'CQxU2vCsyGsfnv1YotSq7xWFTdRanBdB6kZvbcnMBT39': true,
        'FinkKzerMSjjRKXbsTmJAeowLkp5rHeWKE6Hc8BNADVV': true,
        'J3EZ1XLmZLZKexaFHmoJLYoD6S4ETuBmU32rP6D4zQYr': true,
        'DfLtjFCXNtw3Fz2ykswXZFos19knikGjCJTfjSFnWhfg': true,
        'G6YNakhrWtLDWBHnFjbNUp6sb59FPC1K75t1DozpoPzb': true,
        'AsZgCotvk9at87UFrR6F6Z1Wr4W6Y5orArxmaen4q96y': true,
        '9SHkXtyNsCjcYV9pMmjt7PqoB7nizZPtKjyj6Bd2wGaB': true,
        '9eF1gNN3UrQyfxFZubCSRLp6CpBt6sUCX2YJRQGYwVYt': true,
        '4A9n3TBFCyScSNTtVV562A3LEXadThcw1ssBCFDTHASF': true,
        'HYwSDaUM58A1d7G7mgRxmARkyL3UEqgv99pgiVJY8uFv': true,
        '28dGFTk2ZYGFWPt1BsmnZb7r7KQoDjLF1abETcoaoS39': true,
        'rQF5KTaVpsUAbPsaWwQpL33VsqPa9oC1xjvpbiDMmDG': true,
        '9GQ5yHriqvMrMhaMqgHTA4Ga9cfY127tQDtJu7JJubYe': true,
        'FJhGcyAgFDSZ35aWbfys4RzT8CdWPuCiGuEkNEeyoVkC': true,
        '8KZQifgV5KoQQWif3Kj1KaNuQBjFBp8Zeds6obY7hmFt': true,
        'FjbQBBPxwFqiSYSfyWyzuMmsGAJabd1xdFxnDTuBZBMp': true,
        '8NUS1YDjpNFtSz15NkucDcLJPizRyiAJTKJ73LhQDArM': true,
        '7eDdLYKHriCQvaJ9NjAuAPkWU3zcFGYudnGCfDe1Fy18': true,
        '8gDraYgavH1RiDrgJxwDRZu3D38d4t8gAgeEnbbFjj9m': true,
        'BbxXNuNcLNWQcg6dpGUAo86GUuxi8R1E2kRSYPCUndx9': true,
        'GvGVzkZzdqaZ4JnYtE5ay2r4BRaS3Fd46BtzJZXBfdRv': true,
        'DVqGsjraTa2ixc5ng64z2z3a6yfRnrDfYRxSek74E9Wr': true,
        'FdicCxY1W3wFYLg3k8ghrRpwm4yY5DPJgcpbyoz4mM7B': true,
        '8SGL9z6STfmaatNGqjDAoXBtoCVgCCaide1VbtFhjy4Q': true,
        '9mjR7asyuucC6MkrShdFf9gXNXbtj5yh5AymgGoDrNc1': true,
        '21wnQhAFwnzsGQXHKKY2A4pUVrXYe82FTTpVde8jwsqq': true,
        'BAFj6i4LpyPS5KErJf7hjbmBw514HybCGodZjweznbuR': true,
        'FpipGmhcxpNSp3KB3uZU3qSj5vcRYmQ8Ys1KgowYFASM': true,
        '4rdN8Z1Dx592EZMeds98AnXMS9Nh2F4rJy13s5LNxu3Q': true,
        'Gz6SapFSMLwzJ8AmizQeE6WqH5KDsi6ojqBaqxQCFqcn': true,
        '47kuZL9pA97kinyqLzm4aT2T4iCLC5qMfvrBEqqk5vGr': true,
        '6GCnRPv332Ua2K62cC1YNRHfPP76B6PUehrXXNvPZ2dn': true,
        'DBEXY64GW6BZnza3KnxgkKoQ3VmGvL5uo4pdqrAjgRuD': true,
        'xQ7PaSx6ov38ueHwHw7LwZ7K4FxXzC1pPDeYhFyw3LD': true,
        '8Wwhk4RDRdp5QKqLKSQpRYUi2bW9ecD45JoayA3TgsA4': true,
        'ERARqv6TM3tsu8M5Xdo5nvgek6ESXHK27jtFBPYx24XA': true,
        'GtMKG9DH6n5tHdndeUrrL89f6biQBtJ1JAWAkv45vuAi': true,
        '7aZHiZMH5dSd2nXv4M3M9nA9PjnNia5VSN4eRLjkTmfh': true,
        'VVEp3XEy8bJpru4F6HzzX77NscSK5f57NJrJ7eC272x': true,
        'EU3ZasYATH2KQS5TSfGKvaiXNospcJ8BuRmJmeYWWrP8': true,
        '8iMshMUGw5Bto1YbVo7LbTqweMGFqYfScRUtNKY2gvjN': true,
        '6He2wyVHyL9VHTuvHuWLbskuMmWxNzpAk6F9THadBLEM': true,
        '2DLWrBkqgDw1SqmoMx8Zr1vVpqjAv46QZFX6wHSFCb8z': true,
        'GC7pqw4oMZXJWXEwjNAvE4PFegGTdb7qxr3cCNDPxzSj': true,
        'GzzhQkBbA2vEFFGqQiiY64npm8WqL3Y6QJcfc7j37eXi': true,
        '851vztjpSQyDBETp4KBKmsz1QYrbXaZNGrHyWo8Q26PZ': true,
        'soXCzZwWHNcyXJYGtrvYESP5khgHWZMP7PhvPsP1iCE': true,
        'HgxQ1gBhefLG2nbRacrnjXnAe8VQ12Do3Y99FdRaDStR': true,
        '9fYdvLJ5gzzCyTr1Sq8GgxnDGoKEScT96tbQhWy8chkn': true,
        'HGeVoMZnFrvZNerDQPSMTf888BWPqGA42kBBYkb8M8be': true,
        'HcHyeuZgrBdH1x3fD7pHwfLMrM7rkrTDJH3j68WAwp5s': true,
        '65v3X7PBXXrJcppZzAFR46P1fp2LCoXYyQmJgWLmMwpK': true,
        'A6VJ9PfWYPz8wabYM7eVb69bWgUGMFVt5ggsNmjh7Eoz': true,
        '6Hf6Maqvx83VWiQGdCHu9b4mpgb7CayxdmLQR83VGFjU': true,
        '3ZpSacWJSTUnLxnoN8yDSfG1UQsYbgxNeVBFqtN8Bajr': true,
        'A1rU8idCX2tHa6VHy6ryGnPDdfYVXHgBkY81NG38z958': true,
        '6Am5DCs1wb97Q8HYPk5QSG5fz6pKhyVGA9o96yfTwBpw': true,
        'DyfUDdbA4dRTCk3e2UVnYsiXG8cZcP1x1vRvYkn9wUzw': true,
        'Fg2ooDffGULSeN8UwamB1J5ofzLLYtSbXdRmPSDfnzjC': true,
        'GNWZuR1fWAv44NDKmnU6dXmXGwS1aYFdJbfVaGE6t23L': true,
        '2TQn3H226vGeYGfJHutS5uPJpTsDUrZTKypLAKkaYZ7m': true,
        'CycSaH2CufwCozq8xLCz4ark6VdMxKzpDznqzgCk46bS': true,
        '7NCjtjMy5jeA4JcvNzs4zQiVBfTysQTE3q5e4NPzU44s': true,
        '8HaruNXy8WWXDxmHxdPoUd78nhKW7i2vJY8q9LicXf4A': true,
        'DVKwNHRwk2McqcPY4XURAe1nLsEshfDteETPdXSwynKF': true,
        '7AfuANVTinGeAhcyrHuyNodyctX7yKfdEEbrxjiqziw8': true,
        'HRtspzsqTEE4YdrQrorSHd9FB2gUsKrUndm2QxZUEoh1': true,
        'J2ZqesN4kfkFyDeFN4xFL61N6ZeQnyEKjJNY7KuhP8sH': true,
        'Bq84ofL7vqi2P4ij3Ddz87eMwPoa2ZTXrtyyVs7XbiEo': true,
        '9sMQvg4iZ7nXtQMDb7wyBspAk7NXYzn1HbN5mPRTF6bM': true,
        '2XsSFX9zrLcByfmHxPj1oUcDSBQjx1PmM3k77kKT664R': true,
        'DsrigNvwHNUYwmwj3ft9qf8gppsoLkCR4m8KESeDz3ei': true,
        'DFZGY2nyCuvcxW8XSNf1LRqGhistW9PDMYNRJAEca9Sw': true,
        'iCBkFoknK6uqodVqWhm34VaAutW34GmQcHPskANmzia': true,
        '5eBou1A5aF888N6CL9gzRLzzPrdWiAYXCVbgf4vm9d6Y': true,
        'CTSKgUHr9p3xPETdm6yce5msMrgXkm7aFHpymXRo19N6': true,
        'C3p7oC8ACBeXXxPT5wRPcWYCxkUz48a4Ut3g9P7fpF5U': true,
        '2NNZohAiqZT3Ww1YSkGqUENDBvJAv5sdCe6JR31gANkK': true,
        'Ej5j5kr1hA4MmdKnewGgG7tJbiHFzotU2x2LELzHjW4o': true,
        '2kGpXLm95WXT4UUsPh6p1C117B23dTp9ZhGZ9JQo6ftF': true,
        '6KArndh7kNDBkPxBpxgqbUu6uTqQWQq2WxcVa5CTXrrx': true,
        '6RtSGkXkR83sxtXktrXkWRYnBbzdWMvuQhg5eqqv17Vu': true,
        'DLX1iFMeYVWiEtiGd9UJjWkC17HeE4Jz3hd9TxVmnyGQ': true,
        'DdvRBfTTU1mFMkpsTG2V3deJsspK58jFVQ2a1RVova7d': true,
        'FHDmn4FyVxDSD6NDP2PvgfPWv13m43XyFC9FDh1FHuiu': true,
        '9hfNRw9ij4vU5iXFMToFvHGYdG9D1nuT7H5xEG5Hf96F': true,
        '72iBP1GrpKWqGtn8oRa81CeeQp9Q4tcpYCNXYohuLz7Z': true,
        'D2drcpYbF4Vv3yj4iEmCA5ABddpe2qeYgAY41xndfZ5k': true,
        'Hk4ToyuiHiQXJfVZ5LzgQxHyodSEFMvntWRqnaZCCRxo': true,
        'FPUHbQtve5ciXUGFbETZvStK1MQ4afrsAJ1JTkgUJYq2': true,
        'APwyARWLcFj6h2zocd9ynxE6vAymPFxbqqHn2mHkbXVd': true,
        '3sQ48dTVdRbhCcwyagGiFwJSZghi4xgNPDKsGnErEaqW': true,
        'Drur8S24Mmhj2DvZvr55EfBcMyMU4Nwtnw5c87ejfMdr': true,
        'F8cmDKt3yMERxgVhpCGSejPFQ6xkwNRbngnPPm1J5sqC': true,
        '92wNttFSwhk11LKQKgTY2MbuSyGUAisqNUaZSFGQXrF2': true,
        '7mz2ABzeD8BcnYCSeMDkFRb7KHhvo2fmcPa5pP2xtGvJ': true,
        '8S4dMJ4M6sHH7UcBhjCKxbZ3nXuK8UD6cbrHJhLfdCB4': true,
        'BoZqnfZno5Hc46ciuqBEtsk5TPbBghMySD5fVvR41q2G': true,
        'eqEBAXRgsZaHRW8rT56ft8zja9oo7vweRH21i3uNWAV': true,
        'J1YqHXQxjieb9eEs5KBY6rsnQxKka1xE7ZmA3K3nDiy7': true,
        'jD3FApnQzJQzsxpvBWiYLiHi6qdcaxVLJwxUiebUbHk': true,
        'Dij1pWm5pFmtYNuzsaCRh1v1msrK3g89fuqYZLSAjwD5': true,
        'dC65gn5WRytiBA4PBQFbExs4fdny9KjDtELKn55Ppze': true,
        '6kRVc9mGyybh4BAY8bHDJFLvhusxMnfyU58JAVJyiZmV': true,
        'iEQAHBSiHj9FRBuxThXvrDxzFaVA4CC3YsZC6xyLDW3': true,
        'EgFPZhUpbeFAPgLMmMdbLzsdCwokH1a4xaS5VA2Lt6LW': true,
        'FqG1r7mDE6FGuegsKTJ1vBBz2yhkwFoRLduM4Kj4aDNM': true,
        '5Xu8xkduU7oXC7E9hZdbwMwzAcJryktaEA91KNxZPqXg': true,
        '5QHXVCFqMoksMk1TsjRhPxMmhR9uBRWc8QtSkmbnK7ih': true,
        '9qWChNBTGwcqYocWvrq1NutNrnNJBzF6nd2Jggxvu2DW': true,
        'AfmsJHeToAuBEHWmMcBwEYpYPQKVJovdga8ydSAuiSgK': true,
        '3fq6ocQzTbhZTNmu745RSN5KGBxsiTkDa8z3RMEDXwyw': true,
        'F1WBVje9V6eyj3AtUTZh68MGdpAuzadE5rYbWAYtCdWM': true,
        '57VoQCdE5ZTi3gmuei4t1gxABNkUgPAreAXfcADKjBAB': true,
        '4XBzZaE5dFV9hfeuwmp7twqFtaGfGaVEGwKM4kEz2kTg': true,
        'EdcamKq6oeo3pJfbuDScWBfWtnJMcx7ryhKFY4AiGbLU': true,
        '3zFoov1qKsYSNt7u8Ye9dkBGKtXDLyzpStwQVKb2h5Ct': true,
        'DUfkDtXr8Gf3KCPEp7P7BqPnwSw6biQtKUczR2E9jhDn': true,
        'DFpGuZxrAC8RCfEvVt2PUj2ju7RAZqMx6BhBiNKAxcDV': true,
        'HaWwc3XeRn9Be76zz5WJnrj1pH1hBW9YXyA41CgS2m2d': true,
        'P8Sd2F7mwaAsyXEYFjAvUeco3pN64rD3iHmoHvEH5BY': true,
        '42V2QGXFeVVUTaHBNmyGHTeFhh4TfrdtvwTB16VN55AH': true,
        'DyAX5rzMEFizH27UEmZYDaVfZeU6vaonvNF8hHnLN8RM': true,
        'GyaXvaBQtexpasiCUcgxnbx2zYZHTHedDX6Ta3nB7tDZ': true,
        '5iD4f5oaJo83LXa5WaLoQxdHKzuv6NYwgQ2WY8TgeRih': true,
        'Et9FXiV7To9GST7fEJtPu4wtepB3w2FX9BemKHBfkSjc': true,
        '6j1vGRyxQx4J5XYjckVB4oYxTNSyKPGT9RQ5moaPmB3c': true,
        '6nsAEneSei43bR43BGVMc39tcvW2nztvbnzXpM81CZRw': true,
        '68dJjoNJfHeUgW6siEvJZTvhA37N3LfFNW7iTzsAJayQ': true,
        '9twX2z5aksdKNqaiyaTEMDBKnFDdssoNdmnP5J3h9oeX': true,
        'sVtVASTz8N5nTbkLCYhaPaaDFjL79DBE3544UgZmCXY': true,
        'AdJttNEtYwHL4RnkMjgF3gyepV9yBTDj9tLyEWF61jMk': true,
        '3R5X5LeLFTQMaRA3VJQWvc7bu7S7vkAPby7hcDyLXswE': true,
        '36D8siqohxHdVfpm8rM2zKJc9HVCLGvXHEp6zLFnoby1': true,
        '4yQtgvPmRLVMkj9XKYUyGvgM5koFEgY1iV7mHJt8jch4': true,
        '9CSxMtaDbi3mqiQgNdx784ZsiY3qNBtQdZhUTx8vrdj6': true,
        'DHoYmV6xvTho6Vzi7NXpgkjnosnyP1aAfcBi8EZkpXAA': true,
        'JAe6BbV3gxystqRm2EqkfBEerDECzQ8kW1KH6kRWAZQu': true,
        '4kZxyJ2pzM8sLykDAerR6EzEVzSR116ggxoJZKexST4V': true,
        'ERA873zjy9GqPP7BZNf5Y4ZS3DGGXZA5SkuJY4mrv68N': true,
        'F42G3cMnutwimGpKGMrba6SVMfyHhRqXfhd3bXtFbDFS': true,
        '8T2ZQv173vvknRLQ3K9YcAnEtDkPdhijmtDGmHjLLKt9': true,
        'HNBmzQPuoSd5bWFSgvWf5uqdRq7jN3pNgNNsuZ1K96tn': true,
        '3p91iemTe7LB6SWosRp8S1spv5qnoKyCkrMzqbQ74BSN': true,
        'CdjPttboVj8z4r8Z1xzH3Bz17CwjSCFj7s9V6YrwjMen': true,
        'TBjRwU64KoBP84JJXmgH7nuGd4fREmNYpTUP6NYk4ED': true,
        'Gkmmq1DcLzRYMmZQrdmABKAZwcvwxfUL94agpgnWAfNX': true,
        'DxE8xbjHT7rXyRd2DMz5TnNNNC91Kz1SZ9k4dpH6X4JP': true,
        'D95Ty4FrAbab9y9LVd8SfWT9qUZ7b2bZYKZrjNYJ5arV': true,
        'HJeUrHgG2asHtBhVBtQ1qu188ePNf1ELLfvsdC1xsh64': true,
        'AxPjZxXbHZ2R5AEXtfk62XRV5G5DNVXq5RX5gZN5JqaG': true,
        'FBLSYkRDRRGyaJdyXoGS9aGCKBodYMWt7HKMJh3VCz8h': true,
        '885RFKPF6YG3s2AAm6rDkC3SUcX5gwbrCTK5eNY37w82': true,
        '52HtCF9qeGPQCPFZoV2ZcryMrZN8Zc6jUvk4Ld4M5qdr': true,
        '86Rf68PYwn5WrGqBtV8yybTZWEasnWCG9kDbPaUtVdtx': true,
        'FidQYW46dTEwK7Ahk8GiopkPfLbMkDrpzNjjMkw6mysT': true,
        '8hSToyWNmtCc8wmNGt4umfujYyzsfxA88dc5ELnp1KDs': true,
        '44QQiKfERTSzyHWzHUd3RHBzWLiM1LfvsJukcQ5Gf9vj': true,
        '8xr3hhDBhcfN6a7xdfTQTykx8c2gVhnkjz3SUeGKVAZm': true,
        '7eYsezeKN4PUVxX6uxTYR6PXU7uQo2r8PSSHXZ1DWUmw': true,
        'YCkBzvwiXVpEJPFzJMNWjXXxj3k2GdDchT7kscdHoPh': true,
        'CaEWr1gEXa6QzGDwuBJvfrhrtUckBZteq4KHzFrco6KS': true,
        '5BUFmZZiKTeP8WxE6pBg6ChbU1hmEs3f5DkcMMXzMxmy': true,
        '3EDuKnCucwPKQb7XqJvfZUHb9G5ZeVN3TuetMXVFZzcw': true,
        '5zpaT36EYA2mTa44Y6VHnsBeA4qinSVDKBmZMFVyE7QA': true,
        'DxppurSfmz6nEiBtdd2Yu4ratPYJ3YsezLijYDjp4AFR': true,
        'G3Kpni3LrdpBKFiSyyVVrPpnHP5neK8jDm3ry5nS93Cm': true,
        '2Qoj26B3iaA2AfjTnNDzF5B3PH7x4ZnrTdVAZHxhb5n9': true,
        '9KEZ4qrgYqZLzFTuidaHFjpHmqM1PwbGZQG5EWXARRqL': true,
        '3FhV1ng83aP9iRLq7FFf1mPfVvnQeGd4Y7FRqcyDfhNi': true,
        '2AQt5vsFDurAh57mfWVrHQ81UAmQZxoi8SpDMGxMxFv1': true,
        'BqJxMVdftBCXNPi9gQNe4xtdtfKqAQjN44Fy76TM9eEj': true,
        'Er71GqEmmKaCeRhq2AoKsGB6tKrD8pG5ftbtLRY1WKkQ': true,
        '9NYhW3cTWEBxYHFHDMTUucMfGcjY8mzP9tJ5fKqdrk3s': true,
        'DzxzNjWVNdJ2VrPxkEDxvJptxsphQcVKSgU5LJUgbFTK': true,
        'H8SBzJUwiqQyaTLT47GqvXbX9ogTVM4mePtrzpZ5n66M': true,
        'DRqgsBLQ3Q9FiQRjHosf42MSqgZP8smMspxntcp3R2u3': true,
        '6uAMURPk6gNhhpL9ah4QQ5F1Te9qyCnddszuF5FbdT1S': true,
        '6j43tcYPiBsZiPEmiBfciTFpMpG46CaQAEHnYTsJQRfQ': true,
        'Ce81BB6wWcSUfDzaPYo3ytJkixc7jrHsqtkbEgjvDpiK': true,
        'DnrDQBXHppFH6prq8NHREcWwnrZ9L6NEfEpmR94ZhPmg': true,
        'GPxijTtKCuczNr4wXsgpBbMG7EbrLQYcShVcSYkPR9QD': true,
        '5QPtqUdGsM5Ws6XWiYxEKtpQmfUAPvSW83owpkDKQTdu': true,
        '4VmEiNcv6HZqREJf4pmPSPRPFN5UP7pKNm17tftPgTJW': true,
        'GoKW1XR1V6WLpaSnQ1FS4mAvvwUovro2TbvCv6PH99DS': true,
        '7oB2Lj9gL8pE6gvCHJuJgQBwgCHjnG6SAinbLQH3ANsU': true,
        'GR4npbgGk8Qg8i8cuvRN9yTqiwBAi8G4MUf32AcCR2JD': true,
        '5E4cccf56759YT8ZiHywYQEStHH3r9UFDM9VRAniFxKq': true,
        'G4bP3JGLq1d8BxJwgGBz91GA7Dtj5W41hdBqpv9uD7su': true,
        'EMCr3A1goe8rkLP4wxNvfFzLTdbQnVRYaoSfs8jWRBBU': true,
        '4DEPCmRwYEicLZcRuoKaN4YLY7GDbfBXs2GTSio454Sa': true,
        'Vicnmb7dFxyRTWawmydYjDJXxebzEYpyXgzs6ADY9nv': true,
        'DgMAsGLVvcBzvEftPUQBx3nB1DxWYBuk8V5uQ5r56utS': true,
        'CX9PE48wSu2Cbq8EGKaARSo7pDftmhdP8TE2oJF679Bj': true,
        'BpBqFaVq5rMoEmok2MNciGdDwxKteAJPyNKVpgpBJLsc': true,
        '66ZgNaJc9TNCCCH7ofQRvEby5QzXSmhZ6w43eMDZS2f8': true,
        'FcuT1Y85ybbUVE5JQhBiGKVdv4Qfah2VP3xazjPCmhdP': true,
        'CpPBryjPMaSyz6Aoct2EKY1h7rNg3fvAJBC4AVw4kGnY': true,
        'Hz1urJCmikP9MzHAQFScLqBmBhvpu2vuKjx1TNtqoWc1': true,
        'GorgRKL4sNRm63tMYkoc6s5xYHJnz36Mp7FwrtD8Ch3p': true,
        '6NtFmAVmLgktMqNgFnq8CJnXfouxuzThPVSjKjpVzNWX': true,
        'BUDQND1Yr65QbF763HxuBNeq2BFMhJCcKq2LkReM99Z4': true,
        '7YvvjxgP7vuuPeZfDFA5YnbMuVGPYy7LTQhN3csx3bha': true,
        'F68CUc7eYcPucJqvXtcXZwZ1QMt4rr1bSCxmHQZUBJz1': true,
        'ET2twSK2utYUTMZsXbfNhaYsh1p27YjKw7CXVbYRZxcd': true,
        '4ckANn2imY3yzcoPo1acsMVitYvJ5GDbVsGERrv4uAKv': true,
        '9z1TcPapkPPCLR7PW3WYn2CcJAZFnGw7zTrquSh3X98k': true,
        'SLLFqc5y7Da11W5kLFQbZvKqr3KPBNSgy9tYxsVY6gi': true,
        'AcDZdXwMDBRGcfGFJFde3qXmNEFdiK9ZQmSGfWdCZYS1': true,
        '9DuMJ3rmaCNfpZRrRAxjrWzdRfEuVDhanfUUYEbeajwF': true,
        'E9EsEt5CJKxEVTxpau564L8Cx86iPNNoTt8dKaiL3yZS': true,
        'DM4iQv2u4qxMoU9V542TKtyA9VS9H8n32z3wscANjXcZ': true,
        'BQNrkpCgAbQWGArRqR9JdyvT1wLZCxYKKmm19GSJVi1B': true,
        'GEfh72Y1D4zVCtJAvG8p6sD3AnubXsXVdLjiLFSfvcpK': true,
        'FSFX5HEpc95WWRj9AxuYhLyrfjQD45fo4fh68g8JcBLG': true,
        'GkvZMi7SXu8Q2GGb1wNQJvrbgT4LrxetS6AAcUPk5zjn': true,
        '6Vc5LNdhmmnt4FCLECLLDSdGumPzYoHoTd5X8KPCaDwo': true,
        '5QzXZXR3qc6yUCZbwXRx6itx7Yx1ZQFyhT4N9Pj5ciWr': true,
        '65QCS4tAhFWsmxq1QTtH4xBEL3MfLkGVXvSQXU11EZyf': true,
        '8wdrGX7XEcHqjpLB9nJ4TMNpXjVCC4xVBgVeUGAfTBR8': true,
        '6u31aqKJ719KPoc7Un3yqGSaxsmPDDMW7XiTD7t5Juux': true,
        '2rxemyRpRMeW2RuFrQfYdGuFD6F95HW9LmX3nQiYUjpm': true,
        '5vAGjFSsci3ZoJoLSqCH8ANK3uLifan1QVWJcABoM7TR': true,
        '58rMuivmRA92tvtCBzTChtSyud2rLwJc1k8sYtbaSUDf': true,
        'Aoj7V6Vu3QkcPe7aJgLVF3cNz2zUsXvjRR5uVL9mh5iF': true,
        'H1acUrAfDmg3JbvgqxfV235GWPuUahYCuRnEazZEoTeZ': true,
        'EGh5wQtzk6UF4NePXnvzx1JogST9LbdukpSKrQUm5g6D': true,
        'AVdjL4SQ8HvFGjCXMfWSTVFDSR7JFNNJm5cg3cVc2cKk': true,
        'NyTop7xCSnV5dNygM7coqKLzmX7eRDfSuJ3AjZiMgfL': true,
        '8MDvpHe4X756ticACs6tpJizb69AGNqvcmmkG2ygorTj': true,
        '7yeGWPc2oTRQwTMocMkSpy6ZSVc277fv9bd5eYu7zGDs': true,
        '3p4KZ574Q3QmvXkaaDVahfvyMrpdM5oQouR8twU99gjM': true,
        '33HUQZTpxkkd4jMSjkRFC8SLHTxLk3okdXRknrrATR7p': true,
        'FtHywgYfCTsyU4DY957vTKNk6ychJeudxrWLdw4fdFZb': true,
        'GHaHyLZQcKY4iDvXHtAdVsyCAb45HtNhKUYZ6k76W2Ft': true,
        'CFWqqURKecyiPWXNKgec1JQwHFqsKiC9SgKZMCqtBLdf': true,
        'BqpZGyRoze6Vc9CRLTecULsBCzB26G9fVhBGzERt79h8': true,
        'BS2UXBcjUjEcVXabUo9vi6We3pZmjLKgUWqesyutz237': true,
        'HBxv6e7ZsrQETiwwW2g2o8hjnD8ou19MwZhwiQKQ49xu': true,
        'GtP2tzCDBvMi41N1hixjvRDRixbNibb8hPPLA6qLa5Ca': true,
        '2TdeVWeqbmxpbG7EQHHenmePT34nqbAbtWg2GSqtwtij': true,
        '5VRz5xC8J8yGwVFGkzWJG8zvTWixSDjpKmJpT5aqzU8y': true,
        'A7znai2YgVTg5zppDmgeNCj7pPnRN43SiJbqAgAqu6UN': true,
        '7uVWox6nRcKwax3LxfSZttWhBHhpbBtHpscciXqzKAN3': true,
        'J5fkrzZFt9fPGQFAiHNr6V4VtiwZHT6Jx7fj7R2kn9gW': true,
        'BxyStUsCa32xwQibZnRiL7p6uuDrD39tbpXrpFbjSaKm': true,
        '8qjpxkgxmLAdUq1RXo3z1WUFnAPxqVp9zG5LVW2xiYBb': true,
        'E1B3ynyuY8gecXWGt23RsNHJkcM5xEJiiAJEuuQ7aaDZ': true,
        '3gLx85tU92ECFsJw6K4mZzyqgrpa7gMf7r3mVSryynwH': true,
        '8MurbMUt911hDj9DA1kzbvXKJ8jKNchmUKGu6zTnys8': true,
        'BsajYSNeRv57gowzuXWWMnMfZ7jkKttu5vXm2GJT9KXt': true,
        '2PDb4VFGYGge31fgPrPVUWg1MZzoxQmsmpJiFsEioDK4': true,
        'BSpjfkHVYbwbLsJnoJ9KCB6DzzAannusMuFYYUUDpas6': true,
        'B9VV4pTHCPgHWVZNikRpijoNGCgzuBwFSbJ9rjStzPSW': true,
        '7hpRW3Ajvc3UfVUm2ah1q3SZ1iUCPitE7sg61aJax3Pi': true,
        '234XiEDxuYmHPJ2enYTr8Gek1DDDa7M8D5wRoYnh2FEJ': true,
        '421FB8GMDohNwZEho2t8GXTrgLGQ4wriqT79pzAoXYaY': true,
        '9NCAg9szDpVqUApU3kTZqx2rDqWakWrYcjLact2P2uSt': true,
        '3s4vmsNShn7nt8fzEbLWZEAKTsmznvEdBN9f3yb71WfG': true,
        '3cSDDQ2EBQZgHeUFrUCAD3vdgrVkbi9rrLD3XiLwvVqB': true,
        'ESjmbbR1K6JEQPbgEsStbduhjVDEWNMRV51EUjzTcZP': true,
        '3MditVjzgfKWcsRk1ZBjiV7UTpjAPBoaCZ9Z8b3puzif': true,
        'DDFacFkbynG1UEGeVfjetY7SJJBEAfVUu8rwMnVC2X2D': true,
        '6sDUDGZLh5WyHgU2XrERbis1qijByYS2DxGY8F79Q7qK': true,
        'CL2BjYDX6R44yBgVYYCXFKTgSjFHEQ6zZWL2u5L7hQMq': true,
        '66tNC3fD82PM2wgMzqLojcxgRs6mGdMLvD9KY6Urojpd': true,
        'DMn57dNAJcyr6LYQhNuWFqoaFEQL9AG1GudvUrvYJVX2': true,
        '7MLw5C6j7nfnz1sJeDK2ybf1iEq4Th5o7Ydt5cfoSdTs': true,
        '5vJ1gFnSnZEPVSrAtrQFX3YPeA9GMnkGnxBUmoFB7nLh': true,
        '2FH6bfZX7i2ampG6vv2SBiTVxm5YAsR9ekiH3fkq1xuQ': true,
        '2v6joGdhYxX1pMu7bj6inYDifpePVx4NMnTB2y1skmoZ': true,
        '3mM2EiSMUDQkZXvx85CXo3qHY1nVorfskTiy9uWWEL3S': true,
        'ALjdsBKNBBazG6L4ndaq6R3efgk5setWR7XxKsjNXs3A': true,
        '6wavYaUs2QkfN7AMLscoVPZHxvzCEjVm9tkKERrJGw6U': true,
        'Hjdg2aNLpTxF6Go3VDVoQg7YP8vjzkqnTrZ49q8wZxYn': true,
        'HFbkAP2zeiQgNfPPJnyxGiumS3JRmKo3YrmtY5uR5Tz5': true,
        'Qn6yanGtGRMNyt6QRZmCvN8HQggzV29XQnPwin8wRMt': true,
        'Cg7oJWCDomn59jGN2aC9tCdoZHHbnEf8yWax1KiYtdtY': true,
        '8BhrMnWoFokpqvFgYEmuLkJgeFXeArUkeMSxHtnBg1Wr': true,
        '5ubvxzwG3NUk8tNucGpskZCWXX5SJMKg4kKEY4mCfMv3': true,
        '2Qz4EhwZQFCVhmenqRtmiy7mSNFiLGTHGjAKUM5p1Ezp': true,
        '2jKUAz86SzsDHy2SQvf5HAcUU7JVHg8Psde8B4KkWjgM': true,
        '6L2ELdSUnGfZdyYYzeLmXLFY8pp8j7ArLfn1cmfMKeHg': true,
        '6eMish5EbWDoC5kK7aKKNoVSZ1tVCe2JQ3p4EUAFBR6k': true,
        'CNUJ5XtJSQQMPPEW6CpRDXaB4mdMnKWjkCdJbvaqVeot': true,
        '5WiB96RN7ftZWZd726dYPcyWbymbMPuHBkskfj5uRzpP': true,
        'EqF4hptLDUGjiUddEkHQqZsLr2wUrZsrrKZeaASWgbov': true,
        'HNFK3jdqvTxckmSCjKnpSxR5RVvKFgSJd5vKZTsw9Gi1': true,
        '8vbpBx4TaWeMZrjTRUa7W8edcvKduiHLSFefHF9nmpkT': true,
        'ATx6dq5duRis6suuNKcbMypmGSgEsmjqARVVeCV9tYLU': true,
        '3JnkVMoRAiVPniQzbyPGrefHehKwdWMotdvuUy58CrRF': true,
        'T3YisCryThmrZJZyPuw53nq7CHdYwDvPDvsZGxGpd4K': true,
        'E9vN7ZT2bwb1JgFQExn72Z3EHniCKRbK7P1hE2UtPygD': true,
        '6riLubYWF2sNCFZ9gavgfHjuxCenU8UsWwZA8VTzyf3b': true,
        'G3Kt7H4cXmjcj7LexmmoWxYSZ5J6ARBk4EVEPmpNDr7r': true,
        'F4uw4tgDv9SuXbF7SW7EvBU1w9yvsSn9iGzrZB4mKKx3': true,
        '6nHh8ywwK9qTASSUKhC7G5eR18tkNrmbBte7SYjURSso': true,
        '6XKTHxG6cg3kwM5ySttpige5rj9oudX4Yega2AmoQnGy': true,
        'HtGvnAs5xgqhre8rQ3bYVf796SmdDiLJeQE95DEJf2gv': true,
        'ZhHDF5DJkUw158Z8dS4FAt3d13rsfAB5i6DWCjyK82G': true,
        '3HL2VDDvrgnYGt6QJePPTDNssvmLx8LEFLJGNXWRfeDm': true,
        '8B1S5dYwjdY7gZQHa5p3mpzRAU7WdzHnTqNKvGPTQ8qp': true,
        'FgxGkCnEypS7HdFr73u2tE2SANqAbBDz5bXdvxA3c8fC': true,
        'BLvuUbsYp9XEchAQVzVYQ853M1y3dDXhWP9CzFpyKqnd': true,
        '7J6ow9FkNg61Sp22y1Ypkd8e3S2jxms2dDSSV6PU2a5w': true,
        '64bRodNX9AgsVWYCFJEsPeFYZpZCgKEa2Fa44gguj3aS': true,
        'D5q3ufpt4kut9i6U8CNS6Ezt8q2biNKJ7DNqzf9t8aKq': true,
        'GYfEUqytUERE63r4goifhzJqNmNiogWbGwVvc9PmSTR5': true,
        '9EDzN7xH1wf1EMVqZUf7DJBJuerT5AWhjkGF3TqYU9p7': true,
        '8H7PKcbF2gAJn54WqnNB82kaqQfAE6guhTphSZxjXcJw': true,
        'Ftf4JTfq556g9TzS9TZ7hbr6fMM3XNrD8wYquUeTB3Db': true,
        '2FEC1sQucr8xj6y4x2c5vJbbYhxgjjUrEkYcd2hp5QC5': true,
        '5WB2TSxTUpwUsTZowqPemqBTeADr24sokCiJGD8fvtTS': true,
        'C44pPG9LeeXmBXQY6EGhyHeAi3WqMsczB7PctFBz9QXa': true,
        '4xsDDwZfiYYoVbULeQzpf1fTBXXKJtsPxWkVW7Bffxtu': true,
        '4SbkzoC4nTJpGVg9RM3yz7TaRgFXyjg4wmh1SDrK7wVP': true,
        '5UstbKkwKzHEvuHj1urLqLfjgw2cyJBZkDfKzkJ2zznt': true,
        '9WVmomYsJWkLq5sYaLBBCvU4vaiRA2sqYEBhAxDQScHp': true,
        'Hn3ZAKAvKsTv21Ls2pdsfv8PwSeHPVDAoxsMUpEfUPVw': true,
        'HPtQcNJQxe5wdaSJDYAon4RfutxQANzFe8e3QyoqHTPC': true,
        '6tWv6W8AFgzpqZsRQRDH7tKUgmP1BHtnRDg4tRydTUqq': true,
        'CPSJZ4eyqtR6e5dD4nnb5xaFxLFM9nJ5Mo5z3gWsUVyU': true,
        'AzT6T5vnEBeWqhggCEbWVZjzUacJEw5ToSRa5TFzkbqJ': true,
        '8CSSzq9xz2x7quzLpwTsaYWReBBDKsufi3tJYsESCgC8': true,
        'FCSUwJ9s39DLjZyezPRk3r4gut1uiLFTRF84rM1BAT77': true,
        'BjFMj6zc6tgtAabH6ZqS3pb65ea1xt7dTLZttCbvkrNB': true,
        'DhFPTZFjESBGn3yV2FwxpUgMt8FftWJ2DNkPnQRzCh61': true,
        '7YrAwDH5vXAHwGUv8yBRk1QthQa4cBHbx5YSLFrFxygH': true,
        '5gFPwhYgxXasrmrnhm3Wc8D44HBik4n52bwwFy1FaCVV': true,
        'Dk2x6LWVc6E7tcAbWshwgErpgcbBrhB4yyMXZmLcC5fm': true,
        'FkYUrxrH8qCFH1b5f8BD11RQZeTfz33jMmyMB3JKrDTS': true,
        '8H6ezPNqJU5ZUMmRNxRvdYxWWhpi6meinj3JbpXw7pp': true,
        'BwNjPy4zVzNPYogqFLoL7UY4Hpa5TFpPhVhG3X2X1X7e': true,
        '7qg93WxReSvak9h4PWUe7mQVgq5TssTNUr1g8Ajkd36e': true,
        'J1quWFtRVYe4z6Vceykk9rzvR1AA2z6bfeToziN3i9DT': true,
        '6cpH5Q8nn6xQvfC8e3amigmAG8KtC32BRpARRjdSwFh9': true,
        'AXj8bn8PBY99LJ4VnKQwdtgEbLxBanrG3APJ4nWgQstC': true,
        'DLuikJocZQJ2mqEW7LmUVJEWeeX9BPUaLpBfHYgYk822': true,
        '7NExcptLQ21r5dA74NsrYdrW575PXfLmiPomoKLMfRUt': true,
        'HN7WUADqbDGoxiAfdAkq1upHuNMoen6gDLn93hcLQaiK': true,
        'Fj3XCpBzfD8f2SjoDMuV43MQQ6VsVQqPRCiaNW3fXKct': true,
        '5EGF5fv4Ldva3uBwfK7eY16A4EcWFqHP9uLuek9EJRNv': true,
        'DBknahXD2RjxdkrcLAxxmGNaXQFqpSTYWbbJ8j6DiZnn': true,
        '2QEjHoa9mgUrbPFy4VUZ5tDNsmFkNt42bvvtJTL6nTy1': true,
        'G2mqj99wGyda52i9g9ttq4bzkp8uLf2YukFt2EDgTPhG': true,
        '9pS8VRsNqENNkHJV1Ma3u94hQHuiL9tkXRtuvM496Dw3': true,
        'AY1Nce66FPA3MhwdsxTGLa49NiUh9REewrt8qMSUrqwH': true,
        '6mgRBtwKywqyysbypZKNiczkw8y2AxjtW1RbRoVL8PDh': true,
        'GdfLZ6D7Br6KMSoeV7xWq8XaaJf5rPsujs7K2QzjmxTC': true,
        'J4gbugKTwTERj2SWVkCsJGCtirhvcrP7uFg7t2BPuWET': true,
        '9rxeEfiuNwhX7HpxqwFKx8UNjjP5fSNfDqSoxpPTLxra': true,
        'FC1g5r1BL2FjAn9Un71ZN1ysYd2M8mzJYLjDsPyxmvvf': true,
        'DGJTCgHGaNtcDZJJ2YXAEAh5k32mrd3RXpTMYrWcxAh8': true,
        '3PNdNEQXFwAGfP6GeEzvw6JrXUkxz3xfUPEjFoSzG6Km': true,
        '5L4e9apjZtMKZscqN1f75AtqRzYKaXH3p3SjNSnZWYBb': true,
        '3NgtAY363W7JgTcqqE5AJTKYXHDrMGcRHJsg3eGC2Kgf': true,
        'HfGTSk5V3pxGZKWPWkmVfg115De5hVLU2mezTDZbZ7K8': true,
        'EWpaBpuAfaeo3Bk7ZQ4fSsjfYXwf6P8QMrM9xJEhiSfv': true,
        '4UcvSNy5kRhde7t7JAHFBVkigFd7HMQQUuKW167CiCnK': true,
        '7teaRAyaGAK3SrkTqyz5iVTj35vMzq5JhuZFtFfGtu3D': true,
        '76bp5FmVFC5fhtePr9gPVKbZ2qxvgnh2HDjowYawtHKP': true,
        '7cVDoGzcfXzr7TPxAEu9Sv2DGAarJ175kXW8brYT74KR': true,
        '5U1xfyE4h8iVi96T9QeXER38As5y2neEbz4SDBLpQ8FX': true,
        'GgeWyuqoScjhME9Y6c6XmVD5XzN5xDjKmSoRdExp1J3t': true,
        'G44vzvwTaMcYiNwPWtEdi7g1qqkQuXYXBM7hbhgFTN9R': true,
        '5RWn3kCjmKXi4hWAnkHj2iTVo86sNCWqruzi9B7ePxY': true,
        'CfaFzCJLVTvksPve4R9YhgYYmTgBmvP83zi8rdvLtmNj': true,
        'HR3BAHmF7VvPf2r2uJREjUdE5ec6W8K7YihjZDmogwnA': true,
        '3RmuQuVEtCVLPfgX55pFoq4RtwHUCPniBxU8j89YTnfa': true,
        'BgofoXfbR9r1cZh3RpCF9to6Q8VSvaYf9D63UyTRDV72': true,
        '6thu62RwjgbL4MQcz8ojRfqtAARY5gh5hrQVNBw4ivs9': true,
        '5vKL6VZUPGR2jtH26NHF891iHQP19yWKgy9cQrg9iPSM': true,
        'EUvkYsHb2otyxqYAECD5P1DzmFVgoZ2Rk1XcjyD2ojy9': true,
        '81r867afAVvxQM6SXtAhQPGt7FPJBXgo1KCiyPLWNMBr': true,
        'CXKejtz4D3umxNXFVr2AnKb71gwzWEkkTKnoynSM2351': true,
        '2N3kYdky27ojf6gH88T1CtwnSk81Ej1FTta7qibR733g': true,
        '5YynF2TJXG6ppt9go5b91JSD6zc1NFdCuddNNXoDgj4p': true,
        '2A5KSnYRJVKZMepLkskqEXkRhqq1XYRGvq15PZEZPdTc': true,
        '6LcUbnDY585ndN8XbHmnbwF8P8BZsoPqzvEyWbjdsrqQ': true,
        'AT9KuXxGUeTdsfDRCRj2bzAwTG9SyNtpSFRfeLTwCZk2': true,
        '2bEPjUg3TBn8corgMpUw6jQTbzX3Na2MLAuJK8QibBog': true,
        '3EyxNd3VMcz2G4y46NzFLXXx84zYLAyk3GBjj163nQFG': true,
        'HCpesFZkPU18GC2NgAmPqBfX2yKzbfta6vniChMEQ2z3': true,
        'EMnJSHsnLUwNTyuqBGGkDhEunhDysJ72kbRR7TQ3ZEYg': true,
        'dv1ccbr7TWvvEcN8ytfvzqaBctcjDTu3RxTbTaM7mc7': true,
        '3UGYGdGBfCEtvxjB96Pqj96kJnAKtGRmvuHDrvFzcEmQ': true,
        'AxJ1nCGgGfTiKQbLVCnKp4yvbcMBGnk8Bh39yqK4ynhK': true,
        'GPJTkBhHRx2hsafLoTJxWwAzkSuNc6Gzer5dChvSuykb': true,
        '9ggpCZEy13tumWpS1tKFr2ugC4zscpWeCe4f3hBNrtcR': true,
        'DQUrzGsXp84Z4aPXLEkhgApf8TpCQqtoY87gdwUTurL7': true,
        'B8up7m7G2HfHH5RAiY9uoJBT26dV9KUjwSEC17SMk3c4': true,
        '8dEs76oTWZim9RiKudM5ayFRN5zHJ6ogai7v77p6ZKJE': true,
        '7kzTehCqfRNCYzAnCSdW33U1cSDPz1LwkQ3Ea5c2NK7C': true,
        'Ej1MYNK5hUrdsy3rVYBUXPEXmEH11gznpNfxFv4fK8xo': true,
        'HJX6xKQZ9N8iBxU4nrTLUr2chJL2NVbA2AZaCLGxf6Bd': true,
        'DPF3WstnkVieXvVPDePrqFgTVSBh2Eq8nmHGXzEET3ZG': true,
        'CbSSmVedopxP6sTw9nrkYkr6kT5o9HoHupvfkNckwG4j': true,
        '5hCwHfpiSCZkdNf5uAjnEWYMJexuNZestFrjFYEH2RfA': true,
        'HpvKtvH7PFNpe4sP31VuFt66vsdAm5SqEDSJC2cjHD1': true,
        '4sqzfiu2MvkBKmr4t5Swjp2VeMe2gPFYC9cv4R9tDfPM': true,
        '4N9kf1VRy457ffv4Scmds7H2vAGrcoeYiFTr8vkpWhCu': true,
        '3zhK2wW9inR19rYRY8ppNQGy78UDwJ6f97vkdWurS8MX': true,
        'C1XpRqtudkU3eAfeaqHSbr7Qge7agdHQ7pmjXiBYkEf2': true,
        '6RLf1Ei6cVvK9Nx1KpH5AswthyaN85FDCsLGTprfyhn3': true,
        'DFvr2HqhQhZbaYhTL3vo1kQSkahwvgDwRSNzEt2wSmrB': true,
        '5LAWj72vkhFn4nKd8kbGrYo9Z8aEQyVomgXzZG7CR2KZ': true,
        'GfFaLWJffEDdihH3m4sw1A4xMDtyHaP74sTp9aEKsimi': true,
        '6gGFCx5tK38eXbHi8Lj2kDzS7tTvi43hWG7b9qsi9oC9': true,
        '7yTqdmw6enSyVeTrFx2ucsyJvRWPLcwqrr3udmLdR5J8': true,
        'HrmxjpoXrb6jieb7KMVZxd7pVwNWPKJ69xay6B4gGXae': true,
        '3zY9SHHe9SqZkV5ayxMWe4rmgt1qQ942U11aVtNoUfu2': true,
        'HgH4JjRWKDPk1C87aekfCZPaCUZPRZkbHKJgPucHmwXe': true,
        '7j9K1xebFwVAUdQpxXghvan4tiJGEvGFKEdBsrMp3k3A': true,
        'H6zrL4vyFkzqobvhMg1xBYJWeYyL1vhyjTwLRHB7rQ68': true,
        'FtHhq637iKnaeupfUhZwx8KrNtPSqCDMMt2dyFkzkBvD': true,
        'CofbCbiMGS81N3pwvQw8ZY9ehAbV7fgDPgm3pFP3ckpb': true,
        '44qLthfyXwjrLkTfpgSQ9rVkd7j128N7YNoswjeitgRk': true,
        'F9BNHN3jyDkoCHahAn4zDoxxnv6GbXYoEFJKAxisDxhG': true,
        '7V33SAjTVgnbQqyHPjNErt49jeNHtmfgvXNz2U7MWMEi': true,
        '3bzsWCtytqk4ErDhNdy5mV2P3aBYYZvtAJTuLb6FxE6w': true,
        '2XEjzq8DfoLqg8C6NWbCNAnP1xUrA6Nb5pH4eKXZQZs2': true,
        'H7MABkCxAU8fWJYf2E4qAmXdW7Chwk4Af7XYMHRuGnC6': true,
        '3wAKUWHm5knHxMWkE7SP3xGUDBabQAUbWUfJS3Vsg7Ni': true,
        '969HL5csXcsMdja8UBAQdGcrrzCtYPGrtXC1tpDXGJHQ': true,
        '8YLRh4HKKGjrRij8app7hFjQUE81YdvYNND56dNvca3P': true,
        'Cri2c3epBcgKxBqEWbhsRWbBgRdXpNQMQraZBZPacF7m': true,
        'HBXWBJUNshxnayati6zbnsyoiZ6k9maqq7vhsyHPZEaq': true,
        'ATmxGcN7W6dyZ5M3ejERqWGRhE1QMSkouVpFTbpUjr7C': true,
        'AMLZdrwsvwVNbVXdojxgKwHubBCWao9aB35FWZzArHZ7': true,
        'AGCyunubKkn82rKkvQS1625C3FjttJrpicdMmoxVpKw2': true,
        'GdK7iwGVy1L8Zo4EkMUhWLJfbDKjshks9DiRFKkWATEY': true,
        'EsGdYAPa2T2ieTx5AzLpKBHWd2fhu66RVsVpqh6EKS38': true,
        'BXDyrff7HP4mX6rjg22Gu9bYgQFPmDBkWHA262aBDwf5': true,
        '83uA8pmLS47vXg1vRqNHVEPE7ZWmyYpfknSU3SFAeFBM': true,
        'E4KqLmha5h1L17Hiatcf15eCmSwDMuokcibNQVDeA7MD': true,
        '1S46r5DKrpUQ5cNmhdqHjYCuMwUCrFRqdDhfycXKv5T': true,
        '66g4xxDEEJkQbmwGn7V8fXteNZCGZGG95iviJARAC7JR': true,
        '6fTMjPY4raG3Fosp5Wf6sdCu6quZUHjXWfw6CUVyj9sN': true,
        'J6hULB3qPyb3iQe8Y9Xby2tWeQ2JxbDZe1BzCsdkN4cq': true,
        'FAiwzwB2KxQ3mzePakc2PPA2AavpEc5YPrGLUcDorhza': true,
        '6HRfgXTLvMWSXTwzhss7ZyB2gFVawp8Xv8tDwXF8orQ7': true,
        'HrB8YoqyUmZYKUP3MVGzw8u8JExoctepW68RYa1LHSEr': true,
        '6bsA9PqsirH4d6pLchocag7eQ7tZ17FNYKrt8jBwp9B2': true,
        '9bkWC7o4NqHoxhkFMUCKjVnC9DjsiytFaAhcuRVcZy1c': true,
        '64wdjFFiEDwY7x3PCoX27W1tqiySXAJzTzqtNKzBK93u': true,
        'HYmYrLQGnGRZ1yURDdVxyXdV9avM5EWWenHHsJgLWjN8': true,
        '3GvEyZF3euMVjBoyJRAuQJJZdDVMcwZDH4CBZJji2kuP': true,
        '5vQBiccCKPYyNm2qX1pzmat4jPy12aycG7bbKoxcDxfr': true,
        'CisReuNMmhNLBn3dDEahPz2dXQiMTZvgLGGp2s6StDmn': true,
        'CeDwjVWpCM3ZnuPijMKgkfXEyEEhDVHJZXHVeSavRLa6': true,
        'JAVmdYvA7LqrmapNWVz464jsQyggQ6zvc75hgUijsSEC': true,
        '8pMjRJeK6DZZJf1oUr6a9DBBqYtM8hvcRMNCfRAEEbbr': true,
        '13xbEsGocTQEWMnv83GoArY8WtfNxbNX1mj6k7Hd4qv1': true,
        '8ju4Npy9L2hu733R3DpZvzRbav2Jm3xhbqSEYxWJQWBj': true,
        '7vUvu5iN7gCUc6BkoSAH4xZSpe4A37ktsSShNtfRx6pn': true,
        'ERPNkeJQ5tJ7ocwg66bttqBjsVgT2YJKsHwqZVvsm4KA': true,
        '3AwUcLbUfivbthrhopbacaSPt4JgS65KaqoFXjgVHJbz': true,
        '3Ng5a3n2bRvFt3msVkKvW3BWffZad68woMRxFf3e3BN2': true,
        'BiHcF2zSXaaVRUatdxPRhgYMnzotgubxeRrphuLpWmxk': true,
        '5F8BgD3Qohiq1QpFWzXgoBSnAHqHFsCQg6UKZUPLfkcW': true,
        '5UFYksSo2gULAF6XRT92X4uXSFF7uybu98gYPC633c1Z': true,
        '8bcrEFsS4o2QE7VzKREVUhCR1xxUv2vPzbuNqy7WuDfS': true,
        '3XoJYgAkk2CMYLAqgWUbzKNtA6djwTGg7HDcxUWeqZdx': true,
        'HUVxQcWJKnhyS5inP9CXJHjGWySrpFjS1CrkhnngbYBx': true,
        '91EtWBRNeNhHka5nYYbQZHnZUQwyj57MnyayWdtJ5Kya': true,
        'BeyLofyYRfRn2JKKCZEA9KEuQ3eQvD5PEvHyHuo7gFPP': true,
        'BZbSUg2J6zq5BTUoSbuy6MoRjaBvypLwupCgTzJGyyV8': true,
        'E5dbAQXRaeQzEEZczYh3WrknpYUpZvhBS5mfZZy3h7fg': true,
        '4ZBNWPHt29Z8YettBAjihrRYjibqWPYCQEbqbR3vLqNn': true,
        'GyWxTm7PPQ8YYYrXuPiMpbsL4uaUPTk6YNqCJ1ngTrDD': true,
        'HyqfMMex9PxSXi4yHaECB4EyDY7GRG8t3R444Yo6xzYb': true,
        '7THMLQbMa71VLeVcTwL5QnmjsPjcUqhSjjo1xPjjYJ4k': true,
        'FAkAhr8sS3Hvd98phoEpTpyd8i3xFTaMUWZxvCdEvvDu': true,
        '7XCE2tXhNt1ssN2Q8iAXnTxfbPpB1siwBujcqk8hh4y1': true,
        '4Lptnm57gM6xqtaRovzVSHDKFXnTkyH1tvej5xxpkUCj': true,
        '9W5MD3e1cCX7VEEcTrQ2eSREj93BMNcG9CWV11GUqTW3': true,
        '4gk8V7KTstPPRbX8JHQg2Q7C3o4ZWFqHBS7iZyJBq85T': true,
        'CnmKEQLWb1A2ZstrL6KoFhCCR8Rv1nfVzkSBA2nJHyfw': true,
        'E31HpJZqjKjpPrdaYJyH7szzffyeL3wpUYTVHWf96wJF': true,
        'YC9efKD99j6KMebUfJLADaukT8bULBrt78EkknaAWoS': true,
        '4VrU5MWCVYx9R4aaG7TvB87pqJTNtPRe8nfyRkwpHoqt': true,
        '9H6PBTeWytonUbCsWbDZbkskNbbNsiTow9NeRETctrd5': true,
        '37Tfch6d9SC6heS314XtDGxVeQhEsdTkkXWU88u1RHxQ': true,
        '8taMKk3YcxqrVt7R7zrQYTkL9cRv7A9wJNtcMuu97Bq9': true,
        'EFwacvkTFjCQgxVQfabAimxgn2Egh37qDAkFX6q81iZo': true,
        '58EuAWzcSDeMrfsarRQ1bGBrS8xZ4nNgoi6czs3v6dZD': true,
        '7YKpS4ALZj8N3W8SFFu5ZXM5QiKn52qJnfVm9NzWKpre': true,
        '2wAY7aZfv5jC4p5dhatPiJ3CV4ZugSZ9KDpvxvSZrnoS': true,
        'E5zKNcrxaiAHFRLysCjW6Vghjr8W7KCv7qAcpHjLUEn9': true,
        '2ZwJHrLc2d2M1bf4ci6Nc4tXJG9J6zkxNc4jMfzdoUKk': true,
        'A593bRrf8QG1B397qTS6gEVjN4ny8EQrKxGWkKvDnbbs': true,
        'Dor84kmFtyHfTyEdmXoA3DRGGM7PEZEWBvKVfQU3ZqUH': true,
        'APjXuC9v8UidGbBvbFs3eB1w6TmewYFcHpW5zxH1EduW': true,
        'BVHKiG9RY4GweWK9dDLK7z9u3a42m2iuKuk7fsB9P6zM': true,
        '5zfuPAKbqn3MManygARopvkXsKUu3EMmLmzg6GbkDNF3': true,
        '9XExk5WerJFWjoVkXFPEn4u7LLiTmrjQWUaG3PTCktCo': true,
        'AhUJZetRPMwo6GWY8WR482VaJdSn1P5DPvoKVLaqcRex': true,
        'Ci1S3bP1mrn43pRYsqCQFwr1DC34pu4PYSNaDbBYBYAV': true,
        'BHg41vutmMM6tK7PYuB9MuBqwKLcep39pTUvKvMaSFYE': true,
        '6qGBm77eoeEdvnXevZo7ixjCeRDwKyRFWkthvF6uY9Wc': true,
        '3WmtLgpNQkbhaPr7KWCiUsYu4MFsQURVF5Lrn5h93vwS': true,
        '52zXd6geuXavmvwTsTMCVqR46ASXAu21HSwc1vbXibtX': true,
        '8QEB5PbNnFo3LFCSXvCXG8Z7fzByd9qobuoJrW1tAyQ9': true,
        'DPLTCs34WskMBp8nG8sFb2L8GBAznv72xa9jE7v4Bjcv': true,
        'DjsA98AYcDEmxb9qQU8tJEr8L5n46435g42h9UJLNoEX': true,
        '52LxYAgwsNgUQHDiBVX8VRZGzNQ9Wh9zi57XoDgBV3HD': true,
        'CEChEAzcZqANL56FUyNGbxuSejsxmos41FkfZD71qHGU': true,
        'GHTkSuKJUgC4t5RAXzkdJuTDFGMceu1f5eStLfH5nZ9W': true,
        'Btcxj4Ned6HojvQsUxNwpBmY98Ha7BV7Xtmze19Cx8iF': true,
        '373aGH9uLexsBoAZoX3ojFraRNWY9somo7B7vkyM5aZH': true,
        'A3gSQGVkJwbn6hs9wD6jfDQb2m2wb73ZBUPJFDjiDF7V': true,
        '57MHfB7k7bZzogLT9LZgeXY7QmZswMjqavryuZVAmZ8P': true,
        '8dB3d5Kn8YfxZNCju7rPhAB1pWp9FuEjLdgdsGoXijPV': true,
        'CqdtbG7Luj2wecKaAFEg5cfkUxRJWR5RSQ9sy49ZNttN': true,
        '9szPTaBtUxLWzfBaoqsQ5ekSqYV7aYee86qMYm82KCdP': true,
        '3GW5vZ5xGHh34UhXvc11kjJQSLk2mRTz3yLsKGMRXxVT': true,
        'idvkhRXedim4LccPDNL3cVobbnWBmiy8fvf4CasZkzP': true,
        '3C6a9y3tTbvKSHGtnyy6dnv2uwvJhsTphmCwDkWFxPaX': true,
        '96ksXGjqByhAspfrmTaHFt44FkEK8nh3wRv3fY23dkr1': true,
        'DytrxTHeJmhXozMdoECBcsKwyAg7mqLBeA76kGNNnNry': true,
        '5x7zGB5CyE6qFCiT93rkdAh29KR6Dvxyausfm1bWwqH6': true,
        'C3bPqWDKxk4G43PA6KTiWmpQ6aWYY1UoAe2uFg5CTMR7': true,
        'HumC6yVsvvCGeLVqen5ENtQstDgzVnXu25rGnf1bBn2j': true,
        '9FJ1ksJsc7uy9xS4fMKMYbQaQNinActSwa77iFVcs7Po': true,
        '9ekKHDTpGyw7rdS1piwRFhV15oXzhp9qXd4i6scaZXVD': true,
        'HpH3uKasfPJX7CGuhxkzwaVZe2qd7kxnHsM9wqtyg9tm': true,
        '65wP2WAX9fkV6y8etMgrtusxwi5mJhrPXGd1cSWUx5WR': true,
        '5cDqNVVW491JwEAyQ6Dhfv1EfWZY8bGBKrYr6bXycapy': true,
        '7nFsVTQtvjorP4SMm5PsxmY2Jr5QkqCFyo9bDRYZ7s6L': true,
        '3eYqTx5DRzuJaF6Cj4F3aoxxc3dnYUF9fggPUQzcG67h': true,
        'BcGj73xJ7RTrjrxPnKT9Zqq5uaZaLZExg5KrjKbRKZM6': true,
        '6pqiZYaE8nGQjXeZKS29JSYc9fgSoJpr3byKo2y4BZAm': true,
        '2bzUihRZTgQzEnLvdnpsP8f9fTiyK3QVoaMuRF5B9aab': true,
        'J2dchvDZQEnpZuC2262xo64MGLXVFwiFo3UaC1WX4966': true,
        'DEN8dCL9GArtA2D6ffS1P44yfkhJGY5tqzwNhXMj7fL3': true,
        'S2xmeZssxRJWxiZYhD6wfMLdwsdb5mcXuomPjejxWSb': true,
        '9FdXRGcw4c4xugrLRrQiWy2SKH7e2aLscNo6xXiiRbk3': true,
        'HupJLcsd9oiVvrPFzTL91AaH6zmeS6FrKCQjnSNH9ZC4': true,
        'GhhtrKUP4mVX3hGs58Fa8PMVJxUyVtevKximT2wxnapR': true,
        '5dYr5azpCJXDytqvUoCJgoGS3tie2dKmGKT5K9A1SR2f': true,
        'Hrk7YicaVckNq1sPfWUFSeqWPbKynP4hYhxptwG8TSSS': true,
        '2893PX5rgMMDvDp4KM8hv2xBmsg8BaaZZJBLLeRV35j1': true,
        'Ei5o26n4PykbSe8hLRCzSDRaAmXPecnUvTHabNHDWX98': true,
        'ABoNbgEDH3yUmWuuFL7EEWL4Ky5R9M3sLoFNCd4gxT1W': true,
        'HNdozvJpSuejAkgKC8BsdKJ78Ldrq3xCyCmfNwRvVc1N': true,
        'GHAsbirAjwAqR97M3PwSJdh4t1B3oSXphTCm2crz7rqk': true,
        'Aqq1X6qTSk3T1hbr7fgYrmKwTM6hE5WCFhKCfRkKCYWK': true,
        '2C49xpJEcXsEsEkJ2kP84Esd7hjDEMUD7KRbagd1ticF': true,
        '4WEtnXCmMnNtsMvnhFeoZx7UEVYmkS9VhF13mYQ8TZ7Y': true,
        'AAkuFag8QuV2xDU4sYhNWp5toS1QPjmTuXvtEMw1UseG': true,
        'EDXoXxCrA7u5v8hMQS46DqTkhHBunbc3UoScyxdLPfSk': true,
        'BRtC6aVKYVwenjMrLSXdQHFwV5UF2Ph7Ggx7woaLyDLY': true,
        '37f1oseh7sJGkeVdEmobiPHi3tYrniW61sryuVzVTHQj': true,
        'FNXFAVzWt3P82DHUr5UixfG9Bqj9YooaRJFCLJc1NXFA': true,
        'HF4Gmt1vGvYqoF1HpJ9VUUn78d1rQ4SaRwso1izhcQdQ': true,
        '57mFGd3mS7gp4eG7fNZGMQPeS8UyxTQuAuGKJrFnhvk3': true,
        'HLtgX87LSiozHaZEAofHEr7JrwbM2Ejqv6asJkS5tCDU': true,
        'GzbjBDN12Moeg5NR3tDvtsxj1EaHT3HT2TS2jzvP8Eut': true,
        'B9nmHaPFdbL9sokNM6dSL6CR2TCwBTxYhroRMzQ1Q9g8': true,
        'GVEGAgKpqUo8c21Pexsy1dyejwvznv357MjkN7A1batC': true,
        'HgisPFXVjcWvZdYfY83KzqVTj7FnWrR9ZTfHZXk94sKi': true,
        'BH5cgxumScXmkXJpcBjzxHqmLjwEFujPz46DQoyvHGJ1': true,
        '57z3EectWUa1594SHdkFzNcick574cccHuBgEAsHvVLm': true,
        '4X4mtToH8EsAdfdKHTweXeWpxY9C7jSCXnAMzvh4ssSX': true,
        'Bb8TzYbCpdYctJTJe9G7gF7mhiK7iENZzFE4fq2w4Sru': true,
        '4QL4fEbArJv6o7DkxX7wJ3D21ihh6jckNohrcFJZN3T2': true,
        '2LJqN5kFCQqin7KUsuWA6b7kDeZN1DZUTJpJodwVc7cZ': true,
        '4MTKoDHMJN2N92zT892WQvYfWkj99u2XML8M5kpGHTnS': true,
        '2GGg9n1Z1XtBvoYmEJY8i8LiCBWAGVE4dMEyU8bzQ2tT': true,
        '5bkYugvTcSQp86VL52rTJL492cmgKD6GzL3aUR1Nm1aW': true,
        '5rpyqJXtGtqxWn5q2i8E1y8AEqUw7oFKiEcBQixRCUrt': true,
        'DdDoFTdDWqeG7t6aErGfyNt4ussCYicBhzXUaZXXwKYd': true,
        'EzHN1PZg4qQ67xhUJpjxodQGLBrzNqoj6dNaExe4tRqp': true,
        'GJGHYxbgJ1Auc2Fjxxfu3DHuGmTaxMZjar3cemoQHkcX': true,
        'EF6rPyUkDpriNeq63uSScUC9D9vShVA7m71uyw6saXW6': true,
        '4kGso2sUhoMQQ173VirV8YrT8NxdKHXWuC82PHJLAqqZ': true,
        '6YENnDFUTzAunfrSxzg62Td5RFQEWywmonUn1U4VpJj': true,
        '4YYYosqc76EzjrrTQM1bMb3hgjfuAUfuBBeAtVK3bWqz': true,
        '5wJ58HDhL1U6bsM9WRn41evTWkSbyNRuKkmF5tm3gBHr': true,
        'GfFHuNG1qyh6nbgKmouksbdQoBGZFxsFqcHmcpSS2pdZ': true,
        '6YTa5gwmL5XAt34Tup7MVt6LdHPhwdwBCoWc6Y9ZBxmt': true,
        'Gkk5mdh9V2kRqP8uTYojwG4L3yesapQ5EWJ2ESnwg1vN': true,
        'HvenMwh1mUQfGKaxUPXCnmzYRL1ouFKM6r32JhXRVJ8w': true,
        '44PPqiUX5UsHvCZ9D7Lyn6npPWF2e2eDDYSuzoNPniCH': true,
        '6Dv6ujbusawwJHyeunQWE5Ye2LqvZFwVrZFgcLM7BXdA': true,
        '96K8SAuuhdVzWoQDCSH4pPqUnmW3oj71hoZUSCkB7SN3': true,
        '5n4n4UzGig9UJ7r6RuynWbMx1r88sUS45sSWSy5fbvq7': true,
        '5Gqg6gD3huJYHoZJojuu1fcfkwa4rSCFywjNbT6ymeEN': true,
        '8oG1g9u1UkJnXRPya19zgGjyaAPCjsESiNnNrC9GqTjk': true,
        'EMjodvTsZERDTQD4QtZCy78ozyjNoHdj65wK57x7tt8s': true,
        '6i1BWtFkRh3JUmFfR7MCj5QfYrfjjdUjPFYtJ4TjfC9T': true,
        'DEVUw2DMXSdUxkCHCdrXihYspKVaxCYN369N7yyf1SZ6': true,
        'FUTFVKkwhoa3vUtrfk7Ws1zHFvHCFhoPYVcL8EgCqQbU': true,
        '3HdNFvkEBPeDdakhVQUtDhQK66tNroQJAoGX2d4Jn3Et': true,
        'DCEearSMDujQ2nyHWL71exLZ3PHG7JA5xg7dNJQ8MSJz': true,
        '74DJJByiAVVhRb32ZHDqjLM9LZXaesBUBHXsigWk95es': true,
        '5NhgnGRrjEWK9hvwhMsmTJhBMPUBtjEMxy9h5PNrzK2H': true,
        'GzsMhAZXQPcvXJeNiE4JBq8vH3NTi5E42eZRWMNHnZpG': true,
        '8ajqFDbRc8xLoAEUKFauMhA6N2uR7LR55NQU78LV4LJB': true,
        'Fw38rFb6TZR8ZbfYT672h2SPMPDzcjJB6z3qvDp3Urw8': true,
        'EwiscJJhhffBAtvBE1euXjESvea8WoxvBTQyCMHMh86J': true,
        'JDcBf2yPEWEmGukkPgnyx2ap3kQmHbqAVRD8z1rKq8eW': true,
        '7wdje5kQf4AkWUYvG5LCmEe52qcck9t2Lvna477jRUU1': true,
        '8D1A77ZMHeKE9x2nPejevxUyDdMfSGxW6JGxmPjX2TTT': true,
        '5JTjWSMooEUQuaA5X5vS7WvnuKW19HR7qQgj65M3Mxjr': true,
        'H9kh16oKJW2pz4BRJLWWfoempVTS2XAbKdtMeWg4DiYs': true,
        'AmQCeB2BnEuhwzc6KAtBykyksL8H6PmczwBsbbQyiJMw': true,
        'EUBcAWWA3nzoVKFowHRr3Yt3gW2pXBRzf2xiWHUeACWa': true,
        'cw6eXor4RAqd3TMXyBHeNRbrQftRdc5MF9QZRqygoiz': true,
        'HgmLtUCgB6ke4LzNkLTMbcL7kijcpa2xuawJNf968R3o': true,
        '91Bs1j6MBmbvdvYNYA6mic6FDP9Y9Q4HJGSu4ccr3GFq': true,
        'JE7FfKbB24pMuoQrsaaa9b8VKkWCUrmdb8Q3NVrJ71k3': true,
        'C2hsFBnQoeoGNHcVcuEGbrHZahDCyAXffcWEePjKgX5f': true,
        'CrpqytWF96y8WoUGY1UV1pQaFm1TRSDEXEMoypmjKedL': true,
        '3oxgk1sNFW6bXwWXgaG4oLDhLRECQHRLnTtwps6mPwyV': true,
        '5E75xayJvoQx3cBrYB5mYfo8mctTWGq2JyqBANqdXTQ3': true,
        'F5PD3kgy7pdh7McvqHZUFa9imX8eh5UeMuobqrsRZWLJ': true,
        'CzvBzefMfF9gynsN28DBSe98ZhCpPGpqTMdnGaxZyVT5': true,
        '3N8S2PKXhjkXRKRuSiJV87L4AGQ4fj7E2WQjEVvqq3Kf': true,
        'BEgCATWjdHxYiqxRc9VeBSD8PWpZs8EfAeZ53HuR2cD8': true,
        'GV8CTMc9eK7oQRySt3c6Vj6Ub8fXBHK3seKuwc2tWeU4': true,
        '4Ydyfe8FG83CyjMtqPHb3mtySNQcR4wQ1TcngWYTiNqk': true,
        'Aj7vnjQ52CdjeC9Gmysk7UJriANC1oh6Awz8M98FQJ2Y': true,
        'Ar3koV2UFcckXnk9ZH76k8cfdHvvfW63iHmLcq1914Lf': true,
        '7Fx3mtWzkmH6PNY5PancWqBn4aPCPkxRbq4wDkX2Vb3i': true,
        '8q3TmohmWymS3ecT5K88X3r3D6Zk7ExfQnnEKpncj9TF': true,
        'HHnf74am5FGtn42x9sCRDd9aSUX5V24cPQ3fQt4AMHXV': true,
        'BCTJwCz5qUpzb8bdbeyPzSQbUZzkwBtbrHSHNUWJJWXU': true,
        'QZAXbkNQogkvUo6yKXjJhvZpkMYMcxEyMgKer4rbgSx': true,
        'YGUrV5QZZTnWjpmgR8GVfi1JWYL6EaNr18EX7mpvqfH': true,
        'Fmq6xHBVYCU5k6EhE5FkZLGptycujQ7QSRmvACsnEQYX': true,
        '77KRXZZzHMHrnAMow5SA99utNLnD1biXNhzB7vzgMqMC': true,
        '56WT987TcFfBgDdCyXqtKvEsaBTufopAPV9eQkLydH6e': true,
        'J7fsVnxdtD4UL1Qustkbeai6UJGkwh4WnPdfSCxaXFuj': true,
        'EcrvPWZ4NagfBJwZyeGUaVLYCa6gJBdJ9W3X2bELZyzz': true,
        'GjryKAWETyj3WrTW8cM6BKEuwtrcsgcGTQaW8TTWD3hu': true,
        'Fav4sJEfVZFkRxsvFbGjcKJgPsHYcfV7fW6dJDz9qYao': true,
        '2h22zrGZKGDRf3UByUTXjFF5M78nhQANZ19YBrJLQb3y': true,
        'GK4RhktYgcQLs6rTepCAokmF1gcUpL8VD1BzZvEQAC1d': true,
        '6Kp39HguPX5Fv8HGjx2TSkwWcahTNmznJyhuC6Lvww7V': true,
        '4TVQSnmCvrurf3kAQo3KxpLQVXMMWodXn1dyjNDV4MGN': true,
        '4ZDVBYwD4jd8qrk2z1L5eFuZAepYyYTBmHECtwJTfFC1': true,
        'FLqQFedyJVXsq46KpXsBJrJTDnMKpUJYBVAXbqvmtZmo': true,
        '7okXoeehdrqFKPuaj3DvmxFJ5qXNtEDCEkxSj1w9Hsqs': true,
        '3D6mA6pXzYMixt9PNxMVx1VLNC24rNZWJphAb4rDMBDL': true,
        '6kTFWf7ngXm4BeNPLP6oDa1PDWQHs2J2pi1cHkYm9pUF': true,
        '7b9CTJAJZUjKAs7Kmiqtysxogc6TYqo178ZX7jTZerS4': true,
        'CRDwBy2pKEFFuAm9LLKAJmjLTbwNJd2vXLvEm7qkXqdc': true,
        'CAcg1aemuYmn7pKPTQxatHidFV6uPZUrtWb1rWcaMosB': true,
        'HdeMLpBsj1DkHdmqNpCgNbUgGfdemj28vd2uMGsXyzPc': true,
        'D2oxtyEmBCLJxUAAfZ38JXTqWLkZ76VUDMsbdjKBAE1y': true,
        'Aj3HzwbFE7YLRnbpXhtZvaTaZCCTMNobhiDTbyisWck6': true,
        '37NYJGZjjL7y1iQV7FKXg24XnANGerZQEvCXSohPGdfT': true,
        'GPUpzxWB2z8W55aSULdZzUdh2i5iKZoNMcjdQbktBAB6': true,
        '3D6so7KnjrVB9qftWmHXwr5tktAbUJWTa34k3NrTcGC7': true,
        'HeKtxL51C2eJRNNp9M43T1dQvjSr81XmtQ1cBfJBdumK': true,
        'CwXW7WUk6yrbhLHYW1RCVG44SNu4Wf8i5eeYA1t9mf2s': true,
        '14brkJMLkQDbYdmCVqSym4nGmtkt9KsVcwXMcGRdxqKK': true,
        '417B9MwLPwXzZemPQ5QtJj4DBTmrhKeQxoUqvzhDRc9t': true,
        'ArCzNxzDUWgaHoiRqCGLLLnTrxAMkUDACWpvbB9Yg2S3': true,
        'A4qGK6ZQvsWtuFmzTYNQUcxGk6Cv2waauev5Dk5ZNxqf': true,
        'FKW6pTS9fGSLtEQRkMXjXEWzM5iMg2zGPL9Gyhos8Ncc': true,
        '47w4UJtzzFVgxKwpw66e1XP9bdJtddLSbUqUHTf9qYHw': true,
        'BAZ88j3AB9xBAfgQVxVANFtgYcV8cX47wN7sH6hkbppV': true,
        '6Y5Kz4hS3Mf3s8E5kFJ6EMdFj7xwqhz3k6c16YZs3pS9': true,
        '2R5DZTc9KXJhswNeuCoPFY6QQUC2HMQxCF53a3a7xhwL': true,
        '6FdQjieAYtfp8AHt1USy9g8U7hyYaHa8k5rbLpvwjJTY': true,
        '9gCvhnz6x9G23r18EGFWMvcX4N9JgwcMJWBHJnnuWFDx': true,
        'Hy64neHVjKjF5GKZPDFBjgUDioKMFjCK3Jh9He6dGT4R': true,
        'B1MsxYse4X54dDB71DUKP62RPyU9YsvvWiSv9m2TiBGn': true,
        '5RYqptKkqPfG7hZwLYym6HFzaTswJdGE76MN9TAAQ4Lj': true,
        '7KkD5KvDXMtP6qWb94B2EjjfULRacmYHaYiLg9xgCete': true,
        'EHtBQB4Vo9L4o8NT5YiCAyzrAvdJQmudxWKr6fqJtkV9': true,
        '8nD4iuiwaGvkXDXnYtQsEk44VLMmiY6h8Ub3gzNEyk8s': true,
        'DZPijMbWgVjXdQdh4MWamTCr7i9sL5PU77xk2GwaqtWR': true,
        '23rDQkJfgP2janavTefg8sw3ywYN26BtqkGAR7nxf7zr': true,
        '8JQgXbHoMmbFBTB3LXvTmgWRE4xuVX1BB9gDW31CpjtR': true,
        '5dxoGqiqCBvqu3uXrWMA97NVvWAdeb2yinXZ5RHcyh3d': true,
        'Ba78VX5BxhVUmD3phSoejV3YRxwWTHwarBTMKcwzSfLd': true,
        '3KGJtnMX8L5AQPsNXVG43Fazgitpkr9sqvPiwts6F9P5': true,
        'ALQU62S8Z7q1Ln1ywn1b8KfReWqKEyenAaqvmir3rc3t': true,
        'ESp2cpskt8itqmg4B9RjzDr6VXWWFrES6kwzwuXAV8R4': true,
        '92jpnC8RU2j6873McHr5LTs8rHdNPq2U2RVELzTCTdvF': true,
        'HQuWnmy1XDboFJ6imXY3WWLWKXfJF5FzzHdfnXj7hWpi': true,
        '7NouEo2WHofrmrUkhQ6fNyrrRkVYnJt88vgkkESS9MFE': true,
        '9LAGpDU4FGR146Kofe17Nu8ZwqZx3yQRy9YojvxJXFzv': true,
        'Bk9CRG2mt1kefje5PZbg2bzdtkWDJBuVxi2k9NCBzg3Y': true,
        '6xnhRZcFgjLS4LfxvG67xAERE2oHiAnetZjw6KKwvD9W': true,
        '5oi9so2hPMy2WBChEjyEZykA6Sa2B8P6A8P44Hy13gSg': true,
        'Drdn7ePcHaXF3sT1wBjdw4n76iqUcSTNc916Zjs98uC5': true,
        '2p4HxrFdnkcBLLWtaRMGJz2tAnWTKXhgWUVX8iBYLmVz': true,
        'EYZC7ozKGk2XWkCZkFDLqFoPNaKGDg74kALk1naatsm2': true,
        '696HTpUuX2QVaZcRSgRTLVpSnKjWRLuwkAdnXct6eLUd': true,
        'AV9oEkGpgD1M2E8TKDnvyaZxEXGsPEvPVRzeAJQ6JUYZ': true,
        'G9iZ5GtWNPhg7aApP2SRyC9x2Yyy66mkjcsF2fDRvNG9': true,
        'B5Zdg3U3c3mGz8fgYXqUhqvsL5CZAaRvkL81tyjhCwHC': true,
        '7KuLaHTSDRd55CsZN2yE3bmdnDcUm6xfLSuNmNARfdA1': true,
        '73n7fBp5cb5F5uyk3jffeS2oVxmS15fS5qibrhUhZ92h': true,
        'HA2sZ2svSGfgqLvJPZfWqYJqQtcAJDe4Rrez6Z7K4TzV': true,
        'GQooLuYiXpEkQcPHKDC2JNk7U8savpdXEWL1eb4mZMRU': true,
        '7YJutRU9zoweGF84DuTYLmtm3P4zbDb2msUXCuJujjjb': true,
        '9kPQhYSkonpEvJWxxhQQFBwvvEuWV2HfhoqSBRBdfmSS': true,
        '9na6zTY6yqutgHaSDbon9dS6Fjiq5WD44etaLxGSCM5': true,
        'CqcFEDM1TL8SxhWQgcQDonysE4qQbqW93JWmzR6FU6pc': true,
        'HhzkyJQj8iMuwTxGkkBHJR2PyUBbrfLpubJNChYweT5Q': true,
        '9ecRZfBewocrX7stkMwfzxFzWNZPMuFeweF2oZB774U6': true,
        'ERkUPZqmKwEDf7NXW63tpKYSqDx719Bfv9NxFiUxDh3P': true,
        '3tMCSuCh2K9376iSrPjJ7DKDz8vtDe7oZeyZSGQ9CCmb': true,
        '2F8UpFXVz92VergdG8oLRaKeUQhhEwEgzzzMpPPYrF6C': true,
        '4Fn6EwFsvy1wMAq9qQjQwJ7LWRo1jWQCMR1WD3hKYreH': true,
        'AGbVsjLFGZq1RzjsE5f42gUgGtxuoeTsBKA5gurVj6Wu': true,
        'EuRLtQeAZ4BurjLJ9CopHQivjbHbJNsLBrxyxqBgmymd': true,
        'AV49RtRUPx8n4dQkzWLCWcBWU8kf6BsfZGgYmbbN5NQT': true,
        'D9GVrNG4GXhpnqFPoizh2xL6a9SvXCeiUAfBxYrXLqN2': true,
        'Hhrm1xTirWKfjB9dLKNUPM6VGF5cNDF8wUqwbrS7VuC9': true,
        'GbxoUnTSCvvdpL5sgAFdDk8zrVg2hg8h1sQ486uASwKy': true,
        '7BAqiLdbYv2A2UPkf3RPsRdmR31PhmV1ENYCASoWcqE8': true,
        '4wgQdRTSyU2PS6piZ9Ew8WuWfZi9jc1u9URfJWyi9xi7': true,
        '7XqmFFA9bAaq5k1oKtVcPaS8AeLx5NfE9Fi1WNYNekAE': true,
        'H9EkunfSFsoLfJDs2uJ38sxDhY9VsdLZxQVX3Uuubrju': true,
        '8DKj3ogZ41nDjtsQZhoW5khEeYCdEdU5PAxZ2gjc52nL': true,
        'HaVRUdjzwQ2c4cUtDpBEwr6tt4Bpf2kEcXFo84n1cYH3': true,
        'HvR7XmPUNVgiGxv6orw5Yknp6M6Arpco3rKWFocRmG3T': true,
        '7Gjck1CBxuq7dfXNYKXZqZFug6bo9nbjRZwvZhJ2imwc': true,
        '5bGVPErL6k1HdLx43VefiRzzYW4CGUvo3BPYQLKzx7JH': true,
        'CWAHHeRr3zHRq3SKJ61tNyJuYfQqXzxZbiDPP4tLn37D': true,
        'DJuGtAgMX1E1KCBYJj9RvPjkLKsAtzXmChC1WPHijauW': true,
        '7XhBaJ6jVBCMmf7konq3rP7UGv7PYWB5N6ovBb8hjyo': true,
        '2Bk2tNcQdrzegP2RTWwcrffWNtYcsC9t4wyiRw2TJTq7': true,
        '8RG96P6jdx3EzXCgAw8vAT88YBM3MnqsNyZECMzb4rdZ': true,
        'HHrKaJYWS4STR1EJgN6BfPFGaS9qqKiSo7AGvkvPx7Vu': true,
        '3PY4RQunJPrPBPoTVEbeyHHRVjigfvv9D6niw5zHoXL7': true,
        '2eko6XJxLbPsd94cL3EdxUCputsKZB3Apb9hSNBqC87e': true,
        '6aPYnB8rAoBu2RabuAkJCZ6C4UujQ1k4xdoFmbFtuhKu': true,
        '98nCkfCe6gqPwpqvT364EiE6P1tTe8FNFtuBvRZtBenh': true,
        'GVN6J3waLU6GKiwGbQfVWZc45NPjqDeLVqPUkTboGdG1': true,
        'DLtPc16kWsVh66wxUKtTdH42p2NsNDP1kabFJSkxp8v6': true,
        'AkHmmQaF6bFNpvYGJvzGswDyt6bKKBntXDmwRHrkSjXD': true,
        '4uwrSMKPrx95j9T8XsXqExw7vsRFw6W5XqoDLVXS84y5': true,
        'DRNYQHevV3pgcBVfBRwpLfd9UYXtrzVG2AopAutwZjvE': true,
        '33LkWn9XJXovVibRtAfwv47eZyYfXvg914mcB2D4inn6': true,
        'BoeJYaCZcmSE2a2YubyoRoDvp4WXcNsL6SUWujQbx7AN': true,
        '2jH29RttAYyyfn2JUsRRkRnpZWVsZ83fTBaq2cBGtFLe': true,
        'AsvZ3YrRwtQiJbzULfW7rt6ApFYf1aY9vkCegs4zCesd': true,
        'De6EFvhaWgVTYwhS7Hpx4uA2ULzQSCyv2FbCNTceX7uJ': true,
        '5wm1DKB8BVKzNBRmmfpHug9KnftM6iFy78kQ6Ywfm4ki': true,
        'B4o9kV28w5XcEkJmnXKXeKYG1TLHtSZpZGq2Wppry361': true,
        'AVUgqzzaJGq342HwG9byTnknvWEhgFWsyaNjSP6DezuS': true,
        '3cBzHt3Y4JXnRqZux15zth6cXaYruFB1yiaSJvdBZ6GU': true,
        '3BJGmV1PpEwbYjwWgN4UZG4w7owjLQhLXwaNvWUjzNDL': true,
        'Bd7HoLvDQf8omwyrP7W4SYS5fFzKLxYnq5vnrtKnwKh9': true,
        'gnmPsVp6Hx7Zr7hDiR3P39Dia5SEWerWGCKTvzvyxsd': true,
        'evCxaxtm9vKTF2KM82yw6LpxxQA5ABqYSH15BRzXg4T': true,
        '5YXYtMmqogV1HKV7LbotrbFH4vvfE4HASHm4i5teRYMW': true,
        'DUytVDTipf8KDwZixPzkcSjZfc3as5PdAz8rJQzmvLr8': true,
        '6D7SS9iyyGHN31tYMKg4sfo5fTaAP561SohDb7XmUa48': true,
        'VyzBejFuHmM6a7NUzNEY3nd1CFhb8cjfVZS5Dhkymyu': true,
        '4L7aLbPqmJjoppQ472FsKW5HVVGrzjy99LLVpaLkuyJD': true,
        '74FJjfV1YAwPd4gmjXL2hZfVqRf9kP9GjCy96YqEDNKY': true,
        '32CqKPXYazfCnwGJ8AoByjUMbyYTTtnZnsVHzVUA6Hpz': true,
        '2rJ7uBxLQjrUnvCpeEgHN1gDFmzzY46EarJqtjkDWhFA': true,
        'Fs2Dg6ar9aszRv5x8x3vpxA368bThiDdp6M7zDzeqLVV': true,
        '54A885SSUBishL325GNTnQo91eReERAzcWpB3axakoPA': true,
        'HV9RnHWLFCTb64JVELM7rZwp5JsYFjrJyN5zBRKDQb3C': true,
        '4U45Ne9yTzPgfJJC2mWdf9Sd2gX4rUNLokD1YDDRHpK4': true,
        'AzfQURpHyyQTVGEx7WAER1rjCTD9SNp6NiCc4VzG3J5i': true,
        'AerJMMvy6WKrYiJMvXL9b1dRM1it2SqF48KezxUgpNXn': true,
        '6jRCd56UhRLJkavi5BG2KZoLMpviwGuTDERcjz8Ww3NV': true,
        '6LcmDB1Qwz49E1fWdZruTqRZPaAr6hT6htb38TTqaGrd': true,
        '4c2HPFAGqyDHZZ5QxhQgELbe1rEkhtrMbePgZYArD4yT': true,
        'F3VETp8RkS51k149qtcLU6WBjRzqWcR6VyLDxMoXSohL': true,
        'LwhCsFuYNHY1AHJVzQwzQPrEfFeaRsz9eZRgAiCpWSV': true,
        '4BA4kcCgqVbWxWqgPdFnvvwc262LvXmQ68Nik56uV5ZH': true,
        'AJShxCo1VkG1o3UjmEsKo2HimmgsAczbZYgXqPRq8noC': true,
        '5b8HnVdQ6CGmMbVNvfToJWietLcuzw8TUhPFUTDMFgFF': true,
        'FtkBUoGyFM926qcK9n7fpEnASSfoxUTgpY6TKb3KcZy8': true,
        '4tkYUy4Rao2WJTJRtvx1PTW1gRzJWde3DLjQr3SZe3bk': true,
        'EgVKHjuNHFAGZXQTMwWkkfsTWEmY1fFieSRizgoUfEgN': true,
        'BYhh3XRL3Fs8MhjWPDGT1hCFxzeHTq9LQ8NAdjwXrwu9': true,
        'BCvUb6BjYBfvsEoasE7nRaL6YazPERjsGhpJUYTiKQVh': true,
        '4ruNCAPbo9pUScSwKGWDn5MKr6ZdHiX5jBG5qGQNGdrM': true,
        'EMYDTanEahK6VLFMj93a24V2WYaEDTe4TYv4V6vJ4XST': true,
        '6p7EBxG1E5yzNcUkqr3MynHjB6kQp36fX8tp9wjyhApi': true,
        '9MsHp659o2NAZNpwkzdbqhoadeMfrCmV1v4HVCn7D15K': true,
        '7fVaX8Xg9ga3zkLq8StJThhoMXLwisM1t7Aa8tNcRBYd': true,
        '8obPCc5fdftwaLCit45EGcGSXbfVFWLYwFfx8Z2CnrF': true,
        'HstWWnp2Rg3857gFkpMKeDpWFKcmcPfkXVC3of8phdGN': true,
        '61MCgkUu4ixzj7MXpCPeoccRJhqq1BokuVKn7Er61etz': true,
        '9LNPhqV8NcWSRRr67sXkqhpCEvFVAcAVzDu6joKtqU6J': true,
        'YDybu9HX5MvyDNeYwcacqMhwX3v1sebXZViTdCiveGa': true,
        '3mAs7Sn84xo21yHYqeEJNwDPGQqKGLFfgSqzbPgCfbvU': true,
        'BUf9Q3YkDWyMm62qGH5YsE7onDwvSJB5FTVuU5CYFPxZ': true,
        '7Tgs2fTH9Ya5CrzFD5UNDDJEMcPhfMWBMdnS5FaLD43m': true,
        '2SgsXSNngSEk9FdSELd5vryaRKrD3XjSqsz3MfNDKLKN': true,
        'FhTTaLeCdnVCayt7heChK2sTXBHwUNgapyfr4TEsE4rA': true,
        '63CcdFQHPqnZHeuivaCgu7K1bXc531fqwYanzLvC3ZJp': true,
        '32uo8hfduCYuyNDNxfWCKNDpZb8A33L7f3zzjTY5eyeS': true,
        'H3DVsjn7z8SaV3nmdEyAgd9xM8hExvgDWGERmaxFJhVt': true,
        'J6EGq76EDfw8ovkwVeRaEoVThV6N5BhWyMAeWoWUYVkx': true,
        's5Z4MhGScxcehgMJuyHkDoGRDqWCK2J73JKp38wojm1': true,
        'BoUMwzviWr4ERAFa9aMQpzcfzGpPrFbZAwqFvcPFLqP1': true,
        'FuN9uM9WbCtiWevNbd218RMWGgA1tpgS3n8zGLjhs4AX': true,
        'CATAdrcEnHTMurRhG2CypXsaCahFukfjWUQmAu4VxVNW': true,
        '9WdJcW5i4WYCyVeTqeQbzJEeCBAgcUusB6Z1yF1aigfJ': true,
        '3Nq8qqzCqJnzyCut2Yq4d9VFmvpsKnLjPVEHeApC1aya': true,
        'GWQBi4mv4HXZ5mgihKRgxMLXaYvcyPhaLi1f7XJqE1HM': true,
        '573oxqGrsm7boe4bEcDxe1ytfWNsVf6W1uPcXY1wT4oZ': true,
        'DEatMxcBEv5dhkGLngZhP6B7yk5xj9uSEpp89j4f9BXy': true,
        '4CK8TsMtjcrbFT4uo2AmvWzTGjDUYRo6BGqmzE2Worjs': true,
        '2vsSr7Q8B6cDmiTuSeXLTFwuLzA8rNYdpUvracZ5pkUU': true,
        'FTqpBY3TCQzAqHRnSUuaUWoc1rVSAp8D1196yfSqPRdn': true,
        'GrjWJ1AGuZyCghM16CrHFC7FgM2Bm8CcqoNynhnRFDwp': true,
        'HY1aAtrp7nYqiptqn7vQSoZ78G1TkqJnmJ72zv3GJWhS': true,
        'Wi6Ev1G1QDng5tYj45mqfdkxSSY2Ncf7cK9gso9mHAG': true,
        '6FtZyveEE9ZDvVLoLaaacyAs785i7SC8souwvvtyaC3T': true,
        '4T8XUShaL23QiLZgG1Qv1Uy5KZDuagVkNs1ER8K1WtyT': true,
        'BFNEC8BZe1hWEhaewqtFirHziV45gDJsVXLrE9h6a4H1': true,
        'DmRiZPGqi3SWCb2pcQTbxSzH968Sc51CJ9kLasGHCLVZ': true,
        '5sMjGa6eBTGKNdu6LNFsLMCvQPPxarh5bUoGPWkw7AaZ': true,
        '5biSpEvenUbJFJu7e273qZ7a1YmVtxUrGSN2tUa5wYGd': true,
        '4Aq8S1hgZPVy8eNoYG3zQeUYHNBFqs6JyyAcRVbaAKvw': true,
        '7hYPBmxUCfqsvHudJaUPaJEQ8bWFCqctei9vHzWYf8tj': true,
        '2BgyxhtpiNcYc5vEt9i1tyacyXokCJLkRGqGv3JfcWqB': true,
        '3e8y6VG96ciXBnRANXuniqNXAEhcWe1qepK75NWyEFE2': true,
        'CTmWQ7RWdCPtub9ABnJSjWLfcQ4PnYXhk5QGq5WNXe6F': true,
        '4erXsoZvH7s4NAHkLgnjQCrbzkXNy72srhiFdBPQCsVc': true,
        '9zQJ7uXgZpzH8yKJiybg9KarTEtn2e7FrCNntwynkvjx': true,
        'AzcP1tiLnRU19dPCWjW95jc5wHGLKR8VKWtbiDjkbDBd': true,
        '6z1nPRwkPtShy74FGuf2zLMrN7WLNSZeFs7ZGn6FtTyD': true,
        'E86KEYhFHcRbUAZNMzsq6DYy4HTsw677b58y6ZSRypa3': true,
        'FfDmhbW749zYoHLnMHSXYQPA1tpa6UsR4ZqjuwB9whxn': true,
        '8xYDYV6ix8aUh1QfnL1yMyfkitxWpHzMcrsSCvhQFZh': true,
        'FAjS2YeqocCz1XXXEfYrYKF9cJDSsSuB9oMRdAUZ4bZ1': true,
        '5VroFVcVUdHFxd5AK63uFFtka8scGHmot6TvNQ5cKBA9': true,
        'C1ncsX9UPcAFhJLinKrxbsbNxQ4ZQjroZhjKCt8mmYXM': true,
        'EcDfAQxQ9jASMDaaLu1QWnDUM1Q3MpQqYabZTaSc768Q': true,
        'FUGynGAxwXBhZrKbLpjkiRY7J6eKTgew1Q9PivQw8fB5': true,
        'AGHDsj9TGDfFdCox9WZKnkmKoLJs7iD5ovg4yBi7Hz5n': true,
        '485BXWMQBehfPBuRjvpnHQpTTxGHkB4YGkH4NDshosf2': true,
        'GsmzjVt3wo9HYR8ARxzfUEi7Z6hZzkYco7vKznAuaCVL': true,
        '4ZCU8vCwuviJAWX6rP3CLJxkra3i8vHsHSbFXZdJFx1M': true,
        '2ctN3Xs5rVMozHMfz4CLGm3MUdpZHZSnPw6KWc8Kh4SU': true,
        '3AMCAj7czKKMzZxJ6ZUSPC6Xemgm2vuxhFrddMuYfNBg': true,
        '2zBJyYsgJpC8drtjp3NgcY1yKz9kGhMpEvoDFkMhrVGx': true,
        'BoKnYm6x2dvowLAnD2Zb7s1vDt8WGQRU6VnEorh1sM78': true,
        '5sY2pweKBbYW94qD2RpRRCyX44ypNof8wsTbrDx6XRC7': true,
        '13m8aTaLgteREmJxxzFZvsLLv5oWc236kHe4LAzzMNB5': true,
        'HCGhfgaiMtWjSfnqghoZUcf7keodBDKG9BVUNCSnEUJU': true,
        '6baz2hVAauqnX7yw9aNppixVcEejUbSCQQuHBVUvXSu7': true,
        '78o9Bba4r6XjLaHjubmnLTUmH4H4fXPKEXLELcQ8QH2P': true,
        '9vcuSiMkg3UH8DXsvCxBentACn3GyJtkwY57FhVj54jV': true,
        'DWeopch83Mn8htyWozEvg6AaUDApjDfnVJq9RmkNjLo9': true,
        'AEgg1U4AEDRYQfpvLUngQN8mgpQFFZDUM4cA6KucQUA1': true,
        '7aMNmocPz2KRPLgvpvyFVzgFQZeQyDDPPgZrvEqiKpLM': true,
        'HdUd5mBx3RxH1AsSkF1tKPvztWBpJL2Br8N1MD53CpAm': true,
        '6BEFopBHm5Kog5mXsMzSLHKY8EEKg9pr2DX8Qp11S6MD': true,
        'DyU7k4sZ4KiuKzxUmwbAdjKDe8Tf8fDCoir3pbisSZPv': true,
        '13GpZrRbyscTBfA5RJ1TBgHtPpZkUiPAGTqqGZT7Ec1t': true,
        '7C1tbD5ZoU1xEwRGn5YheetJ9BgYxvubsVLLZ6SJarrE': true,
        'FDZ5v3vUPxJo6ZaQi3rbHD6ScwQNvpbVZSchvV8Rk2NC': true,
        '6ohbzB48AbZanXWrp6H8yQSJaBQvhk6EH48VDvKB7Uqm': true,
        'FdZy9eeFLeTqeFBeaD78QVq7pXEoL1T3wdzyLhKQ5oD3': true,
        'HYSwsaX2CFx4jWs3hVXt55oJSHp6qHYUtTmuRGBnhJqw': true,
        'J8a7jpS53dYxCWe6sxiegawQReJ3xbizgVhWGq2haGzG': true,
        'BifjaMfPKHaThgYfYHXgX4MPWaKbWfEFx1cD6tFuDJHv': true,
        'GGMbTnNfdYFU2rqjqj9GHrweBFZFW21wRSKtMZv3YY4b': true,
        '32CbPJJr5puSmGgBDbBXbae5HqG93QNNEbKn9CMaF9CB': true,
        'GYyepHy9gsthzTwMr7uyDK7dt5hPhXVb9bhzcWyzqhSK': true,
        '47oxuJwHXYvT3eWyJ2EPEBsBWmqMN5Cq695JUMgXrDz6': true,
        'HF2SjuyDwce3Ebik3khNCvDekcBbRNMQNVnSwV3p83pH': true,
        '3pwNmURpq8cwj6WWV8R6MpGhPRZZ9C4fGHcRtRszNXGQ': true,
        '3rDYoHD6DtLUjmoBQq2FqWmRGpfQyTnUVr8WHJW63HMW': true,
        'HikoXwviNiKUD4sRL8b7ViZHB66EK1FjhkGjUuKKCeJa': true,
        'A9HqXTGCPfqcRo3QaYhNZa3GeZ7UZWLbaSBvvvk33Scq': true,
        '4vzp1R3vaUtUPXmnVn5EANYv6UrVMhKAf4okLjDh6hUu': true,
        '6bLgo78aMo2rTkvVd8mRRG5X8tFPURR6mXsnFfQcp67F': true,
        'E2HXviTjfdfGJVrrmqBRGNG3WwxmW26ypfk1y1Xiw5NZ': true,
        'DyaQFLm6PmB1Cq6xLnuhezyGP8XUoWZD7gKi7URNGF3o': true,
        'vJ3sNFaMhqJdRzLtZV9w4EoPHHyWiYZrvJpVmrT1JxP': true,
        'FYCJav2ZBpvqTV5pR5ch1JSjGb4JAM4c7yNyai7YBqAw': true,
        '62pFgsMPfBLPqnWiAZN8waecoaxxqn8T8C1jKCVW3xg3': true,
        '6CfjLiSdpnmCiegeccLPiB7vk13hwfLGXmn9QfXqEtrM': true,
        '84aN24BJMFmEFJWFoicUUaRRaKaRJsc2NHBkfNxw7XpG': true,
        '9vko5esBq3UnuRZaVw2HQRgQCy89Y7KFPCZiTNfqGn2L': true,
        'GxhXfCV1J4iYWUU7XWbjZbViwBfpBjb72Lzi7KNTBrYw': true,
        '7h2mxZtCLtz3GapB4oSbNapQ2P31pSPWHuJxUWStSrUc': true,
        'Ha4Zm3TGigvzrpkKk2MuMEaFPYqned6Ko7x9LaBhgjYU': true,
        '5eF9bQeBKGjaRPW7boVi7ohnfKP6Qhgb8KCwhf1LouGr': true,
        '2Srh4VZo8mWXrE3w5XCUojrbNgVVTLSoXRW1hFYeBSNJ': true,
        '48rzkZf5dtkSXzRGezNdgwWkJti7bQTU1tezeHuTA8ph': true,
        '97c3MestD4ih3G8f3Jb233oqDPhv3WJ1BEWmtLERfLZj': true,
        '3C6tu8NieZFzN7LGaepFjokxN837P8QuL711diW7KLar': true,
        '2NVhsTn8NYJke8PLfCbW72MUNHxcUJXF9YywziAspBGg': true,
        'CeBgP4xdcgFiadmt1mfzeyoMZvD3r73mY3yatKixqk6r': true,
        '62n9vQuTJHDz1qqTercVjAh6ahTcmqtEnCVe9QekktcG': true,
        '4WbdYLnKHF22w8MdwZzmtNsSs8QoLANVmeVh9Nos9ia1': true,
        '5z6fttXPEZzFj3CfMye58JfxdnsXgUuRpmzzvX6QQh7j': true,
        '5wjQ5HZo43hVfyn92WAnGJ51BtTN8UcVg1YiVHLxdD2i': true,
        '7zvCVvhdP9oFiyzGShzt9yaSssPT2gbGcvDJaoSPp46p': true,
        'FPsVctxdc1dWzpCELvCKbVT4YED2yPhvezuqJDQoWx7h': true,
        'A1ysfSN2WbUCoR3iG6XKuKoxuP9ysGxKZ7JeSKSBDhUm': true,
        '9jCwYZ9knZ7aBPSUpCysXpedX1j1XFqs3fPfdvTWr2BW': true,
        'Fu8PB3Cu8GA5HwyAGWkM8XYwpqBWmRX3g2EcaaPb16Lp': true,
        'AnqgQWXELWzNNRWsevSejWyzoYGM4UdithstDZUgzR5d': true,
        '5bs4utMhvYhSDun1vZAmrMNaBV8ou7Cjaiw1gwVnByd1': true,
        'AxHgtp6eW1Sh3ErLEEjZ9HMcykNmDRKDCsiPbDaRGSCy': true,
        'AqHthR32miE5XyzqEVBdWFE87r1A3wJLFzk3DgC4pmib': true,
        'AYpdmi4voeBGeoZdLULpqfWc7h6x5QMvQNiogx1sMZVz': true,
        '2vg91QVtK442iP4yfyvkMXC8QwqZfLgx7JzhMzDF3PbS': true,
        'DehcWQXn6EqDfKHLU4M5ffEhuzG9k92j6AjQc36YpqZK': true,
        '63trfHUHqFeK2msLNHQoc5Vzbu5BGcafaPpj7RF2KCxT': true,
        '55A3oCUYhsMKfNWY1NJpU4ReNHmN8c5Bx1JuZAYoV4Fv': true,
        '8Grp7Txmtzu372qVPbofpuzMXGUoSnyLtB7dVX6yJibF': true,
        '9euVeiDRzJVsLjUJcFZjz1YJmDBq6g6Gaz6BeSCbVTUo': true,
        'HvwQEYm5chi5biyfrWJ3q7aGV28x3DajXLDMuSjP2a3A': true,
        '6pBciPjaFoPDwekC2CefV6ymtojAhRkSBKA5ZxQdG7Se': true,
        '9eudPLrT1Dyj5Lx1MvtWDta4XHNp9RaffPjhKq5Ku3c2': true,
        '5LmCw2VEDvo5wD9AF6uAM8hb7WNTifeEzfvmb1PsvPic': true,
        'EhqvqmXftSjVV57Q45itZrsGGKMZR2ZETTdKZuooe7Hi': true,
        '3kSu6Nd6cCH7pT2qM9jDhiWzufM8xVZ87cfgVmmApqbd': true,
        'FwEkvAJ22NJu1dcbKCzTZbxVNXgYKR99zSo7CsoWRo6D': true,
        'DkSZ49EaGRjY3kBBnXE4TB2dFTCsZKxJvbyNFUDEVv8f': true,
        'ER9ccPdKWu9whjs3vWonX6xCbdKNWDdoLLBMtSubWg5p': true,
        'HQUQ9TJAcPJMT3n4PP2HSQe3LuqZAGTEYugtxJRJC31T': true,
        '8gdDrGsGbL1svFg9MABV8bZBmnPs9KxWXCb23cXU7BHn': true,
        '5busAU1ZB1NwuwWw1Zj6cK7ETdBQm8dE4N3ZW5H1tF6U': true,
        '3XRWPiNK7rjrTB6Atj23mmXQAavc5UnDeBs3Efv9u55u': true,
        'B9Vstp5x9T1y3NYSdvBfEdKXBESRyGKRuC9iMxK3r5M2': true,
        'JDwSEQLxz6Jt2L9kotD4HkxripWhuyRUTAzhzWujf7T1': true,
        'BKFc2QaCytMy9zZmbDtg5qq9F8J4uLaqvMqmppP3K4NT': true,
        'GyHYwNfVrLniwi7g1SYV8YVX7BDxeu1rqCnApMJARhLf': true,
        'Gm27z9kHq47KjcLHLPi94t2UzZaHaktgEEWPZsidzXPn': true,
        'FGnc4mYziqTwDwrEaQkDBQTESzfy8KkktCNysTNSF5vb': true,
        'Hw1VJ652gaoZx9ZeTH9T5cZ7WxTRUhKLoEuzA8PhwmMZ': true,
        '7LvmetLeWkEDp7zQvc7kJ1bqujdQFqm36NHNYtYqSnhd': true,
        'X6QKFU2mEgEow6KCWpcTGBREipAwBtAJJ7NzgSQKt9n': true,
        '7mGYEgVh9QyPkr5BQmZ939BHKk87FWcABwfbXdsWaKHF': true,
        'Cz99r5V3Xi3Z4GRpRDaaXqApzT8RYCH2faQPnbx9BQmB': true,
        '4khg8WXouAk12NyTPBLedP3rzkTnu3spJsV1LmnNuWVQ': true,
        '2HtTEryLabBD19X6DRSKkGRmV62CZmeEA3Nb7AHSsWqs': true,
        'C6Jqc3ZjKSLUsTew7FzyMYSYKei8yW8RNHD2Hd12XC8q': true,
        'E4jdYnTpBE9mWLfDp4SZU56XqzSyDNUMfBhXSVT1FWdM': true,
        'Gv45U1jVcSACkLqnLkvYrdBf5XktFWHPh9ekpYDrjJne': true,
        '8JsHENhHY5FaHhHZwHUsgeiRjDnf8iLDMhzb1XdBd85y': true,
        'Ni4MafxsQVorVxXLaLxszxWp2KitFodE4wPFzngsCjU': true,
        '4QxqUgRz1hegXtuM1aPonvKbeGtqAAbmUYcNpt78qyGC': true,
        '3cvPDuCVgBPobQgpuHE1EBCq5GDSeZFGY6rWpdLNC1FJ': true,
        '8Z9RYNHU2FcSA8qWeK6outoH7ZBNXQV7rGUdvJJ4ifwq': true,
        '37H2Dxo5S4pf4cBN6SUM6V9T6Z1p3CmrtbBmuLjv7AVM': true,
        '7Mz1B7Fmp5AbfqHRJmHRicz2dsApDJqTKfqJ4bFfXCH6': true,
        '5MmwzgsGvEttgVWkrFnjuRr1qPoZJrkSwcwDY4wBs9yB': true,
        'BhhaUfzREZGQz3utqowgggruk7eLn395pfLBm67ecUEw': true,
        '6JaPjqmmgL3A2VG647BqrbgnuyYHSgZmx8y9vZoPpg6x': true,
        'FVMLkzaDciF1vbTpML1cLgVxfAZyFK7mdZnUC68S4Vw6': true,
        '47fpFE5n5upMxTMbsZu6NRozknaMWdHxaFdwchioUmSr': true,
        'CbqH1b9NiZueK6qp9AjDqzfYcCyTLD1No7yhVaBcPDu5': true,
        '2unqLiscAJKxeS9qD1LHH41PP3W4Bj9fxxZbawnM9F1s': true,
        '9q7X6uLqYvjuZh7kxPNua6srLD2ukLN62PJCdVigxEcQ': true,
        'FSPidryJL8HDwRcSUfsEHy1x4cdAv37joaedwoLp8anW': true,
        'AGSyFMdCfmGf4Z2fba7qrNbiPvKEyVhQvi9mpD42uQpQ': true,
        '5YRzujydqTyWpmHtrzFvqBMfZjrWkzSChgnj7nN9Zcps': true,
        '89DuHkKizwNkELM6nkaGiQ3JyRqKahDcg2SJNBXA83Q8': true,
        'Ed2WDk4PqLDcfnjaRd6ZEtnbWyhGizQ6KrRnW6MxM2iE': true,
        'Dt8S3KHeyoYCX2XUFCBVwMAXgvJxoiK6x17LdkXCN788': true,
        'AXhDa7GmsLzMFh2WBGYHX22ZW8MuA6A6no36jNHBjJJT': true,
        'GUBgkybtZCUDwRG7gLqctxaY2Lb3juvzBA2RJnUsW3Jg': true,
        '42hCoaDvRVcAJNPWVCbHS9w1X8BDwtywmXnEru4cGsmE': true,
        'AbPqMTSzzTNyNjSGS8RPPD8Cj6L9M9wzFCyJ9YtZmjyr': true,
        'ErxJP1SmHAJ9tiMFd5nu7eH3psN9aPaZnmJ4nTZRjFAk': true,
        '2VfM2EB7qa858puYVK91pJiMync9KQzfLpRQvy4McUWS': true,
        '3WJtNnoeRqj2Ttq1nuKF1jdpFA2STjGQf1cRhgFqth12': true,
        'AcMu3mCx1ru9GQii1hrEeSbM4huLMY9UTKQfhCncqVPD': true,
        '3YyBTUYuuaA6zbEkFtmzYJC4Psxmg5QptbiFU7sZHURu': true,
        '5kHbnNeFJ56pzHNGcdb5ppxjFSMH82nVmzCkTbjbMaA': true,
        '7Ten6W82SDX3QM5CVnexpTyeeD311Ere3xuq9hZ9eT8L': true,
        'CVVkbaJ3vMk7w1ectfXt9YzQH8QLinAb9jTVnRMG9XvK': true,
        'BYcNz9gSzCbRPxTLJSQBoKRYxxtn4dZ7XneBTTaDaaid': true,
        'JtzHVUvJdmNsC3t92j2fnAUR6R34TJ2pBFCDWS7Z2Rw': true,
        '465s285qLKgofa4hX1XcrqzxwiyiBQmVYtMB4o6YyUPi': true,
        '9mihBABSuZ1ZfDn2AkDCkXGfFVaAr3oJLBeTq9D486Mk': true,
        'AbJLZdstVj3nuykToq2xtTU4u9XzYHE9UWh1q2Yg7GYQ': true,
        'AGyyzw9DU8yNjt6gqBw3mSnpsHzuqXSWmBKdkjAgEZ9u': true,
        '5Vf4ggb2bZZUz45iBCBxkWsepgSK9SjXkF2uqXzofZcr': true,
        '5Neq99BspcYQjwAg44NZbnggLrorEzo1NUbXqqZZUuwd': true,
        '7tnvYnE7Ja825GtoNqsC2iQ9Eb3eSua7UKhEJjh29bMx': true,
        '4WUm24d4ULfnqQHAazFTjHAdPArR7rmUcD3Rdkdi3Z61': true,
        'Ar6rjMeDgytRxKjqBQ3VKs4NHDaUJSYyKBWW8WHRJ499': true,
        'EcsHEbjRQMXv5Rf6jSCDYtSxU1rQapzJVQnFUpFLRG9v': true,
        'EnSZEmnCc6ErhuSCr75FCnbGh4LESRbVFz7sEEEw9dJK': true,
        'Fxai9JjPq4qNmijZUTkNtEnsDsXvkyoh9ZnK4oLddR64': true,
        'FK63tbrMRzfARpMBTeAjfQQTSb3ccdHp93sbhh9ibZbE': true,
        'BuYKbAgSvP6DUJ6w2VFXgHQhMo5LHtRN83eAn5UmMYCP': true,
        '4s7DKJw8Rc1iRU5vVsy2uG5CikqRjHb42VZrvDHnDcL7': true,
        'FMmeBVgZdWv5TPFDokNkYoTHiVGnXrc7rePzowF4gV21': true,
        '22pwkZAbx9ffAkZaogPNgY8JZpTCzn7MacquK2iF7vyQ': true,
        'EaFrAB5TAgNimHUGsWiqAiiPCpJeJqGTvbyqhqBX3dFp': true,
        '7NfXDLTyhg9yc5PhLHQjk3j3Ud7Kh5hbw3qF8hKUTM8E': true,
        '4SwCy3FArQHtHVefACRQhBXkopZUZXBKjV4jAAs4c2aq': true,
        'AC9WjmTAgxu9Mh9QvrXCJeL4JXaATp4sKuspS2KrMvxZ': true,
        'Czpii6Cqu4P4wwvi2d5MnEFaLkgkUKdVLeo1E8ERDo1r': true,
        '2uPCp86F5k8zDSt6SgEgH46icQSHtnCryxPERAAV5bz4': true,
        '6jsLqc3Ya3NksdhLmg7xCRFG8YYWPtRp8zcW1CdvuQ7V': true,
        '6XzuWS325FTm4TkUiFZ37c7ToHvS93EJGkyRP6iMkJNV': true,
        'BjCwHKfPLFfMFrYutQdy1iy4LgdDK1wUhk95VHhheHvL': true,
        'HnFLhQWCnrjAt768gUngH8btj54ik1aoo43qzSGaCwTt': true,
        'EhLXnNFwQMrzTZKEmi33YpEyyVky9dQXPsff9xhP9tXH': true,
        'GV2EaYaJS1jw2edYskV8dPCuKtkdjrhHuyLy82Zk6ws4': true,
        '2Ev74c2iS9zoTZnrAsUwBQegsoAgLrZqWNrfB8ChSvku': true,
        '6hsXuXwhdf4mEjpPnfaQLL5zoTKzGHYVNJozbcxnMS4j': true,
        '7M1BnM1EVrAQVkxfGtNqxarby8TtwAdihK86gZbkH5tA': true,
        'DxMN5ztRKPcWguNwcPZc94q2e9FmVQPf42aTipH6XSqa': true,
        '6fFv9V7eyWDhyPcGH8CFsJPTbdRpt5RmGTK2R7avkJEK': true,
        'CbQiV9JeQK7KoLRaveKMazwKeg3hyVoFFWdJgBLxougx': true,
        'GBQZ3ejkH1SoZxpPzGzYsY5kPxrXe8KLVamKrP1U1rtG': true,
        '5zixV8q8BLLiMshvCZwvTwaQC7yGq8p6v11S5Uti4cL2': true,
        'E99bFgPBgsDBvvxjvnWCAFyztFiRVVsLKSBJCsr7gjNv': true,
        'AtXarf5VZKDKukMEjKUA4kYWHg2L7Gzamy2t2Q6h22zC': true,
        'EnnmrSJaaEEMghn578j3JAyc71TF9TbYTrfh4Mb3rF1R': true,
        '4pNo2jjcjQ1tpd6g95S1cjwg7H6bQjaKjmvzZPwry65h': true,
        'DH1mzzbomkzQFNY2gL6KgGtbcYU86Uym6bhneFwRGaLe': true,
        'C46Vu7iTu4LTvr2iovem4FpWYed1qvN7PstMqiz4Xpfi': true,
        'Ewjkq3jXtk3ke1x4QAhgafrrQsUc9oXUaaYJmruQHLj8': true,
        'CJPKs7caC7Td2yZcVSCUjGbvrJ4wHSEskuWtwAi8t34y': true,
        '35BqN3ZXtK5eL2KRLP6L5Bfxg1u5NXu6ATfzCvKCnJqx': true,
        '6LHL1xUZNusGAJ7iM96Fw5GCRfcB9B3nEJzzThaBLZAn': true,
        '72paSCH6GFhyGGpBE63ZXnZ1FFddPJn3w9eXZjKpRCdQ': true,
        '6HKxqSy8qgCvAQrqTQPYgKAevF9Ubb1w4Peae6Zin9wm': true,
        '61QcAAJAk5SrYDiHmVEK3B3Ldsh1qK2VEx3WwFMJgFsZ': true,
        '5yWafe69DguzeZsBxidJkRAUW9VMfUbxBghCnsYYtCPP': true,
        'D8LanyoQ1VM2MG8GCRcbkfy234L2TddA3b8sqQU6Wxj2': true,
        '8pPC1mcvTLnStijcYEfjiisGVrwK969kpk7sa17CmATS': true,
        'HRJ7vpxGhHJx23mTf6UXYwhbvJ4ectB8tZbnbe2HN8Xq': true,
        'BsYnaiLHNpV42WE26vpnRAK7FRFNmUY9ZQSvjZfRR8sG': true,
        '64jcFBJcQBcqo6pX8jbZHV5nQpNhHRWZwGGeFoVuEa9u': true,
        'EKU8PriRoWgLcorUG2NCwN2EopZnokyYcG6Ru4JCRLaC': true,
        'EYr53sKnVqa3EWy8kqL9LXKQcMWsvB79JERNi6HjnRAy': true,
        '6ixLGBZaFAhRYGfAg9PcubLos4NXmQ6VfCj9g3eyv3cM': true,
        '8bEezEZuDJ1zd4uBYkE3yoP115hdwHg8U784EA8qwVFy': true,
        'GEKhF6JqwEyveryUSESgiZzkTGBojEqAwxBN95KraZEC': true,
        'FA2CEHkTQMjLQxGH57eJjr2zLEGwEfxiFw4oT4weaGZD': true,
        '4XUN5uu8EaQSaKiC9jbEK3DN5peAoTDSnHZGyRWwyniC': true,
        'Dsqkda5EMSAV5LUTd2nrVZ1tmSPomK5YaGnBKLrowpdP': true,
        '23uoakSKiZEBo4wuB77VVVQJhb1wnCdZSiUgg2qAszxX': true,
        '5EjZYFHEnHZKzdNa3kfaacaz6gNNP2NHzWwhj9BCdvu7': true,
        'HCokUSrBD4by8ZGBS2j14Pb9HXqnNg9CZekBBhS1d66r': true,
        '9x9yn3nbRhHnQ2dujYj9RKTmkW3V44JbE2yfEoX34DW7': true,
        'v7vX5fGRe7knYM5pdcmmkvcHumeenMGFzxTFPiNjHJA': true,
        'EiVCiNEh4dgvFgVki3sNs3Nnf3RhxZCv2MhyNuKwUBQr': true,
        '3HED1VXsMLZ8uYEW64gLQGDwiifzzwpvmcxsms84VkqG': true,
        '9UTmVNQzQcoS19KmBwCewyPdveWq9idGcnUkqQXARvZ1': true,
        'DtrMTDGwJ3yiRk1NMb3h7qHJHKCdGBofHdPqDHf8oe9k': true,
        '94vcUufT6yncrXpTmhYxGLKhFkfU51zsqKPvj8eM9Hfa': true,
        'CT5g3BUyjfeazhg1389qVHAVJVhBMGN3yS4E4Q9HXX5c': true,
        'J7rjM1Hsfmjf3ZQL42osppZkBPsGyeVMiu7Dpv8Y6zvr': true,
        'H8jT4VeupzFj41XtEW5G3aXfs3f8mKKqAVEJAGVxVHDu': true,
        'BZiQtB6QHrCdiRxVTb96MRUy958b2Kaocz3zqBBh5jUw': true,
        'adXyvuyyaPrrJwdDFaQszPc5mnTo3vZMepyg8iGakjb': true,
        'CHtRWTy81vaZnH317oNBnUch95pcabb9fBuE5eAoYmMh': true,
        '46nyWnRRgSfiDRneYuyVAuUrsVboRVkW4reGhckgSAmP': true,
        '9fqfosy8hxiBpEQFkB8e4r4C4Vd9US1eoqi36z3zJza4': true,
        '9cyeXsQeNtdYVRTTvqn4WqugmnqosVHfp6UmSoE5w19G': true,
        '2QKAsjqYksT7tEVjvfvpWth9govhJM93gLsvEJCqdv28': true,
        '9xu6d4ykKoReLCVbv9miA559BKqpMw7cKF5WG4DgWfvb': true,
        'CKkPnaKXFDMX24ANuVe8F7K8BHFYgxo7HCLW3pbnjWxg': true,
        'mr2VMNbPmc4sUS79vfjZNkeGtZcFzDEQkWhU8vsb5Ry': true,
        'AiJs77wEsMUzX6Btvctej9yNUMgsTqvxDQj2pCHCfTLj': true,
        '4a93WsziybUpPVRjQymJptLaNF1LwTavum1GddmUrYMw': true,
        'E7wsgzqUeVkgQZXyoqX27k83XNUMt4B7pv2jhZ7iB6NQ': true,
        'D2uA26xhuyWWeJwzisASQqjRTQ6FCxuiWHwfHUwPYcvm': true,
        '3aKgTSdTVmFw2Xa4Aiv5PXpjNDh88kG78renLj5ApTo1': true,
        'CUeW8YNWP49GKzvdb3EofRtGhW3b6f1izFACNEsh5dda': true,
        '5gtUovKAJQL1SEqgperoTbRCX64wdPMmEMdoNNaN5JV1': true,
        'GrZ3Gbjww5r4S43KNkn95BU9TJU67iHZVDf8XCXYf2Ks': true,
        'Cwa9dyFY9a72MMhBqEX7q6hKc4DWf4WioL5ySorW9rqW': true,
        'CwgMLRSo4fQVLS6bjrBDtYLaoiRBoxkBEeRj3j95nQRu': true,
        'CrEHZ9SThWoJGApVNVjsXf5mwrbEcKj7q275tpcTMuMH': true,
        '3ixSXXWzP8FXMf85d2H8BHUzPrS2JTKz8rkSFJiDjzs4': true,
        '95Xep28vg658Y8V6UQ2F74MaQJaMvb29qEyutobDs5Zk': true,
        'Cn9qWcjfjK4rqEKqH86WERhn6k6RYbpgAUWR3vsTJzCK': true,
        'EmZRbBR65cdwzwoqvR3oSNMUWiXZehZmrbfwqVkRkHCp': true,
        'H8SEWQ7e2cmFgXMfi59Brb6LfApjE6R7mhVYvHsrLuB1': true,
        'DfUciVQwCzNo68SXp3ZhYNp6fgzpkmc6gMA2sWXcDCUX': true,
        '9yCzHtTBCakcpho6sX3mi6mDcSU2KaKKGG348PDnB1Fh': true,
        'F2ZmwsbVRmQbkhcdAT9x6E3EFYCTZBYnUgnKtLgrRnEs': true,
        '5y8UvC8tWjV2FZpBm4qNEL5FpsEjJsg5fYDxz82goEgx': true,
        'BnpMDvEscYcKee6Lmu6pG56aqbJpMZaNoEipCx3i7QJY': true,
        'Hg2MbjFaVreaJxPSdstD5Qm5wEEE8zcxNNd4GUCZ8b6H': true,
        '4DTmdcJRTyhqopiuHgwUPQfN3iA158x9zBJPnE3DFuVg': true,
        '38goChS1wGo34UuCH7VMSDvNxSSbJCBdDDLV4HA3kGFi': true,
        '4Z7JaE6bx2jfDigd6jnXSBVotMsubRgoJfoR4fDDpkBZ': true,
        'FjJtiw3Hw1X2wp7RQyRWKTpwki9VfPvSrg6jYBeu8ueA': true,
        'HX8D9PikakKozpXWc8FTfiVL5oeYUmtvLZQmRAFH3DLv': true,
        'D9Bbw4iVFbyaaW9igofHfB2S7hJ6qNJofXtpt3EQ9ABr': true,
        '9dWkCxRyKaDnauTxRnH9WHbUf7r46iA6ZYSzF9ExPYNG': true,
        'tXSoNVCnnu3S4GypNR5bDp5Ppj39rWPbR5ga3XdBXHo': true,
        'Fr8rpJooxyKjfDqYBDQDPRHGgXFt65grBW8zapsJnmb9': true,
        'CjSRWwBFztpTXyYWnvC32Z5SWQFcP61KJaPesKvkTiuY': true,
        '6R88szEDmhZNNVp9qm2wX2aiN6H1EVpXGTGntDGx64UB': true,
        '57W4V6zvxex9pQ3ynPWDD6Yi2xWA9irG64YMF1UE8EmN': true,
        '7uimz4Cig1r3f9FTZUqhFBWMUAAfhcDXJr98BHA7Rcz4': true,
        'BtcjYdeoA4yJ68MpJ2hVDaMewTY1dSDhgKqW4fDP4zfG': true,
        '4jRJUeG5iY9UuTK9LdXQV581CjssmqJ6qNM1DYuXURrF': true,
        'GFbzfizLGfVTJk1mo98yuey9jHoArTi2sYCwfnaysQ3B': true,
        'EsMjxKPHm6tBX2r2RjVH2nW1gcvkxC2ixdFrBmuXGZxt': true,
        '4hkZ7LkrNoH9xQyxPhPp86kVnUav2DsoyxJKRjBAF97F': true,
        'DHWayoBwdZbzC9Xnw2yCGk1ABfkqUXQm5DcC1B2ecCMa': true,
        'FXGk9ZNPwANJngdTJKPG9WSSv1Wvs6o1gjTAGLrcrdfC': true,
        '5wYKjC4YeH4dTChAtNASYABVoSss9jVN4vJ3b782YUE6': true,
        'CpcA7YYudCUrCWhPgfV5jD3XhvRtA9LYLJwvjSernxA4': true,
        '8tEK3pSrMtz4ZWVEeb7K3zoiMqufoXrBqJZDNapJkBUx': true,
        'Ck6TDimk52Q5z2oHhbnTjxVdFiLsChvsLERF5DqXKCkj': true,
        'Cj2HiAk1G8axKBHSQMDYSKtf9dprTqTUmByNKZ5ZUHpj': true,
        '81pNuMBsyj8BZdbeDVEufDycd3ghQ2Rc9WtYsZBU51eQ': true,
        '51YMSf6ToT3MyuHrSNc8fnTDj7tLqcHd9Nti8u6JLpE9': true,
        '6LPBUXEcKH52gmsuT1fbDnUCmsQCPh8A52YfXznkeKvA': true,
        'FQu1dViU3wDMu1yycDbwXx5HQRLzhj1oVt1M4x7f1tW9': true,
        '5GWSLQG26JznZ2aD1hx1yimotsbuxHevZtmhzdHTWpzh': true,
        '3R2FedzPPD7cWRhp6Q97JuCoXmYV3GJfmkxGsEfYsi1S': true,
        '573Z4NGLsDGLcQ9atPjNdiPv4oqrQaHL4Jf69qaxrkAf': true,
        'D236TAaWmejVzXqyTBdp69qARb8Q3vJB5fjpkcEAQp7z': true,
        '2TfLN7Nkg9YuHrV5Hzm4wGZdpMAPDtPAU7TQkNytypjm': true,
        'niwcpzpyw5WevTX9iDSceGcJKe42cAmDCXWeQpXpch6': true,
        'Ab88RbdrGsV5UVfN87dph9TZnKKJk59JfUQooyquv7MQ': true,
        'HUp1MjV26DWLS7CSi8t56wXbUSkKYELfeWCiNsHLMaPe': true,
        'CStgP5afbGEURX8tsTr5HBi8AUbru49U8H3Zf4c2W7F3': true,
        '8FCTYviidQmAEk8RkQhYvH9tzaW6aaTPdKXtUjSmxbz8': true,
        'EiVvHzUEdAUgnS2A4kYrSn4jQ3GEwV9buPxprx5vgkA8': true,
        'GfN6d5oFwG2wiozScMJgVukSSggPomUKqAiALr5FAhEj': true,
        'EmyNNAvxYK9eid3oxW3m3TUY6EmNrGJQ5EFnvuFt592Y': true,
        '9VA9ZHa8epp3g8ZXDwq8wH78kKPgK2px8YYL2MtbxuNT': true,
        'BVkP6HS19mfXa2yxaYW5uxLHHwSuhZLKf9UrKrPKTCpa': true,
        'FN2VfMy6dimSiwLCKYrk8MpXCYzRgdnYi42omHCpuEfq': true,
        'GscUSrJKwES15ejV8nbSS1HUJYaTagPisGLAbN9zTvSM': true,
        'EcefwDDqyzBKdgfTTuh3dgATcHZ17qcNSSQonGS3ydm1': true,
        '8MkeRzxs25x2zKN11iRF9bugAKEjGNvnPVZVnCfFg7N2': true,
        'tGjW28ZaUN12Awn5j1tsk2fgE3nKLYJWySiWbCdBaLj': true,
        'CC6ZL884C3NiXVxgEsGm78nE8dtKCVBBAjLtHyUDUSuk': true,
        'GUXQ5eC2oJupgbSBPF5ZULqRxcpdj8BbezW6G8QLUuwt': true,
        'G5CvDG7pakV4v3c6H2BU8tWoncvApLwo9qvHWriK5PV5': true,
        'CXS6DvtGCNSJZyQH2UyshKZwLjQ1ppvTA11WQdcJkPSN': true,
        'DZjfv1m3iRyAGuAvQL3Y1WgmZ364DzLuXLafppXYYjTR': true,
        '2owexEJMZR7GvjP6B4gAvNhawMsh21PchBPdu1siJEJz': true,
        'GiPB4PyRZBzbDHFtRFs6v3vbZ9TnGsevVaYtee6qaAWM': true,
        '4r819N5uDENUEcJPkZueuEG7ePVwtoEamDeyUXwDksFz': true,
        '6ZSagm6ycECV2TKBsXPYvnbM9dtScNuAoKR1ZeF31CQu': true,
        '6v8JVyHZz78iGrKeu8HJJtZrtu8rN8jknXLBEWHsnu4X': true,
        '5n89YWC3AqwnzGSj9e5f3LeXabkBnbLZUac8HSqyVqqW': true,
        'HBmPSmYD96unr7oKcintRRtX2EFRhxoZo63nc6UGEzsZ': true,
        'GDGKGAwjPdqXwEX1Q41GthEZfM1Mna9wNx5ivaZng614': true,
        'CGwQZJNnMLGvSPuesn7sbv3HENAEhRdg5JTkaKrpFzoA': true,
        '8gg3GaW6RvF3v6ev5d8JThuzHrzgydKXBDMTtS2PymLY': true,
        '7hfDPtNPddGP91fdoq9Hj8RyzoZKNMS5xJXtvvr92hbN': true,
        '8oRD5xYcECaD6FwT2kDGbntAhWHrJKXpQf6gr6bqBEru': true,
        'FEgm3nxkiitPsXkNwYRSw9xiVgRfjJxC31tj9dqWFPJn': true,
        '93T27cCutC7Gi6x3Xndd3ARNvj5kczqmXopYoNyjmzir': true,
        'HMTEigKA9qoE1GL7JRPVY6rjd9e2DCzUnqxdR7zCtsRf': true,
        'Bsm7ddhQn35Bni6GveycV52FPWi1CpvHLj9byNLCmmbQ': true,
        'FNU1KYrdvdc7xv8a5AFJpQY3WsU616vnaW2T43pAGHfJ': true,
        'W8XKdrTjPCjs2Kiy3qoLqfdTSnxjNVoCDqBQVhUvYMX': true,
        'Eec1wq18NUREnp446GWvMcuueHgiXny3uUukckYvaSpu': true,
        'Jvpp62gkYh8uXTAVLeobCfzrtJmaDZAaz2fttwbyKHv': true,
        'BVuNDn5Cq5u6VYW6VYDsDVhzENQoet5BhxaDtkLnnqCk': true,
        '7rtCBrr1HLEHavgi2PWt6dEm1m5cr4SFYh7JjppMi2Bh': true,
        '4LPRroUqg4EEaTzivH7emeQx8H2XvaVFHkTWYz3aQGgd': true,
        '692Ns2UHCvBcJ5SUrUfpkUzpQVogD2ofwD8qsHTaqTiB': true,
        'A8Gkh8ybACN1idRLiGsEfyn3rSEkUGTFgAiP9Piw4MLK': true,
        '9Nhfm1i9ApGWELQQhads4VwWgKvgsJh1wnvyZLRkMvaq': true,
        '3TePUTiwf9td9pd5mQgxFngEPaXXPzZNTyURm12x23kD': true,
        '65vdMoNCTY3BJFUoaxVCEcsegcciu4rrFaYgGV6CYB1e': true,
        '9Js3uTWDWpcp541fuf4rhg2yjDgA1MuyXmb2i7eSvpxN': true,
        'ACZ7Xz8gzUknAMD2gLQRxmxfDK7QHSqm7ypeZGUedQhm': true,
        'mrsgVjJJJUYB5KBYdGskDPLCdF9iPNHC1YRZv6AmJ5c': true,
        '5GYKcCciiBDhm1mf1nVs9x8oAUer3uDmTYf4wsJ7514A': true,
        '6CRVPo9CiygGEybMBwyMUMd59nyAiecubeUAGd1WzTog': true,
        'CXCdL4Wv9Hha3JgSBQgGyqjmL22YnNKzsHbFVGdpwrSR': true,
        'Bp2aaVYGsB5Cw4a7mdmZnf8a37hnj8ETEw3mA4nvew6X': true,
        '2oARvYPF1bXeuErFDv639RGQfDzocsmrjMLRyMwFUH6r': true,
        'G35kkNR7n4UdR3EFr3uXeydQUVygR1jUTFPhM3n1jyd6': true,
        '2SWaPDm46HbKwrhoq8qmwE5ahiPXjgPS3aoW6mRU8xpb': true,
        '8E8bUSLXAe4CTNAQ5iPc7aHjG3ifmgHNLLK5W4uf2FN2': true,
        '7jPKiFrWGZnsJLPxW8PGpBA9NWc7fX2tdaoZkFEM2Utu': true,
        '3KBu8LnWCQTAuwEj6USEzPMMo4M6yWLDycC7adYhPCfF': true,
        '6tQgWQ6ctWZqgSy3CvRW9gT4e6222TKY18UVm2nvYWjo': true,
        'DvB2W63YncmQW3EbWKbpWDgAmFGdcNg9Ptep5azZzJbw': true,
        '6VJoCoseQXMFxaUKCaByd5m7nDq4ifFqcKkEPFfc9TZN': true,
        '8vUR9VK2YshnVdxW6CzmcH1jTLpGpnmrqkF5f25YaCwh': true,
        'C7meERAvRNRz4knRwUnYW9rFzeHJq71RinW9kTfzMkJ5': true,
        '5226SEiJQg3RQop7Vv8CHcPgPvk7BsaESS16SeEYa7mA': true,
        '8NsecCLBYqniQAcvYwUhJgpZbTqEBgiwKqc59Wds3oAH': true,
        'EC5HHFiG7CfbW4zBsA5HSNZp6HtnV6duq7mACW7hxWdJ': true,
        'Ga36u41KcNT3vkQJdPE2mH99qWewwvXprzmgJqoUZa4e': true,
        '2zmqtjvFL1RNwwpqW3qmorjtRQq82WpEvREyiMixaJk4': true,
        'BxfxUL99MMMXKp5Vph2pbVw7RNMjkeg1wntVFRGn3qA5': true,
        '6ZBnmX75EFigH8Kyj1owY7bAGSY7zHGWufdcxahmEpvf': true,
        '6p5Q3bBZrsJ1Asjr91WrHhD7UBuxoj54mwH24eTSVJWe': true,
        '2zu2XsF9MNUyJxMe3a39CjdACNjGNfoAZeS7sBREd4mk': true,
        'H3kFote2tRBotuTGSsBDZy6EUshRqnQF3KDB8qpzfeBM': true,
        'CzmwFR85KyVnw8eTHGMS3rviJQLrkF5oiEDw5P6iXLW': true,
        'Gg4p4rpvTfMQPLtWZ9fqn9CETAHPMMC4wnRTz4u57reV': true,
        'F9dCURLSXWVDRzyTNnDjWafJ8SoeTWCjTjy8Hfd3vmMG': true,
        'AuVuvYqZkxv1PPbdRoysgywCGyB13CVJVvMJpGtywahh': true,
        '4ht9MeRhBtMvz7gUei8tszn765VYjMJ37P5GAWVkAG1r': true,
        '42F7LtLf51iaAoq9NvWxtDKkiqwErnZFcDwsuxKMDnm8': true,
        'AyierzAgefxBRhvJvmwmp6a9gkruhkuxsKFSKkKx3zdJ': true,
        'DgnbvC9Q4KgiuPVXx4nxQuRV5V6imJ2342ag6pTEHyew': true,
        '2kaYD6VHnz2ht6fCS8LTe9TaCwz7w6PoLJVqpbH4Dn1Y': true,
        '4uZUMwnpWbiANSHUzLvjmyZG6P7vZSzYkiH8C1mzusdX': true,
        '5r2qDE127pxLmsNBh3wq4ftDpruAW1TGqTJx4T2f3rJH': true,
        '5W4TM4zdETdtWLzAX4RJBrGijdE1Xb3AfMVVGBaXN9Kq': true,
        'DgQ1oeeM4XakNbeTyxJpqfHYCqWyZ3k5VWsQKofrtZiT': true,
        '99G12NAQhjVArRyfdSSmScprt1JLLmgJd9nVbzEvyCVd': true,
        'DsebXH3RAcc4RY4pV8jTHZyEnC14pHnBTdS7uFtRozys': true,
        'C2Z4zGTKD7eQW9PD6HvPeHNRKaMBcwvBhjUPcJACjdTB': true,
        'GH3v9XyJkJLeyzXQXbaMmcGYcaYL1z4ZMvxXnRT63qB6': true,
        '5vDmFbzwSPQzQ8BR9MNQXNqw5NbXvb3dK7Xpnia6NsrB': true,
        '2Zk5Ukwbk4rMXLAV8AjRhv4qQhG4vFDXcEQ39AcqBLZR': true,
        'GCym9QNGcpnaqHZXLDmJYbyoSvYt4mZUtYHhSxdnSpWW': true,
        '89RuXjqK28HyCzud46qY47u5SXwHindoZzbmuJu29Da8': true,
        '8k8zMtg3NAeDu4gK5MDZMVBQLz3xCjTTTnpmsJM8N2xT': true,
        '5CjcHAMpYfpGYHtvMB62xFwo7yUHB2ofGtrStnGmnc4p': true,
        '2uP8XqEXGFrZHoJ3gDCE74R5vV1exkTQUv1tdFAdtYVY': true,
        '5STGFfMW33wZMdKwM6t6FbfEPETMpjMZLZJ6QwHokZuX': true,
        '5YzayMzW1eQxu5wr8rc8iYCSrzzJbjx6iApcM5q4UfdS': true,
        '7qEu7E1bMSAHGGZRSRSZJqHkeL6Yt36XpSf6R5EGKgJQ': true,
        'kiYPYPxFpq2yanKWn66K7uDYEWXNskqqJJh6NnahZKr': true,
        'C3nNgJymNVDSQTyNivEhegouMdvWQBLwsiKHL6gRtef8': true,
        '5sBqqLgb5LHvRK34aJSdxdybkuNZrx3FBq9A2tMNFHeL': true,
        'HfzLDishyZRPhMWr7nwMKj7BeVLpHdA9qQJMiH6npb13': true,
        '3Bj9ZWvdE9QKhqyx5e3DCx1rqE8rU5MJ3SjRCDo7BjZa': true,
        'E5RBb2sogaMYJKTNctR8RUfMRM1EtR2WWh9Xtccz2XZk': true,
        'DmC3aQpSjosn1RT41b6GgA8uMJ6aVRxL9RTt4uZanMxF': true,
        '9rTA6YuWY7W4RvhrQnc9XHWjrK1ob73oba6hdBL4ngtV': true,
        'JC3cGVUxoCxKSGuDZY9XffFRxXqha4WyeFMo2C8e8eQg': true,
        'EeqNhPRUeLnHZ7MNurwu1JWSb81dQxMDb6XWVjkHePih': true,
        '7kagpF85sWgSXFqknKRm3NVUxM8LYs2u6e483EB8QwvZ': true,
        '4mVAdrMXJgcHBWgpCp65zAYvWp8h3qFWKWwKgXCcQREB': true,
        '8gJpDoSH1kEws78mWxu6Bzy4j2TN1kUixe3wxmgck4Pm': true,
        'C7U9ncaxePCk7CF4Lu1RcgDvbMWuyUoDDvSG1MuG5txu': true,
        '7wPoVUUbFK8rdhbX65ntqamaEAGEBJbx8U26Pce2SDbk': true,
        'DozDByYJM82UMHD1PVTLfxVjThmrr9WzrkD7cxaU38w8': true,
        'DMfXeCatm8pRuCkCnxcUDCq31X7tRK44DxHkfJpRV7Cg': true,
        'G77Ski45rfJwAHZzrUmxP13ozziw2tah6MXNa8p9Ah8G': true,
        '3QBRSLq1hib8iWwNwQRYC5Jj5dAccqsE4N8dPtZAwd47': true,
        'DCbMqMiNmQV6ijGkVQ89RWfmnFnECKESyoffsAztsDNm': true,
        'APvuvzF1yGitej3a5fyMVqpbdK3ykh2P7wCReF5hgYiY': true,
        '2wfonUK6veFeWMXZ8onpFe14mb9NbrLfeFDeVBTFrNu4': true,
        '2YTfpaSLauSwCcxM3e7zNja77ZGEYoUxHHmZseeZXmD3': true,
        'BvhuuQawCi1oGrM2yYeVFX2Yp2uwZK1tKkgchN7YTFB6': true,
        'DUHYmGSZ9VH2v1nuwCiQBr4Z7Z6MiVztBsvDsRzDHRfZ': true,
        'EKWUszdCgV9pZVsYLGxDooNAeCRho9FurKBhDD8ejkzi': true,
        'HMFPrz82oNXJ5uVzpFKKJn2iLzuVQnKGahyU5tWKuUv8': true,
        '7Pu2WvFenyknhfCCbMQh26DidHNxqmWZ2fMFWjXDQPLG': true,
        'DPyMyays7yq2v67cznr49sNK8NYdojYCeBiJftxKhgFG': true,
        'ABWBJNdF3PXq24siaMZ4u4CNcsaL1W5K2g3seDBfasba': true,
        '2qDGdcrCawEWtHg8QHYeV8oUTVYXkFYDG7v9kE1vJV3S': true,
        'stFHqcpSqj5JFuQfBYeJnwfzm8iRh9Q2hQUk144Wy6W': true,
        '4thmr5vz99K42jmKBbhA5vKdZ65efUfxaJ7tzqMGbZo3': true,
        'AJK6ziRVaJCB3tKCLv7ZRRodeK9NgRt7A57G3zaiafoZ': true,
        '5xc4YEo9QTTsf7So1qQ7wDqau2PcUGCtV2Y5gDHtehLx': true,
        'HFXLLT1zSChKZmG8KvBELK6BKqHgZLmprKEG56VkRUav': true,
        '4tBn9FaPfksbP5T6TeiNyLrAtj3ScUy7tqA6NGZ3kcTg': true,
        'DiYNxuUYfawKdiNR5f9Hy12xd73SPQa8jbWtP8vh1mmy': true,
        'HK3bsttXTmFAvPBHu5cFYf73s6boj5k6q68kmnR4bqUB': true,
        'AdVW3irAbm1hEjGCPExEaJmrEhnKx5ciWsCN1WZkV8EB': true,
        '7gV2GxvNqkTntrUqz3XBnrkeMs7kPAxrGtZBNfSJrUSS': true,
        'EMW6RzFWwccfwGSrAPKyaXHTwhrnDqYLFNWqc3Pey4Bd': true,
        'DptJQZYXvGhvYpdLKiKiA9F7WsAzyD1XnQGbrmqrvA2N': true,
        '3uqBFiQm9e5bUvGydzg2CiZJWiruLs4Uzr4oVpaMJED4': true,
        'APjFsNALn2FhVi8DD8gimZigWBJpNUF7BkZDhMgojiJ2': true,
        '75kgJ5iHhKVhWU6qQiRXvZ9z1jrGmohoMLxuuyozAjKw': true,
        'BJPEP7DqZKL1fYFkzdx46SkMWtehgouPELTwHMZmf51D': true,
        'FbTDkHByzdmMWipBnkrDVDS5erM5rFoTiMtu4jYCuz2V': true,
        'Gr1tp62qwMUKnWghLDcD4fSugdfXLBLvd2ojE4vyDRe3': true,
        '3KqmqWArdhKCxpVfcn3UY3PcpFpxTCCpkaX7itgCGZaD': true,
        '4bbbsmuhR3e9B3PVeTuhW2fu32M6EZySXwkmj3uxFXLa': true,
        '78RqXZboFj8Xu1i4LE6HJLpN8FaFfpBeKh8U4qmPzTiD': true,
        'AvLSypW4pDSJYjapCd2W49Gi8XekH4YU2t9UNJM1N7dy': true,
        'J2HvqLuEb52RJLpo8cFmFykmQYxc42VZuc7j7b8QAk81': true,
        '64XMFtyPjCxco2yjg9sBnThFZMtT3ewQT8oCWWtnqQPE': true,
        '8cifrn7cAwKprnWzTYjeFApK1uUVrsyEYE9e9jZ6Y3Zy': true,
        '68BaRaybeqDssHGKCMeqVVSArBVoeR4B7NADXJTyoHqR': true,
        'FTBt7Z6LFar69vj11zWh1pdY6xPiwxP1oBbeYodnCBLD': true,
        '7UUjgHsNcieViNE4YngYHHQDJWQbQ7rRqNRXGDcMqZ1d': true,
        '2WVLG1PSCsFQst5Nh5uJ6NH8711g56Pcz9FYsQ3qUkyZ': true,
        'H4rLGs3VKk9FdQEMubNRecREx8XgSL2Hbjrwkgk3hUJD': true,
        '6sdcFfmRbAMtGdqFC5Jh9ByQxeE4iHFJ34DfnBmHQRvP': true,
        '3ve3MZmzWHXHfapPa5vPPewn7ySLCywZsxFYcYNSWGwN': true,
        '4JyfRibtGtdc61WQo7bmYbaxZqqS1S6ndfbyWvYDtoMa': true,
        'J9Lazmf9R6isigxG4hbeCVK1GZ6JKzNfcHHjUTCvuutg': true,
        'EjwLd7GPH7knqYcJGUuNoSSaHNaccd7Pw36xHqH8UMSc': true,
        'B4SR9oMMAVyATeRdkcjMyhzgCSxANxt9SkwZBLpkdRur': true,
        'CiwUt6tGxyR91FbCP2dc3iskB6moEyb6So1D7XfKfwS4': true,
        '4QpnCFXrBw5odRy1xafTt9dGmVCJuckLaCsX3Udecw57': true,
        'gxEV1LgGq4fiP88gTqEaQRdBMMXXh6rgiqHzyJvW3jh': true,
        '9xxs1aQdy6z4Gcoq4KN4coHydW58yHqVkPNVR3gxWfDe': true,
        '3czYXkMcMnSUeAfbg5wPGrjNnZeZhc87Leb5ZmqU8N4X': true,
        '4CKjECPnsLcqTFUyodxrrWhaGxV8aWkt5sfjBswMPKxj': true,
        'GXUsHDUo19Ue3dcM9jWo8qkumcqkKysqL941HP5w1n5M': true,
        '3pUHXK3Bdi6day9uWDFXgU6bGLuCNbd7dWz7TiLt8CNu': true,
        'DJv6qAJ89zKbtwQkBKmnU9ddNPySLg4Keq2x1ZpUfDwY': true,
        'F5RKmHp1EcUKPEjcxKifF6qJTSERs141H9eauSUX5Wx7': true,
        'BR8pMmG5NfnBiN1yjwGME7gRzuSxC1Sjvz9mzN7zCYj': true,
        '9fi726oedBLKQKuzCpaJ5qmuWLbF1Ua4s1vrqUa9FX7f': true,
        '8ooTkQvowewVAV2svxaDwC6CSbnETevXCEhUF5YJwSGJ': true,
        'AWasFwhffa4u94MMp7NFREZjmjRyprNyyah6KxkSCza': true,
        'DRPakJegR5qBVg7v89rafLtJQdo9yoaigEf2qWjjcigE': true,
        '3x65E2JV2fpx8ZchhQrc5g8Wx7VAU1k9aEvKME6qywFZ': true,
        '3QSYZZpqntk9Y4FQZsFicDZF8VpYtrtD8bdgaPU3fmDt': true,
        '4sUpJ9KGgsDLQctyQqzhVNYwExBHEJcg7kDiEU3R6Ccx': true,
        '3MyKzfwYggmmSv5vgaewjfLK6FEpqhAHdjfwLT3pf6Qq': true,
        'CYD21L6LwPWbWEJMYeLZh6Yo2UarBYwLHUYE8sZ4od56': true,
        'FCWsbb2jrnQ7DGwesesVeoFp2VpPsfAFp4evKVqugWs9': true,
        'Atdr8bYDUCowSg142jAPmHcRvQFdLyugu5U6qARuwR9K': true,
        'ByRaHNZGVopoohPcpnqVshr5cTjELsR5oFj6vX5CXhnJ': true,
        '68Aaahb1xFkS5y7Eziy19kboxT1qm5FRC8UXbu2AWkew': true,
        '7X872NetoG5oU7CvDci24c4mGHAgu6GH5uroavAfGnXW': true,
        '6V5k5kouttT4WLfDbXK3ESSu3Nw5nBU7HEnkHt2c535J': true,
        'CSwbsmDTEHUQ6XRffCyLx36R8T3yTsC7qLfgue7seemP': true,
        '7M1iM1vg8vjRKESwn5Yofp5opvcxK3K1CfkVk3F44gna': true,
        'C5pk3j1LiquSDdm2mBLXn8bMLkrgARpioYjsAX6YHUME': true,
        '9Dk6WkkTP5nSmDLgAHEn6kBVZkH2YmDpKBKEnCSjuLrY': true,
        '2BHKwvUApbUjD5RQGC6uAemoDEKpgpqWSXCt69C3m65z': true,
        'FRiN2oTWDu97otbGhkkS5UvSaPZFpaZrtK8z36iFEHiA': true,
        'FTBe5ySyN4GhnYtrygDvW6Ej3K85Y8YHNKdPRsonMojr': true,
        'FqrcFq85Z681FLj9NmPzFnJrs1eP4znN3FPNMwuMBAGW': true,
        'BoaW4E5QfPKWw22uoxowbP1VXf3JPHva3k5DffXRUash': true,
        '6Kcpeq1ttSQHiiynLCo5eSkSQFMoiDHu4zrKZZRSBPxZ': true,
        'D4BamoiC4zdsN1YFWsUbVideRLq5gAs45AnzaYwXtuLQ': true,
        'DqpLF24EpkaAanCM4qdGnaoVxDZFiTpRdNXKVq7h3dv7': true,
        '97kjKc3efdph4KWXxTiiQJxq5rXFpwsvh5Vn8kZKkPSC': true,
        'DJdMpW1LkfhKRo5V2rsguMtYrepN44yaX4Ssk6frkVvL': true,
        'B13G8LvcU3aht8QSkHRf9WXPVXSARNYqYB1Z2Ee6CdAN': true,
        'EPW4tY1XpuMfjTwMyRBmef9r2EeMYek9TaNrP8SCXc6y': true,
        'D359ZUmaDcBWhX9xbajQwGezJjDvqZtxCF86WLBQRtpz': true,
        '2ieuiFLTYnFn1vaab1S766JpDH9UsgvNeHHPA6yqjc8Y': true,
        'HJM7w1ZWCu6A2NQXVTQ7cSjzqkt818GUkijwrMFciLbh': true,
        '5HU4MwX4mwnQ8HfM5MxBiqFYv6Hfhr7LhtUw7dGKrTiR': true,
        '28udPYJ5MxGT84Hqo6UEdP4JJzRehSFXgW4oMNxYFF7b': true,
        '4VSK8KZd9rGW5g6bsm4a2K42bju3VReBrE49FB7V9Bmy': true,
        '8tePJbvVoYtH5bKfGPjG4ueWXTggjErEt6dcNJksC64R': true,
        'ETJK9Segd6fj81ucJDc1pPzERWZ8mZSAisS8dxyahiUM': true,
        '4egbszKLcgFYRB6YeMqKn2FQoVshDeGLuoL8EtTQV5zw': true,
        '3oLaUr9EPjmtidRGUKTuwGGa2524p4toStNxTpYYrwwq': true,
        '8ZCP38GBF3vgtBg77kB8oXyPShDr88itv5zG27GyHBNa': true,
        '4tK2A1JpxKqoCioz24QvUASEABhzrm7PgRwPLDSb5PhQ': true,
        'GnzkCTbQpmo1gUjze4gCQPjKQCZ5M8HCWGkt33Pib8qi': true,
        'GzF26UnXjRL5TRXoPBbybzoZ9aDBvftbypeaDvtubg2c': true,
        'HrojjRmaiub5QfNctSj3LVLcWXhUuw3WNn9iwjZoyi5i': true,
        'G9Mi87s1cboLUmnAEZi4K4iDYs687TVcgGQg4cVQf1AD': true,
        'HxsaebrLuux8mGx1AUL5KwQZA1nsLGEcTTYyE3mfvUUb': true,
        'EudhFubL6b27xzUJdVNczMSwynrHf4yeg6LWLQ84FwA6': true,
        '94oZTUSEoBE5DwxtGr7sKbN4FN5A7Df9atLnrmmtPmaH': true,
        'kufeFcGF5Q5AyS3XRPCELqqf8awF1Eb9kTK1bfSVjdd': true,
        '8cLZLJr9UPugUS5PBPVGW5oF848zUuFQa3QVy3bMYfH5': true,
        '3dAEFmuP8V3sxy8t14pmqU6AxHMDyGXcTsjohvrvUXyk': true,
        'D7fWaSjgn9hhJo2HXxmtiV1GrT976gAJpxS6QzsjRNXn': true,
        'B1ZkCvU9oa9ys2jhNiQNVeMmroGp6xrYbAbt9aAiPum8': true,
        'AzfQ7QQRbsuxV8mEz7nBVovV1PjksXX2eQdA9p1pTtMT': true,
        '21cZWEFLbgZQUwbUTRyEBdcPDUXmua61Z3raArafvSDo': true,
        'ASVkJgZ44ZNVKhd3YR5eXQxfyWHFBQXMKvGJyZ2mF3z4': true,
        '45ii6cgEkE4bive5BeKnko2sohRbnrV1ZQYb1nWF7Q8a': true,
        '5cbj47r6zUUSVEU9u9XbNMaTgzVf7gvQ7Wdayfp4LH4w': true,
        '8RJY6cW5N8gqwX12YbrJcT8GKDUGFQWnjd3BkWPs1s5q': true,
        'J1xc2FXtVvJHazC9ebYGB7585z8eutSEdiwyjY6AwAhL': true,
        '79zXJ9eWukomW8z3wGf2vrGSvvPXQyWmMvqEgvbAN7ox': true,
        '6fTGLpCWakkemH594u73x7P61BUnte9BGQTvpC7cBiY1': true,
        'EJAugMXWSvwwLfcgLUJA52Nj4CSJuZDSJ6XWaFKhCiJR': true,
        'ETUHSbAQnWTGbyDqW6SkhdGtbdqsYDrt7a6KdvH1vJUV': true,
        'DUNCnuQv29ZV76kPoesQGfrCtUJ5eLF16fZgFzcgokT3': true,
        '4ukb2hgVcwP8Xg3oGZDB6iukphvbaKWH4yxvBsHbC9oW': true,
        'GeuaJQgvfm94KuHYWbay9jxPGePr4QxJ36VdBxN39JLJ': true,
        '5RYRNWnEtNRfJGJLgwYNKfBreTb9XYyb58tFL2TvvSey': true,
        '7P1y6BRh94CES5x4GSVb1vFcteS95vtNpLYxqfTEu94u': true,
        '4WAn8kGcd8Bvs3Z3UhMpLtqymXLKBDMY1FGGmTDeRmFr': true,
        '7NXFzEWh83mHiV3twKq6eNUougekL2x9gdKAb4B6MTE7': true,
        '2hofM2wxC13byWb4rzwbdXiXpZPD9ehePLFVmzVfUZiz': true,
        'Fgbzr6qCtsHKR758yFdJdbzWBNYyDpEsku4WHt7sfBXg': true,
        'D9CmC5M4wxHQrrMsYxud5ccAA6aaAYDTP5cyfEQEsuXt': true,
        'DhcgBVDhDquiiBEtDLebqhaeytm9HFQHVRRrkYjSAdUS': true,
        'A7NJbLATqJxmH5vztzvk1MoFEJJN8LTw9gyLwP7LKG8z': true,
        '49xsTfz1VRpW8SpxwQL3rpMmGkkY3dLkKH1W8bXbQ73t': true,
        'D2QGiz7u42ERcjYcNa1mrnWrWcV6LFjcyJM2TLARdD1e': true,
        'aa9vGBsC3MZV1UHMKXnbdKHaTDFZFsBfBpiqVfNHkhn': true,
        'HxBKd94n3GzzgW1X3CQvpj2Kt1mSGnZyEMSs7px1hi7c': true,
        '44bRocoPhoF33FWMhFBn3JAq9cT5CMcAy4J9pRZf9gZ2': true,
        'EFarp2FwP5pdDH1ZKePjA3Vdv8iy54qH9hJNgy4eupcU': true,
        '46WCtAfeMdyxao1LJaq4KZCNhvshby7XZFPdi7JvVf4Q': true,
        '8VwcKV4tMNKWw6Ce6WDTV1PQjEDoif4a9rR7xTD5TboW': true,
        'EWhgTRjVQBP9yj2cpWvBbKZPxqwKU1YgAK79Hr8pr1to': true,
        'Cowh17PewJ9Rj3tGcwLBGN3jip57G6P6xwAETWF7yBhu': true,
        '7owUzm1suxQaGubaXGMTSJvFdG1fsRCbLHQfeYfVnrPX': true,
        '4WtjnYjTyiCykzfqMJE1CZjyrWeKKuPJQVUvyj5oEQQs': true,
        'wwqYnJcmiDkuxcuv8URHMtFPniKUApvsvbfzJpCpCzz': true,
        '2vaB3dYXx9JxEt4Lcu3Y5tiBegGNkyKRTYhCPSjGgJZX': true,
        '2NHKUwvTSnutdktN4knLf6zUgTgx2gY4fZ4dMaZniKdm': true,
        '5SHx3uSwZkJrEaM3rb2im1Nq8f9vwfRfikTFE4GayhDq': true,
        'CJKVPRLacpeTaYCAcZXKWoV4mYGdEqqaTSbrkJLdrKeX': true,
        'J6NfzZNbhU4Pohh9mfG4Hc75Uti8esPqxsWDCG43jNf7': true,
        'FU2cU5LZodnfC8tUfEwmTF3NH31YnW9bvoi9dpdq9Jdo': true,
        '3hgzidw5toAV32eAmdVVDoEoK51s8fYY9BWxGJjguzsy': true,
        '7xUajaSdbUCgXpPQJyK8SToDFCXk34xDVa7iArBrtzhP': true,
        '4XQRFhCAsWPgkiauPw2aU5qUawYNuqBhJki3HWRpS19M': true,
        '5SDLW6VCuWq9A1beeHRXHxNJ6XCQMAf1oeRjyXMpHqou': true,
        '4qpT32GAJuf2qpQu1HQAN7UAToRV3Whx5ELdum56WQe2': true,
        '85jvuHoMJyVQqJbCr6iTHzgbLjMcCmgpsDrPjYs4uEF5': true,
        '9NWQuBuEngd1oNz4uRhRord8TKFuRW2tRQVfTYZAMqTR': true,
        'Ek2jkL3ivZ9ji1Cdw2pK6dfXjHRHbVyooZf4LPvPmEYK': true,
        'DdGTQi7iCZX3sqH1EKyaNoRm6Kip8J6fwMTZr8B9Z4jX': true,
        '2B7PNN4KjZED5EywVobWiD1S9dEVVFkSvJss12RZELSK': true,
        'GdPrc55FATbfFjVyNC8jJ7naJAybt9N7RLsAnGjw2pow': true,
        'GaXTDqbwc9RX9bbvmvUGdCQHpEh9cZarFaTWdz4H9GBr': true,
        '2UHW5XpacKCg24fJ5fMhG37CKM4ZqFfXJbnKVZoe3WtW': true,
        '73uk9M5g4Ac2SUi2WNCR3VMSm3NmDqoiQrD39dj4wcXt': true,
        'Bnx67i3QamvxtmrvnnCStbkH6DvjCUUaT1pbYTTWxXG9': true,
        '8S6ygkazqRoDqKN36uj7SJXyNnPrJJFziKXQgmfirPXs': true,
        'DyY9gpcZfZxd44thHgocxDDpaqeL3ZSv3vcLNkm2pX1W': true,
        '2sA3wdMoF7wi5h3HrYYKiyjS833QCELAGt9Cg2ya8kLs': true,
        'HA981pyPjkWG49Q1DXktdCjeHmKWEHy7Rc8ket9ghMac': true,
        'BmSVvoVHkgMHBEwLLijnQ8YKYh9fxKJPhBpLZeM1swrX': true,
        '3XVw1x7t6ZwXryYUY7ofB9F6gU9j3Gm3h8LecZhPPL4z': true,
        'EiLo7v6ecc7D8x56B4CHtDzQWMxfZXwjgwNMSmbNcQRk': true,
        'GrSxz8k5DGTjgfzEnWCLdQNu513e8oiTHir4kb6EP71W': true,
        '2JBfXc1T4gC8ESYnFs9sLaMrsmof9VnZ7k1MS71sxKoD': true,
        'GTqq2Ku8vEfyU4utPDrjm7RTMjNTHdXdro5oTmmKEmJZ': true,
        'D3zWG5NJPFHRGUtxLUbUNsoKaq2Dj5hZM4R1HJLc7Zsc': true,
        '35efB3TbvNzMp1tNaW5CkSz1zp1qcxXCdbuSZbX1AeWf': true,
        'BbY5rR3KAv99GUxwteacreNwJRWxyTpyWwb9LkhUkeX2': true,
        '2GCDGaJuLLA4KyZ8NaHXBmmVGoRGSSx1T8nE2jNxEQ1x': true,
        'FffYnj6Axh5XKT8G2ch5U2R3CjNUyrYHAdbSy8JpisBN': true,
        'D97XeiKvhATkCCV8vTnvcFg8khJpoxbCFPHfgKrdXZ2N': true,
        'CiSNfcY4YHLe7agYNCVcY3kxU2LCNDsyfaD8AFH9nJDz': true,
        'HYyEnXwA2AnhAnQV9s7T3f82v6p9kyyo3u9W3SqGy2vs': true,
        'CFEsz8CSMbmFye9DDkXDUuMS4cDuPCR5vZ7NbCrdnLVa': true,
        '59MMrKKwnABp268f9UWjWMykWnT2vvoxm4bybwRru2eD': true,
        'AJPUpuTExGuW6jbKiDup7gg8caCkJCLN1sLiTwowumzT': true,
        '1LwyCoArmYktPnhEXQZ98dr74n83NjFxorMwMmExTAm': true,
        'EjgXnn2czrA1Dz3rNDPiL6WaMG24UBLdebUXvcGBWLn1': true,
        '3kSccNdU7HhCWsxDJidQapprPe1RzX624fqbE1PfFDCK': true,
        '49PHaGpdzFPYbuJjRCMmc6YGVAaiiWD2Fq5VETyi86Dr': true,
        '7XGmF2aS4KFc4S8seLDvwLjg7psypXjMas3r5To5sAD5': true,
        '9BPYaxUTwcQE83p3yWV39AyPSmv2roTYvadE4Yjy9hXu': true,
        '3yRduneZkBWit3yqN7xRvFFoSbBv7fajJnrb6tvBg6KP': true,
        '2UBTs35hpxTRkb4nEWP87UYHbRygSjieaXXj7Hy8pewa': true,
        'HoW8qkFypQhxzRDncTWFuhFgzYUPH8wzLroPARKa7bG9': true,
        '8YBBUGuFv3gndFWovx1yv6X6wA8dCuqMsA8DazKp8Ru5': true,
        '3MGfYixEQUmktNpK8CbHz21BCs7vXNvGJs1xRAQyQYZJ': true,
        'DXGF2phoCqwd9QXdtAX7FDYbQgsnUvqdFK5EnRqSaFR4': true,
        '6teFhXSg1LLJ9fNaf5RxHYfu3nnEyeRQhkaxnMKF92nU': true,
        'HBNnuKZWreygApbVLuN4J6d1WTi3tXVMKqgkEhD8b64a': true,
        'DMGLfWqu1jV9pQXrLiRs8xmLb2QKb856WdFbkP5ssh6z': true,
        'BndUsgXGihAUw2nUhmPSh6YH5PRMdVc8UeVWbZXxrokm': true,
        '42VyuhLb8EHhufGiLSdzEnGMxqBVJmYLHMSRX2uXjbjo': true,
        '3U2b4gHJ5de1VHxgw8AtABoLu7YMaqZMPuF1M8icaQBd': true,
        'DhmTePuhJjrNneidgztWAmdp9yqZEbfK582fKgjKvEEz': true,
        'B8bVJfaoAJeYoGcwjdbNjJCPtx5tmrsUeKhvWiB7PWsd': true,
        '659vGyyFrmoQKQsRyUvZCSqRkbrUyo1n5uoJQEVvckoW': true,
        '12sSdHAuH5TgG89getehGJYtYLMgJNBzJAh681fM981g': true,
        '4bo8xb1SWfeJarEpopAHKAbc4pdkwCG7wfcBWaKqSPBu': true,
        'D7JgijJxGPdCLUqdnzL67dLWi7WJ7wEm9yiUf3CaHDZx': true,
        '9HYnYnSnM1UrMxZbvVxoD8zgR2H37gThM6JdcdASKLBS': true,
        'ARuiTNJemZ9p9Gb9DuCz1KUfNjPuTvMo8uiLb5CguGLG': true,
        '6pFuF7npM8SVnWsG85oocYUkpMq2cq21aQmf1L1gMEQ3': true,
        'DZiH5nw6kBRxwUFnMQyYdpXWg5f28xjZzm6F1nwEhbXn': true,
        '4Yq8wtCetnscZdVn74RKXWR9rZsAbicVAQSERSF8Vxov': true,
        '3kDYaRqGBTK5MNE8BZ7PkSRXyxNnQhLCcuUqgkxGGRC9': true,
        'DCHmbzNVwyXvisE7zBU7Ttii7RJ8jzyoqVohxVBQyM8D': true,
        'EHgNfpCFwu9YVfyuM1HxxUBx5FkptgCQMJo1hd9QBYvq': true,
        '5HffHg7nRqL8cwoR87BfBq7VYegJmscb8nRmvjhBbsBh': true,
        '2QFoxqGArAXfQevr4zEwhVAWcn2aDmUQWmhb5djEdeoe': true,
        '5NTMMgMRdgun87WLHoTdAYHi7YHw4tsFmudUKrs9LoKR': true,
        '9HGPyzyVgHzzmTotbk4X3inzcYTXLocPVd5rULdpdQqn': true,
        'GTnpAN9s7z8h6Nw2kfQzH6fA9oLGHpbdhDgj28kZ49ga': true,
        'FD1er6SCLtYxUpTycz15ubBszAq3o83Dh1w24WC7jEj6': true,
        'HvyHrjcqGGzaptXkM1hRzw5Yj618FfSS5Ta1MpgYSS2q': true,
        '8d6z3uVuxmj3Skirzx6rioGPyxDv7ntKUYEtpa1wpk5h': true,
        '4orF7EecKZ97BzhRJuipTdafj6s6t9UniShbfejjjZyA': true,
        '2nk4fjKWMeGjkggdyVu1hTLvwFx8AKX6dSMhGNaZsdMK': true,
        'CE159LLooEWvs5HKWmXcMxuoJ17ZSpbYGgNoDm5YqgBG': true,
        'ApU114FYrWu7DhJr8qg5AnRynfboFjViuTspzXYts9ix': true,
        '23A8r6FRb8sLsA7ztTXcGA6j35grdqBjcX4eUtnNn87V': true,
        'FtTPV4AaRE3nni5tvUTmvmw6qRem9KeJsxyZpSsMG4U1': true,
        '3GBufpgMB2aA7rLWH4QxcTvNeEK9utZRkPo9beCWEkTN': true,
        '9Q4cahStp568u4PEicVZLSEQczMd3LiE5ABT4y6Be7XD': true,
        'J66offinwWiJ27Xb1gAFJZJ2Veh3f1kKHPJjgkgjLLKw': true,
        '9DXck5TEFVa8Md3sG8XQsQQkQntJPMJQVkqvahMf23ED': true,
        '3zLSCyGbRwrygHRWHumP8hm7LdUoDcwQ6USRUsWgQEM1': true,
        'MFtZDPBxuP1HDc9gXE7MxydrZSd7pGVsxFynqNNbGWY': true,
        '2vNxFyAmWyeepzeGGAoYsvszdJUma6MiP8t8ThQLtDhC': true,
        '9FiTxpycwQsYvKToHQyF95sCp9msyt4Ndbkw2saoLhb4': true,
        '4y7ea2BQ4EqCy7BjS38VibtX68L7bprubP6fHeeEtRcN': true,
        'HUczHk1BM2TsC421iDAZ14kNf66efoZwdzuSHpHQV7yg': true,
        '21wFUp2xScBDmr6kqHs2ceDrhcEN7xxCauRwwAG5m3jS': true,
        '85EK8MsW7XpSQYSHs59e3z6jCDVoLKhehLkvpdU2aSYn': true,
        '8HT5ZKAkhURBWLm76VmK75P5JqRkrCbrBB5ZK7KyhWvy': true,
        '8X8WiPmq4EfbeAicKyFLXw8ShXeQDPvmPzwbEbpK5iBv': true,
        'AHkGRh5KD3tr77ZxjSUiL2LBdfbzH5PsoGdctjvdRWPo': true,
        '8EdiAdqPUQPgSRuKhK1x2pBfLoYKfnRMu94Jn2CAQFpP': true,
        '9pqknwybdsPG5zB4UNYpEd1GFQxQV8fFFNW1KoYyCp38': true,
        'J8ircaDNoKPthfiPHPVDTeAFNyzs4fDvAfkuggq9Xr2H': true,
        'E92seBpgyaDdbLihzsHrRPLTsmjA95dtaqPPdvPfTDiu': true,
        'JADyK6dFv2kfUKkuMVZgZHetWd2Rei5bXUY1r93Uy8Q2': true,
        'DCqvtejzg8jHURuMnzVdEhwx3evcFojbfX9diKyeoFFS': true,
        '5JBRSm7UgSdnk9BE8S6PDBzASxSZvHBWTtRgMqW5JD9g': true,
        '6wPycM1SVpt2gSqF8DGYkUubzwbFbr8SfnSa2xkCEZQ1': true,
        'Gk99pBEf3ZqP3WcZrSqZuVWHULub91isoEnfwh7S9Czd': true,
        '5odDkQfaky9WxCDXCj2FbV9TueJekVdGXV1CUN4e6g4H': true,
        '6MbBFcp71S6nuqhP1J1v1JVY7TbBveUhwk9fJ8Tj5WJn': true,
        'CS6pXDXXFV5hvhTW5AiEoQGX6ykvHGdsSjGm2117SBn1': true,
        '6WKdfRXGM3Y7JCFRxSwAFZ5hrYyH3ZG3D528JeUfg46p': true,
        'DHBSEMGZ7Y7UfML3Fq8JiPCqg3bnvxEHZbWMttYJzfur': true,
        '7ycbNDK43MC4LuUXn93YsVyYUzy4v7LoCEomgTU5suLs': true,
        'AeERM9GZM7W4A3E8uHHsyuBaGYeZDriBqb1HPWEV9qkv': true,
        '49qyLWZBQjPvNXSy1uviuniZjtqnUCvpH2NWrWJyhy1e': true,
        'NoU3GNA2aNFTYYxwprQKs9njkwjvc5dSeoTT9E6h97h': true,
        '6Qz41Yowjtem4J2ruCst1wxaX1isC8Qkee7EpTnmpmVF': true,
        'GV1UJpHfnTufk8wgvKu4hbYcpRhdq3SXxJeS3p3aeqsD': true,
        'xffQycukqMjQrA7Ygy1cRuFTsBndWGozagt9GQd1HpC': true,
        'Fr7QP6aJzzgpa9hhFAez7MXVats2PsU7GzxPUKttDe5A': true,
        '4tFCukV2c5GubJZp9GSwffgGDpzVaduLYejiYRHr9x5z': true,
        'DxEgfVWywYnV8qB6up4WJHFeGZy8s5zE7q1K5b6hAR4D': true,
        'Gx27JJFFziU4Ms4tjF64z16HUK7YbiYp1mo573HW1ccK': true,
        'HV9c8LeaDwngm79jaDZ6RcqPZMJZFUYivj8NtUkBncH4': true,
        'Ccan97ipgvqKhvEs74uXXfHARTac2nUAH9ktbCaKFsMu': true,
        '6aEvcFP9f7srxcxcm8KbyWCEwqYhYCxEyY3cVX7sjiec': true,
        '3DJk8L16eLg5Cgupwe69Dng8zuwL6prbvzLfspBsM1P5': true,
        'DcutPFxUpr9pt6wJAAfjen5BQnRqYNxrCJsDmUNktHN8': true,
        'DefzMK7WcFP3PBW1o6msAWqtekMDY6d27MFPMzCK12ma': true,
        'FN9QDuR6aDQ4sFg5osvaLKvovDXRZfCY5iN3HA8FbWM1': true,
        'Haht3b2CJHfTSAxr7p7sjC67YSGC8L4vNgZQPXL8sQEe': true,
        'ChAoY9rcyaKejf76g7bBAitpNMJpMdTwvk9kNrFCZQFT': true,
        '5XQhAAvy3dGRRmw26iVLBmFeQeSYv9c8nuVPKTvU68xZ': true,
        '2VnvGEQZGymnrh3soAZRnguKiXenaio6eF9qfiXnJHAQ': true,
        '4v2cKMJZ97x4F1PVxLo6SPQwqWqqNxEZs43QtuxevX5u': true,
        'HxuwmnA8ZzMphjAcfY28Ww5cDmna71X6jTTjskxuD68g': true,
        '4fDwjEr9KEXdzYdRf9u4xoNCdYfcofbLcQJ6qR5yp8ba': true,
        '7Js2oaP7essSexxBfi2LLmFUhvfzxNmASJfw8RpYPU7h': true,
        'EZLmZCFmK8Ra2yjGbPUDz87EvTtDmReskpbvYvHfUdm1': true,
        'HQNRtGMB2V4kdKdg87SPnh7smHXtuADEPPTQrDnc6qYk': true,
        '9mthZi4CuwH9eWS9fooMwEyyN184qqiatUBp5eb3cKAf': true,
        '3FdRfVn9gqhqGY88jPPMVMZpzqxkG2KVoXP4gE8Dk1X4': true,
        'GNa2MkFGHPGsgU1YMcWMvaTRNLxBUwbLrgUAjEQpjFsk': true,
        'D9EgLZCfVxMy5syhs7zkYtnNVLqVudCqWJ3Cgsd3TZ4f': true,
        '6GLhcbZCJwu67iG3m92fTS1whUZryvNPP7qMRWJnZLz6': true,
        '2y4w7sUaEaRVQb1YcRBmrhkt4q34RyfMjJx3GSiq6yZC': true,
        'E9shyfLMsAbsEvqtPZpYvb3uwiSx7QeaCKE4KojZiBnu': true,
        'GbeViVkzjDrH4P5zkownszFk5osy53cdxMfSV5BaqRBq': true,
        '7xcskPazWd9BPWrqxHw6yuERerD3kFrWTfN2vzHpC391': true,
        '9FwSFW6cxjPwaAZXvnK85JXghgavQAvdcQpEpdE8xcB9': true,
        'A1QDhkvRL8j4MJGftQe5mghKdZDinKiSmz5cmkXUMK5L': true,
        'HZTUZVtdJBwRyJLkSMdbuLwsAiRYdqA9p3jtXfBrhhWb': true,
        'Fe8brhqowohwWPzPc9aKm3TUxq215WbuA6pdGVm2gt8o': true,
        'BLZrtNt9E88TpjSFprkUin66y7z7FXtbozS9z2vG9ACa': true,
        '7h8f2CnxaRoVH8qDdw9DHDqnbyovq8bFDFMX79LTbqiX': true,
        '5ymMXteMAT61g8EVsjsN6EJcinYUXU6ghyEaftZgsixB': true,
        '4jWdVBF2hXdGG9hu3pgFn8UUC8ethThcvtQ4rvujTqBe': true,
        'G2X3jLQ2doB5vL5dFj3Q1jKRFvaWHe7iSUcM3rbLN3Ma': true,
        'NHhzxwcPSen88XpZcXRgW44DMSZzVGWBWWLjPd17hSS': true,
        '2pN3r11EeRkzngc7mXaPcLyFs1wtBJshkUAmgH84EhJB': true,
        '58jPFUDikNZTiExXQdyqoUjEDeidrfLuhi2QYA8g56y9': true,
        'AA2DWC2HPNoaRid6x9eUYDJ7qbK9mAdZ8SgiLh58SSfh': true,
        'GdJA5gC1Pfy37pRi5Wg6aWoz45o9HTfDJoymwG1RAiLm': true,
        '2SEkcdWyCgYRawh2sPDdSppXQWpUJANyB1skVDuwkpgg': true,
        '9KBxxZ8sSRSX6F7b9fYRgFAcyv7XjHT9t5cqPXZTxYf6': true,
        'A5jDGFeYEqbRjK2uAqWmdtsqcHD11YtzYZZMsfUFAVqu': true,
        '37qubCSyCAZbJL8r1gnVXzuBGBxaJQxHa6hQgfeCFNtq': true,
        'AKcag3ydXtX7WvRV1bHCmj2snENGm1kSHj8aLFZJenfJ': true,
        'SPNF77yWCcPHtSihC9pudopqjiXAnCsvbW3bwo73YyQ': true,
        'Bk3xa4LfdunWNE1p35vSHtVzeSqC1xxfpUcJz8sw1ab7': true,
        'B5dy9h8TA1bEqPJUyTRDxdMjEpo12sFyrkEmukKxej6s': true,
        'D2GF2z3TPKu6HKQEd6Af7oZv9GzhqtiYq18zeXgUcKC3': true,
        '5uoZioSa3cLbC1KAsVY6Hjj5RstkFxfzWcjqaUiaWgEC': true,
        'HtF5iGRyzTvSzmGSqWkQTCPHNBqta1foR2kDWyJnCjAz': true,
        'J4ktKa1fUGE9TYuNxcyeeWN9kP1hTsVf5BJEDXQDdv7': true,
        'Bh1mDCzrsA92fa8xyFu7xVG9heNgg1asJ6TikZvpjLLf': true,
        'DrsDJg3hr19xzcbCFfcA8yvDALc8ZUUm8y6Zwsd9gpqJ': true,
        'AiQXEhvMiGU4JLqUKaz3hGdk6fdn2gPrAZizAEu3Ruhm': true,
        'CCDGtKVzPQg1LQYXLPQxhPRjZ7WPd5hBECCvDhVzhF2o': true,
        'JBYf1YmKK9pt68Jij511aWSL6ZRYcs3uWNxPzUb3CQoB': true,
        'N8TkxicUeWMYLXXwvE9KnyKDncxRpFtdAPZWSsWgw3a': true,
        '2n2rzvxt3TFT6s7xtoPewuCE7Wta3a4AuqFk3MF7j8QK': true,
        'CPN3vtV7AoMiYQYd56B3xidGbGCUGW1DAqN5VYi2EdUG': true,
        'Cwe7Q9WwawCcbpvzSSqUeZx9K8n1GTfY3bM39M7xGgxt': true,
        'H6UNeMiYaprLEyQiqAaQDoGijDGrh52cmJbmYVgR6At7': true,
        '6c7zgxaFy6KbiYkngE7iaeW2LJipHRYif5xjjcuzd2Kf': true,
        '3CbSktax9wJcA5v341Xh4mxHUbAtPFyb48kdgmAKkcon': true,
        '6RxzAdpvVxuknWtmmeLZcp7FREEq3KhB4Ujpop4Af3RE': true,
        'J7pZ2ALAtqGTp5wD7Yk9knkWr2d5u32UXng6crPD2UZi': true,
        'DZGBqFG3mtXRKSRFAbUPK1P1AS2ZavqV2CDwi89dJrXi': true,
        '3uZTgcN8tu7Hx11JRR2NCxZ5CEZByQQUG7jz5h8BQHiU': true,
        '2QKZb6iRpr26X4KBAmnR4edXiRvf6bKV568FXZwsU5ZN': true,
        '3PKhMwpDz9EaKejpWV3Rwzudb38XaxVBRRsctYqjzxhc': true,
        '9SwPkuDuc95Q2EzrgdpN3RU7nrw7AQHDKGS8aQqC3tBg': true,
        'DeFAbBhoamYcSwL6uPvyF8NhP2q8FxXqA8xBWL6QV6TM': true,
        '8gnPgnKcyFurC8mgcb5QispyW2PrAjfYKZUm6JjHU4LW': true,
        '3TE3XonDxZYMqZsHyjFZ5GcxubCqDJdeMH477ZSJC8BV': true,
        'HinFttzHgZahtNazMb3xiF6s6Sq16r8vt4q67Eg7PgBz': true,
        'DAMKcNhPb28KivxotVTwsz35usUF7vsnYy6p8pGkfNmf': true,
        '4ctdLAxQeQetVFoVtDm3NviXooRUXM4EVktWjcejFotY': true,
        'AwZ55M29mis3a71btQX38P7wDN5TRw9b9W9M56b8JJeS': true,
        '6bMgE3qAYJHqdXN9Vk5WjNZWhWBoJLCAo3EM9rth8yjg': true,
        'CMZECHig1JLaqRfaminuksXrEqXuM4zZYpKqnhrCZ3SV': true,
        'C55mtWeS1Rzp88Nx93wT3whyCNdZZpL2fvUAJbricFRH': true,
        'EVJEeuFwfzGzy4oFM9eRdvSbh2C2nJ83cTa1yr3ptN9a': true,
        'AkwH5qN8AyH5rj3mUD2ARAtqdBHue4x3HNds4RbamBWr': true,
        '36Fb9e2T3XdKzMYGN52SccKC4PKvDc33ZChy1Wi3yqA7': true,
        'CmRZHUj3P2YFxYWogZMTNaTTpkt3N97iEkPoHWGbtMYY': true,
        '4s9dVBJYaa2KmWFQ6bh2rKV5UTkqSr7k7TRe3pRui6dZ': true,
        '8LSzcAEmk8uP5HvUUeaCb3T4QVGUjstFkRMXifgXrx7o': true,
        'EXqdVaVdQaN33E3BVtK1aykew5nXxDBXf68bVTMXXfju': true,
        'Gtsr79wEb85GKRmqABHgK6AS662QWsFHqWHTdmBYmYFd': true,
        'FYe6HV7GfP1BA2J7v5xMmPdRQJNFqmfBKwRKgxUQHXjG': true,
        'FLvBupST7LCdDn43gYycMQgVc4hM7tGJEEpvN5XvPtQK': true,
        'D8CPNuasArdj8BCU92PViVUTfyCs8U87qG6kBzcJmAee': true,
        '2jX2NUotYj12yLT4AmrHQT6WJXTtEbzxRhvD1wNp4TCF': true,
        'BqCEkek9CfREQuPpJ3qzwnoTpoU3mCJ7P4WNcuzDu4o8': true,
        '99bbs4MoAv2YEPLuMr2ogPuhuTHBkQanjL23uqmUMMJP': true,
        '4jxUDRVYVRnfxcz9U2XRSYzwtoFu8iujyHS75woxcy8Z': true,
        '71CqgX9gicyNRwRdyMS6eELQCA4s9td4dVo3u6bsNctd': true,
        'Eno5zTppVEXV1Ns7SqzVmvJdxzFW44UakYsxpMay1nFn': true,
        '9eRon3arHwgZeGD8rmDrEfscrEZayKQmQ3GThuiHftKH': true,
        '7jWveQzkByi2q9w9zSgBbnA8NMSfyX2BdBmxoY9LC4xs': true,
        'CBqRGKKMN6vW1WZehu9gM4Ns2EmBsjPsswhTAhpgWgvB': true,
        'JfmkHh9egCpPxxgekrd7EcaPiE6YSzrstDh3w4AaQAL': true,
        'D9b11B9ZXPAemAkBaPNt5cF4baEgygzRdxRcGWyKVdN5': true,
        '8UUzkZaQsTcoRSrUspRKC4pPPfnC8GYizJhym4dx2ssA': true,
        'AekPSaSGKaHYNsd867GvzhVDaD2PfKRm7VgCXFVyyqnn': true,
        '61AuSaLsJqdS3SLyjNn4gSrNSWhG7Qcos3RB3M44RagC': true,
        '3WDqoTY7iYvExjmEra7auY2CHsx5NprbEPbq38WZHjBQ': true,
        'Dh8joZn7D8f71U4hYYkEuSn3eofuQMTUqoH65Qd9aMVy': true,
        '4YR77f4wpTTLK3bUkrzW4o6b1tkUkVnYm2kBW9st8Mz2': true,
        'CRNiP4WX2Da5DciKtPz9TEx1SmUGAYvux6VDztNuh9rN': true,
        'BWfyF61YfBXMpAxz9FnyuEQdSpzucLgMUWSstvNuZtCH': true,
        '8HjDUxeEY7oxoNZTG1PkSnKuEwYet8Hjt6oFW2Bc2YnG': true,
        'AAVHfg8EkhWJj4TQCKUZABE6wkpyK8A5ey7mC1eodNyB': true,
        'AYh5vaYFTkN2QAKWMUUhB2YzyWtbcPWsBhfpQqr72x6w': true,
        'DXB3kQSXDUVxczBGAMoaAGpwTnk2ausZGajngVLSJUgC': true,
        '8PmjuzfAMAjxivgB7wRXY8WJh7iqZgeyXhJAFywMKkFg': true,
        'GkfNnk7xaVALvjhQF4fVdntVsmAeZQWsNWRkmEX8WKNk': true,
        '4xALrEJH227JTMR6gj3z73hyVWbsS5yp3hq5oNiT45K1': true,
        'HxQpaiSGk6SrmfPkJUYCoKxA6PJk226EBMaicYx7kVBK': true,
        'GFszio7vj4AseBX4wj5yXTZ21GRUysgkgmwpSpfJ6VVq': true,
        '8a8qD93AbEXHoz3vs867aL3SXMb7rBPmTcEQwhq63Ptm': true,
        'DaUKfNJrtdPnneanUMaNJBrKcgtKWeuMmWmTxvYg3uye': true,
        'FGR8DNMiq8sYkQHcUdi6hogoDLTPj877yGrUTqgv2wWt': true,
        '3zdMBM7yxEAZZxg56PwLdeTQPWWc7WyjxZEnjaYMyFvP': true,
        '9yCBtyk1fEDssxL1EffyNykHK8exCE9GdbPURoGjuq9G': true,
        'ArQva38YkM9VQgFeuseHDqi4cL25MLaLzTT8GmpiWyN8': true,
        '8ggpCYv2Hd3Vzf8mBGPxujw4KFdk69BMeVNEnKnziuf1': true,
        'AQWhko3vEYAcxJrrHJ5q7pDaV5CobrYsVfaKrzcMf7b': true,
        '8UTXhksMUGetRWvfZ3kn8uM2HcQf4py3zdbSEiThLddQ': true,
        'f6NpBTJkTLqzsXAfJZaax9bEA54EUQ2D1rFQrpzVCWc': true,
        'D9pu4hGbJvSfDofx9zxXU16gDccpgoNxnSAAsPNzrDWn': true,
        'EVefCwKbJeNGb4kmucB8rct8WpNJ4uK2xqZpyLAnKoRw': true,
        'Gye5KtnAe5Rv5hM8Yd1eVQWaCf5w2BcFSq4vMSjvG9XT': true,
        '8etvxq4JCiSzwGj3nuqdBkwUFFGNgiGs78W1NAhm41nJ': true,
        '8LFeMc9cA1GMhX9wDZrszbQetLHmRmXU5Gpgf7wNzLyB': true,
        '8DyWiYYvETq3Pnos3vR4pKuph6fkh6sFHz78krbDmeon': true,
        'A21eDGZ2HjficbK2zS5iuqwuNLp6ZtfcadinGJuzQWEx': true,
        'HDfygZQhqFzNS9aPhqTdBxBmkCkuM5kBoeahzUU6wNUM': true,
        '4e4S538tiBmmHeqguH4eeftcd4NWMr4K1eyubXU94CvB': true,
        'GZTHMk5XAKceYMWytZxzVyYDyw4QGbWp1ioLAhePgU2m': true,
        '3WXCFDm9fQwKgy1jPXWYkLaYuukr1t2CqEx7rGsnfgNA': true,
        'DHh1t87QmiTE2YL1jykR4wvpnfGobyeJptAYsbhqPNtJ': true,
        'B9biHW7ZpWakGVXdE7JaUUxi7JecmHB2sR849AvZRhre': true,
        '7X3uczzdhQwtoWAKTgVRese5SqDJvVjH23YoSmY9GMrn': true,
        '8ct28GUkEF49KqG4eTTFs4hj6F8RT4NtM4qj5tbjNKpU': true,
        '5Lrn9udKP3tFHMJeZ6Vgo2aa54voUJNcgjvpjrdELKFt': true,
        '5Pn8QNYevxYKxY3RTUuv2oRjNde5CCgtUyfwRaWJgDXe': true,
        '4QF13LkYQ5zHQnSvHaHQXfj9ZbAEFymMzJybfzKJYLxw': true,
        '9714FxeZKcjrvLyHYAoTBWwAvjJfnVqE36izNANqXeai': true,
        'Cx2dw8FNBgP1fUtBif9t7gydJLZhTDFghvE8auVBHbGw': true,
        '247M734UbxyrnFBsuZrBt4Awerx4eijk9gcsNJ8doZ66': true,
        '4GpQ57HD7ps1KmBZJ2Mfhp7x7Nd24kRMj8s8UDXpPRnt': true,
        '7ueprzZie5un1N5SYPwEujzMAXrkyF9gJ6nZSaM2sud7': true,
        '5rsxuw553TwtGrMPRhDLLh7NR3L5xzKagKqBHxpG2SwQ': true,
        'EFqWQv3DNuDz44S8xZZeqvkzDKL1gUyT1tRNBCoUPMdZ': true,
        '6uhWU75yHMpaKYgcVSB68XYVXSaA5hZQdMvAkf67jjBW': true,
        'soCohAycC4PSzoSDzEkKKMTLjdswbMc8jMv8wtS1Sjc': true,
        '6oAyacuTDXUsjC83zF2DVS1fAdxfFgmsuQ3hXQ4LsExw': true,
        '7ySjcCttQ3632GvMBAqNqdfuJ7PTFVWTRdE9DA9BRD6g': true,
        'JC7s78Kk1AhWpnMwvq5WNKSY7cc9uXLWmdAnaQrgymTK': true,
        'AKYYyrsxUVEnVsH5MVhK8SEfxPM6jZBtB8ZJTNxbTrRe': true,
        '4JH5AVByJedkqpzetQaovNqpNz5LkkVGiMWFiqwnKxCg': true,
        'Eq8DB3pR52oHJDPXLkGvUMVLkqxMCJRuLhUtH77z31q9': true,
        'DBhYcS5QrVQvFm86iATp6yZT6bvjZnt8jhkCUsuXXcZV': true,
        'CuEUQJSmY8AC1MpeX5RbcJ4v78ZwmkoyHGuUj1QViw81': true,
        '4drqz2dY2xUmGp2zJJsdxixpdkWN5q1Y9fFKU38RAqJa': true,
        'Fj8ptXDT8PpfA5T2wsCoNDqfSbn6uv8VuiWBpXRSFzRp': true,
        '43k1vBLasdqDC7u8DBSLstCuADiNBsEX9S78g1xFGEhi': true,
        'JDzsGzrTo7fY3mGUc6rwFRPfeWVr4ghCe6UPAj7Tqjkt': true,
        'EphmZ9CGmgLieAyrrFx6RzoPzimsNvHpVXzsRmyULKZ6': true,
        '9FqMRfqMUQa8SkEA4kvYNF3m5KWyJP5bvoz4s7KVBUu6': true,
        'HBM3W9cp1WiJ2fJABUgtfEYZMriG743Ffmt1xYRyFWAp': true,
        '8uBDz4g8UMFNuQ8BWuWxNr5UdjdsCNGcsE1mAWRAhhxZ': true,
        'G2uCGtU3VyU5UyjzY3HE1au6x4PUbVKpWLKPSduh5he4': true,
        'F2ynZew3N8HATW6PSd87JKkHk9YQWsqzBRj2oPmt7wx8': true,
        '9MfWVRKBrpPgycWyws2bPCu7wXSceUnk8HSSPYzkX4DV': true,
        'CeBvzbrg5BX7oXdnyMi7c9g4dw6VemRioGqzc64JQm6J': true,
        '5aYtaS2VvuAo46PHKddiwys3HnivR5zj4G9nkwbnRQb8': true,
        '52gVBWrBHGBK3VYXfngva2zdLTcYBwkKdjWJkUGcz7Az': true,
        'ERUeAHtZFkxw9QGudMk8b9Jcmy3CmQvtWfzoCGP7ySpc': true,
        'TuZyTGSnWMGUYfVXqR6e8584kgNyeNikHBzZq5Vuf3J': true,
        'G9sjw4NaNumumXwTRogJpNJ7tVUDBTsw3WoMe1LLG4os': true,
        '5Uy5mvSgG51GaCZYoeBjF4FN9cf7yQYuS2JigAyjeRJG': true,
        'BYHyj2kJLm2yc59M6uk6oUZxRVPSTDiY4U8XoT9DaoLn': true,
        'HrDqR69XbEwcLYGJGxq76ZzoGeDbaTsV9STV8xwngnfC': true,
        'BZPkMC96PGn5wdwgEnqXs5S1GKXhAh14KDnPLZ7rTT4E': true,
        '59ZFtTyuznT1Jnot4Psf6Y4bf8veGbjnCLiZ4RZBTXBZ': true,
        'D5zptpLFpdgcMjwW8kxkPNoomRzcPi2udqqyNX6nz5vm': true,
        'XPsudpzcig3bh3ECeaNohGzvRDYiiLZxxKjG9ckjiHa': true,
        'AWdDcR4GKXjgPsoK12x4J82ANgjWidc3PsaDjDNdu8y7': true,
        'DkR85vLFRMBFgnxMb1VB5dKUYkQe6tV3PGnLNCbYwU6w': true,
        '9noPyjXcBLPaXAUjtSE8oFFvmDjwCipjPe3NVpm18Xw9': true,
        '9aNrLGfzoeRmDH1ZTB3YFjek2tGjFbrGqKvQgBnmAKSG': true,
        'A6sbr5VZVygWYsZxTefZUh17KXXozzDxo5aBXR8dsTrc': true,
        '4kKGd26a43neFHFVf8G4VocUunEjJ66uPBDUrJpazvMB': true,
        'eFLHqYDDeR3CEkFx74aw3uWCPsA9GAd7DZWyegjJmtQ': true,
        '7jhzYoV5avfaNWge5e3nxhGumSHvfPWKmEXMzVXZUMA2': true,
        '2hyxiZ2MLKdiqhghF2QC39PSeti7vSJUeDsH5tcB2FhF': true,
        'FwDPV6z6PLPd15UPX7mh2mRosPLRWeaVE6s6XMn1R4LM': true,
        '89Ak7NRgbZ39Ye1U7wRtSbWsxK9cBdfNAFPuhXejnmwb': true,
        'gzWEFbv1diwNU4ZexXDsxk4MT7trm7qoTiEraaPpPJM': true,
        '9T7UvVxLWA7vydyMaeH2hqhbnEd3tXxmqpQ2ESAQFpG5': true,
        '4EhgdHkpZPJfxnHc2hP2guLAgRwAHvPPZnfpNrrVSPuT': true,
        'HyhK3XMq7ArvVX9FBqkQqBdMDTLfxkkAsPhJdx8eBuG4': true,
        '8Wrf1CHFX1N2H8p1CNLZekjmVc7wj37EKHxyEFRW3D5m': true,
        'GLWDi7L9zbdn83FesiQgonK6nmCHaMXhbbDAXPJYaMtz': true,
        'GgntYcqHtitV572aKR6WB4WhoKrHx2bNJ4gkiYbiTjFm': true,
        'Cn4LjXMvyCGuG1bYd8U3UZsCvmSVBDPUfDgCTqYQhWxq': true,
        'CHpkE1ggV64ajvS6xmAEGDLSakjqPmJjYi9chQazr2ka': true,
        '848hHSAodk83p2YpX1uMco4GXvhXJNCvLejqbcK1nCNR': true,
        '3RcRznkbZ6MMzgz4tYh541tQjtsGRZohD59Lhg2B8B9v': true,
        'DgDyAKow4zKfB51Pzh2Vuw5VCqv1d54BPfvfGhqq9evp': true,
        '4arwBTVmXQsLsFSnGfmKikKB2S6ZgRkiepZV1dPbtWvV': true,
        '3PSP7zesaa2b3xbWhd7DYSc9MRdkyuYZXjcCk8p8Qt53': true,
        '3KUqXrJzrkbk3VEtPm3VF4UmdL1apbtKJHGYocZ7PTCa': true,
        '37DC8tuqdqB7jUTcKtDW4BP6rJRDwRxK5LK4WAeZUbcH': true,
        '9xgo78fFN9vRb4cuRinRVzcupGhywLiGyCAtiKgojQio': true,
        'F825r418wbm8X7XsyWZv3xRRVbC5MFT2ttR1yi9NXSQV': true,
        '2boAEmzPUnV94mcCydPrsQunH78uEuBEg9kAzuvbuJPg': true,
        '5XWScZQd113pN3DtPLkGPYgj1PXB8UWtXDNBqE3vMXC6': true,
        '7Cawz5Ttns545TPKHTABQXT3JdiZMBvb1D4fLbNttBa6': true,
        '4p9VED3WcgBZS75p1kYS3acmjo6NJ6dYFMuHBYCZwHu1': true,
        'B1Bhbfb7nrPKpYDZz1js1bFyFdrHLJdBngPMh697Nped': true,
        '4Yz7SwB2Hh8hXTLYcC5aHft9HAZNwtDK9aySBWcvXRQB': true,
        '42mQXqyEEg9bUzHUBAqdbkWxVshE2mqqsbYL7U5An1xu': true,
        'D24zkNkEn8Eg2ZqcX4RgZSnA9GcGR6quNbiLD1WPfmZc': true,
        'FacFX6Rqb54kMkcrXUB3oJywbYiPm3nwVjHHTUm2PXK2': true,
        '5fcccDU5ch1ovVawaN7n9kFLrNTMp3hzkPZvRmSmiW7t': true,
        '6Vfhi9qsH7UdFFcMpa37fcBmbVH34ibghep7NgFxqB91': true,
        '8Ls25SH2M8GihUr5wf1SjXmCYYw32eZNnnjCF8ZAxxZo': true,
        'F9TJRL7mjNKuteUdTNARUnxqiLQh6ATKQwStXqDrHQ77': true,
        '59GdL8m9XmRMTzr8gfqy8628LN88KtCErqoAcJNdY1jh': true,
        '7ax85ZbV1k32TMeEcLyiAi8X29GafFrmoZxY3ZQK7zKw': true,
        '3BjsgHghq5ExXhdWoQieb6Z6m7f1NPZtqRf8jQVbdA8i': true,
        'u5h5ah4CApKyH3chHKCtKVinP6hqvhzV6JuUoAnHVko': true,
        'BvSkK2bebKJGEVYrswxDR9XXixThfkRifRuhvteyw2hz': true,
        '62BCZyyk7yB9mftxrRgHLAJwQTwh44VtETYsUdSJV2po': true,
        'CFf2KqmAMYfhhHkRVWfcLXcgrM72cpfU5fZSZ1tprYcw': true,
        'BqCgjyGugUJaaBsiFLvMvRYn4qEYKwRZRkH3FP9HSvqg': true,
        '8ssC4rdfV9TTLXjD9hjLR79c6wfbDdeEkBwEf6BeMUyi': true,
        '42bdUL9CK2C6bycPWQ5vg88sktas4awGSngLJJ6gmY6M': true,
        'GTwjABoBTyFiPhuxMR9Anceq1ahKThXWFZr6LmLYJQPn': true,
        '5hTePyEa6QZDwFoS2iMgLbfuak4Gevy7zfNiZsQ5a3AY': true,
        'DfPfJBV5VEpeqRZUcdyJVTzRayn8paBTxAcxM3NHomwQ': true,
        'Fe15w39FVavo9cWEdA6nQ7ZY2DUbRcavTvF2TgiaSLB4': true,
        '9YXboosUGvcktpBJWdHyo1KGBDubgN7T1R4X4NN9pc3C': true,
        '8mZNLe1JzGis48jTpxuzbuEmPzpipEncDVuXcZwR7sDT': true,
        '6Tf73VrUTyAo2zPhpYDAVnVSVSQi5bBWkX4q24UKMDGX': true,
        '929c5XZRhjHdtExcw9YwyRVRfJtRdhmBJM5Tk2s3Yhp2': true,
        '6BEpgHKQNzRkxFazGFbRqRzLLksNJJTxpE5NoRzXFuCn': true,
        'EZrPnbkUKbNsmURNWmKs1kqGfX8SXoCFUpbSB7zQJxKr': true,
        '26SUUzXwqzbKdEVFGmujpXXtFM1qNvgzuZ7LgoR47YD9': true,
        '2G9SN4tseaWpXML6ZjmkybYeQrFGWWHbUVuGR7nX2Gdr': true,
        'BsCUAuHPharHowdwtvS1SASrZnesJWFUaeeHHDtDDedN': true,
        '7ZpU6pfgt6qzRkPugVLcTKKE1mV8u6mgZ1qej94MvGro': true,
        '7fz46biUv57n9cungtNzoy7wcENSDQNPF1EsAzzKvdt5': true,
        '5dysAHvtp3CfWFvbiH4U62YDB3bdv1BC3WzgZ4M72ED1': true,
        'Bn9zQ5PxNEZRR5MzxFSPRswfpXhZNS4qdcpCi6FnPkqq': true,
        '5vioU5KWAn2d47GyV1WNRMc5o5RykgFHna3xevQqvzn3': true,
        'GgdMY9UGG7EQbyTWjqtFSwjTtneN922KuqcMbZAKua9E': true,
        '9wYshPs56NfNH3r61xapqS1aZ1b339EKjVwABzwUyxEj': true,
        'DLU92iyViv4yqm9p46wBfWZrRd9RrzxKohUZbAiE12mU': true,
        '2S8CyAyVkMGYW1PME26u8ZM9tiYA6HY5AFGzhjpbsFcm': true,
        'DNc1mJhjcJNXNYQpdk2YCQmNcHSMEHpc1jKkAEBUYeks': true,
        'FnrLjKsWBuzvCX7jUbZmsnAoRka5v522QJtR4KAk1AkX': true,
        '6UqeYhp1Za2xwLKwDFU1HKASeR9shHfLWhBxXv5mWw8b': true,
        'FrzPBuDUYtaipEaL6qg5mWUpGU981GKEUqSHU91vyKL1': true,
        '8FKJaMuDYkB3DvF8Bue5um4dskty2WwLpkvnZUgSTCDm': true,
        '8y4Te89UJuotK1fyE36mko2N7zGrTiFUJVAEvddEbxt8': true,
        '9FnPWpkCzKmkV8wwn6Gn5koMG6T6bDVthQdJKLak8223': true,
        '8DhNSRS7Hh7LuXNWPKbyfCPEd1uEhGy245AQQDxRppeq': true,
        'AePAnNXHBJWXzqmyRvV95V5hKRZDM64zUGmpP16akt3Q': true,
        '6Nk7RD2sVUbjMup4XMeUA2GwXurYnv5nvFyUJPBtMv5i': true,
        'ADvLsdFktmMvJbsscoUoVLvoQXgNhxNvhTpBJAeKiJPp': true,
        '73dhaUDJzmjr4acJSnSg3mRjqnoEAVAL2DzzVLkEV8o7': true,
        '4k8fsCz2TqMxYHUPqcNPpGWuEGmXqFavw2YiugV97nEo': true,
        '9Cwj6A4LhAY5srbLJpu9qfPSXgbA2DDugsmvEo1tbo3q': true,
        'EvDnKkpX33CxXerxoVFHHAPVDowe8rV2T9YWnQDcjfbs': true,
        'APNbfapFJL9Jbnjwan1USADSr3unjMJtQdKuPBAN3qn5': true,
        'D3YQqNfbVTpShK7D8TGeHUJWwaevRLkTHTECAESWZBu5': true,
        'HURAvoGSmeodxn82KCkLNdx5r8TooF5tEjzN9ECx4mGM': true,
        'C6GoVD3w3FPyrrzSx37hKNHMfnfA4CkLoYWrqqSMoNS': true,
        'H2cpZFq6kwYME4dgePmUB1HnmgSP6vqeEHGMXR5ahJQc': true,
        'FZTuRtF9qi6ANBqPTS3zvb9tB8SM17r8KY6wQEfhF8er': true,
        '9T5AaHPXPTw7xzY1s9jXZFeUgRXZfi1vicGo2mMEccL1': true,
        'ERyBt1nmb7JGm4Wgp86eZdtW19dNtm6g9DJvh9DTTHnk': true,
        'xYcL4DmtV6AHrsSGNZakhkEViQbmTE8PkHQefCEuFPC': true,
        'BrzuuuJJXinjHVceBTRuZ7Ne3u2DSXBJgEpdvxc5ij2J': true,
        'GU7P3zsaBHVfCmiT9hujLtcp9vKUTaKDKhQ2jD2YHnK8': true,
        'AEhZN7XSfriHwdNYinPNvYjnJjWtnDJ7r3miCjVdqkXD': true,
        '21v1TW3yRBbhgJaUGEQTvC1Hmi3t5QDr5VQE42rRNgid': true,
        'Hdpx42MkKChaQsTQQYXySnuqzKagcovaZXzkwvz5z6EN': true,
        '4w16NMNEt4Y11vzVrwY1MLHXUZHokykJFWz9Fragz8Jc': true,
        '9U67hHAVsP8BTTv1ZBavEQkvixMr5ww58W3qq7tnBvyp': true,
        'EFA286jA34XgwVLRry8fRvFpf39GDUQfGvksDRsnwov3': true,
        '93jE8GpumZafEbPkTqEQ4pZdkEBuVyAf42qaHw5vqTZz': true,
        '79iWockTRDaVBBgii1Z28fTHcSncLmWjS6vtg5GyyCEg': true,
        'vCwdAia3qSK3Ceki7YwASfkkc1x65VQ4eY9vMnNqDf2': true,
        'AHCZvDSZiW94DeLsqm1HnHrEGM9xyYfTfXjSdC1Z8L3F': true,
        '711the1dRpVJnHRsejMNTpcMq8bu6txMgvAhayxsLTz3': true,
        '5jajrDicDxXu1LzKeLjW99de3LSysYuMjaxazKfXyetg': true,
        'AnDpbLDakcLmsq9ABM444FBJL2UfKGjN3ijfW37t6B61': true,
        'GW67ouZyqym5JZ2SCAmYUQ1y3Up6tC8UCkAS3GMW8bb3': true,
        'J29PWCzAB1jBCh6qJf2hA72yw79Lr1WWuhEkCG5uDjn3': true,
        '7LhWSe7UBfj5gGZikkrA6RHb4NM4SiGXDF5E4cwdn6Ex': true,
        '5pgw7G54E7kzWtJPppResTWfZ3v4u9sMm2aAb87ExJrm': true,
        '6rKhHN3r2MktYUYj71HgGZ1nec1DmXnSq7qwwzP6ohNG': true,
        'GvCdFTSgR5BGRYTmRmA4wJRR7YkbW1EC71hQA4r9s6Sk': true,
        '5wEcEPvQm1S6Rxj25TmHtx9HCVxUJbcRTvMxz472XDgf': true,
        '3NVy3QyXVrACTdmJpjTv8bSZvVwN4yhkscv1y5e3NVKx': true,
        'G6mJi5EUADQn7Ay8JnCp1Z6pmQxEUdfcjZJwFwLcgGWx': true,
        '9VWnTzqYd9kpiJ6cpCVzN8u1RBwAdk67HZK4xc2dBJfT': true,
        'F9tuYY7F1B6VbfoQqsr7SbeYyGRyHmFPnQdQ2gV7aZWH': true,
        'HF7sU26npHkNeni28LYf2YgG8UgoqwxgCZNsfqRk2Fg9': true,
        '3nhph7N71HpcVJpACtcSM1Lv8z8Ex7WUv2W6gPGMFrbZ': true,
        'C6WtoRDwX2PfLechqBFTj24jp3GhBA8bZxhJJEDACUNT': true,
        '3haW6kPYyWhXH2gVN4go7QHvKqiy39ZPCQc8wg5C7z9X': true,
        '7AMDSfo8HL52umVRtUtBV3zk7ighkVwJ68saauidcbeH': true,
        'FE2JzhQEs35mqastWUChuXjiwYVJjFjKkEzXv3WBtkG9': true,
        'HtNdLrpEFpHEyx4ouTg98CiVaoWks6tjz56RPTUYJgnn': true,
        '7wHxHYtASj7sc9rGyT5rTe3VB8NMk3q46c1eGGyfTkaA': true,
        'aVLF1fWvhBfNB2NFpgKGyWjoL8SXsSztjcWNNrUWZUp': true,
        'FkqE8QQab67Si5X47LqXNZ9xNByXmRhxhWyqeQfswvDo': true,
        'J62ffXTQXWoX5jsTFBBq6fhyuYgKV3xMEriQsfgK58Ey': true,
        '2c812i5czz3pubp63yLWantbXnLzRH3KwqA7dnr98CZy': true,
        '65bY3VPCwjpsBbBh6JCKPsGqS8Y6d7KSeCqnwKQBiDLy': true,
        '8qLySBX4XZMe2v314Jwgb77gNLBPrBjRJ4JZ8xH1PTsN': true,
        'E7xHPzZk7EYqkeUcRcokHq3pLgAdE6iJ1bWApfuyathA': true,
        '6MT9g1S94ZNq6KMTqxmsoQgs6UipRPkB3kkvsvSN8WXi': true,
        'Fhcj18725tjBu71Cme5gjr7uLejWwkwKLcAnXoAfoU2T': true,
        '5395nLbjVTMZwqrFsY471iZn35DTP2h25adXKk6NZg7C': true,
        'CnnhpxYKticLStk34tdfC6kbJLC75Fif1qzmg319EtPk': true,
        '8msstRZ6SNT3t49pwx6qS9wT8Nunz9zJG1nEby4USRz8': true,
        'Eu9QwUfEwEiJuP2zz599MLy8YW69RKQszHU9b9wUGV28': true,
        '8vUEaWGEPLXsKJvpfKu142XPxJF34ai3NsdcFo1NvbBG': true,
        '9N1GTErszcCVAdyvLuntoJEr1mhCKRSTK1dXFcwpQwY4': true,
        'GsG7yHrwHMbW8RRUu1JFrYFh7SDEMekKravT1YEoL1cx': true,
        'AqLZDoGSyYJCetc1odheo58J3rFS3LtDNWPuhXTkh5aH': true,
        'G3P59YfvM4of5yLNeYQ5mu7ZvdB1S1HNateuXYyF8NEM': true,
        '78ka9cjroq3GHDiokVMhGHbjcnXTPMw9mzt7CsVABq6p': true,
        'D3wZopZKBwV1L6JMFuwGTpKo6EygLrpdzG7ULbNPCbts': true,
        'H1xjVhAfParagLgDPmRZ8KYouZkeT9oYpPq6yUdk3oEz': true,
        'uw8gSpfNi78jaTfyVh3eLiE4XXTPapnp4zJncRjpd5U': true,
        'FKEkAhZQCbvgCMcEQS8RTTmMqvaWq79K33cGdkb9aCQc': true,
        '5mY9oWkAMR7fj9BA2JVAUff9D7QE9SCeUcGBp5jec3bx': true,
        'DfpcEg6eAVXKgx8nakPvXN6Af1xAexpRVinykGFzHk7G': true,
        '4rHvssNviHuwmWWvJzNdE57ip39kt1UWgc8f6eKNZEPJ': true,
        'GSACzFrPRM3XGNkEJXPWBNydtvsdQmUGoQnVcgXVeocU': true,
        'FE3MhxTZkG9NiY7CmWnRDgp3P2ftCAghYca8HeaXBj8N': true,
        '42DrtsJaHxgAGHYSjMpWnnJeC1DiD9zsKSD1AjYXRbs5': true,
        '5G6tcpAXVHBuns3CMo2w4D1Cuo4h5mZDzmME1Gp75Xxw': true,
        '3Ry12RuYL5Up9jBKVGVdKkLPn2gV1kvYW8if2aRQC9qh': true,
        '4SGPEnmPyUM7qASK9KmrtfTWFRpftWpUZiCbL7Se3tQE': true,
        'BEpEhFPJQDBJLRSZpy7kHGpfJNLUGfqH9aigyXq7xXwW': true,
        'BWKoGScx6ZL4DMeL6eZ9aHiDKQtiaTbVbTgJE5hyUD2r': true,
        'CLgJzF1nEjk5tr7AiHPFDhioFmKAXRGNeF92Gw5V4pEa': true,
        'BrR7BBRJeViVNQd3XBnyYsyHcRE4jXzRcfofSFPZCU8P': true,
        '3tCJPFDTNBH8eafwM25RRh9XwbChP1ZrKpm7vBfhWGgg': true,
        'yrauDHKJmVyCm8y3VKmgTPfkyK98e54nTtCFDF2yAWq': true,
        '9M1wcQwS2XvpbeWALsE5n3j4s97nuipZJzVZ1wXJAqdJ': true,
        'CiMR2MGCw4qfkEXruUokHRnSeiHx3wCQmzhoZZhQLCpf': true,
        '2xTEbAjUnM62oeniK2bPDUkgN7xagHcDMapHi3fWXggy': true,
        '4c328tsj7up1jZoKaTvrEfQkBXtvuCdorqVPk79tQgLU': true,
        'J172NnsQrdgV2szLch1kFdusiK2NDEhDCmoWHrzTBw2o': true,
        '3PHx1qGbXwxbs8mPdjZ1MmvtA9jPitqE3HkrFWaeP1vT': true,
        '8NQa55GgHrmApzFoPLpuP7bZFczrpMpNVHXjfT9A4VNr': true,
        '5VJNJPRT84ezArZU3kxRxFoh84aZA3rSvP3xmckoEqS7': true,
        'FiJG4PvD71hCzUvAXFhtTjaeRqYTYcrtWmcwUkkvfth4': true,
        'DLApgMac3hy8SC2CpY5CyE8NVVWmkJrauqwWEfvXpahG': true,
        '5gr4VfB6SQJ67SXHwise85zkRYXm6HDHGn9V94fq9YJb': true,
        '81zziZ7upbWiJ8f5U8HvUcZpBhmmztaWDDbqaA164Xzs': true,
        '6NgYBJUNDcYafhbZ5mmmRBkK1wTGpRJA2aQPYiNxYXTH': true,
        '5gLHqv2MugV2o2HAiBujsAPCbjiobmtTPJUGHETAE249': true,
        '87JV4s8mzgmtjGWKg9scLGWDYZKxmVjK2z8pd6KQ4Pn9': true,
        'BaWJXJzNjrXFgGBDW3N8KpAoY2CoJUCKYTxD2yVyjcan': true,
        'HZqVGQn2hGoFDFWdHDKpFznhxeYkKRrWigoUZjHNy64E': true,
        'FJiCQTroUg7zHtKhdNzU6cR8hWYddNt4fgVrGYkj3JVF': true,
        'Fz9CsznMyZaG5Pmm2wqLknRHSWupMCvas7xzUhCwC3oi': true,
        '615LPmEXUHc3N4CKz3SMn3YgA6XmHHqrg4nz29eze6y1': true,
        'BUQFK8VNxGEPY2FTZvbLik7pkEiUBYSME9A98UvE2ish': true,
        'Feit7ApwGM4t1s7JJcdG63Dte6z7gSEbwK5cBrG6MTni': true,
        'A59gf8QAkVuWL7RQw4XFYx7XA2WEufosKne1oXnPqecV': true,
        'oWgJN6YGZFtZrV8BWQ1PGktZikgg7jzGmtm16Ktyvjd': true,
        'C6esi27h3rkVwqkMcYJEtm3Z8MnJecerXUdixBbpXJFe': true,
        'b82SJDnYuPmdYPs4EXzpHEdN7BzVGAgXEtfW73Azssp': true,
        '5yLpFFCgmQUaRYHvBfMRQLqBFjzC96X2CYpkQqg9Khc': true,
        '4ftxfThQHfusPWt4cP8uoSyMQC74CSr4t8hjHux72TFH': true,
        'ByygohUFZQyjTPsSDK63dCWwXeEpY433xrX27wAPsVTP': true,
        '38hPMcboRWZHhewb2GPNPr6G97KSqhZCAFwJs4JYrM7k': true,
        '5U6XfB5uEAsrAjjfZK99JUNxS1YA2MPbzkz2YRpNwe3x': true,
        'ELH9vpKCH2ZvxjRCnJqLtwRVmKPj5mZjb1aBoxLxyhEh': true,
        'AGzzNDw3DbjexRD9fo9p4MWZfFyuKetAidg4odYnVGiN': true,
        'HWESgRrruprAZUiVCMv1MxkgLSQABUQYbMXjTxj2HyXV': true,
        'EHakAYFizkv68uKtManVjVa37VQJQf1NvAZUGKYRpQHZ': true,
        'CYXQDx6wHm8Ke767wGoBfYg4oJrE7bAcWr3zyHrQzUFm': true,
        'CCgxC4BqbYLrwZ82erzt4FyA7eWmQZbTuyk56B6PyHVs': true,
        'BoGDqDv8GpuUF6hZQBcxg3uTapZQvN2a7snQm379NAku': true,
        '8rKTjkJ7NK7ECeJrtRinhZSCnjtHv6LjoYy7jCa4Ei81': true,
        'AmRBn82tqaA8CczNCYBkH66QssFyvBD2Bqwx1kbJ3N3B': true,
        'FvGYFEEuyG7E3W7Wjcw8VK2Khw1Sd3M8vVXE9gLCvJzY': true,
        'CMP7wBVZtcpm7exhwqxL7E5WUd3iMN7p2WvE2d1EPrrA': true,
        'EEWzkhuWm8uCZ6Q49DpzMj5VbF7wJSkFgrdwgKqG3oVN': true,
        'p7BYhocQN5ZJRUgGKW5Z248JEQhCu8FgLuZdM4nLWJf': true,
        '3MgWfArTV1BHQopdUwsimWTXbP14C1eJLLKTbwNLRmM5': true,
        '2Yajk5HtoSEFdVFHSHmifieAGg73Dnabcd2XemauaWMS': true,
        '7JoiTbetNB3jtgEExq6W6hxziCAYekVbV9pjBzYp5svN': true,
        'C7F4EyWLJmhv7EFtEVCFrZtbpsNJZyTmBytvspidN5ML': true,
        '2UqJHb2S7DkTt8mNNbwBhHkhwt2LgrmD1FW8QcgLWPCc': true,
        'BETU9FPZL4yYL7rgTL8ZjXV6QHoFrSELkhdetiykC1Wc': true,
        '4m5XX8PVKwa3iYNg5WLYHH1efyU6hBN8ZXZu7dPsVWJU': true,
        'CHvHBzrJ8b1eMVPU8mmgixEG6gmqctYSvJt6TS2BHAb8': true,
        '7SephJYyigvgCRGi3Dycj9GXbLfXAJ2CBpMHtZZR68ZS': true,
        'igacCA3Zjgeupuh7Z56ZnvwWKEL1TdQa4rs5aWt881E': true,
        'EjA22ks4MCJG65T4A9Uu1AdSKeEjnjLD7oJnS96Jz8sN': true,
        '7JUcxAeZNPrwSU2VEJPJP6R74tsUK6WFAmTNKchPQJHa': true,
        '4yC346uecfMGr3KSZJnwA5uZHda7xcFsTS2F6Z2peege': true,
        'C817zgTayn4fr7DSQwDYeUuetUARcKVdtnpmDTmh8X9A': true,
        'DXA5RdDuHjS4aS69kRDtxoGDJX3RM2yK5G3oR5vTX2Zn': true,
        'AsgQAuUsJViaBRwLXYEWjPgfQfca6FpXZXviM79hXoHz': true,
        'AU545bgt1shAoYyh69S2jExPfpMVvB7QeKYyTWjd9P8X': true,
        '3bQVvU5dDy6ziVV2Uz27YFbY9Y51x91TZdUBSk1tdj8m': true,
        'CPUqAhLCWq3RFd4QVaTgjFK7Me5mKuro5ThuNtzK1soR': true,
        'BCe7xKiFsZqz81F5KxGQne71wGSG193GaKgWMHJqUfua': true,
        'DB6RxLcyJRXSZW5efw1wZa2VcGKsppj7LyvRm4pnSVdx': true,
        'BhWaeJSru9MbBShJTV3XvZiRXy6sfREp1yGbRByEc25': true,
        'J5tpCtsZifroxcC99nb6mSV4GC7Jr8EfxNiauVgGZ8XL': true,
        '3faLxxm97C9Xm4U3Mvy4StFPDnVpJJTr5JdTohP85R67': true,
        'GB3uRxpNQDRMxoGMDPT2XBhaXFphU2BaiQmnBMHXP6ns': true,
        '94u5oBwukL2PgBoZet3UMEW5yUUuHvA4JEDHn5tJkssK': true,
        '8vCvm74gMZj1bqSLF71b9qNMtnEcWz1tYD6TjBKqB3mt': true,
        'B5FvfBvaypAfvycZjKqtou2JhmGstwgF1mFYwdq5mChG': true,
        '7TfZwu4huonj1TarwKCpMjjby5kXZDg3E8J2RQgQghPa': true,
        '9cXWG1ts8VSMXnv8jKXquearheuXpEo4NEZv3Y6r9Aey': true,
        'AdmztRqLQ7m8wmrkFCANV8MHkbCSbx38UENkgB8PxCj7': true,
        '2wpzmjVrYqYMPUNFLPcwPSyzDD4rn5DZQNtwhNafZrAu': true,
        'Gksoy2HZjdkoCWEp5nM7rF7reM1favwh8dFT5Yi6hSbV': true,
        '9UJ1MtVhLfSYQX1BzYdz8avPC7avhA8H9G9FneFbwMTL': true,
        '4vTNiicZERV8bHaPvXcBRaEab881Hj2Kywja4uzgEWkS': true,
        '4jiSXKmKheYHBvJWDTg9ygJto8VDP5spKsVsyfLeoadw': true,
        '6HDKR2r42DfMKdi7FGRSzRKfKcchPEQdGHEJFziMFoGt': true,
        '8EDH85NXM4imbg5rCfY4vRQuNqVdeAkJqAYfvyCqHBQz': true,
        'Cp72Jmb7HCfuAxFKprvprttN9ybZSwHCybYbvFEqMREE': true,
        'FC9yDpedacRpXDpwc7xHPiG3a2Rbc1mF7Z72NU6dZvsy': true,
        '3dheEyY76sTpfz6BXxKjGthMwkF2vhLGQK439zoTc9Zw': true,
        '4jJ2voW2zGEYhJiMcos34ccWNVGujMHYs5YG6TToC3Gp': true,
        'dTPjY7MvjgVwboDp7Xw89PvMToZfKNDspBihonf8dXe': true,
        'Hfj7WuSH4tt2y2gtwNAtjWhjMX9jkNAkPR7Xbqp59SZ7': true,
        'DJTF9uF27q5UTCbe1iuHHb13rEvWgPhN6z6sBUXCeN1X': true,
        'GFP8gRicXy4v2pf2ZJLLDW7sdZ2n5Y22voy9n5FUdTH8': true,
        'Ekwxeyc4hMX1uJCQqU4bX8YAQDvng9iuMiqzkfCg5qnw': true,
        'CSZGUH2HiwkUsieS22k1gzJxQz8KqB9JFSqq6EGAYqjJ': true,
        '51cHvme6h7hF3AzotvibV19rWoLzy7CXv83Tg7qVEgz4': true,
        'FpmWBcZJq1KpUBYGad99tGZb5uSyjgUHwyK6D6HvgCRo': true,
        '779EMMMhfw8KskDK6H8D7P11zF69FaM3yij4Zuc6Atf2': true,
        '4SjG2CAEvyPxE4GNciSa5dek8NdvW95UwBfLkNxi75yr': true,
        'DgLKEEaW8rfoc6tP38hFycVD85FZfwt5TonaB1KZJWBg': true,
        'GkvzTPKZwXtpVcLaEzm8wyC6TQwnpYtvqarmWXX8LqSw': true,
        'G447WWtgpTMMhPbPCWovWcHL9BZgoDTgbXCqhgPGnr6o': true,
        '5PABoJyWziBtFJGLS2ddrb4UekMTPskRicv9kNpxPYXM': true,
        '8gbB78vBCcgRbtw4vE1kU9fPRMG8agYKQAMPN5DJATqa': true,
        'A8gvXw7jMk3nFDqPeJuBN7eD8BzHPxYzmNr49hZoqr1g': true,
        '9orrz2yB8GEVTEcmRZZEvDr78dBrWnxdycnZbu9EjHNt': true,
        'HWiDfzm7DnZ19VgY6QEjUuT7Xk31ELxaBiwF5nyWHceL': true,
        'AQUSBTxPNSLxVaPbK15Q5qUeA84e6tWbKsE3ZP2ucSri': true,
        '7LaQPoD7xvhQaRcPjQkx73zBwSD44mTq8byuFBA7nMyM': true,
        'CD2eLbcjNa5LyxJfdN2N6UPGNxdvGT4BhaCuKDJ7w81': true,
        'Hmq1uus7K5XfMoFXxbGFJ9JJ5hKqcCFy7piTRZLtYSuY': true,
        '4FEVNQNxbkpnJkGwYNRY8pabuChYa1Wyn8MZ3e9XLVvA': true,
        'Ee85BpDp8Y9KyDsFrJgHqbWbkycFFzp7RoXRdMpkKM18': true,
        '77Qd5aVRfZTL9NbuAWyP5oG1f28Rx7PY4fNJcwnXbLEz': true,
        'CrDaP9ZBCoComGkaVqUiyujPws1mSENbv4UxCek3GqMt': true,
        '2qGE7KVUKLQbBCcQKd7ovSQ1mwPJX9VZmRs2gS6gwebk': true,
        'GQab9XjzSCXwdBXQLpsgddp6MvPRcXLBidgCbcbqebp2': true,
        '8zMcQ6H6fTTQQgPQpfy29ZdBHzqocGBUJaAfDZcMYe5D': true,
        '6eBfqQYyrzBWPdD4n8HA5yMBtZV9F21BLFU6kfTKseCb': true,
        'FUHr9YD5Sczse9QCDCGY5tmt9FhVHyAKLkN4XqbJYZPK': true,
        'A5zDNe1rEhSAX9Aw7fChHVRJrR3czEkPfN1PbNH92Xxp': true,
        '83q62VzK5j6wkn2EbR2zZTmj2AF6RSfBCg5iLYh3qYiv': true,
        'n59yNE1iZRohoPykmva5jZ5WqKSxhvGakZavpVYQdiE': true,
        'J8mgyjKQb4M7DjEKvewBSvKZULMZMDpUtua9VtByLbVD': true,
        '9toU8ud8KGrFCXe1b7RhhL6rC5PFKBn8Y7VRkDZRGRQM': true,
        'GFWY7CmaE34EhNCHrymaW5CXQ6ppCe9EYc69oH6UfJzM': true,
        'JA2CCDGsgB5pVsx2cbgyFiexsWRqVE3rERhEakRn4zMf': true,
        'E8vkodnrwpYSLJsQdbZGiRKAhXfEf5Kn4hALEdxY6iZH': true,
        'CpEciqn7zR8twupwXcB7rhe6cjqfHc9ypRPmx7x59AUZ': true,
        '6AkLCrqXUftDhe9CPhmU4Y6FZy4TCkcqaBY7iLhc2MCT': true,
        '3xJKAwD8njQEPKGWa15goYmev8VhFkN4Pjh4nA2nXtFB': true,
        '7f98S7BcxgVUx4QtMyuftrbUXxjCcJa3CuJW7Ptvr7jH': true,
        '7hBLgEsLEBT2j1J6qZW2SDMFnDT8ZZN16GQeMgkGc5jY': true,
        '5HeBE8jKBziTz3QcUY4yHqNzeMf6whttuhMyPTcxD98T': true,
        '58vdA1xmQczrKrA2khr5RiQuvmKrpC7AiQXj312iB6rK': true,
        '3Wu928haQV2Gna5qk4XrKAygqF6o6bHdbwHvZc3ddVkq': true,
        'DJCegH7U5c9fTP8czuPRYRHeiPmGoGZXjrLaPp1vcbxv': true,
        '5qNX72b3Lyh8xSrKxLVz6s5FNMswXvUUDsCP9pdgvTAq': true,
        '4Vci7Rnwe5V5MamzvPMt6g27qKzaV9q7YQusZHYDGuAv': true,
        'Fh5u7euYMTXmWkmA4ZjTEyfyKoKxzcRsb2NGFjSntyJy': true,
        'C9FQUNmRRC6EzXAfx2tw5C6385TXDyBh3RUZmeC6E93s': true,
        '71yZBiKct9yZhegZujBimyehNmHqsz3Y8t9MfBPdMhTu': true,
        '9Mu5rZrmRMru5YMn5Z6LbWMudh3hzu5u44D431pmsjbF': true,
        'GKgwysVUSdbBgDF4eTb7SQhVbLU2C1GTtfFa3fybepWw': true,
        'FY7LNwwQVjidjWYcsJZoyRrCbXh9Ume19tr3fAY7bMtS': true,
        '4Kgx4Z4qD4nJTPWFcuzJWr3Es6XXqXBmR1PV5nbV3c9u': true,
        '3XJzR2fCit4Zm6SDxXBHKxy8cATNYkEJFjXBVoDqC9Br': true,
        '5LCFjPHd41rRwkhbhTeNVJ68JcHHwNQqLZXCkbnvt7o': true,
        '5XR1r8f6Fn8SGNa4Bfr2nZLQkie3wuxHfvwhWSpFAMbm': true,
        'Akiy3UvnGP6yfW4feSduRQ6bsUSp5W3X6BiRcgW7KqJB': true,
        '8EGcafXxZcEDNs1jQH9qZfJaZpG2t8mgbJaJihKdRdbe': true,
        'CmjJuaBRCXzKBR4ojXq4u5zTbMSa89HSuJ6Wob217c1X': true,
        '4yWb8yQKHHS1LZ1erLtaEHbQYAMR6V6NuAGzuPKJnha6': true,
        'AkXxqV2qdNjDg9ZYVDEWRQaWRd5DgAQ9Nt1idtH6B3AT': true,
        '29vuN88GuvRnhai7htncWh4oZH8aBuTf5E1AJkiqfG4e': true,
        '2L7m16ujHyFtSKFpfcTwTDJxBzjDfsbZ9avacY7xRxGe': true,
        '6eq364LZt9esaQg8YSfx6TpKrgD1zYou3AwPLWVnhdaF': true,
        '9z9GzuZSSqeoeEhWQwbjhRgsSmGShVH6YESHKL2ZUi8H': true,
        '6KHPswtx7jkMnftn7ZHEVDd3PpJVVGKaNeLbajtcefd3': true,
        'HoAVocx1L87iDjkHaikZp9egEbSVSkRoFb4Q1DuhiZRa': true,
        'HsyuoNi2uxus4nan8pNFefDCemp9KWdMdLZeniE4Y55o': true,
        '8VF5R5ybm5QvbajMT9JppRbSQEj1RpSk8JGT2MVUmffW': true,
        '4yph2wn3CynvNNuLeRsfQiMJEYPAS3CWqqBYNvx9yvjt': true,
        'xzq1PMJRdkKaHrUdrviwn2ugR1ZRwzxjactWeNNEk4J': true,
        '7ehCEMgW5Xap4YNYKE1uS8CY57zYcnsyPMYu7pSqfDDh': true,
        'BHAUKfZy6FkmqNQ53XRMvU2QsCppCpUZUmj7KYcbzfxR': true,
        'FPd4fWEKXEeB5v7pecfGunVtEjUHjHMwdrqFUTadvexZ': true,
        'EL67nooHTjyvVRdWT9ShmAA9L3hRxfPkryhEC6a3JCjn': true,
        'FqDUbvcTdDnJrdV2aLv2WnjnDsNAxxxRx44gFBRp9zc2': true,
        '4CYRBpSmNKqmw1PoKFoZADv5FaciyJcusqrHyPrAQ4Ca': true,
        '6m6prjQgBsTK98JrSbU1ubeDdX8B8zx5MKXZje1Mg9Ng': true,
        'EJvpTpZgpnsbS8XtTQpG3GsiJxRuVyDvWyFZ6EE4bj67': true,
        '5CjVos7urb6FD237a8T1EagnW8HxAyQ7YjVjnvUs7SeG': true,
        '2wBVbZFSECG2FMW1MX2NJXVJ2fZRfEthsUCGkirhTvxa': true,
        'DdK3iiUqSpxMCK9EAoBUqoa2oNwYx2ypN6xpHRHNkzq4': true,
        '94MwrhJzdZgN2JVD1Y4GDMqwnJmC8saZYQB5FbLAeZaS': true,
        'CwrjyfQvRUfSfHvoMaTUT8THahaJa4J94baMyZpAavdz': true,
        'GktGmioKNF9R5rujjJgPVKcebUhRe6Tx2yAiYgd8fxGW': true,
        '9sKcw1bYaqdET2S8iDur5oCrzBJrLZukEdFiXwuHgAJB': true,
        'BwonMQd4nust23hUCrwG4M8uMLrcyyZL6ZjSjkVQ7ux6': true,
        '5bMYDgYid7YsKMbdnoSrbBCdHWRwJ228JHjYNvmUXFpb': true,
        'ADEt452TrcCY5N5hz5pXckNC7jfAK7AZNGLPB7syEcUE': true,
        '9xgBvhvCXFzbgqjiYPTLVtFtCiwXsT5qu1X1DjvcciVN': true,
        'FgaLjpgXrdXnVBfPPqwFdN5WV9AxFzZMisjnc49svHRC': true,
        '8U5H7qqetGuYCt57meKGVVBiBx4wqgvmCZQNkifzcpiA': true,
        'Gjt2zVmzkKQis4TjnkQnx5e9Yx3DBMTJpHQxP5hjEry6': true,
        'F6s3Uhpm4cb7zPqt3neUx8kpWyZxx8B4sLK6Z1W4S4CD': true,
        'Hv1m2xkJQQik1cx9YmGsgf26QqNn3U1PeJ1VVXkM8Cw5': true,
        '2npBcr5i1i14L6odCsPuFp1HAzvppNBptHzH4K76JWJN': true,
        'HvwB8BPDVGag3TVP3tpP9VuDJTxEptuFvLpG3nrmsaB4': true,
        '85X9G4ySGkN2N2T5ENeVxD5gjR6kRob5dtszaQKkySoa': true,
        'AZcKo1iF5EB6gRRTczJjJdaMzgLACfdqXLvxLjA7x8LG': true,
        'GsZJpnvtBfHzqGVZ7CdHDBpyRgXJXeLBHwYBEypu9QLR': true,
        '7BVfVEEC8RFxWqfGinbmh58StFAZV7ofy6Ld1Q1SSjvE': true,
        '3pEoYCzUb7hWvqoMQGPYffTsxxPDkSzwSskypmYFBLFP': true,
        '57aQX3gnmKhPTK5Ufep7j78GTY6U9NTrS33721e5pRGK': true,
        '64xEHY6jcrWbAkLSkCv3Nt6kUVtNx8J4gRaWfbb2VG91': true,
        '4WYKk49hVPMRvMuY3vbWVtWCZLKxw5KBRQnwoMk6tuey': true,
        '3CsxeFexQFQCqrvBgJkyjdvdsg1QcZofHjrYroqYcvoL': true,
        '3bahuXFYvZUJEwNJzQ15hVGizWBRK44UREcAVrC4v5Ng': true,
        '8RnuAywMjiRXZywshybKBNzgLAMJWmBcZTW4pGtk2UM5': true,
        'ChG2buRMeRYsiXCkKri5it2tAdguQEPcxKcHHHTxqEv5': true,
        '29HYmbc77mPb6qU9t5k71Kvs1wZ56oV8SaU2qgKKRKiL': true,
        'Cy1P96UtnFZQWoP1Xa3U84AWERoSH9pPfZPh96sYij2E': true,
        '4vPpr6TnCSK33jEkqqdV2dGrYqRWz58xjfp6rrc3gv5p': true,
        'AA4YU1LAoz28hAWCDce2o7yzL7XhxzfH257BNDCBjiK6': true,
        'GicfvjrPioJY8uqgBhqcczydLw7EMaxshkPyQrBNG2fZ': true,
        '6MAvmKZDL5Nn7oos1ZRzGG9bQXGjuyEbzRGjzppksFbk': true,
        'EBFb8nW3rHcKEg551pCjgruh5a9dqq1LPa1f9r5EtJPs': true,
        'CFY9uAudsFsb9tp4ZMmZzFY6P3bC7m8s73JtdGiwuoKV': true,
        'G9J8qeFJouWyYt5uEz9Qp2gD4Pe8Vk2Q5bdbEi46i31G': true,
        'FSS3GhCHXRs4hyErJ1nzNgbAkxG1xGHmTTuyNZDBMyor': true,
        '7xccn7BMuCLWghLr7bcadnWbXEtWycyTGXc9aLTMoJ6R': true,
        '95cjbzL25k6TTTSLdk3o2fNTmnn3oZ2VSHPBXFuof8ZK': true,
        'BK17k3xWWpmHN8bQqZe6kppjAwgD3J6gjM6DevKzHAw6': true,
        'AbxLcYjNWae4D8q5E2Lx3RbMpTYa5iktCq5ZmAhLACRY': true,
        '7vwXfEhkxcu3Vqs68VseMAuKbsTEHfQvxHWfYDf3vwbr': true,
        'B513nSGc4DpZWXU1g6CY8SqLNY45bYmdPq74KHWEGFes': true,
        '6iJoxDwH36tyKum6pQaj5aPddmi6HV3QqTJ1G7suwpVT': true,
        '8gCd8GP4APZdX8noK1nHr7ijRGFSopTbtk5n9atnaN6t': true,
        'Bj4Esgsn23c1sKEPaK9p76zYh2zgnRZZ9vbW9FzL26Ab': true,
        'AJeZu3bwZsURHhjjag9Qaao4Y4UDo1LQgVrDjd9yeqaX': true,
        'G3Q7APx9cPcvoMDBUkzUqJGrZMLuKK2gWt661yUcRh9G': true,
        '6Nk7ksg8p34garSagPW31qDezYnU6sSxKwfJEnr4vkL2': true,
        '9p2fxrCG9DJwRsaNSds7JammPLmYpgqEmrHL52dikPx8': true,
        'C6WQBkFBwXgSzE5ZzEeZWzrYHkEURLwaYD8EBYGzrzzw': true,
        '3npqJiUTyfY9b5VAxb8DXszyf7Bfq91CRKmZjkyTrycN': true,
        '6Jyi9Nv5S9ZQ53bUuMGccBRdzSLLT4Ct75BbgJWBwZit': true,
        'Huc9FiwpujTRCPvpXweuGNosvBSfTbq1Rg5XCcuBPifx': true,
        'CYe7ei6VH6SkSAKgHDbtg3sScxQqnwFmYwQjXqkSHRrj': true,
        'FnMagmNQAJT7E7QEef3keCUCR1T4ocYTQe5K2Rsn3eKh': true,
        'GoGmRAxxJwPayCziPy365VLGcJbfyi1tHipZYFSmDtL8': true,
        '24ktw1moBZUuJ16HzxPHhLLtFveH9xT7gx9MuSVHGxhV': true,
        'B4BSen4j3YwR3HKEkzBFDSa2jfrdzyDqJkMzTma2A9ic': true,
        'Dm8ntokvcVdg2bj6GR5HWWNhJrBZJ9soeLPgdXBGTQPF': true,
        '8DizPPRMLaFxMgzgavNUSrxWPyNgNFycC2yZKBXdMhGS': true,
        'HCBUu2JtDEZH4zhynLt59VHT7PpU5M2ziqV9dMc5uTHQ': true,
        '8cDiFTq483HzVHE6qbrNrPSXjgvkEKQrE2mL9sv86AEa': true,
        '8HyRWBkHWauCd4TkBSgeKeHixsQhYBSUrMecHhupYn1t': true,
        '9rzBjVVWBnpC11NZZxfbV45XHWLvFu3HUhdNqcoC5jg7': true,
        'EyuzYWJVJ1kZY72bUSsKFGCHcV7g4kWWgcYqyC9BC8kd': true,
        '2divbEDUxXaPd48KYgmvCV8XANDLm7jnj7Pw3ABxb4e9': true,
        '5EdKeDvfMVHzr1FLk2enP9ct4mYg68bdeTDNgMoPF3RW': true,
        '5uVryhxGWUYP991eWniqhLYDnnrtErQ3uBkpiE5RxKL7': true,
        '5226ab6sjGwsdrqx9VuK1gZMV8kqnQ7TRmb62YeaUkbf': true,
        'Ced4fzMG7vVVBVDYdRLpsDaXeA823nuGcKriSeZXuEGg': true,
        '4VayfmoKPKrwYKM3JQ1zP8rK2Kd5P1kgXb1m8Yw8BrHy': true,
        '2opmsu7E5omNz8XkQBt3tcnkHeUsDHhYpgFpLvVJwmXF': true,
        'FfSadFq7hvW8LHQa4auhfsE5rpRJ7ByGpAVsjzaMBVZ8': true,
        'oW2JaQNp4YBc6E7NqcgYVgjQ4DQ8PXFriPN1dE4o9hE': true,
        'F4Br2dYrjW6E8mc4NPTrogBo3aShiX6E4zDabmbFqafS': true,
        'B73QJo1NEcxtVqVy9K3RyZ41Z2rwsHRbT6TbWr7N8SMw': true,
        'A4X3uBJc9WqwVhTEzMwy3RaV4PLUWBhFJKCTrQteVGVC': true,
        '3J3idyzQzMn2ate7XyS8vJdXvogYFvVHhrGY6q3nPaDA': true,
        'GDsmSRmDNMdVjGdVBVoezrKXFJ25JwAAYNWLvB1knqWv': true,
        'gV8Pxn1fYYewRcCGpLds9ArUBxdYGa6s4Y6RtMiFZSZ': true,
        '7rwUQC5qfLWh5sgLaejfMMcjGTsDP3vrrYiikYGJ8wJg': true,
        '3QRyj6HneL8RNX2zHWHmhYPrJQywx69ioNmrdj7dLcrH': true,
        'j1pdu16gAzUaF1m4s21YXHCNpSN3E2tHrEEGdQLs87n': true,
        'wLekFDmget1VVTFV7PQYrPsht1hiRPWJ89yXAzemDvo': true,
        'DCEZFyumEJPwBVQeSE1K81jJnFKCgHcNuo8EXvGnNNL6': true,
        'BRU4eQLdbCoMUQwWYUAjN42nCXyCYMuvD3wJXAxhntP': true,
        '8sfAQLC9AkpoR9dLsAcviCF6zpQYaLu8ofwRAfzTYjy4': true,
        '3TETptbELMZcF3hYkXFMtkrs76BwHA7g6u6muf5fyttV': true,
        'FHfFTeK924guADdgtTATZdaPyXhy4vbZNjUhAwPLaBAs': true,
        'Cb2m5UTargqvLc11KNHySGDd7WtYy6hq1ZiexV4StDc4': true,
        '8jFWg62nWTbcpYATL8db3UESYiYNbJPb37CkmiVsT48Q': true,
        '5S8d98zXkHogcptSSAMpyC4kp1efgj3GsmF7eZhkhXgQ': true,
        'DyBzSQ2UEhNJgPDE2G9PEsJbEcjJBBhci22yfg3BG6ad': true,
        '6vYffjwzkwr73HzfEuYcyXyFGyUN1WAuNSRuSqaMenja': true,
        '8UP8EEteYsLXgjBcsBh5Y7BJzYWWuKZZyCTw1wBHSb77': true,
        '2X27xTaKYCFF7D2jVnYNKsY6HQ34PaUidXFxXestA8nB': true,
        '559XzydvC6MtUjLoSGYtGzMGsjMooFTdRp8MiHkosirL': true,
        'GgJt6BVVnVPUYpVREePEvVwW3VZD43yQhvFrcGjwU7mP': true,
        '2kdtEwsT3gd8L3pNHAL3XeHvebmvRus2a42tXghdqPnx': true,
        'EomL48uviCZg7jybZ6uF9PDSc5JrWm1CJbvugkujLMR4': true,
        'A7VxmYzMM5aTuD7cCH2ndkppJZsBqDUapxdmx1DC74SU': true,
        '5JGyNx9PWB1XJk24xuEbVZhwgrJhfpE2VJfWiosMKLb2': true,
        'A4FAfDv2JTP4MZUY6n765r3pMJtyqGrN6Zb6k2VLxXXS': true,
        'EuiqUg4xTvHtLnQpDvdKGmM6o3bpqARUrVQQGJSQsAgP': true,
        'kpUuPGuRwarhMHZ86SvRLJmGM2oZg1qr9bDJoGaNzho': true,
        'HEycsH3idzsf2zJtMMPx28MEGdgxwrncM2ZdQzMw2PjV': true,
        'Dw6YyQikh7JpNiVNhaoBQF29BDoAerBzWUEU5pnru8u1': true,
        'AUw8CfcSYFF5BdvLJxHSEnApXiTv4RWcYYJofd6ZLJGx': true,
        '94mKXGVeq8UYQCUJdnfxu1eRFHh2k11R5VXKfufPUhU4': true,
        'GjoWhyja1CGR5ondBME6QV4JvX4WfwGEM95f5td6mVCc': true,
        '5cSxMyhehR3kafCtVLPYyfvH6wr4qZtFykzxjB483h92': true,
        '75wBYrjYVpAQVigLXrnF8Qy2RCLCktWWMoUHPdHRDqEd': true,
        'DqZA6LVhNP5xVtcBZxXE6VWCBhyHi6yse3PXAMgAFUoE': true,
        'AZMkGWa74xqhrH3u5S3GwHbsXzjWVmLXVCNMzc8upwc8': true,
        '8VwFAh7Xr8v7K6mWsQ5L3JcwKfqqL9zTYgSELNFu1hAx': true,
        '7BFhpMNCyonQL1SZ8vfnXamzzrLYks3pmZBgfVwRtLzX': true,
        'FiDRdhb6ka3cni1ymx5gWay7EvrKaxw3ccg2g33YonjD': true,
        'FZxNGp536RagEn4L5Y9tTD5YruHEPq5PPD7zhr2YMUX9': true,
        '7psJ71xNhn1Q2UxNHGcsRt5e7yr14WTpc9RfU8FtgGAB': true,
        '9Ni19JJDixnts5Q9iszQTGSNEc3MEiUxeG93qPKRET9H': true,
        '7bQo5gDRr6S2oS4XQRfbCt4jJmH7wRPcuxBsPrHAqUBf': true,
        '9rxcooDeKsy3UzwcLHrgfaeCUQnnSaNUDdKWyW7Hw6DQ': true,
        'F2ZYJK4A4miyrQFZ93skdhpnjEe29y1UngEScVg1r8eQ': true,
        'xU2u5KMuQefQyG7UfMxvMmgTQaJPAkSghgX4U7gLo4d': true,
        'HbkgRoxLffK6gzCvevvryLcEhrqx1wSEPRTxjyVwC84p': true,
        'HB6zKLpeXFAS45d3zBhiompPEmzUBqK6q1TpjdBxJoYy': true,
        'GCPPqbzdkzR6N7QDbAQUSaxiG8tiGcBS9JGQCtVzgFoP': true,
        '9CxyNZtBs9vjPn4xCZtohzDFJhAXLhhpYqNZVykHDAf1': true,
        '4M2ePy1tFHtqATFAmU2zTbYC3AmHqnFrRoHyBc5QmGHa': true,
        'DQ4pxXMWSCeEvZt2NvU6Lnz5B74CnyCR33smGhzokZ6j': true,
        '3WdXyWxz5FDvcPBQy8XCQcTB8BgwbRu7oTVeAoeR5cb1': true,
        'HzVFycoJsz18bNUnCpRButLMgCVRz7ha4Uc4fFzqXYfF': true,
        '3oRMyiS2i1mtY6prRFFzKnGEHsjbe9knZcfWD9isLQUx': true,
        'JCAXtsRMpxnLdUzySeGyg8ADZDsQ4G3LouJJuTGTgivn': true,
        '5TsECiMXBd6AVLpsTDMX5BAYjLWz5FRo3Pv8QmHvJt42': true,
        'ENs7oQENRQ6zK7wcgMVMEm5gB192TpAj3PdQ3EUVY1zB': true,
        'CBe7WmukpiAE8oNc8VRwtWnuyj82x1jnM2Wp5bp6C13F': true,
        '9ZkX7FeYQTCkMS2tLhHy3KrpQh4t6gX4cireTB6hmG1a': true,
        'Ead1roeUkQXTHZtkhRfr1gxmv4xEsnbUinfw77EAZh8L': true,
        '9mdobZQu8XbdeNzyPEEriGvuQ2JyKw8NF2EfEetjgWqU': true,
        '6Dtja3xGT2wwpdmavX7yJCisZ4jRKgYr1WPRMMFb7FFf': true,
        '7rC7hszztyPHe8iRX5hc2QHPTgMZExEZaeVu1BULffAe': true,
        'EbpEQeYGR7i2XM1qRkhRvV5WmfJ5p2BkNdsfMDZGv3T5': true,
        'FTVV5saAe61MbkNZHkfDYBLFVJawWS3Ct8RdirErWyss': true,
        'EzsP9mju6T2BqqR3RLxnTzVzh6Sioz3ei9NABKAWgEZs': true,
        'BuQMfVdbDfJbpiYMdJcZmNPqz2YdjhywBxthwDpDZsNb': true,
        'Aoqrfj8JfRJDbzCea1fDyZJydWzWbAQqTZHci5ZVUyQV': true,
        '7yAUGcRqtUxnVwJ2U6brcbHkc12Yubdh3tiGWL43jCqP': true,
        'GYeLfmTaPxPMhzTGcZFzFT3eFiKWWDg4UcVhpNPhZMiX': true,
        '7AbtUvf53umG8eDa4iCfes4h4a4VQ62odawkoXg1v8X5': true,
        'ALAL4hVacibupwxsiiVGYAskjzRXs6c2SsgwgG65Na3n': true,
        'BpHYTeZMjm3oryCTXjFJHWLu6MyoWt1YX3zZnzkd6kZu': true,
        'HtFny8Gsf5ZoFuKtwy7tFYRLS2MHakRhDJaDnx1JBX13': true,
        '6za14ZgKfLAkFS2M44cf6GEEkEgPYVrvB5iZrzDUemzu': true,
        '4ERqbR8ySRB5n7rzra28AmU2Tg5uiab2Do2QcNvFmAdj': true,
        'EzHhW8sg8aZ6t5fnrxJkw235eAfQsFVa3HcbQhnahR3g': true,
        'HwLK3QMbcujup2whSCxcUBwKhgETU99TkfTiEze5dfp1': true,
        'CBffuxpLs5qXTirq8zmEwGMe22dCH7VDMcg4VTEQwdgQ': true,
        'CxovugkBz9CoorDMkNVTseNAMhbrnZC62D22iSTqdBBh': true,
        '7cxiq2dABfTbzhtTx56Ua4nYjY62J6dHQ6e9PxXN4qhU': true,
        'GKTDuYV4NvEQVqKwtZB8ZoSvGzCL48DAaGg5exBtdmh2': true,
        'DFH1TpCQ2VKTX5Q3hUz4TKarGjAwxBtaTn99JiuqXN7o': true,
        '2MFqVeAo22197VooPwoJBKRJ5e13YkPCP9aFeoa3zMof': true,
        'DCDsmFdzhs2wDow3jkjCSfvKyYLSHcWPTwJuUwwyXkja': true,
        'Ex6SGtCX3yV2TLB5eT9qckaitKYtSGPMq9pumhE6wBrq': true,
        'DWdwr78PjtJBUpYahQjiWaBLLZDNGrGdYkAWGJ1n5LyA': true,
        'BSSWofmPyfb6QeDDQvq5DiqnKu7ya8ucDsfSigveLMRR': true,
        'GsnTqH3rpCW7ptGGo8bcSbV9CCNRbmXDpFutH4qG7T7z': true,
        'HFGgbtposohoWdHMD5XjoRdsu67oQBRqgSyxQMW1MmxG': true,
        '3kRe7HWjhDnhyqkmSHRCuKWUiNijaMrAzStdmbx6gmTV': true,
        '6cQLja49NUgYx7HJyP4HkkkFq8LWY3Aje5RakjWJybe5': true,
        'HoKy5AtnGNHnesUyFEbsEodGTQ1oNi7uKV2waoxyEtTC': true,
        '2wo1s21d1Zh8ppa458qcUoQh8c74xW5pyVbFPU1sUfkz': true,
        '7NZdmFLsVk7zhGjKb7CmW1n6Ev8eWFxBk6ohjM3ZVqkp': true,
        'H5o1xpFjUSstSzGYMXRm21MhhgF6XoGdLoowXfMGMGNJ': true,
        'BUNpEP3qS3MW3mRMjTeXbAV692NBuuViVKiiZtftosaV': true,
        'BPXRK6AP2ydKKn2vLP4agsEmPaJgXUtcrbWgUBYvt2uJ': true,
        '3H47zV9rTrWge8gkWbxyJG4WMRQFiAfqUW4dXRJyzr5d': true,
        '5GxtxZBkpQiXNaNVThnTLmmBfKDMkX36nYG3AmhttiA1': true,
        'xefCvyymAWbxW3p7mABSbKW6kqVY36GhSr3B5Lmt9nD': true,
        '6PfMSm8E3izL4nbi14Bs5rsQZ6skMGRTNVepD6EvQ3MN': true,
        '4SnfgSv1JYZW9S3vH6LCuLMgfNV12MoUVkGeu9kiDyRo': true,
        '9GGTr8sRMbyb8wWi6dcJGDQR5qChdJxJqgzreMTAf716': true,
        'EPR8jhe4BzPM4sUrEhdkPbhoScDKn7FnR72DQEuDaK8S': true,
        'ARsLUFobu16BY7rai19Y9fqxKiwAGsDnFZyYCtLBVNdB': true,
        'EHRs1PsYJFGTkTCApG7dNFLUGEu6QuUuPYbgYy8mJeAh': true,
        'BK7rY8c7xeGkraJajvUmhHeECkZKosfmi295vTRwDpJz': true,
        'BvzgptJ4Wcc4YGRkojLtRCL3w2uuw1YGu3BkJsFzVnX4': true,
        '3k5jqUwJUntG6UHfnJpw8GQCwbgBeTs9s4q3npf8VvLn': true,
        '5js6KevpPJExqC3e2z9zfxk5exR4RgjHjkTfBLeGy1sQ': true,
        'EmwYu6ghzFLwRjja1LdVU1fAh4C2XdxMZxH8WCSHAPLv': true,
        '3ig8wtHdFCFko8mUidnTswK1H6yEgksjrmu4BX6k8fR2': true,
        '3322YhET1nLGnZEiSA6uo3WNeJfZw7Ltuc5usLycPYen': true,
        '6qLSwfZGxdn8u9DjgTXdJMfj5SBiC23KcFscwHB1ZUcK': true,
        '86cAVtQQtS1jak2vqP1PNP8SagTt5AU6EQydnm9twNRN': true,
        'DZC4yqqn7epgJDrWaUoGxp75ub81burtfa1jypVh5r1b': true,
        'AHsDF6NB9AtL9vWZHpU7ehAYkJVgVs2d2XdTbLSMSkqD': true,
        'DdCapWdvKUJNL7NMW18yEzd7tJgscsYFeRc9PEzx4aYF': true,
        'AGfPLg2JdLa5LcR4r3YEwXteR24zQ221fDAK922xCaoh': true,
        '753EZUSUR7gVirveRMGL8jbesjgGfxb8xbHcDFsfMS4s': true,
        '37RF2Fn6w583MaQto11J5f4SCPQSzKrMhpjkFCZo2hKF': true,
        'DzzdGx8gECz6yFoTJggSP1ZF7q9n1M6UuLzhs5tt8CZp': true,
        'GXAGxHYR7oyrtBH2aAozs4f27eB3uDWj3gndVKFnFpmi': true,
        '6pYioutq64BBip1jBhvZnATpYEwt7QVPpcsGVEsKvVRQ': true,
        '7gunFDniB4WTuemRgJgJXsm2fMrEjmHNBYVPu8p2Mu1i': true,
        'Aps3ZdwdYBQx7SVt3Wpm8AafrXUKNqap8iuA4DvJC21s': true,
        'BqDoPq5MkomxcQy1Cae45ahhzU5DTLqRpwsdGGiGf8wi': true,
        'FzTvCTnv1JUFWVt962HCg7SskRHiye2dehHXKSrfXdL4': true,
        '3EKLLxa6bnTDRwrGisucRnfjZB9a5qBrWXhFqZdVKExn': true,
        '8GTgmbdvJxCLt6zPizDh8udtf7RFJieKkS7NQLbNArF5': true,
        'CKrN1XBuRLVf4KnkNGHoLQ8PTWTEV8mR86iuBwVk1jbm': true,
        'BFSDZMqPbYmKGHBSbtRznVyKETdHh75yYrJG6TqhuZ63': true,
        '6sjGnd2evcZapVAb1548RpMLaiW5WrSvE8abhLJxVJvk': true,
        '5xADhaU1kkGMUcSV8r2YyQGPdyDtBtspHqvv2qMWEof9': true,
        'FrXThnXfdxzeqyPNT2EoSfkKChMiCR5uWxvUxTrw71gU': true,
        '6NarUvLRPeopvpmXLnYeBhB7i5BzgrjrGSg4mXb3z5ZM': true,
        'HsHQ5bG182ZGPJR4KKRJwknyDGU6c9rMRgKxJ3XbpJkE': true,
        'Go2PK3v39TVw6EuafGcW1JB5eUBCYXT9GhoYxew5aaG5': true,
        '5fMUzjhtVkwxyUyDPzSZuCz2HtpesaaTNMTRsFzZvkP': true,
        '3oChzmRLjj4rkUKngGyh6ur6YqFTE2q9WBLxK5cDEZYY': true,
        'J7CTygVCdL3Jextv81rLU5FD8oCj56FtSmivT5We7dgs': true,
        '4dvfEs13aoMhqnME7bvnPBKDaRib9QS9d4Z2xxPgAisf': true,
        '8dV1B2EwfqtRL59ffBkWP6LcaC9xRniWBCXNnRPbpPFE': true,
        'AtZtQEJGYhDi52rdBTcnZXkPckeJhcLKGicUXBUa2WVG': true,
        '6147ZNT2Se9hKuZJ4ACUeWLonSUspbGpun9xvNE8UskT': true,
        'wUBbMyitebNhPYG8EzqVbsT4DFR4S49pwQBqvQSZ3qx': true,
        'F6YD5SJ5Gu5bdtDstWRsVL8zLxsrye2xpuR6P5uqHcMB': true,
        'D1yNuTJadhe4eFx16zXsDWd9yZUBX1gqfbeaxNqiQe4o': true,
        '6kZyrEnwx47to74xPcAJRrQMccZR7H3kwXuAX2YG2FfU': true,
        '9ouAQyfnanLykEASqHSpxf1WmQHiGbbd6BCwQkwwaHYk': true,
        '3HCcscMHQLAdsdjGJQQG7ayPiSZZwBqeKDbLaxJBxLTy': true,
        'ASnUWjmAGR1pYbSXUWcxJmicQrdwDro7FtWaqtCHnYza': true,
        'DbYEmtSaRrU7JF2cpBSP8gnX3R5pSsGCzfUUBiXMgtju': true,
        '6dYPoMRD5AZj4msDgPmVizSxu9HYQ2SvQ2PbyNedSjw': true,
        'CSLkh4bEbps6ViS9dBzWQptFgY8TK4UzbrU5QhCnJgWZ': true,
        'HHM3QN6BjWirnNqXpWVgbVZUBjEghcdDAx1i2AWxJw4q': true,
        '9AZCzuHhrrg6TGyJvq9Fk8pYJCb1svmDGzfWtDDB4NBn': true,
        'FqsfJ55WogcokzhE2DmB5yvTSfrCYS98Z7KbARBv889k': true,
        '3xL15wS1sxujjGGnV2A4iuyx23tGr3YvJmdvyE5Bmkmv': true,
        '85Lpuwh5cXZcSGy646obGyJFceMywt1UH3VYcJtoFRWX': true,
        'FmGEJynDwadziNtZ8fqpjhmrYtJxzFyBb93qyF5ywGF3': true,
        '3bm3ysRuBFSpPXzTVGuYPvh9g8JUPVyo75Qk3wHxzTvc': true,
        'GtozexfTPBPsBUm8x2We6QTG9hUq1GCcRV59xfDgAYQM': true,
        '8vpnbNfAbb26meH4BpXszXd9iAGr7TYfWafSjonXyi1M': true,
        '4KapQwW8P8A8FGFqYQA1q8wbydBUymapLyoYxTXSjPsy': true,
        '5gzSj9jNLsZwwZuMGRKodsuUpb4npP1GPnbftFLaCmeN': true,
        'CZRERCosPCoXfv74gN8jExRPXKmuwpRALPn969bUWz3W': true,
        'GR7QWobqV69uJ3rwrNKr4vAi8ymE6QaPRRcfU18tPsdE': true,
        '2ZBFiWctSdcv7PphTWXTvUWMatoxYUwCpcYnTqB3DTdo': true,
        'YXuYHk2eAxijNXcWBAMRZvvrk8RpxADi6ToWYQ2Fau1': true,
        'A5HwCWBe4tLVzDvNCRYck1kGjb7VHvumx7UnxhodsAJz': true,
        '9AH4VeenRdAwMVPW8ohwe1x3vaTpYWHzLJdJ9nb9mmdb': true,
        '7srnPVCq1AdfDEQZaHfiKNVam2EUHkB7cdRLEv8UTLwP': true,
        'Bi5NR2tmFSG8FKG7VHPLDWnhYi6jZ5MND2P4gyPp4PKd': true,
        'B2RzEEq5Ua9sMnKuPqSqaVtBbwpZkJ7wWzwP2QtHb2tz': true,
        '5cHeWfcYbr1JRBDzpTFws6uy5tfTdbgVkkmDW4X9kUHh': true,
        'CdmgfGQQH7saRZffeWXSUW5W2cn7321vKBdii1WmDxya': true,
        'HfxznYo41ro3Wz5uTWKPvo8ncB29m3A89utQFpupMLDa': true,
        '3v5tvz71tSdyaEqUFm7xLQZ8sT4PsvfS8juUyXJBAxzn': true,
        'C3ExSk46QbgDNFLPNqdFhpscQ1ZuVLV4FKFqJx7dv5SZ': true,
        'Hjtc6iEPkBPv3zwbr5EiGCfCzetby1sg1eV1vmMkPcGC': true,
        'FDKRmqXK5DzjoQMNsSQXvFXQZwV7ck7GBBvFGYYWKXZc': true,
        'Dy4732q6gMoDzY8pq4JoUSzmhWJCRU1jprYtUeUuE7bm': true,
        '4APKErHxHG2xx9eU3L4Ac4VBDTA6po1uribciMLtA9PX': true,
        'HTHigPHMXo6YiZabbWpWTfQCdo43fG1f6UvyWKDEA6ko': true,
        '3m9VDWTDCo2uVrrz4DUyuGgonaEXjwhWQ9QGhia5zY5D': true,
        '3z7RDztWxhg24iEcz5HBAH9eH9gsHMPcm1ujQ1cit5wt': true,
        '759wFwRjqeHvuuqW8fEXHFkQgJwhoYEF7vJQq4Peyxai': true,
        'EU1zPEwtLdPHjM7BqM2RYuweeM2XagZ9p8THjiY3rHyS': true,
        '6wuf2XSMQrtjkisPRtVMmErZ2j1vULtYNf36wi6ETM5N': true,
        '8d7YTvUVLFhqsWVt1sFZoa7fEM1SQKCpDmBKqmKg7mmD': true,
        '94Qv3XFy5bkQ52zRfmkDbiDyTPmXWbx5s7UA9yBks8Xt': true,
        '29o1m6RH64ugkoCBTKAxFxNKY9DrWnpnP9L3T9R7fm5C': true,
        'D5Yx5UtqzLxm9BnUCM93r62ihZWuVxb1uPJUUj2UtFBu': true,
        'Dyi4VhQootf82qb74Pu6tcaW91Y3bFbCnkik3nfuW8PU': true,
        '3YBADA6shPChxiEkfizXzxWzcRUSv2zZXJ6jfakTV1Sj': true,
        'Hpdy6YZTeGch6nV7vykt8NkUmQw6DMZdaXdxSJYqLxxx': true,
        '1odiq8Kbx493cYwPye2irtz8Jvj3ayFkT1tGBcqnuYY': true,
        '3V6Lj7HpB7xHWqiqFDranSzToPpaYH4X2FDd2aXcomhL': true,
        '4dWWcy2gy2SHXXLFWdCcKCZSkMn5bpW8PcPmrkS6cLN4': true,
        'D4BZCV5hJJcQmAG3iPHxuy9g8H1jE23yXVELbSJo3bXN': true,
        '4c8FbaRhJCMCgQigvkjbFh6eugvASaChM9DS4ZDJ84Cq': true,
        '4D56mNr4YuPDnq11hmnDpPBhefy7NUE4i1FAf63rC5Af': true,
        'Gu3capGQqU3MT7oX8wxvUHK6C3idsY8XtHe1NVKdwwr1': true,
        '89wCSQkvqnLNDT3GMkoiPnG5LYp8mDaMVDCc7M3EGjbb': true,
        '2hnad1UAM9FStgoUn1ZHXLcJRRXj57aDoQdXkE728Ksw': true,
        '73J7iVv45TXWkZw7dNHVJQwWGzoGwgdJRMNRyPH3S4ew': true,
        'TCK4BpD2XVzFtfJMoZN6GwfpWpQ3fQTpPTZo36TA9HP': true,
        '5NQTDaoTiWgipH6RazyXz7uoxu1m71c9Qf4Wf9trjSRE': true,
        'pWSsuoQTtpsuAKCq8LNp3Cqqm8eChEGAkBjRe1nYU9N': true,
        '9HptMBNBg8JSbbPY7N9FEkX556ovHccur1D6yHyL8tBk': true,
        'DwKF4fri8zU8M1VQZvt7k5EwxxtFm3zsZPozpqummEY8': true,
        '6Bvamx3wn2XjZcyC4hH21E94citfnPWngvpKHn5y6sji': true,
        '2yLEoo6iPQuVcLJfHeNcMZAYXcsvoKCQsDFvV2KLnExG': true,
        'GhyjdfZ1W49N5TjQ7u472YK82tZctmhLb1Cc3u99CaPW': true,
        'BpA17UDW7HYdDuZ3rzMCqSuNWB6f5ufdXtpF1rghRQzo': true,
        '5LsNz388NNTBDZXPAy6fPJ6kQ1Q896LzAyouihb1SquW': true,
        'FphrWZjSozyV27fi5HGbBs5aW2QiT4CqwDQeZVmxPnot': true,
        '8SnEgSAe9PgoxJj9hdXtjExdgD3iFuRW6zXmi6tA87yX': true,
        '8LYYnrgmN1NJ62KApdgPFKkPBeV2tKdsS3vQgW65eobh': true,
        'rR97nDDH2f1vfAArGKnFfhDTwYfNkihpbbDguvsJgj6': true,
        '93iCzknb3ADj3fDisLkuKidxZ5MsKrWGLhuXWBqTWt9y': true,
        'EcvxWBZmm2JpkNm84K9qShgTXfmxVvKUNWJhX3BhgV2C': true,
        '4V563u1Ks4LVmgev8QVsE2uu8GkAqiaxAFr9z18mL49j': true,
        'BtZ6sTjS7hiULvPd2j6Ji5tjbEf7pDBPYkowFy7PbkX5': true,
        '12xzR2JqU1oxJrEE9dPccpYohTZUhSXrK8G9dCeaQZ37': true,
        'GR6jW6fBr6YQ5TkBMNxauK1pugVenrpGWBjFt4GF3gmZ': true,
        '9FTR6tvkZBUG3bwcN5fPHDsCBm8pyzBrE132hTaa9eVS': true,
        'B9nqXaWZBa1jcs6KqHGPDcGCMKb2pL7EWMj7ihbEp1Tn': true,
        'Dnv33VtmZuGghBo4XAEYiEyX2U18XvrvoBLxKtq9YWDq': true,
        '3kSUYNZaABwsot63AiheWDa5ohqyN8776fYEZzkeRWpg': true,
        'AxekHcdYq34rSZ543vmhFT6tNHTZSTSLyUMnt8iqqWR8': true,
        'ACjSxpxTdS7bZiDYEF9WSxabR5bTh8bsBfuTi6CezrgA': true,
        'HT5UJ9DyBi5EhY5ZEabStMWowXwQsVZokdXF73BLhF8M': true,
        'Gj7eygGhSqvuBiUyAUVTxDreEqKMxyxP77T54eqLvJJ8': true,
        'BJN5XvE9vpeL9ikUwksWA3MaJmC1TM1yrJibPCmLkgFR': true,
        '4U6Xiz5eHrgqpeMAULeXqns5nfFKGRmYhxwBZ3rdZkbN': true,
        'DDnmRdkL7h58PH5AJ8hWbw7Viv3Fj27MDhuppqBdB4oA': true,
        '6KYNVoXbpCeC4jypfeQf3Cp2YpaFVwT3qdvLShkoEa8p': true,
        'Hc4RPrN7nbZyaMQbWcKpZVeByfhLyypEbyCEXVrzy8NH': true,
        'CwZAvWYwVuy86AUjeGMf9FXNNsGaBNqLEtK3pjomdrWS': true,
        'CQ72MH5HGytAemCs6n6oniia7m4KJN3mFassc7f9rT1S': true,
        '2MyUe5WqyZ2sniFiCGPBKGgVKkfVcf3SeCJarMKzG3A4': true,
        'CTMVHHBZ5FXBxsLY6Fk3e6cdnWrvX2yovDrPy7YLeAnZ': true,
        '8AGb1efXHaAVaiTC9FjcLXCxnMZ5WiHBcHiZMLyt53mn': true,
        'GDAomXgmmQesSNyCCMJLpdE8d2xJu7uZQrEzoutA6qYL': true,
        'DiTc8X2NSCiXqHpaRGjv4eVMNRVUXJiwL6Hadhs2b8kc': true,
        'CFV1WhiwxeSjzWBqffBCybACon79kc19EArFpDtLmL6y': true,
        'BocXAHSo6sY3hzv74Qd6er1brGBfoPUBpAN3he8H7oyR': true,
        '5ruf5R8MXSxVJwzQxnxRqX9suWezQQ7cBXiuC3v7fVYX': true,
        'AFuyNT1jofRSpyqt9ojNsDf5T6MdcVrhzgn4NkJTaJFv': true,
        'CA9EyLFhhLSnYBTJci9Dh2j2abNyJAPPqcwJk6f69eNS': true,
        'xpfr1vtV7g7puBk3w9nW3JjiExHtG8drLBg7RMUTHAM': true,
        'Aitj2GzwhsZuVqLRJ8ry68Rr1UBYqkUpAmihRCSF8MeA': true,
        '8Zcz5qw9HJ3wbF8P2NgmECmCRF5HeRZAPRw19KPytiAK': true,
        'Hy9kMuYsGx3JVfCi6zFn8yzgivAvZv5fzJykRxh9zQP9': true,
        '41fHYfHRvwBVFsEnmCUPTfKwTfrMZbYuM626TWYj4tdH': true,
        '8k73jMhwu856dbJUUJPFJoH3M6CdQwaiLoFfNNksaoS': true,
        'EA6L5UjgBqvZhQEqbZig4s8tJXwmmTRQEPpFw49pYnvz': true,
        '7cxoXZLhTYanKLr7QCRfkNrEmD1tvDZKHVbxiZ6vhJ96': true,
        '5KH4p8REFncvdeiNTTnNqcnXTbCY9c5uR651kRh2Hf6X': true,
        'FZ9S4oxUjDrCHZPT6kdTC3KTSGeG9MEMwvtWBsHoND7h': true,
        'DxhGcLxNQmXvKykZqckKvtiyLRJbP3XPK8wqj1mTJc6A': true,
        'BDdjJvhebXKzm8gFGNobfzuzjVJWP6aM2z9saK4kuRi9': true,
        'GSojMKT52fWEXv4GXiowVJNYnh4zZr9kG4JwRzuwyvEx': true,
        'GA4KfmCCG1gH3kGRb7wmJLGoA7moTbDk3Eaw8MCUHWRS': true,
        'AD81zhKbECb6pTNHhXtAogLVqFJ42twSULb5fcjNwQcy': true,
        '9Ugr7SjfGBQMgFTKTdkTABkesSpfHQ4uxRRQgRKSUvfs': true,
        'GC1V9HtoBCzu2Qsioi9AZhyDwxfWLExTeXhYHgmZiRMs': true,
        'A61fmcRNFxLmFuXqa5d2VXVerbNwEx1Mg9Rk1dcCYCun': true,
        'BgtZL1oJSNSkJgLZGb6mTPZaWgs3vsFhW6MdS8enegsH': true,
        '6Kw8D26aLdGu1AajvFmE7eM947UeoA3qkqQvom6dHUwk': true,
        'Hx3twK9xXkJEfz7qr47xWC5NTVDvhBvnfuAKy2iLTqKj': true,
        '2npnN5aEycfz5MNqR8FPGiAHbzNuw9cA6g3RfAzizbq7': true,
        '7zSrrpv1UaxS6esyFiXs1wrYoPqG5mAgHAZofZF4Aj4Q': true,
        'DCpJWe3HGcqMAyCQXqXmFziuEeHqtncwUr2b6VaYWogb': true,
        '5kqZV9XifVUNsqMaiamcsCG7yBrRefvpFzC3sj7UN6gq': true,
        '5SXx6uuKQhLFAadPYYgq4aFBF8FocnvNMXuhd5sbrUSK': true,
        'p698nFjADGBYEk85sabRfamvaTFGJDFJN3acYZakC9d': true,
        'FZv48rUwAeqmoaC1myYE6a4P4LUC9AKhQDzQi9gdhpfY': true,
        'G8VKr7zjzKr3YMBSivC9CgM4XZw8tFzGsZwPyNBaAEt1': true,
        '43U7QZXjq6kipkxG3G16DuM3qRyc6puJn2sbcLZEgThR': true,
        '9rv426gV3qefFRq4X7Ui34t2Gv1DvnFwe2hiqWwm7omx': true,
        '6tgqpPEpR5sRtLrfQj9q7mqr33wMEXEhsCNyPKmXHvLo': true,
        'H7ZZT5gvevpshTty2B28igCnTs6kPaEeoBGJKpKPAUAD': true,
        '3YnWfTMYoCBXwyUwzSrmyz5qyimMWYNDh5StsFys1T3S': true,
        'STK7VW87MXL9PDZkBx898wNcwokALo32NdpfvyHGovV': true,
        '8x9oFfmfQRLNaPgQBn9uXs2cde9jiWUn6A1r8wjQ1sAM': true,
        'FsrQYDJ6ZhtWpRHMJSQjYS34BrycvpNgaBXkAvu23GgG': true,
        'Ek31eBNz9tDaSvdveyLcsm7MDZPAmVJKnnchmUVcsvuh': true,
        'ES46SEu372YoBxNRMHXr7SbMtBx3r6CLMKF9unLm7otc': true,
        '3vKp6JsjZcY2NcLpsnASmRcS59X4BUj7isHnPR3KbFqh': true,
        '8U5QqqU147pQdZznG8rcoyAPnJDWBqVae9B9c4PjgNL': true,
        'C3Xo8fNvFnGeCvH3c28UhRi8FWSVRb6ncDgbhbdKTuc5': true,
        'ZTutavMbNL14fzpNDbEsu5Zpjom9BzVFd7APwza24ef': true,
        '5GF9461d1JoCx7XCUS8Lgy9bU8fR6zLQzSCAbziMVXUH': true,
        'GhzGBVGYiuo2Q7mtz2a72nnFwW5aEwWuw4HPk7i5cfvP': true,
        'BkQ2bFMfDYtbWMv2bwX6bFrwFQsQXB37fCbfGWjNHPpk': true,
        'En3jDbMw3mfnBjTYExhWvRCw8LgxqA83S6N6S3SsxJsc': true,
        'CsZLDLgmMZwqUmgfWCA3CgHTrx4GNA1nn6h2dfSzMh9Z': true,
        'BBUZ7k4KsYU3BCu7vx178pJXaC2b6FMCjV6X4yQN8VS6': true,
        'G3h7d1xnYhGZPw53Drt33LXFwgkf3apCFt1tHC7Y7qkq': true,
        'DDuCt7qSdKqpiy8f5iSwkgaNRgH8uUidJP2tbVZmxAA8': true,
        '8gTEBUutnEtC3SPivx7AZjMeJkBrgZMQXFj43s4Jz9Y': true,
        'E7VGQKuE4UhS1d4m7owUaBhyDNSnrSURZ7MEtLxzKARz': true,
        '6dJS1XS3xFZpKiEgLdMoDfByWzCuSUZaZH94wzf1qdnd': true,
        'r6heGnDsrQC1fMQ6JWVhXw6ph7pGq3UMMqmju3Gp9RK': true,
        'CE9MPeJGK7ka8BRGz28Kue9kKrBZHTDdQKqNrF6GHjXN': true,
        '2rg9T3oxbL1inVoSUXE9xj3WrmuewDPDrAeJ3WqsMAPg': true,
        'jqDC2KLMU7Z1rMZG3SgfRPyZFyfWP3EwUKuq3p5QZfQ': true,
        '5iYHumQ9cJ5HJ5xgsjjbTgEhuUHMgemrzxz6z4Zr3bC8': true,
        'eYXvTn3c5Txys6dUqZxGna6LBuc1k9tewhriPqmFJYu': true,
        '8rxueKpDrvt6jjfo8fgVkPn7zazzN1JTHrbqsQRZzcs8': true,
        'CbWWja1stffLBGTY5evcSk4FkEBa2SuZ3zuURJcKVo9f': true,
        'CYcTq1ibd7EocTcdJBg7CYWHyUfN2QWrkuydrniaQAdL': true,
        'CxfVTDtiD34FRy1CP6AUQecroZGmeVuYwFsaWTtFFuKf': true,
        'GQc4P7wPTQFYkxfznNmYxWQcy2f7HdNtaDbqZhFpdaqn': true,
        '2ULotZ7Lrm6hGw2uxkUamUMFqS74cgyGbYhvs9pLPvXQ': true,
        'PSjDy2nPH7bv1ibzDd6H1kLBjtDvPn18957V6bQaibz': true,
        'DkPXZWGUE5Wjig8pnnNSxkX2ner7sJf7PE6Y2EERgQF8': true,
        '2S4T6VhYLkuKu2qwcvwPGT7X6MXc1HiKcyeW8vFwyvKi': true,
        '9vJAZzWp5QXEhjos5fMXPDydBq7745EjaDycxZYZLS4r': true,
        '2GQYqC8BSGm5ir19f7rLLCWZ9PHhJW7azZJVBxQuRAxF': true,
        'FvQ4agb35FLq6rfpvaFUdkNFqguJWEeaa5dccGnXSXVv': true,
        '4PXgNeeaN4zUBejWQrUw1co3KdBXG8Skg8M27WvdPKUK': true,
        '4NiXYVNAGqCrysUBHnKke24pZmcfP7gFqZAw1ZASJRkM': true,
        '4k358FQNYabaVj3668KfCMArJdi7iQxsAnttwvK8fpug': true,
        '3bSupwdU7wsrhUdhi4yseXM9rruu5TCDesbLU4aQ68LN': true,
        '2NoxmrzeRGxhaAksAX5j2BZnHzedTdbsEKz2fV69mPiP': true,
        'MQNGSLcRHKNyQtMqy93jhpw4mYc4WG5oYrPxaNgKaUd': true,
        'HxwPpL6mK13kyn4wkthxJFETTTW38SJNpaLNLBnw5o3Q': true,
        '6snyTQxmUERWRkg3GAuGmxo1CCExTpJmtwWbQpNcowM4': true,
        '3vUFbdKQKRhHwN96qNLCtWwW7f7kQZTaiMTbC1y6z3UV': true,
        '7RmpBhYpsGEbjCBaNuwLGJhB78bmXUAANKYHsyrQt9oD': true,
        '4wPpY1ESzT73MobY9pQVrNj6iWcnebyLUatDxM2shzrS': true,
        'DV8ejjmqrxmAQbRkvxaWQrSxekDf3oMFB9h9qReuKkzs': true,
        'GmiX4XVJ5WU5rkkTcVrM4YvqiRatvMevWZ3fiGTbm5PP': true,
        '45JFfAzsGaByAxjAtzsA92odLZLoDA4rGBK2QjXNijYD': true,
        '9DBanuLZHRJmjeyQkckESrpz7LC59yZTcxfwUfJS4Nos': true,
        'Ajnh47hC7nTJe6cWDKeyCbqooMP3H4H5rXWJSP9RgrC4': true,
        '4ssWaUBEsMSqv1i7evGpfKZUMfbaZyd94WqqxU8HiAc5': true,
        'DzZc7uCBvc3HACcZdL2rLdBGxTcJKjfPTWhtkXczBTf2': true,
        '8wriEC8qCUPWc99YJbuJtghgaj1H9FkETheWjaeHMR3r': true,
        'C1zzr67v3b7MezaS77kJrT4MDGtQdCsd5HUfRzF4xZL4': true,
        'Cf2oPbYKCsHLm7yk6iaM8LziUiEEBnhqTiRifPeSNwao': true,
        'H8zUj7qaZLS5i7CSDZuwXFQzbpKKRj4bvJTeGz8WE3N4': true,
        'GoS8u3tb8LD3btNPkVv7nJB2XqSJHJCXjqag9JBxFbMV': true,
        '2BwDhiVNbP2JpHe5mD8vn9DBwDyPtWZ5GtzhrSPNjknc': true,
        '8CmCuGVz4jzXjg6yofMDtFkBA4iaz5uXoTkpzb9zSRs7': true,
        'Af2RpCPxn6sEeuSKjPLqszTTdqJ5ZbTje9mUzu4sL7XR': true,
        '4vt6DRnkizMVMPgZhgufkQW1mmg7CDmtNULY2akbjA7b': true,
        '32BSXaWaoHmNecc3UwkRVeAj9mSJnhZEXd4gStH7QrDd': true,
        '76xcvywShqEKy8YUtQA82ZK9WbHPoAPF9E4rTFTrrsNj': true,
        'FePoVQuSLAtXHWzdGm7WbfMdKUHryow13fx1BAP27kF5': true,
        '2fhnTLn52Lg6EHE7XKM6wNRoJt2LBinxjFp5udE1Jj4K': true,
        '442YnhjVqG1CYUGk9ohyqBwvMqQ872Cyns4jt2iMjxs2': true,
        '9FoZJUZMAdQYXmfzVvRib5mafxsXgLox96jPvXHZvgHb': true,
        'NiJgqQ1TAcAvyDtwsXSCzDD2XJgZesRexJ6spo3nfLz': true,
        '8QRzGrzKmGX996cE6CfmE9sjJ2dcQ1BzbtYjPrhjaJUi': true,
        '9mfzEJZhULck5HruxTueMfJ5D5LJLViB1KEvh4i1a3iU': true,
        '7hNxxKkaN3GAfJGL6kjuDmxnHiqMAXTM25MvzB5NAuHK': true,
        '4G3rRa7mkzt9j8tw5Y2nA4xvdvT47PGTJpjf6zUioyha': true,
        'ARSinrLf6ju15K1MritdHHaviVi8Tw6eovzGwDPLun6F': true,
        '2rbg4Sg97FGGWwZWUqxcqeN8dzLD8mk8Rdp2u5QZbWU7': true,
        '2pTzzAuY6CVnYP6Tcfe9naRwJUJhRwfM7U3eqe7zjK5k': true,
        '3iXiEcNvi6Ugv7QAwQa8UFCu1siBaRWaMAQ3s95TB6vN': true,
        'HXb6zZHVFJNHsgfwPywvsmwUsrp267RA4RtbSvugRF9X': true,
        'hzjVXHBgkTZzzQaHRQC63dKBycZ1TTLaz4Wo6VsN3ev': true,
        '7ek2sRFPSqZ6ViBAwgFtBAAkzrevwuKL3mAHmgVfd5jJ': true,
        '14QaLJX12Mm9yEaLjW18PzVGvmHfAUn1EQ7cqYMc2hmE': true,
        'AgvzKGk6raKDYYKJFQCkZWGFKkVwZ3c3ZGjigV41dRrz': true,
        'zVP96SfWKaA52i84DhFaQx4XNhBeZB4dCdd2uaJrY34': true,
        'W1jziYbbiDr9U5JYHtVp6dZHTUrTVNfbXhiKTPZZaxZ': true,
        '7GEVBUekwn7eqm123QwYBL1aZNBJooLUzhRzybvUX5Bg': true,
        '8aRqZqgZW3NNWVYttDmKdj1cRaHWaaZcVa3aBAiF9C8g': true,
        '6aEoLNf7qgDGU6F8xDxAkkmGmLHaXPY8b1sYQvbg1rxb': true,
        '7p3m5Z6doEqYD7VYrowTQsrDrDasBmhs8arHAS1ACDZX': true,
        'B6Zg3QZMKg2GNNgh4rwMmfjBk8BAG1nKL1xKhs9MZsEP': true,
        'DouEa2GqJVufBu1PLUF1hf1fuBDKMgpCnS5xHKB4KJz6': true,
        '6MUT3EPHom1ht9VSpH7TMVRP4NFJt7dsDbteCcxxyKaZ': true,
        'Eyxs1fbTdozMRSaJbTeC6HEDShWBr8YAggsZVioQy6SJ': true,
        'AMKGnzaRiUh8hEhbPKL4gRjJ94Z66X4w8BmScuZ8TBk6': true,
        '4fJ42MSLPXk9zwjfCdzXdUDAH8zQFCBdBz4sFSWZZY53': true,
        '8v7WRnMrBXddsFsQbeeE6shWxEpQmJoy1ZVY2FmwjA31': true,
        '3q5LYBtGiUHUqsYSWDVkqy1M6moWwN8uZVE7mYujzPEh': true,
        '8VdaeTXNCSJSft8QCjnBuhi62cmQ2pZQM7QiTWiJvcJV': true,
        'HakbNvCdGVe2nFtjnE3x1SLh8CzZHqSg4yWfTBV1cuFW': true,
        'G41W7yyjNEv64sck4eJ6erUyo7WiqTPfdt4ycZuL8DsX': true,
        '2DJi8czPmDzJsK44fcaJA8sEGHBvMHy2KkgZeBsGK6Kh': true,
        'Hdvx69oT9Sye5LuvfR7cJR9EjFDLAgkhp3jHAaGFxb91': true,
        'CAgyXQUytvoaf2MyFTiurpbx1hegVyPSkqrjqmtH9tuQ': true,
        '5QpLKo2x8R8QmKZFhiQrhYCXBthoR6MqDur5GmZD1SM9': true,
        '5yKN8uJkFYneyc8Pd6zCbNCnt3HS4ANVA7XbZp8yFVHR': true,
        'ApnHXb7xDBUNLcggKHcYokCmvCmWmmcLPKDW2fFjTm4g': true,
        'ArWogbkS3PTJ8KRX4co72pJpw7X3ohVasppsChHWC9UJ': true,
        '8wwtMZGf7tNp8HZGWw4hukjqkZnjTLxx4jnJ4eAhMTKH': true,
        'DyMN2SyaYbCrR1c5TyngntUxFER2YhkT19o7vzN4hFA': true,
        '2vWyKtXxFLcL7DoDE7ajRZDkWMLBRprmxHRq7JP3mRNb': true,
        '8TF8iyEgEiECy3tWUJ1hiWhoephP6ikbzDpdGTVCrgEQ': true,
        'CXK5TiP5kRXoZJGz25dJzA9USon8DPjrAeRiDAtXe8qQ': true,
        '5qUzg7WZHi7KARc72EfdMnp6cptqXCPsCQGLCmEcanek': true,
        '4T6zGbNjveDRqKX8gXVqCuvcBWsCnLNGccChkHtMr9vh': true,
        '2mFwCrEEbqLtg6Ve6uGSKhTFe6EFLBQCe5kx3tfW7Vza': true,
        '4VMroQcLH7w4J4GqBsrbbPp3KM6uvAmBYsLsG8gxK5nG': true,
        '65RzNFduwud6dTMWAo8E9hv1a6dHTRXvjmzLcqgbgP3M': true,
        '26fw2MoS4ByMr3dcFW9tuJHff1US75B4faoY89sn5DCq': true,
        'Gz74LLAXDmkwgeWYAdJbwiHMEwUaoH1pAbt7EhgQepTw': true,
        '9eMFtL9HrUF4g9rMtiYUx9Y5QdbAFcg43joWFKRqCA4f': true,
        '8tkwV5Mg81tvToKVsNFZw2c1A8QZok7DgjAmVp99hmVf': true,
        'GioFW8e4gJ65YH7YqgESQjqCHvNE57NVWRoDCdRnupHa': true,
        '3VWooajGVPydytWi9LJhqHDtHcq39kCjxV4otbAP5Cie': true,
        '8Rt4uaPg2HSGqWuSHcGtGnPJwJB9m4BNnF4UzABMYoGj': true,
        '8TFznLGY9MkXdUiEiRWESCG9LdaKmXHXTRFrY7SQoJHC': true,
        '9PHnjS321FT6YFaRrFpe7U5VGJy5oXzQopBehh8yVivb': true,
        'Gp9h4oFSm8oJ135sCBWueoZDiGTnKfvqdvH1cCSL1wWt': true,
        'AYnucisBwMEhjWjkXP4tHwW2b4h7n4f2Uzx7ixeTrY9j': true,
        '4EKJYjMojozGyAZTw43iFnBTaNPeQ3i7qCbDgcgGT35D': true,
        '2QqkR5JRt1x9sxRW9ghoWGmGfKWFzgnEEbdjvWVCDCPN': true,
        '2K6EEFcbgKL8pqepbyziT9cJYinaAEhYydt3A83ph871': true,
        'EiW3jCoWfPqbaT3JVNdpgyrdXUuNZgtMEnAwwKw1JD2e': true,
        'BtCiQNrqXUxVDo7z3KrNcTxsUBgVX9kzWAqr1MDyLiAC': true,
        '14AbzTi8We8dPsgDRnb36LYgiVYTuq5P6YVFgxFuDn7X': true,
        'GM8Xx4sGuWFkMfWtDizJMTmNSKA2Tyw4CGn1Mmp2QVSK': true,
        '2omygTVFwT1ERoewUBmT7vBv9sqiz6dEymXBnRLCLjFD': true,
        'BqpcLuLH1J4KhpwM3fJW37L7Xj49uMTxVijHoogyiigX': true,
        'YfuLD2MBQbu3tGgoCN9xVq9oDc3nzLJD7EcxsmdGYVr': true,
        'Disr8Kk3nNCJfsFZmSiNJ4bLZyNkS257WHbYyHYotx6b': true,
        '3ArrzVjAe9vdW9w8YaoF9M8uBRWGWNvckvFLBdcMoUoA': true,
        '2qBNwt3catSQxUo8JFGb2jbeaevwNwySy1j7ZviiZHRL': true,
        '7gxLTYKJXk4qYqdbv82tEp1ycAJR8aKjZrvDhNgp8CSg': true,
        '8GUU78Z4StzDCQoJB2WDgkoUYbb16FbkyjHE4zGtM9sp': true,
        'DBepjL3477FP8fZoroUnor2QWHzkgVy7Gexv7WBVF5rV': true,
        'EhZZRwvBYWNmwWcCT7Sn8AAmaMAYzpriufHWFENK953f': true,
        '8d3pqZXfxBFgCtSfjWN2FF745x8Hvg8oq1mNqchKUP7e': true,
        '8sr2Bzhz5Tpx83waWA5qPS8BvCS8Vy8MUbs1X3xYztc1': true,
        'Dc2HZbBXdtg5o7bh5U6Q7bdqcuQt69o47MVvE4SL1Jfv': true,
        '9o8vsBNvpDXDTCspFwgur54AGCXp7dPu9MUtwojwWimB': true,
        '4kKuSPnxnNB5jZtXNs4xbQ8KxcVfFKyaPcumT48sqMND': true,
        'ALX2XhDzsaE1kN2vmwfPTwQABSBUcisJFXt1AU275rUr': true,
        '88QFobjMb5AGKJ8pq8ZDvSopi5XtNYkhUSTGVUi5TYki': true,
        '2k683bqahsKsdbumnvuuprk3EAs5R21za2ucqANucUrT': true,
        '9iHEtw2JXvDZF8yXVdi79Pv4YSq7C8HWqTSxab6hR6VX': true,
        'JBXjqsqc9LDD44gdytx3LML84t33JJVDCbikZu8Y4wwB': true,
        'PkikZxGYXgmxn9oSRjmLiM6a8E2LnCeL5QcmydRDCbf': true,
        '8AkCXjv6iFRJNj2W1rtSaKakXVpKpULJRjPDBkFM4E2S': true,
        '3uepqPoSKaZmvnVznPUDWwBgPdtNiT4ActLL1PKkxKMG': true,
        'F1QKiVy9H8xQML2CRzzpab4Yyam8uG1emowTzwh5Fm2K': true,
        '3NV2VzuKY3mnYcpTV8TuJfNY8qVYb9gdyMjk4AotcSiD': true,
        'HEB6nAM4CvA57cqcrvuVicPXYZgKoEgVmUvhkYj9VFVQ': true,
        'HiQezozSKkEjwrxbRa8RtBUTLFsiSW4UKqypw1jhDheY': true,
        'Qw9hqijeSYYEykM6a2P7grLLzERjhDgfpe2vPYmMHLx': true,
        'DP7DHeyMgGpiVJ2Gv5enzkxMF5BeBcG6ntvcNqNuNJet': true,
        'HLyA2ScTCU9qejHNa9HZdUfPQHkVSyEox9YTgDYBEJMb': true,
        '24qe6t3zyeCU2Ukjaiu5M7SuMUk2KCmxhCdqMmj2ZPTr': true,
        'BmdM9h7GqaHDXxktKBtEK6YaharP9tJf66neU5LYTyH5': true,
        'GkbYNahNAEbxMkt3HduZnh5NRtmgd6XjdSfv95FCcwxh': true,
        'ACDqZsPKssX84siCSxRhJWvWfDZJ4NYpZEqeUVE9ZqEH': true,
        '3wJbEnsgkxs46xKJ5pqyrJn3DyWjr9bSAVumWPxMhpP9': true,
        '44tNk3Q5pAF3nAQZNHXyubwALhh7pDA3LT1tP5yDRaGy': true,
        '2e7NeJQMPS4Lqv7brcqL7FD4Z7A4HueNR5ymia63FTmE': true,
        '96RQCjEFPd5V9cagjEwDrMfoAfEQ4ykUgXwiPNBd4uRK': true,
        '31mkGFnbpbrT9NTyp5n9VsmWvEjrESzz5w9h9n6jPs8r': true,
        'E5bTPWkkJWHREpjwZP95VjYYUPUNtTD7euodiCR1pzQx': true,
        'UALi74dCdZmnAgo4FkStz8nu8k6V5S86mNxdaCt991A': true,
        'BzQLM2J3RNhBX92w1nh1FbSjuEyeXLKqon98fCHohGSL': true,
        '8BmFTeQQWe3oXUfuN6ZrJyUJGUkSRDdEBt8F62J9unBe': true,
        '5HtYMme8QxH8CzQGCFQ1XUZ3Zf262tsvKpQtrpFEW9jU': true,
        '8Ah5XV39fjP2D9ArkSwkVcRAjvVzmMmAWAXkVdQf4KSY': true,
        'B9JDVD4x8VVdEdG5GDJ5DfShEnrL7ieZbX7P3tYwUJrJ': true,
        '2bBmfHnfPdRWnvehu96azWrmie32cxdtYXqWZKQKiC82': true,
        'H9f3KcZrUauQNhTyeP1sAKAcVEx3YPgivjgt7AE7hNfy': true,
        'H7YArjS75DxZPxu7Dgzc1ViTeYZ4pgueTXKybfbiY94Q': true,
        'F3kfTE6vuXTMLZr6H8wZBxsLL56GvUJyN16e9Qrc8rns': true,
        '13zH2nCXAj1iDSFPztVTbDcASMXTY2Qtj121yzh4mUya': true,
        'D4wXm2JmYXM5o3D9kgG83p2CKPBNCtJa3S74b293cX5f': true,
        'BUKjQKiU8sm5nVweKbQjUH1rGTunsCZgTvKEvocz426o': true,
        '8RnrRCLEnmEktgGddu2LpA2ZhJU3mLhisDVjJhKoZf6E': true,
        '5rZnJfbATbukBMmTuKSDcankFDeAW55NMvzzVhZeDJHe': true,
        'ECwyGEATopLwYdDHMKBnq5KM6WdXVd3bKz1MAG7xQ8N1': true,
        '4ifT8ejxCkxkWFNKaCA5eYAhs5TnA58JAsJFe4xQWqCG': true,
        '8FeHFYGVEqmq28jo3qUX2aDdc1ouvfb6fgRSjyApU1Vd': true,
        '5KAymEyqHtvAja9iNd8EHStnoLYQQJ1uXdZbqBjjZ1A4': true,
        'F5gAjRnVczFU4aCiJrLZAaY6DPSbwdtNGTGory8K5yjC': true,
        'BbQTbW5CwbzrGFazn5GAJZkE84UdJzhRMd5TzwDQhtbJ': true,
        '7GnGbq5jiRPeiiY6AGrB2VqxT7Jey4bX1BqzSuUnB5hu': true,
        '2ESxAMPK6VbYr8wVQHXwkGmkkoXJK2fWkFMXJBPmk2Dj': true,
        '93AB6oSkCCJY21u82jmxBb4ELFuUk57ahRHBuUr85Pp8': true,
        'BPeBe4WikywTvoNJC5YC6TMBFU6T1UcxK5FvxRibKLR3': true,
        'HL6tWKB8AULKajpAaDfmkpdTLSHVvJRMdhyQ4XdrGk58': true,
        'J5NgRLYrikKkkHhJXsvYwXbqPZqsQpE3d27367JJEwgc': true,
        '3yoB4A29sFgrBLDwGnz4krTTkhxpcReYwEV84sRY6E2H': true,
        '9tVQn1unLbivrTEAebgz6FgDtomUF7zZPXnxJ7Ww3SQY': true,
        '2jxQuhHUfgRjc4ZkFKKAQcH9e88n8rDCwX6WJvnQZ38q': true,
        '7c58DgoFGZKqM9cyXyauP22FiG4FKF1NmE2uLNuuGmAp': true,
        '2DNFs4YCV9FpSo43ftqYXo8X8EDShBVnJnWWzJSk6dzi': true,
        '4JNtbYsA3ubBUiqoYU4YhrE6DMjx7yPkZB8P4p33Wxvt': true,
        'HmDNBhbQZ1w8Ku9h9fxvEjJNZ3mdsfYNYzMexmwceDrT': true,
        'GGLc63EcfNNnpwfJfmNhypEGBsLpHXJXX2rY6Yt4cEPQ': true,
        '9t8FzrgrsK41h59i1AduKzMEE4hedndzcS4qJciaTUrh': true,
        '9tpkSbaYZ64T1ATZDsYj1KmH5u5iamam8bdHxQxrCrsr': true,
        '6r7h5o5hFyzF6T8onQH5z7KmtC7Gw5o379M1obuDvjjt': true,
        'K6nTrbA6dTCPmiSmXJvDfaa8YxjAj8VuLXuwY8sNtPZ': true,
        'C4Lii68mY3scredr1mSwSf1CdyQeBKumTSp6KHoovJQx': true,
        'CXZCj6bqoj5bL8gpJJzrLmUiVLcBBqWs1wV7WnXfYwFp': true,
        'HUtNQsQCSxE5WHtLbD6aMUA834eYrHmeLnqk8vPPb2HT': true,
        '2wdHmgKihUUSyvT3Wp5gdAsrBJoqpCCDWtmfgNTEZXCA': true,
        'GaigKrb64ys5qeETRBaMrZYRnYMtyCqCayPam1fJ4TjV': true,
        '7QrRjZAMnTjdxf1pW5LJWjgmCVSUWpJcsuSDUERsjGtR': true,
        'BPbUDD6c3njLAHkXwYFcmczzpBuQ7NqeS51ds54zDGGt': true,
        'EAUM1u8JKNw5PUPjs1xy66bKgVUpUSTRMJWdVwTFg59v': true,
        '7xHHNP8h6FrbP5jYZunYWgGn2KFSBiWcVaZWe644crjs': true,
        'Dvtk3jBoWVQKjGgZ9zbaAUiR1HNJdLfKAD2vzL2en83i': true,
        'CcCMYZYVYFvSGqA3wQcN2ktzjvHH3A4jyCzus4jMHPuZ': true,
        'EpYmA55sLJNYXdDNJS6t4uZGhRSoMVyp7iGuMFx9CUvH': true,
        '7VqzQXc7xzmcQ311M4jcffYJPVckCkHeVM2PXoWvjZT7': true,
        'Aj9cVwtUrRVq4SKzKEb8nQZhY9GaABptwExCVonvdoH7': true,
        '5J7rAd6D5P5XjFrVurhqzRAu62otxb96j2W45BWdHJ7a': true,
        'MG8gcUQ1hRwrfHLdFLa7zgWWi78FBqZdhVKkWd5sVVw': true,
        '2MEJ9AAFFZvCA231kkppL7U3RjfSD17KGb7iTkHezgD9': true,
        '6MfncZixP5TbZsDiWNKHTwtCof8aqPGXtT3ciwjr9uqh': true,
        '6kkUjPDd3JbC3g6uiLkdvicUCrWecc8hZFryLMTDMnXJ': true,
        'AeG2qtQEyuTTjoaVHV2rbjf9EhpENBScnM3B3SGYv1sp': true,
        '3fGh1kpCYMb95x28BfpJettVvwVXNqox4PM63A5FXRvh': true,
        '6fHKyz7DeKztMMosV9uiWrBuuEFrCaxCgxVWBTCPtCr6': true,
        'QAuFj8fuvRGgx7DwEEeLcgm69TwLBbUJinXMdHwoiRx': true,
        '6AtZS793qqsfRHjHdu8P4vUZwh3a7k9DDUDwMazeKfyS': true,
        '8AYw3jhsgw3Hzyegv5pLtuUVWUaA8FBppAjf3QAu4JiW': true,
        '8vRUiDVLSund2UeJqwtPQ1oMAwD3joaBnzzc6kf4EoWp': true,
        'BiWex813vpbufthdwWCQwomrwgAArf1ptXytxmqyLqef': true,
        'FGxSmbaW5fyoX3Nu9P1SNwoHPY6PUqLtiifmbQvhCbYK': true,
        '4Rddv8YRbsNePpr4ercrqGrBa9DSCsw9qrnSeLvNfukT': true,
        '4METrTjyJ8TJNU2v1zymnNPdT4kHeQSsFdJa9DXUjjJw': true,
        '8ZZPgCuAJ9wqd9Q23CyxJsQqtihD8kFQMPuSHQMEGn8g': true,
        'HDNrZKQDDJUn8CgzyugtYq9sySAz59NnHrWQ4CHchqoU': true,
        '3R64Zy9E8vnnZHkkzuhChd3SS6WQsDc5HQnnsyi3Y6K6': true,
        'H8d2ZxBpxRA9E2rHmchnc72SRhB2qQf97ahHNzEhHDQ': true,
        '2nt4359JSQNPZDQq3Psk2tAk4YKxfMverDTAWPtqXGPi': true,
        'BbJTs9BK7QjLGCuAkPXs1kgVswXf34sBnDZXKQ1bpZsB': true,
        'Af5nyTozx8RqgYFzcmXam5t7DaxU78cb7tKr6r1umHVx': true,
        '7Ae8Mae4HvD4qAqaLj91Zef71doebdTMtj2daBoZcnoH': true,
        '8HQawFgg5mq7LrGGoaY3jikNX1erThcbsxQRQNyimWFj': true,
        '581sK15epTHBvH9sAxwbY5An2jLWZ6ksfpnXS1bhU6kN': true,
        '4BG85wpMpGbwt5PA534PuwtLSX8Xqodc8DUhRRYBeVYp': true,
        '55GJHXsK6G5rAQKeEcscLS68Bo7k4eoMmAuGWeKeMPt9': true,
        'EX5rqN1vsXgfr449m1tkfph8wGPgfHb6r9P9y4JMVVSF': true,
        'UNsHAabcQF2b23urqkTJV9BbaS4FA2kVcbdZZKoPQ5b': true,
        'EUi1oPqqyaSe366uLTxEo5E9NFUDDDGg5HAKy6WAT9A8': true,
        'DS9dPazrR6HRfpAr3kNbgnwnZqAchky3RTnFamiA69t2': true,
        '48HsbKxiNznN4y3PQq36rnaWpTp1Z6J4FdrLqu2pLZ4t': true,
        'J58mv93E46ptUPjVhXm7zgjm4TA1RnuaHpVbKiTgEukU': true,
        'FSMQMSY6RrDznDxRqX6d4zNGavwDeD2Ky2NcczbP72w6': true,
        '4UNSUvrMcQc7H2LGHYoRAjxnfhyNPTWk971gEFxrfYBH': true,
        '8J5j5bjFg1uaCw38a2RNSNucTgFfFiGotcKFnTxb6joe': true,
        'xFViGhjb9T5rai8Fg55YzaqFCEvQU9vJZ1UxxqJzLjR': true,
        '8UXM9aGR66LVYHh1JAseAEAWnCXcZDTXQDWqHuzCiYcv': true,
        'HdU6HbW1KUuZPNQSku7VnbbpS1Cznanpu5DcQB567Lkv': true,
        '5CzQMuc1Jhf541k92zaPxMzHDhfGn5Z2v1ByKr1oTc8T': true,
        'Dk9TvGZ9a2wGnyYrfxYweJyPnk2Frk2UaamQaGyfggZk': true,
        'CRTihW8M4nbxhDicUqah4B4FKUvCWTbxcFGU3ZgFEm3H': true,
        'FNLf5V71fSmdaTxXBm7rGruWbovyqqcCh3CcfAcx2uPz': true,
        '3FoEbsmMJDmLidZafX4r3hpdTgGXSQFyAiKu6zhCagYT': true,
        '3uW2hQLjo2qKjLNU5uaxwam1u59zbksLZZrPS3MyRZt4': true,
        '5oGJJWWNtNYmtjJjBmpaymoZP76hcDtmptH1p1s4TqVE': true,
        '3ADFnYDTi1btCnvRemwJZZtAAQV8jN1nL51wE3qUmZ9h': true,
        '4F6MJES6KcnFcMXv1Lzv5GHgaXPt13gxGXp5eAKVrdrt': true,
        '667K96fTKr1CLPy1wLRwodcrM87A3FFT62KZLX5WguYe': true,
        'HHWhGaob8cEtXQnncwYpXEvbujUta5DZysLgfQ1TXwtk': true,
        'Uocvy76Eb47LDUvXXntkPJtNUac9jjEvAGwk2u8ei4f': true,
        'F9knxVby9eVapyuFxVgdrFF5enMpHp249kCs56Jdchm6': true,
        '456dtgPvPhBwREbzVK5SHoVXdsfvHXEBtVfAWNdy9HQq': true,
        'FU1BwrWohB33dm3fmE1wDnB633f4ALcabNjpJJ4yzQeq': true,
        '4Na9TsFu7aBg9iE3tEKeVyPHqdY49mZfZbnKKqWDjiLQ': true,
        'DLyjaaZPZmDPTe3qJTB45LNiCaLh4Cz8ruRuZ4uQUS2c': true,
        'CSX1Ynv6AXmJmfnG1hBczrL9tN5HWrjVx5Ur3WJeuErv': true,
        'EFHWi5tHefX9sY1BoDgVBb8pPAXnKCrX38keavHCoQbU': true,
        'E8k5YiyfK21qb4Ji7Y26AYFn8ZwfxM8Lbefk93FySPtk': true,
        '9YANpGw7wkVdgPFyM5KsrKxSFs9iDtVwpHDqVbrkLmSm': true,
        '6FUGk7Dtv7CRh8BxDAZm95S4ospEP4GmuXS4BKSWvqE7': true,
        '69ZBDwEJubaqWiMPmAoFihAnPtJH5ejgnw54CU8hakwR': true,
        'F58dj2Qx4aXBMtmGq47ZzhXG9eWusSYjJ8puiiHFpwqg': true,
        'AmQkq4rKmNh29DeJ7YbUxekTnPb8tMwjJmuweQFyi7BJ': true,
        '2WhuBeYPwFwPcpPY89cnLqt3n1GkXhBSHfAMmpBhdy6H': true,
        'GXSWPNE4DKZys3F71Wa5tSWsk9BoJJo4zLepkPYNncBg': true,
        '7xoZcrXvQx2dUFApktYsFgaQK1jPvfkBzZKkiaMPy1bK': true,
        'GtBZNYDgsfEKzPdjoGF58xfMnQfBWt7JD4gdFnrn5qqp': true,
        '4Ce7zBvscZBda4kFFh4ZcF5w99WXtMHbghfdb1Swzsah': true,
        '4aPkGYy6VUkmho9CEqLyLuYRHss663Tq7zYtaioPf4LW': true,
        'AX2UMHSuJZhVi36SmTz4yxErTdemkN7m4GHv3U8pBGW5': true,
        'GLMcSenM6SEVLj4nb91fduReqNtVms1gwLPJNRCursVF': true,
        '8pn2cduBoJruPZFES3jswH8wsWYwe34J8aAFgBZekZgG': true,
        'FRv5uxF1biSVCQWXpdihgcY4iF3rJKDNiza4hN5bb22n': true,
        '4pM7SYUB4iKqvd1aQsjWcQUotra1pdDYCAW4N1x2BUrx': true,
        'EbDQauZhgah31Tn4RfAWywWY9Lvz4ahLFhSFbxicGQMg': true,
        '5X5eu4gz6M3y98dgXSTqFj9gPm9QXLabLgmCHo5xPZz6': true,
        'BQ6UEAfTsJFSQ7zpvCnke5Uao8AH1SnaKBgCCZqDxEuL': true,
        '6AWwKoZR3Bq5USEBskg34WuTmSZBeBuYQZwS8Edkth4q': true,
        '5kF1Ari79Wpkpa8hidnEnWDyVmnszZhuYQuq7Tqtez9h': true,
        'G2bJ52k1paa9tSoDtZsMf5KRWH9svJpG6Q1eHXhbDSQx': true,
        '4NVMuNVHcpWEYCEza4gc3X8YA1GF6UeGdcTY1HA2hDn6': true,
        '6XENHd99TosY7De7msCqETi5NB5A9D1Feenzziui8kBs': true,
        '2zNSNhR6YcifKjfSqHazGhEnZYVVRfxQjEDdKqUuU5Zy': true,
        'Hd2TT7KQ8qmuJyRq3VQ2V5nip5Gb3V2BzLEy1wUaUNYh': true,
        'DijXFfMsXVtgkKamiLazeRYJ75AnmDiJMna2AwxXnPX6': true,
        '7x53uE1vw5d6Bjwp6TPs7sc2gYNPvoyh9BUDGKWPKkWK': true,
        'JAboB6okMdzftF2Ejb2kHmNT4tfAstTA1fNhUVUH8Xz5': true,
        'H1uB7dVWAoge8HgoJ7w1icpYCJBoebvEZ1JY7MJ6CiYA': true,
        '95mYrNedYWobeFCMeX8w34GD3D44p3eLTeZQAcb4c2sr': true,
        '7LdeXvJQz7XdzWMp3fr2ZPj7zDSLdGJKcDzmroXL9ebc': true,
        'CrexMe1ENa5GvvDXkfqcnNUVPM6ZEiifyTAh5eGP19MW': true,
        '9MKGMkwHPu8K3QbtkpREAJ63ksspc2VjMMPVuAwyM1Yb': true,
        'BoD1Ps5vvHNjnUw6AGDjKW5K5P82PPV4zLbzY5DbRPW1': true,
        '5KYGKnaDWcPcH5eMCqe6767PayBX2FwRTcUS5SKEYCaN': true,
        'BfWUkVSDgFN6DJTi1PsTv5u1UjN7qECypbHwNkcHF9JQ': true,
        '6QPsnxMoyiQK96AFhgjBXnbjQf1wmqKJoyaCv3hb7vV7': true,
        '9eznAUtEwE7yM7sKNKR89wYYFdSCZrV8youHnbpqpptu': true,
        'CDDtnGsFfFKnxmSSfu3sVA4xLetCFCWXCVQ4ZaZTiCp9': true,
        'AqHH1ctGNo9P4vC9bBfMS1LF9wJpyC8kdXYqBNk2JUhd': true,
        '8AJzRLnZ7TnA1mWa4oc4wRd2sKdM3cgY7d4JNkmsgqUD': true,
        'Hb5Z1CLBgTbEmbZ11kBFQk1Pw6wbBfJwrVT9jR9foNt2': true,
        'DEyeNx9sdEdYwXPTUmgTsDXMWs6aCjAwy3ia2VzMjp2o': true,
        'BYcFjHc13oMqbj3rJE9SGp5eLk23CVvVjUNKsoiyugeX': true,
        'Feg9KFwDjsR8xbq5DJEP8cEDWkC6rLahbPvhiEeFVeqJ': true,
        '4H3Qs9twzk7pde8snQmT3ixqnBii4dx51C22kKUzUG8s': true,
        'AYDKQAmRXQxziV3U9JWLE9t4NncUzCvVHxeAVNuCoH9w': true,
        '3nApJsSc6Pq1bLtL44a4JWvFoaXLFUV1CwPgMyawzqJT': true,
        'DWE2RX8EGq69Kpgtj8reNY18Cc7tr21oc3Pb7yvMdpJv': true,
        'DfAXHCUKDsfpxHkFUh1z3rY6BodiBHHpRG1XUPSooDsZ': true,
        '6icmu5wTKuW4y5pTa2Dx61W6voxBxV28u5X1XPEssRvp': true,
        '7uZCr1YhjcSaMny87Tkgo48aArzsFybeFPQs4nATwUq9': true,
        'H5JZ5pibCxkgGMibCTFqmE2pnaDhAqk83U5cx9cruRFK': true,
        'HKn78Vmakadm3FzufoBxYxp1hWE5gDWgKvrFFjpH9Zrt': true,
        '9xzcr6Nw55UmmfCaJcjhD5a1S1E41KeXfL9armXR1TB2': true,
        '43yCmTo1j5KJCjWnLs6wjkko1ESPcWxxM8qCKFFFTUbh': true,
        '6N8FkxbatTLpyKvtvhjWswadWACexr9RRKhvNmdtqK8g': true,
        '4uYcdMGWGCFm2s1fLTQL82nyT43LUuJNCd8mWFNKtLHk': true,
        'GsXgiVac69dF7ZuzuVPjUU8yaGTs6TatboeQXMA1TMik': true,
        'J35p6RYRaXnieuT8XEobDB7Yy7G9sCy5QLDmJThFySBP': true,
        'EVEF6EgUBjgsuGaiXViRjuHnSw8J3nxXDHJcouiJpFLM': true,
        'AMWZKLkhDDtyBkRbV8LicBx6vQyBHRtJvybwDn3ZkuDE': true,
        'E4t88tH7wnwTH6LxsTPswsonViBdVUiWp6ZSQ6sd4uCw': true,
        'CM5Eg94WdqT8HUvt8Wv6mkYFZMVGqPhpnCMiWHZ2ogc7': true,
        'DiUEUJVSidtAYPLsc5vZwmTnggASF4wfLPqjWcGWzexd': true,
        '6Pzi7Beyu4dchyjVTULDytqNzkB3CJybYhzPAR1JsfYa': true,
        '5yBjywTmWLz2is85hWUGmPE13fgYJSD8msaaMUtgNLhk': true,
        '311QLmVFoGo5WnqU1AEJypWYs9Fn9UwMjhNF661J3mLk': true,
        'FLE1RLp3tHxELZA9CCG48HRs9jtUb7NtB2gGhYx24nUM': true,
        'DWeYvezkoB6G6J9Qx4ozcM8KynNdR2RiHQNpSuS5mD2S': true,
        '2AcupDzBBz4VDgEVBgUsx4KLvEzAmGyTHUep271iMu7M': true,
        'FF4Z9pdLuHHFVmuny46x7t9LiWvf1QBWD9DdHcordxFJ': true,
        'DSyu4DmQUAb3VtMuuq4rNuZrNH6q3YGb3cbFmPA4CJka': true,
        'A139WJ75PqPP5YShEVovwysp56PtcTbdeBZxXnHZ4ZE4': true,
        '5p1yKNpQQdvTkqFEtHKZjKa3P5Nq9Ht2oKdqreekYWFx': true,
        '3E2CRkZHmysb11saS6F3n7JSYnkbsmCbM4HoQFkPYA6h': true,
        'JDTTT4Hp5wVBAhSpNVCArvNGwbFcS8MQMW9WBtWYtDcK': true,
        'Hxim4db21kaBW5Hq3iEF9bpk8McGd1PD6xa9Yh8c6BDy': true,
        'FdCLzyCNjWZCpoAnAxxqVKMmPTtoSUWzfEZ1pNSsdTqH': true,
        '6x7VVXq1wqWoi79gPDfNtsJraTn8caK7Z6ouPJFw7x2': true,
        'FYp1SD69HHf8FJu3T6Fd1QAgswmyvTz3CeJGHUrpbYwM': true,
        'EUBCdSgGj7iCfabVy5JwXqn64WeMkmnRU7tsdXbS8HJX': true,
        '6sL3ZAbt9ru2iEByoXESfXXr5abXVm2ACYTRKrpbFvsq': true,
        'J6uZdovkp9HyJ9851jMFx3UdhhnEBPTzx2nXwj5uejpm': true,
        '2pYLj1cgMjs3DcQ1Yb5XHpqZiMyBQWrbDbtxipxsGDGD': true,
        '5YuqaNcHYERAcaLur6cTMNubFJfpiQH43DvPiJmc3k7q': true,
        'EMJ2vqnpUpguLdfXmRF4c3MzAz79nnESs7i3F2yn5U2x': true,
        'ECdvdEECbHgWJViQZvsBDrEvUEJ6XzzzjKQCyEFD4HqP': true,
        '82zTe8dFanMcWjEmqe44TkQFLramWf4GfktVgzXhjuTb': true,
        '7KhHJmdANqHbz2yueC6RX4J3z6e62hhuTRDqeStbx9bg': true,
        '8GQbZVgkJaGmUHwdnjhw5r1tGZ4cWnPyUdiLx1E4ePpu': true,
        'GTuC9ypGyUYn5gcQ269LVTY9aEAwVsfQjwmrAXCddmQA': true,
        '7TAZ4nc1F6bHAaiNwjDy4vLZ8Fv9ZgsbW6vKVwGMpSfk': true,
        'DaH7QWUQHyV8iNRQCJmgvWbfigTc8Kqr4vAk1pFMn68R': true,
        'BpeRVfaGYAvNbEyivzQ9TPJHqAc2URBKrGXkdRhmj278': true,
        'Hy2Gr6Nst4Jax1CgSV1K71uo5gN8VN5okLnvH1F9RGzL': true,
        'DtjBCcawtBViqHviC1xAxUTbyqsM8LJgLcWT73LgSMvz': true,
        '7Dj828Bd7Jg5dTH1yCkCDLJZmfS2NsTLnoEB8hYPixjv': true,
        'G7MunSZwsgHngNWdH1SYg4LKpixDMzhTQfi3LmDtykuZ': true,
        'Ce4Xh1eb97pXgDhzNtfm3wET21bn9Ri949DNXF2JMMm4': true,
        'GBS6UV8zcSHR26LZJ1LD3NDteS43HpmfQmrzfm71rJeo': true,
        '4YKhUgyi7X67qAZYqftNTz6KR8Q3HYZsJapfvYbeTncd': true,
        '7YbnDvPN5pRWUmt42hBjgjyFhs6TzwF4Az1CuSNEV2tT': true,
        'ALbKLcmdF5CAjt3TKHU2VC9aXFouYVCfPveb71sHKBWZ': true,
        'EdNQw7nEJwVb8LnAiVxw7i7a8DeJD5Ew5W3ZHsBKMFFb': true,
        '3F6Dg7EsYUM66TdcYUYS9Prb4yCEzbNqW3z8jf7b3qrG': true,
        'FdQn8m3VBp4gWxGmffzroJwWeZXJ1Us7PavEGfzeDBGX': true,
        '3dEJqAfkTmwoGPCXpCsZHKt2t94SE2Qantxf3nhCbTpJ': true,
        '4vtZkN4RXSTnbzTkEPX297ReyrCLVJDwwEnC3bEGLjPx': true,
        'HQZYmRDenLxZXwhx3iYg5RpnocxquwjconQNsZSU6DZw': true,
        '6eiNEK4nbMfeyswPuEy37je5ZDYRrGg1Ejp7hEA72LzN': true,
        '9Fh98AURXReReN3N9Y96TUGo2ctUguHYRncoDwzcNvY5': true,
        '6w7efmQX8sUYLbYRB3PSVb9pr1Tv8dVaatgaVYbMJemp': true,
        'G2n66dXRjQDfhbeHtCQRS36itL55onByKLgMTesrXKRK': true,
        '5qmdVL64UaHbzrVM5fGPQcMnznRuwpdyyuGPJ5hyZWRt': true,
        'Hx27Xj3a1NcafR37h8pRWZHQ7QQMnwT1toytcbxfJhFr': true,
        'HeK4h7ykLnkaC6HHXdgM2FPi2gCqoPajGqtVMCHBhJuj': true,
        '9hfc4hq2nRvF3a7sLL648LeYkNpQYRV1BG9JnnAuooLs': true,
        'CvzZhx6AVtZU6GePsnCnjdWYD3PDQwNSU81HgnH8MaAx': true,
        '1fGfZqGNUsDmcYMHksucdNgWMCrSSV7UzubGCKBVD3N': true,
        'D5vdKxD1jxDvBGSzgjFUx8HPsHXUwCDUYKuDeX7ioTSA': true,
        '3wUrwCERbcwaZmXFBc3H3CdcGWwXXSgzV4vpavmJWPnz': true,
        'Ee18LHfoi55m1zFm24AuFWgATTQWu6Hwd4XkHNK6jgvy': true,
        'Y8goi9ao4r9CvWfb3twpXLDxugUh6DM689vE1v8HtR2': true,
        '2H9Rgr2K85TPDUdss4WVTbt2sJe7y9QpaqwsNjVgsi11': true,
        '5kAPM6U1MFW2bLcg344KscTTj7bnirBZn6W8nug5KwCQ': true,
        'Eg6s3KSaLU9n7sPDAM3Uz5h2ULaix91US4g5bcqscwTr': true,
        'J3MYxiQ7ngAGaK129Ac7fLFfzTosA6YVhzsBeuzk1GXX': true,
        '2xUpPkiAbgwjCmohcM2bxc2bpzyF77wa1L61BwNcFpbP': true
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
        element.addClass('wavesPop');

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
            transaction.formatted.amount = Money.fromCoins(transaction.amount, Currency.WAVES).formatAmount();
            transaction.formatted.asset = Currency.WAVES.displayName;
        }

        function processAssetIssueTransaction(transaction) {
            var asset = Currency.create({
                id: transaction.id,
                displayName: transaction.name,
                precision: transaction.decimals
            });
            transaction.formatted.amount = Money.fromCoins(transaction.quantity, asset).formatAmount();
            transaction.formatted.asset = asset.displayName;
        }

        function processCreateAliasTransaction(transaction) {
            transaction.formatted.asset = Currency.WAVES.displayName;
        }

        function processAssetTransferTransaction(transaction) {
            var currency;
            if (transaction.assetId) {
                var asset = applicationContext.cache.assets[transaction.assetId];
                if (asset) {
                    currency = asset.currency;
                }
            } else {
                currency = Currency.WAVES;
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
            transaction.formatted.amount = Money.fromCoins(transaction.amount, Currency.WAVES).formatAmount();
            transaction.formatted.asset = Currency.WAVES.displayName;
        }

        function processCancelLeasingTransaction(transaction) {
            transaction.formatted.asset = Currency.WAVES.displayName;
        }

        function processMassPaymentTransaction(transaction) {
            var currency = Currency.WAVES;
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
            transaction.formatted.fee = Money.fromCoins(totalFee, Currency.WAVES).formatAmount(true);

            var currency;
            if (assetId) {
                var asset = applicationContext.cache.assets[assetId];
                if (asset) {
                    currency = asset.currency;
                }
            } else {
                currency = Currency.WAVES;
            }

            if (currency) {
                transaction.formatted.asset = currency.displayName;
                transaction.formatted.amount = Money.fromCoins(transaction.amount, currency).formatAmount();
            }
        }

        function formatFee(transaction) {
            var currency = Currency.WAVES;
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
            var currency = Currency.WAVES;
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

    var url = 'wallet.dei.su';

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

    var FEE_CURRENCY = Currency.WAVES;
    var DEFAULT_ERROR_MESSAGE = 'The Internet connection is lost';

    // TODO : add the `exceptField` attribute or a list of all the needed fields.

    function WavesTransactionHistoryController($scope, events, constants, applicationContext,
                                               apiService, leasingRequestService, notificationService, dialogService) {
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

    WavesTransactionHistoryController.$inject = ['$scope', 'ui.events', 'constants.ui', 'applicationContext',
        'apiService', 'leasingRequestService', 'notificationService', 'dialogService'];

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

(function() {
    'use strict';

    angular.module('app.login', ['waves.core.services', 'app.ui', 'app.shared']);
})();

(function () {
    'use strict';

    angular
        .module('app.login')
        .constant('ui.login.modes', {
            REGISTER: 'register',
            CREATE_SEED: 'create-seed',
            LIST: 'list',
            LOGIN: 'login'
        });

    angular
        .module('app.login')
        .constant('ui.login.events', {
            CHANGE_MODE: 'change-mode',
            GENERATE_SEED: 'generate-seed',  // parameter - seed
            LOGIN: 'login'                   // parameter - account object
        });
})();

(function () {
    'use strict';

    function LoginContextFactory(moduleEvents, applicationEvents, modes) {
        return {
            showAccountsListScreen: function($scope) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.LIST);
            },

            showInputSeedScreen: function ($scope) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.CREATE_SEED);
            },

            showLoginScreen: function ($scope, account) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.LOGIN, account);
            },

            showRegisterScreen: function ($scope, seed) {
                $scope.$emit(moduleEvents.CHANGE_MODE, modes.REGISTER, seed);
            },

            notifyGenerateSeed: function ($scope) {
                $scope.$emit(moduleEvents.GENERATE_SEED);
            },

            notifySignedIn: function ($scope, rawAddress, seed, keys) {
                var applicationState = {
                    address: rawAddress,
                    seed: seed,
                    keyPair: keys
                };

                $scope.$emit(applicationEvents.LOGIN_SUCCESSFUL, applicationState);
            }
        };
    }

    LoginContextFactory.$inject = ['ui.login.events', 'ui.events', 'ui.login.modes'];

    angular
        .module('app.login')
        .factory('loginContext', LoginContextFactory);
})();

(function () {
    'use strict';

    function AccountsController($scope, modes, events, passPhraseService, dialogService, cryptoService, loginContext) {
        var accounts = this;

        // by default start in list mode
        switchToMode(modes.LIST);

        $scope.$on(events.CHANGE_MODE, function (event, mode, param) {
            switchToMode(mode, param);
        });

        $scope.$on(events.GENERATE_SEED, function () {
            var seed = passPhraseService.generate();
            switchToMode(modes.REGISTER, seed);
            dialogService.openNonCloseable('#login-wPop-new');
        });

        function switchToMode(mode, param) {
            switch (mode) {
                case modes.REGISTER:
                    switchToRegisterMode(param);
                    break;

                case modes.CREATE_SEED:
                    switchToCreateSeedMode();
                    break;

                case modes.LIST:
                    switchToListMode();
                    break;

                case modes.LOGIN:
                    switchToLoginMode(param);
                    break;

                default:
                    throw new Error('Unsupported account operation: ' + mode);
            }

            accounts.mode = mode;
        }

        function switchToListMode() {
            accounts.caption = 'ACCOUNTS';
        }

        function switchToCreateSeedMode() {
            accounts.caption = 'SET UP YOUR SEED';
        }

        function switchToRegisterMode(seed) {
            accounts.caption = 'REGISTER ACCOUNT';
            accounts.displayAddress = cryptoService.buildRawAddressFromSeed(seed);
            // setting a seed to register a new account
            loginContext.seed = seed;
        }

        function switchToLoginMode(account) {
            accounts.caption = 'SIGN IN';
            accounts.displayAddress = account.address;
            // setting an account which we would like to sign in
            loginContext.currentAccount = account;
        }
    }

    AccountsController.$inject = [
        '$scope',
        'ui.login.modes',
        'ui.login.events',
        'passPhraseService',
        'dialogService',
        'cryptoService',
        'loginContext'
    ];

    angular
        .module('app.login')
        .controller('accountsController', AccountsController);
})();

(function () {
    'use strict';

    function AccountListController($scope, accountService, dialogService, loginContext) {
        var list = this;
        list.accounts = [];
        list.removeCandidate = {};

        list.removeAccount = removeAccount;
        list.createAccount = createAccount;
        list.importAccount = importAccount;
        list.signIn = signIn;
        list.showRemoveWarning = showRemoveWarning;

        accountService.getAccounts().then(function (accounts) {
            list.accounts = accounts;
        });

        function showRemoveWarning(index) {
            list.removeIndex = index;
            list.removeCandidate = list.accounts[index];
            dialogService.open('#account-remove-popup');
        }

        function removeAccount() {
            if (list.removeCandidate) {
                accountService.removeAccountByIndex(list.removeIndex).then(function () {
                    list.removeCandidate = undefined;
                    list.removeIndex = undefined;
                });
            }
        }

        function createAccount() {
            loginContext.notifyGenerateSeed($scope);
        }

        function importAccount() {
            loginContext.showInputSeedScreen($scope);
        }

        function signIn(account) {
            loginContext.showLoginScreen($scope, account);
        }
    }

    AccountListController.$inject = ['$scope', 'accountService', 'dialogService', 'loginContext'];

    angular
        .module('app.login')
        .controller('accountListController', AccountListController);
})();

(function () {
    'use strict';

    var WALLET_NAME_MAXLENGTH = 16;

    function AccountRegisterController($scope, accountService, cryptoService, loginContext) {
        var ctrl = this;

        ctrl.validationOptions = {
            onfocusout: false,
            rules: {
                walletName: {
                    maxlength: WALLET_NAME_MAXLENGTH
                },
                walletPassword: {
                    required: true,
                    minlength: 8,
                    password: true
                },
                walletPasswordConfirm: {
                    equalTo: '#walletPassword'
                }
            },
            messages: {
                walletName: {
                    maxlength: 'A wallet name is too long. Maximum name length is ' +
                        WALLET_NAME_MAXLENGTH + ' characters'
                },
                walletPassword: {
                    required: 'A password is required to store your seed safely',
                    minlength: 'Password must be 8 characters or longer'
                },
                walletPasswordConfirm: {
                    equalTo: 'Passwords do not match'
                }
            }
        };
        ctrl.saveAccountAndSignIn = saveAccountAndSignIn;
        ctrl.cancel = cancel;
        ctrl.seed = function (seed) {
            return arguments.length ? (loginContext.seed = seed) : loginContext.seed;
        };

        function cleanup() {
            ctrl.name = '';
            ctrl.password = '';
            ctrl.confirmPassword = '';
        }

        function saveAccountAndSignIn(form) {
            if (!form.validate()) {
                return false;
            }

            var seed = loginContext.seed;
            var cipher = cryptoService.encryptWalletSeed(seed, ctrl.password).toString();
            var keys = cryptoService.getKeyPair(seed);
            var checksum = cryptoService.seedChecksum(seed);
            var address = cryptoService.buildRawAddress(keys.public);

            var account = {
                name: ctrl.name,
                cipher: cipher,
                checksum: checksum,
                publicKey: keys.public,
                address: address
            };

            accountService.addAccount(account);

            loginContext.notifySignedIn($scope, address, seed, keys);

            cleanup();

            return true;
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountRegisterController.$inject = ['$scope', 'accountService', 'cryptoService', 'loginContext'];

    angular
        .module('app.login')
        .controller('accountRegisterController', AccountRegisterController);
})();

(function () {
    'use strict';

    var SEED_MINIMUM_LENGTH = 25;

    function AccountSeedController($scope, loginContext, utilityService,
                                   cryptoService, dialogService, passPhraseService) {
        var vm = this;

        vm.validationOptions = {
            onfocusout: false,
            rules: {
                walletSeed: {
                    required: true,
                    minlength: SEED_MINIMUM_LENGTH
                }
            },
            messages: {
                walletSeed: {
                    required: 'Wallet seed is required',
                    minlength: 'Wallet seed is too short. A secure wallet seed should contain more than ' +
                       SEED_MINIMUM_LENGTH + ' characters'
                }
            }
        };
        vm.registerAccount = registerAccount;
        vm.back = goBack;
        vm.refreshAddress = refreshAddress;
        vm.checkSeedAndRegister = checkSeedAndRegister;
        vm.generateSeed = generateSeed;

        function cleanup() {
            //it seems we won't need this code if we switch to recreation of controllers on each event
            vm.seed = '';
            vm.displayAddress = '';
        }

        function refreshAddress() {
            vm.displayAddress = cryptoService.buildRawAddressFromSeed(vm.seed);
        }

        function checkSeedAndRegister(form) {
            if (!form.validate()) {
                return false;
            }

            if (utilityService.endsWithWhitespace(vm.seed)) {
                dialogService.openNonCloseable('#seed-whitespace-popup');
            } else {
                registerAccount();
            }

            return true;
        }

        function generateSeed() {
            vm.seed = passPhraseService.generate();
            refreshAddress();
        }

        function registerAccount() {
            loginContext.showRegisterScreen($scope, vm.seed);
            cleanup();
        }

        function goBack() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountSeedController.$inject = ['$scope',
        'loginContext',
        'utilityService',
        'cryptoService',
        'dialogService',
        'passPhraseService'];

    angular
        .module('app.login')
        .controller('accountSeedController', AccountSeedController);
})();

(function () {
    'use strict';

    function AccountLoginController ($scope, cryptoService, loginContext, notificationService) {
        var vm = this;

        vm.signIn = signIn;
        vm.cancel = cancel;

        function cleanup() {
            vm.password = '';
        }

        function performSignIn() {
            var account = loginContext.currentAccount;
            if (angular.isUndefined(account)) {
                throw new Error('Account to log in hasn\'t been selected');
            }

            var decryptedSeed = cryptoService.decryptWalletSeed(account.cipher, vm.password, account.checksum);
            if (!decryptedSeed) {
                notificationService.error('Wrong password! Please try again.');
            }
            else {
                var keys = cryptoService.getKeyPair(decryptedSeed);
                loginContext.notifySignedIn($scope, account.address, decryptedSeed, keys);
            }
        }

        function signIn() {
            performSignIn();
            cleanup();
        }

        function cancel() {
            loginContext.showAccountsListScreen($scope);
            cleanup();
        }
    }

    AccountLoginController.$inject = ['$scope', 'cryptoService', 'loginContext', 'notificationService'];

    angular
        .module('app.login')
        .controller('accountLoginController', AccountLoginController);
})();

(function() {
    'use strict';

    angular.module('app.navigation', ['waves.core.services', 'app.ui', 'app.shared'])
        .constant('navigation.events', {
            NAVIGATION_CREATE_ALIAS: 'navigation-create-alias'
        });
})();

(function () {
    'use strict';

    angular
        .module('app.navigation')
        .controller('navigationController', ['$scope', function ($scope) {
            var nav = this;

            nav.currentTab = 'wallet';
            nav.changeTab = changeTab;

            function changeTab (pageId) {
                nav.currentTab = pageId;
            }
        }]);
})();

(function () {
    'use strict';

    function MainMenuController($scope, $interval, events, applicationContext,
                                cryptoService, dialogService, notificationService, apiService) {
        var ctrl = this,
            refreshPromise,
            delayRefresh = 10 * 1000;

        ctrl.blockHeight = 0;
        ctrl.address = applicationContext.account.address;
        ctrl.addressQr = 'waves://' + ctrl.address;

        function initializeBackupFields() {
            ctrl.seed = applicationContext.account.seed;
            ctrl.encodedSeed = cryptoService.base58.encode(converters.stringToByteArray(ctrl.seed));
            ctrl.publicKey = applicationContext.account.keyPair.public;
            ctrl.privateKey = applicationContext.account.keyPair.private;
        }

        function buildBackupClipboardText() {
            var text = 'Seed: ' + ctrl.seed + '\n';
            text += 'Encoded seed: ' + ctrl.encodedSeed + '\n';
            text += 'Private key: ' + ctrl.privateKey + '\n';
            text += 'Public key: ' + ctrl.publicKey + '\n';
            text += 'Address: ' + ctrl.address;
            return text;
        }

        refreshBlockHeight();
        refreshPromise = $interval(refreshBlockHeight, delayRefresh);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        ctrl.showAddressQr = showAddressQr;
        ctrl.showBackupDialog = showBackupDialog;
        ctrl.showProfileDialog = showProfileDialog;
        ctrl.backup = backup;

        function showAddressQr() {
            dialogService.open('#address-qr-modal');
        }

        function showProfileDialog() {
            $scope.$broadcast(events.NAVIGATION_CREATE_ALIAS, {});
        }

        function showBackupDialog() {
            initializeBackupFields();
            dialogService.open('#header-wPop-backup');
        }

        function backup() {
            var clipboard = new Clipboard('#backupForm', {
                text: function () {
                    return buildBackupClipboardText();
                }
            });

            clipboard.on('success', function(e) {
                notificationService.notice('Account backup has been copied to clipboard');
                e.clearSelection();
            });

            angular.element('#backupForm').click();
            clipboard.destroy();
        }

        function refreshBlockHeight() {
            apiService.blocks.height().then(function (response) {
                ctrl.blockHeight = response.height;
                applicationContext.blockHeight = response.height;
            });
        }
    }

    MainMenuController.$inject = ['$scope', '$interval', 'navigation.events', 'applicationContext',
                                  'cryptoService', 'dialogService', 'notificationService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('mainMenuController', MainMenuController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE = Money.fromTokens(0.001, Currency.WAVES);
    var ALIAS_MINIMUM_LENGTH = 4;
    var ALIAS_MAXIMUM_LENGTH = 30;

    function WavesCreateAliasController($scope, $timeout, events, applicationContext,
                                        dialogService, notificationService, transactionBroadcast,
                                        formattingService, aliasRequestService, apiService) {
        var ctrl = this;

        ctrl.fee = DEFAULT_FEE;
        ctrl.aliasList = null;

        ctrl.validationOptions = {
            onfocusout: false,
            rules: {
                aliasName: {
                    required: true,
                    minlength: ALIAS_MINIMUM_LENGTH,
                    maxlength: ALIAS_MAXIMUM_LENGTH
                }
            },
            messages: {
                aliasName: {
                    required: 'Symbolic name is required',
                    minlength: 'Alias name is too short. Please enter at least ' + ALIAS_MINIMUM_LENGTH + ' symbols',
                    maxlength: 'Alias name is too long. Please use no more than ' + ALIAS_MAXIMUM_LENGTH + ' symbols'
                }
            }
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.alias.create, function (tx) {
            var formattedTime = formattingService.formatTimestamp(tx.timestamp),
                displayMessage = 'Created alias \'' + tx.alias + '\'<br/>Date: ' + formattedTime;
            notificationService.notice(displayMessage);
        });

        ctrl.confirmCreateAlias = confirmCreateAlias;
        ctrl.broadcastTransaction = broadcastTransaction;

        $scope.$on(events.NAVIGATION_CREATE_ALIAS, function () {
            reset();
            getExistingAliases();
            dialogService.open('#create-alias-dialog');
        });

        function getExistingAliases() {
            apiService.alias
                .getByAddress(applicationContext.account.address)
                .then(function (aliasList) {
                    ctrl.aliasList = aliasList;
                });
        }

        function broadcastTransaction () {
            ctrl.broadcast.broadcast();
        }

        function confirmCreateAlias (form) {
            if (!form.validate(ctrl.validationOptions)) {
                return false;
            }

            var createAlias = {
                alias: ctrl.alias,
                fee: ctrl.fee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create the transaction and waiting for confirmation
            ctrl.broadcast.setTransaction(aliasRequestService.buildCreateAliasRequest(createAlias, sender));

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#create-alias-confirmation');
            }, 1);

            return true;
        }

        function reset () {
            ctrl.alias = '';
        }
    }

    WavesCreateAliasController.$inject = ['$scope', '$timeout', 'navigation.events', 'applicationContext',
                                          'dialogService', 'notificationService', 'transactionBroadcast',
                                          'formattingService', 'aliasRequestService', 'apiService'];

    angular
        .module('app.navigation')
        .controller('createAliasController', WavesCreateAliasController);
})();

(function () {
    'use strict';

    function WavesTabController($scope, dialogService) {
        $scope.isSelected = function () {
            return $scope.pageId === $scope.currentPageId;
        };

        $scope.onClick = function () {
            $scope.onSelect({pageId: $scope.pageId});

            // cleaning unused modal dialog divs, created by previous tab
            dialogService.cleanup();
        };
    }

    function WavesTabLink(scope, element) {
        element.addClass('tabs-radio');
    }

    angular
        .module('app.navigation')
        .directive('wavesTab', function WavesTabDirective() {
            return {
                restrict: 'A',
                controller: ['$scope', 'dialogService', WavesTabController],
                scope: {
                    pageId: '@',
                    caption: '<',
                    onSelect: '&',
                    currentPageId: '<'
                },
                link: WavesTabLink,
                templateUrl: 'navigation/tab.directive'
            };
        });
})();

(function() {
    'use strict';

    angular.module('app.wallet', ['app.shared'])
        .constant('wallet.events', {
            WALLET_SEND: 'wallet-send',
            WALLET_WITHDRAW: 'wallet-withdraw',
            WALLET_DEPOSIT: 'wallet-deposit',
            WALLET_CARD_DEPOSIT: 'wallet-card-deposit'
        });
})();

(function () {
    'use strict';

    function WalletBoxController() {
        var ctrl = this;

        var mapping = {};
        mapping[Currency.WAVES.displayName] = {
            image: 'wB-bg-WAV.svg',
            displayName: Currency.WAVES.displayName
        };
        mapping[Currency.BTC.displayName] = {
            image: 'wB-bg-BTC.svg',
            displayName: Currency.BTC.displayName
        };
        mapping[Currency.USD.displayName] = {
            image: 'wB-bg-USD.svg',
            displayName: Currency.USD.displayName
        };
        mapping[Currency.EUR.displayName] = {
            image: 'wB-bg-EUR.svg',
            displayName: Currency.EUR.displayName
        };
		mapping[Currency.DEIP.displayName] = {
			image: 'wB-bg-DEIP.svg',
			displayName: Currency.DEIP.displayName
		};
		mapping[Currency.LIBRE.displayName] = {
			image: 'wB-bg-LIBRE.svg',
			displayName: Currency.LIBRE.displayName
		};
		mapping[Currency.MIR.displayName] = {
            image: 'wB-bg-MIR.svg',
            displayName: Currency.MIR.displayName
        };

        ctrl.$onChanges = function (changesObject) {
            if (changesObject.balance) {
                var balance = changesObject.balance.currentValue;
                ctrl.integerBalance = balance.formatIntegerPart();
                ctrl.fractionBalance = balance.formatFractionPart();
            }
        };
        ctrl.$onInit = function () {
            ctrl.image = mapping[ctrl.balance.currency.displayName].image;
            ctrl.displayName = mapping[ctrl.balance.currency.displayName].displayName;
        };
    }

    WalletBoxController.$inject = [];

    angular
        .module('app.wallet')
        .component('walletBox', {
            controller: WalletBoxController,
            bindings: {
                balance: '<',
                onSend: '&',
                onWithdraw: '&',
                onDeposit: '&',
                detailsAvailable: '<?'
            },
            templateUrl: 'wallet/box.component'
        });
})();

(function () {
    'use strict';

    var TRANSACTIONS_TO_LOAD = 100;

    function WavesWalletListController($scope, $interval, events, applicationContext,
                                       apiService, transactionLoadingService, dialogService) {
        var ctrl = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        function sendCommandEvent(event, currency) {
            var assetWallet = findWalletByCurrency(currency);
            var wavesWallet = findWalletByCurrency(Currency.WAVES);

            $scope.$broadcast(event, {
                assetBalance: assetWallet.balance,
                wavesBalance: wavesWallet.balance
            });
        }

        function findWalletByCurrency(currency) {
            return _.find(ctrl.wallets, function (w) {
                return w.balance.currency === currency;
            });
        }

        ctrl.wallets = [
            {
                balance: new Money(0, Currency.WAVES),
                depositWith: Currency.BTC
            },
						{
                balance: new Money(0, Currency.MIR),
                depositWith: Currency.BTC
            },
						{
                balance: new Money(0, Currency.BTC),
                depositWith: Currency.BTC
            }
        ];

        ctrl.transactions = [];
        ctrl.send = send;
        ctrl.withdraw = withdraw;
        ctrl.deposit = deposit;
        ctrl.depositFromCard = depositFromCard;

        loadDataFromBackend();
        patchCurrencyIdsForTestnet();

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function send (wallet) {
            sendCommandEvent(events.WALLET_SEND, wallet.balance.currency);
        }

        function withdraw (wallet) {
            var id = wallet.balance.currency.id,
                type;

			if (id === Currency.BTC.id || id === Currency.WAVES.id) {
                type = 'crypto';
            } else if (id === Currency.EUR.id || id === Currency.USD.id) {
                type = 'fiat';
			} else if (id === Currency.DEIP.id || id === Currency.LIBRE.id || id === Currency.MIR.id) {
				dialogService.open('#feat-not-active');
            } else {
                throw new Error('Add an option here!');
            }

            sendCommandEvent(events.WALLET_WITHDRAW + type, wallet.balance.currency);
        }

        function deposit (wallet) {
            if (wallet.balance.currency === Currency.WAVES) {
                depositFromCard(wallet.balance.currency);
			} else if (wallet.balance.currency === Currency.DEIP || wallet.balance.currency === Currency.LIBRE || wallet.balance.currency === Currency.MIR) {
				dialogService.open('#feat-not-active');
            } else {
                $scope.$broadcast(events.WALLET_DEPOSIT + wallet.balance.currency.id, {
                    assetBalance: wallet.balance,
                    depositWith: wallet.depositWith
                });
            }
        }

        function depositFromCard (currency) {
            dialogService.close();

            $scope.$broadcast(events.WALLET_CARD_DEPOSIT, {
                currency: currency
            });
        }

        function loadDataFromBackend() {
            refreshWallets();
            refreshTransactions();

            refreshPromise = $interval(function() {
                refreshWallets();
                refreshTransactions();
            }, refreshDelay);
        }

        function refreshWallets() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    var wavesWallet = findWalletByCurrency(Currency.WAVES);
                    wavesWallet.balance = Money.fromCoins(response.balance, Currency.WAVES);
                });

            apiService.assets.balance(applicationContext.account.address).then(function (response) {
                _.forEach(response.balances, function (assetBalance) {
                    var id = assetBalance.assetId;

                    // adding asset details to cache
                    applicationContext.cache.putAsset(assetBalance.issueTransaction);
                    applicationContext.cache.updateAsset(id, assetBalance.balance,
                        assetBalance.reissuable, assetBalance.quantity);
                });

                _.forEach(ctrl.wallets, function (wallet) {
                    var asset = applicationContext.cache.assets[wallet.balance.currency.id];
                    if (asset) {
                        wallet.balance = asset.balance;
                    }
                });
            });
        }

        function refreshTransactions() {
            var txArray;
            transactionLoadingService.loadTransactions(applicationContext.account, TRANSACTIONS_TO_LOAD)
                .then(function (transactions) {
                    txArray = transactions;

                    return transactionLoadingService.refreshAssetCache(applicationContext.cache, transactions);
                })
                .then(function () {
                    ctrl.transactions = txArray;
                });
        }

        // Assets ID substitution for testnet
        function patchCurrencyIdsForTestnet() {
            if ($scope.isTestnet()) {
                Currency.EUR.id = '2xnE3EdpqXtFgCP156qt1AbyjpqdZ5jGjWo3CwTawcux';
                Currency.USD.id = 'HyFJ3rrq5m7FxdkWtQXkZrDat1F7LjVVGfpSkUuEXQHj';
                Currency.BTC.id = 'Fmg13HEHJHuZYbtJq8Da8wifJENq8uBxDuWoP9pVe2Qe';
                Currency.ETH.id = '3fVdr1oiX39uS82ZGUPnu7atNQtFHZfPnseRDUcDxrhp';
                Currency.LTC.id = 'NO_ID_YET'; // FIXME
                Currency.ZEC.id = 'NO_ID_YET'; // FIXME
                Currency.invalidateCache();
            }
        }
    }

    WavesWalletListController.$inject = ['$scope', '$interval', 'wallet.events', 'applicationContext',
                                         'apiService', 'transactionLoadingService', 'dialogService'];

    angular
        .module('app.wallet')
        .controller('walletListController', WavesWalletListController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE_AMOUNT = '0.001';
    var FEE_CURRENCY = Currency.WAVES;

    function WalletSendController($scope, $timeout, constants, events, autocomplete,
                                  applicationContext, apiService, dialogService,
                                  transactionBroadcast, assetService, notificationService,
                                  formattingService, addressService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.autocomplete = autocomplete;

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.assetBalance.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.assetBalance.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.validationOptions = {
            rules: {
                sendRecipient: {
                    required: true
                },
                sendAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0,     // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                },
                sendFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                sendAttachment: {
                    maxbytelength: constants.MAXIMUM_ATTACHMENT_BYTE_SIZE
                }
            },
            messages: {
                sendRecipient: {
                    required: 'Recipient account number is required'
                },
                sendAmount: {
                    required: 'Amount to send is required'
                },
                sendFee: {
                    required: 'Transaction fee is required',
                    decimal: 'Transaction fee must be a number with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                sendAttachment: {
                    maxbytelength: 'Attachment is too long'
                }
            }
        };

        ctrl.submitTransfer = submitTransfer;
        ctrl.broadcastTransaction = broadcastTransaction;

        resetForm();

        $scope.$on(events.WALLET_SEND, function (event, eventData) {

            resetForm();

            ctrl.feeAssetBalance = eventData.wavesBalance;
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.feeAndTransferAssetsAreTheSame = eventData.assetBalance.currency === FEE_CURRENCY;
            ctrl.currency = eventData.assetBalance.currency.displayName;

            // Update validation options and check how they affect form validation
            ctrl.validationOptions.rules.sendAmount.decimal = ctrl.assetBalance.currency.precision;
            var minimumPayment = Money.fromCoins(1, ctrl.assetBalance.currency);
            ctrl.validationOptions.rules.sendAmount.min = minimumPayment.toTokens();
            ctrl.validationOptions.rules.sendAmount.max = ctrl.assetBalance.toTokens();
            ctrl.validationOptions.messages.sendAmount.decimal = 'The amount to send must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            ctrl.validationOptions.messages.sendAmount.min = 'Payment amount is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            ctrl.validationOptions.messages.sendAmount.max = 'Payment amount is too big. ' +
                'It should be less or equal to ' + ctrl.assetBalance.formatAmount(false);

            dialogService.open('#wB-butSend-WAV');
        });

        function submitTransfer(transferForm) {
            if (!transferForm.validate(ctrl.validationOptions)) {
                // Prevent dialog from closing
                return false;
            }

            var amount = Money.fromTokens(ctrl.amount, ctrl.assetBalance.currency);
            var transferFee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), FEE_CURRENCY);
            var paymentCost = transferFee;

            if (ctrl.feeAndTransferAssetsAreTheSame) {
                paymentCost = paymentCost.plus(amount);
            }

            if (paymentCost.greaterThan(ctrl.feeAssetBalance)) {
                notificationService.error('Not enough ' + FEE_CURRENCY.displayName + ' for the transfer');
                return false;
            }

            var assetTransfer = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: amount,
                fee: transferFee
            };

            if (ctrl.attachment) {
                assetTransfer.attachment = converters.stringToByteArray(ctrl.attachment);
            }

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create a transaction and wait for confirmation
            ctrl.broadcast.setTransaction(assetService.createAssetTransferTransaction(assetTransfer, sender));

            // Set data to the confirmation dialog
            ctrl.confirm.amount = assetTransfer.amount;
            ctrl.confirm.fee = assetTransfer.fee;
            ctrl.confirm.recipient = assetTransfer.recipient;

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#send-payment-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function resetForm() {
            ctrl.recipient = '';
            ctrl.amount = '0';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = Money.fromTokens(DEFAULT_FEE_AMOUNT, FEE_CURRENCY);
            ctrl.autocomplete.defaultFee(Number(DEFAULT_FEE_AMOUNT));
        }
    }

    WalletSendController.$inject = ['$scope', '$timeout', 'constants.ui', 'wallet.events', 'autocomplete.fees',
        'applicationContext', 'apiService', 'dialogService', 'transactionBroadcast', 'assetService',
        'notificationService', 'formattingService', 'addressService'];

    angular
        .module('app.wallet')
        .controller('walletSendController', WalletSendController);
})();

(function () {
    'use strict';

    var DEFAULT_FEE_AMOUNT = '0.001',
        DEFAULT_ERROR_MESSAGE = 'Connection is lost';

    function WavesWalletWithdrawController ($scope, constants, events, autocomplete, dialogService, $element,
                                            coinomatService, transactionBroadcast, notificationService,
                                            apiService, formattingService, assetService, applicationContext) {

        var ctrl = this;
        var type = $element.data('type');

        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, Currency.WAVES);
        var notPermittedBitcoinAddresses = {};

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.assetBalance.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.assetBalance.currency.displayName +
                    '<br/>Gateway ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            });

        ctrl.autocomplete = autocomplete;

        ctrl.validationOptions = {
            onfocusout: function (element) {
                return !(element.name in ['withdrawFee']); // FIXME
            },
            rules: {
                withdrawAddress: {
                    required: true
                },
                withdrawAmount: {
                    required: true,
                    decimal: 8,
                    min: 0,
                    max: constants.JAVA_MAX_LONG
                },
                withdrawFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                withdrawTotal: {
                    required: true,
                    decimal: 8,
                    min: 0,
                    max: constants.JAVA_MAX_LONG
                }
            },
            messages: {
                withdrawAddress: {
                    required: 'Bitcoin address is required'
                },
                withdrawAmount: {
                    required: 'Amount to withdraw is required'
                },
                withdrawFee: {
                    required: 'Gateway transaction fee is required',
                    decimal: 'Transaction fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                withdrawTotal: {
                    required: 'Total amount is required'
                }
            }
        };

        ctrl.confirm = {
            amount: {},
            fee: {},
            gatewayAddress: '',
            address: ''
        };

        ctrl.confirmWithdraw = confirmWithdraw;
        ctrl.refreshAmount = refreshAmount;
        ctrl.refreshTotal = refreshTotal;
        ctrl.broadcastTransaction = broadcastTransaction;
        ctrl.gatewayEmail = 'support@coinomat.com';

        resetForm();

        $scope.$on(events.WALLET_WITHDRAW + type, function (event, eventData) {
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.wavesBalance = eventData.wavesBalance;

			if (ctrl.assetBalance.currency === Currency.BTC) {
                withdrawCrypto();
            } else if (ctrl.assetBalance.currency === Currency.EUR) {
                withdrawEUR();
            } else if (ctrl.assetBalance.currency === Currency.USD) {
                withdrawUSD();
            } else {
                $scope.home.featureUnderDevelopment();
            }
        });

        function withdrawCrypto() {
            coinomatService.getWithdrawRate(ctrl.assetBalance.currency)
                .then(function (response) {
                    /* jscs:disable requireCamelCaseOrUpperCaseIdentifiers */
                    var minimumPayment = Money.fromCoins(1, ctrl.assetBalance.currency);
                    minimumPayment = Money.fromTokens(Math.max(minimumPayment.toTokens(), response.in_min),
                        ctrl.assetBalance.currency);
                    var maximumPayment = Money.fromTokens(Math.min(ctrl.assetBalance.toTokens(),
                        response.in_max), ctrl.assetBalance.currency);
                    ctrl.sourceCurrency = ctrl.assetBalance.currency.displayName;
                    ctrl.isEthereum = (ctrl.assetBalance.currency === Currency.ETH);
                    ctrl.exchangeRate = response.xrate;
                    ctrl.feeIn = response.fee_in;
                    ctrl.feeOut = response.fee_out;
                    ctrl.targetCurrency = response.to_txt;
                    ctrl.total = response.in_def;
                    ctrl.minimumPayment = minimumPayment;
                    /* jscs:enable requireCamelCaseOrUpperCaseIdentifiers */
                    ctrl.validationOptions.rules.withdrawAmount.decimal = ctrl.assetBalance.currency.precision;
                    ctrl.validationOptions.rules.withdrawAmount.max = maximumPayment.toTokens();
                    ctrl.validationOptions.rules.withdrawAmount.min = minimumPayment.toTokens();
                    ctrl.validationOptions.messages.withdrawAddress.required = minimumPayment.currency.displayName +
                        ' address is required';
                    ctrl.validationOptions.messages.withdrawAmount.decimal = 'The amount to withdraw must be ' +
                        'a number with no more than ' + minimumPayment.currency.precision +
                        ' digits after the decimal point (.)';
                    ctrl.validationOptions.messages.withdrawAmount.min = 'Withdraw amount is too small. ' +
                        'It should be greater or equal to ' + minimumPayment.formatAmount();
                    ctrl.validationOptions.messages.withdrawAmount.max = 'Withdraw amount is too big. ' +
                        'It should be less or equal to ' + maximumPayment.formatAmount();

                    refreshAmount();

                    dialogService.open('#withdraw-crypto-dialog');
                }).catch(function (exception) {
                if (exception && exception.data && exception.data.error) {
                    notificationService.error(exception.error);
                } else {
                    notificationService.error(DEFAULT_ERROR_MESSAGE);
                }
            }).then(function () {
                return coinomatService.getDepositDetails(Currency.BTC, Currency.BTC,
                    applicationContext.account.address);
            }).then(function (depositDetails) {
                notPermittedBitcoinAddresses[depositDetails.address] = 1;

                return coinomatService.getDepositDetails(Currency.BTC, Currency.WAVES,
                    applicationContext.account.address);
            }).then(function (depositDetails) {
                notPermittedBitcoinAddresses[depositDetails.address] = 1;
            });
        }

        function withdrawEUR() {
            ctrl.sourceCurrency = Currency.EUR.displayName;
            dialogService.open('#withdraw-fiat-dialog');
        }

        function withdrawUSD() {
            ctrl.sourceCurrency = Currency.USD.displayName;
            dialogService.open('#withdraw-fiat-dialog');
        }

        function validateRecipientBTCAddress(recipient) {
            if (!recipient.match(/^[0-9a-z]{27,34}$/i)) {
                throw new Error('Bitcoin address is invalid. Expected address length is from 27 to 34 symbols');
            }

            if (notPermittedBitcoinAddresses[recipient]) {
                throw new Error('Withdraw on deposit bitcoin accounts is not permitted');
            }
        }

        function validateWithdrawCost(withdrawCost, availableFunds) {
            if (withdrawCost.greaterThan(availableFunds)) {
                throw new Error('Not enough Waves for the withdraw transfer');
            }
        }

        function confirmWithdraw (amountForm) {
            if (!amountForm.validate(ctrl.validationOptions)) {
                return false;
            }

            try {
                var withdrawCost = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), Currency.WAVES);
                validateWithdrawCost(withdrawCost, ctrl.wavesBalance);
                if (ctrl.assetBalance.currency === Currency.BTC) {
                    validateRecipientBTCAddress(ctrl.recipient);
                } else if (ctrl.assetBalance.currency === Currency.ETH) {
                    // TODO
                }
            } catch (e) {
                notificationService.error(e.message);
                return false;
            }

            var total = Money.fromTokens(ctrl.total, ctrl.assetBalance.currency);
            var fee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), Currency.WAVES);
            ctrl.confirm.amount = total;
            ctrl.confirm.fee = fee;
            ctrl.confirm.recipient = ctrl.recipient;

            coinomatService.getWithdrawDetails(ctrl.assetBalance.currency, ctrl.recipient)
                .then(function (withdrawDetails) {
                    ctrl.confirm.gatewayAddress = withdrawDetails.address;

                    var assetTransfer = {
                        recipient: withdrawDetails.address,
                        amount: total,
                        fee: fee,
                        attachment: converters.stringToByteArray(withdrawDetails.attachment)
                    };
                    var sender = {
                        publicKey: applicationContext.account.keyPair.public,
                        privateKey: applicationContext.account.keyPair.private
                    };
                    // creating the transaction and waiting for confirmation
                    ctrl.broadcast.setTransaction(assetService.createAssetTransferTransaction(assetTransfer, sender));

                    resetForm();

                    dialogService.open('#withdraw-confirmation');
                })
                .catch(function (exception) {
                    notificationService.error(exception.message);
                });

            return true;
        }

        function broadcastTransaction () {
            ctrl.broadcast.broadcast();
        }

        function refreshTotal () {
            var amount = ctrl.exchangeRate * ctrl.amount;
            var total = Money.fromTokens(amount + ctrl.feeIn + ctrl.feeOut, ctrl.assetBalance.currency);
            ctrl.total = total.formatAmount(true, false);
        }

        function refreshAmount () {
            var total = Math.max(0, ctrl.exchangeRate * (ctrl.total - ctrl.feeIn) - ctrl.feeOut);
            var amount = Money.fromTokens(total, ctrl.assetBalance.currency);
            ctrl.amount = amount.formatAmount(true, false);
        }

        function resetForm () {
            ctrl.recipient = '';
            ctrl.address = '';
            ctrl.autocomplete.defaultFee(Number(DEFAULT_FEE_AMOUNT));
        }
    }

    WavesWalletWithdrawController.$inject = [
        '$scope', 'constants.ui', 'wallet.events', 'autocomplete.fees', 'dialogService', '$element',
        'coinomatService', 'transactionBroadcast', 'notificationService',
        'apiService', 'formattingService', 'assetService', 'applicationContext'
    ];

    angular
        .module('app.wallet')
        .controller('walletWithdrawController', WavesWalletWithdrawController);
})();

(function () {
    'use strict';

    var DEFAULT_ERROR_MESSAGE = 'Connection is lost';

    function WavesWalletDepositController($scope, events, coinomatService, dialogService, notificationService,
                                          applicationContext, bitcoinUriService, utilsService, $element) {

        var ctrl = this;
        var currencyId = Currency[$element.data('currency')].id;

        ctrl.btc = {
            bitcoinAddress: '',
            bitcoinAmount: '',
            bitcoinUri: '',
            minimumAmount: 0.001
        };

        ctrl.fiat = {
            verificationLink: 'https://go.idnow.de/coinomat/userdata/' + applicationContext.account.address,
            email: 'support@coinomat.com'
        };

        ctrl.refreshBTCUri = function () {
            var params = null;
            if (ctrl.btc.bitcoinAmount >= ctrl.btc.minimumAmount) {
                params = {
                    amount: ctrl.btc.bitcoinAmount
                };
            }
            ctrl.btc.bitcoinUri = bitcoinUriService.generate(ctrl.btc.bitcoinAddress, params);
        };

        $scope.$on(events.WALLET_DEPOSIT + currencyId, function (event, eventData) {
            ctrl.depositWith = eventData.depositWith;
            ctrl.assetBalance = eventData.assetBalance;
            ctrl.currency = ctrl.assetBalance.currency.displayName;

            // Show deposit popups only on mainnet
            if (ctrl.assetBalance.currency === Currency.BTC && !utilsService.isTestnet()) {
                depositBTC();
            } else if (ctrl.assetBalance.currency === Currency.EUR) {
                depositEUR();
            } else if (ctrl.assetBalance.currency === Currency.USD) {
                depositUSD();
            } else {
                $scope.home.featureUnderDevelopment();
            }
        });

        function catchErrorMessage(e) {
            if (e && e.message) {
                notificationService.error(e.message);
            } else {
                notificationService.error(DEFAULT_ERROR_MESSAGE);
            }
        }

        function depositBTC() {
            coinomatService.getDepositDetails(ctrl.depositWith, ctrl.assetBalance.currency,
                applicationContext.account.address)
                .then(function (depositDetails) {
                    dialogService.open('#deposit-btc-dialog');
                    ctrl.btc.bitcoinAddress = depositDetails.address;
                    ctrl.btc.bitcoinUri = bitcoinUriService.generate(ctrl.btc.bitcoinAddress);
                })
                .catch(catchErrorMessage);
        }

        function depositEUR() {
            dialogService.open('#deposit-eur-dialog');
        }

        function depositUSD() {
            dialogService.open('#deposit-usd-dialog');
        }
    }

    WavesWalletDepositController.$inject = [
        '$scope', 'wallet.events', 'coinomatService', 'dialogService', 'notificationService',
        'applicationContext', 'bitcoinUriService', 'utilsService', '$element'
    ];

    angular
        .module('app.wallet')
        .controller('walletDepositController', WavesWalletDepositController);
})();

(function () {
    'use strict';

    var DEFAULT_AMOUNT_TO_PAY = 50;

    function FiatCurrency (code, displayName) {
        this.code = code;
        if (displayName) {
            this.displayName = displayName;
        } else {
            this.displayName = code;
        }
    }

    function WavesCardDepositController ($scope, $window, $q, events, dialogService,
                                         fiatService, applicationContext, notificationService) {
        var deferred;
        var ctrl = this;
        ctrl.currencies = [new FiatCurrency('EURO', 'Euro'), new FiatCurrency('USD')];
        ctrl.limits = {};
        ctrl.updateReceiveAmount = updateReceiveAmount;
        ctrl.updateLimitsAndReceiveAmount = updateLimitsAndReceiveAmount;
        ctrl.redirectToMerchant = redirectToMerchant;

        reset();

        $scope.$on(events.WALLET_CARD_DEPOSIT, function (event, eventData) {
            dialogService.open('#card-deposit-dialog');

            reset();
            ctrl.crypto = eventData.currency;

            updateLimitsAndReceiveAmount();
        });

        function reset() {
            ctrl.payAmount = DEFAULT_AMOUNT_TO_PAY;
            ctrl.payCurrency = ctrl.currencies[0];
            ctrl.crypto = {};
            ctrl.getAmount = '';
        }

        function updateLimitsAndReceiveAmount() {
            fiatService.getLimits(applicationContext.account.address, ctrl.payCurrency.code, ctrl.crypto)
                .then(function (response) {
                    ctrl.limits = {
                        min: Number(response.min),
                        max: Number(response.max)
                    };

                    if (ctrl.payAmount < ctrl.limits.min) {
                        ctrl.payAmount = ctrl.limits.min;
                    } else if (ctrl.payAmount > ctrl.limits.max) {
                        ctrl.payAmount = ctrl.limits.max;
                    }
                }).catch(function (response) {
                    remotePartyErrorHandler('get limits', response);
                });

            updateReceiveAmount();
        }

        function remotePartyErrorHandler(operationName, response) {
            if (response) {
                if (response.data) {
                    notificationService.error(response.data.message);
                } else if (response.statusText) {
                    notificationService.error('Failed to ' + operationName + '. Error code: ' + response.status +
                        '<br/>Message: ' + response.statusText);
                }
            } else {
                notificationService.error('Operation failed: ' + operationName);
            }
        }

        function updateReceiveAmount() {
            if (deferred) {
                deferred.reject();
                deferred = undefined;
            }

            var amount = Number(ctrl.payAmount);
            if (isNaN(amount) || ctrl.payAmount <= 0) {
                ctrl.getAmount = '';
                return;
            }

            deferred = $q.defer();
            deferred.promise.then(function (response) {
                if (response) {
                    ctrl.getAmount = response + ' ' + ctrl.crypto.shortName;
                } else {
                    ctrl.getAmount = '';
                }
            }).catch(function (value) {
                if (value) {
                    remotePartyErrorHandler('get rates', value);
                }
            });

            fiatService.getRate(applicationContext.account.address, ctrl.payAmount, ctrl.payCurrency.code, ctrl.crypto)
                .then(deferred.resolve).catch(deferred.reject);
        }

        function redirectToMerchant() {
            try {
                validateAmountToPay();

                var url = fiatService.getMerchantUrl(applicationContext.account.address,
                    ctrl.payAmount, ctrl.payCurrency.code, ctrl.crypto);
                $window.open(url, '_blank');

                return true;
            } catch (e) {
                notificationService.error(e.message);
                return false;
            }
        }

        function validateAmountToPay() {
            if (Number(ctrl.payAmount) < ctrl.limits.min) {
                throw new Error('Minimum amount to pay is ' + ctrl.limits.min + ' ' + ctrl.payCurrency.displayName);
            }
            if (Number(ctrl.payAmount) > ctrl.limits.max) {
                throw new Error('Maximum amount to pay is ' + ctrl.limits.max + ' ' + ctrl.payCurrency.displayName);
            }
        }
    }

    WavesCardDepositController.$inject = ['$scope', '$window', '$q', 'wallet.events', 'dialogService',
                                          'coinomatFiatService', 'applicationContext', 'notificationService'];

    angular
        .module('app.wallet')
        .controller('cardDepositController', WavesCardDepositController);
})();

(function() {
    'use strict';

    angular.module('app.tokens', ['app.shared']);
})();

(function () {
    'use strict';

    var ASSET_DESCRIPTION_MAX = 1000;
    var ASSET_NAME_MIN = 4;
    var ASSET_NAME_MAX = 16;
    var TOKEN_DECIMALS_MAX = 8;
    var FIXED_ISSUE_FEE = new Money(1, Currency.WAVES);

    function TokenCreateController($scope, $interval, constants, applicationContext, assetService,
                                   dialogService, apiService, notificationService,
                                   formattingService, transactionBroadcast) {
        var refreshPromise;
        var refreshDelay = 15 * 1000;
        var transaction;
        var ctrl = this;

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        ctrl.wavesBalance = new Money(0, Currency.WAVES);
        ctrl.issuanceValidationOptions = {
            rules: {
                assetName: {
                    required: true,
                    minbytelength: ASSET_NAME_MIN,
                    maxbytelength: ASSET_NAME_MAX
                },
                assetDescription: {
                    maxbytelength: ASSET_DESCRIPTION_MAX
                },
                assetTotalTokens: {
                    required: true,
                    min: 0
                },
                assetTokenDecimalPlaces: {
                    required: true,
                    min: 0,
                    max: TOKEN_DECIMALS_MAX
                }
            },
            messages: {
                assetName: {
                    required: 'Asset name is required',
                    minbytelength: 'Asset name is too short. Please give your asset a longer name',
                    maxbytelength: 'Asset name is too long. Please give your asset a shorter name'
                },
                assetDescription: {
                    maxbytelength: 'Maximum length of asset description exceeded. Please make a shorter description'
                },
                assetTotalTokens: {
                    required: 'Total amount of issued tokens in required',
                    min: 'Total issued tokens amount must be greater than or equal to zero'
                },
                assetTokenDecimalPlaces: {
                    required: 'Number of token decimal places is required',
                    min: 'Number of token decimal places must be greater or equal to zero',
                    max: 'Number of token decimal places must be less than or equal to ' + TOKEN_DECIMALS_MAX
                }
            }
        };
        ctrl.asset = {
            fee: FIXED_ISSUE_FEE
        };
        ctrl.confirm = {};
        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.issue,
            function (transaction, response) {
                resetForm();

                applicationContext.cache.putAsset(response);

                var displayMessage = 'Asset ' + ctrl.confirm.name + ' has been issued!<br/>' +
                    'Total tokens amount: ' + ctrl.confirm.totalTokens + '<br/>' +
                    'Date: ' + formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            });
        ctrl.broadcastIssueTransaction = broadcastIssueTransaction;
        ctrl.assetIssueConfirmation = assetIssueConfirmation;
        ctrl.resetForm = resetForm;

        loadDataFromBackend();
        resetForm();

        function assetIssueConfirmation(form, event) {
            event.preventDefault();

            if (!form.validate()) {
                return;
            }

            if (ctrl.asset.fee.greaterThan(ctrl.wavesBalance)) {
                notificationService.error('Not enough funds for the issue transaction fee');
                return;
            }

            var decimalPlaces = Number(ctrl.asset.decimalPlaces);
            var maxTokens = Math.floor(constants.JAVA_MAX_LONG / Math.pow(10, decimalPlaces));
            if (ctrl.asset.totalTokens > maxTokens) {
                notificationService.error('Total issued tokens amount must be less than ' + maxTokens);

                return;
            }

            var asset = {
                name: ctrl.asset.name,
                description: ctrl.asset.description,
                totalTokens: ctrl.asset.totalTokens,
                decimalPlaces: Number(ctrl.asset.decimalPlaces),
                reissuable: ctrl.asset.reissuable,
                fee: ctrl.asset.fee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            ctrl.confirm.name = ctrl.asset.name;
            ctrl.confirm.totalTokens = ctrl.asset.totalTokens;
            ctrl.confirm.reissuable = ctrl.asset.reissuable ? 'RE-ISSUABLE' : 'NON RE-ISSUABLE';

            ctrl.broadcast.setTransaction(assetService.createAssetIssueTransaction(asset, sender));

            dialogService.open('#create-asset-confirmation');
        }

        function broadcastIssueTransaction() {
            ctrl.broadcast.broadcast();
        }

        function resetForm() {
            ctrl.asset.name = '';
            ctrl.asset.description = '';
            ctrl.asset.totalTokens = '0';
            ctrl.asset.decimalPlaces = '0';
            ctrl.asset.reissuable = false;
        }

        function loadDataFromBackend() {
            refreshBalance();

            refreshPromise = $interval(function() {
                refreshBalance();
            }, refreshDelay);
        }

        function refreshBalance() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    ctrl.wavesBalance = Money.fromCoins(response.balance, Currency.WAVES);
                });
        }
    }

    TokenCreateController.$inject = ['$scope', '$interval', 'constants.ui', 'applicationContext',
        'assetService', 'dialogService', 'apiService', 'notificationService',
        'formattingService', 'transactionBroadcast'];

    angular
        .module('app.tokens')
        .controller('tokenCreateController', TokenCreateController);
})();

(function() {
    'use strict';

    angular.module('app.dex', ['app.shared', 'ngSanitize']);
})();

(function () {
    'use strict';

    var POLLING_DELAY = 5000,
        HISTORY_LIMIT = 50;

    function DexController($scope, $interval, applicationContext, assetStoreFactory, datafeedApiService,
                           dexOrderService, dexOrderbookService, notificationService, utilsService, dialogService) {

        var ctrl = this,
            intervalPromise,

            assetStore = assetStoreFactory.createStore(applicationContext.account.address),

            sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

        ctrl.assetsList = [];

        ctrl.pair = {
            amountAsset: Currency.WAVES,
            priceAsset: Currency.MIR
        };

        emptyDataFields();

        var favoritePairs = [
			{ amountAsset: Currency.WAVES, priceAsset: Currency.DEIP },
			{ amountAsset: Currency.WAVES, priceAsset: Currency.LIBRE },
            { amountAsset: Currency.WAVES, priceAsset: Currency.MIR }
        ];

        ctrl.favoritePairs = favoritePairs;

        ctrl.createOrder = function (type, price, amount, fee, callback) {
            // TODO : add a queue for the orders which weren't yet accepted

            function emptyBadOrderFields() {
                ctrl.badOrderQuestion = '';
                ctrl.placeBadOrder = ctrl.refuseBadOrder = function () {};
            }

            var amountName = ctrl.pair.amountAsset.displayName,
                priceName = ctrl.pair.priceAsset.displayName,
                badSellOrder = (type === 'sell' && ctrl.buyOrders.length && price < ctrl.buyOrders[0].price * 0.9),
                badBuyOrder = (type === 'buy' && ctrl.sellOrders.length && price > ctrl.sellOrders[0].price * 1.1);

            if (badSellOrder || badBuyOrder) {

                ctrl.badOrderQuestion = 'Are you sure you want to ' + type + ' ' +
                    amountName + ' at price ' + price + ' ' + priceName + '?';

                ctrl.placeBadOrder = function () {
                    emptyBadOrderFields();
                    ctrl.realCreateOrder(type, price, amount, fee, callback);
                };

                ctrl.refuseBadOrder = function () {
                    emptyBadOrderFields();
                    callback();
                };

                dialogService.open('#dex-bad-order-confirmation');

            } else {
                ctrl.realCreateOrder(type, price, amount, fee, callback);
            }

        };

        ctrl.realCreateOrder = function (type, price, amount, fee, callback) {
            // TODO : add a queue for the orders which weren't yet accepted
            dexOrderService
                .addOrder(ctrl.pair, {
                    orderType: type,
                    amount: Money.fromTokens(amount, ctrl.pair.amountAsset),
                    price: OrderPrice.fromTokens(price, ctrl.pair),
                    fee: Money.fromTokens(fee, Currency.WAVES)
                }, sender)
                .then(function () {
                    refreshOrderbooks();
                    refreshUserOrders();
                    notificationService.notice('Order has been created!');
                    if (callback) {
                        callback();
                    }
                })
                .catch(function (e) {
                    var errorMessage = e.data ? e.data.message : null;
                    notificationService.error(errorMessage || 'Order has not been created!');
                    if (callback) {
                        callback();
                    }
                });
        };

        ctrl.cancelOrder = function (order) {
            // TODO : add a queue for the orders which weren't yet canceled

            // TODO : add different messages for cancel and delete actions
            dexOrderService
                .removeOrder(ctrl.pair, order, sender)
                .then(function () {
                    refreshOrderbooks();
                    refreshUserOrders();
                    notificationService.notice('Order has been canceled!');
                })
                .catch(function (e) {
                    console.log(e);
                    notificationService.error('Order could not be canceled!');
                });
        };

        ctrl.changePair = function (pair) {
            ctrl.pair = pair;
            emptyDataFields();
            refreshAll();
        };

        ctrl.fillBuyForm = fillBuyForm;

        ctrl.fillSellForm = fillSellForm;

        assetStore
            .getAll()
            .then(function (assetsList) {
                ctrl.assetsList = assetsList;
            })
            .then(function () {
                return dexOrderbookService.getOrderbook(ctrl.pair.amountAsset, ctrl.pair.priceAsset);
            })
            .then(function (orderbook) {
                ctrl.pair = {
                    // Here we just get assets by their IDs
                    amountAsset: assetStore.syncGetAsset(orderbook.pair.amountAsset),
                    priceAsset: assetStore.syncGetAsset(orderbook.pair.priceAsset)
                };

                ctrl.buyOrders = orderbook.bids;
                ctrl.sellOrders = orderbook.asks;
                refreshUserOrders();
                refreshTradeHistory();
            })
            .catch(function (e) {
                console.log(e);
            });

        // Events are from asset pickers
        $scope.$on('asset-picked', function (e, newAsset, type) {
            // Define in which widget the asset was changed
            ctrl.pair[type] = newAsset;
            emptyDataFields();
            refreshAll();
        });

        // Enable polling for orderbooks and newly created assets
        intervalPromise = $interval(function () {
            refreshAll();
        }, POLLING_DELAY);

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function emptyDataFields() {
            ctrl.buyOrders = [];
            ctrl.sellOrders = [];
            ctrl.userOrders = [];

            ctrl.buyFormValues = {};
            ctrl.sellFormValues = {};

            ctrl.tradeHistory = [];
            ctrl.lastTradePrice = 0;

            fillBuyForm();
            fillSellForm();

            // That forces children components to react on the pair change
            ctrl.pair = _.clone(ctrl.pair);
        }

        function refreshAll() {
            refreshOrderbooks();
            refreshUserOrders();
            refreshTradeHistory();
        }

        function refreshOrderbooks() {
            if (!ctrl.pair.amountAsset || !ctrl.pair.priceAsset) {
                return;
            }

            dexOrderbookService
                .getOrderbook(ctrl.pair.amountAsset, ctrl.pair.priceAsset)
                .then(function (orderbook) {
                    ctrl.buyOrders = orderbook.bids;
                    ctrl.sellOrders = orderbook.asks;
                    return orderbook.pair;
                })
                .then(function (pair) {
                    // Placing each asset in the right widget
                    if (ctrl.pair.amountAsset.id !== pair.amountAsset && ctrl.pair.priceAsset.id !== pair.priceAsset) {
                        var temp = ctrl.pair.amountAsset;
                        ctrl.pair.amountAsset = ctrl.pair.priceAsset;
                        ctrl.pair.priceAsset = temp;
                    }
                })
                .catch(function (e) {
                    console.log(e);
                });
        }

        function refreshUserOrders() {
            if (!ctrl.pair.amountAsset || !ctrl.pair.priceAsset) {
                return;
            }

            dexOrderService
                .getOrders(ctrl.pair)
                .then(function (orders) {
                    // TODO : add here orders from pending queues
                    ctrl.userOrders = orders;
                });
        }

        function refreshTradeHistory() {
            var pair = ctrl.pair;
            if (pair) {
                if (utilsService.isTestnet()) {
                    pair = utilsService.testnetSubstitutePair(pair);
                }

                datafeedApiService
                    .getTrades(pair, HISTORY_LIMIT)
                    .then(function (response) {
                        ctrl.tradeHistory = response.map(function (trade) {
                            return {
                                timestamp: trade.timestamp,
                                type: trade.type,
                                typeTitle: trade.type === 'buy' ? 'Buy' : 'Sell',
                                price: trade.price,
                                amount: trade.amount,
                                total: trade.price * trade.amount
                            };
                        });

                        ctrl.lastTradePrice = ctrl.tradeHistory[0].price;
                    });
            }
        }

        function fillBuyForm(price, amount, total) {
            ctrl.buyFormValues = {
                price: price,
                amount: amount,
                total: total
            };
        }

        function fillSellForm(price, amount, total) {
            ctrl.sellFormValues = {
                price: price,
                amount: amount,
                total: total
            };
        }
    }

    DexController.$inject = ['$scope', '$interval', 'applicationContext', 'assetStoreFactory', 'datafeedApiService',
        'dexOrderService', 'dexOrderbookService', 'notificationService', 'utilsService', 'dialogService'];

    angular
        .module('app.dex')
        .component('wavesDex', {
            controller: DexController,
            templateUrl: 'dex/component'
        });
})();

(function () {
    'use strict';

    var ASSET_ID_BYTE_LENGTH = 32;

    function AssetPickerController($scope, $element, autocomplete, apiService, utilityService) {
        var ctrl = this,
            autocompleteElement = $element.find('md-autocomplete');

        ctrl.isAssetLoading = false;
        ctrl.isPickingInProgress = false;
        ctrl.autocomplete = autocomplete.create();

        ctrl.$onChanges = function () {
            if (ctrl.assets && ctrl.pickedAsset) {
                if (!ctrl.isPickingInProgress) {
                    ctrl.autocomplete.selectedAsset = ctrl.pickedAsset;
                }

                ctrl.autocomplete.assets = ctrl.assets.map(function (asset) {
                    return asset.currency;
                }).filter(function (asset) {
                    return asset.verified && (asset !== ctrl.hiddenAsset);
                });
            }
        };

        autocompleteElement.on('focusin', function () {
            ctrl.isPickingInProgress = true;
        });

        autocompleteElement.on('focusout', function () {
            ctrl.isPickingInProgress = false;
            ctrl.autocomplete.selectedAsset = ctrl.pickedAsset;
        });

        ctrl.changeAsset = function () {
            var asset = ctrl.autocomplete.selectedAsset;
            if (asset && asset !== ctrl.pickedAsset) {
                ctrl.isPickingInProgress = false;
                $scope.$emit('asset-picked', asset, ctrl.type);
            }
        };

        ctrl.findAssets = function (query) {
            var assets = ctrl.autocomplete.querySearch(query);
            if (assets.length === 0 && isValidAssetId(query)) {
                ctrl.isAssetLoading = true;
                apiService.transactions.info(query).then(function (response) {
                    var currency = Currency.create({
                        id: response.id,
                        displayName: response.name,
                        precision: response.decimals
                    });

                    ctrl.autocomplete.assets.push(currency);
                    ctrl.autocomplete.selectedAsset = currency;

                    // That strangely unfocuses the element thus avoiding an empty dropdown.
                    autocompleteElement.focus();
                }).finally(function () {
                    ctrl.isAssetLoading = false;
                });
                return [];
            } else {
                ctrl.isAssetLoading = false;
                return assets;
            }
        };

        function isValidAssetId(str) {
            if (utilityService.isValidBase58String(str)) {
                return utilityService.base58StringToByteArray(str).length === ASSET_ID_BYTE_LENGTH;
            }
        }
    }

    AssetPickerController.$inject = ['$scope', '$element', 'autocomplete.assets', 'apiService', 'utilityService'];

    angular
        .module('app.dex')
        .component('wavesDexAssetPicker', {
            controller: AssetPickerController,
            bindings: {
                name: '@',
                type: '@',
                assets: '<',
                hiddenAsset: '<',
                pickedAsset: '<'
            },
            templateUrl: 'dex/asset.picker.component'
        });
})();

(function () {
    'use strict';

    var CANDLE_NUMBER = 100,
        CANDLE_FRAME = 30,
        POLLING_DELAY = 5000;

    function isCandleEmpty(c) {
        return +c.open === 0 && +c.high === 0 && +c.low === 0 && +c.close === 0 && +c.vwap === 0;
    }

    function adjustCandles(candles) {

        var i = candles.length;
        while (isCandleEmpty(candles[--i])) {}

        var fix = candles[i].open;
        while (++i < candles.length) {
            candles[i].open = candles[i].high = candles[i].low = candles[i].close = candles[i].vwap = fix;
        }

        return candles;

    }

    function ChartController($element, $interval, datafeedApiService, utilsService, chartsFactory) {
        var ctrl = this,
            intervalPromise;

        setTimeout(function () {
            // That instantiation is placed here because of the synchronous width resolving issue.
            ctrl.chart = chartsFactory.create('candlestick', $element);
            refreshCandles();
        }, 100);

        intervalPromise = $interval(refreshCandles, POLLING_DELAY);

        ctrl.$onChanges = function (changes) {
            if (ctrl.chart && changes.pair) {
                ctrl.chart.clear();
                refreshCandles();
            }
        };

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function refreshCandles() {
            var pair = ctrl.pair;
            if (pair) {
                if (utilsService.isTestnet()) {
                    pair = utilsService.testnetSubstitutePair(pair);
                }

                datafeedApiService
                    .getLastCandles(pair, CANDLE_NUMBER, CANDLE_FRAME)
                    .then(function (response) {
                        response = adjustCandles(response);
                        ctrl.chart.draw(response);
                    });
            }
        }
    }

    ChartController.$inject = ['$element', '$interval', 'datafeedApiService', 'utilsService', 'chartsFactory'];

    angular
        .module('app.dex')
        .component('wavesDexChart', {
            controller: ChartController,
            bindings: {
                pair: '<'
            },
            templateUrl: 'dex/chart.component'
        });
})();

(function () {
    'use strict';

    angular
        .module('app.dex')
        .factory('chartsFactory', [function () {
            function CandlestickChart($element) {
                var w = $element.width(),
                    h = $element.height(),
                    elem = $element.children('.chart').get(0),
                    margins = {left: 60, top: 20, right: 60, bottom: 30};

                this.width = w - margins.left - margins.right;
                this.height = h - margins.top - margins.bottom;

                this.x = techan.scale.financetime().range([0, this.width]);
                this.y = d3.scaleLinear().range([this.height, 0]);
                this.yVolume = d3.scaleLinear().range([this.y(0), this.y(0.2)]);

                this.candlestick = techan.plot.candlestick().xScale(this.x).yScale(this.y);
                this.accessor = this.candlestick.accessor();
                this.volume = techan.plot.volume()
                    .accessor(this.accessor)
                    .xScale(this.x)
                    .yScale(this.yVolume);

                this.xAxis = d3.axisBottom(this.x);
                this.yAxis = d3.axisLeft(this.y);
                this.yAxisRight = d3.axisRight(this.y);
                this.volumeAxis = d3.axisRight(this.yVolume).ticks(2).tickFormat(d3.format(',.3s'));

                this.svg = d3
                    .select(elem)
                    .append('svg')
                    .attr('width', this.width + margins.left + margins.right)
                    .attr('height', this.height + margins.top + margins.bottom);

                this.chart = this.svg
                    .append('g')
                    .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');

                this.chart.append('g')
                    .attr('class', 'candlestick');

                this.chart.append('g')
                    .attr('class', 'volume');

                this.chart.append('g')
                    .attr('class', 'x axis')
                    .attr('transform', 'translate(0,' + this.height + ')');

                this.chart.append('g')
                    .attr('class', 'y axis');

                this.chart.append('g')
                    .attr('class', 'y axis-right')
                    .attr('transform', 'translate(' + this.width + ',0)');

                this.chart.append('g')
                    .attr('class', 'volume axis');

                this.chart.append('text')
                    .attr('class', 'note')
                    .attr('transform', 'translate(' + (this.width - 250) + ',10)')
                    .text('Candles cover 30 minute intervals');

                this.chart.append('text')
                    .attr('class', 'ticker')
                    .attr('transform', 'translate(' + (this.width - 250) + ',30)');
            }

            CandlestickChart.prototype.clear = function () {
                this.draw([]);
            };

            CandlestickChart.prototype.draw = function (data) {
                data = this.prepareData(data);

                this.x.domain(data.map(this.accessor.d));
                this.y.domain(techan.scale.plot.ohlc(data, this.accessor).domain());
                this.yVolume.domain(techan.scale.plot.volume(data).domain());

                this.chart.selectAll('g.candlestick').datum(data).call(this.candlestick);
                this.chart.selectAll('g.volume').datum(data).call(this.volume);
                this.chart.selectAll('g.x.axis').call(this.xAxis);
                this.chart.selectAll('g.y.axis').call(this.yAxis);
                this.chart.selectAll('g.y.axis-right').call(this.yAxisRight);
                this.chart.selectAll('g.volume.axis').call(this.volumeAxis);

                var now = new Date(),
                    hh = now.getHours(),
                    mm = now.getMinutes(),
                    ss = now.getSeconds();
                hh = hh < 10 ? '0' + hh : hh;
                mm = mm < 10 ? '0' + mm : mm;
                ss = ss < 10 ? '0' + ss : ss;
                this.chart.selectAll('text.ticker').text('Last updated: ' + hh + ':' + mm + ':' + ss);
            };

            CandlestickChart.prototype.prepareData = function (rawData) {
                var self = this,
                    lastTradePrice = 0;
                return rawData.map(function (candle) {
                    var adjustedHigh = Math.min(+candle.high, +candle.vwap * 1.5),
                        adjustedLow = Math.max(+candle.low, +candle.vwap / 2);

                    return {
                        date: candle.timestamp,
                        open: +candle.open,
                        high: adjustedHigh,
                        low: adjustedLow,
                        close: +candle.close,
                        volume: +candle.volume
                    };
                }).sort(function (a, b) {
                    return d3.ascending(self.accessor.d(a), self.accessor.d(b));
                }).map(function (c) {
                    if (c.open === 0 && c.high === 0 && c.low === 0 && c.close === 0) {
                        c.open = c.high = c.low = c.close = lastTradePrice;
                    } else {
                        lastTradePrice = c.close;
                    }

                    return c;
                });
            };

            return {
                create: function (type, $element) {
                    if (type === 'candlestick') {
                        return new CandlestickChart($element);
                    }
                }
            };
        }]);
})();

(function () {
    'use strict';

    function FavoritesController() {
        var ctrl = this;

        ctrl.onClick = function (pair) {
            ctrl.switchPair({
                amountAsset: pair.amountAsset,
                priceAsset: pair.priceAsset
            });
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexFavorites', {
            controller: FavoritesController,
            bindings: {
                pairs: '<',
                switchPair: '<'
            },
            templateUrl: 'dex/favorites.component'
        });
})();

(function () {
    'use strict';

    function HistoryController() {}

    angular
        .module('app.dex')
        .component('wavesDexHistory', {
            controller: HistoryController,
            bindings: {
                pair: '<',
                trades: '<'
            },
            templateUrl: 'dex/history.component'
        });
})();

(function () {
    'use strict';

    var FEE = 0.003,
        BALANCE_UPDATE_DELAY = 5000;

    function OrderCreatorController($interval, applicationContext, matcherApiService) {

        var ctrl = this,
            intervalPromise;

        ctrl.buy = {
            price: '',
            amount: '',
            total: '',
            fee: FEE,
            blocked: false
        };

        ctrl.sell = {
            price: '',
            amount: '',
            total: '',
            fee: FEE,
            blocked: false
        };

        ctrl.submitBuyOrder = function () {
            if (!ctrl.buy.amount || !ctrl.buy.price) {
                return;
            }

            ctrl.buy.blocked = true;
            ctrl.submit('buy', ctrl.buy.price, ctrl.buy.amount, FEE, function () {
                ctrl.buy.blocked = false;
                refreshBalances();
            });
        };

        ctrl.submitSellOrder = function () {
            if (!ctrl.sell.amount || !ctrl.sell.price) {
                return;
            }

            ctrl.sell.blocked = true;
            ctrl.submit('sell', ctrl.sell.price, ctrl.sell.amount, FEE, function () {
                ctrl.sell.blocked = false;
                refreshBalances();
            });
        };

        // Those two methods are called to update `total` after user's input:

        ctrl.updateBuyTotal = function () {
            ctrl.buy.total = ctrl.buy.price * ctrl.buy.amount || '';
        };

        ctrl.updateSellTotal = function () {
            ctrl.sell.total = ctrl.sell.price * ctrl.sell.amount || '';
        };

        // Those two methods calculate the amount as current balance divided by last history price:

        ctrl.buyFullBalance = function () {
            var price = ctrl.buy.price || ctrl.lastPrice,
                balance = ctrl.priceAssetBalance.toTokens();

            if (price && balance) {
                ctrl.buy.price = price;
                ctrl.buy.amount = Money.fromTokens(balance / price, ctrl.pair.amountAsset).toTokens();
                ctrl.updateBuyTotal();
            }
        };

        ctrl.sellFullBalance = function () {
            var price = ctrl.sell.price || ctrl.lastPrice,
                balance = ctrl.amountAssetBalance.toTokens();

            if (price && balance) {
                ctrl.sell.price = price;
                ctrl.sell.amount = balance;
                ctrl.updateSellTotal();
            }
        };

        intervalPromise = $interval(refreshBalances, BALANCE_UPDATE_DELAY);

        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        ctrl.$onChanges = function (changes) {
            refreshBalances();

            // Those lines write directly to the `total` field when it's calculated in an orderbook:

            if (changes.outerBuyValues) {
                ctrl.buy.price = ctrl.outerBuyValues.price || '';
                ctrl.buy.amount = ctrl.outerBuyValues.amount || '';
                ctrl.buy.total = ctrl.outerBuyValues.total || ctrl.buy.price * ctrl.buy.amount || '';
            }

            if (changes.outerSellValues) {
                ctrl.sell.price = ctrl.outerSellValues.price || '';
                ctrl.sell.amount = ctrl.outerSellValues.amount || '';
                ctrl.sell.total = ctrl.outerSellValues.total || ctrl.sell.price * ctrl.sell.amount || '';
            }
        };

        function refreshBalances() {
            var amountAsset = ctrl.pair.amountAsset,
                priceAsset = ctrl.pair.priceAsset;

            matcherApiService
                .getTradableBalance(amountAsset.id, priceAsset.id, applicationContext.account.address)
                .then(function (data) {
                    ctrl.amountAssetBalance = Money.fromCoins(data[amountAsset.id], amountAsset);
                    ctrl.priceAssetBalance = Money.fromCoins(data[priceAsset.id], priceAsset);
                });
        }
    }

    OrderCreatorController.$inject = ['$interval', 'applicationContext', 'matcherApiService'];

    angular
        .module('app.dex')
        .component('wavesDexOrderCreator', {
            controller: OrderCreatorController,
            bindings: {
                pair: '<',
                submit: '<',
                lastPrice: '<',
                outerBuyValues: '<buyValues',
                outerSellValues: '<sellValues'
            },
            templateUrl: 'dex/order.creator.component'
        });
})();

(function () {
    'use strict';

    var ACCEPTED = 'Accepted',
        PARTIALLY = 'PartiallyFilled',
        FILLED = 'Filled',
        CANCELLED = 'Cancelled',
        NOT_FOUND = 'NotFound',

        ORDER_CANCELED = 'OrderCanceled',
        ORDER_DELETED = 'OrderDeleted';

    function DexOrderService(matcherRequestService, matcherApiService, applicationContext) {

        // TODO : clean that all from the state.

        this.addOrder = function (pair, order, sender) {
            return matcherApiService
                .loadMatcherKey()
                .then(function (matcherKey) {
                    order.matcherKey = matcherKey;
                    var signedRequest = matcherRequestService.buildCreateOrderRequest(order, sender);
                    return matcherApiService.createOrder(signedRequest);
                }).catch(function (e) {
                    throw new Error(e);
                });
        };

        this.removeOrder = function (pair, order, sender) {
            var signedRequest = matcherRequestService.buildCancelOrderRequest(order.id, sender);
            if (order.status === ACCEPTED || order.status === PARTIALLY) {
                return matcherApiService
                    .cancelOrder(pair.amountAsset.id, pair.priceAsset.id, signedRequest)
                    .then(function (response) {
                        if (response.status !== ORDER_CANCELED) {
                            throw new Error();
                        }
                    }).catch(function (e) {
                        throw new Error(e);
                    });
            } else if (order.status === FILLED || order.status === CANCELLED) {
                return matcherApiService
                    .deleteOrder(pair.amountAsset.id, pair.priceAsset.id, signedRequest)
                    .then(function (response) {
                        if (response.status !== ORDER_DELETED) {
                            throw new Error();
                        }
                    }).catch(function (e) {
                        throw new Error(e);
                    });
            }
        };

        this.getOrders = function (pair) {
            return matcherApiService
                .loadUserOrders(pair.amountAsset.id, pair.priceAsset.id, {
                    publicKey: applicationContext.account.keyPair.public,
                    privateKey: applicationContext.account.keyPair.private
                })
                .then(function (response) {
                    return response.map(function (o) {
                        if (o.amount === null || o.price === null || o.filled === null || o.timestamp === null) {
                            console.error('Bad order!', o);
                            o.amount = o.amount || 0;
                            o.price = o.price || 0;
                            o.filled = o.filled || 0;
                            o.timestamp = o.timestamp || 0;
                        }

                        var orderPrice = OrderPrice.fromBackendPrice(o.price, pair).toTokens();

                        return {
                            id: o.id,
                            type: o.type,
                            price: Money.fromTokens(orderPrice, pair.priceAsset),
                            amount: Money.fromCoins(o.amount, pair.amountAsset),
                            filled: Money.fromCoins(o.filled, pair.amountAsset),
                            status: o.status || NOT_FOUND,
                            timestamp: o.timestamp
                        };
                    });
                })
                .catch(function (e) {
                    throw new Error(e);
                });
        };
    }

    DexOrderService.$inject = ['matcherRequestService', 'matcherApiService', 'applicationContext'];

    angular
        .module('app.dex')
        .service('dexOrderService', DexOrderService);
})();

(function () {
    'use strict';

    function denormalizeOrders(orders) {
        if (!orders || !orders.length) {
            return [];
        }

        var currentSum = 0;
        return orders.map(function (order) {
            var total = order.price * order.amount;
            currentSum += total;
            return {
                id: order.id,
                price: order.price,
                amount: order.amount,
                total: total,
                sum: currentSum
            };
        });
    }

    function calculateStringLength(n, precision) {
        // Get initial string length with a given precision.
        var len = n.toFixed(precision).length;
        // Add some length for commas (e.g. 10,000,000.0000).
        return len + Math.floor(n.toFixed(0).length / 3);
    }

    function getMaxLengths(orders, pair) {
        var price = 0,
            amount = 0,
            total = 0,
            sum = 0;

        // Get max value for each column.
        orders.forEach(function (order) {
            if (order.price > price) {
                price = order.price;
            }
            if (order.amount > amount) {
                amount = order.amount;
            }
            if (order.total > total) {
                total = order.total;
            }
            if (order.sum > sum) {
                sum = order.sum;
            }
        });

        return {
            price: calculateStringLength(price, pair.priceAsset.precision),
            amount: calculateStringLength(amount, pair.amountAsset.precision),
            total: calculateStringLength(total, pair.priceAsset.precision),
            sum: calculateStringLength(sum, pair.priceAsset.precision)
        };
    }

    function OrderbookController() {
        var ctrl = this;

        ctrl.lineClick = function (index) {
            var order = ctrl.orders[index],
                cumulativeAmount = ctrl.orders.slice(0, index + 1).reduce(function (amountSum, order) {
                    return amountSum + order.amount;
                }, 0);

            ctrl.onClick(Number(order.price).toFixed(8), cumulativeAmount, order.sum);
        };

        ctrl.$onChanges = function (changes) {
            if (!changes.rawOrders) {
                return;
            }

            var denormPreviousValue = denormalizeOrders(changes.rawOrders.previousValue),
                denormCurrentValue = denormalizeOrders(changes.rawOrders.currentValue);

            if (!_.isEqual(denormPreviousValue, denormCurrentValue)) {
                ctrl.orders = denormCurrentValue;
                ctrl.lengths = getMaxLengths(ctrl.orders, ctrl.pair);
            }
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexOrderbook', {
            controller: OrderbookController,
            bindings: {
                type: '@',
                name: '@',
                pair: '<',
                onClick: '<',
                rawOrders: '<orders'
            },
            templateUrl: 'dex/orderbook.component'
        });
})();

(function () {
    'use strict';

    function normalizeOrder(order, pair) {
        return {
            price: OrderPrice.fromBackendPrice(order.price, pair).toTokens(),
            amount: Money.fromCoins(order.amount, pair.amountAsset).toTokens()
        };
    }

    function DexOrderbookService(matcherApiService) {
        this.getOrderbook = function (assetOne, assetTwo) {
            var assets = {};
            assets[assetOne.id] = assetOne;
            assets[assetTwo.id] = assetTwo;
            return matcherApiService
                .loadOrderbook(assetOne.id, assetTwo.id)
                .then(function (orderbook) {
                    var pair = {
                        amountAsset: assets[orderbook.pair.amountAsset],
                        priceAsset: assets[orderbook.pair.priceAsset]
                    };

                    return {
                        timestamp: orderbook.timestamp,
                        pair: orderbook.pair,
                        bids: orderbook.bids.map(function (order) {
                            return normalizeOrder(order, pair);
                        }),
                        asks: orderbook.asks.map(function (order) {
                            return normalizeOrder(order, pair);
                        })
                    };
                });
        };
    }

    DexOrderbookService.$inject = ['matcherApiService'];

    angular
        .module('app.dex')
        .service('dexOrderbookService', DexOrderbookService);
})();

(function () {
    'use strict';

    var statuses = {
        'PartiallyFilled': {
            title: 'Partial',
            order: 2
        },
        'Accepted': {
            title: 'Opened',
            order: 4
        },
        'Filled': {
            title: 'Closed',
            order: 6
        },
        'Cancelled': {
            title: 'Canceled',
            order: 8
        },
        'NotFound': {
            title: 'NotFound',
            order: 10
        }
    };

    var types = {
        'buy': {
            title: 'Buy',
            order: 0
        },
        'sell': {
            title: 'Sell',
            order: 1
        }
    };

    function status(s) {
        return statuses[s] ? statuses[s].title : '---';
    }

    function type(t) {
        return types[t] ? types[t].title : '---';
    }

    function denormalizeUserOrders(orders) {
        if (!orders || !orders.length) {
            return [];
        }

        return orders.map(function (order) {
            var price = order.price.toTokens(),
                amount = order.amount.toTokens(),
                filled = order.filled.toTokens();

            return {
                id: order.id,
                status: order.status,
                statusTitle: status(order.status),
                type: order.type,
                typeTitle: type(order.type),
                price: price,
                amount: amount,
                total: price * amount,
                filled: filled,
                timestamp: order.timestamp
            };
        });
    }

    function sortUserOrders(orders) {
        return orders.sort(function (a, b) {
            var aVal = statuses[a.status].order + types[a.type].order,
                bVal = statuses[b.status].order + types[b.type].order;
            return aVal - bVal;
        });
    }

    function UserOrdersController() {
        var ctrl = this;

        ctrl.cancel = function (obj) {
            ctrl.cancelOrder(obj.order);
        };

        ctrl.$onChanges = function (changes) {
            if (!changes.rawOrders) {
                return;
            }

            var denormPreviousValue = denormalizeUserOrders(changes.rawOrders.previousValue),
                denormCurrentValue = denormalizeUserOrders(changes.rawOrders.currentValue);

            if (!_.isEqual(denormPreviousValue, denormCurrentValue)) {
                ctrl.orders = sortUserOrders(denormCurrentValue);
            }
        };
    }

    angular
        .module('app.dex')
        .component('wavesDexUserOrders', {
            controller: UserOrdersController,
            bindings: {
                pair: '<',
                rawOrders: '<orders',
                cancelOrder: '<'
            },
            templateUrl: 'dex/user.orders.component'
        });
})();

(function() {
    'use strict';

    angular.module('app.leasing', ['app.shared']);
})();

(function () {
    'use strict';

    var DEFAULT_CURRENCY = Currency.WAVES;

    function WavesLeasingService (apiService) {
        function parseBalance(response) {
            return Money.fromCoins(response.balance, DEFAULT_CURRENCY);
        }

        this.loadBalanceDetails = function (address) {
            var details = {};
            return apiService.address.balance(address)
                .then(function (response) {
                    details.regular = parseBalance(response);

                    return apiService.address.effectiveBalance(address);
                })
                .then(function (response) {
                    details.effective = parseBalance(response);

                    return apiService.address.generatingBalance(address);
                })
                .then(function (response) {
                    details.generating = parseBalance(response);

                    return details;
                });
        };
    }

    WavesLeasingService.$inject = ['apiService'];

    angular
        .module('app.leasing')
        .service('leasingService', WavesLeasingService);
})();

(function () {
    'use strict';

    var POLLING_DELAY = 5000,
        DEFAULT_ERROR_MESSAGE = 'Failed to load balance details';

    function LeasingController($interval, constants, applicationContext,
                               leasingService, transactionLoadingService, notificationService) {
        var ctrl = this,
            intervalPromise;

        ctrl.transactions = [];
        ctrl.limitTo = 1000;
        ctrl.balanceDetails = null;

        refreshAll();
        intervalPromise = $interval(refreshAll, POLLING_DELAY);
        ctrl.$onDestroy = function () {
            $interval.cancel(intervalPromise);
        };

        function refreshAll() {
            refreshBalanceDetails();
            refreshLeasingTransactions();
        }

        function refreshBalanceDetails() {
            leasingService
                .loadBalanceDetails(applicationContext.account.address)
                .then(function (balanceDetails) {
                    ctrl.balanceDetails = balanceDetails;
                }).catch(function (e) {
                    if (e) {
                        if (e.data) {
                            notificationService.error(e.data.message);
                        } else if (e.message) {
                            notificationService.error(e.message);
                        } else if (e.statusText) {
                            notificationService.error(e.statusText);
                        } else {
                            notificationService.error(DEFAULT_ERROR_MESSAGE);
                        }
                    } else {
                        notificationService.error(DEFAULT_ERROR_MESSAGE);
                    }
                });
        }

        function refreshLeasingTransactions() {
            transactionLoadingService
                .loadTransactions(applicationContext.account, ctrl.limitTo)
                .then(function (transactions) {
                    ctrl.transactions = transactions.filter(function (tx) {
                        var startLeasing = constants.START_LEASING_TRANSACTION_TYPE,
                            cancelLeasing = constants.CANCEL_LEASING_TRANSACTION_TYPE;
                        return tx.type === startLeasing || tx.type === cancelLeasing;
                    });
                });
        }
    }

    LeasingController.$inject = ['$interval', 'constants.transactions', 'applicationContext',
                                 'leasingService', 'transactionLoadingService', 'notificationService'];

    angular
        .module('app.leasing')
        .component('wavesLeasing', {
            controller: LeasingController,
            templateUrl: 'leasing/component'
        });
})();

(function () {
    'use strict';

    var FEE_CURRENCY = Currency.WAVES;

    function LeasingFormController($timeout, constants, applicationContext,
                                   apiService, dialogService, notificationService, transactionBroadcast,
                                   formattingService, addressService, leasingService, leasingRequestService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.fee = minimumFee;
        ctrl.availableBalance = Money.fromCoins(0, Currency.WAVES);

        ctrl.broadcast = new transactionBroadcast.instance(apiService.leasing.lease,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, Currency.WAVES);
                var address = transaction.recipient;
                var displayMessage = 'Leased ' + amount.formatAmount(true) + ' of ' +
                    amount.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.validationOptions = {
            rules: {
                leasingRecipient: {
                    required: true
                },
                leasingAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0, // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                }
            },
            messages: {
                leasingRecipient: {
                    required: 'Recipient account number is required'
                },
                leasingAmount: {
                    required: 'Amount to lease is required'
                }
            }
        };

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.confirmLease = confirmLease;
        ctrl.broadcastTransaction = broadcastTransaction;

        reset();

        leasingService
            .loadBalanceDetails(applicationContext.account.address)
            .then(function (balanceDetails) {
                //FIXME: add here a correct value available to lease
                ctrl.availableBalance = balanceDetails.effective;

                reset();

                // Update validation options and check how they affect form validation
                ctrl.validationOptions.rules.leasingAmount.decimal = ctrl.availableBalance.currency.precision;
                var minimumPayment = Money.fromCoins(1, ctrl.availableBalance.currency);
                ctrl.validationOptions.rules.leasingAmount.min = minimumPayment.toTokens();
                ctrl.validationOptions.rules.leasingAmount.max = ctrl.availableBalance.toTokens();
                ctrl.validationOptions.messages.leasingAmount.decimal = 'The amount to leasing must be a number ' +
                    'with no more than ' + minimumPayment.currency.precision +
                    ' digits after the decimal point (.)';
                ctrl.validationOptions.messages.leasingAmount.min = 'Leasing amount is too small. ' +
                    'It should be greater or equal to ' + minimumPayment.formatAmount(false);
                ctrl.validationOptions.messages.leasingAmount.max = 'Leasing amount is too big. ' +
                    'It should be less or equal to ' + ctrl.availableBalance.formatAmount(false);
            });

        function confirmLease(form) {
            if (!form.validate(ctrl.validationOptions)) {
                return false;
            }

            var amount = Money.fromTokens(ctrl.amount, ctrl.availableBalance.currency);
            var transferFee = ctrl.fee;

            // We assume here that amount and fee are in Waves, however it's not hardcoded
            var leasingCost = amount.plus(transferFee);
            if (leasingCost.greaterThan(ctrl.availableBalance)) {
                notificationService.error('Not enough ' + FEE_CURRENCY.displayName + ' for the leasing transaction');
                return false;
            }

            var startLeasing = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: amount,
                fee: transferFee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create a transaction and wait for confirmation
            ctrl.broadcast.setTransaction(leasingRequestService.buildStartLeasingRequest(startLeasing, sender));

            // Set data to the confirmation dialog
            ctrl.confirm.amount = startLeasing.amount;
            ctrl.confirm.fee = startLeasing.fee;
            ctrl.confirm.recipient = startLeasing.recipient;

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#start-leasing-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function reset() {
            ctrl.amount = '0';
            ctrl.recipient = '';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = minimumFee;
        }
    }

    LeasingFormController.$inject = ['$timeout', 'constants.ui', 'applicationContext',
                                     'apiService', 'dialogService', 'notificationService', 'transactionBroadcast',
                                     'formattingService', 'addressService', 'leasingService', 'leasingRequestService'];

    angular
        .module('app.leasing')
        .component('wavesLeasingLeaseForm', {
            controller: LeasingFormController,
            templateUrl: 'leasing/lease.form.component'
        });
})();

(function () {
    'use strict';

    function WavesBalanceDetailsController () {
        var ctrl = this;

        ctrl.formattedBalance = {};

        ctrl.$onChanges = function () {
            if (ctrl.balanceDetails) {
                ctrl.formattedBalance = {
                    regular: formatMoney(ctrl.balanceDetails.regular),
                    effective: formatMoney(ctrl.balanceDetails.effective),
                    generating: formatMoney(ctrl.balanceDetails.generating)
                };
            }
        };

        function formatMoney(amount) {
            return amount.formatAmount(true) + ' ' + amount.currency.shortName;
        }
    }

    angular
        .module('app.leasing')
        .component('wavesLeasingBalanceDetails', {
            controller: WavesBalanceDetailsController,
            bindings: {
                balanceDetails: '<'
            },
            templateUrl: 'leasing/balance.details.component'
        });
})();

(function() {
    'use strict';

    angular.module('app.history', ['app.shared']);
})();

(function () {
    'use strict';

    var TRANSACTIONS_TO_LOAD = 200;

    function HistoryController($scope, $interval, applicationContext, transactionLoadingService) {
        var history = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        history.transactions = [];

        refreshTransactions();

        refreshPromise = $interval(refreshTransactions, refreshDelay);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function refreshTransactions() {
            var txArray;
            transactionLoadingService.loadTransactions(applicationContext.account, TRANSACTIONS_TO_LOAD)
                .then(function (transactions) {
                    txArray = transactions;

                    return transactionLoadingService.refreshAssetCache(applicationContext.cache, transactions);
                })
                .then(function () {
                    history.transactions = txArray;
                });
        }
    }

    HistoryController.$inject = ['$scope', '$interval', 'applicationContext', 'transactionLoadingService'];

    angular
        .module('app.history')
        .controller('historyController', HistoryController);
})();

(function() {
    'use strict';

    angular.module('app.community', ['app.shared']);
})();

(function () {
    'use strict';

    function CommunityController($scope, $interval, apiService, applicationContext) {
        var community = this;
        var refreshPromise;
        var REFRESH_DELAY = 10 * 1000;
        var BLOCKS_DEPTH = 50;

        community.candidate = {
            block: 0,
            size: 0
        };
        community.blocks = [];

        refreshData();

        refreshPromise = $interval(refreshData, REFRESH_DELAY);

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function refreshData() {
            var blockHeight = applicationContext.blockHeight;

            var endBlock = blockHeight;
            var startBlock = Math.max(1, endBlock - BLOCKS_DEPTH);
            apiService.transactions.unconfirmed()
                .then(function (response) {
                    community.candidate.block = blockHeight + 1;
                    community.candidate.size = response.length;

                    return apiService.blocks.list(startBlock, endBlock);
                })
                .then(function (response) {
                    community.blocks = response;
                });
        }
    }

    CommunityController.$inject = ['$scope', '$interval', 'apiService', 'applicationContext'];

    angular
        .module('app.community')
        .controller('communityController', CommunityController);
})();

(function() {
    'use strict';

    angular.module('app.portfolio', ['app.shared'])
        .constant('portfolio.events', {
            ASSET_TRANSFER: 'asset-transfer',
            ASSET_REISSUE: 'asset-reissue',
            ASSET_DETAILS: 'asset-details',
            ASSET_MASSPAY: 'asset-masspay'
        });
})();

(function () {
    'use strict';

    function WavesAssetListController($scope, $timeout, $interval, events,
                                      applicationContext, apiService, formattingService) {
        var ctrl = this;
        var refreshPromise;
        var refreshDelay = 10 * 1000;

        ctrl.wavesBalance = new Money(0, Currency.WAVES);
        ctrl.assets = [];
        ctrl.noData = true;
        ctrl.assetTransfer = assetTransfer;
        ctrl.assetDetails = assetDetails;
        ctrl.assetReissue = assetReissue;
        ctrl.assetMassPay = assetMassPay;
        loadDataFromBackend();

        $scope.$on('$destroy', function () {
            if (angular.isDefined(refreshPromise)) {
                $interval.cancel(refreshPromise);
                refreshPromise = undefined;
            }
        });

        function loadDataFromBackend() {
            refreshAssets();
            refreshBalance();

            refreshPromise = $interval(function() {
                refreshAssets();
                refreshBalance();
            }, refreshDelay);
        }

        function assetTransfer(assetId) {
            $scope.$broadcast(events.ASSET_TRANSFER, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function assetDetails(assetId) {
            $scope.$broadcast(events.ASSET_DETAILS, assetId);
        }

        function assetReissue(assetId) {
            $scope.$broadcast(events.ASSET_REISSUE, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function assetMassPay(assetId) {
            $scope.$broadcast(events.ASSET_MASSPAY, {
                assetId: assetId,
                wavesBalance: ctrl.wavesBalance
            });
        }

        function loadAssetDataFromCache(asset) {
            var cached = applicationContext.cache.assets[asset.id];
            asset.balance = cached.balance;
            asset.name = cached.currency.displayName;
            asset.total = cached.totalTokens.formatAmount();
            asset.timestamp = formattingService.formatTimestamp(cached.timestamp);
            asset.reissuable = cached.reissuable;
            asset.sender = cached.sender;
        }

        function refreshBalance() {
            apiService.address.balance(applicationContext.account.address)
                .then(function (response) {
                    ctrl.wavesBalance = Money.fromCoins(response.balance, Currency.WAVES);
                });
        }

        function refreshAssets() {
            var assets = [];
            apiService.assets.balance(applicationContext.account.address).then(function (response) {
                _.forEach(response.balances, function (assetBalance) {
                    var id = assetBalance.assetId;
                    var asset = {
                        id: id,
                        name: ''
                    };

                    // adding asset details to cache
                    applicationContext.cache.putAsset(assetBalance.issueTransaction);
                    applicationContext.cache.updateAsset(id, assetBalance.balance,
                        assetBalance.reissuable, assetBalance.quantity);

                    // adding an asset with positive balance only or your reissuable assets
                    var yourReissuableAsset = assetBalance.reissuable &&
                        assetBalance.issueTransaction.sender === applicationContext.account.address;
                    if (assetBalance.balance !== 0 || yourReissuableAsset) {
                        loadAssetDataFromCache(asset);
                        assets.push(asset);
                    }
                });

                var delay = 1;
                // handling the situation when some assets appeared on the account
                if (ctrl.assets.length === 0 && assets.length > 0) {
                    ctrl.noData = false;
                    delay = 500; // waiting for 0.5 sec on first data loading attempt
                }

                // handling the situation when all assets were transferred from the account
                if (ctrl.assets.length > 0 && assets.length === 0) {
                    ctrl.noData = true;
                    delay = 500;
                }

                // to prevent no data message and asset list from displaying simultaneously
                // we need to update
                $timeout(function() {
                    ctrl.assets = assets.sort(function (a, b) {
                        var aVerified = (a.balance.currency.verified === true) ? '1:' : '0:',
                            bVerified = (b.balance.currency.verified === true) ? '1:' : '0:';

                        // The verified assets go first, then we sort them by timestamp
                        aVerified += new Date(a.timestamp).getTime();
                        bVerified += new Date(b.timestamp).getTime();

                        return (bVerified > aVerified) ? 1 : -1;
                    });
                }, delay);
            });
        }
    }

    WavesAssetListController.$inject = ['$scope', '$timeout', '$interval', 'portfolio.events',
        'applicationContext', 'apiService', 'formattingService'];

    angular
        .module('app.portfolio')
        .controller('assetListController', WavesAssetListController);
})();

(function () {
    'use strict';

    var FEE_CURRENCY = Currency.WAVES;

    function AssetTransferController($scope, $timeout, constants, events, autocomplete, applicationContext,
                                     assetService, apiService, dialogService, formattingService,
                                     notificationService, transactionBroadcast, addressService) {
        var ctrl = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);

        ctrl.availableBalance = 0;
        ctrl.feeAssetBalance = 0;

        ctrl.confirm = {
            recipient: ''
        };

        ctrl.broadcast = new transactionBroadcast.instance(apiService.assets.transfer,
            function (transaction) {
                var amount = Money.fromCoins(transaction.amount, ctrl.asset.currency);
                var address = transaction.recipient;
                var displayMessage = 'Sent ' + amount.formatAmount(true) + ' of ' +
                    ctrl.asset.currency.displayName +
                    '<br/>Recipient ' + address.substr(0,15) + '...<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            }
        );

        ctrl.autocomplete = autocomplete;

        ctrl.validationOptions = {
            rules: {
                assetRecipient: {
                    required: true
                },
                assetAmount: {
                    required: true,
                    decimal: 8, // stub value updated on validation
                    min: 0,     // stub value updated on validation
                    max: constants.JAVA_MAX_LONG // stub value updated on validation
                },
                assetFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                },
                assetAttachment: {
                    maxbytelength: constants.MAXIMUM_ATTACHMENT_BYTE_SIZE
                }
            },
            messages: {
                assetRecipient: {
                    required: 'Recipient account number is required'
                },
                assetAmount: {
                    required: 'Amount to send is required'
                },
                assetFee: {
                    required: 'Transaction fee is required',
                    decimal: 'Transaction fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Transaction fee is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                },
                maxbytelength: {
                    maxbytelength: 'Attachment is too long'
                }
            }
        };

        ctrl.submitTransfer = submitTransfer;
        ctrl.broadcastTransaction = broadcastTransaction;

        resetPaymentForm();

        $scope.$on(events.ASSET_TRANSFER, function (event, eventData) {
            var asset = applicationContext.cache.assets[eventData.assetId];
            ctrl.availableBalance = asset.balance;
            ctrl.feeAssetBalance = eventData.wavesBalance;
            ctrl.asset = asset;

            resetPaymentForm();

            // Update validation options and check how they affect form validation
            ctrl.validationOptions.rules.assetAmount.decimal = asset.currency.precision;
            var minimumPayment = Money.fromCoins(1, asset.currency);
            ctrl.validationOptions.rules.assetAmount.min = minimumPayment.toTokens();
            ctrl.validationOptions.rules.assetAmount.max = ctrl.availableBalance.toTokens();
            ctrl.validationOptions.messages.assetAmount.decimal = 'The amount to send must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            ctrl.validationOptions.messages.assetAmount.min = 'Payment amount is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            ctrl.validationOptions.messages.assetAmount.max = 'Payment amount is too big. ' +
                'It should be less or equal to ' + ctrl.availableBalance.formatAmount(false);

            dialogService.open('#asset-transfer-dialog');
        });

        function submitTransfer(transferForm) {
            if (!transferForm.validate(ctrl.validationOptions)) {
                // Prevent dialog from closing
                return false;
            }

            var transferFee = Money.fromTokens(ctrl.autocomplete.getFeeAmount(), FEE_CURRENCY);
            if (transferFee.greaterThan(ctrl.feeAssetBalance)) {
                notificationService.error('Not enough funds for the transfer transaction fee');
                return false;
            }

            var transferAmount = Money.fromTokens(ctrl.amount, ctrl.asset.currency);
            if (transferAmount.greaterThan(ctrl.availableBalance)) {
                notificationService.error('Transfer amount exceeds available asset balance');
                return false;
            }

            var assetTransfer = {
                recipient: addressService.cleanupOptionalPrefix(ctrl.recipient),
                amount: transferAmount,
                fee: transferFee
            };

            if (ctrl.attachment) {
                assetTransfer.attachment = converters.stringToByteArray(ctrl.attachment);
            }

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            // Create a transaction and wait for confirmation
            ctrl.broadcast.setTransaction(assetService.createAssetTransferTransaction(assetTransfer, sender));

            // Set data to the confirmation dialog
            ctrl.confirm.amount = assetTransfer.amount;
            ctrl.confirm.fee = assetTransfer.fee;
            ctrl.confirm.recipient = assetTransfer.recipient;

            // Open confirmation dialog (async because this method is called while another dialog is open)
            $timeout(function () {
                dialogService.open('#transfer-asset-confirmation');
            }, 1);

            // Close payment dialog
            return true;
        }

        function broadcastTransaction() {
            ctrl.broadcast.broadcast();
        }

        function resetPaymentForm() {
            ctrl.recipient = '';
            ctrl.amount = '0';
            ctrl.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            ctrl.confirm.fee = Money.fromTokens(constants.MINIMUM_TRANSACTION_FEE, FEE_CURRENCY);
            ctrl.autocomplete.defaultFee(constants.MINIMUM_TRANSACTION_FEE);
        }
    }

    AssetTransferController.$inject = ['$scope', '$timeout', 'constants.ui', 'portfolio.events',
        'autocomplete.fees', 'applicationContext', 'assetService', 'apiService', 'dialogService',
        'formattingService', 'notificationService', 'transactionBroadcast', 'addressService'];

    angular
        .module('app.portfolio')
        .controller('assetTransferController', AssetTransferController);
})();

(function () {
    'use strict';

    function WavesAssetDetailsController($scope, $timeout, events, applicationContext, dialogService) {
        var details = this;

        function transformAddress(address) {
            return isMyAddress(address) ? 'You' : address;
        }

        function isMyAddress(address) {
            return address === applicationContext.account.address;
        }

        $scope.$on(events.ASSET_DETAILS, function (event, assetId) {
            var asset = applicationContext.cache.assets[assetId];
            if (angular.isUndefined(asset)) {
                throw new Error('Failed to find asset details by id ' + assetId);
            }

            details.assetId = assetId;
            details.name = asset.currency.displayName;
            details.description = asset.description;
            details.sender = transformAddress(asset.sender);
            details.isSenderCopiable = !isMyAddress(asset.sender);
            details.timestamp = asset.timestamp;
            details.totalTokens = asset.totalTokens.formatAmount();
            details.reissuable = asset.reissuable ? 'Yes' : 'No';

            $timeout(function () {
                dialogService.open('#asset-details-dialog');
            }, 1);
        });
    }

    WavesAssetDetailsController.$inject = ['$scope', '$timeout', 'portfolio.events', 'applicationContext',
        'dialogService'];

    angular
        .module('app.portfolio')
        .controller('assetDetailsController', WavesAssetDetailsController);
})();

(function () {
    'use strict';

    var FIXED_REISSUE_FEE = new Money(1, Currency.WAVES);

    function WavesAssetReissueController($scope, $timeout, constants, events, applicationContext, assetService,
                                         dialogService, notificationService, formattingService, apiService,
                                         transactionBroadcast) {
        var reissue = this;
        reissue.confirm = {};
        reissue.broadcast = new transactionBroadcast.instance(apiService.assets.reissue,
            function (transaction, response) {
                var amount = Money.fromCoins(transaction.quantity, reissue.asset.currency);
                var displayMessage = 'Reissued ' + amount.formatAmount(true) + ' tokens of asset ' +
                    reissue.asset.currency.displayName + '<br/>Date: ' +
                    formattingService.formatTimestamp(transaction.timestamp);
                notificationService.notice(displayMessage);
            });
        reissue.fee = FIXED_REISSUE_FEE;
        reissue.validationOptions = {
            rules: {
                assetAmount: {
                    required: true,
                    decimal: 0,
                    min: 0
                }
            },
            messages: {
                assetAmount: {
                    required: 'Amount to reissue is required'
                }
            }
        };
        reissue.submitReissue = submitReissue;
        reissue.broadcastTransaction = broadcastTransaction;

        resetReissueForm();

        $scope.$on(events.ASSET_REISSUE, function (event, eventData) {
            var asset = applicationContext.cache.assets[eventData.assetId];
            if (!asset)
                throw new Error('Failed to find asset data by id ' + eventData.assetId);

            resetReissueForm();

            reissue.assetId = eventData.assetId;
            reissue.assetName = asset.currency.displayName;
            reissue.totalTokens = asset.totalTokens;
            reissue.asset = asset;
            reissue.wavesBalance = eventData.wavesBalance;

            // update validation options and check how it affects form validation
            reissue.validationOptions.rules.assetAmount.decimal = asset.currency.precision;
            var minimumPayment = Money.fromCoins(1, asset.currency);
            var maximumPayment = Money.fromCoins(constants.JAVA_MAX_LONG, asset.currency);
            reissue.validationOptions.rules.assetAmount.min = minimumPayment.toTokens();
            reissue.validationOptions.rules.assetAmount.max = maximumPayment.toTokens();
            reissue.validationOptions.messages.assetAmount.decimal = 'The amount to reissue must be a number ' +
                'with no more than ' + minimumPayment.currency.precision +
                ' digits after the decimal point (.)';
            reissue.validationOptions.messages.assetAmount.min = 'Amount to reissue is too small. ' +
                'It should be greater or equal to ' + minimumPayment.formatAmount(false);
            reissue.validationOptions.messages.assetAmount.max = 'Amount to reissue is too big. ' +
                'It should be less or equal to ' + maximumPayment.formatAmount(false);

            dialogService.open('#asset-reissue-dialog');
        });

        function submitReissue (form) {
            if (!form.validate(reissue.validationOptions))
                // prevent dialog from closing
                return false;

            if (reissue.fee.greaterThan(reissue.wavesBalance)) {
                notificationService.error('Not enough funds for the reissue transaction fee');

                return false;
            }

            var assetReissue = {
                totalTokens: Money.fromTokens(reissue.amount, reissue.asset.currency),
                reissuable: reissue.reissuable,
                fee: reissue.fee
            };

            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };
            // creating the transaction and waiting for confirmation
            reissue.broadcast.setTransaction(assetService.createAssetReissueTransaction(assetReissue, sender));

            // setting data for the confirmation dialog
            reissue.confirm.amount = assetReissue.totalTokens;
            reissue.confirm.fee = assetReissue.fee;

            // open confirmation dialog
            // doing it async because this method is called while another dialog is open
            $timeout(function () {
                dialogService.open('#asset-reissue-confirm-dialog');
            }, 1);

            // it's ok to close reissue dialog
            return true;
        }

        function broadcastTransaction () {
            reissue.broadcast.broadcast();
        }

        function resetReissueForm() {
            reissue.amount = '0';
            reissue.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            reissue.confirm.fee = reissue.fee;
        }
    }

    WavesAssetReissueController.$inject = ['$scope', '$timeout', 'constants.ui', 'portfolio.events',
        'applicationContext', 'assetService', 'dialogService', 'notificationService',
        'formattingService', 'apiService', 'transactionBroadcast'];

    angular
        .module('app.portfolio')
        .controller('assetReissueController', WavesAssetReissueController);
})();

(function () {
    'use strict';

    function AssetFilter(applicationContext, addressService) {
        function transformAddress (rawAddress) {
            var result = angular.isDefined(rawAddress) ? rawAddress : 'n/a';

            if (isMyAddress(result))
                result = 'You';

            return result;
        }

        function isMyAddress(address) {
            return address === applicationContext.account.address;
        }

        function formatAsset (transaction) {
            transaction.formatted = {
                sender: transformAddress(transaction.sender),
                canReissue: transaction.reissuable && isMyAddress(transaction.sender)
            };

            return transaction;
        }

        return function filterInput (input) {
            return _.map(input, formatAsset);
        };
    }

    AssetFilter.$inject = ['applicationContext', 'addressService'];

    angular
        .module('app.portfolio')
        .filter('asset', AssetFilter);
})();

(function () {
    'use strict';

    var MAXIMUM_FILE_SIZE_BYTES = 256 * 1024;
    var MAXIMUM_TRANSACTIONS_PER_FILE = 500;
    var FIRST_TRANSACTIONS_COUNT = 10;
    var LOADING_STAGE = 'loading';
    var PROCESSING_STAGE = 'processing';
    var ZERO_MONEY = Money.fromTokens(0, Currency.WAVES);

    function ValidationError(message) {
        this.message = message;
    }

    function WavesMassPaymentController ($scope, $window, $timeout, constants, events, applicationContext, autocomplete,
                                         notificationService, assetService, dialogService,
                                         transactionBroadcast, apiService) {
        var mass = this;
        var minimumFee = new Money(constants.MINIMUM_TRANSACTION_FEE, Currency.WAVES);
        var transactions;

        mass.summary = {
            totalAmount: ZERO_MONEY,
            totalFee: ZERO_MONEY
        };
        mass.confirm = {
            recipients: 0
        };
        mass.filename = '';
        mass.transfers = [];
        mass.inputPayments = [];
        mass.autocomplete = autocomplete;
        mass.stage = LOADING_STAGE;
        mass.loadingInProgress = false;
        mass.broadcast = new transactionBroadcast.instance(apiService.assets.massPay,
            function (transaction, response) {
                var displayMessage = 'Sent ' + mass.summary.totalAmount.formatAmount(true) + ' of ' +
                        mass.summary.totalAmount.currency.displayName + ' to ' + mass.summary.totalTransactions +
                        ' recipients';
                notificationService.notice(displayMessage);
            });
        mass.validationOptions = {
            rules: {
                massPayFee: {
                    required: true,
                    decimal: Currency.WAVES.precision,
                    min: minimumFee.toTokens()
                }
            },
            messages: {
                massPayFee: {
                    required: 'Fee per transaction is required',
                    decimal: 'Fee must be with no more than ' +
                        minimumFee.currency.precision + ' digits after the decimal point (.)',
                    min: 'Fee per transaction is too small. It should be greater or equal to ' +
                        minimumFee.formatAmount(true)
                }
            }
        };
        mass.handleFile = handleFile;
        mass.loadInputFile = loadInputFile;
        mass.processInputFile = processInputFile;
        mass.submitPayment = submitPayment;
        mass.broadcastTransaction = broadcastTransaction;
        mass.transactionsToClipboard = transactionsToClipboard;
        mass.dataCopied = dataCopied;
        mass.cancel = cancel;

        cleanup();

        $scope.$on(events.ASSET_MASSPAY, function (event, eventData) {
            mass.wavesBalance = eventData.wavesBalance;
            mass.assetBalance = eventData.wavesBalance;
            if (eventData.assetId) {
                mass.assetBalance = applicationContext.cache.assets[eventData.assetId].balance;
            }

            mass.sendingWaves = mass.assetBalance.currency === Currency.WAVES;

            cleanup();

            dialogService.open('#asset-mass-pay-dialog');
        });

        function fileErrorHandler(evt) {
            cleanup();

            switch (evt.target.error.code) {
                case evt.target.error.NOT_FOUND_ERR:
                    notificationService.error('File Not Found!');
                    break;
                case evt.target.error.NOT_READABLE_ERR:
                    notificationService.error('File is not readable');
                    break;
                case evt.target.error.ABORT_ERR:
                    break; // noop
                default:
                    notificationService.error('An error occurred reading this file.');
            }
        }

        function loadInputFile (fileName, content) {
            try {
                mass.inputPayments = [];
                if (fileName.endsWith('.json')) {
                    mass.inputPayments = parseJsonFile(content);
                }
                else if (fileName.endsWith('.csv')) {
                    mass.inputPayments = parseCsvFile(content);
                }
                else {
                    throw new Error('Unsupported file type: ' + fileName);
                }
            }
            catch (ex) {
                notificationService.error('Failed to parse file: ' + ex);
            }
        }

        function parseCsvFile (content) {
            var lines = content.split('\n');
            var result = [];
            _.forEach(lines, function (line) {
                line = line.trim();
                if (line.length < 1)
                    return;

                var parts = line.split(';');
                if (parts.length < 2) {
                    throw new Error('CSV file contains ' + parts.length + ' columns. Expected 2 or 3 columns');
                }
                var address = parts[0];
                var amount = parseFloat(parts[1]);
                var id;
                if (parts.length > 2) {
                    id = parts[2];
                }

                result.push({
                    recipient: address,
                    amount: amount,
                    id: id
                });
            });

            return result;
        }

        function parseJsonFile (content) {
            return $window.JSON.parse(content);
        }

        function loadTransactionsFromFile() {
            var sender = {
                publicKey: applicationContext.account.keyPair.public,
                privateKey: applicationContext.account.keyPair.private
            };

            try {
                transactions = [];
                var transfersToDisplay = [];
                var transferCurrency = mass.assetBalance.currency;
                var totalTransactions = 0;
                var totalAmount = Money.fromCoins(0, transferCurrency);
                var totalFee = Money.fromCoins(0, Currency.WAVES);
                var fee = Money.fromTokens(mass.autocomplete.getFeeAmount(), Currency.WAVES);
                var minimumPayment = Money.fromCoins(1, transferCurrency);
                _.forEach(mass.inputPayments, function (transfer) {
                    if (isNaN(transfer.amount)) {
                        throw new ValidationError('Failed to parse payment amount for address ' + transfer.recipient);
                    }

                    var assetTransfer = {
                        recipient: transfer.recipient,
                        amount: Money.fromTokens(transfer.amount, transferCurrency),
                        fee: fee,
                        attachment: transfer.id ? converters.stringToByteArray(transfer.id) : undefined
                    };

                    if (assetTransfer.amount.lessThan(minimumPayment)) {
                        throw new ValidationError('Payment amount ' + transfer.amount + ' to address ' +
                            transfer.recipient + ' is less than minimum (' + minimumPayment.formatAmount(true) + ')');
                    }

                    if (transfersToDisplay.length < FIRST_TRANSACTIONS_COUNT)
                        transfersToDisplay.push({
                            recipient: transfer.recipient,
                            amount: assetTransfer.amount.formatAmount(true)
                        });

                    transactions.push(assetService.createAssetTransferTransaction(assetTransfer, sender));

                    // statistics
                    totalAmount = totalAmount.plus(assetTransfer.amount);
                    totalFee = totalFee.plus(assetTransfer.fee);
                    totalTransactions++;
                });

                mass.broadcast.setTransaction(transactions);

                mass.summary.totalAmount = totalAmount;
                mass.summary.totalTransactions = totalTransactions;
                mass.summary.totalFee = totalFee;
                mass.transfers = transfersToDisplay;
                mass.stage = PROCESSING_STAGE;

                // cleaning up
                mass.filename = '';
                mass.inputPayments = [];
            }
            catch (e) {
                if (e instanceof ValidationError) {
                    mass.invalidPayment = true;
                    mass.inputErrorMessage = e.message;
                }
                else {
                    throw e;
                }
            }

            mass.loadingInProgress = false;
        }

        function processInputFile(form) {
            if (!form.validate(mass.validationOptions)) {
                return;
            }

            if (!mass.inputPayments || mass.inputPayments.length === 0) {
                notificationService.error('Payments were not provided or failed to parse. Nothing to load');

                return;
            }

            if (mass.inputPayments.length > MAXIMUM_TRANSACTIONS_PER_FILE) {
                notificationService.error('Too many payments for a single file. Maximum payments count ' +
                    'in a file should not exceed ' + MAXIMUM_TRANSACTIONS_PER_FILE);

                return;
            }

            mass.loadingInProgress = true;
            // loading transactions asynchronously
            $timeout(loadTransactionsFromFile, 150);
        }

        function submitPayment() {
            var paymentCost = !mass.sendingWaves ?
                mass.summary.totalFee :
                mass.summary.totalFee.plus(mass.summary.totalAmount);

            if (paymentCost.greaterThan(mass.wavesBalance)) {
                notificationService.error('Not enough Waves to make mass payment');

                return false;
            }

            if (mass.summary.totalAmount.greaterThan(mass.assetBalance)) {
                notificationService.error('Not enough "' + mass.assetBalance.currency.displayName +
                    '" to make mass payment');

                return false;
            }

            // setting data for the confirmation dialog
            mass.confirm.amount = mass.summary.totalAmount;
            mass.confirm.fee = mass.summary.totalFee;
            mass.confirm.recipients = mass.summary.totalTransactions;

            dialogService.close();
            $timeout(function () {
                dialogService.open('#asset-mass-pay-confirmation');
            }, 1);

            return true;
        }

        function cancel () {
            dialogService.close();
        }

        function broadcastTransaction() {
            mass.broadcast.broadcast();
        }

        function handleFile(file) {
            if (file.size > MAXIMUM_FILE_SIZE_BYTES) {
                notificationService.error('File "' + file.name + '" is too big. Maximum file size is ' +
                    MAXIMUM_FILE_SIZE_BYTES / 1024 + 'Kb');

                return;
            }

            var reader = new $window.FileReader();

            reader.onloadend = function (event) {
                NProgress.done();

                if (event.target.readyState == FileReader.DONE)
                    mass.loadInputFile(file.name, event.target.result);
            };
            reader.onloadstart = function (event) {
                cleanup();
                NProgress.start();
            };
            reader.onabort = function (event) {
                notificationService.error('File read cancelled');
            };
            reader.onerror = fileErrorHandler;

            reader.readAsText(file);
        }

        function transactionsToClipboard() {
            return $window.JSON.stringify(transactions, null, ' ');
        }

        function dataCopied() {
            notificationService.notice('Transactions copied successfully');
        }

        function cleanup() {
            mass.summary.totalAmount = ZERO_MONEY;
            mass.summary.totalTransactions = 0;
            mass.summary.totalFee = ZERO_MONEY;
            mass.stage = LOADING_STAGE;
            mass.invalidPayment = false;

            mass.confirm.amount = Money.fromTokens(0, Currency.WAVES);
            mass.confirm.recipients = 0;
            mass.confirm.fee = Money.fromTokens(0, Currency.WAVES);

            mass.autocomplete.defaultFee(constants.MINIMUM_TRANSACTION_FEE);
        }
    }

    WavesMassPaymentController.$inject = ['$scope', '$window', '$timeout', 'constants.ui', 'portfolio.events',
        'applicationContext', 'autocomplete.fees',
        'notificationService', 'assetService', 'dialogService', 'transactionBroadcast', 'apiService'];

    angular
        .module('app.portfolio')
        .controller('massPaymentController', WavesMassPaymentController);
})();

(function () {
    'use strict';

    angular
        .module('app.portfolio')
        .directive('fileSelect', [function WavesFileSelectDirective() {
            return {
                restrict: 'A',
                scope: {
                    fileHandler: '&'
                },
                link: function (scope, element) {
                    element.on('change', function (changeEvent) {
                        var files = changeEvent.target.files;
                        if (files.length) {
                            scope.fileHandler({file: files[0]});
                        }
                    });
                }
            };
        }]);
})();

/******************************************************************************
 * Copyright Â© 2016 The Waves Core Developers.                                *
 *                                                                            *
 * See the LICENSE.txt files at                                               *
 * the top-level directory of this distribution for the individual copyright  *
 * holder information and the developer policies on copyright and licensing.  *
 *                                                                            *
 * Unless otherwise agreed in a custom licensing agreement, no part of the    *
 * Waves software, including this file, may be copied, modified, propagated,  *
 * or distributed except according to the terms contained in the LICENSE.txt  *
 * file.                                                                      *
 *                                                                            *
 * Removal or modification of this copyright notice is prohibited.            *
 *                                                                            *
 ******************************************************************************/

(function ($, window) {
    'use strict';

    var $wrapW = $('#wrapper').width(),
        $mbBodyH = $('#mainBody').height();

    // GUI elements dynamic sizing and LeftBar visibility
    $(window).on('load resize', function (e) {

        var $wrapH = $('#wrapper').height(),
            $headerH = $('header').height(),
            $tabsH = $('#tabs').height(),
            $mainBodyH = $wrapH - $headerH - $tabsH,
            $mbBodyW = $wrapW;

        $('#mainBody').css('height', $mainBodyH);
        $('#mBBody').css('width', $mbBodyW);
    });
})(jQuery, window);

/**
 * Setup of main AngularJS application, with Restangular being defined as a dependency.
 *
 * @see controllers
 * @see services
 */

// mock methods to implement late binding
var __mockShowError = function(message) {};
var __mockValidateAddress = function(address) {};

var app = angular.module('app', [
    'restangular',
    'waves.core',

    'ngclipboard',
    'ngAnimate',
    'ngMaterial',
    'ngValidate',
    'app.ui',
    'app.shared',
    'app.login',
    'app.navigation',
    'app.wallet',
    'app.tokens',
    'app.dex',
    'app.leasing',
    'app.history',
    'app.community',
    'app.portfolio'
]).config(AngularApplicationConfig).run(AngularApplicationRun);

function AngularApplicationConfig($provide, $compileProvider, $validatorProvider, $qProvider,
                                  $sceDelegateProvider, $mdAriaProvider, networkConstants, applicationSettings) {
    'use strict';

    $provide.constant(networkConstants,
        angular.extend(networkConstants, {
            NETWORK_NAME: 'mainnet',
            NETWORK_CODE: 'W'
        }));
    $provide.constant(applicationSettings,
        angular.extend(applicationSettings, {
            CLIENT_VERSION: '0.5.22a',
            NODE_ADDRESS: 'https://nodes.wavesplatform.com',
            COINOMAT_ADDRESS: 'https://coinomat.com',
            MATCHER_ADDRESS: 'https://matcher.wavesplatform.com',
            DATAFEED_ADDRESS: 'https://marketdata.wavesplatform.com'
        }));

    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|local|data|file|chrome-extension):/);
    $qProvider.errorOnUnhandledRejections(false);
    $sceDelegateProvider.resourceUrlWhitelist([
        'self',
        'https://test.coinomat.com/api/**',
        'https://coinomat.com/api/**',
        'https://marketdata.wavesplatform.com/**'
    ]);

    // Globally disables all ARIA warnings.
    $mdAriaProvider.disableWarnings();

    $validatorProvider.setDefaults({
        errorClass: 'wInput-error',
        onkeyup: false,
        showErrors : function(errorMap, errorList) {
            errorList.forEach(function(error) {
                // can't use notificationService here cos services are not available in config phase
                __mockShowError(error.message);
            });

            var i, elements;
            for (i = 0, elements = this.validElements(); elements[i]; i++) {
                angular.element(elements[i]).removeClass(this.settings.errorClass);
            }

            for (i = 0, elements = this.invalidElements(); elements[i]; i++) {
                angular.element(elements[i]).addClass(this.settings.errorClass);
            }
        }
    });

    $validatorProvider.addMethod('address', function (value, element) {
        return this.optional(element) || __mockValidateAddress(value);
    }, 'Account number must be a sequence of 35 alphanumeric characters with no spaces, ' +
        'optionally starting with \'1W\'');

    $validatorProvider.addMethod('decimal', function (value, element, maxDigits) {
        maxDigits = angular.isNumber(maxDigits) ? maxDigits : Currency.WAVES.precision;
        var regex = new RegExp('^(?:-?\\d+)?(?:\\.\\d{0,' + maxDigits + '})?$');
        return this.optional(element) || regex.test(value);
    }, 'Amount is expected with a dot (.) as a decimal separator with no more than {0} fraction digits');

    $validatorProvider.addMethod('password', function (value, element) {
        if (this.optional(element)) {
            return true;
        }

        var containsDigits = /[0-9]/.test(value);
        var containsUppercase = /[A-Z]/.test(value);
        var containsLowercase = /[a-z]/.test(value);

        return containsDigits && containsUppercase && containsLowercase;
    }, 'The password is too weak. A good password must contain at least one digit, ' +
        'one uppercase and one lowercase letter');

    $validatorProvider.addMethod('minbytelength', function (value, element, minLength) {
        if (this.optional(element)) {
            return true;
        }

        if (!angular.isNumber(minLength)) {
            throw new Error('minbytelength parameter must be a number. Got ' + minLength);
        }

        return converters.stringToByteArray(value).length >= minLength;
    }, 'String is too short. Please add more characters.');

    $validatorProvider.addMethod('maxbytelength', function (value, element, maxLength) {
        if (this.optional(element)) {
            return true;
        }

        if (!angular.isNumber(maxLength)) {
            throw new Error('maxbytelength parameter must be a number. Got ' + maxLength);
        }

        return converters.stringToByteArray(value).length <= maxLength;
    }, 'String is too long. Please remove some characters.');
}

AngularApplicationConfig.$inject = ['$provide', '$compileProvider', '$validatorProvider', '$qProvider',
    '$sceDelegateProvider', '$mdAriaProvider', 'constants.network', 'constants.application'];

function AngularApplicationRun(rest, applicationConstants, notificationService, addressService) {
    'use strict';

    // restangular configuration
    rest.setDefaultHttpFields({
        timeout: 10000 // milliseconds
    });
    var url = applicationConstants.NODE_ADDRESS;
    //var url = 'http://52.28.66.217:6869';
    //var url = 'http://52.77.111.219:6869';
    //var url = 'http://127.0.0.1:6869';
    //var url = 'http://127.0.0.1:8089';
    rest.setBaseUrl(url);

    // override mock methods cos in config phase services are not available yet
    __mockShowError = function (message) {
        notificationService.error(message);
    };
    __mockValidateAddress = function (address) {
        return addressService.validateAddress(address.trim());
    };
}

AngularApplicationRun.$inject = ['Restangular', 'constants.application', 'notificationService', 'addressService'];

angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('dex/asset.picker.component',
    "<md-autocomplete class=\"assets-autocomplete\" ng-class=\"{amount: $ctrl.type === 'amountAsset', price: $ctrl.type === 'priceAsset'}\" placeholder=\"Choose an asset or copy-paste an ID here\" md-menu-class=\"assets-autocomplete-popup\" md-selected-item=\"$ctrl.autocomplete.selectedAsset\" md-selected-item-change=\"$ctrl.changeAsset()\" md-search-text=\"$ctrl.autocomplete.searchText\" md-search-text-change=\"\" md-items=\"item in $ctrl.findAssets($ctrl.autocomplete.searchText)\" md-item-text=\"item.displayName\" md-clear-button=\"false\" md-no-cache=\"true\" md-min-length=\"0\" md-has-not-found=\"true\" md-select-on-focus><md-item-template><div class=\"asset-tile\"><span class=\"label\" ng-class=\"{'verified': item.verified}\" md-highlight-text=\"$ctrl.autocomplete.searchText\" title=\"{{item.verified ? 'Asset is verified' : ''}}\">{{item.verified ? item.displayName : ''}}</span> <span class=\"muted\">{{item.id}}</span></div></md-item-template><md-not-found><span ng-if=\"$ctrl.isAssetLoading\">Loading...</span> <span ng-if=\"!$ctrl.isAssetLoading\">Nothing is found!</span></md-not-found></md-autocomplete>"
  );


  $templateCache.put('dex/chart.component',
    "<div class=\"chart\"></div>"
  );


  $templateCache.put('dex/component',
    "<div class=\"exchange\"><div class=\"choice\"><div class=\"picker-widget\"><waves-dex-asset-picker name=\"Amount asset\" type=\"amountAsset\" assets=\"$ctrl.assetsList\" hidden-asset=\"$ctrl.pair.priceAsset\" picked-asset=\"$ctrl.pair.amountAsset\"></waves-dex-asset-picker></div><div class=\"current-pair\">{{$ctrl.pair.amountAsset.shortName}}/{{$ctrl.pair.priceAsset.shortName}}</div><div class=\"picker-widget\"><waves-dex-asset-picker name=\"Price asset\" type=\"priceAsset\" assets=\"$ctrl.assetsList\" hidden-asset=\"$ctrl.pair.amountAsset\" picked-asset=\"$ctrl.pair.priceAsset\"></waves-dex-asset-picker></div></div><div class=\"charts\"><waves-dex-chart pair=\"$ctrl.pair\"></waves-dex-chart></div><div class=\"workplace\"><div class=\"orderbooks\"><div class=\"orderbook\"><waves-dex-orderbook type=\"buy\" name=\"{{$ctrl.pair.amountAsset.displayName}} buy orders\" pair=\"$ctrl.pair\" on-click=\"$ctrl.fillSellForm\" orders=\"$ctrl.buyOrders\"></waves-dex-orderbook></div><div class=\"orderbook\"><waves-dex-orderbook type=\"sell\" name=\"{{$ctrl.pair.amountAsset.displayName}} sell orders\" pair=\"$ctrl.pair\" on-click=\"$ctrl.fillBuyForm\" orders=\"$ctrl.sellOrders\"></waves-dex-orderbook></div><div class=\"orderbook\"><waves-dex-history pair=\"$ctrl.pair\" trades=\"$ctrl.tradeHistory\"></waves-dex-history></div></div><div class=\"user-orders\"><waves-dex-order-creator pair=\"$ctrl.pair\" submit=\"$ctrl.createOrder\" last-price=\"$ctrl.lastTradePrice\" buy-values=\"$ctrl.buyFormValues\" sell-values=\"$ctrl.sellFormValues\"></waves-dex-order-creator><waves-dex-user-orders pair=\"$ctrl.pair\" orders=\"$ctrl.userOrders\" cancel-order=\"$ctrl.cancelOrder\"></waves-dex-user-orders></div></div></div><aside class=\"pairs-lists\"><waves-dex-favorites pairs=\"$ctrl.favoritePairs\" switch-pair=\"$ctrl.changePair\"></waves-dex-favorites><div class=\"how-to\"><h3>Quick guide</h3><p>1. Choose a pair of assets you want to trade. Just start typing asset name, then pick the right one.</p><p>2. Take a look at orderbooks to get an understanding of the pair market.</p><p>3. Finally, fill the form and submit your order.</p></div></aside><div id=\"dex-bad-order-confirmation\" waves-dialog ok-button-caption=\"YES\" on-dialog-ok=\"$ctrl.placeBadOrder()\" cancel-button-caption=\"NO\" on-dialog-cancel=\"$ctrl.refuseBadOrder()\"><div class=\"dialog-confirmation\"><p class=\"dialog-text\">{{$ctrl.badOrderQuestion}}</p></div></div>"
  );


  $templateCache.put('dex/favorites.component',
    "<h2>Favorites</h2><div class=\"pairs-list\"><div class=\"pair\" ng-repeat=\"p in $ctrl.pairs\" ng-click=\"$ctrl.onClick(p)\">{{p.amountAsset.shortName}}/{{p.priceAsset.shortName}}</div></div>"
  );


  $templateCache.put('dex/history.component',
    "<h3>Trade history</h3><table><thead><tr><td>Date</td><td>Type</td><td>Price ({{$ctrl.pair.priceAsset.shortName}})</td><td>Amount ({{$ctrl.pair.amountAsset.shortName}})</td><td>Total ({{$ctrl.pair.priceAsset.shortName}})</td></tr></thead></table><waves-scrollbox><table><tbody><tr ng-repeat=\"trade in $ctrl.trades\"><td>{{trade.timestamp | formatting}}</td><td class=\"type\" ng-class=\"trade.type\">{{trade.typeTitle}}</td><td>{{trade.price | number:$ctrl.pair.priceAsset.precision}}</td><td>{{trade.amount | number:$ctrl.pair.amountAsset.precision}}</td><td>{{trade.total | number:$ctrl.pair.priceAsset.precision}}</td></tr><tr ng-if=\"!$ctrl.trades.length\"><td colspan=\"5\"><span>There was no trades for the current pair.</span></td></tr></tbody></table></waves-scrollbox>"
  );


  $templateCache.put('dex/order.creator.component',
    "<div class=\"half buy\"><h2><span>Buy {{$ctrl.pair.amountAsset.displayName}} </span><small ng-click=\"$ctrl.buyFullBalance()\">{{$ctrl.priceAssetBalance}}</small></h2><div class=\"fields\"><md-input-container><label>Price in {{$ctrl.pair.priceAsset.displayName}}</label><input type=\"text\" ng-model=\"$ctrl.buy.price\" ng-change=\"$ctrl.updateBuyTotal()\" decimal-input-restrictor></md-input-container><md-input-container><label>{{$ctrl.pair.amountAsset.displayName}} amount</label><input type=\"text\" ng-model=\"$ctrl.buy.amount\" ng-change=\"$ctrl.updateBuyTotal()\" decimal-input-restrictor></md-input-container><div><span>Total:&nbsp;</span> <span>{{$ctrl.buy.total | number:$ctrl.pair.priceAsset.precision}}&nbsp;</span> <span>{{$ctrl.pair.priceAsset.shortName}}</span></div><div><span><abbr title=\"Fee will be taken in the moment of order execution\">Fee</abbr>:&nbsp;</span> <span>{{$ctrl.buy.fee}}</span> <span>WAV</span></div></div><div class=\"button-container\"><button ng-disabled=\"$ctrl.buy.blocked\" ng-click=\"$ctrl.submitBuyOrder()\">Buy</button></div></div><div class=\"half sell\"><h2><span>Sell {{$ctrl.pair.amountAsset.displayName}} </span><small ng-click=\"$ctrl.sellFullBalance()\">{{$ctrl.amountAssetBalance}}</small></h2><div class=\"fields\"><md-input-container><label>Price in {{$ctrl.pair.priceAsset.displayName}}</label><input type=\"text\" ng-model=\"$ctrl.sell.price\" ng-change=\"$ctrl.updateSellTotal()\" decimal-input-restrictor></md-input-container><md-input-container><label>{{$ctrl.pair.amountAsset.displayName}} amount</label><input type=\"text\" ng-model=\"$ctrl.sell.amount\" ng-change=\"$ctrl.updateSellTotal()\" decimal-input-restrictor></md-input-container><div><span>Total:&nbsp;</span> <span>{{$ctrl.sell.total | number:$ctrl.pair.priceAsset.precision}}&nbsp;</span> <span>{{$ctrl.pair.priceAsset.shortName}}</span></div><div><span><abbr title=\"Fee will be taken in the moment of order execution\">Fee</abbr>:&nbsp;</span> <span>{{$ctrl.sell.fee}}</span> <span>WAV</span></div></div><div class=\"button-container\"><button ng-disabled=\"$ctrl.sell.blocked\" ng-click=\"$ctrl.submitSellOrder()\">Sell</button></div></div>"
  );


  $templateCache.put('dex/orderbook.component',
    "<h3>{{$ctrl.name}}</h3><table ng-class=\"$ctrl.type\"><thead><tr><td>Price</td><td>{{$ctrl.pair.amountAsset.shortName}}</td><td>{{$ctrl.pair.priceAsset.shortName}}</td><td>SUM ({{$ctrl.pair.priceAsset.shortName}})</td></tr></thead></table><waves-scrollbox><table ng-class=\"$ctrl.type\"><tbody><tr ng-repeat=\"order in $ctrl.orders\" ng-click=\"$ctrl.lineClick($index)\"><td ng-bind-html=\"order.price | number:$ctrl.pair.priceAsset.precision | padder:$ctrl.lengths.price\"></td><td ng-bind-html=\"order.amount | number:$ctrl.pair.amountAsset.precision | padder:$ctrl.lengths.amount\"></td><td ng-bind-html=\"order.total | number:$ctrl.pair.priceAsset.precision | padder:$ctrl.lengths.total\"></td><td ng-bind-html=\"order.sum | number:$ctrl.pair.priceAsset.precision | padder:$ctrl.lengths.sum\"></td></tr><tr ng-if=\"!$ctrl.orders.length\"><td colspan=\"4\"><span>Some orders will appear soon.</span></td></tr></tbody></table></waves-scrollbox>"
  );


  $templateCache.put('dex/pair.chart.component',
    "<img src=\"http://www.ifmr.co.in/blog/wp-content/uploads/2014/04/BitcoinPrice.png\">"
  );


  $templateCache.put('dex/user.orders.component',
    "<h3>My orders</h3><table class=\"user\"><thead><tr><td>Status</td><td>Type</td><td>Price</td><td>{{$ctrl.pair.amountAsset.shortName}}</td><td>{{$ctrl.pair.priceAsset.shortName}}</td><td></td></tr></thead></table><waves-scrollbox><table class=\"user\"><tbody><tr ng-repeat=\"order in $ctrl.orders\" ng-class=\"{\n" +
    "            'filled': order.status === 'Filled' || order.status === 'Cancelled',\n" +
    "            'not-found': order.status === 'NotFound'\n" +
    "          }\"><td>{{order.statusTitle}}</td><td class=\"type\" ng-class=\"order.type\">{{order.typeTitle}}</td><td>{{order.price | number:8}}</td><td>{{order.amount | number:8}}</td><td>{{order.total | number:8}}</td><td ng-click=\"$ctrl.cancel({order: order})\">&times;</td></tr><tr ng-if=\"!$ctrl.orders.length\"><td colspan=\"6\"><span>Create your first order!</span></td></tr></tbody></table></waves-scrollbox>"
  );


  $templateCache.put('leasing/balance.details.component',
    "<section-header>BALANCE DETAILS</section-header><table class=\"waves-table\"><tbody><tr><td>Regular</td><td>{{$ctrl.formattedBalance.regular}}</td></tr><tr><td>Effective</td><td>{{$ctrl.formattedBalance.effective}}</td></tr><tr><td>Generating</td><td>{{$ctrl.formattedBalance.generating}}</td></tr></tbody></table>"
  );


  $templateCache.put('leasing/component',
    "<div class=\"leasing\"><div class=\"tools\"><div class=\"column balance\"><waves-leasing-balance-details balance-details=\"$ctrl.balanceDetails\"></waves-leasing-balance-details></div><div class=\"column form\"><waves-leasing-lease-form></waves-leasing-lease-form></div><div class=\"column quick-note\"><section-header>QUICK NOTE</section-header><p>You can only transfer or trade Waves that arenâ€™t leased. The leased amount cannot be transferred or traded by you or anyone else.</p><p>You can cancel a leasing transaction as soon as it appears in the blockchain which usually occurs in a minute or less.</p><p>To cancel a lease, click on the black button in the far right column of the Leasing Transactions table below and select Cancel Leasing.</p><p>The generating balance will be updated after 1000 blocks.</p></div></div><waves-transaction-history heading=\"LEASING TRANSACTIONS\" transactions=\"$ctrl.transactions\" limit-to=\"$ctrl.limitTo\"></waves-transaction-history></div>"
  );


  $templateCache.put('leasing/lease.form.component',
    "<section-header>BALANCE LEASING</section-header><form name=\"$ctrl.form\" novalidate ng-validate=\"$ctrl.validationOptions\"><table class=\"form-table\"><tbody><tr><td>Recipient</td><td><input class=\"wInput form-control\" name=\"leasingRecipient\" type=\"text\" placeholder=\"Recipient address\" ng-model=\"$ctrl.recipient\"></td></tr><tr><td>Amount</td><td><input class=\"wInput form-control\" name=\"leasingAmount\" type=\"text\" placeholder=\"Leasing amount\" ng-model=\"$ctrl.amount\" decimal-input-restrictor></td></tr><tr><td class=\"fee\">Fee</td><td class=\"fee\">{{$ctrl.fee | moneyLong:true}}</td></tr><tr><td colspan=\"2\" class=\"button-container\"><button class=\"wButton wButton-neg fade\" ng-click=\"$ctrl.confirmLease($ctrl.form)\">LEASE</button></td></tr></tbody></table></form><div id=\"start-leasing-confirmation\" waves-dialog ok-button-caption=\"CONFIRM\" ok-button-enabled=\"!$ctrl.broadcast.pending\" on-dialog-ok=\"$ctrl.broadcastTransaction()\"><div class=\"dialog-confirmation\"><p class=\"dialog-text\">You are going to lease <span class=\"confirmation-value\">{{$ctrl.confirm.amount | moneyLong:true}}</span> with <span class=\"confirmation-value\">{{$ctrl.confirm.fee | moneyLong:true}}</span> fee to the address<br><span class=\"confirmation-value\">{{$ctrl.confirm.recipient}}</span></p><p class=\"dialog-text\">Please <span class=\"fontBold\">CONFIRM </span>to execute or <span class=\"fontBold\">CANCEL </span>to discard.</p></div></div>"
  );


  $templateCache.put('navigation/tab.directive',
    "<img ng-src=\"img/tabs-iconset-{{pageId}}.svg\" class=\"fFade\" alt=\"{{caption}}\" ng-click=\"onClick()\" ng-class=\"[{selected: isSelected()}]\">"
  );


  $templateCache.put('shared/dialog.directive',
    "<img class=\"wPop-header\" ng-src=\"img/{{image}}\"><div class=\"wavesPop-content\" ng-transclude></div><div class=\"wavesPop-content-buttons button-row\" ng-show=\"showButtons\"><button class=\"wButton wButton-dialog fade tooltip-1\" ng-class=\"[{wButtonDanger: isError}]\" title=\"{{::tooltip}}\" ng-click=\"onOk()\" ng-disabled=\"!okButtonEnabled\">{{::okButtonCaption}}</button> <span class=\"divider-2\" ng-if=\"cancelButtonVisible\"></span> <button ng-if=\"cancelButtonVisible\" class=\"wButton wButton-dialog fade\" ng-class=\"[{wButtonDanger: isError}]\" ng-click=\"onCancel()\">{{::cancelButtonCaption}}</button><waves-support-link ng-if=\"::!noSupportLink\" class=\"dark\"></waves-support-link></div>"
  );


  $templateCache.put('shared/transaction.history.component',
    "<section-header>{{::$ctrl.heading}}</section-header><waves-scrollbox class=\"transactions-table\"><table><thead><tr><td>DATE</td><td>TYPE</td><td>NAME</td><td>SENDER</td><td>RECIPIENT</td><td>FEE</td><td>UNITS</td><td></td></tr></thead><tbody><tr ng-repeat=\"tx in $ctrl.transactions | antiSpam | orderBy:'timestamp':true | limitTo:$ctrl.limitTo | transaction track by tx.timestamp\" ng-class=\"{'tx-unc': tx.unconfirmed, 'tx-in': !tx.formatted.isOutgoing, 'tx-out': tx.formatted.isOutgoing}\"><td>{{tx.formatted.datetime}}</td><td>{{tx.formatted.type}}</td><td>{{tx.formatted.asset}}</td><td>{{tx.formatted.sender}}</td><td>{{tx.formatted.recipient}}</td><td>{{tx.formatted.fee}} {{tx.formatted.feeAsset.shortName}}</td><td>{{tx.formatted.amount}}</td><td width=\"16\"><tx-menu transaction=\"tx\"></tx-menu></td></tr></tbody></table><div id=\"cancel-leasing-confirmation\" waves-dialog ok-button-caption=\"CONFIRM\" on-dialog-ok=\"$ctrl.cancelLeasing()\"><div class=\"dialog-confirmation\"><p class=\"dialog-text\">You are going to cancel leasing of <span class=\"confirmation-value\">{{$ctrl.confirm.amount}}</span> <span class=\"confirmation-value\">{{$ctrl.confirm.asset}}</span> with <span class=\"confirmation-value\">{{$ctrl.confirm.fee | moneyLong:true}}</span> fee<br>for the address <span class=\"confirmation-value\">{{$ctrl.confirm.recipient}}</span></p><p class=\"dialog-text\">Please <span class=\"fontBold\">CONFIRM </span>to execute or <span class=\"fontBold\">CANCEL </span>to discard.</p></div></div></waves-scrollbox>"
  );


  $templateCache.put('shared/transaction.menu.component',
    "<md-menu><md-button class=\"md-icon-button\" ng-click=\"$mdMenu.open($event)\"><img ng-src=\"img/wicon_txmenu.svg\" height=\"16\" width=\"16\"></md-button><md-menu-content width=\"2\"><md-menu-item><md-button ngclipboard data-clipboard-text=\"{{::$ctrl.transaction.sender}}\" ngclipboard-success=\"$ctrl.addressCopied()\"><span md-menu-align-target>Copy sender address</span></md-button></md-menu-item><md-menu-item><md-button ng-disabled=\"!$ctrl.hasRecipient()\" ngclipboard data-clipboard-text=\"{{::$ctrl.transaction.recipient}}\" ngclipboard-success=\"$ctrl.addressCopied()\"><span md-menu-align-target>Copy recipient address</span></md-button></md-menu-item><md-menu-item><md-button ngclipboard data-clipboard-text=\"{{::$ctrl.transaction.id}}\" ngclipboard-success=\"$ctrl.idCopied()\"><span md-menu-align-target>Copy TX ID</span></md-button></md-menu-item><md-menu-item><md-button ngclipboard ngclipboard-text-provider=\"$ctrl.fullTransactionData()\" ngclipboard-success=\"$ctrl.dataCopied()\"><span md-menu-align-target>Copy full TX data</span></md-button></md-menu-item><md-menu-item ng-if=\"$ctrl.isLeasing()\"><md-button ng-click=\"$ctrl.cancelLeasing()\"><span md-menu-align-target>Cancel Leasing</span></md-button></md-menu-item></md-menu-content></md-menu>"
  );


  $templateCache.put('wallet/box.component',
    "<img ng-src=\"img/{{::$ctrl.image}}\" alt=\"{{::$ctrl.displayName}}\"><div class=\"wB-name\">{{::$ctrl.displayName | uppercase}}</div><div class=\"wB-add\"></div><div class=\"wB-balInt\">{{$ctrl.integerBalance}}</div><div class=\"wB-balDec\">{{$ctrl.fractionBalance}}</div><div class=\"wB-buttons\"><a ng-click=\"$ctrl.onSend({currency: $ctrl.balance.currency})\"><div class=\"wB-but wB-butSend fade\"><p>SEND</p></div></a><a ng-click=\"$ctrl.onWithdraw({currency: $ctrl.balance.currency})\"><div class=\"wB-but wB-butRec fade\"><p>WITHDRAW</p></div></a><a ng-click=\"$ctrl.onDeposit({currency: $ctrl.balance.currency})\"><div class=\"wB-but wB-butTrade fade\"><p>DEPOSIT</p></div></a></div>"
  );

}]);
