import Vue from "vue";
import vueSlider from 'vue-slider-component'
import { throttle } from 'lodash';
import { mapState, mapGetters } from "vuex";

import InitiativeDialog from "./ui/initiative.vue";
import MenuBar from "./ui/menu/menu.vue";
import NoteDialog from "./ui/note.vue";
import PromptDialog from "../core/components/modals/prompt.vue";
import SelectionInfo from "./ui/selection/selection_info.vue";
import Tools from "./ui/tools/tools.vue";

import store from "./store";
import { onKeyDown, onKeyUp } from './events/keyboard';
import { scrollZoom } from './events/mouse';
import { LocalPoint } from "./geom";
import { GameManager } from './manager';
import { l2g } from "./units";

const gameManager = new GameManager();

export const vm = new Vue({
    el: '#main',
    store,
    delimiters: ['[[', ']]'],
    components: {
        'tool-bar': Tools,
        'selection-info': SelectionInfo,
        'prompt-dialog': PromptDialog,
        'menu-bar': MenuBar,
        'initiative-dialog': InitiativeDialog,
        'zoom-slider': vueSlider,
        'note-dialog': NoteDialog,
    },
    data: {
        ready: {
            manager: false,
            tools: false
        },
    },
    computed: {
        ...mapState([
            'IS_DM',
            'layers'
        ]),
        ...mapGetters([
            'selectedLayer'
        ]),
        zoomFactor: {
            get(): number {
                return this.$store.state.zoomFactor;
            },
            set(value: number) {
                this.$store.commit("updateZoom", {newZoomValue: value, zoomLocation: l2g(new LocalPoint(window.innerWidth / 2, window.innerHeight / 2))})
            }
        }
    },
    mounted() {
        window.addEventListener("resize", () => {
            gameManager.layerManager.setWidth(window.innerWidth);
            gameManager.layerManager.setHeight(window.innerHeight);
            gameManager.layerManager.invalidate();
        }),
        window.addEventListener('wheel', throttle(scrollZoom));
        window.addEventListener("keyup", onKeyUp);
        window.addEventListener("keydown", onKeyDown);

        // prevent double clicking text selection
        window.addEventListener('selectstart', function (e) {
            e.preventDefault();
            return false;
        });

        this.ready.manager = true;
    },
    methods: {
        mousedown(event: MouseEvent) { (<any>this.$refs.tools).mousedown(event); },
        mouseup(event: MouseEvent) { (<any>this.$refs.tools).mouseup(event); },
        mousemove(event: MouseEvent) { (<any>this.$refs.tools).mousemove(event); },
        contextmenu(event: MouseEvent) { (<any>this.$refs.tools).contextmenu(event); },
        selectLayer(layer: string) {
            gameManager.layerManager.setLayer(layer);
        }
    }
});

(<any>window).vm = vm;
(<any>window).gameManager = gameManager;

export default gameManager;