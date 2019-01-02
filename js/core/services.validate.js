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

				if (issue.fee.currency !== Currency.BASE) {
					throw new Error('Transaction fee must be nominated in '+Currency.BASE.displayName);
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
				if (reissue.totalTokens.currency === Currency.BASE) {
					throw new Error('Reissuing is not allowed.');
				}

				if (angular.isUndefined(reissue.totalTokens)) {
					throw new Error('Total tokens amount hasn\'t been set');
				}

				if (angular.isUndefined(reissue.fee)) {
					throw new Error('Transaction fee hasn\'t been set');
				}

				if (reissue.fee.currency !== Currency.BASE) {
					throw new Error('Transaction fee must be nominated in '+Currency.BASE.displayName);
				}
			};
		});
})();
