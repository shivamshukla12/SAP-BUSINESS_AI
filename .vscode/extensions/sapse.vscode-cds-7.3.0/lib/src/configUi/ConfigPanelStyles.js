"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.styles = void 0;
exports.styles = `
				<!--suppress CssUnresolvedCustomProperty -->
<style>
					html, body {
						height: 100%;
						width: 100%;
					}
					body {
						margin: 0;
						padding: 0;
					}
					.container {
						display: flex;
						flex-direction: row;
						height: 100%;
						overflow: hidden;
					}
					.container .menu {
						height: calc(100% - 32px);
						display: flex;
						flex-direction: column;
						padding: 16px 48px 16px 16px;
						min-width: 100px;
					}
					.container .menu span {
						font-size: 12px;
						padding: 4px 0;
						color: var(--textPreformat-foreground);
						user-select: none;
						cursor: pointer;
					}
					.container .menu span.active {
						font-weight: 700;
					}
					.container .options {
						height: 100%;
						flex: 2;
						/*width: 300px;*/
					}
					.container .options .option-content {
						display: none;
						padding: 16px;
						max-height: calc(100% - 32px);
						overflow: auto;
					}
					.container .options .option-content.visible {
						display: block;
					}
					.container .options .option-content h2 {
						margin: 0 0 16px 0;
						font-size: 15px;
						color: var(--vscode-editor-foreground);
					}
					.container .preview {
						flex: 2;
						height: 100%;
						background: lightgray;
					}
					.container .preview textarea {
						width: calc(100% - 32px);
						height: calc(100% - 32px);
						border: none;
						outline: none;
						padding: 16px;
						resize: none;
						background: var(--vscode-editorHoverWidget-statusBarBackground);
						color: var(--textPreformat-foreground);
					}

					input[type="checkbox"] {
						display: none;
					}

                    .checkboxcontainer {
                      display: block;
                      position: relative;
                      padding-left: 23px;
                      margin-bottom: 0;
                      cursor: pointer;
                      /*font-size: 22px;*/
                      -webkit-user-select: none;
                      -moz-user-select: none;
                      -ms-user-select: none;
                      user-select: none;
                    }
                    
                    /* Hide the browser's default checkbox */
                    .checkboxcontainer input {
                      position: absolute;
                      opacity: 0;
                      cursor: pointer;
                      height: 0;
                      width: 0;
                    }
                    
                    /* Create a custom checkbox */
                    .checkmark {
                      position: absolute;
                      top: 0;
                      left: 0;
                      height: 16px;
                      width: 16px;
                      background-color: var(--vscode-panel-border);
                    }
                    
                    /* On mouse-over, add a grey background color */
                    .checkboxcontainer:hover input ~ .checkmark {
                      background-color: #c0c0c080;
                    }
                    
                    /* When the checkbox is checked, add a blue background */
                    /*.checkboxcontainer input:checked ~ .checkmark {*/
                    /*  background-color: #2196F3;*/
                    /*}*/
                    
                    /* Create the checkmark/indicator (hidden when not checked) */
                    .checkmark:after {
                      content: "";
                      position: absolute;
                      display: none;
                    }
                    
                    /* Show the checkmark when checked */
                    .checkboxcontainer input:checked ~ .checkmark:after {
                      display: block;
                    }
                    
                    /* Style the checkmark/indicator */
                    .checkboxcontainer .checkmark:after {
                      left: 6px;
                      top: 3px;
                      width: 3px;
                      height: 8px;
                      border: solid var(--vscode-editor-foreground);
                      border-width: 0 2px 2px 0;
                      -webkit-transform: rotate(45deg);
                      -ms-transform: rotate(45deg);
                      transform: rotate(45deg);
                    }

					input[type="number"] {
						max-width: 80px;
						margin-left: 8px;
						padding: 4px;
						font-size: 13px;
					}
					label {
						display: block;
						margin: 8px 0;
						font: inherit;
					}
					label.select {
						display: flex;
						align-items: center;
					}
					select {
						padding: 4px;
						font-size: 13px;
						margin-left: 8px;
					}

                    .tooltip {
                        display:inline-block;
                        position:relative;
                        text-align:left;
                    }
                    
                    .tooltip h3 {margin:12px 0;}
                    
                    .tooltip .right {
                        min-width:200px;
                        max-width:400px;
                        top:50%;
                        left:100%;
                        margin-left:20px;
                        transform:translate(0, -50%);
                        padding:0;
                        color:black;
                        background-color:#FFFFE0;
                        font-weight:normal;
                        font-size:13px;
                        border-radius:6px;
                        position:absolute;
                        z-index:99999999;
                        box-sizing:border-box;
                        box-shadow:0 1px 8px rgba(128,128,128,0.5);
                        visibility:hidden;
                    }
                    
                    .tooltip:hover .right {
                        visibility:visible;
                    }
                    
                    .tooltip .text-content {
                        padding:8px 8px;
                    }
                    .tooltip .default-text-content {
                        padding:8px 8px;
                    }
                    
                    .tooltip .right i {
                        position:absolute;
                        top:50%;
                        right:100%;
                        margin-top:-12px;
                        width:12px;
                        height:24px;
                        overflow:hidden;
                    }
                    .tooltip .right i::after {
                        content:'';
                        position:absolute;
                        width:12px;
                        height:12px;
                        left:0;
                        top:50%;
                        transform:translate(50%,-50%) rotate(-45deg);
                        background-color:#FFFFE0;
                        box-shadow:0 1px 8px rgba(0,0,0,0.5);
                    }
                    
                    .right hr {
                        border-top: 2px #404040;
                        margin: 0 0;
                    }

                    label em {
                        color: cornflowerblue;
                    }
				</style>
`;
//# sourceMappingURL=ConfigPanelStyles.js.map