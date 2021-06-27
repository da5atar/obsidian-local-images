import {
  App,
  Modal,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TFolder,
} from "obsidian";
import { sanitizeUrlToFileName } from "./sanitizeUrlToFileName";
import { replaceInText } from "./replaceInText";
import { shim } from "string.prototype.matchall";
import { run, runAll } from "./run";

shim();

interface MyPluginSettings {
  mySetting: string;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  mySetting: "default",
};

export default class LocalImagesPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    console.log("loading plugin");

    await this.loadSettings();

    this.addStatusBarItem().setText("Status Bar Text");

    this.addCommand({
      id: "download-images-all",
      name: "Download images locally for all your notes",
      callback: async () => {
        try {
          await runAll(this.app);
        } catch (error) {
          this.displayError(error);
        }
      },
    });

    this.addCommand({
      id: "download-images",
      name: "Download images locally",
      callback: async () => {
        const currentFile = this.app.workspace.getActiveFile();

        if (!currentFile) {
          return this.displayError("Please select a file first");
        }

        await run(this.app, currentFile);
      },
    });

    this.addSettingTab(new SampleSettingTab(this.app, this));
  }
  displayError(error: Error | string): void {
    new Notice(error.toString());
    console.error(`LocalImages: error: ${error}`);
  }

  onunload() {
    console.log("unloading plugin");
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class SampleModal extends Modal {
  constructor(app: App) {
    super(app);
  }

  onOpen() {
    let { contentEl } = this;
    contentEl.setText("Woah!");
  }

  onClose() {
    let { contentEl } = this;
    contentEl.empty();
  }
}

class SampleSettingTab extends PluginSettingTab {
  plugin: LocalImagesPlugin;

  constructor(app: App, plugin: LocalImagesPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    let { containerEl } = this;

    containerEl.empty();

    containerEl.createEl("h2", { text: "Local images" });

    new Setting(containerEl)
      .setName("Setting #1")
      .setDesc("It's a secret")
      .addText((text) =>
        text
          .setPlaceholder("Enter your secret")
          .setValue("")
          .onChange(async (value) => {
            console.log("Secret: " + value);
            this.plugin.settings.mySetting = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
