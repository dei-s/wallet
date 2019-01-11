var MSG_NODE_ADDRESS = DEI_NODE_ADDRESS;
if (isMir()) {
	var MSG_AMOUNT_MIN = 100000000; // 1 DEI
	var MSG_ASSET_ID = '';
	var MSG_WALLET_ADDR = '3MbnsvKVdTgxKFXw49iuqs8K6kGsUWoXDei'; // DEI
} else {
	var MSG_AMOUNT_MIN = 100000; // 0.001 МИР
	var MSG_ASSET_ID = 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ'; // МИР
	var MSG_WALLET_ADDR = '3PEPpJoJNqrU6T6AAdXB3yMzUseEaUPniCw'; // DEI
}

var app = new Vue({
	el: '#app',
	data: {
		message: '',
		pinnedMessage: {},
		messages: [],
		wall: MSG_WALLET_ADDR,
		node: MSG_NODE_ADDRESS,
		amount: '0.01',
		fee: '0.001',
		minAmount: MSG_AMOUNT_MIN,
		pinAmount: 1000000,
		last: 0
	},
	created: function() {
		this.update();
		setInterval(this.update, 1000);
	},
	methods: {
		formatSender: function(sender) {
			return '...' + sender.slice(-7);
		},
		formatTime: function(timestamp) {
			let time = new Date(timestamp);
			return time.toLocaleString();
		},
		loadPosts: async function(limit) {
			let response = await axios.get(this.node + '/transactions/address/' + this.wall + '/limit/' + limit);
			return response.data;
		},
		findByKey: function(array, id) {
			let element = array.find(element => {
				return element.key == id ? element : false;
			});
			return element;
		},
		getName: async function(sender) {
			try {
				let response = await axios.get(this.node + '/addresses/data/' + sender + '/waves-wall-name');
				return response.data ? response.data : '';
			} catch(err) {
				console.log(err);
				return '';
			}
		},
		update: async function() {
			if (isMir()) {
				// ...
			} else {
				let lastTx = await this.loadPosts(1);
				let lastTime = lastTx[0][0].timestamp;
				if (lastTime != this.last) {
					let data = await this.loadPosts(10000);
					this.messages = [];
					await data[0].forEach(item => {
						if (item.attachment && item.amount >= this.minAmount && item.assetId == MSG_ASSET_ID) {
							let msg = this.decode(item.attachment);
							this.messages.push({
								sender: item.sender,
								text: msg,
								time: item.timestamp,
								amount: item.amount,
								id: item.id
							});
							let pinned = this.messages.find(element => {
								return element.amount > this.pinAmount ? element : false;
							});
							this.pinnedMessage = pinned ? pinned : '';
						}
					});
					this.$refs.msgWrapper.scrollTop = this.$refs.msgWrapper.scrollHeight;
					this.last = lastTime.valueOf();
				}
			}
		},
		findMax: function(arr) {
			return arr.reduce(function(prev, curr){
				return prev.amount >= curr.amount ? prev : curr;
			});
		},
		decode: function(text) {
			let bytes = Base58.decode(text);
			let str = '';
			for (let i = 0; i < bytes.length; i++) {
				str += String.fromCharCode(bytes[i]);
			}
			return decodeURIComponent(escape(str));
		},
		send: async function() {
			let msg = this.message;
			if (isMir()) {
				let params = {
					type: 4,
					data: {
						amount: {
							assetId: 'MIR',
							tokens: this.amount
						},
						fee: {
							assetId: 'MIR',
							tokens: this.fee
						},
						recipient: this.wall,
						attachment: msg
					}
				}
			} else {
				let params = {
					type: 4,
					data: {
						amount: {
							assetId: 'HdPJha3Ekn1RUR2K9RrY7SG9xK1b21AHPwkL8pcwTmSZ',
							tokens: this.amount
						},
						fee: {
							assetId: 'WAVES',
							tokens: this.fee
						},
						recipient: this.wall,
						attachment: msg
					}
				}
			}
			if (this.checkKeeper()) {
				try {
					if (isMir()) {
						let res = await window.Mir.signAndPublishTransaction(params);
					} else {
						let res = await window.Waves.signAndPublishTransaction(params);
					}
					this.message = '';
				} catch (err) {
					alert(err.message);
				}
			} else {
				alert('Please, install Waves Keeper.\nFollow the link at the bottom of the page.');
			}
		},
		checkKeeper: function() {
			if (isMir()) {
				return typeof window.Mir !== 'undefined';
			} else {
				return typeof window.Waves !== 'undefined';
			}
		}
	}
});
