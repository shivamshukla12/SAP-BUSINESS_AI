"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigHtml = exports.htmlEnum = exports.htmlNumberInput = exports.htmlCheckbox = void 0;
const ConfigPanelStyles_1 = require("./ConfigPanelStyles");
const md2html = (text) => text
    .replace(/_(.*?)_/g, '<em>$1</em>')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
const defaultText = (schemaOption) => typeof schemaOption.default === 'boolean'
    ? schemaOption.default ? '<span style="color: green">enabled</span>' : '<span style="color: red">disabled</span>'
    : schemaOption.default;
const htmlTooltip = (htmlElement, schemaOption, indentLevel) => `
			<div style="margin-left:${2 * indentLevel}em">
				<div class="tooltip">${htmlElement}
					<div class="right">
						<div class="text-content">
							${md2html(schemaOption.description)}
						</div>
						<hr>
						<div class="default-text-content">
							Default: <em>${defaultText(schemaOption)}</em>
						</div>
						<i></i>
					</div>
				</div>
			</div>
`;
const htmlCheckbox = (option, value, schemaOption, level) => htmlTooltip(`
					<label class="checkboxcontainer" for="${option}">${md2html(schemaOption.label)}
            			<input type="checkbox" id="${option}" ${value ? 'checked' : ''}>
						<span class="checkmark" />
					</label>
`, schemaOption, level);
exports.htmlCheckbox = htmlCheckbox;
const htmlNumberInput = (option, value, schemaOption, level) => htmlTooltip(`
		<label>${md2html(schemaOption.label)}: <input id="${option}" type="number" min="0" step="1" value="${value}"></label>
`, schemaOption, level);
exports.htmlNumberInput = htmlNumberInput;
const htmlEnum = (option, value, schemaOption, level) => htmlTooltip(`
		<label title="${md2html(schemaOption.description)}" class="select" for="${option}">${md2html(schemaOption.label)}:
			<select id="${option}">
				${schemaOption.enum.map((allowedValue) => `<option ${allowedValue === value ? ' selected ' : ''} value="${allowedValue}">${allowedValue}</option>`)
    .join('\n')}
			</select>
		</label>
`, schemaOption, level);
exports.htmlEnum = htmlEnum;
class ConfigHtml {
    constructor(prettyPrint) {
        this.prettyPrint = prettyPrint;
    }
    getHtml(selectedCategory) {
        const effectiveOptions = this.prettyPrint.getEffectiveFormattingOptions();
        const schema = this.prettyPrint.getSchema();
        const htmlItemsByCategory = {};
        const htmlItemsFor = (category) => htmlItemsByCategory[category] || (htmlItemsByCategory[category] = []);
        const handlerRegistrations = [];
        const dispatcher = {
            boolean: [exports.htmlCheckbox, "notifyFrameOn('click',  (e) => e.target.checked)"],
            number: [exports.htmlNumberInput, "notifyFrameOn('change', (e) => parseInt(e.target.value))"],
            string: [exports.htmlEnum, "notifyFrameOn('change', (e) => e.target.value)"]
        };
        const htmlCreated = {};
        function createHtml(optionName, level) {
            if (htmlCreated[optionName]) {
                return;
            }
            htmlCreated[optionName] = true;
            const value = effectiveOptions[optionName];
            const schemaOption = schema[optionName];
            const htmlItems = htmlItemsFor(schemaOption.category);
            const [createHtmlItem, registerHandler] = dispatcher[schemaOption.type];
            htmlItems.push(createHtmlItem(optionName, value, schemaOption, level));
            handlerRegistrations.push(registerHandler + `('${optionName}')`);
            (schemaOption.subOptions || []).forEach((subOption) => createHtml(subOption, level + 1));
        }
        Object.keys(schema).forEach(name => htmlCreated[name] = false);
        Object.keys(schema).forEach(name => htmlCreated[name] || schema[name].parentOption ? undefined : createHtml(name, 0));
        const htmlTabs = Object.keys(htmlItemsByCategory)
            .map(category => `<span class="menu-item ${category === selectedCategory ? 'active' : ''}" content="${category}">${category}</span>`)
            .join('\n');
        const htmlTabContents = Object.entries(htmlItemsByCategory)
            .map(([category, items]) => `<div id="${category}" class="option-content ${category === selectedCategory ? 'visible' : ''}"><h2>${category}</h2>${items.join('\n')}<p style="height: 1px"></p></div>`)
            .join('\n');
        return `<!DOCTYPE html>
			<!--suppress CssUnresolvedCustomProperty -->
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>CDS Formatting Options Configuration</title>${ConfigPanelStyles_1.styles}
            </head>
			<body>
				<div class="container">
					<div class="menu">
						${htmlTabs}
					</div>
					<div class="options">${htmlTabContents}</div>
				</div>
				<script>
					const vscode = acquireVsCodeApi();

					let menuItems = document.getElementsByClassName("menu-item");
					for (let i = 0; i < menuItems.length; i++) {
						menuItems[i].addEventListener("click", (e) => {
							// Remove class from all items
							for (let k = 0; k < menuItems.length; k++) {
								if (menuItems[k].classList.contains("active"))
									menuItems[k].classList.remove("active");
							}
							// Add class to selected item
							e.target.closest(".menu-item").classList.add("active");
							let selectedContent = e.target
								.closest(".menu-item")
								.getAttribute("content");

							// Hide all content views
							let contentViews = document.getElementsByClassName("option-content");
							for (let k = 0; k < contentViews.length; k++) {
								if (contentViews[k].classList.contains("visible"))
									contentViews[k].classList.remove("visible");
							}
							document.getElementById(selectedContent).classList.add("visible");
							vscode.postMessage({command: "onCategoryChanged", category: selectedContent})
						});
					}

					function notifyFrameOn(event, valueOf) {
						return (option) => {
							document.getElementById(option).addEventListener(event, (item) => {
								vscode.postMessage({
									command: "onUserChangedOption",
									optionAndValue: [option, valueOf(item)]
								});
							});
						}
					}

					${handlerRegistrations.join('\n')}
				</script>
            </body>
            </html>`;
    }
}
exports.ConfigHtml = ConfigHtml;
//# sourceMappingURL=ConfigHtml.js.map