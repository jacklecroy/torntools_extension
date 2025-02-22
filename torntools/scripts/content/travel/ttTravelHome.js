const country_dict = {
	// time = minutes
	argentina: {
		time: 167,
		cost: 21000,
	},
	canada: {
		time: 41,
		cost: 9000,
	},
	"cayman islands": {
		time: 35,
		cost: 10000,
	},
	china: {
		time: 242,
		cost: 35000,
	},
	hawaii: {
		time: 134,
		cost: 11000,
	},
	japan: {
		time: 225,
		cost: 32000,
	},
	mexico: {
		time: 26,
		cost: 6500,
	},
	"south africa": {
		time: 297,
		cost: 40000,
	},
	switzerland: {
		time: 175,
		cost: 27000,
	},
	uae: {
		time: 271,
		cost: 32000,
	},
	"united kingdom": {
		time: 159,
		cost: 18000,
	},
};

const country_dict_short = {
	// time = minutes
	arg: {
		long_name: "Argentina",
		time: 167,
		cost: 21000,
		item_types: {
			271: "flower",
			269: "plushie",
			196: "drug",
			198: "drug",
			204: "drug",
			199: "drug",
			203: "drug",
		},
	},
	can: {
		long_name: "Canada",
		time: 41,
		cost: 9000,
		item_types: {
			263: "flower",
			261: "plushie",
			197: "drug",
			196: "drug",
			205: "drug",
			201: "drug",
			206: "drug",
		},
	},
	cay: {
		long_name: "Cayman Islands",
		time: 35,
		cost: 10000,
		item_types: {
			617: "flower",
			618: "plushie",
		},
	},
	chi: {
		long_name: "China",
		time: 242,
		cost: 35000,
		item_types: {
			276: "flower",
			274: "plushie",
			197: "drug",
			200: "drug",
			204: "drug",
			201: "drug",
			199: "drug",
		},
	},
	haw: {
		long_name: "Hawaii",
		time: 134,
		cost: 11000,
		item_types: {
			264: "flower",
		},
	},
	jap: {
		long_name: "Japan",
		time: 225,
		cost: 32000,
		item_types: {
			277: "flower",
			205: "drug",
			206: "drug",
			203: "drug",
			197: "drug",
			200: "drug",
			198: "drug",
			204: "drug",
		},
	},
	mex: {
		long_name: "Mexico",
		time: 26,
		cost: 6500,
		item_types: {
			260: "flower",
			258: "plushie",
		},
	},
	sou: {
		long_name: "South Africa",
		time: 297,
		cost: 40000,
		item_types: {
			282: "flower",
			281: "plushie",
			200: "drug",
			201: "drug",
			199: "drug",
			206: "drug",
			203: "drug",
		},
	},
	swi: {
		long_name: "Switzerland",
		time: 175,
		cost: 27000,
		item_types: {
			272: "flower",
			435: "flower",
			273: "plushie",
			196: "drug",
			198: "drug",
			204: "drug",
			201: "drug",
			199: "drug",
			203: "drug",
		},
	},
	uae: {
		long_name: "UAE",
		time: 271,
		cost: 32000,
		item_types: {
			385: "flower",
			384: "plushie",
		},
	},
	uni: {
		long_name: "United Kingdom",
		time: 159,
		cost: 18000,
		item_types: {
			267: "flower",
			268: "plushie",
			266: "plushie",
			197: "drug",
			196: "drug",
			198: "drug",
			205: "drug",
			201: "drug",
			206: "drug",
			203: "drug",
		},
	},
};

requireDatabase().then(function () {
	mapLoaded().then(async () => {
		console.log("TT - Travel (home)");

		if (settings.pages.travel.cooldown_warnings) showCooldowns();

		if (travel_market.length === 0 || !("date" in travel_market) || new Date() - new Date(travel_market.date) >= 2 * 60 * 1000) {
			// 2 minutes
			travel_market = await updateTravelMarket();
		}

		modifyTimeAndCost();

		let container = content.newContainer("Travel Destinations", { id: "ttTravelTable" }).find(".content");

		addLegend();
		setTravelItems();

		let travel_items = doc.find("#ttTravelTable #tt-items").value;

		let table = doc.new({ type: "div", class: "table" });
		container.appendChild(table);

		addTableContent(travel_items);

		// Set initial table mode
		if (filters.travel.table_type === "basic") {
			doc.find("#ttTravelTable .table-type-button span[type='basic']").click();
		} else if (filters.travel.table_type === "advanced") {
			doc.find("#ttTravelTable .table-type-button span[type='advanced']").click();
		}

		// Sort by country
		sort(doc.find("#ttTravelTable .table"), 1, "text");

		filterTable(false);

		// Tab listeners
		for (let tab of [...doc.findAll("#tab-menu4>.tabs>li:not(.clear)")]) {
			// tab.classList.remove("ui-state-disabled");  // Testing purposes
			tab.addEventListener("click", function () {
				setTravelItems();
				reloadTable();
			});
		}

		// Destination listeners
		if (!mobile) {
			for (let destination of doc.findAll(`div[role='tabpanel'][aria-expanded='true']>div[role='button']`)) {
				destination.addEventListener("click", function () {
					console.log(destination);
					let country = destination.getAttribute("data-race") ? destination.getAttribute("data-race").replace(/-/g, " ") : "all";
					if (country === "cayman") country = "cayman islands";
					if (country === "uk") country = "united kingdom";

					doc.find(`#ttTravelTable .legend input[type='radio'][name='country'][_type='${country}']`).click();
				});
			}
		} else {
			for (let destination of doc.findAll(`.tab-menu-cont .travel-info-table li.travel-info-table-list`)) {
				let country = destination.find(".city-flag").classList[1].replace(/-/g, " ");
				if (country === "cayman") country = "cayman islands";
				if (country === "uk") country = "united kingdom";

				destination.addEventListener("click", function () {
					doc.find(`#ttTravelTable .legend input[type='radio'][name='country'][_type='${country}']`).click();
				});
			}
		}

		// mobile
		if (mobile) {
			doc.find(".travel-agency").classList.add("tt-mobile");
		}

		// Updater
		setInterval(function () {
			reloadTable();
		}, 2 * 60 * 1000);

		doc.find("div.travel-agency:not([id])").addEventListener("click", () => {
			if (event.target.classList.contains("raceway") && event.target.hasAttribute("data-race") && event.target.getAttribute("role") === "button")
				addLandAndReturnTimes();
		});

		warnOnTimeout();
	});
});

function modifyTimeAndCost() {
	let business_class_ticket_price = itemlist.items["396"].market_value;

	let airstrip = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "AIRSTRIP";
	let wlt = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "PRIVATE";
	let business = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "BUSINESS";

	for (let key in country_dict) {
		if (airstrip) {
			country_dict[key].time = parseFloat((country_dict[key].time * 0.7).toFixed(1)).toFixed(0);
			country_dict[key].cost = 0;
		} else if (wlt) {
			country_dict[key].time = parseFloat((country_dict[key].time * 0.5).toFixed(1)).toFixed(0);
			country_dict[key].cost = 0;
		} else if (business) {
			country_dict[key].time = parseFloat((country_dict[key].time * 0.3).toFixed(1)).toFixed(0);
			country_dict[key].cost = business_class_ticket_price;
		}
	}
}

function addLegend() {
	let legend = `
<div class="legend">
    <div class="top-row">
        <div class="filter-button"><i class="fas ${filters.travel.open ? "fa-chevron-up" : "fa-chevron-down"}"></i><div>&nbsp;Filters</div></div>
        <div class="table-type-button">
            <span class="table-type" type="advanced">Advanced</span>
            <span>&nbsp;/&nbsp;</span>
            <span class="table-type" type="basic">Basic</span>
        </div>
    </div>
    <div class="legend-content ${filters.travel.open ? "" : "collapsed"}">
        <div class="row">
        	<div>Travel items:&nbsp;<input type="number" id="tt-items" min="5" max="99"></div>
        </div>
        <div class="heading">Items</div>
        <div class="row">
            <!--
            <div class="radio-item"><input type="radio" name="item" _type="all">All</div>
            <div class="radio-item"><input type="radio" name="item" _type="plushie">Plushies</div>
            <div class="radio-item"><input type="radio" name="item" _type="flower">Flowers</div>
            <div class="radio-item"><input type="radio" name="item" _type="plushie,flower">Plushies/Flowers</div>
            <div class="radio-item"><input type="radio" name="item" _type="drug">Drugs</div>
            <div class="radio-item"><input type="radio" name="item" _type="other">Other</div>
            -->
            <div class="checkbox-item"><input type="checkbox" name="item" _type="plushie">Plushies</div>
            <div class="checkbox-item"><input type="checkbox" name="item" _type="flower">Flowers</div>
            <div class="checkbox-item"><input type="checkbox" name="item" _type="drug">Drugs</div>
            <div class="checkbox-item"><input type="checkbox" name="item" _type="other">Other</div>
        </div>
        <div class="heading">Countries</div>
        <div class="row">
            <div class="radio-item"><input type="radio" name="country" _type="all">All</div>
            <div class="radio-item"><input type="radio" name="country" _type="mexico">Mexico</div>
            <div class="radio-item"><input type="radio" name="country" _type="cayman islands">Cayman Islands</div>
            <div class="radio-item"><input type="radio" name="country" _type="canada">Canada</div>
            <div class="radio-item"><input type="radio" name="country" _type="hawaii">Hawaii</div>
            <div class="radio-item"><input type="radio" name="country" _type="united kingdom">United Kingdom</div>
            <div class="radio-item"><input type="radio" name="country" _type="argentina">Argentina</div>
            <div class="radio-item"><input type="radio" name="country" _type="switzerland">Switzerland</div>
            <div class="radio-item"><input type="radio" name="country" _type="japan">Japan</div>
            <div class="radio-item"><input type="radio" name="country" _type="china">China</div>
            <div class="radio-item"><input type="radio" name="country" _type="uae">UAE</div>
            <div class="radio-item"><input type="radio" name="country" _type="south africa">South Africa</div>
        </div>
    </div>
</div>
    `;

	doc.find("#ttTravelTable .content").innerHTML += legend;

	// Set right filters
	if (!Array.isArray(filters.travel.item_type)) filters.travel.item_type = ["plushie", "flower", "drug", "other"];

	console.log(filters.travel.item_type);

	for (let type of filters.travel.item_type) {
		doc.find(`#ttTravelTable .legend-content input[name='item'][_type='${type}']`).checked = true;
	}

	if (settings.pages.travel.destination_table_last_country)
		doc.find(`#ttTravelTable .legend-content input[name='country'][_type='${filters.travel.country}']`).checked = true;
	else doc.find(`#ttTravelTable .legend-content input[name='country'][_type='all']`).checked = true;

	// Open/Close filter
	for (let el of doc.findAll("#ttTravelTable .content .filter-button *")) {
		el.onclick = function () {
			doc.find("#ttTravelTable .content .legend-content").classList.toggle("collapsed");
			rotateElement(doc.find("#ttTravelTable .content .filter-button i"), 180);

			saveSettings();
		};
	}

	// Switch between modes
	let basic_mode_button = doc.find("#ttTravelTable .table-type-button span[type='basic']");
	let advanced_mode_button = doc.find("#ttTravelTable .table-type-button span[type='advanced']");

	basic_mode_button.onclick = function () {
		if (!basic_mode_button.classList.contains("active")) {
			basic_mode_button.classList.add("active");
		}
		advanced_mode_button.classList.remove("active");

		// Hide advanced elements
		for (let el of doc.findAll("#ttTravelTable .table .advanced")) {
			if (!el.classList.contains("hidden")) {
				el.classList.add("hidden");
			}
		}

		saveSettings();
	};
	advanced_mode_button.onclick = function () {
		if (!advanced_mode_button.classList.contains("active")) {
			advanced_mode_button.classList.add("active");
		}
		basic_mode_button.classList.remove("active");

		// Show advanced elements
		for (let el of doc.findAll("#ttTravelTable .table .advanced")) {
			el.classList.remove("hidden");
		}

		saveSettings();
	};

	// Filtering
	for (let el of doc.findAll("#ttTravelTable .legend-content .row .radio-item input, #ttTravelTable .legend-content .row .checkbox-item input")) {
		el.onclick = function () {
			filterTable(true);
			saveSettings();
		};
	}

	// Change travel items count
	doc.find("#ttTravelTable .legend-content #tt-items").onchange = function () {
		reloadTable();
	};
}

function setTravelItems() {
	// Travel items calculation
	let airstrip = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "AIRSTRIP";
	let wlt = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "PRIVATE";
	let business = doc.find("#tab-menu4 li[aria-selected=true]").innerText === "BUSINESS";

	let suitcase = 0,
		job_perk = 0,
		faction_perk = 0,
		book_perk = 0;

	if (userdata) {
		suitcase = (function () {
			for (let perk of userdata.enhancer_perks) {
				if (perk.indexOf("(Large Suitcase)") > -1) {
					return 4;
				} else if (perk.indexOf("(Medium Suitcase)") > -1) {
					return 3;
				} else if (perk.indexOf("(Small Suitcase)") > -1) {
					return 2;
				}
			}
			return 0;
		})();

		job_perk = (function () {
			let total = 0;
			for (let perk of userdata.company_perks) {
				if (perk.indexOf("travel capacity") > -1) {
					total += parseInt(perk.replace("+ ", "").split(" ")[0]);
				}
			}
			return total;
		})();

		faction_perk = (function () {
			for (let perk of userdata.faction_perks) {
				if (perk.indexOf("Increases maximum traveling capacity by") > -1) {
					return parseInt(perk.split("by ")[1]);
				}
			}
			return 0;
		})();

		book_perk = (function () {
			for (let perk of userdata.book_perks) {
				if (perk.indexOf("travel capacity") > -1) {
					return parseInt(perk.replace("+ ", "").split(" ")[0]);
				}
			}
			return 0;
		})();
	}

	// item_dict = modifyTimeAndCost(item_dict, airstrip, wlt, business, itemlist["396"].market_value);  // business class ticket price

	// if(!carry_items){
	//     carry_items = 5 + suitcase + job_perk + faction_perk + book_perk;
	//     if (airstrip || wlt || business) {
	//         carry_items += 10;
	//     }
	// }

	let travel_items = 5 + suitcase + job_perk + faction_perk + book_perk;
	if (airstrip || wlt || business) {
		travel_items += 10;
	}

	console.log("-----------------------------");
	console.log("airstrip", airstrip);
	console.log("wlt", wlt);
	console.log("business", business);
	console.log("suitcase", suitcase);
	console.log("job_perk", job_perk);
	console.log("faction_perk", faction_perk);
	console.log("book_perk", book_perk);
	console.log("carry_items", travel_items);

	doc.find("#ttTravelTable #tt-items").value = travel_items;
	ttStorage.set({ travel_items: travel_items });
}

function addTableContent(travel_items) {
	addTableHeader();

	let body = doc.new({ type: "div", class: "body" });
	doc.find("#ttTravelTable .table").appendChild(body);

	let body_html = ``;

	// Add rows
	for (let country_yata of Object.keys(travel_market.stocks)) {
		let country_stocks = travel_market.stocks[country_yata];
		for (let item of travel_market.stocks[country_yata].stocks) {
			let country_code_dict_data = country_dict_short[country_yata.toLowerCase()];
			let time = country_code_dict_data.time * 2;
			let cost = country_code_dict_data.cost;

			body_html += addRow(item, time, cost, travel_items, travel_market.stocks[country_yata], country_code_dict_data);
		}
	}
	body.innerHTML = body_html;
}

function addTableHeader() {
	let row = `
<div class="row header-row">
    <div>Destination</div>
    <div>Item</div>
    <div>Stock</div>
    <div class="advanced" sort-type="value">Buy Price</div>
    <div class="advanced" sort-type="value">Market Value</div>
    <div class="advanced" sort-type="value">Profit/Item</div>
    <div sort-type="value">Profit/Minute</div>
    <div class="advanced" sort-type="value">Total Profit</div>
    <div class="advanced" sort-type="value">Cash Needed</div>
</div>
    `;
	doc.find("#ttTravelTable .table").innerHTML += row;

	doc.addEventListener("click", function (event) {
		if (hasParent(event.target, { class: "header-row" })) {
			let parent = event.target;

			if (event.target.nodeName === "I") parent = event.target.parentElement;

			sort(
				doc.find("#ttTravelTable .table"),
				[...parent.parentElement.children].indexOf(parent) + 1,
				parent.getAttribute("sort-type") === "value" ? "value" : "text"
			);
		}
	});
}

function addRow(item, time, cost, travel_items, country_yata, country_code_dict_data) {
	let market_value = itemlist.items[item.id].market_value;
	let total_profit = (market_value - item.cost) * travel_items - cost;
	let profit_per_minute = (total_profit / time).toFixed(0);
	let profit_per_item = (total_profit / travel_items).toFixed(0);
	let update_time = timeAgo(country_yata.update * 1000);
	let item_types = ["plushie", "flower", "drug"];
	let background_style = `url(/images/v2/travel_agency/flags/fl_${country_code_dict_data.long_name
		.toLowerCase()
		.replace("united kingdom", "uk")
		.replace(" islands", "")
		.replace(" ", "_")}.svg) center top no-repeat`;
	let item_type = item_types.includes(country_code_dict_data.item_types[item.id]) ? country_code_dict_data.item_types[item.id].toLowerCase() : "other";

	let row = `
        <div class="row">
            <div country='${country_code_dict_data.long_name.toLowerCase()}'>
                <div class="flag" style="background: ${background_style}"></div>
                ${country_code_dict_data.long_name}
            </div>
            <div item='${item_type}'>
                <div class="item-image" style='background-image: url(https://www.torn.com/images/items/${item.id}/small.png)'></div>
                <a target="_blank" href="https://www.torn.com/imarket.php#/p=shop&type=${item.id}">
                    ${item.name}
                </a>
            </div>
            <div>
                ${item.quantity.toString()}
                <br class="advanced"> 
                <span class="update-time">(${update_time})</span>
            </div>
            <div class="advanced" value="${item.cost}">$${numberWithCommas(item.cost, item.cost >= 1e6)}</div>
            <div class="advanced" value="${market_value}">$${numberWithCommas(market_value, market_value >= 1e6)}</div>
    `;
	let profit_per_item_div;
	if (profit_per_item > 0) {
		profit_per_item_div = `<div class="positive profit advanced" value="${profit_per_item}">+$${numberWithCommas(
			profit_per_item,
			profit_per_item >= 1e6
		)}</div>`;
	} else if (profit_per_item < 0) {
		profit_per_item_div = `<div class="negative profit advanced" value="${profit_per_item}">-$${numberWithCommas(
			Math.abs(profit_per_item),
			profit_per_item <= -1e6
		)}</div>`;
	} else {
		profit_per_item_div = `<div class="advanced" value="0">$0</div>`;
	}
	row += profit_per_item_div;

	let profit_per_minute_div;
	if (profit_per_minute > 0) {
		profit_per_minute_div = `<div class="positive profit" value="${profit_per_minute}">+$${numberWithCommas(
			profit_per_minute,
			profit_per_minute >= 1e6
		)}</div>`;
	} else if (profit_per_minute < 0) {
		profit_per_minute_div = `<div class="negative profit" value="${profit_per_minute}">-$${numberWithCommas(
			Math.abs(profit_per_minute),
			profit_per_minute <= -1e6
		)}</div>`;
	} else {
		profit_per_minute_div = `<div value="0">$0</div>`;
	}
	row += profit_per_minute_div;

	let total_profit_div;
	if (total_profit > 0) {
		total_profit_div = `<div class="positive profit advanced" value="${total_profit}">+$${numberWithCommas(total_profit, total_profit >= 1e6)}</div>`;
	} else if (total_profit < 0) {
		total_profit_div = `<div class="negative profit advanced" value="${total_profit}">-$${numberWithCommas(
			Math.abs(total_profit),
			total_profit <= -1e6
		)}</div>`;
	} else {
		total_profit_div = `<div class="advanced" value="0">$0</div>`;
	}
	row += total_profit_div;

	row += `<div class="advanced" value="${item.cost * travel_items}">$${numberWithCommas(item.cost * travel_items, item.cost >= 1e6)}</div>`;

	row += "</div>";
	return row;
}

function filterTable(manual) {
	const country = doc.find("#ttTravelTable .legend-content .radio-item input[name='country']:checked").getAttribute("_type");
	const item_types = [...doc.findAll("#ttTravelTable .legend-content .checkbox-item input[name='item']:checked")].map((x) => x.getAttribute("_type"));

	let cols = {
		country: 1,
		item: 2,
	};

	if (manual && country !== "all") {
		let name = country.replace(/ /g, "-");
		if (country === "cayman islands") name = "cayman";
		if (country === "united kingdom") name = "uk";
		doc.find(`div[role='tabpanel'][aria-expanded='true'] .path.to-${name}`).previousElementSibling.click();
	}

	for (let row of doc.findAll("#ttTravelTable .table .body .row")) {
		row.classList.remove("hidden");

		// Country
		if (country !== "all" && [...row.children][cols["country"] - 1].getAttribute("country") !== country) {
			row.classList.add("hidden");
			continue;
		}

		// Item type
		let is_in_list = false;
		for (let type of item_types) {
			if (item_types.includes([...row.children][cols["item"] - 1].getAttribute("item"))) {
				is_in_list = true;
				break;
			}
		}

		if (!is_in_list) {
			row.classList.add("hidden");
		}
	}
}

function mapLoaded() {
	return requireElement(".travel-map");
}

function saveSettings() {
	let travel = {
		table_type: doc.find(".table-type.active") ? doc.find(".table-type.active").getAttribute("type") : "basic",
		open: !doc.find(".legend-content").classList.contains("collapsed"),
		item_type: [...doc.findAll(".legend-content input[name='item']:checked")].map((x) => x.getAttribute("_type")),
		country: doc.find(".legend-content input[name='country']:checked").getAttribute("_type"),
	};

	ttStorage.change({ filters: { travel: travel } });
}

function reloadTable() {
	console.log("Reloading table");
	ttStorage.get(["filters", "travel_market"], async ([filters, travel_market]) => {
		if (travel_market.length === 0 || !travel_market.date || new Date() - new Date(travel_market.date) >= 2 * 60 * 1000) {
			// 2 minutes
			travel_market = await updateTravelMarket();
		}

		let travel_items = doc.find("#tt-items").value;

		doc.find("#ttTravelTable .table .body").innerHTML = "";
		let body_html = ``;

		// Add rows
		for (let country of Object.keys(travel_market.stocks)) {
			let country_stocks = travel_market.stocks[country];
			for (let item of travel_market.stocks[country].stocks) {
				let country_code = country_dict_short[country.toLowerCase()];
				let time = country_dict_short[country.toLowerCase()].time;
				let cost = country_dict_short[country.toLowerCase()].cost;

				body_html += addRow(item, time, cost, travel_items, travel_market.stocks[country], country_code);
			}
		}
		doc.find("#ttTravelTable .table .body").innerHTML = body_html;

		// Set Table mode
		if (filters.travel.table_type === "basic") {
			doc.find("#ttTravelTable .table-type-button span[type='basic']").click();
		} else if (filters.travel.table_type === "advanced") {
			doc.find("#ttTravelTable .table-type-button span[type='advanced']").click();
		}

		// Sort by country
		doc.find("#ttTravelTable .header-row i").remove();
		sort(doc.find("#ttTravelTable .table"), 1, "text");

		filterTable(false);
	});
}

function updateTravelMarket() {
	console.log("Updating Travel Market info.");
	return new Promise((resolve) => {
		fetchRelay("yata__v1", { section: "travel/export" })
			.then((result) => {
				console.log("Travel market result", result);
				result.date = new Date().toString();
				ttStorage.set({ travel_market: result }, () => {
					console.log("	Travel market info set.");
					return resolve(result);
				});
			})
			.catch((err) => {
				console.log("ERROR", err);
				return resolve(err);
			});
	});
}

function showCooldowns() {
	requireElement("*[aria-hidden='false'] .travel-container.full-map").then(() => {
		display();

		for (let map of doc.findAll(".travel-container.full-map:not(.empty-tag)")) {
			new MutationObserver(() => {
				display();
			}).observe(map, { childList: true });
		}
	});

	function display() {
		if (!doc.find("*[aria-hidden='false'] .travel-container.full-map .flight-time")) return;

		const timer = doc.find("*[aria-hidden='false'] .travel-container.full-map .flight-time").innerText.split(" - ")[1].split(":");
		const duration = (parseInt(timer[0]) * 60 + parseInt(timer[1])) * 60 * 2;

		if (!doc.find("*[aria-hidden='false'] .tt-cooldowns")) {
			let travelContainer = doc.find("*[aria-hidden='false'] .travel-container.full-map");

			const cooldowns = doc.new({ type: "div", class: "tt-cooldowns" });

			cooldowns.innerHTML = `
				<div class="patter-left"></div>
				<div class="travel-wrap">
					<div class="cooldown energy ${getDurationClass(userdata.energy.fulltime)}">Energy</div>
					<div class="cooldown nerve ${getDurationClass(userdata.nerve.fulltime)}">Nerve</div>
					<div class="cooldown drug ${getDurationClass(userdata.cooldowns.drug)}">Drug</div>
					<div class="cooldown booster ${getDurationClass(userdata.cooldowns.booster)}">Booster</div>
					<div class="cooldown medical ${getDurationClass(userdata.cooldowns.medical)}">Medical</div>
				</div>
				<div class="patter-right"></div>
				<div class="clear"></div>
			`;

			travelContainer.parentElement.insertBefore(cooldowns, travelContainer);
		} else {
			handleClass(doc.find("*[aria-hidden='false'] .tt-cooldowns .cooldown.energy"), userdata.energy.fulltime);
			handleClass(doc.find("*[aria-hidden='false'] .tt-cooldowns .cooldown.nerve"), userdata.nerve.fulltime);
			handleClass(doc.find("*[aria-hidden='false'] .tt-cooldowns .cooldown.drug"), userdata.cooldowns.drug);
			handleClass(doc.find("*[aria-hidden='false'] .tt-cooldowns .cooldown.booster"), userdata.cooldowns.booster);
			handleClass(doc.find("*[aria-hidden='false'] .tt-cooldowns .cooldown.medical"), userdata.cooldowns.medical);
		}

		function getDurationClass(time) {
			return time < duration ? "waste" : "";
		}

		function handleClass(element, time) {
			const isWasted = time < duration;

			if (isWasted && !element.classList.contains("waste")) element.classList.add("waste");
			else if (!isWasted && element.classList.contains("waste")) element.classList.remove("waste");
		}
	}
}

function addLandAndReturnTimes() {
	let ttTimes = doc.find("span.tt-times");
	let travelTime = doc
		.find("div[role='tabpanel'][aria-hidden='false'] div.travel-container.full-map div.flight-time")
		.innerText.split("-")[1]
		.trim()
		.split(":")
		.map((x) => parseInt(x));
	let landDate = formatDateObject(new Date(new Date().setSeconds(travelTime[0] * 60 * 60 + travelTime[1] * 60)));
	let returnDate = formatDateObject(new Date(new Date().setSeconds(2 * travelTime[0] * 60 * 60 + 2 * travelTime[1] * 60)));
	if (ttTimes) {
		ttTimes.innerHTML = `Land at: ${landDate.formattedTime} ${landDate.formattedDate} | Return at: ${returnDate.formattedTime} ${returnDate.formattedDate}`;
	} else {
		doc.find("div.travel-agency:not([id])").insertAdjacentHTML(
			"afterEnd",
			`<span class="tt-times">Land at: ${landDate.formattedTime} ${landDate.formattedDate} | Return at: ${returnDate.formattedDate} ${returnDate.formattedTime}</span>`
		);
	}
}

function warnOnTimeout() {
	doc.addEventListener("click", (event) => {
		if (
			event.target.className.trim() === "torn-btn btn-dark-bg" &&
			doc.findAll("div.travel-confirm[style='display: block;']").length &&
			!doc.findAll("div.travel-agency div[id*='tab4'][aria-hidden='false'] div#tt-timeout-warning").length
		) {
			let travelTimeArray = doc.findAll("div.travel-confirm[style='display: block;'] span.bold.white")[1].innerText.split(" ");
			let travelTime;
			if (travelTimeArray.length === 2) {
				travelTime = travelTimeArray[0] * 60;
			} else if (travelTimeArray.length === 5) {
				travelTime = travelTimeArray[0] * 60 * 60 + travelTimeArray[3] * 60;
			}
			let timeoutFor;
			if (2 * travelTime >= userdata.education_timeleft && 2 * travelTime >= userdata.city_bank.time_left) {
				timeoutFor = "education course and bank investment";
			} else if (2 * travelTime >= userdata.education_timeleft) {
				timeoutFor = "education course";
			} else if (2 * travelTime >= userdata.city_bank.time_left) {
				timeoutFor = "bank investment";
			} else {
				return;
			}
			let rawHTML = `<div id="tt-timeout-warning">
			<div class="patter-left"></div>
			<div class="travel-wrap">
				<span>Warning: Your ${timeoutFor} end(s) before you return to TORN !</span>
			</div>
			<div class="patter-right"></div>
			<div class="clear"></div>
		</div>`;
			doc.find("div.travel-agency div.travel-container.full-map[style='display: block;']").insertAdjacentHTML("beforeBegin", rawHTML);
		}
	});
}
