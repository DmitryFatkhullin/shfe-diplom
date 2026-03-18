import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs}"], 
    plugins: { js }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: {
        ...globals.browser,
        api: "readonly",
        bootstrap: "readonly",
        QRCode: "readonly",
        qrcode: "readonly",
        getRandomFilmColor: "readonly",
        renderFilmsPool: "readonly",
        buildTimeline: "readonly",
        initHallsModule: "readonly",
        initFilmsModule: "readonly",
        initSeancesModule: "readonly",
        loadAllData: "readonly",
        saveToSession: "readonly",
        loadFromSession: "readonly",
        formatDate: "readonly",
        getInitialDays: "readonly",
        createDayObject: "readonly",
        getNextDayFrom: "readonly",
        renderHallsList: "readonly",
        fillHallSelects: "readonly",
        attachHallEvents: "readonly",
        attachHallInputListeners: "readonly",
        updateHallConfigSize: "readonly",
        loadHallConfigForEdit: "readonly",
        renderHallEditor: "readonly",
        getCurrentHallConfig: "readonly",
        deleteFilm: "readonly",
        attachFilmEvents: "readonly", 
        isTimeSlotFree: "readonly",
        timeToMinutes: "readonly",
        isTimeSlotFreeWithPending: "readonly",
        attachSaveCancelListeners: "readonly",
        attachDeleteListener: "readonly",
        initSeanceModal: "readonly",
        openAddSeanceModal: "readonly",
        updateFilmSelect: "readonly"
      } 
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": ["warn", { 
        "vars": "all", 
        "args": "after-used", 
        "ignoreRestSiblings": false,
        "varsIgnorePattern": "^_",
        "argsIgnorePattern": "^_"
      }],
      "no-console": "off"
    }
  },
  {
    ignores: ["**/node_modules/**", "**/dist/**", "**/assets/**"]
  }
]);